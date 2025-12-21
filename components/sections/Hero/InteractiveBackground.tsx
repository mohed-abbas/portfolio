'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './InteractiveBackground.module.css';

interface PlusSign {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

interface MousePosition {
  x: number;
  y: number;
}

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plusSignsRef = useRef<PlusSign[]>([]);
  const mouseRef = useRef<MousePosition>({ x: -1000, y: -1000 });
  const rafRef = useRef<number | null>(null);
  const isHoveringRef = useRef(false);

  // Grid configuration matching the original bg.svg
  const GRID_SPACING = 24; // Space between plus signs
  const PLUS_SIZE = 10; // Size of each plus sign
  const STROKE_WIDTH = 1;

  // Physics constants
  const MOUSE_RADIUS = 120;
  const REPULSION_STRENGTH = 0.6;
  const RETURN_STRENGTH = 0.06;
  const FRICTION = 0.9;
  const MAX_VELOCITY = 8;

  const initializePlusSigns = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    plusSignsRef.current = [];

    // Create grid of plus signs
    const cols = Math.ceil(width / GRID_SPACING) + 1;
    const rows = Math.ceil(height / GRID_SPACING) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * GRID_SPACING + GRID_SPACING / 2;
        const y = row * GRID_SPACING + GRID_SPACING / 2;

        plusSignsRef.current.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
        });
      }
    }
  }, []);

  const drawPlusSign = useCallback((
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    opacity: number
  ) => {
    const halfSize = size / 2;

    ctx.strokeStyle = `rgba(160, 82, 255, ${opacity})`; // Purple color from design
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = 'round';

    // Draw horizontal line
    ctx.beginPath();
    ctx.moveTo(x - halfSize, y);
    ctx.lineTo(x + halfSize, y);
    ctx.stroke();

    // Draw vertical line
    ctx.beginPath();
    ctx.moveTo(x, y - halfSize);
    ctx.lineTo(x, y + halfSize);
    ctx.stroke();
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const mouse = mouseRef.current;
    const plusSigns = plusSignsRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    plusSigns.forEach((plus) => {
      // Calculate distance from mouse
      const dx = mouse.x - plus.x;
      const dy = mouse.y - plus.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Apply repulsion force when mouse is near
      if (distance < MOUSE_RADIUS && isHoveringRef.current) {
        const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
        const angle = Math.atan2(dy, dx);

        // Repel away from mouse
        plus.vx -= Math.cos(angle) * force * REPULSION_STRENGTH;
        plus.vy -= Math.sin(angle) * force * REPULSION_STRENGTH;
      }

      // Apply return force to original position (spring effect)
      const returnDx = plus.originX - plus.x;
      const returnDy = plus.originY - plus.y;

      plus.vx += returnDx * RETURN_STRENGTH;
      plus.vy += returnDy * RETURN_STRENGTH;

      // Apply friction
      plus.vx *= FRICTION;
      plus.vy *= FRICTION;

      // Clamp velocity
      plus.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, plus.vx));
      plus.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, plus.vy));

      // Update position
      plus.x += plus.vx;
      plus.y += plus.vy;

      // Calculate opacity based on distance from mouse (glow effect)
      let opacity = 0.12; // Base opacity
      if (distance < MOUSE_RADIUS && isHoveringRef.current) {
        const glowIntensity = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
        opacity = 0.12 + glowIntensity * 0.4; // Increase opacity near mouse
      }

      // Draw the plus sign
      drawPlusSign(ctx, plus.x, plus.y, PLUS_SIZE, opacity);
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [drawPlusSign]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    // Calculate mouse position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if mouse is within canvas bounds
    const isInBounds = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

    isHoveringRef.current = isInBounds;
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    initializePlusSigns();

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Listen to mouse events on window for global tracking
    // This allows text elements to have their own hover events
    window.addEventListener('mousemove', handleMouseMove);

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    // Handle resize
    const handleResize = () => {
      initializePlusSigns();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, [initializePlusSigns, animate, handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.interactiveCanvas}
      aria-hidden="true"
    />
  );
}
