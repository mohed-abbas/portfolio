'use client';

/* ============================================================
   WORKFLOW · ORRERY renderer — markup shell
   A ✦ eyebrow + step readout, the active step's name as big type at
   the meridian, a full-bleed orbit schematic (built imperatively by
   useOrreryDriver), and a centred detail placard over the sun.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useOrreryDriver } from '../useOrreryDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Orrery.module.css';

export function OrreryWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useOrreryDriver(sectionRef, { layout, accents, variantKey: variant, reducedMotion });

  const className = [styles.orrery, reducedMotion ? styles.isStatic : '']
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
              <span className={styles.detailKicker} data-bigname>
                Step {String(i + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(stops.length).padStart(2, '0')}
              </span>
              <h3 className={styles.detailName}>{stop.name}</h3>
              <p className={styles.detailTitle}>{stop.title}</p>
              <p className={styles.detailCopy}>{renderCopy(stop, styles.em)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
