'use client';

import { useRef, useEffect, useState } from 'react';
import { content } from '@/data';
import styles from './SkillsBar.module.css';

// Build repeating skills array from base items
const baseSkills = content.skills.marqueeItems;
const skills = [
  ...baseSkills,
  baseSkills[1], // UI/UX
  baseSkills[0], // INTERACTIVE
  baseSkills[2], // BRAND STRATEGY
  baseSkills[1], // UI/UX
];

export function SkillsBar() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState<number | null>(null);

  useEffect(() => {
    const measureWidth = () => {
      if (contentRef.current) {
        // Get all spans (first half only - original skills)
        const spans = contentRef.current.querySelectorAll('span');
        const halfCount = skills.length;
        let totalWidth = 0;

        // Measure width of first set of skills
        for (let i = 0; i < halfCount && i < spans.length; i++) {
          const span = spans[i] as HTMLElement;
          totalWidth += span.offsetWidth;
        }

        // Add gaps between items (skills.length - 1 gaps for first set)
        const computedStyle = getComputedStyle(contentRef.current);
        const gap = parseFloat(computedStyle.gap) || 0;
        totalWidth += gap * halfCount; // Include one more gap for spacing to duplicate

        setScrollWidth(totalWidth);
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);

  return (
    <div className={styles.skillsBar}>
      <div className={styles.skillsBarInner}>
        <div className={styles.skillsWrapper}>
          <div
            ref={contentRef}
            className={styles.skillsContent}
            style={
              scrollWidth
                ? ({
                    '--scroll-width': `${scrollWidth}px`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {skills.map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {skills.map((skill, index) => (
              <span key={`dup-${index}`}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
