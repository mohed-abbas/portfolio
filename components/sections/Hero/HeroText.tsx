'use client';

import { useRef } from 'react';
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

// Tagline words for staggered animation
const TAGLINE_WORDS = ['I', 'design', 'solutions', 'for', 'people,', 'brands', '&', 'digital', 'products'];

export function HeroText() {
  const sectionRef = useRef<HTMLElement>(null);
  const mohedRef = useRef<HTMLHeadingElement>(null);
  const abbasRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !mohedRef.current || !abbasRef.current || !taglineRef.current) return;

    const mohedLetters = mohedRef.current.querySelectorAll(`.${styles.letter}`);
    const abbasLetters = abbasRef.current.querySelectorAll(`.${styles.abbasLetter}`);
    const taglineWords = taglineRef.current.querySelectorAll(`.${styles.taglineWord}`);

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
    // Tagline: Word-by-word reveal with funky stagger
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
      '-=0.2' // Overlap with end of ABBAS animation
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

      {/* Tagline - Word by word for stagger animation */}
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
