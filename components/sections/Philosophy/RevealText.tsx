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
    // Extended scroll range (95% to 35%) for smoother, more gradual reveal
    gsap.to(wordElements, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 95%',
        end: 'top 35%',
        scrub: 2, // Higher scrub for smoother interpolation
      },
      opacity: 1,
      stagger: ANIMATION_CONFIG.stagger.words,
      ease: 'power1.out',
    });

    // Animate highlight words to accent color
    // Use ScrollTrigger onUpdate to dynamically interpolate colors based on scroll progress
    const highlightElements = containerRef.current.querySelectorAll(`.${styles.highlight}`);
    const primaryColor = '#1b2028';

    // Helper to interpolate between two hex colors
    const interpolateColor = (color1: string, color2: string, progress: number): string => {
      const hex1 = color1.replace('#', '');
      const hex2 = color2.replace('#', '');
      const r1 = parseInt(hex1.substring(0, 2), 16);
      const g1 = parseInt(hex1.substring(2, 4), 16);
      const b1 = parseInt(hex1.substring(4, 6), 16);
      const r2 = parseInt(hex2.substring(0, 2), 16);
      const g2 = parseInt(hex2.substring(2, 4), 16);
      const b2 = parseInt(hex2.substring(4, 6), 16);
      const r = Math.round(r1 + (r2 - r1) * progress);
      const g = Math.round(g1 + (g2 - g1) * progress);
      const b = Math.round(b1 + (b2 - b1) * progress);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Get current accent color from CSS variable (reads live value)
    const getAccentColor = (): string => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-purple').trim() || '#62b6cb';
    };

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 90%',
      end: 'top 35%',
      scrub: 2, // Match opacity animation smoothness
      onUpdate: (self) => {
        const progress = self.progress;
        const accentColor = getAccentColor(); // Read current accent color on each update
        const totalHighlights = highlightElements.length;
        highlightElements.forEach((el, index) => {
          // Reduced stagger for smoother effect over longer scroll distance
          const staggerDelay = totalHighlights > 1 ? (index / (totalHighlights - 1)) * 0.3 : 0;
          const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
          // Apply easing for smoother color transition
          const easedProgress = adjustedProgress < 0.5
            ? 2 * adjustedProgress * adjustedProgress
            : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2;
          const color = interpolateColor(primaryColor, accentColor, easedProgress);
          (el as HTMLElement).style.color = color;
        });
      },
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
