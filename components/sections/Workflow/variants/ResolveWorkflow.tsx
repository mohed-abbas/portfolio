'use client';

/* ============================================================
   WORKFLOW · RESOLVE renderer — markup shell
   A rack-focus stack of the five step names in giant display type,
   with a centre focus reticle. Blur + active state are driven
   imperatively by useResolveDriver.
   ============================================================ */

import { useRef } from 'react';
import { content } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, type WorkflowVariant } from '../layouts';
import { useResolveDriver } from '../useResolveDriver';
import { renderCopy } from '../shared/renderCopy';
import styles from '../Resolve.module.css';

export function ResolveWorkflow({ variant }: { variant: WorkflowVariant }) {
  const { label, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const layout = LAYOUTS[variant];

  const accents = stops.map((s) => `var(--wf-${s.accent})`);

  useResolveDriver(sectionRef, { layout, accents, reducedMotion });

  const className = [styles.resolve, reducedMotion ? styles.isStatic : '']
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
          <div className={styles.reticle} data-reticle>
            <span className={styles.corner} />
            <span className={styles.corner} />
            <span className={styles.corner} />
            <span className={styles.corner} />
          </div>
          <div className={styles.stack}>
            {stops.map((stop) => (
              <p
                key={stop.name}
                className={styles.word}
                data-word
                style={{ '--accent': `var(--wf-${stop.accent})` } as React.CSSProperties}
              >
                {stop.name}
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
