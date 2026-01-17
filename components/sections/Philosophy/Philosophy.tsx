'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, ANIMATION_CONFIG } from '@/lib/gsap';
import { content } from '@/data';
import { RevealText } from './RevealText';
import styles from './Philosophy.module.css';

export function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!labelRef.current) return;

    // Meta-label entrance animation
    gsap.from(labelRef.current, {
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 80%',
      },
      x: -50,
      opacity: 0,
      duration: 1.5,
      ease: ANIMATION_CONFIG.ease.outQuart,
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.section} id="philosophy">
      <div className={styles.plusIcon}>+</div>
      <div ref={labelRef} className={styles.metaLabel}>
        {content.philosophy.label}
      </div>
      <RevealText
        text={content.philosophy.statement}
        highlights={content.philosophy.highlights}
      />
    </section>
  );
}
