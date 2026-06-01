'use client';

/* Dev-only on-screen switch for comparing the five About variants live.
   Rendered only when NODE_ENV !== 'production', so it never ships. Sits just
   above the Workflow picker (bottom-left) so the two don't overlap. */

import { ABOUT_LABELS, ABOUT_VARIANT_ORDER, type AboutVariant } from './variants';
import styles from './AboutPicker.module.css';

interface AboutPickerProps {
  value: AboutVariant;
  onChange: (next: AboutVariant) => void;
}

export function AboutPicker({ value, onChange }: AboutPickerProps) {
  return (
    <div className={styles.picker} role="group" aria-label="About variant (dev)">
      <span className={styles.pickerTag}>About</span>
      {ABOUT_VARIANT_ORDER.map((variant) => (
        <button
          key={variant}
          type="button"
          className={`${styles.pickerBtn} ${variant === value ? styles.pickerBtnActive : ''}`}
          aria-pressed={variant === value}
          onClick={() => onChange(variant)}
        >
          {ABOUT_LABELS[variant]}
        </button>
      ))}
    </div>
  );
}
