'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import styles from './WorksCursor.module.css';

export interface WorksCursorProps {
  /** True when any row is hovered — grows the cursor + shows "Open" label. */
  hovered: boolean;
  /** Accent hex of the hovered row. Used as the cursor fill when active. */
  accent: string | null;
  /** Label shown on row hover. */
  label?: string;
}

export function WorksCursor({ hovered, accent, label = 'Open' }: WorksCursorProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Persist quickTo instances across renders so we don't recreate them.
  const quickXRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickYRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    quickXRef.current = gsap.quickTo(el, 'x', { duration: 0.25, ease: 'power3' });
    quickYRef.current = gsap.quickTo(el, 'y', { duration: 0.25, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      quickXRef.current?.(e.clientX);
      quickYRef.current?.(e.clientY);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const className = `${styles.cursor}${hovered ? ` ${styles.onRow}` : ''}`;
  const style: CSSProperties | undefined = accent
    ? { ['--cursor-accent' as string]: accent }
    : undefined;

  return (
    <div ref={ref} className={className} style={style} aria-hidden="true">
      <span className={styles.label}>{label}</span>
    </div>
  );
}
