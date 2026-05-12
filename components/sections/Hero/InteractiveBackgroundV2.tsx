'use client';

import { useEffect, useRef, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { useAccentColor } from '@/lib/AccentColorContext';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { hexToRgb } from '@/lib/colorUtils';
import { features } from '@/data';
import styles from './InteractiveBackgroundV2.module.css';

/**
 * V2 architecture (vs the original full-viewport canvas):
 *
 *   Layer 1: a CSS-masked <div> renders the entire plus-sign field at zero
 *            per-frame cost (GPU compositor). Accent + theme changes are free.
 *   Layer 2: a small follower <canvas> (≈ 2 × MOUSE_RADIUS) tracks the cursor
 *            and renders only the plus signs being displaced. Bg-fill masks
 *            the static layer in the cursor zone; a radial-gradient mask
 *            dissolves the canvas edge into the static layer.
 *
 * Net effect: ~5,000 strokes/frame → ~50–200 fillRect calls/frame, regardless
 * of viewport resolution.
 */

interface PlusSign {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const cfg = features.interactiveBackground;
const BASE_GRID_SPACING = cfg.grid.spacing;
const PLUS_SIZE = cfg.grid.plusSignSize;
const STROKE_WIDTH = cfg.grid.strokeWidth;
const MOUSE_RADIUS = cfg.physics.mouseRadius;
const MOUSE_RADIUS_SQ = MOUSE_RADIUS * MOUSE_RADIUS;
const REPULSION_STRENGTH = cfg.physics.repulsionStrength;
const RETURN_STRENGTH = cfg.physics.returnStrength;
const FRICTION = cfg.physics.friction;
const MAX_VELOCITY = cfg.physics.maxVelocity;

const DPR_CAP_DESKTOP = 2;
const DPR_CAP_MOBILE = 1.5;
const MOBILE_BREAKPOINT = 768;
const STATIC_OPACITY = 0.12;
const HOVER_OPACITY_BOOST = 0.4;
const IDLE_TIMEOUT_MS = 150;
// Canvas extends MOUSE_RADIUS plus this many spacing-cells on each side, giving
// active signs room to settle while the cursor pulls away.
const OVERLAY_PADDING_CELLS = 3;
// Sign returns to origin (and is removed from the active set) when its total
// offset + velocity drop below these thresholds.
const SETTLE_OFFSET = 0.3;
const SETTLE_VELOCITY = 0.05;

const computeGridSpacing = (vw: number) =>
  Math.max(BASE_GRID_SPACING, Math.min(40, Math.round(vw / 96)));

export function InteractiveBackgroundV2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { color: accentColor } = useAccentColor();
  const reducedMotion = useReducedMotion();

  // Spatial / sizing
  const cellsRef = useRef<Map<string, PlusSign>>(new Map());
  const spacingRef = useRef(BASE_GRID_SPACING);
  const overlaySizeRef = useRef(288);
  const dprRef = useRef(1);

  // Visual params
  const bgColorRef = useRef('#ffffff');
  const accentRgbRef = useRef('98, 182, 203');

  // Mouse state
  const mouseRef = useRef({ x: -10000, y: -10000 });
  const isHoveringRef = useRef(false);
  const isIdleRef = useRef(true);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active set: signs displaced from origin that still need physics.
  // Anything not in this set is exactly at origin and rendered by the
  // static layer; we never have to touch it.
  const activeSetRef = useRef<Set<PlusSign>>(new Set());

  // Ticker control
  const tickerActiveRef = useRef(false);
  const animateRef = useRef<(() => void) | null>(null);

  const stopTicker = useCallback(() => {
    if (tickerActiveRef.current && animateRef.current) {
      gsap.ticker.remove(animateRef.current);
      tickerActiveRef.current = false;
    }
  }, []);

  const startTicker = useCallback(() => {
    if (!tickerActiveRef.current && animateRef.current) {
      gsap.ticker.add(animateRef.current);
      tickerActiveRef.current = true;
    }
  }, []);

  const initialize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < MOBILE_BREAKPOINT;

    const spacing = computeGridSpacing(vw);
    spacingRef.current = spacing;

    const overlay = Math.ceil(MOUSE_RADIUS * 2 + spacing * OVERLAY_PADDING_CELLS * 2);
    overlaySizeRef.current = overlay;

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      isMobile ? DPR_CAP_MOBILE : DPR_CAP_DESKTOP,
    );
    dprRef.current = dpr;
    canvas.width = Math.round(overlay * dpr);
    canvas.height = Math.round(overlay * dpr);
    canvas.style.width = `${overlay}px`;
    canvas.style.height = `${overlay}px`;

    document.documentElement.style.setProperty('--plus-grid-spacing', `${spacing}px`);

    const bg = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background')
      .trim();
    bgColorRef.current = bg || '#ffffff';

    // Pad the cell map by one cell beyond viewport so cursor at the edge
    // still finds neighbors.
    const cells = new Map<string, PlusSign>();
    const cols = Math.ceil(vw / spacing) + 2;
    const rows = Math.ceil(vh / spacing) + 2;
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const x = col * spacing + spacing / 2;
        const y = row * spacing + spacing / 2;
        cells.set(`${col},${row}`, { originX: x, originY: y, x, y, vx: 0, vy: 0 });
      }
    }
    cellsRef.current = cells;
    activeSetRef.current.clear();
  }, []);

  // Animate function lives in a ref so the gsap.ticker subscription stays
  // stable across renders (accent color, etc).
  useEffect(() => {
    let warned = false;

    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        if (canvas && !ctx && !warned) {
          warned = true;
          console.warn('[InteractiveBackgroundV2] 2D context unavailable.');
        }
        return;
      }
      if (document.hidden) return;

      const mouse = mouseRef.current;
      const overlay = overlaySizeRef.current;
      const dpr = dprRef.current;
      const spacing = spacingRef.current;
      const half = overlay / 2;
      const canvasLeft = mouse.x - half;
      const canvasTop = mouse.y - half;
      const cells = cellsRef.current;
      const activeSet = activeSetRef.current;
      const accentRgb = accentRgbRef.current;
      const isHovering = isHoveringRef.current;

      // Quiescent: nothing displaced, cursor not over hero. Hide the canvas
      // entirely so the static layer owns the screen and unsubscribe from
      // the ticker until the next mousemove.
      if (!isHovering && activeSet.size === 0) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.opacity = '0';
        stopTicker();
        return;
      }

      // Position follower at the cursor.
      canvas.style.transform = `translate3d(${canvasLeft}px, ${canvasTop}px, 0)`;
      canvas.style.opacity = '1';

      // Gather signs to process: every sign currently inside the canvas
      // bounds (cell-window query) PLUS every sign in the active set
      // (which may have drifted out of the window but still needs physics).
      const toProcess = new Set<PlusSign>(activeSet);
      const minCol = Math.floor(canvasLeft / spacing);
      const maxCol = Math.ceil((canvasLeft + overlay) / spacing);
      const minRow = Math.floor(canvasTop / spacing);
      const maxRow = Math.ceil((canvasTop + overlay) / spacing);
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const sign = cells.get(`${col},${row}`);
          if (sign) toProcess.add(sign);
        }
      }

      // Reset transform + clear, then opaque-fill so the static layer's
      // at-origin plus signs in this region are hidden behind the follower.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, overlay, overlay);
      ctx.fillStyle = bgColorRef.current;
      ctx.fillRect(0, 0, overlay, overlay);

      const repulse = isHovering && !isIdleRef.current;
      const halfPlus = PLUS_SIZE / 2;
      const halfThick = STROKE_WIDTH / 2;

      toProcess.forEach((sign) => {
        // Repulsion from cursor — only while actively moving (else the field
        // settles even when the cursor sits inside the hero).
        if (repulse) {
          const dx = mouse.x - sign.x;
          const dy = mouse.y - sign.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_RADIUS_SQ && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const f = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * REPULSION_STRENGTH / dist;
            sign.vx -= dx * f;
            sign.vy -= dy * f;
          }
        }

        // Spring back to origin + friction.
        sign.vx += (sign.originX - sign.x) * RETURN_STRENGTH;
        sign.vy += (sign.originY - sign.y) * RETURN_STRENGTH;
        sign.vx *= FRICTION;
        sign.vy *= FRICTION;
        if (sign.vx > MAX_VELOCITY) sign.vx = MAX_VELOCITY;
        else if (sign.vx < -MAX_VELOCITY) sign.vx = -MAX_VELOCITY;
        if (sign.vy > MAX_VELOCITY) sign.vy = MAX_VELOCITY;
        else if (sign.vy < -MAX_VELOCITY) sign.vy = -MAX_VELOCITY;
        sign.x += sign.vx;
        sign.y += sign.vy;

        const offX = sign.x - sign.originX;
        const offY = sign.y - sign.originY;
        const totalOff = Math.abs(offX) + Math.abs(offY);
        const settled =
          totalOff < SETTLE_OFFSET &&
          Math.abs(sign.vx) < SETTLE_VELOCITY &&
          Math.abs(sign.vy) < SETTLE_VELOCITY;

        if (settled) {
          sign.x = sign.originX;
          sign.y = sign.originY;
          sign.vx = 0;
          sign.vy = 0;
          activeSet.delete(sign);
        } else if (totalOff > 0.01) {
          activeSet.add(sign);
        }

        // Draw at canvas-local coords. Even at-origin signs in this window
        // need to be drawn — the bg fill above hid the static layer here.
        const lx = sign.x - canvasLeft;
        const ly = sign.y - canvasTop;
        if (
          lx < -PLUS_SIZE ||
          lx > overlay + PLUS_SIZE ||
          ly < -PLUS_SIZE ||
          ly > overlay + PLUS_SIZE
        ) {
          return;
        }

        let opacity = STATIC_OPACITY;
        if (isHovering) {
          const dx = mouse.x - sign.x;
          const dy = mouse.y - sign.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_RADIUS_SQ) {
            const dist = Math.sqrt(distSq);
            opacity = STATIC_OPACITY + (1 - dist / MOUSE_RADIUS) * HOVER_OPACITY_BOOST;
          }
        }

        ctx.fillStyle = `rgba(${accentRgb}, ${opacity})`;
        ctx.fillRect(lx - halfThick, ly - halfPlus, STROKE_WIDTH, PLUS_SIZE);
        ctx.fillRect(lx - halfPlus, ly - halfThick, PLUS_SIZE, STROKE_WIDTH);
      });
    };

    animateRef.current = animate;
  }, [stopTicker]);

  // Convert accent hex → "r, g, b" string once per change.
  useEffect(() => {
    const { r, g, b } = hexToRgb(accentColor);
    accentRgbRef.current = `${r}, ${g}, ${b}`;
    // If something is currently displaced, wake the ticker so it repaints
    // in the new colour. Otherwise the static layer handles the swap.
    if (activeSetRef.current.size > 0) startTicker();
  }, [accentColor, startTicker]);

  // Mount: initialize, listen, and tear down.
  useEffect(() => {
    if (reducedMotion) return;

    initialize();

    // Theme toggle fires neither resize nor accent change, so re-read
    // --color-background whenever data-theme on <html> mutates and wake the
    // ticker so the follower repaints with the new clear colour.
    const html = document.documentElement;
    const refreshBgColor = () => {
      const bg = getComputedStyle(html).getPropertyValue('--color-background').trim();
      bgColorRef.current = bg || '#ffffff';
      if (activeSetRef.current.size > 0 || isHoveringRef.current) startTicker();
    };
    const themeObserver = new MutationObserver(refreshBgColor);
    themeObserver.observe(html, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const dx = x - mouseRef.current.x;
      const dy = y - mouseRef.current.y;
      const moved = Math.abs(dx) > 1 || Math.abs(dy) > 1;

      mouseRef.current = { x, y };
      isHoveringRef.current = true;

      if (moved) {
        isIdleRef.current = false;
        if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = setTimeout(() => {
          isIdleRef.current = true;
        }, IDLE_TIMEOUT_MS);
      }

      startTicker();
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
      // Don't stop the ticker here — let it run until the active set
      // empties out so signs animate back to origin smoothly.
    };

    const handleResize = () => {
      initialize();
      startTicker();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) handleMouseLeave();
    });
    window.addEventListener('blur', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      stopTicker();
      themeObserver.disconnect();
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('blur', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [initialize, startTicker, stopTicker, reducedMotion]);

  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.staticGrid} />
      {!reducedMotion && (
        <canvas ref={canvasRef} className={styles.interactiveCanvas} />
      )}
    </div>
  );
}
