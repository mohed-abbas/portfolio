'use client';

/* ============================================================
   WORKFLOW · SIGNAL renderer — GSAP driver hook
   The whole process is one continuous oscilloscope trace. As you
   scroll it draws left→right; each step is a segment with its own
   waveform character (a probe blip, a clean sine, a growing envelope,
   a dense burst, a damped settle). A playhead rides the trace head and
   the active step's name rises off its segment.

   Reuses the proven pin/scrub shape (pin once, scrub 0..1, preserve
   scroll on teardown). The trace draws via strokeDasharray/offset; the
   head rides via getPointAtLength.
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Signal.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8;
const X0 = 120;
const X1 = 1080;
const BASE = 350; // baseline y
const SAMPLES = 64; // per segment

function mk<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K];
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

// Waveform character per step (localT 0..1 within the segment). Each starts
// and ends near 0 so the trace stays continuous across boundaries.
function waveY(seg: number, t: number): number {
  const TAU = Math.PI * 2;
  switch (seg) {
    case 0: // Discover — flat line with one probe blip
      return 74 * Math.exp(-(((t - 0.5) / 0.08) ** 2));
    case 1: // Define — clean low-frequency sine
      return 72 * Math.sin(t * Math.PI * 3);
    case 2: // Design — sine with a growing envelope
      return 104 * t * Math.sin(t * TAU * 2);
    case 3: // Build — dense, near-square burst
      return 112 * Math.tanh(4 * Math.sin(t * TAU * 6)) * 0.92;
    default: // Refine — damped sine settling to a clean line
      return 112 * Math.exp(-t * 3) * Math.sin(t * TAU * 4);
  }
}

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
  reducedMotion: boolean;
}

export function useSignalDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { layout, accents, reducedMotion }: DriverOptions,
) {
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = section?.querySelector<HTMLElement>('[data-viewport]');
      const svg = section?.querySelector<SVGSVGElement>('[data-schematic]');
      if (!section || !viewport || !svg) return;

      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const nameHost = section.querySelector<HTMLElement>('[data-stepname]');
      const stepNames = nameHost?.dataset.names?.split('|') ?? [];
      const N = layout.stopFrac.length;
      const totalLabel = String(N).padStart(2, '0');
      const segW = (X1 - X0) / N;

      svg.replaceChildren();

      // ── grid: baseline + per-segment dividers + tick labels ──
      const grid = mk('g', {});
      grid.appendChild(mk('line', { class: styles.baseline, x1: X0, y1: BASE, x2: X1, y2: BASE }));
      for (let i = 0; i <= N; i++) {
        const x = X0 + i * segW;
        grid.appendChild(mk('line', { class: styles.gridV, x1: x, y1: 140, x2: x, y2: 560 }));
      }
      for (let i = 0; i < N; i++) {
        const tick = mk('text', {
          class: styles.tick,
          x: X0 + i * segW + segW / 2,
          y: 596,
          'text-anchor': 'middle',
        });
        tick.textContent = String(i + 1).padStart(2, '0');
        grid.appendChild(tick);
      }
      svg.appendChild(grid);

      // ── waveform path ──
      let d = '';
      for (let i = 0; i < N; i++) {
        for (let s = 0; s <= SAMPLES; s++) {
          if (i > 0 && s === 0) continue; // avoid duplicate boundary point
          const t = s / SAMPLES;
          const x = X0 + i * segW + t * segW;
          const y = BASE - waveY(i, t);
          d += `${d === '' ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
        }
      }

      // The live trace is revealed by a clip rect that grows with x (not by
      // arc length) so every step gets equal scroll time — the dense Build
      // segment is far longer in arc length than the flat Discover one, which
      // would otherwise make early steps zip past.
      const defs = mk('defs', {});
      const clip = mk('clipPath', { id: 'wf-signal-clip', clipPathUnits: 'userSpaceOnUse' });
      const clipRect = mk('rect', { x: X0, y: 0, width: 0, height: 700 });
      clip.appendChild(clipRect);
      defs.appendChild(clip);
      svg.appendChild(defs);

      svg.appendChild(mk('path', { class: styles.traceGuide, d }));
      const live = mk('path', { class: styles.trace, d });
      live.setAttribute('clip-path', 'url(#wf-signal-clip)');
      svg.appendChild(live);

      const waveYAtX = (x: number) => {
        const seg = Math.max(0, Math.min(N - 1, Math.floor((x - X0) / segW)));
        const lt = Math.max(0, Math.min(1, ((x - X0) - seg * segW) / segW));
        return waveY(seg, lt);
      };

      // ── playhead ──
      const playhead = mk('g', { class: styles.playhead });
      const scan = mk('line', { class: styles.scan, x1: 0, y1: 130, x2: 0, y2: 570 });
      const dot = mk('circle', { class: styles.headDot, cx: 0, cy: 0, r: 6 });
      const dotGlow = mk('circle', { class: styles.headGlow, cx: 0, cy: 0, r: 16 });
      svg.appendChild(scan);
      playhead.append(dotGlow, dot);
      svg.appendChild(playhead);

      // ── step names as SVG text above each segment ──
      const names: SVGTextElement[] = [];
      for (let i = 0; i < N; i++) {
        const txt = mk('text', {
          class: styles.name,
          x: X0 + i * segW + segW / 2,
          y: 110,
          'text-anchor': 'middle',
        });
        txt.style.setProperty('--accent', accents[i] ?? accents[0]);
        txt.textContent = stepNames[i] ?? '';
        svg.appendChild(txt);
        names.push(txt);
      }

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        names.forEach((t, n) => t.classList.toggle(styles.nameActive, n === i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const render = (progress: number) => {
        const targetX = X0 + (X1 - X0) * progress;
        clipRect.setAttribute('width', String(Math.max(0, targetX - X0)));
        const hy = BASE - waveYAtX(targetX);
        playhead.setAttribute('transform', `translate(${targetX} ${hy})`);
        scan.setAttribute('transform', `translate(${targetX} 0)`);
        const vis = progress > 0.001 && progress < 0.999;
        playhead.style.opacity = vis ? '1' : '0';
        scan.style.opacity = vis ? '1' : '0';
        const seg = Math.max(0, Math.min(N - 1, Math.floor((targetX - X0) / segW - 1e-6)));
        setActive(seg);
      };
      renderRef.current = render;

      // ── reduced motion: full trace drawn, names lit, no pin ──
      if (reducedMotion) {
        clipRect.setAttribute('width', String(X1 - X0));
        playhead.style.opacity = '0';
        scan.style.opacity = '0';
        names.forEach((t) => t.classList.add(styles.nameActive));
        details.forEach((el) => el.classList.add(styles.isActive));
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        return () => {
          svg.replaceChildren();
          renderRef.current = () => {};
        };
      }

      render(progressRef.current);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + window.innerHeight * PIN_VH,
        pin: viewport,
        pinType: 'fixed',
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          render(self.progress);
        },
        onRefresh: (self) => {
          progressRef.current = self.progress;
          render(self.progress);
        },
      });

      return () => {
        const y = window.scrollY;
        trigger.kill();
        svg.replaceChildren();
        renderRef.current = () => {};
        window.scrollTo(0, y);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );
}
