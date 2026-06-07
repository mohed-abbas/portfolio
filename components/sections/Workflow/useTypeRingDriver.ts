'use client';

/* ============================================================
   WORKFLOW · TYPE-RING renderer — GSAP driver hook
   Reuses the proven transit pin (pin viewport once, scrub a 0..1
   progress, preserve scroll on teardown). Instead of riding a path,
   it rotates a ring of big display names: progress drives an
   `activeFloat` so each name in turn rises to the top, upright and
   accented, while the centre detail crossfades to match.
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './TypeRing.module.css';

const PIN_VH = 3.6;
const TAU = Math.PI * 2;

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
  reducedMotion: boolean;
}

export function useTypeRingDriver(
  sectionRef: RefObject<HTMLElement | null>,
  { layout, accents, reducedMotion }: DriverOptions,
) {
  const renderRef = useRef<(progress: number) => void>(() => {});
  const progressRef = useRef(0);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const viewport = section?.querySelector<HTMLElement>('[data-viewport]');
      if (!section || !viewport) return;

      const words = gsap.utils.toArray<HTMLElement>('[data-word]', section);
      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const N = words.length;
      if (!N) return;
      const totalLabel = String(N).padStart(2, '0');
      const radiusFrac = layout.ring?.radiusFrac ?? 0.34;

      // ── reduced motion: legible static stack, no pin ──
      if (reducedMotion) {
        words.forEach((w) => w.classList.add(styles.wordActive));
        details.forEach((el) => el.classList.add(styles.isActive));
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        return;
      }

      // Ring radius, recomputed on refresh (resize / orientation change).
      let R = Math.min(viewport.clientWidth, viewport.clientHeight) * radiusFrac;

      let activeIndex = -1;
      const setActive = (i: number) => {
        if (i === activeIndex) return;
        activeIndex = i;
        words.forEach((w, n) => w.classList.toggle(styles.wordActive, n === i));
        details.forEach((el, n) => el.classList.toggle(styles.isActive, n === i));
        section.style.setProperty('--wf-live-accent', accents[i] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${String(i + 1).padStart(2, '0')}</em> / ${totalLabel}`;
      };

      const render = (progress: number) => {
        const activeFloat = progress * (N - 1);
        const offset = -activeFloat * (TAU / N);
        for (let i = 0; i < N; i++) {
          const screen = i * (TAU / N) + offset;
          const x = R * Math.sin(screen);
          const y = -R * Math.cos(screen);
          const t = (Math.cos(screen) + 1) / 2; // 1 at top, 0 at bottom
          const scale = 0.5 + 0.85 * t * t;
          const w = words[i];
          w.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
          w.style.opacity = String(0.12 + 0.88 * t * t);
          w.style.zIndex = String(Math.round(t * 100));
        }
        setActive(Math.max(0, Math.min(N - 1, Math.round(activeFloat))));
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
          R = Math.min(viewport.clientWidth, viewport.clientHeight) * radiusFrac;
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
