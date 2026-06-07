'use client';

/* ============================================================
   WORKFLOW · CONSTELLATION renderer — GSAP driver hook
   The cosmic starfield, but the comet is gone. As you scroll a
   hairline draws star-to-star through five named stars, lighting each
   as it connects, until the figure completes — an "M" (Mohed). The
   active star's name scales up in accent; the centre-left placard
   crossfades its detail.

   Reuses the proven pin/scrub shape (pin once, scrub 0..1, preserve
   scroll on teardown). The drawing uses strokeDasharray/offset like
   the orbit route; the head rides via getPointAtLength.
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Constellation.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8;

// Background starfield (deterministic — no Math.random, no hydration flicker).
// Units are viewBox coords (1200×700).
const STARS: Array<[number, number, number, number]> = [
  [120, 110, 1.6, 0.5], [240, 60, 1.1, 0.35], [340, 300, 1.3, 0.4],
  [90, 360, 1.2, 0.3], [180, 470, 1.7, 0.5], [330, 620, 1.1, 0.3],
  [520, 90, 1.3, 0.4], [560, 320, 1, 0.28], [470, 600, 1.5, 0.42],
  [690, 90, 1.2, 0.35], [820, 360, 1.6, 0.46], [700, 600, 1.3, 0.4],
  [930, 120, 1.1, 0.3], [1040, 250, 1.7, 0.5], [980, 470, 1.2, 0.35],
  [1090, 560, 1.4, 0.42], [630, 540, 1, 0.26], [150, 620, 1.3, 0.38],
  [1130, 360, 1.2, 0.34], [60, 200, 1.5, 0.46], [1010, 640, 1.4, 0.4],
  [260, 250, 1.1, 0.3], [880, 600, 1, 0.24], [400, 120, 1.2, 0.32],
];

// Named stars, ordered, tracing an "M" left→right.
const NODES: Array<{ x: number; y: number; lx: number; ly: number; anchor: string }> = [
  { x: 300, y: 520, lx: 300, ly: 568, anchor: 'middle' },
  { x: 450, y: 200, lx: 450, ly: 172, anchor: 'middle' },
  { x: 600, y: 410, lx: 600, ly: 458, anchor: 'middle' },
  { x: 750, y: 200, lx: 750, ly: 172, anchor: 'middle' },
  { x: 900, y: 520, lx: 900, ly: 568, anchor: 'middle' },
];

function mk<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K];
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
  reducedMotion: boolean;
}

export function useConstellationDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { accents, reducedMotion }: DriverOptions,
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
      const N = Math.min(NODES.length, accents.length || NODES.length);
      const names = section.querySelector<HTMLElement>('[data-stepname]');
      const stepNames = names ? names.dataset.names?.split('|') ?? [] : [];
      const totalLabel = String(N).padStart(2, '0');

      svg.replaceChildren();

      // ── background starfield ──
      const field = mk('g', {});
      STARS.forEach(([x, y, r, o]) => {
        field.appendChild(mk('circle', { class: styles.fieldStar, cx: x, cy: y, r, opacity: o }));
      });
      svg.appendChild(field);

      // ── polyline through the named stars ──
      const d = NODES.slice(0, N)
        .map((n, i) => `${i === 0 ? 'M' : 'L'}${n.x} ${n.y}`)
        .join(' ');

      // faint guide + live accent draw + invisible geometry path for measuring
      svg.appendChild(mk('path', { class: styles.guide, d }));
      const live = mk('path', { class: styles.live, d });
      svg.appendChild(live);
      const geom = mk('path', { d, fill: 'none', stroke: 'none' });
      svg.appendChild(geom);
      const total = geom.getTotalLength();
      live.style.strokeDasharray = String(total);
      live.style.strokeDashoffset = String(total);

      // cumulative path length at each node (for lighting order)
      const cumLen: number[] = [0];
      for (let i = 1; i < N; i++) {
        const dx = NODES[i].x - NODES[i - 1].x;
        const dy = NODES[i].y - NODES[i - 1].y;
        cumLen[i] = cumLen[i - 1] + Math.hypot(dx, dy);
      }

      // ── named star nodes + SVG-text labels ──
      const stars: SVGGElement[] = [];
      const labels: SVGTextElement[] = [];
      for (let i = 0; i < N; i++) {
        const node = NODES[i];
        const g = mk('g', { class: styles.node });
        g.style.setProperty('--n-accent', accents[i] ?? accents[0]);
        g.appendChild(mk('circle', { class: styles.nodeHalo, cx: node.x, cy: node.y, r: 20 }));
        g.appendChild(mk('circle', { class: styles.nodeStar, cx: node.x, cy: node.y, r: 5 }));
        svg.appendChild(g);
        stars.push(g);

        const label = mk('text', {
          class: styles.label,
          x: node.lx,
          y: node.ly,
          'text-anchor': node.anchor,
        });
        label.textContent = stepNames[i] ?? '';
        svg.appendChild(label);
        labels.push(label);
      }

      // ── drawing head ──
      const head = mk('g', { class: styles.head2 });
      head.append(
        mk('circle', { class: styles.headGlow, cx: 0, cy: 0, r: 14 }),
        mk('circle', { class: styles.headDot, cx: 0, cy: 0, r: 4 }),
      );
      svg.appendChild(head);

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        stars.forEach((s, n) => s.classList.toggle(styles.nActive, n <= i));
        labels.forEach((l, n) => {
          l.classList.toggle(styles.labelLit, n <= i);
          l.classList.toggle(styles.labelActive, n === i);
        });
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const render = (progress: number) => {
        const L = total * progress;
        live.style.strokeDashoffset = String(total - L);
        const p = geom.getPointAtLength(L);
        head.setAttribute('transform', `translate(${p.x} ${p.y})`);
        head.style.opacity = progress > 0.001 && progress < 0.999 ? '1' : '0';
        let i = 0;
        for (let n = 0; n < N; n++) if (L + 1 >= cumLen[n]) i = n;
        setActive(i);
      };
      renderRef.current = render;

      // ── reduced motion: full figure drawn, all stars lit, no pin ──
      if (reducedMotion) {
        live.style.strokeDashoffset = '0';
        head.style.opacity = '0';
        stars.forEach((s) => s.classList.add(styles.nActive));
        labels.forEach((l) => l.classList.add(styles.labelLit));
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
