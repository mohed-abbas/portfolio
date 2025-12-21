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

    // MOHED: Letter-by-letter reveal - snappy but smooth
    tl.fromTo(
      mohedLetters,
      {
        opacity: 0,
        y: 70,
        rotateX: -75,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.7,
        stagger: 0.09,
        ease: 'back.out(1.4)',
      }
    )
    // ABBAS: Funky bounce - snappy with personality
    .fromTo(
      abbasLetters,
      {
        opacity: 0,
        y: 100,
        scaleY: 0.4,
        scaleX: 1.3,
        skewX: -15,
        rotate: -10,
      },
      {
        opacity: 1,
        y: 0,
        scaleY: 1,
        scaleX: 1,
        skewX: 0,
        rotate: 0,
        duration: 0.75,
        stagger: {
          each: 0.08,
          ease: 'power2.out',
        },
        ease: 'elastic.out(1, 0.6)', // Funky but controlled bounce
      },
      '-=0.35'
    )
    // Hand: Snappy spring pop
    .fromTo(
      handRef.current,
      {
        opacity: 0,
        scale: 0,
        yPercent: 25,
        rotate: -12,
        transformOrigin: 'center bottom',
      },
      {
        opacity: 1,
        scale: 1.12,
        yPercent: -6,
        rotate: 6,
        duration: 0.4,
        ease: 'back.out(2.2)',
      },
      '+=0.05'
    )
    // Quick spring settle
    .to(handRef.current, {
      scale: 0.94,
      yPercent: 2,
      rotate: -5,
      duration: 0.14,
      ease: 'power2.inOut',
    })
    .to(handRef.current, {
      scale: 1.06,
      yPercent: -3,
      rotate: 4,
      duration: 0.12,
      ease: 'power2.inOut',
    })
    .to(handRef.current, {
      scale: 1,
      yPercent: 0,
      rotate: 0,
      duration: 0.3,
      ease: 'elastic.out(0.8, 0.5)',
    })
    // Funky wave - snappy but fluid
    .to(handRef.current, {
      keyframes: [
        { rotate: 32, scaleX: 1.12, scaleY: 0.9, duration: 0.2 },
        { rotate: -28, scaleX: 0.9, scaleY: 1.1, duration: 0.24 },
        { rotate: 26, scaleX: 1.1, scaleY: 0.92, duration: 0.22 },
        { rotate: -22, scaleX: 0.92, scaleY: 1.08, duration: 0.2 },
        { rotate: 18, scaleX: 1.06, scaleY: 0.95, duration: 0.18 },
        { rotate: -12, scaleX: 0.95, scaleY: 1.05, duration: 0.16 },
        { rotate: 8, scaleX: 1.03, scaleY: 0.98, duration: 0.14 },
        { rotate: -4, scaleX: 0.98, scaleY: 1.02, duration: 0.12 },
      ],
      ease: 'sine.inOut',
    })
    // Final settle
    .to(handRef.current, {
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 0.9,
      ease: 'elastic.out(0.6, 0.25)',
    })
    // Tagline fades up
    .fromTo(
      taglineRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
      },
      '-=1.4'
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
