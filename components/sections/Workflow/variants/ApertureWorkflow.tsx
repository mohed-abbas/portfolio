'use client';

/* ============================================================
   WORKFLOW · APERTURE renderer — markup shell
   A six-blade camera iris over the plus-grid. Each step the iris
   stops down then opens to reveal that step's sharp name; it ends
   wide open on a corona. The blades, name reveal and corona are
   built imperatively by useApertureDriver. The step names ride in
   on a hidden host (data-names) so the SVG text can be rebuilt
   without re-rendering React.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useApertureDriver } from '../useApertureDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Aperture.module.css';

export function ApertureWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useApertureDriver(sectionRef, { layout, accents, variantKey: variant, reducedMotion });

  const className = [styles.aperture, reducedMotion ? styles.isStatic : '']
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={sectionRef} className={className} id="workflow" data-wf>
      <div className={styles.viewport} data-viewport>
        <header className={styles.head}>
          <span className={styles.eyebrow}>✦&nbsp;&nbsp;{label}</span>
          <span className={styles.readout} data-readout aria-hidden="true">
            01 / {String(stops.length).padStart(2, '0')}
          </span>
        </header>

        <span data-stepname data-names={stops.map((s) => s.name).join('|')} hidden />

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
                Step {String(i + 1).padStart(2, '0')}&nbsp;·&nbsp;{stop.name}
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
