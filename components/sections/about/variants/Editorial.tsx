'use client';

/* ABOUT · Editorial spread
   A magazine layout: a strong opening spread, then Experience as a numbered
   feature list, Certifications as a badge wall, and Education as compact cards.
   Asymmetric, generous type. The same component renders the home section and
   the dedicated /about page (mode="page" loosens spacing and shows a kicker).

   Built from content.about; placeholder CV entries get a dagger + footnote. */

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content, navigation } from '@/data';
import styles from './Editorial.module.css';

const basedIn = navigation.location.replace(/^based in\s*/i, '');

export function AboutEditorial({ mode = 'section' }: { mode?: 'section' | 'page' }) {
  const { label, lede, experience, certifications, education } = content.about;
  const { title } = content.hero;
  const hasPlaceholder =
    experience.some((e) => e.placeholder) ||
    certifications.some((c) => c.placeholder) ||
    education.some((e) => e.placeholder);

  return (
    <section
      className={`${styles.section} ${mode === 'page' ? styles.page : ''}`}
      id="about"
    >
      <div className={styles.inner}>
        {/* ── opening spread ── */}
        <header className={styles.spread}>
          <span className={styles.eyebrow}>
            <StarIcon variant="outline" baseClassName={styles.starIcon} />
            {mode === 'page' ? `${label} · Full file` : label}
          </span>
          <p className={styles.statement}>{lede}</p>
          <div className={styles.spreadMeta}>
            <span>{title}</span>
            <span className={styles.accent}>Building TASKTROX</span>
            <span>{basedIn}</span>
          </div>
        </header>

        {/* ── experience ── */}
        <div className={styles.block}>
          <h3 className={styles.blockLabel}>
            <span className={styles.blockNo}>01</span> Experience
          </h3>
          <ol className={styles.expList}>
            {experience.map((e, i) => (
              <li className={styles.expItem} key={e.role + e.org} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.expNo}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.expMain}>
                  <h4 className={styles.expRole}>
                    {e.role}
                    {e.placeholder && <i className={styles.dagger}>†</i>}
                  </h4>
                  <p className={styles.expSummary}>{e.summary}</p>
                  {e.tags && (
                    <ul className={styles.tags}>
                      {e.tags.map((t) => (
                        <li className={styles.tag} key={t}>{t}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={styles.expAside}>
                  <span className={styles.expOrg}>{e.org}</span>
                  <span className={styles.expPeriod}>{e.period}</span>
                  <span className={styles.expKind}>{e.kind}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── certifications ── */}
        <div className={styles.block}>
          <h3 className={styles.blockLabel}>
            <span className={styles.blockNo}>02</span> Certifications
          </h3>
          <ul className={styles.badgeWall}>
            {certifications.map((c, i) => (
              <li className={styles.badge} key={c.name} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.badgeYear}>{c.year}</span>
                <span className={styles.badgeName}>
                  {c.name}
                  {c.placeholder && <i className={styles.dagger}>†</i>}
                </span>
                <span className={styles.badgeIssuer}>{c.issuer}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ── education ── */}
        <div className={styles.block}>
          <h3 className={styles.blockLabel}>
            <span className={styles.blockNo}>03</span> Education
          </h3>
          <ul className={styles.eduCards}>
            {education.map((e, i) => (
              <li className={styles.eduCard} key={e.credential} style={{ '--i': i } as React.CSSProperties}>
                <span className={styles.eduPeriod}>{e.period}</span>
                <h4 className={styles.eduCred}>
                  {e.credential}
                  {e.placeholder && <i className={styles.dagger}>†</i>}
                </h4>
                <span className={styles.eduInst}>{e.institution}</span>
                {e.detail && <p className={styles.eduDetail}>{e.detail}</p>}
              </li>
            ))}
          </ul>
        </div>

        {hasPlaceholder && (
          <p className={styles.footnote}>† Sample entry, pending real data.</p>
        )}
      </div>
    </section>
  );
}
