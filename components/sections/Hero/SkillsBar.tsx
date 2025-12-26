'use client';

import { useRef, useEffect, useState } from 'react';
import { content } from '@/data';
import { StarIcon } from './StarIcon';
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
        // Get all skill items (text + separator pairs in first half)
        const skillItems = contentRef.current.querySelectorAll(`.${styles.skillItem}`);
        const halfCount = skills.length;
        let totalWidth = 0;

        // Measure width of first set of skills (including separators)
        for (let i = 0; i < halfCount && i < skillItems.length; i++) {
          const item = skillItems[i] as HTMLElement;
          totalWidth += item.offsetWidth;
        }

        // Add gaps between items
        const computedStyle = getComputedStyle(contentRef.current);
        const gap = parseFloat(computedStyle.gap) || 0;
        totalWidth += gap * halfCount;

        setScrollWidth(totalWidth);
      }
    };

    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, []);

  // Render a skill item with alternating star separator
  const renderSkillItem = (skill: string, index: number, keyPrefix: string = '') => (
    <div key={`${keyPrefix}${index}`} className={styles.skillItem}>
      <span className={styles.skillText}>{skill}</span>
      <span className={styles.separator}>
        <StarIcon variant={index % 2 === 0 ? 'outline' : 'filled'} />
      </span>
    </div>
  );

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
            {skills.map((skill, index) => renderSkillItem(skill, index))}
            {/* Duplicate for seamless loop */}
            {skills.map((skill, index) => renderSkillItem(skill, index, 'dup-'))}
          </div>
        </div>
      </div>
    </div>
  );
}
