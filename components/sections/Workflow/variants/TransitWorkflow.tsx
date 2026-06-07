'use client';

/* ============================================================
   WORKFLOW · TRANSIT LINE (original renderer)
   The process as a Vignelli-style metro diagram: a bullet rides
   a route on scroll, halting at each of five stations. Powers the
   original trunk / rail / loop / diagonal / star layouts — kept as
   references. Extracted verbatim from the old Workflow.tsx body so
   those layouts behave exactly as before.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useTransitDriver } from '../useTransitDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Workflow.module.css';

export function TransitWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, lineBadge, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  // Accent CSS values per stop (locally-defined brand palette vars on .wf).
  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useTransitDriver(sectionRef, { layout, accents, variantKey: variant, reducedMotion });

  const className = [styles.wf, styles[layout.placard], reducedMotion ? styles.isStatic : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={sectionRef} className={className} id="workflow" data-wf>
      <div className={styles.viewport} data-viewport>
        <header className={styles.head}>
          <span className={styles.eyebrow}>✦&nbsp;&nbsp;{label}</span>
          <span className={styles.lineBadge}>{lineBadge}</span>
        </header>

        <div className={styles.board} aria-hidden="true">
          <span className={styles.boardTag}>Next stop</span>
          <span className={styles.boardStop} data-board>
            {stops[0]?.name}
          </span>
          <span className={styles.boardCount} data-readout>
            01 / {String(stops.length).padStart(2, '0')}
          </span>
        </div>

        <svg
          className={styles.schematic}
          data-schematic
          viewBox={layout.viewBox}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        />

        <div className={styles.detailWrap} data-detail>
          {stops.map((stop, i) => (
            <article
              key={stop.name}
              className={styles.detail}
              data-step
              data-name={stop.name}
              style={{ '--accent': `var(--wf-${stop.accent})` } as React.CSSProperties}
            >
              <span className={styles.detailKicker}>
                Stop {String(i + 1).padStart(2, '0')}&nbsp;·&nbsp;{stop.name}
              </span>
              <h3 className={styles.detailTitle}>{stop.title}</h3>
              <p className={styles.detailCopy}>{renderCopy(stop, styles.em)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
