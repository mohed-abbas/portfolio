'use client';

import { type CSSProperties, type ReactNode, useState } from 'react';
import { TransitionLink } from '@/components/transitions';
import type { WorksIndexProject } from '@/data';
import { WorksStickerMarquee } from '@/components/sections/works-stickers/WorksStickerMarquee';
import styles from './WorksSticker.module.css';

export interface WorksStickerProps {
  /** Zero-based index — drives badge number, tilt, offset, wobble parity. */
  index: number;
  project: WorksIndexProject;
  /** True when a matching case-study slug exists; gates link vs static div. */
  hasCaseStudy: boolean;
  /** Decal glyph for the corner badge — small visual rhythm only. */
  decal: string;
  /** Bubbled hover state — page-level cursor + preview coordination.
   *  Bubbles the whole project so the page can look up the case-study
   *  hero image for the preview card. */
  onHoverChange: (hovered: boolean, project: WorksIndexProject) => void;
}

/** Cyclic visual rhythm — first 10 entries match the v5 prototype, then wraps. */
const TILT_SEQ = [-2.4, 1.6, -1.2, 2.8, -3, 1.2, -2, 2.2, -1.6, 2.6];
const OFFSET_SEQ = [0, 6, -4, 3, 0, 7, -5, 0, 4, -3];          // viewport %
const WOBBLE_DUR_SEQ = [5, 6, 4.5, 5.5, 4, 6, 5, 4.5, 5.5, 4]; // seconds

export function WorksSticker({
  index,
  project,
  hasCaseStudy,
  decal,
  onHoverChange,
}: WorksStickerProps) {
  const [hovered, setHovered] = useState(false);
  const num = String(index + 1).padStart(2, '0');

  const tilt = TILT_SEQ[index % TILT_SEQ.length];
  const offset = OFFSET_SEQ[index % OFFSET_SEQ.length];
  const wobbleDur = WOBBLE_DUR_SEQ[index % WOBBLE_DUR_SEQ.length];
  const wobbleSign = index % 2 === 0 ? 1 : -1;

  const className = `${styles.sticker}${hovered ? ` ${styles.isHover}` : ''}`;
  const style: CSSProperties = {
    ['--sticker-accent' as string]: project.accent,
    ['--tilt' as string]: `${tilt}deg`,
    ['--offset' as string]: `${offset}%`,
    ['--wobble-dur' as string]: `${wobbleDur}s`,
    ['--wobble-amp' as string]: `${wobbleSign * 0.6}deg`,
    // animation-delay staggers the wobbles so stickers don't move in lockstep.
    ['--wobble-delay' as string]: `${(index % 4) * -0.7}s`,
  };

  const handleEnter = () => {
    setHovered(true);
    onHoverChange(true, project);
  };
  const handleLeave = () => {
    setHovered(false);
    onHoverChange(false, project);
  };

  const inner: ReactNode = (
    <>
      <div className={styles.num}>{num}</div>
      <div className={styles.marquee}>
        <WorksStickerMarquee
          title={project.title}
          durationSec={project.marqueeDurationSec}
          outline={index % 2 === 1}
          paused={hovered}
          inverted={hovered}
        />
      </div>
      <div className={styles.meta}>
        <span className={styles.discipline}>{project.discipline}</span>
        <span className={styles.year}>{project.year}</span>
      </div>
      <div className={styles.decal} aria-hidden="true">{decal}</div>
    </>
  );

  if (hasCaseStudy) {
    return (
      <TransitionLink
        href={`/work/${project.id}`}
        className={className}
        style={style}
        aria-label={`Open ${project.title} case study`}
        payload={{
          accent: project.accent,
          title: project.title,
          slug: project.id,
          year: String(project.year),
          category: project.discipline,
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {inner}
      </TransitionLink>
    );
  }

  return (
    <div
      className={className}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {inner}
    </div>
  );
}
