'use client';

import { Fragment, useCallback, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { cursorBus } from '@/lib/cursorBus';
import { MetaLabel } from '@/components/ui/MetaLabel';
import { content } from '@/data';
import styles from './Hero.module.css';

// ── Tuning (file-local) ──
// Spotlight cursor radius (px) for the RUN IT. reveal — matches the home
// tagline so the flourish reads as the same motion language.
const SPOTLIGHT_SIZE = 80;
// yPercent the verb-line inners sit at before they rise into view.
const LINE_HIDE_YPCT = 110;
// Item rendered in the accent color (grounded fact, see content.about.meta).
const ACCENT_META = 'Currently building TASKTROX';

export function AboutHero() {
  const { label, verbs, lede, meta } = content.about;
  const statement = verbs.join(' ');
  const lastIndex = verbs.length - 1;

  const reducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLHeadingElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  // Spotlight plumbing for the final verb line. Mirrors HeroText: cursor
  // position comes from the shared cursorBus, and a gsap.ticker callback is
  // attached only while hovering (zero idle cost).
  const spotlightRef = useRef<HTMLSpanElement>(null);
  const cachedRect = useRef<DOMRect | null>(null);
  const spotlightTick = useRef<(() => void) | null>(null);
  const spotlightActive = useRef(false);
  const updateRectRef = useRef<(() => void) | null>(null);

  // ── ON-LOAD ENTRANCE ──
  // Each verb line sits inside an overflow:hidden mask; its inner rises from
  // yPercent:110 → 0 with a per-line stagger, then the label, lede and meta
  // fade up. Hiding happens INSIDE the no-preference block so reduced-motion
  // users get the final state with no flash (useGSAP runs pre-paint).
  useGSAP(
    () => {
      const stack = stackRef.current;
      if (!stack) return;
      const inners = stack.querySelectorAll<HTMLElement>(`.${styles.lineInner}`);
      if (!inners.length) return;

      const supporting = [labelRef.current, ledeRef.current, metaRef.current];
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(inners, { yPercent: LINE_HIDE_YPCT });
        gsap.set(supporting, { autoAlpha: 0, y: 16 });

        const tl = gsap.timeline();
        tl.to(labelRef.current, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        }, 0);
        tl.to(inners, {
          yPercent: 0,
          duration: 0.9,
          ease: 'expo.out',
          stagger: 0.09,
        }, 0.15);
        tl.to([ledeRef.current, metaRef.current], {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.12,
        }, '>-0.35');

        return () => {
          tl.kill();
          gsap.set(inners, { clearProps: 'transform' });
          gsap.set(supporting, { clearProps: 'opacity,visibility,transform' });
        };
      });
    },
    { scope: sectionRef, dependencies: [reducedMotion] }
  );

  // ── SPOTLIGHT SETUP ── store the ticker callback + keep the cached rect
  // fresh on resize. The ticker is only added on pointerenter (below).
  useGSAP(
    () => {
      const el = spotlightRef.current;
      if (!el) return;

      const updateRect = () => {
        cachedRect.current = el.getBoundingClientRect();
      };
      updateRect();
      updateRectRef.current = updateRect;
      window.addEventListener('resize', updateRect);

      spotlightTick.current = () => {
        if (!cachedRect.current) return;
        const x = cursorBus.x - cachedRect.current.left;
        const y = cursorBus.y - cachedRect.current.top;
        el.style.setProperty('--spotlight-x', `${x}px`);
        el.style.setProperty('--spotlight-y', `${y}px`);
      };

      return () => {
        if (spotlightActive.current && spotlightTick.current) {
          gsap.ticker.remove(spotlightTick.current);
          spotlightActive.current = false;
        }
        el.classList.remove(styles.spotlightActive);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
        updateRectRef.current = null;
      };
    },
    { scope: sectionRef }
  );

  const handleSpotlightEnter = useCallback(() => {
    // No spotlight under reduced motion.
    if (reducedMotion) return;
    const el = spotlightRef.current;
    if (!el) return;

    el.style.setProperty('--spotlight-size', `${SPOTLIGHT_SIZE}px`);
    el.classList.add(styles.spotlightActive);

    if (updateRectRef.current) {
      updateRectRef.current();
      window.addEventListener('scroll', updateRectRef.current, { passive: true });
    }
    if (!spotlightActive.current && spotlightTick.current) {
      gsap.ticker.add(spotlightTick.current);
      spotlightActive.current = true;
    }
    window.dispatchEvent(
      new CustomEvent('tagline-spotlight-enter', { detail: { size: SPOTLIGHT_SIZE * 2 } })
    );
  }, [reducedMotion]);

  const handleSpotlightLeave = useCallback(() => {
    const el = spotlightRef.current;
    if (!el) return;

    el.style.setProperty('--spotlight-size', '0px');
    el.classList.remove(styles.spotlightActive);

    if (spotlightActive.current && spotlightTick.current) {
      gsap.ticker.remove(spotlightTick.current);
      spotlightActive.current = false;
    }
    if (updateRectRef.current) {
      window.removeEventListener('scroll', updateRectRef.current);
    }
    window.dispatchEvent(new CustomEvent('tagline-spotlight-leave'));
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero} id="about">
      <div className={styles.inner}>
        <MetaLabel ref={labelRef} className={styles.metaLabel}>
          {label}
        </MetaLabel>

        <h1 className={styles.stack} ref={stackRef} aria-label={statement}>
          {verbs.map((verb, i) =>
            i === lastIndex ? (
              <span key={i} className={styles.lineMask} aria-hidden="true">
                <span
                  ref={spotlightRef}
                  className={`${styles.lineInner} ${styles.spotlightLine}`}
                  onMouseEnter={handleSpotlightEnter}
                  onMouseLeave={handleSpotlightLeave}
                >
                  <span className={styles.spotlightBg} aria-hidden="true" />
                  <span className={`${styles.lineLayer} ${styles.lineBase}`}>{verb}</span>
                  <span className={`${styles.lineLayer} ${styles.lineReveal}`} aria-hidden="true">
                    {verb}
                  </span>
                </span>
              </span>
            ) : (
              <span key={i} className={styles.lineMask} aria-hidden="true">
                <span className={styles.lineInner}>{verb}</span>
              </span>
            )
          )}
        </h1>

        <p ref={ledeRef} className={styles.lede}>
          {lede}
        </p>

        <div ref={metaRef} className={styles.meta}>
          {meta.map((item, i) => (
            <Fragment key={item}>
              <span
                className={
                  item === ACCENT_META
                    ? `${styles.metaItem} ${styles.metaAccent}`
                    : styles.metaItem
                }
              >
                {item}
              </span>
              {i < meta.length - 1 && (
                <span className={styles.metaDot} aria-hidden="true">
                  ·
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
