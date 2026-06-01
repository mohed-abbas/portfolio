'use client';

/* ABOUT · Spec ledger / colophon
   A precise technical spec sheet: an opening statement, then indexed
   label -> value rows with hairline rules and tabular numerals. Rows reveal
   with a CSS stagger (reduced-motion shows them settled). From existing
   content; the name is a plain fact. */

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content, navigation } from '@/data';
import styles from './Ledger.module.css';

const basedIn = navigation.location.replace(/^based in\s*/i, '');

export function AboutLedger() {
  const { title } = content.hero;
  const { label, lede } = content.about;

  const rows: { label: string; value?: string; tags?: string[] }[] = [
    { label: 'Name', value: 'Mohed Abbas' },
    { label: 'Role', value: title },
    { label: 'Building', value: 'TASKTROX' },
    { label: 'Focus', tags: content.skills.marqueeItems },
    { label: 'Status', value: 'Independent' },
    { label: 'Based in', value: basedIn },
  ];

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.metaLabel}>
          <StarIcon variant="outline" baseClassName={styles.starIcon} />
          {label} <span className={styles.metaSub}>/ Colophon</span>
        </div>

        <p className={styles.statement}>{lede}</p>

        <dl className={styles.ledger}>
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={styles.row}
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
              <dt className={styles.rowLabel}>{row.label}</dt>
              <dd className={styles.rowValue}>
                {row.tags ? (
                  <span className={styles.tags}>
                    {row.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </span>
                ) : row.label === 'Status' ? (
                  <span className={styles.accentValue}>{row.value}</span>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
