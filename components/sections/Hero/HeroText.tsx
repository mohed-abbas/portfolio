'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import styles from './HeroText.module.css';

const MOHED_LETTERS = ['M', 'O', 'H', 'E', 'D'];

// ABBAS letters with their color classes
const ABBAS_LETTERS = [
  { letter: 'A', color: 'purple' },
  { letter: 'B', color: 'purple' },
  { letter: 'B', color: 'dark' },
  { letter: 'A', color: 'dark' },
  { letter: 'S', color: 'purple' },
];

export function HeroText() {
  const sectionRef = useRef<HTMLElement>(null);
  const mohedRef = useRef<HTMLHeadingElement>(null);
  const abbasRef = useRef<HTMLHeadingElement>(null);
  const handRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !mohedRef.current || !abbasRef.current) return;

    const mohedLetters = mohedRef.current.querySelectorAll(`.${styles.letter}`);
    const abbasLetters = abbasRef.current.querySelectorAll(`.${styles.abbasLetter}`);

    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
      delay: 0.3,
    });

    // MOHED: Letter-by-letter reveal from left to right
    tl.fromTo(
      mohedLetters,
      {
        opacity: 0,
        y: 80,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'back.out(1.2)',
      }
    )
    // ABBAS: Letter-by-letter with bounce and funk
    .fromTo(
      abbasLetters,
      {
        opacity: 0,
        y: 120,
        scaleY: 0.3,
        scaleX: 1.4,
        skewX: -20,
        rotate: -15,
      },
      {
        opacity: 1,
        y: 0,
        scaleY: 1,
        scaleX: 1,
        skewX: 0,
        rotate: 0,
        duration: 0.7,
        stagger: {
          each: 0.1,
          ease: 'power2.out',
        },
        ease: 'elastic.out(1, 0.4)', // Bouncy funky landing
      },
      '-=0.3'
    )
    // Hand: Compressed spring popping out from behind the "B"
    // Starts small and hidden at bottom of its container (near the B)
    .fromTo(
      handRef.current,
      {
        opacity: 0,
        scale: 0,     // Start completely hidden
        yPercent: 30, // Slightly below (as if tucked behind B)
        rotate: -15,
        transformOrigin: 'center bottom', // Grow upward from bottom
      },
      {
        opacity: 1,
        scale: 1.15,  // Overshoot size
        yPercent: -8, // Spring up past rest position
        rotate: 8,
        duration: 0.35,
        ease: 'back.out(2.5)', // Snappy pop with overshoot
      },
      '+=0.05' // Quick pause after ABBAS completes
    )
    // Spring settle with wobble - back to original position
    .to(handRef.current, {
      scale: 0.92,
      yPercent: 3,
      rotate: -6,
      duration: 0.12,
      ease: 'power2.inOut',
    })
    .to(handRef.current, {
      scale: 1.08,
      yPercent: -4,
      rotate: 4,
      duration: 0.1,
      ease: 'power2.inOut',
    })
    .to(handRef.current, {
      scale: 1,
      yPercent: 0,  // Back to CSS-defined position
      rotate: 0,
      duration: 0.25,
      ease: 'elastic.out(1, 0.4)',
    })
    // Hand: Loose springy wave
    .to(handRef.current, {
      keyframes: [
        { rotate: 35, scaleX: 1.15, scaleY: 0.9, duration: 0.18 },
        { rotate: -30, scaleX: 0.88, scaleY: 1.12, duration: 0.22 },
        { rotate: 32, scaleX: 1.12, scaleY: 0.92, duration: 0.2 },
        { rotate: -28, scaleX: 0.9, scaleY: 1.1, duration: 0.2 },
        { rotate: 25, scaleX: 1.08, scaleY: 0.94, duration: 0.18 },
        { rotate: -18, scaleX: 0.94, scaleY: 1.06, duration: 0.16 },
        { rotate: 12, scaleX: 1.04, scaleY: 0.97, duration: 0.14 },
        { rotate: -8, scaleX: 0.97, scaleY: 1.03, duration: 0.12 },
        { rotate: 5, scaleX: 1.02, scaleY: 0.99, duration: 0.1 },
      ],
      ease: 'sine.inOut',
    })
    // Final wobbly settle
    .to(handRef.current, {
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.8,
      ease: 'elastic.out(0.8, 0.15)',
    })
    // Tagline fades up
    .fromTo(
      taglineRef.current,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=1.5' // Start during the wave
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.textAndArm}>
      {/* MOHED Text - Split into letters for stagger animation */}
      <h1 ref={mohedRef} className={`${styles.heroText} ${styles.heroTextMohed}`}>
        {MOHED_LETTERS.map((letter, index) => (
          <span key={index} className={styles.letter}>
            {letter}
          </span>
        ))}
      </h1>

      {/* ABBAS Text - Letter by letter with colors */}
      <h1 ref={abbasRef} className={`${styles.heroText} ${styles.heroTextAbbas}`}>
        {ABBAS_LETTERS.map((item, index) => (
          <span
            key={index}
            className={`${styles.abbasLetter} ${
              item.color === 'purple' ? styles.textPurple : styles.textDark
            }`}
          >
            {item.letter}
          </span>
        ))}
      </h1>

      {/* Hand Illustration - Springs out like compressed spring */}
      <div ref={handRef} className={styles.handIllustration}>
        <Image
          src="/images/hero/cartoon-arm.svg"
          alt="Waving hand illustration"
          width={300}
          height={300}
          priority
        />
      </div>

      {/* Tagline */}
      <p ref={taglineRef} className={styles.tagline}>
        I design solutions for people, brands &amp; digital products
      </p>
    </section>
  );
}
