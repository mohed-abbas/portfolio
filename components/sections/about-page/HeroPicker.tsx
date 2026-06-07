'use client';

/* Dev-only on-screen switch for comparing the /about hero variants live.
   Rendered only when NODE_ENV !== 'production', so it never ships. Parks
   bottom-left, clear of the page's bottom-right controls. */

import { HERO_LABELS, HERO_VARIANT_ORDER, type HeroVariant } from './heroVariants';
import styles from './HeroPicker.module.css';

interface HeroPickerProps {
  value: HeroVariant;
  onChange: (next: HeroVariant) => void;
}

export function HeroPicker({ value, onChange }: HeroPickerProps) {
  return (
    <div className={styles.picker} role="group" aria-label="About hero variant (dev)">
      <span className={styles.pickerTag}>Hero</span>
      {HERO_VARIANT_ORDER.map((variant) => (
        <button
          key={variant}
          type="button"
          className={`${styles.pickerBtn} ${variant === value ? styles.pickerBtnActive : ''}`}
          aria-pressed={variant === value}
          onClick={() => onChange(variant)}
        >
          {HERO_LABELS[variant]}
        </button>
      ))}
    </div>
  );
}
