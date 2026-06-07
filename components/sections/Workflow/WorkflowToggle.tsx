'use client';

/* Dev-only on-screen switch for comparing the two workflow variants live.
   Rendered only when NODE_ENV !== 'production', so it never ships. Picking a
   variant also writes ?wf= to the URL so a refresh keeps the choice. */

import { WORKFLOW_VARIANTS, type WorkflowVariant } from './variants';
import styles from './WorkflowToggle.module.css';

interface WorkflowToggleProps {
  value: WorkflowVariant;
  onChange: (next: WorkflowVariant) => void;
}

export function WorkflowToggle({ value, onChange }: WorkflowToggleProps) {
  return (
    <div className={styles.toggle} role="group" aria-label="Workflow variant (dev)">
      <span className={styles.tag}>WF</span>
      {WORKFLOW_VARIANTS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`${styles.btn} ${key === value ? styles.active : ''}`}
          aria-pressed={key === value}
          onClick={() => onChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
