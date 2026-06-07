'use client';

/* ============================================================
   WORKFLOW · TYPE-RING renderer — markup shell
   The five step names render as big display words on a ring; the
   centre carries the active step's detail. Rotation + active state
   are driven imperatively by useTypeRingDriver.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useTypeRingDriver } from '../useTypeRingDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../TypeRing.module.css';

export function TypeRingWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useTypeRingDriver(sectionRef, { layout, accents, reducedMotion });

  const className = [styles.typering, reducedMotion ? styles.isStatic : '']
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
          <div className={styles.ring}>
            {stops.map((stop) => (
              <p
                key={stop.name}
                className={styles.word}
                data-word
                style={{ '--accent': `var(--wf-${stop.accent})` } as React.CSSProperties}
              >
                {stop.name}
                <span className={styles.wordRule} />
              </p>
            ))}
          </div>
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
