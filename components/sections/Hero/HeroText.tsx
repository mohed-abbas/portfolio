'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import styles from './HeroText.module.css';

const MOHED_LETTERS = ['M', 'O', 'H', 'E', 'D'];

// ABBAS letters with their color classes
const ABBAS_LETTERS = [
  { letter: 'A', color: 'dark' },
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

    const taglineWords = taglineRef.current.querySelectorAll(`.${styles.taglineWord}`);

    // Set initial state for tagline only
    gsap.set(taglineWords, { opacity: 0 });

    // The Mohed and Abbas text are now static (opacity 1 by CSS/default) so they are ready for the "Travel" handoff.

    const startAnimation = () => {
      const tl = gsap.timeline({
        defaults: {
          ease: 'power3.out',
        },
      });

      // Only animate the tagline now
      tl.fromTo(
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
        }
      );
    };

    window.addEventListener('welcome-complete', startAnimation);
    return () => window.removeEventListener('welcome-complete', startAnimation);
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.textAndArm}>
      {/* MOHED Text - Split into letters for stagger animation */}
      <h1 ref={mohedRef} className={`${styles.heroText} ${styles.heroTextMohed}`}>
        {MOHED_LETTERS.map((letter, index) => (
          <span 
            key={index} 
            className={styles.letter}
            id={index === 0 ? "target-m" : undefined}
          >
            {letter}
          </span>
        ))}
      </h1>

      {/* ABBAS Text - Letter by letter with colors */}
      <h1 ref={abbasRef} className={`${styles.heroText} ${styles.heroTextAbbas}`}>
        {ABBAS_LETTERS.map((item, index) => (
          <span
            key={index}
            id={index === 0 ? "target-a" : undefined}
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
