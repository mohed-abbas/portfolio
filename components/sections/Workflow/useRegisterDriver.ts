'use client';

/* ============================================================
   WORKFLOW · REGISTER renderer — GSAP driver hook
   Chromatic convergence. Each step name is three colour separations
   (teal / red / orange) that start out of register and converge to a
   single solid in-register word across the step's scroll fraction;
   registration crosshairs click into the corners on lock. Reuses the
   proven transit pin (pin viewport once, scrub 0..1, preserve scroll).
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Register.module.css';

const PIN_VH = 4;
const MAX_SPREAD = 48; // px of channel misregistration at the start of a step
const MARK_SPREAD = 64; // px the corner crosshairs travel before they lock

// channel drift directions (unit-ish), one per separation
const DIRS: Array<[number, number]> = [
  [-1, -0.55], // teal
  [0.92, -0.3], // red
  [0.1, 1.0], // orange
];
// corner crosshair diagonals
const CORNERS: Array<[number, number]> = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const easeOutCubic = (f: number) => 1 - Math.pow(1 - f, 3);

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
  reducedMotion: boolean;
}

export function useRegisterDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { accents, reducedMotion }: DriverOptions,
) {
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = section?.querySelector<HTMLElement>('[data-viewport]');
      if (!section || !viewport) return;

      const groups = gsap.utils.toArray<HTMLElement>('[data-group]', section);
      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const marks = gsap.utils.toArray<HTMLElement>('[data-marks] > *', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const N = groups.length;
      if (!N) return;
      const totalLabel = String(N).padStart(2, '0');

      const chans = groups.map((g) =>
        Array.from(g.querySelectorAll<HTMLElement>('[data-chan]')),
      );
      const solids = groups.map((g) => g.querySelector<HTMLElement>('[data-solid]'));

      // ── reduced motion: every solid in register, channels hidden, no pin ──
      if (reducedMotion) {
        groups.forEach((g) => g.classList.add(styles.isActive));
        chans.forEach((set) => set.forEach((c) => (c.style.opacity = '0')));
        solids.forEach((s) => s && (s.style.opacity = '1'));
        details.forEach((el) => el.classList.add(styles.isActive));
        marks.forEach((m) => (m.style.opacity = '0'));
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        return;
      }

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        groups.forEach((g, n) => g.classList.toggle(styles.isActive, n === i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const render = (progress: number) => {
        const seg = progress * N;
        const idx = Math.max(0, Math.min(N - 1, Math.floor(seg)));
        const f = clamp01(seg - idx);

        const conv = easeOutCubic(f); // 0 spread → 1 locked
        const spread = MAX_SPREAD * (1 - conv);
        const solidOpacity = clamp01((f - 0.62) / 0.38);
        const chanOpacity = 0.95 * (1 - solidOpacity);

        const set = chans[idx];
        for (let c = 0; c < set.length; c++) {
          const [dx, dy] = DIRS[c] ?? [0, 0];
          const rot = (c - 1) * spread * 0.05;
          set[c].style.transform = `translate(${dx * spread}px, ${dy * spread}px) rotate(${rot}deg)`;
          set[c].style.opacity = String(chanOpacity);
        }
        const solid = solids[idx];
        if (solid) solid.style.opacity = String(solidOpacity);

        const markProg = clamp01((f - 0.2) / 0.8);
        const off = (1 - markProg) * MARK_SPREAD;
        marks.forEach((m, n) => {
          const [sx, sy] = CORNERS[n] ?? [0, 0];
          m.style.transform = `translate(${sx * off}px, ${sy * off}px)`;
          m.style.opacity = String(markProg);
        });

        setActive(idx);
      };
      renderRef.current = render;
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
        window.scrollTo(0, y);
      };
    },
    { scope: sectionRef, dependencies: [reducedMotion] },
  );
}
