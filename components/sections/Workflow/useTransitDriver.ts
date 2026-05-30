'use client';

/* ============================================================
   WORKFLOW · TRANSIT LINE — GSAP driver hook
   Generalised from claudedocs/wf-ideas/22-transit/workflow.js.

   Builds the schematic imperatively into the [data-schematic] SVG
   (casing → base → live route, stations, bullet), pins the viewport
   and scrubs: the live line paints in, a bullet rides the geometry
   via getPointAtLength and halts at each station, the arrivals board
   names the next stop, and the placard crossfades.

   PIN AND GEOMETRY ARE DECOUPLED into two effects:
   - Geometry effect (deps: variant) rebuilds the SVG and exposes a
     render(progress) via renderRef.
   - Pin effect (deps: reducedMotion) creates the ScrollTrigger ONCE.
   Switching variants only swaps SVG contents — the pinned box never
   changes, so there is no reflow and nothing to re-measure. (Coupling
   them caused every non-default variant to render blank: the pin was
   killed + recreated on each switch and measured stale positions.)

   Integration notes (see project memory):
   - Register GSAP/ScrollTrigger via @/lib/gsap (never a fresh import).
   - pinType:'fixed' to coexist with Lenis-on-html.
   - State is carried on module-hashed classes from the CSS module
     (no substring selectors); JS adds the SAME hashed names.
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Workflow.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';

// Uniform pin runway (viewport-heights). The pin is created once and shared
// across variants, so this no longer varies per layout.
const PIN_VH = 3.6;

interface DriverOptions {
  layout: TransitLayout;
  /** CSS accent value per stop, e.g. "var(--wf-teal)". */
  accents: string[];
  /** Stable key for the active variant (drives the effect dependency). */
  variantKey: string;
  reducedMotion: boolean;
}

function mk<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K];
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

export function useTransitDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { layout, accents, variantKey, reducedMotion }: DriverOptions,
) {
  // Bridge between the two effects: the geometry effect publishes a render
  // fn here; the pin effect calls it on scroll. progressRef preserves scroll
  // progress across a variant swap so the bullet lands on the new route.
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);

  // ── Geometry effect: rebuild the SVG when the variant changes ──
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const svg = section.querySelector<SVGSVGElement>('[data-schematic]');
      const viewport = section.querySelector<HTMLElement>('[data-viewport]');
      const board = section.querySelector<HTMLElement>('[data-board]');
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      if (!svg || !viewport) return;

      const stopCount = layout.stopFrac.length;
      const totalLabel = String(stopCount).padStart(2, '0');

      // ── build route: casing → base → live ──
      svg.replaceChildren();
      svg.appendChild(mk('path', { class: styles.routeCasing, d: layout.d }));
      svg.appendChild(mk('path', { class: styles.route, d: layout.d }));
      const live = mk('path', { class: styles.routeLive, d: layout.d });
      svg.appendChild(live);

      const total = live.getTotalLength();

      // ── stations: positioned on the path at each stopFrac ──
      const stations: SVGGElement[] = [];
      layout.stopFrac.forEach((frac, i) => {
        const pt = live.getPointAtLength(total * frac);
        const g = mk('g', { class: styles.stn });
        g.style.setProperty('--stn-accent', accents[i] ?? accents[0]);
        g.append(
          mk('circle', { class: styles.stnRing, cx: pt.x, cy: pt.y, r: 13 }),
          mk('circle', { class: styles.stnCore, cx: pt.x, cy: pt.y, r: 5 }),
        );

        // flag placement: fixed offsets, or radial push from centre
        let fx = 0;
        let fy = -32;
        let anchor: 'start' | 'middle' | 'end' = 'middle';
        if (layout.labelMode === 'fixed' && layout.labels?.[i]) {
          ({ fx, fy, anchor } = layout.labels[i]);
        } else if (layout.labelMode === 'radial' && layout.center) {
          const dx = pt.x - layout.center.x;
          const dy = pt.y - layout.center.y;
          const len = Math.hypot(dx, dy) || 1;
          fx = (dx / len) * 40;
          fy = (dy / len) * 40 + 5;
          anchor = dx > 12 ? 'start' : dx < -12 ? 'end' : 'middle';
        }

        const flag = mk('text', {
          class: styles.stnFlag,
          x: pt.x + fx,
          y: pt.y + fy,
          'text-anchor': anchor,
        });
        flag.textContent = details[i]?.getAttribute('data-name') ?? '';
        const num = mk('text', {
          class: styles.stnNum,
          x: pt.x + fx,
          y: pt.y + fy + (fy < 0 ? -16 : 16),
          'text-anchor': anchor,
        });
        num.textContent = String(i + 1).padStart(2, '0');
        g.append(flag, num);
        svg.appendChild(g);
        stations.push(g);
      });

      // ── train bullet ──
      const bullet = mk('g', { class: styles.bulletGroup });
      bullet.append(
        mk('circle', { class: styles.bulletGlow, cx: 0, cy: 0, r: 16 }),
        mk('circle', { class: styles.bullet, cx: 0, cy: 0, r: 9 }),
      );
      svg.appendChild(bullet);

      live.style.strokeDasharray = String(total);
      live.style.strokeDashoffset = String(total);

      // ── active-stop bookkeeping ──
      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        stations.forEach((s, n) => s.classList.toggle(styles.isActive, n <= i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        svg.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        const name = details[i]?.getAttribute('data-name') ?? '—';
        if (board) board.textContent = name;
        if (readout) readout.textContent = `${String(i + 1).padStart(2, '0')} / ${totalLabel}`;
      };

      const render = (progress: number) => {
        live.style.strokeDashoffset = String(total * (1 - progress));
        const p = live.getPointAtLength(total * progress);
        bullet.setAttribute('transform', `translate(${p.x} ${p.y})`);
        let i = 0;
        for (let n = 0; n < layout.stopFrac.length; n++) {
          if (progress + 0.001 >= layout.stopFrac[n]) i = n;
        }
        setActive(i);
      };
      renderRef.current = render;

      // ── reduced motion: full static schematic, no pin ──
      if (reducedMotion) {
        live.style.strokeDashoffset = '0';
        bullet.style.opacity = '0';
        stations.forEach((s) => s.classList.add(styles.isActive));
        details.forEach((el) => el.classList.add(styles.isActive));
        svg.style.setProperty('--wf-live-accent', accents[stopCount - 1] ?? accents[0]);
        if (board) board.textContent = details[stopCount - 1]?.getAttribute('data-name') ?? '';
        if (readout) readout.textContent = `${totalLabel} / ${totalLabel}`;
        return () => {
          svg.replaceChildren();
          renderRef.current = () => {};
        };
      }

      // Render at the live scroll progress so a variant swap mid-scroll keeps
      // the bullet/active stop in place on the new route.
      render(progressRef.current);

      // Cleanup only clears the SVG — the pin lives in the other effect.
      return () => {
        svg.replaceChildren();
        renderRef.current = () => {};
      };
    },
    { scope: sectionRef, dependencies: [variantKey, reducedMotion] },
  );

  // ── Pin effect: create the ScrollTrigger ONCE (never on variant change) ──
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

      // Preserve scroll position on teardown (unmount / HMR) so the page
      // doesn't jump when the pin spacer is removed.
      return () => {
        const y = window.scrollY;
        trigger.kill();
        window.scrollTo(0, y);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );
}
