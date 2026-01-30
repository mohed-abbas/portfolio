'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ScrollTrigger, ANIMATION_CONFIG } from '@/lib/gsap';
import styles from './RevealText.module.css';
import { useAccentColor } from '@/lib/AccentColorContext';

interface RevealTextProps {
  text: string;
  highlights: string[];
}

// ============================================
// PORTAL ANIMATION UTILITIES
// ============================================

type Direction = 'up' | 'down' | 'left' | 'right';
const DIRECTIONS: Direction[] = ['up', 'down', 'left', 'right'];

const getRandomDirection = (): Direction => {
  return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
};

const getDirectionTransform = (direction: Direction, distance: number = 100) => {
  switch (direction) {
    case 'up': return { x: 0, y: -distance };
    case 'down': return { x: 0, y: distance };
    case 'left': return { x: -distance, y: 0 };
    case 'right': return { x: distance, y: 0 };
  }
};

const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
};

// Single portal loop animation for a letter
const triggerPortalLoop = (letterElement: HTMLElement) => {
  if (gsap.isTweening(letterElement)) return;

  const direction = getRandomDirection();
  const exitTransform = getDirectionTransform(direction, 110);
  const entryTransform = getDirectionTransform(getOppositeDirection(direction), 110);

  gsap.timeline()
    .to(letterElement, {
      x: exitTransform.x + '%',
      y: exitTransform.y + '%',
      duration: 0.25,
      ease: 'power2.in',
    })
    .set(letterElement, {
      x: entryTransform.x + '%',
      y: entryTransform.y + '%',
    })
    .to(letterElement, {
      x: '0%',
      y: '0%',
      duration: 0.35,
      ease: 'power2.out',
    });
};

// ============================================
// COLOR INTERPOLATION
// ============================================

const PRIMARY_COLOR = '#1b2028';

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

// ============================================
// COMPONENT
// ============================================

export function RevealText({ text, highlights }: RevealTextProps) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const hasAnimated = useRef(false);
  const animationIntervals = useRef<number[]>([]);
  // PERF: AbortController for cleaner async animation cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const { color: accentColor } = useAccentColor();
  const phase2TriggerRef = useRef<ScrollTrigger | null>(null);
  const highlightWordsRef = useRef<NodeListOf<Element> | null>(null);
  // PERF: Cache letter elements per highlight word to avoid querySelectorAll on every scroll frame
  const cachedLettersRef = useRef<Map<Element, HTMLElement[]>>(new Map());

  // Split text into words and determine which should be highlighted
  const words = useMemo(() => {
    return text.split(' ').map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '');
      const isHighlight = highlights.some(h => h.toLowerCase() === cleanWord);
      return { word, index, isHighlight };
    });
  }, [text, highlights]);

  // Handle hover on highlight letters
  const handleLetterHover = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const portalLetter = e.currentTarget.querySelector(`.${styles.portalLetter}`) as HTMLElement;
    if (portalLetter) {
      triggerPortalLoop(portalLetter);
    }
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    const normalWords = containerRef.current.querySelectorAll(`.${styles.word}:not(.${styles.highlightWord})`);
    const highlightWords = containerRef.current.querySelectorAll(`.${styles.highlightWord}`);
    const highlightLetters = containerRef.current.querySelectorAll(`.${styles.portalLetter}`);

    // ============================================
    // INITIAL STATES
    // ============================================
    gsap.set(highlightWords, { opacity: 0 });

    highlightLetters.forEach((letter) => {
      const direction = getRandomDirection();
      const startTransform = getDirectionTransform(direction, 110);
      gsap.set(letter, {
        x: startTransform.x + '%',
        y: startTransform.y + '%',
      });
    });

    // ============================================
    // FUNCTION: Start async continuous animations
    // Each letter animates independently at random intervals
    // PERF: Uses AbortController for clean cancellation
    // ============================================
    const startAsyncAnimations = () => {
      // Create new abort controller for this animation cycle
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const letters = Array.from(highlightLetters) as HTMLElement[];

      letters.forEach((letter) => {
        // Random interval between 3-6 seconds for each letter
        const scheduleNext = () => {
          // PERF: Check if aborted before scheduling
          if (signal.aborted) return;

          const randomDelay = 3000 + Math.random() * 3000;
          const intervalId = window.setTimeout(() => {
            // PERF: Check if aborted before triggering animation
            if (signal.aborted) return;
            triggerPortalLoop(letter);
            scheduleNext();
          }, randomDelay);
          animationIntervals.current.push(intervalId);
        };

        // Start with a random initial delay (0-3 seconds)
        const initialDelay = Math.random() * 3000;
        const initialId = window.setTimeout(() => {
          // PERF: Check if aborted before triggering
          if (signal.aborted) return;
          triggerPortalLoop(letter);
          scheduleNext();
        }, initialDelay);
        animationIntervals.current.push(initialId);
      });
    };

    // ============================================
    // FUNCTION: Trigger letter stagger animation
    // ============================================
    const triggerLetterStagger = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;

      // Reveal highlight word containers
      gsap.to(highlightWords, {
        opacity: 1,
        duration: 0.01,
      });

      // Async stagger - all letters animate with random delays
      const letterDuration = 0.4;
      const maxRandomDelay = 0.25; // Random delay spread (0-250ms)

      // Animate all letters with random delays (async, not sequential)
      highlightLetters.forEach((letter) => {
        const randomDelay = Math.random() * maxRandomDelay;
        gsap.to(letter, {
          x: '0%',
          y: '0%',
          duration: letterDuration,
          delay: randomDelay,
          ease: 'power2.out',
        });
      });

      // Start async continuous animations after initial reveal
      gsap.delayedCall(letterDuration + maxRandomDelay + 0.3, startAsyncAnimations);
    };

    // ============================================
    // PHASE 1: Normal words opacity reveal (scroll-scrubbed)
    // When complete, trigger letter stagger
    // ============================================
    let revealTriggered = false;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 95%',
      end: 'top 35%',
      scrub: 2.5,
      onUpdate: (self) => {
        // Update normal words opacity
        const progress = self.progress;
        normalWords.forEach((word, index) => {
          const wordProgress = Math.max(0, Math.min(1,
            (progress - index * ANIMATION_CONFIG.stagger.words) / (1 - index * ANIMATION_CONFIG.stagger.words)
          ));
          (word as HTMLElement).style.opacity = String(0.15 + wordProgress * 0.85);
        });

        // Trigger letter stagger when reveal is mostly complete (90%)
        if (progress >= 0.9 && !revealTriggered) {
          revealTriggered = true;
          triggerLetterStagger();
        }
      },
    });

    // ============================================
    // PHASE 2: Highlight color interpolation (scroll-scrubbed)
    // ============================================
    const getAccentColor = (): string => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-purple').trim() || '#62b6cb';
    };

    highlightWordsRef.current = highlightWords;

    // PERF: Pre-cache letter elements to avoid querySelectorAll on every scroll frame
    cachedLettersRef.current.clear();
    highlightWords.forEach((wordEl) => {
      const letters = Array.from(wordEl.querySelectorAll(`.${styles.portalLetter}`)) as HTMLElement[];
      cachedLettersRef.current.set(wordEl, letters);
    });

    phase2TriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top 50%',
      end: 'top 20%',
      scrub: 2.5,
      onUpdate: (self) => {
        const progress = self.progress;
        const currentAccent = getAccentColor();
        const totalHighlights = highlightWords.length;
        highlightWords.forEach((wordEl, index) => {
          // PERF: Use cached letters instead of querySelectorAll
          const letters = cachedLettersRef.current.get(wordEl) || [];
          const staggerDelay = totalHighlights > 1 ? (index / (totalHighlights - 1)) * 0.3 : 0;
          const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
          const easedProgress = adjustedProgress < 0.5
            ? 2 * adjustedProgress * adjustedProgress
            : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2;
          const color = interpolateColor(PRIMARY_COLOR, currentAccent, easedProgress);
          letters.forEach((el) => {
            el.style.color = color;
          });
        });
      },
    });

    // Cleanup
    return () => {
      // PERF: Abort all pending animations first
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Then clear timeouts
      animationIntervals.current.forEach((id) => window.clearTimeout(id));
      animationIntervals.current = [];
    };

  }, { scope: containerRef, dependencies: [words] });

  // Re-apply highlight colors when accent color changes (e.g. menu close cycles color)
  useEffect(() => {
    if (!phase2TriggerRef.current || !highlightWordsRef.current) return;

    const progress = phase2TriggerRef.current.progress;
    const totalHighlights = highlightWordsRef.current.length;

    highlightWordsRef.current.forEach((wordEl, index) => {
      // PERF: Use cached letters instead of querySelectorAll
      const letters = cachedLettersRef.current.get(wordEl) || [];
      const staggerDelay = totalHighlights > 1 ? (index / (totalHighlights - 1)) * 0.3 : 0;
      const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)));
      const easedProgress = adjustedProgress < 0.5
        ? 2 * adjustedProgress * adjustedProgress
        : 1 - Math.pow(-2 * adjustedProgress + 2, 2) / 2;
      const color = interpolateColor(PRIMARY_COLOR, accentColor, easedProgress);
      letters.forEach((el) => {
        el.style.color = color;
      });
    });
  }, [accentColor]);

  return (
    <h2 ref={containerRef} className={styles.statementText}>
      {words.map(({ word, index, isHighlight }) => {
        if (isHighlight) {
          const letters = word.split('');
          return (
            <span
              key={index}
              className={`${styles.word} ${styles.highlightWord} ${styles.highlight}`}
            >
              {letters.map((letter, letterIdx) => (
                <span
                  key={letterIdx}
                  className={styles.portalMask}
                  onMouseEnter={handleLetterHover}
                >
                  <span className={styles.portalLetter}>{letter}</span>
                </span>
              ))}
            </span>
          );
        }

        return (
          <span key={index} className={styles.word}>
            {word}
          </span>
        );
      })}
    </h2>
  );
}
