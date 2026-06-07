'use client';

/* ============================================================
   WORKFLOW · REGISTER renderer — markup shell
   Each step name renders as three colour separations (teal / red /
   orange) that arrive out of register and converge into one solid
   in-register word as you scroll through the step. Registration
   crosshairs click into the corners. Convergence is driven
   imperatively by useRegisterDriver.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useRegisterDriver } from '../useRegisterDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Register.module.css';

export function RegisterWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useRegisterDriver(sectionRef, { layout, accents, reducedMotion });

  const className = [styles.register, reducedMotion ? styles.isStatic : '']
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

        <div className={styles.stage} aria-hidden="true">
          <div className={styles.marks} data-marks>
            <span className={styles.mark} />
            <span className={styles.mark} />
            <span className={styles.mark} />
            <span className={styles.mark} />
          </div>
          {stops.map((stop) => (
            <div
              key={stop.name}
              className={styles.group}
              data-group
              style={{ '--accent': `var(--wf-${stop.accent})` } as React.CSSProperties}
            >
              <span className={`${styles.chan} ${styles.chanC}`} data-chan="c">
                {stop.name}
              </span>
              <span className={`${styles.chan} ${styles.chanM}`} data-chan="m">
                {stop.name}
              </span>
              <span className={`${styles.chan} ${styles.chanY}`} data-chan="y">
                {stop.name}
              </span>
              <span className={styles.solid} data-solid>
                {stop.name}
              </span>
            </div>
          ))}
        </div>

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
