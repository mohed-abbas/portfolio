'use client';

/* ============================================================
   WORKFLOW · ECLIPSE renderer — GSAP driver hook
   A dark body slides off a light disc; the growing crescent of accent
   light sweeps a masked big name, ending on a corona bloom. The scene is
   built imperatively into the [data-schematic] SVG, then a single pinned
   ScrollTrigger scrubs a 0..1 progress through `render`. Scroll position
   is preserved when the pin is torn down (dev variant swap / unmount).
   ============================================================ */

import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import styles from './Eclipse.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8; // scroll runway (viewport-heights) while pinned
const CX = 600;
const CY = 350;
const R = 215; // light disc radius
const RMOON = 232; // dark body radius
const MASK_ID = 'wf-eclipse-mask';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function mk<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K];
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

interface DriverOptions {
  /** One CSS color per step; its length is the step count. */
  accents: string[];
  reducedMotion: boolean;
}

export function useEclipseDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { accents, reducedMotion }: DriverOptions,
) {
  useGSAP(
    () => {
      const section = sectionRef.current;
      const svg = section?.querySelector<SVGSVGElement>('[data-schematic]');
      const viewport = section?.querySelector<HTMLElement>('[data-viewport]');
      if (!section || !svg || !viewport) return;

      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const nameHost = section.querySelector<HTMLElement>('[data-stepname]');
      const stepNames = nameHost?.dataset.names?.split('|') ?? [];
      const N = accents.length;
      if (!N) return;
      const totalLabel = String(N).padStart(2, '0');

      svg.replaceChildren();

      // ── mask: the lit disc minus the sliding dark body ──
      const defs = mk('defs', {});
      const mask = mk('mask', { id: MASK_ID, maskUnits: 'userSpaceOnUse' });
      mask.appendChild(mk('circle', { cx: CX, cy: CY, r: R, fill: '#fff' }));
      const maskMoon = mk('circle', { cx: CX, cy: CY, r: RMOON, fill: '#000' });
      mask.appendChild(maskMoon);
      defs.appendChild(mask);
      svg.appendChild(defs);

      // ── lit glow disc (masked to the revealed crescent), rim, corona, moon ──
      svg.appendChild(mk('circle', { class: styles.glow, cx: CX, cy: CY, r: R, mask: `url(#${MASK_ID})` }));
      svg.appendChild(mk('circle', { class: styles.discEdge, cx: CX, cy: CY, r: R }));
      const corona = mk('circle', { class: styles.corona, cx: CX, cy: CY, r: R + 6 });
      svg.appendChild(corona);
      const moon = mk('circle', { class: styles.moon, cx: CX, cy: CY, r: RMOON });
      svg.appendChild(moon);

      // ── names: muted base + accent-lit copy masked to the crescent ──
      const baseGroup = mk('g', {});
      const litGroup = mk('g', { mask: `url(#${MASK_ID})` });
      const baseTexts: SVGTextElement[] = [];
      const litTexts: SVGTextElement[] = [];
      for (let i = 0; i < N; i++) {
        const base = mk('text', {
          class: styles.nameBase,
          x: CX,
          y: CY,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
        });
        base.textContent = stepNames[i] ?? '';
        baseGroup.appendChild(base);
        baseTexts.push(base);

        const lit = mk('text', {
          class: styles.nameLit,
          x: CX,
          y: CY,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
        });
        lit.textContent = stepNames[i] ?? '';
        litGroup.appendChild(lit);
        litTexts.push(lit);
      }
      svg.appendChild(baseGroup);
      svg.appendChild(litGroup);

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        baseTexts.forEach((t, n) => t.classList.toggle(styles.nameOn, n === i));
        litTexts.forEach((t, n) => t.classList.toggle(styles.nameOn, n === i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const render = (progress: number) => {
        const mx = lerp(582, 224, progress);
        const my = lerp(364, 68, progress);
        maskMoon.setAttribute('cx', String(mx));
        maskMoon.setAttribute('cy', String(my));
        moon.setAttribute('cx', String(mx));
        moon.setAttribute('cy', String(my));
        corona.style.opacity = String(Math.max(0, (progress - 0.82) / 0.18) * 0.9);
        setActive(Math.max(0, Math.min(N - 1, Math.floor(progress * N - 1e-6))));
      };

      // ── reduced motion: full reveal, every name lit, no pin ──
      if (reducedMotion) {
        maskMoon.setAttribute('cx', '-400');
        maskMoon.setAttribute('cy', '-400');
        moon.style.opacity = '0';
        corona.style.opacity = '0.9';
        baseTexts.forEach((t) => t.classList.add(styles.nameOn));
        litTexts.forEach((t) => t.classList.add(styles.nameOn));
        details.forEach((el) => el.classList.add(styles.isActive));
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        return () => {
          svg.replaceChildren();
        };
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => '+=' + window.innerHeight * PIN_VH,
        pin: viewport,
        pinType: 'fixed',
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
      });
      render(trigger.progress);

      return () => {
        const y = window.scrollY;
        trigger.kill();
        window.scrollTo(0, y);
        svg.replaceChildren();
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );
}
