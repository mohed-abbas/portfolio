'use client';

/* ============================================================
   WORKFLOW · ORRERY renderer — GSAP driver hook
   A central ✦ body with orbiting markers, one per step. Three forms
   share this driver (geometry differs, the gesture is the same):
     • concentric — nested circular orbits; the active planet swings up
       to the 12-o'clock meridian and locks.
     • ecliptic   — nested flattened ovals (a system seen near edge-on);
       same meridian lock, plus front/back depth scaling.
     • atom       — equal thin ellipses crossing the nucleus; electrons
       orbit at their own rates, the active ring + electron ignite.

   Two decoupled effects (matching the orbit driver): geometry rebuilds
   on variant change; the pin is created ONCE. The pin reuses the proven
   shape (pin once, scrub 0..1, preserve scroll on teardown).
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { STAR_PATH } from '@/components/sections/Services/Star';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Orrery.module.css';

const SVGNS = 'http://www.w3.org/2000/svg';
const PIN_VH = 3.8;
const TAU = Math.PI * 2;
const CX = 600;
const CY = 350;

interface Orbit {
  a: number;
  b: number;
  rot: number;
}

function mk<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, tag) as SVGElementTagNameMap[K];
  for (const k in attrs) el.setAttribute(k, String(attrs[k]));
  return el;
}

function ellipsePoint(o: Orbit, phi: number) {
  const lx = o.a * Math.cos(phi);
  const ly = o.b * Math.sin(phi);
  return {
    x: CX + Math.cos(o.rot) * lx - Math.sin(o.rot) * ly,
    y: CY + Math.sin(o.rot) * lx + Math.cos(o.rot) * ly,
  };
}

function ellipsePath(o: Orbit) {
  let d = '';
  const steps = 72;
  for (let s = 0; s <= steps; s++) {
    const p = ellipsePoint(o, (s / steps) * TAU);
    d += `${s === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
  }
  return d + 'Z';
}

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
  variantKey: string;
  reducedMotion: boolean;
}

export function useOrreryDriver(
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
      if (!N) return;
      const totalLabel = String(N).padStart(2, '0');
      const form = layout.orrery?.form ?? 'concentric';

      // ── per-form orbit geometry ──
      const orbits: Orbit[] = [];
      for (let i = 0; i < N; i++) {
        if (form === 'concentric') {
          const r = 92 + i * 50;
          orbits.push({ a: r, b: r, rot: 0 });
        } else if (form === 'ecliptic') {
          const a = 220 + i * 58;
          orbits.push({ a, b: a * 0.5, rot: 0 });
        } else {
          // atom: equal thin ellipses, each rotated
          orbits.push({ a: 252, b: 84, rot: (i * Math.PI) / N });
        }
      }
      const bodyR = form === 'atom' ? 8 : 11;

      // body angle as a function of progress. concentric locks at the top
      // meridian; ecliptic (edge-on) locks at the front (bottom, nearest);
      // atom electrons just orbit at their own rates.
      const lockAngle = form === 'ecliptic' ? Math.PI / 2 : -Math.PI / 2;
      const phi = (i: number, progress: number) => {
        if (form === 'atom') return i * (TAU / N) + progress * TAU * (0.6 + i * 0.14);
        const activeFloat = progress * (N - 1);
        return lockAngle + (activeFloat - i) * (TAU / N);
      };

      svg.replaceChildren();

      // ── orbit paths ──
      const ringEls: SVGPathElement[] = [];
      orbits.forEach((o, i) => {
        const path = mk('path', {
          class: form === 'atom' ? styles.ringThin : styles.ring,
          d: ellipsePath(o),
        });
        if (form === 'atom') path.style.setProperty('--p-accent', accents[i] ?? accents[0]);
        svg.appendChild(path);
        ringEls.push(path);
      });

      // ── meridian pointer (concentric: top · ecliptic: front/bottom) ──
      if (form !== 'atom') {
        if (form === 'ecliptic') {
          const botY = CY + orbits[N - 1].b;
          svg.appendChild(
            mk('line', { class: styles.meridian, x1: CX, y1: botY + 6, x2: CX, y2: botY + 30 }),
          );
          svg.appendChild(
            mk('path', {
              class: styles.pointer,
              d: `M${CX - 9} ${botY + 34} L${CX + 9} ${botY + 34} L${CX} ${botY + 20} Z`,
            }),
          );
        } else {
          const topY = CY - orbits[N - 1].b;
          svg.appendChild(
            mk('line', { class: styles.meridian, x1: CX, y1: topY - 6, x2: CX, y2: topY - 30 }),
          );
          svg.appendChild(
            mk('path', {
              class: styles.pointer,
              d: `M${CX - 9} ${topY - 34} L${CX + 9} ${topY - 34} L${CX} ${topY - 20} Z`,
            }),
          );
        }
      }

      // ── central ✦ sun / nucleus ──
      const sunScale = form === 'atom' ? 2.2 : 2.9;
      svg.appendChild(mk('circle', { class: styles.sunGlow, cx: CX, cy: CY, r: form === 'atom' ? 42 : 56 }));
      svg.appendChild(
        mk('path', {
          class: styles.sun,
          d: STAR_PATH,
          transform: `translate(${CX - 12 * sunScale} ${CY - 12 * sunScale}) scale(${sunScale})`,
        }),
      );

      // ── orbiting bodies (one per step) ──
      const planets: SVGGElement[] = [];
      for (let i = 0; i < N; i++) {
        const g = mk('g', { class: styles.planet });
        g.style.setProperty('--p-accent', accents[i] ?? accents[0]);
        g.appendChild(mk('circle', { class: styles.planetHalo, cx: 0, cy: 0, r: bodyR * 2 }));
        g.appendChild(mk('circle', { class: styles.planetBody, cx: 0, cy: 0, r: bodyR }));
        svg.appendChild(g);
        planets.push(g);
      }

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        planets.forEach((p, n) => p.classList.toggle(styles.pActive, n === i));
        if (form === 'atom') ringEls.forEach((r, n) => r.classList.toggle(styles.ringActive, n === i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const place = (i: number, progress: number) => {
        const ph = phi(i, progress);
        const p = ellipsePoint(orbits[i], ph);
        let t = `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`;
        if (form === 'ecliptic') {
          const depth = 0.82 + 0.4 * ((Math.sin(ph) + 1) / 2); // front (lower) = larger
          t += ` scale(${depth.toFixed(3)})`;
        }
        planets[i].setAttribute('transform', t);
      };

      const render = (progress: number) => {
        for (let i = 0; i < N; i++) place(i, progress);
        setActive(Math.max(0, Math.min(N - 1, Math.round(progress * (N - 1)))));
      };
      renderRef.current = render;

      // ── reduced motion: rest the bodies spread out, full detail stack ──
      if (reducedMotion) {
        for (let i = 0; i < N; i++) {
          place(i, i / Math.max(1, N - 1));
          planets[i].classList.add(styles.pActive);
        }
        if (form === 'atom') ringEls.forEach((r) => r.classList.add(styles.ringActive));
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
