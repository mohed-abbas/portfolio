'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import styles from './HeroText.module.css';

const MOHED_LETTERS = ['M', 'O', 'H', 'E', 'D'];
const ABBAS_LETTERS = [
  { letter: 'A', color: 'dark' },
  { letter: 'B', color: 'purple' },
  { letter: 'B', color: 'dark' },
  { letter: 'A', color: 'dark' },
  { letter: 'S', color: 'purple' },
];
const TAGLINE_WORDS = ['I', 'design', 'solutions', 'for', 'people,', 'brands', '&', 'digital', 'products'];

export function HeroText() {
  const sectionRef = useRef<HTMLElement>(null);
  const mohedRef = useRef<HTMLHeadingElement>(null);
  const abbasRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);

  useGSAP(() => {
    if (!sectionRef.current || !mohedRef.current || !abbasRef.current || !taglineRef.current) return;

    // 1. Select Elements
    // Mohed: M is index 0 (Target), OHED are indices 1-4 (Expansion)
    const mohedExpansion = mohedRef.current.querySelectorAll(`.${styles.letter}:not(#target-m)`);
    
    // Abbas: A is index 0 (Target), BBAS are indices 1-4 (Expansion)
    const abbasExpansion = abbasRef.current.querySelectorAll(`.${styles.abbasLetter}:not(#target-a)`);

    const taglineWords = taglineRef.current.querySelectorAll(`.${styles.taglineWord}`);

    // 2. Initial States
    // Hide expansion letters so they can "grow" from the initials
    gsap.set([mohedExpansion, abbasExpansion], { 
      opacity: 0, 
      x: -30, // Start slightly to the left (inside the initial)
      filter: 'blur(5px)'
    });

    // Hide Tagline
    gsap.set(taglineWords, { opacity: 0 });

    // HIDE TARGETS INITIALLY for Soft Handoff
    // The targets (M and A) are now hidden until the flying letters "deliver" them.
    const targetM = mohedRef.current.querySelector('#target-m');
    const targetA = abbasRef.current.querySelector('#target-a');
    gsap.set([targetM, targetA], { opacity: 0 });

    const startAnimation = () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      // 1. Soft Handoff (Cross-Dissolve)
      // Fade IN the static targets as the flying ones fade OUT (handled in WelcomeScreen)
      tl.to([targetM, targetA], {
        opacity: 1,
        duration: 0.3,
        ease: "power1.inOut" // Linear-ish for smooth blend
      })

      // 2. Expansion Animation (The Seamless Handoff)
      // M and A have landed. Now reveal OHED and BBAS.
      .to([mohedExpansion, abbasExpansion], {
        opacity: 1,
        x: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.05, // Domino effect
      }, ">-0.1") // Start expansion just as the handoff finishes

      // 3. Tagline Animation
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
        "-=0.4" // Overlap slightly with the end of the name expansion
      );
    };

    // Listen for 'welcome-handoff' instead of 'welcome-complete' to start the blend earlier
    window.addEventListener('welcome-handoff', startAnimation);
    return () => window.removeEventListener('welcome-handoff', startAnimation);
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.textAndArm}>
      {/* MOHED Text */}
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

      {/* ABBAS Text */}
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