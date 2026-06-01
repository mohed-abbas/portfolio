'use client';

/* ABOUT · Dossier / Personnel file
   An archival case-file aesthetic. A header band with a name + rubber-stamp,
   then four indexed tabs (Profile / Experience / Credentials / Education) that
   swap a single pane in place, so the whole section stays one screen tall on
   the home page. Hairlines, mono meta, tabular numerals, big display type.

   Built from content.about — CV entries flagged `placeholder` are sample data
   and carry a small dagger marker + footnote until real values land. */

import { useState } from 'react';
import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content, navigation } from '@/data';
import styles from './Dossier.module.css';

const basedIn = navigation.location.replace(/^based in\s*/i, '');

type TabKey = 'profile' | 'experience' | 'credentials' | 'education';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'experience', label: 'Experience' },
  { key: 'credentials', label: 'Credentials' },
  { key: 'education', label: 'Education' },
];

export function AboutDossier() {
  const [tab, setTab] = useState<TabKey>('profile');
  const { label, lede, experience, certifications, education } = content.about;
  const { title } = content.hero;
  const hasPlaceholder =
    experience.some((e) => e.placeholder) ||
    certifications.some((c) => c.placeholder) ||
    education.some((e) => e.placeholder);

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        {/* ── header band ── */}
        <header className={styles.band}>
          <div className={styles.bandLeft}>
            <span className={styles.fileTag}>
              <StarIcon variant="outline" baseClassName={styles.starIcon} />
              {label} · Personnel file
            </span>
            <h2 className={styles.name}>Mohed Abbas</h2>
            <span className={styles.role}>{title}</span>
          </div>
          <div className={styles.stamp} aria-hidden="true">
            <span className={styles.stampLine}>File</span>
            <span className={styles.stampId}>MA-2024</span>
            <span className={styles.stampLine}>Active</span>
          </div>
        </header>

        {/* ── tab bar ── */}
        <div className={styles.tabs} role="tablist" aria-label="About sections">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span className={styles.tabIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.tabLabel}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── pane ── */}
        <div className={styles.pane} role="tabpanel" key={tab}>
          {tab === 'profile' && (
            <div className={styles.profile}>
              <p className={styles.lede}>{lede}</p>
              <dl className={styles.facts}>
                {[
                  ['Status', 'Independent'],
                  ['Building', 'TASKTROX'],
                  ['Discipline', title],
                  ['Based in', basedIn],
                ].map(([k, v], i) => (
                  <div className={styles.fact} key={k} style={{ '--i': i } as React.CSSProperties}>
                    <dt>{k}</dt>
                    <dd className={v === 'TASKTROX' ? styles.accent : undefined}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {tab === 'experience' && (
            <ol className={styles.expList}>
              {experience.map((e, i) => (
                <li className={styles.expRow} key={e.role + e.org} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.expPeriod}>{e.period}</span>
                  <div className={styles.expBody}>
                    <h3 className={styles.expRole}>
                      {e.role}
                      {e.placeholder && <i className={styles.dagger}>†</i>}
                    </h3>
                    <span className={styles.expOrg}>
                      {e.org} <span className={styles.expKind}>· {e.kind}</span>
                    </span>
                    <p className={styles.expSummary}>{e.summary}</p>
                    {e.tags && (
                      <ul className={styles.tags}>
                        {e.tags.map((t) => (
                          <li className={styles.tag} key={t}>{t}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {tab === 'credentials' && (
            <ul className={styles.certGrid}>
              {certifications.map((c, i) => (
                <li className={styles.certCard} key={c.name} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.certYear}>{c.year}</span>
                  <span className={styles.certName}>
                    {c.name}
                    {c.placeholder && <i className={styles.dagger}>†</i>}
                  </span>
                  <span className={styles.certIssuer}>{c.issuer}</span>
                </li>
              ))}
            </ul>
          )}

          {tab === 'education' && (
            <ul className={styles.eduList}>
              {education.map((e, i) => (
                <li className={styles.eduRow} key={e.credential} style={{ '--i': i } as React.CSSProperties}>
                  <span className={styles.eduPeriod}>{e.period}</span>
                  <div className={styles.eduBody}>
                    <h3 className={styles.eduCred}>
                      {e.credential}
                      {e.placeholder && <i className={styles.dagger}>†</i>}
                    </h3>
                    <span className={styles.eduInst}>{e.institution}</span>
                    {e.detail && <p className={styles.eduDetail}>{e.detail}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasPlaceholder && (
          <p className={styles.footnote}>† Sample entry, pending real data.</p>
        )}
      </div>
    </section>
  );
}
