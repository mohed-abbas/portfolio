'use client';

/* ============================================================
   WORKFLOW · APERTURE renderer — GSAP driver hook
   A six-blade camera iris. Six big surface-coloured blades cover the
   plus-grid except for a central N-gon hole; the hole's apothem is
   driven by scroll. Each step the iris stops down (the hole shrinks)
   then opens wider than the last, revealing that step's sharp name
   scaled to fit the hole. Ends wide open on a corona bloom.

   Two decoupled effects: geometry rebuilds on variant change; the pin
   is created ONCE (pin, scrub 0..1, preserve scroll on teardown) —
   the same shape every other concept renderer uses.
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Aperture.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8;
const CX = 600;
const CY = 350;
const BLADES = 6;
const A_MIN = 64; // smallest hole apothem (stopped down)
const A_MAX = 250; // widest hole apothem (wide open)
const BIG = 1500; // blade rect reach (covers the viewBox when rotated)
const RIM = A_MAX + 8; // corona ring radius

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

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
  variantKey: string;
  reducedMotion: boolean;
}

export function useApertureDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { layout, accents, variantKey, reducedMotion }: DriverOptions,
) {
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);

  // ── Geometry effect: rebuild the SVG when the variant changes ──
  useGSAP(
    () => {
      const section = sectionRef.current;
      const svg = section?.querySelector<SVGSVGElement>('[data-schematic]');
      if (!section || !svg) return;

      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const nameHost = section.querySelector<HTMLElement>('[data-stepname]');
      const stepNames = nameHost?.dataset.names?.split('|') ?? [];
      const N = layout.stopFrac.length;
      const totalLabel = String(N).padStart(2, '0');

      svg.replaceChildren();

      // ── names (behind the blades, revealed only inside the hole) ──
      const nameGroups: SVGGElement[] = [];
      const nameTexts: SVGTextElement[] = [];
      const widths: number[] = [];
      for (let i = 0; i < N; i++) {
        const g = mk('g', {});
        const t = mk('text', {
          class: styles.name,
          x: CX,
          y: CY,
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
        });
        t.textContent = stepNames[i] ?? '';
        g.appendChild(t);
        svg.appendChild(g);
        nameGroups.push(g);
        nameTexts.push(t);
        widths.push(t.getBBox().width || 1);
      }

      // ── six blades: a surface-filled rect + a faint inner-edge line ──
      const bladeGroups: SVGGElement[] = [];
      const bladeRects: SVGRectElement[] = [];
      const bladeEdges: SVGLineElement[] = [];
      for (let b = 0; b < BLADES; b++) {
        const g = mk('g', {});
        const rect = mk('rect', {
          class: styles.blade,
          x: CX + A_MIN,
          y: CY - BIG,
          width: BIG,
          height: BIG * 2,
        });
        const edge = mk('line', {
          class: styles.bladeEdge,
          x1: CX + A_MIN,
          x2: CX + A_MIN,
          y1: CY - 40,
          y2: CY + 40,
        });
        g.append(rect, edge);
        svg.appendChild(g);
        bladeGroups.push(g);
        bladeRects.push(rect);
        bladeEdges.push(edge);
      }

      // ── corona rim (blooms at the end) ──
      const corona = mk('circle', { class: styles.corona, cx: CX, cy: CY, r: RIM });
      svg.appendChild(corona);

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        nameTexts.forEach((t, n) => t.classList.toggle(styles.nameOn, n === i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      // place blades + scale the active name for a given apothem
      const place = (a: number, swirlDeg: number, activeFor: number) => {
        const edgeHalf = a * Math.tan(Math.PI / BLADES) * 1.08;
        for (let b = 0; b < BLADES; b++) {
          const angle = b * (360 / BLADES) + swirlDeg;
          bladeGroups[b].setAttribute('transform', `rotate(${angle} ${CX} ${CY})`);
          bladeRects[b].setAttribute('x', String(CX + a));
          const e = bladeEdges[b];
          e.setAttribute('x1', String(CX + a));
          e.setAttribute('x2', String(CX + a));
          e.setAttribute('y1', String(CY - edgeHalf));
          e.setAttribute('y2', String(CY + edgeHalf));
        }
        const s = Math.min(1.12, (1.7 * a) / widths[activeFor]);
        nameGroups[activeFor].setAttribute(
          'transform',
          `translate(${CX} ${CY}) scale(${s}) translate(${-CX} ${-CY})`,
        );
      };

      const render = (progress: number) => {
        const seg = progress * N;
        const idx = Math.max(0, Math.min(N - 1, Math.floor(seg)));
        const f = seg - idx;
        // target opening for this step, growing each step
        const target = lerp(A_MIN + 26, A_MAX, idx / (N - 1));
        // stop down at the start of each step, then open
        const openF = 0.42 + 0.58 * clamp01(f / 0.6);
        const a = target * openF;
        const swirl = -26 * ((a - A_MIN) / (A_MAX - A_MIN));
        place(a, swirl, idx);
        corona.style.opacity = String(clamp01((progress - 0.85) / 0.15) * 0.9);
        setActive(idx);
      };
      renderRef.current = render;

      // ── reduced motion: iris wide open, last name lit, no pin ──
      if (reducedMotion) {
        place(A_MAX, 0, N - 1);
        nameTexts.forEach((t, n) => t.classList.toggle(styles.nameOn, n === N - 1));
        details.forEach((el) => el.classList.add(styles.isActive));
        corona.style.opacity = '0.9';
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        return () => {
          svg.replaceChildren();
          renderRef.current = () => {};
        };
      }

      render(progressRef.current);

      return () => {
        svg.replaceChildren();
        renderRef.current = () => {};
      };
    },
    { scope: sectionRef, dependencies: [variantKey, reducedMotion] },
  );

  // ── Pin effect: create the ScrollTrigger ONCE ──
  useGSAP(
    () => {
      if (reducedMotion) return;
      const section = sectionRef.current;
      const viewport = section?.querySelector<HTMLElement>('[data-viewport]');
      if (!section || !viewport) return;

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
          renderRef.current(self.progress);
        },
        onRefresh: (self) => {
          progressRef.current = self.progress;
          renderRef.current(self.progress);
        },
      });

      return () => {
        const y = window.scrollY;
        trigger.kill();
        window.scrollTo(0, y);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );
}
