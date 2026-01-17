'use client';

import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, ANIMATION_CONFIG } from '@/lib/gsap';
import styles from './RevealText.module.css';

interface RevealTextProps {
  text: string;
  highlights: string[];
}

export function RevealText({ text, highlights }: RevealTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);

  // Split text into words and determine which should be highlighted
  const words = useMemo(() => {
    return text.split(' ').map((word, index) => {
      // Check if this word (without punctuation) should be highlighted
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const isHighlight = highlights.some(h => h.toLowerCase() === cleanWord);
      return { word, index, isHighlight };
    });
  }, [text, highlights]);

  useGSAP(() => {
    if (!containerRef.current) return;

    const wordElements = containerRef.current.querySelectorAll(`.${styles.word}`);

    // Create scroll-triggered animation for word reveal
    gsap.to(wordElements, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: 1,
      },
      opacity: 1,
      stagger: ANIMATION_CONFIG.stagger.words,
      ease: 'none',
    });

    // Animate highlight words to accent color
    const highlightElements = containerRef.current.querySelectorAll(`.${styles.highlight}`);
    gsap.to(highlightElements, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 50%',
        end: 'bottom 60%',
        scrub: 1,
      },
      color: 'var(--color-accent-purple)',
      stagger: ANIMATION_CONFIG.stagger.words * 2,
      ease: 'none',
    });

  }, { scope: containerRef, dependencies: [words] });

  return (
    <h2 ref={containerRef} className={styles.statementText}>
      {words.map(({ word, index, isHighlight }) => (
        <span
          key={index}
          className={`${styles.word} ${isHighlight ? styles.highlight : ''}`}
        >
          {word}
        </span>
      ))}
    </h2>
  );
}
