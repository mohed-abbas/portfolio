'use client';

import { useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import styles from './HeroText.module.css';

// ============================================
// CONSTANTS
// ============================================

const MOHED_LETTERS = ['M', 'O', 'H', 'E', 'D'];
const ABBAS_LETTERS = [
  { letter: 'A', color: 'dark' },
  { letter: 'B', color: 'purple' },
  { letter: 'B', color: 'dark' },
  { letter: 'A', color: 'dark' },
  { letter: 'S', color: 'purple' },
];
const TAGLINE_WORDS = ['I', 'design', 'solutions', 'for', 'people,', 'brands', '&', 'digital', 'products'];

// Portal animation directions
type Direction = 'up' | 'down' | 'left' | 'right';
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

// Get random direction
const getRandomDirection = (): Direction => {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
};

// Get transform values for a direction
const getDirectionTransform = (direction: Direction, distance: number = 100) => {
  switch (direction) {
    case 'up':
      return { x: 0, y: -distance };
    case 'down':
      return { x: 0, y: distance };
    case 'left':
      return { x: -distance, y: 0 };
    case 'right':
      return { x: distance, y: 0 };
  }
};

// Get opposite direction
const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
};

// ============================================
// PORTAL ANIMATION FUNCTION
// ============================================

/**
 * Triggers the infinite portal loop animation on a letter element
 * 1. Slide out in random direction (Power2.in - accelerating)
 * 2. Instantly teleport to opposite side
 * 3. Slide back in (Power2.out - decelerating snap)
 */
const triggerPortalLoop = (letterElement: HTMLElement) => {
  // Prevent overlapping animations
  if (gsap.isTweening(letterElement)) return;

  const direction = getRandomDirection();
  const exitTransform = getDirectionTransform(direction, 110); // 110% to fully exit
  const entryTransform = getDirectionTransform(getOppositeDirection(direction), 110);

  const tl = gsap.timeline();

  // Phase 1: Slide OUT (accelerating exit)
  tl.to(letterElement, {
    x: exitTransform.x + '%',
    y: exitTransform.y + '%',
    duration: 0.25,
    ease: 'power2.in',
  })
  // Phase 2: Instant teleport to opposite side
  .set(letterElement, {
    x: entryTransform.x + '%',
    y: entryTransform.y + '%',
  })
  // Phase 3: Slide back IN (decelerating snap)
  .to(letterElement, {
    x: '0%',
    y: '0%',
    duration: 0.35,
    ease: 'power2.out',
  });
};

// ============================================
// COMPONENT
// ============================================

export function HeroText() {
  const sectionRef = useRef<HTMLElement>(null);
  const mohedRef = useRef<HTMLHeadingElement>(null);
  const abbasRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  // Handle hover on portal letters
  const handleLetterHover = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const portalLetter = e.currentTarget.querySelector(`.${styles.portalLetter}`) as HTMLElement;
    if (portalLetter) {
      triggerPortalLoop(portalLetter);
    }
  }, []);

  useGSAP(() => {
    if (!sectionRef.current || !mohedRef.current || !abbasRef.current || !taglineRef.current) return;

    // 1. Select Elements
    // Target initials (M and A) - these fade in during handoff
    const targetM = mohedRef.current.querySelector('#target-m');
    const targetA = abbasRef.current.querySelector('#target-a');

    // Expansion letters (OHED and BBAS) - these use portal animation
    const mohedExpansionMasks = mohedRef.current.querySelectorAll('.portal-expansion');
    const abbasExpansionMasks = abbasRef.current.querySelectorAll('.portal-expansion');

    // Get the inner portal letters for animation
    const mohedExpansionLetters = Array.from(mohedExpansionMasks).map(
      mask => mask.querySelector(`.${styles.portalLetter}`)
    ).filter(Boolean) as HTMLElement[];

    const abbasExpansionLetters = Array.from(abbasExpansionMasks).map(
      mask => mask.querySelector(`.${styles.portalLetter}`)
    ).filter(Boolean) as HTMLElement[];

    const taglineWords = taglineRef.current.querySelectorAll(`.${styles.taglineWord}`);

    // 2. Initial States
    // Hide expansion masks initially
    gsap.set([mohedExpansionMasks, abbasExpansionMasks], {
      opacity: 0,
    });

    // Position expansion letters outside their masks (for portal entry)
    mohedExpansionLetters.forEach(letter => {
      const direction = getRandomDirection();
      const startTransform = getDirectionTransform(direction, 110);
      gsap.set(letter, {
        x: startTransform.x + '%',
        y: startTransform.y + '%',
      });
    });

    abbasExpansionLetters.forEach(letter => {
      const direction = getRandomDirection();
      const startTransform = getDirectionTransform(direction, 110);
      gsap.set(letter, {
        x: startTransform.x + '%',
        y: startTransform.y + '%',
      });
    });

    // Hide Tagline
    gsap.set(taglineWords, { opacity: 0 });

    // HIDE TARGETS INITIALLY for Soft Handoff
    gsap.set([targetM, targetA], { opacity: 0 });

    const startAnimation = () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      // 1. Soft Handoff (Cross-Dissolve)
      // Fade IN the static targets as the flying ones fade OUT
      tl.to([targetM, targetA], {
        opacity: 1,
        duration: 0.3,
        ease: "power1.inOut"
      })

      // 2. Reveal expansion masks
      .to([mohedExpansionMasks, abbasExpansionMasks], {
        opacity: 1,
        duration: 0.01,
      }, ">-0.1")

      // 3. Portal Slide-In Animation for OHED
      .add(() => {
        mohedExpansionLetters.forEach((letter, index) => {
          gsap.to(letter, {
            x: '0%',
            y: '0%',
            duration: 0.5,
            delay: index * 0.08,
            ease: 'power2.out',
          });
        });
      }, "<")

      // 4. Portal Slide-In Animation for BBAS (slight offset)
      .add(() => {
        abbasExpansionLetters.forEach((letter, index) => {
          gsap.to(letter, {
            x: '0%',
            y: '0%',
            duration: 0.5,
            delay: index * 0.08 + 0.1,
            ease: 'power2.out',
          });
        });
      }, "<+0.05")

      // 5. Tagline Animation
      .fromTo(
        taglineWords,
        {
          opacity: 0,
          y: 40,
          rotateX: -60,
          scale: 0.8,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          stagger: {
            each: 0.06,
            ease: 'power2.out',
          },
          ease: 'back.out(1.2)',
        },
        "-=0.3"
      );
    };

    // Listen for 'welcome-handoff' to start the animation
    window.addEventListener('welcome-handoff', startAnimation);
    return () => window.removeEventListener('welcome-handoff', startAnimation);
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.textAndArm}>
      {/* MOHED Text */}
      <h1 ref={mohedRef} className={`${styles.heroText} ${styles.heroTextMohed}`}>
        {MOHED_LETTERS.map((letter, index) => {
          const isTarget = index === 0;

          if (isTarget) {
            // M - Target letter (just fades in, also has portal on hover)
            return (
              <span
                key={index}
                className={`${styles.letter} ${styles.portalMask}`}
                id="target-m"
                onMouseEnter={handleLetterHover}
              >
                <span className={styles.portalLetter}>{letter}</span>
              </span>
            );
          }

          // O, H, E, D - Expansion letters with portal animation
          return (
            <span
              key={index}
              className={`${styles.letter} ${styles.portalMask} portal-expansion`}
              onMouseEnter={handleLetterHover}
            >
              <span className={styles.portalLetter}>{letter}</span>
            </span>
          );
        })}
      </h1>

      {/* ABBAS Text */}
      <h1 ref={abbasRef} className={`${styles.heroText} ${styles.heroTextAbbas}`}>
        {ABBAS_LETTERS.map((item, index) => {
          const isTarget = index === 0;
          const colorClass = item.color === 'purple' ? styles.textPurple : styles.textDark;

          if (isTarget) {
            // A - Target letter
            return (
              <span
                key={index}
                id="target-a"
                className={`${styles.abbasLetter} ${styles.portalMask} ${colorClass}`}
                onMouseEnter={handleLetterHover}
              >
                <span className={styles.portalLetter}>{item.letter}</span>
              </span>
            );
          }

          // B, B, A, S - Expansion letters with portal animation
          return (
            <span
              key={index}
              className={`${styles.abbasLetter} ${styles.portalMask} ${colorClass} portal-expansion`}
              onMouseEnter={handleLetterHover}
            >
              <span className={styles.portalLetter}>{item.letter}</span>
            </span>
          );
        })}
      </h1>

      {/* Tagline */}
      <p ref={taglineRef} className={styles.tagline}>
        {TAGLINE_WORDS.map((word, index) => (
          <span key={index} className={styles.taglineWord}>
            {word}
          </span>
        ))}
      </p>
    </section>
  );
}
