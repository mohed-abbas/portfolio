'use client';

/* ============================================================
   WORKFLOW · ECLIPSE renderer — markup shell
   A ✦ eyebrow + readout, a near-fullscreen eclipse scene (disc, moon,
   crescent-masked names — all built imperatively by useEclipseDriver),
   and a bottom-centred detail placard that crossfades per active step.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useEclipseDriver } from '../useEclipseDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Eclipse.module.css';

export function EclipseWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useEclipseDriver(sectionRef, { layout, accents, variantKey: variant, reducedMotion });

  const className = [styles.eclipse, reducedMotion ? styles.isStatic : '']
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

        {/* carries the step names to the imperative SVG-text names */}
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
