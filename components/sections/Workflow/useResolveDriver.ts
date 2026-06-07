'use client';

/* ============================================================
   WORKFLOW · RESOLVE renderer — GSAP driver hook
   A rack-focus stack. The five step names sit as giant display type,
   all in lens blur (the unresolved idea). Scrubbed scroll racks focus
   up the stack: the word reaching the centre reticle snaps tack-sharp
   and accented while its neighbours fall into depth-of-field blur.
   Reuses the proven transit pin (pin viewport once, scrub a 0..1
   progress, preserve scroll on teardown).
   ============================================================ */

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import type { RefObject } from 'react';
import type { TransitLayout } from './layouts';
import styles from './Resolve.module.css';

const PIN_VH = 4;
const STEP_FRAC = 0.17; // vertical gap between words, as a fraction of viewport height
const MAX_BLUR = 16; // px — blur ceiling for far-from-focus words
const BLUR_PER = 13; // px of blur per unit of focus distance

interface DriverOptions {
  layout: TransitLayout;
  accents: string[];
  reducedMotion: boolean;
}

export function useResolveDriver(
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

      const words = gsap.utils.toArray<HTMLElement>('[data-word]', section);
      const details = gsap.utils.toArray<HTMLElement>('[data-step]', section);
      const readout = section.querySelector<HTMLElement>('[data-readout]');
      const N = words.length;
      if (!N) return;
      const totalLabel = String(N).padStart(2, '0');

      // ── reduced motion: legible static stack, every word sharp, no pin ──
      if (reducedMotion) {
        words.forEach((w) => {
          w.style.filter = 'none';
          w.classList.add(styles.wordActive);
        });
        details.forEach((el) => el.classList.add(styles.isActive));
        section.style.setProperty('--wf-live-accent', accents[N - 1] ?? accents[0]);
        if (readout) readout.innerHTML = `<em>${totalLabel}</em> / ${totalLabel}`;
        return;
      }

      let step = viewport.clientHeight * STEP_FRAC;

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
        for (let i = 0; i < N; i++) {
          const d = i - activeFloat;
          const ad = Math.abs(d);
          const y = d * step;
          const blur = Math.min(MAX_BLUR, ad * BLUR_PER);
          const scale = Math.max(0.82, 1.05 - 0.12 * ad);
          const opacity = Math.max(0.1, 1 - 0.5 * ad);
          const w = words[i];
          w.style.transform = `translate(-50%, calc(-50% + ${y}px)) scale(${scale})`;
          w.style.filter = blur > 0.15 ? `blur(${blur}px)` : 'none';
          w.style.opacity = String(opacity);
          w.style.zIndex = String(Math.max(0, Math.round((2 - ad) * 40)));
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
          step = viewport.clientHeight * STEP_FRAC;
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
