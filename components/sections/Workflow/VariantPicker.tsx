'use client';

/* Dev-only on-screen switch for comparing the five transit layouts live
   in the running site. Rendered only when NODE_ENV !== 'production', so it
   never ships. Picking a layout also writes ?wf= to the URL so a refresh
   (and the deep links used in verification) keep the choice. */

import { LAYOUTS, VARIANT_ORDER, type WorkflowVariant } from './layouts';
import styles from './Workflow.module.css';

interface VariantPickerProps {
  value: WorkflowVariant;
  onChange: (next: WorkflowVariant) => void;
}

export function VariantPicker({ value, onChange }: VariantPickerProps) {
  return (
    <div className={styles.picker} role="group" aria-label="Workflow layout (dev)">
      <span className={styles.pickerTag}>WF layout</span>
      {VARIANT_ORDER.map((variant) => (
        <button
          key={variant}
          type="button"
          className={`${styles.pickerBtn} ${variant === value ? styles.pickerBtnActive : ''}`}
          aria-pressed={variant === value}
          onClick={() => onChange(variant)}
        >
          {LAYOUTS[variant].label}
        </button>
      ))}
    </div>
  );
}
