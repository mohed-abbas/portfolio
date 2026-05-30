'use client';

/* ============================================================
   WORKFLOW · TRANSIT LINE
   The process as a Vignelli-style metro diagram: a route the
   bullet rides on scroll, halting at each of five stations.
   Five toggleable layouts (trunk / rail / loop / diagonal / star)
   share one driver — see useTransitDriver + layouts.ts.
   Mounted in the home scroll just before Contact.
   ============================================================ */

import { Fragment, useMemo, useRef, useSyncExternalStore } from 'react';
import { content } from '@/data';
import type { WorkflowStop } from '@/data';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { LAYOUTS, DEFAULT_VARIANT, isVariant, type WorkflowVariant } from './layouts';
import { useTransitDriver } from './useTransitDriver';
import { VariantPicker } from './VariantPicker';
import styles from './Workflow.module.css';

const SHOW_PICKER = process.env.NODE_ENV !== 'production';

// ── Active variant store (dev-preview ?wf= deep link) ──
// useSyncExternalStore keeps SSR + first client render on DEFAULT (the
// server snapshot), then switches to the URL value after hydration. This is
// hydration-safe: production has no ?wf param, so the snapshots always agree.
const variantListeners = new Set<() => void>();
function subscribeVariant(listener: () => void) {
  variantListeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    variantListeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}
function getVariantSnapshot(): WorkflowVariant {
  const param = new URLSearchParams(window.location.search).get('wf');
  return isVariant(param) ? param : DEFAULT_VARIANT;
}
function getVariantServerSnapshot(): WorkflowVariant {
  return DEFAULT_VARIANT;
}
function setVariantParam(next: WorkflowVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set('wf', next);
  window.history.replaceState(null, '', url);
  variantListeners.forEach((l) => l());
}

// Render a stop's copy, underlining the optional emphasis word (first match)
// with the stop accent. Avoids dangerouslySetInnerHTML.
function renderCopy(stop: WorkflowStop) {
  const { copy, emphasis } = stop;
  if (!emphasis) return copy;
  const at = copy.indexOf(emphasis);
  if (at < 0) return copy;
  return (
    <Fragment>
      {copy.slice(0, at)}
      <em className={styles.em}>{emphasis}</em>
      {copy.slice(at + emphasis.length)}
    </Fragment>
  );
}

export function Workflow() {
  const { label, lineBadge, stops } = content.workflow;
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  const variant = useSyncExternalStore(
    subscribeVariant,
    getVariantSnapshot,
    getVariantServerSnapshot,
  );

  const layout = LAYOUTS[variant];

  // Accent CSS values per stop (locally-defined brand palette vars on .wf).
  const accents = useMemo(
    () => stops.map((s) => `var(--wf-${s.accent})`),
    [stops],
  );

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
              <p className={styles.detailCopy}>{renderCopy(stop)}</p>
            </article>
          ))}
        </div>

        {SHOW_PICKER && <VariantPicker value={variant} onChange={setVariantParam} />}
      </div>
    </section>
  );
}
