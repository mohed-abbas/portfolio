'use client';

/* ============================================================
   WORKFLOW · ECLIPSE renderer — GSAP driver hook
   A central disc and accent light reveal the active step's big name.
   Three forms share this driver:
     • crescent — a dark body slides off the disc; the growing crescent
       of light sweeps a masked name. Ends on a corona bloom.
     • annular  — a concentric ring of fire; a bright accent arc sweeps
       the ring past lit beads while the name holds the dark core.
     • horizon  — a line of light sweeps top→bottom (a dawn terminator),
       revealing the disc and name band by band.

   Two decoupled effects: geometry rebuilds on variant change; the pin
   is created ONCE (pin, scrub 0..1, preserve scroll on teardown).
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Eclipse.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8;
const CX = 600;
const CY = 350;
const R = 215; // light disc radius
const RMOON = 232; // crescent: dark body radius
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
  layout: TransitLayout;
  accents: string[];
  variantKey: string;
  reducedMotion: boolean;
}

export function useEclipseDriver(
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
      const form = layout.eclipse?.form ?? 'crescent';
      const masked = form === 'crescent' || form === 'horizon';

      svg.replaceChildren();

      // ── mask (crescent + horizon) ──
      let maskMoon: SVGCircleElement | null = null;
      let maskRect: SVGRectElement | null = null;
      if (masked) {
        const defs = mk('defs', {});
        const mask = mk('mask', { id: MASK_ID, maskUnits: 'userSpaceOnUse' });
        if (form === 'crescent') {
          mask.appendChild(mk('circle', { cx: CX, cy: CY, r: R, fill: '#fff' }));
          maskMoon = mk('circle', { cx: CX, cy: CY, r: RMOON, fill: '#000' });
          mask.appendChild(maskMoon);
        } else {
          maskRect = mk('rect', { x: 0, y: 0, width: 1200, height: 0, fill: '#fff' });
          mask.appendChild(maskRect);
        }
        mask.setAttribute('id', MASK_ID);
        defs.appendChild(mask);
        svg.appendChild(defs);
      }

      // ── annular: ring of fire ──
      let fireArc: SVGCircleElement | null = null;
      const beads: SVGCircleElement[] = [];
      const RIN = 120;
      const RMID = (R + RIN) / 2;
      const circ = 2 * Math.PI * RMID;

      // ── crescent / horizon: lit glow disc, masked ──
      let corona: SVGCircleElement | null = null;
      let moon: SVGCircleElement | null = null;
      let horizonLine: SVGLineElement | null = null;

      if (form === 'annular') {
        // faint resting annulus (light disc minus core), via a local mask
        const defs = mk('defs', {});
        const aMask = mk('mask', { id: 'wf-eclipse-annulus', maskUnits: 'userSpaceOnUse' });
        aMask.append(
          mk('circle', { cx: CX, cy: CY, r: R, fill: '#fff' }),
          mk('circle', { cx: CX, cy: CY, r: RIN, fill: '#000' }),
        );
        defs.appendChild(aMask);
        svg.appendChild(defs);
        svg.appendChild(
          mk('circle', { class: styles.annulusRest, cx: CX, cy: CY, r: R, mask: 'url(#wf-eclipse-annulus)' }),
        );
        // bright fire arc sweeping the ring (starts at 12 o'clock)
        fireArc = mk('circle', {
          class: styles.fire,
          cx: CX,
          cy: CY,
          r: RMID,
          'stroke-width': R - RIN,
          transform: `rotate(-90 ${CX} ${CY})`,
        });
        fireArc.style.strokeDasharray = String(circ);
        fireArc.style.strokeDashoffset = String(circ);
        svg.appendChild(fireArc);
        // beads at each step angle
        for (let i = 0; i < N; i++) {
          const ang = (-90 + (i / N) * 360) * (Math.PI / 180);
          const bx = CX + RMID * Math.cos(ang);
          const by = CY + RMID * Math.sin(ang);
          const bead = mk('circle', { class: styles.bead, cx: bx, cy: by, r: 7 });
          bead.style.setProperty('--accent', accents[i] ?? accents[0]);
          svg.appendChild(bead);
          beads.push(bead);
        }
        // dark core rim
        svg.appendChild(mk('circle', { class: styles.coreEdge, cx: CX, cy: CY, r: RIN }));
      } else {
        // glow disc masked to the revealed region
        svg.appendChild(
          mk('circle', { class: styles.glow, cx: CX, cy: CY, r: R, mask: `url(#${MASK_ID})` }),
        );
        svg.appendChild(mk('circle', { class: styles.discEdge, cx: CX, cy: CY, r: R }));
        corona = mk('circle', { class: styles.corona, cx: CX, cy: CY, r: R + 6 });
        svg.appendChild(corona);
        if (form === 'crescent') {
          moon = mk('circle', { class: styles.moon, cx: CX, cy: CY, r: RMOON });
          svg.appendChild(moon);
        } else {
          horizonLine = mk('line', { class: styles.horizon, x1: CX - R - 30, x2: CX + R + 30, y1: CY, y2: CY });
          svg.appendChild(horizonLine);
        }
      }

      // ── names: base + (masked) lit copy ──
      const baseGroup = mk('g', {});
      const litGroup = masked ? mk('g', { mask: `url(#${MASK_ID})` }) : null;
      const baseTexts: SVGTextElement[] = [];
      const litTexts: SVGTextElement[] = [];
      for (let i = 0; i < N; i++) {
        const base = mk('text', {
          class: form === 'annular' ? styles.nameInk : styles.nameBase,
          x: CX,
          y: CY,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
        });
        base.textContent = stepNames[i] ?? '';
        baseGroup.appendChild(base);
        baseTexts.push(base);
        if (litGroup) {
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
      }
      svg.appendChild(baseGroup);
      if (litGroup) svg.appendChild(litGroup);

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
        if (form === 'crescent' && maskMoon && moon) {
          const mx = lerp(582, 224, progress);
          const my = lerp(364, 68, progress);
          maskMoon.setAttribute('cx', String(mx));
          maskMoon.setAttribute('cy', String(my));
          moon.setAttribute('cx', String(mx));
          moon.setAttribute('cy', String(my));
          if (corona) corona.style.opacity = String(Math.max(0, (progress - 0.82) / 0.18) * 0.9);
        } else if (form === 'horizon' && maskRect) {
          const lineY = lerp(CY - R, CY + R, progress);
          maskRect.setAttribute('height', String(Math.max(0, lineY)));
          if (horizonLine) {
            horizonLine.setAttribute('y1', String(lineY));
            horizonLine.setAttribute('y2', String(lineY));
            horizonLine.style.opacity = progress > 0.985 ? '0' : '1';
          }
          if (corona) corona.style.opacity = String(Math.max(0, (progress - 0.86) / 0.14) * 0.9);
        } else if (form === 'annular' && fireArc) {
          fireArc.style.strokeDashoffset = String(circ * (1 - progress));
          beads.forEach((b, n) => b.classList.toggle(styles.beadOn, progress + 1e-3 >= n / N));
        }
        const i = Math.max(0, Math.min(N - 1, Math.floor(progress * N - 1e-6)));
        setActive(i);
      };
      renderRef.current = render;

      // ── reduced motion: full reveal, names lit, no pin ──
      if (reducedMotion) {
        if (form === 'crescent' && maskMoon && moon) {
          maskMoon.setAttribute('cx', '-400');
          maskMoon.setAttribute('cy', '-400');
          moon.style.opacity = '0';
          if (corona) corona.style.opacity = '0.9';
        } else if (form === 'horizon' && maskRect) {
          maskRect.setAttribute('height', '700');
          if (horizonLine) horizonLine.style.opacity = '0';
          if (corona) corona.style.opacity = '0.9';
        } else if (form === 'annular' && fireArc) {
          fireArc.style.strokeDashoffset = '0';
          beads.forEach((b) => b.classList.add(styles.beadOn));
        }
        baseTexts.forEach((t) => t.classList.add(styles.nameOn));
        litTexts.forEach((t) => t.classList.add(styles.nameOn));
        details.forEach((el) => el.classList.add(styles.isActive));
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
