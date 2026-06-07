'use client';

/* ============================================================
   WORKFLOW · SETTLING ORBIT renderer — GSAP driver hook
   Extends the Cosmic orbit. The comet starts on a wide, eccentric,
   wobbling orbit (the unsettled idea) and, as the five steps
   complete, the orbit's eccentricity / tilt / wobble decay until it
   locks into a clean tight circle; the starfield sharpens from bokeh
   to crisp points. Geometry is parametric (the orbit shape changes
   per frame), so unlike the Cosmic driver it does not ride a fixed
   path — it samples an ellipse whose axes settle with progress.

   Two decoupled effects: geometry rebuilds on variant change; the pin
   is created ONCE (pin, scrub 0..1, preserve scroll on teardown).
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { STAR_PATH } from '@/components/sections/Services/Star';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Settling.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8;
const CX = 600;
const CY = 350;
const TAU = Math.PI * 2;

// orbit shape endpoints
const RX_START = 320;
const RY_START = 116;
const R_END = 205;
const TILT_START = -18; // degrees
const TURNS = 2.6; // comet laps across the whole pin
const WOBBLE = 0.2; // radial wobble fraction at the start
const TRAIL = 16; // comet-tail samples

// Deterministic starfield (shared shape with Cosmic). x, y, r, opacity.
const STARS: Array<[number, number, number, number]> = [
  [120, 110, 1.6, 0.5], [240, 60, 1.1, 0.35], [330, 180, 1.4, 0.45],
  [90, 300, 1.2, 0.3], [180, 470, 1.7, 0.5], [300, 560, 1.1, 0.3],
  [470, 90, 1.3, 0.4], [560, 220, 1, 0.28], [430, 640, 1.5, 0.45],
  [700, 70, 1.2, 0.35], [820, 150, 1.6, 0.5], [760, 600, 1.3, 0.4],
  [930, 110, 1.1, 0.3], [1040, 250, 1.7, 0.5], [980, 470, 1.2, 0.35],
  [1090, 560, 1.4, 0.42], [620, 540, 1, 0.26], [150, 620, 1.3, 0.38],
  [1130, 360, 1.2, 0.34], [60, 200, 1.5, 0.46], [380, 320, 1, 0.24],
  [880, 360, 1.1, 0.3], [520, 470, 1.3, 0.36], [690, 290, 1, 0.22],
  [1010, 640, 1.4, 0.4], [260, 250, 1.1, 0.3],
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

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

export function useSettlingDriver(
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
      const N = layout.stopFrac.length;
      const totalLabel = String(N).padStart(2, '0');

      svg.replaceChildren();

      // ── starfield ──
      const starEls: SVGCircleElement[] = [];
      const starGroup = mk('g', {});
      STARS.forEach(([x, y, r, o]) => {
        const c = mk('circle', { class: styles.star, cx: x, cy: y, r, opacity: o });
        starGroup.appendChild(c);
        starEls.push(c);
      });
      svg.appendChild(starGroup);

      // ── resting orbit (updated every frame as it rounds out) ──
      const orbit = mk('ellipse', { class: styles.orbit, cx: CX, cy: CY, rx: RX_START, ry: RY_START });
      svg.appendChild(orbit);

      // ── comet trail (faded samples behind the head) ──
      const trail: SVGCircleElement[] = [];
      for (let k = 0; k < TRAIL; k++) {
        const c = mk('circle', { class: styles.trailDot, cx: CX, cy: CY, r: 1 });
        svg.appendChild(c);
        trail.push(c);
      }

      // ── step markers on the final circle ──
      const markers: SVGGElement[] = [];
      for (let i = 0; i < N; i++) {
        const ang = (-90 + (i / N) * 360) * (Math.PI / 180);
        const mx = CX + R_END * Math.cos(ang);
        const my = CY + R_END * Math.sin(ang);
        const g = mk('g', { class: styles.marker });
        g.style.setProperty('--m-accent', accents[i] ?? accents[0]);
        g.appendChild(mk('circle', { class: styles.markerHalo, cx: mx, cy: my, r: 16 }));
        const s = 0.9;
        g.appendChild(
          mk('path', {
            class: styles.markerGlyph,
            d: STAR_PATH,
            transform: `translate(${mx - 12 * s} ${my - 12 * s}) scale(${s})`,
          }),
        );
        svg.appendChild(g);
        markers.push(g);
      }

      // ── comet head ──
      const comet = mk('g', { class: styles.cometGroup });
      comet.append(
        mk('circle', { class: styles.cometGlow, cx: 0, cy: 0, r: 22 }),
        mk('circle', { class: styles.cometHead, cx: 0, cy: 0, r: 8 }),
      );
      svg.appendChild(comet);

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        markers.forEach((m, n) => m.classList.toggle(styles.mActive, n <= i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        svg.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const render = (progress: number) => {
        const e = easeInOut(progress);
        const rx = lerp(RX_START, R_END, e);
        const ry = lerp(RY_START, R_END, e);
        const tilt = lerp(TILT_START, 0, e);
        const tiltRad = tilt * (Math.PI / 180);
        const cosT = Math.cos(tiltRad);
        const sinT = Math.sin(tiltRad);

        const pt = (phi: number) => {
          const wob = 1 + (1 - progress) * WOBBLE * Math.sin(phi * 3 + 0.7);
          const lx = rx * Math.cos(phi) * wob;
          const ly = ry * Math.sin(phi) * wob;
          return { x: CX + lx * cosT - ly * sinT, y: CY + lx * sinT + ly * cosT };
        };

        // resting orbit shape
        orbit.setAttribute('rx', String(rx));
        orbit.setAttribute('ry', String(ry));
        orbit.setAttribute('transform', `rotate(${tilt} ${CX} ${CY})`);

        // comet + trail
        const phi = -Math.PI / 2 + progress * TURNS * TAU;
        const head = pt(phi);
        comet.setAttribute('transform', `translate(${head.x} ${head.y})`);
        for (let k = 0; k < TRAIL; k++) {
          const p = pt(phi - (k + 1) * 0.13);
          const t = 1 - (k + 1) / (TRAIL + 1);
          trail[k].setAttribute('cx', String(p.x));
          trail[k].setAttribute('cy', String(p.y));
          trail[k].setAttribute('r', String(1 + 5 * t));
          trail[k].style.opacity = String(0.7 * t);
        }

        // starfield bokeh → crisp
        for (let i = 0; i < starEls.length; i++) {
          const baseR = STARS[i][2];
          const baseO = STARS[i][3];
          starEls[i].setAttribute('r', String(baseR * (1 + 2 * (1 - progress))));
          starEls[i].style.opacity = String(baseO * (0.35 + 0.65 * progress));
        }

        const idx = Math.max(0, Math.min(N - 1, Math.floor(progress * N)));
        setActive(idx);
      };
      renderRef.current = render;

      // ── reduced motion: settled circle, comet hidden, stars crisp, no pin ──
      if (reducedMotion) {
        orbit.setAttribute('rx', String(R_END));
        orbit.setAttribute('ry', String(R_END));
        orbit.setAttribute('transform', `rotate(0 ${CX} ${CY})`);
        comet.style.opacity = '0';
        trail.forEach((c) => (c.style.opacity = '0'));
        starEls.forEach((c, i) => {
          c.setAttribute('r', String(STARS[i][2]));
          c.style.opacity = String(STARS[i][3]);
        });
        markers.forEach((m) => m.classList.add(styles.mActive));
        details.forEach((el) => el.classList.add(styles.isActive));
        svg.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
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
