'use client';

/* ============================================================
   WORKFLOW · ORBIT renderer — GSAP driver hook
   Powers the theme-aligned reimaginings (sparkle / plusgrid / cosmic).

   It reuses the PROVEN transit mechanics verbatim in shape:
   - two decoupled effects (geometry rebuild on variant change; pin
     created ONCE on reducedMotion) so a variant swap never re-pins,
   - the bullet rides any route via getPointAtLength,
   - scroll position is preserved on pin teardown.
   Only the *decoration* differs: markers are ✦ / ✛ / ☆ glyphs, the
   bullet is a spark / token / comet, and an optional accent comet-tail
   or starfield is painted. No metro chrome.
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { STAR_PATH } from '@/components/sections/Services/Star';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Orbit.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.6;

// Deterministic starfield (cosmic). Fixed so there is no hydration flicker
// and no Math.random. Units are viewBox coords (1200×700).
const STARS: Array<[number, number, number, number]> = [
  // x, y, r, opacity
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

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
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

// Positive modulo (JS % keeps sign of dividend).
const pmod = (n: number, m: number) => ((n % m) + m) % m;

export function useOrbitDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { layout, accents, variantKey, reducedMotion }: DriverOptions,
) {
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);

  // ── Geometry effect: rebuild the SVG when the variant changes ──
  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;
      const style = layout.orbit;
      if (!style) return;

      const svg = section.querySelector<SVGSVGElement>('[data-schematic]');
      const viewport = section.querySelector<HTMLElement>('[data-viewport]');
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      if (!svg || !viewport) return;

      const stopCount = layout.stopFrac.length;
      const totalLabel = String(stopCount).padStart(2, '0');

      svg.replaceChildren();

      // ── background field ──
      if (style.field === 'stars') {
        const field = mk('g', {});
        STARS.forEach(([x, y, r, o]) => {
          field.appendChild(
            mk('circle', { class: styles.fieldStar, cx: x, cy: y, r, opacity: o }),
          );
        });
        svg.appendChild(field);
      }

      // ── route: casing → resting line → (optional) live line ──
      svg.appendChild(
        mk('path', { class: styles.routeCasing, d: layout.d, 'stroke-width': style.lineWidth + 10 }),
      );
      const restClass = style.dashedRoute ? styles.routeDashed : styles.route;
      svg.appendChild(mk('path', { class: restClass, d: layout.d, 'stroke-width': style.lineWidth }));

      // Geometry path used for measuring + riding (always present).
      const geom = mk('path', { d: layout.d, fill: 'none', stroke: 'none' });
      svg.appendChild(geom);
      const total = geom.getTotalLength();

      let live: SVGPathElement | null = null;
      if (style.drawLine) {
        live = mk('path', { class: styles.routeLive, d: layout.d, 'stroke-width': style.lineWidth });
        svg.appendChild(live);
        live.style.strokeDasharray = String(total);
        live.style.strokeDashoffset = String(total);
      }

      // comet trail (separate dashed window that ends at the bullet)
      let trailPath: SVGPathElement | null = null;
      const trailLen = style.bullet === 'comet' ? style.trail : 0;
      if (trailLen > 0) {
        trailPath = mk('path', { class: styles.trail, d: layout.d });
        trailPath.style.strokeDasharray = `${trailLen} ${total}`;
        svg.appendChild(trailPath);
      }

      // ── markers at each stop ──
      const markers: SVGGElement[] = [];
      layout.stopFrac.forEach((frac, i) => {
        const pt = geom.getPointAtLength(total * frac);
        const g = mk('g', { class: styles.marker });
        g.style.setProperty('--m-accent', accents[i] ?? accents[0]);

        if (style.marker === 'sparkle') {
          const s = 1.25; // ✦ marker tip-to-tip ≈ 30
          g.appendChild(
            mk('path', {
              class: `${styles.markerGlyph} ${styles.markerSparkle}`,
              d: STAR_PATH,
              transform: `translate(${pt.x - 12 * s} ${pt.y - 12 * s}) scale(${s})`,
            }),
          );
        } else if (style.marker === 'plus') {
          const a = 13;
          g.appendChild(
            mk('path', {
              class: `${styles.markerGlyph} ${styles.markerPlus}`,
              d: `M${pt.x - a} ${pt.y} H${pt.x + a} M${pt.x} ${pt.y - a} V${pt.y + a}`,
            }),
          );
        } else {
          // cosmic star: dim dot + halo that lights on arrival
          g.appendChild(mk('circle', { class: styles.markerHalo, cx: pt.x, cy: pt.y, r: 16 }));
          const s = 0.9;
          g.appendChild(
            mk('path', {
              class: `${styles.markerGlyph} ${styles.markerSparkle}`,
              d: STAR_PATH,
              transform: `translate(${pt.x - 12 * s} ${pt.y - 12 * s}) scale(${s})`,
            }),
          );
        }
        svg.appendChild(g);
        markers.push(g);
      });

      // ── bullet ──
      const bullet = mk('g', { class: styles.bulletGroup });
      if (style.bullet === 'spark') {
        const s = 1.5;
        bullet.append(
          mk('circle', { class: styles.bulletGlow, cx: 0, cy: 0, r: 22 }),
          mk('path', {
            class: styles.bulletGlyph,
            d: STAR_PATH,
            transform: `translate(${-12 * s} ${-12 * s}) scale(${s})`,
          }),
        );
      } else if (style.bullet === 'plus') {
        bullet.append(
          mk('circle', { class: styles.bulletGlow, cx: 0, cy: 0, r: 20 }),
          mk('circle', { class: styles.bulletToken, cx: 0, cy: 0, r: 12 }),
          mk('path', { class: styles.bulletPlusMark, d: 'M-7 0 H7 M0 -7 V7' }),
        );
      } else {
        // comet head
        bullet.append(
          mk('circle', { class: styles.bulletGlow, cx: 0, cy: 0, r: 24 }),
          mk('circle', { class: styles.bulletHead, cx: 0, cy: 0, r: 8 }),
        );
      }
      svg.appendChild(bullet);

      // ── active-stop bookkeeping ──
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
        const L = total * progress;
        if (live) live.style.strokeDashoffset = String(total - L);
        if (trailPath) {
          const P = trailLen + total;
          trailPath.style.strokeDashoffset = String(pmod(trailLen - L, P));
        }
        const p = geom.getPointAtLength(L);
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
        if (live) live.style.strokeDashoffset = '0';
        if (trailPath) trailPath.style.opacity = '0';
        bullet.style.opacity = '0';
        markers.forEach((m) => m.classList.add(styles.mActive));
        details.forEach((el) => el.classList.add(styles.isActive));
        svg.style.setProperty('--wf-live-accent', accents[stopCount - 1] ?? accents[0]);
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
