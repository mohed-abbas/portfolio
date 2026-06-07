'use client';

/* ============================================================
   WORKFLOW · ORBIT renderer — markup shell
   Theme-aligned reimaginings of the loop / star (sparkle / plusgrid /
   cosmic). Sheds the metro chrome: a ✦ eyebrow + a small step readout,
   a full-bleed schematic, and a centred placard. The route, markers,
   bullet and field are built imperatively by useOrbitDriver.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useOrbitDriver } from '../useOrbitDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Orbit.module.css';

export function OrbitWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useOrbitDriver(sectionRef, { layout, accents, variantKey: variant, reducedMotion });

  const field =
    layout.orbit?.field === 'plusgrid'
      ? styles.fieldPlusgrid
      : layout.orbit?.field === 'stars'
        ? styles.fieldStars
        : '';

  const className = [styles.orbit, field, reducedMotion ? styles.isStatic : '']
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
