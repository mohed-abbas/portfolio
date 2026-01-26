'use client';

import { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { content } from '@/data';
import { HeroText } from './HeroText';
import { SkillsBar } from './SkillsBar';
import styles from './Hero.module.css';

const INITIALS = content.welcomeScreen.initials;

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const flyingMRef = useRef<HTMLSpanElement>(null);
  const flyingARef = useRef<HTMLSpanElement>(null);
  const [welcomeDone, setWelcomeDone] = useState(false);

  // Listen for welcome animation completion before enabling scroll animation
  useEffect(() => {
    const onComplete = () => setWelcomeDone(true);
    window.addEventListener('welcome-complete', onComplete, { once: true });

    // Fallback: if welcome already completed (e.g., component remounted)
    const wrapper = document.querySelector('[class*="welcomeWrapper"]');
    if (wrapper && (wrapper as HTMLElement).style.display === 'none') {
      setWelcomeDone(true);
    }

    return () => window.removeEventListener('welcome-complete', onComplete);
  }, []);

  // Scroll-driven initials-to-navbar animation
  useGSAP(() => {
    if (!welcomeDone || !heroRef.current || !spacerRef.current || !flyingMRef.current || !flyingARef.current) return;

    const hero = heroRef.current;
    const spacer = spacerRef.current;
    const flyingM = flyingMRef.current;
    const flyingA = flyingARef.current;

    // Set spacer height: hero visible height + scroll range for animation
    // Tighter range so Philosophy enters right as initials land in navbar
    const scrollRange = window.innerHeight * 1.0;
    spacer.style.height = `${hero.offsetHeight + scrollRange}px`;

    // Query target elements (navbar is at page level, query from document)
    const targetM = document.getElementById('target-m');
    const targetA = document.getElementById('target-a');
    const navBrand = document.getElementById('navbar-brand');
    const navBrandM = document.getElementById('navbar-brand-m');
    const navBrandA = document.getElementById('navbar-brand-a');

    if (!targetM || !targetA || !navBrand || !navBrandM || !navBrandA) return;

    // Query hero content to fade out
    const mohedExps = hero.querySelectorAll('[class*="heroTextMohed"] .portal-expansion');
    const abbasExps = hero.querySelectorAll('[class*="heroTextAbbas"] .portal-expansion');
    const taglineContainer = hero.querySelector('[class*="taglineContainer"]');
    const skillsBar = hero.querySelector('[class*="skillsBar"]');

    // Helper: element offset relative to hero container
    // Since hero is position:fixed at (0,0), this returns viewport coordinates
    const getRelPos = (el: Element) => {
      const r = el.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      return { x: r.left - h.left, y: r.top - h.top };
    };

    // ============================================
    // BUILD MASTER TIMELINE
    // Timeline durations are proportional (0-1 range),
    // scrubbed to scroll progress by ScrollTrigger
    // ============================================
    const tl = gsap.timeline();

    // --- PHASE 0: Snap flying letters to hero letter positions (instant) ---
    tl.to(flyingM, {
      x: () => getRelPos(targetM).x,
      y: () => getRelPos(targetM).y,
      fontSize: () => parseFloat(getComputedStyle(targetM).fontSize),
      duration: 0.001,
    }, 0)
    .to(flyingA, {
      x: () => getRelPos(targetA).x,
      y: () => getRelPos(targetA).y,
      fontSize: () => parseFloat(getComputedStyle(targetA).fontSize),
      duration: 0.001,
    }, 0);

    // --- PHASE 1: Visibility swap (near-instant) ---
    tl.to(flyingM, { opacity: 1, duration: 0.02 }, 0.002)
      .to(flyingA, { opacity: 1, duration: 0.02 }, 0.002)
      .to(targetM, { opacity: 0, duration: 0.02 }, 0.002)
      .to(targetA, { opacity: 0, duration: 0.02 }, 0.002);

    // --- PHASE 2: Pop burst (scale 1 → 1.05) ---
    tl.to(flyingM, { scale: 1.05, duration: 0.04, ease: 'back.out(2)' }, 0.02)
      .to(flyingA, { scale: 1.05, duration: 0.04, ease: 'back.out(2)' }, 0.02);

    // --- PHASE 3: Fade remaining hero letters (staggered) ---
    if (mohedExps.length > 0) {
      tl.to(mohedExps, {
        opacity: 0, stagger: 0.025, duration: 0.12, ease: 'power2.in',
      }, 0.01);
    }
    if (abbasExps.length > 0) {
      tl.to(abbasExps, {
        opacity: 0, stagger: 0.025, duration: 0.12, ease: 'power2.in',
      }, 0.03);
    }

    // --- PHASE 4: Fade tagline + skills bar ---
    if (taglineContainer) {
      tl.to(taglineContainer, { opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.08);
    }
    if (skillsBar) {
      tl.to(skillsBar, { opacity: 0, duration: 0.15, ease: 'power2.in' }, 0.71);
    }

    // --- PHASE 5: Fly + shrink to navbar center (includes scale settle) ---
    tl.to(flyingM, {
      x: () => getRelPos(navBrandM).x,
      y: () => getRelPos(navBrandM).y,
      fontSize: () => parseFloat(getComputedStyle(navBrandM).fontSize),
      scale: 1,
      duration: 0.65,
      ease: 'power2.inOut',
    }, 0.06)
    .to(flyingA, {
      x: () => getRelPos(navBrandA).x,
      y: () => getRelPos(navBrandA).y,
      fontSize: () => parseFloat(getComputedStyle(navBrandA).fontSize),
      scale: 1,
      duration: 0.65,
      ease: 'power2.inOut',
    }, 0.06);

    // --- PHASE 6: Cross-dissolve to navbar brand mark ---
    tl.to(navBrand, { opacity: 1, duration: 0.1, ease: 'power1.inOut' }, 0.71)
      .to([flyingM, flyingA], { opacity: 0, duration: 0.1, ease: 'power1.in' }, 0.71);

    // ============================================
    // SCROLL TRIGGER
    // Drives timeline via spacer scroll, no pin needed.
    // Hero stays fixed; content scrolls over it.
    // ============================================
    ScrollTrigger.create({
      trigger: spacer,
      start: 'top top',
      end: () => `+=${window.innerHeight * 1.0}`,
      scrub: 2,
      animation: tl,
      invalidateOnRefresh: true,
      onRefresh: () => {
        // Recalculate spacer height on resize/refresh
        spacer.style.height = `${hero.offsetHeight + window.innerHeight * 1.0}px`;
      },
    });

    // Ensure positions are calculated after layout is stable
    ScrollTrigger.refresh();

  }, { dependencies: [welcomeDone] });

  return (
    <>
      <main ref={heroRef} className={styles.hero}>
        <HeroText />
        <SkillsBar />

        {/* Flying letter clones for scroll animation */}
        <span ref={flyingMRef} className={styles.flyingLetter} aria-hidden="true">
          {INITIALS.first}
        </span>
        <span ref={flyingARef} className={styles.flyingLetter} aria-hidden="true">
          {INITIALS.last}
        </span>
      </main>

      {/* Scroll spacer: provides document flow height for the fixed hero + animation range */}
      <div ref={spacerRef} className={styles.heroScrollSpacer} />
    </>
  );
}
