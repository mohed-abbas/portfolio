'use client';

/* ABOUT · Career transit-line
   A Vignelli-style line for the career, echoing the Workflow transit section so
   the two rhyme. A single rail runs top-to-bottom through three labelled zones
   (Experience / Certifications / Education); each entry is a metro "station" on
   the rail. Stacked, so it lives full-length in the home scroll.

   Built from content.about; placeholder CV entries carry a dagger + footnote. */

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content } from '@/data';
import styles from './Timeline.module.css';

export function AboutTimeline() {
  const { label, lede, experience, certifications, education } = content.about;
  const hasPlaceholder =
    experience.some((e) => e.placeholder) ||
    certifications.some((c) => c.placeholder) ||
    education.some((e) => e.placeholder);

  // running index drives the rail's reveal stagger across all stations
  let n = 0;
  const at = () => ({ '--i': n++ } as React.CSSProperties);

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <header className={styles.head}>
          <span className={styles.eyebrow}>
            <StarIcon variant="outline" baseClassName={styles.starIcon} />
            {label} · The line so far
          </span>
          <p className={styles.lede}>{lede}</p>
        </header>

        <div className={styles.rail}>
          {/* EXPERIENCE zone */}
          <div className={styles.zoneLabel} style={at()}>
            <span className={styles.zoneDot} />
            Experience
          </div>
          {experience.map((e) => (
            <article className={styles.station} key={e.role + e.org} style={at()}>
              <span className={styles.bullet} aria-hidden="true" />
              <span className={styles.period}>{e.period}</span>
              <div className={styles.body}>
                <h3 className={styles.role}>
                  {e.role}
                  {e.placeholder && <i className={styles.dagger}>†</i>}
                </h3>
                <span className={styles.org}>
                  {e.org} <span className={styles.kind}>· {e.kind}</span>
                </span>
                <p className={styles.summary}>{e.summary}</p>
                {e.tags && (
                  <ul className={styles.tags}>
                    {e.tags.map((t) => (
                      <li className={styles.tag} key={t}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}

          {/* CERTIFICATIONS zone */}
          <div className={styles.zoneLabel} style={at()}>
            <span className={styles.zoneDot} />
            Certifications
          </div>
          <div className={styles.nodeRow} style={at()}>
            <span className={styles.bullet} aria-hidden="true" />
            <ul className={styles.certs}>
              {certifications.map((c) => (
                <li className={styles.cert} key={c.name}>
                  <span className={styles.certName}>
                    {c.name}
                    {c.placeholder && <i className={styles.dagger}>†</i>}
                  </span>
                  <span className={styles.certMeta}>
                    {c.issuer} · {c.year}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* EDUCATION zone */}
          <div className={styles.zoneLabel} style={at()}>
            <span className={styles.zoneDot} />
            Education
          </div>
          {education.map((e) => (
            <article className={styles.station} key={e.credential} style={at()}>
              <span className={styles.bullet} aria-hidden="true" />
              <span className={styles.period}>{e.period}</span>
              <div className={styles.body}>
                <h3 className={styles.role}>
                  {e.credential}
                  {e.placeholder && <i className={styles.dagger}>†</i>}
                </h3>
                <span className={styles.org}>{e.institution}</span>
                {e.detail && <p className={styles.summary}>{e.detail}</p>}
              </div>
            </article>
          ))}

          {/* terminus */}
          <div className={styles.terminus} style={at()}>
            <span className={styles.terminusBullet} aria-hidden="true" />
            <span className={styles.terminusLabel}>Now · building TASKTROX</span>
          </div>
        </div>

        {hasPlaceholder && (
          <p className={styles.footnote}>† Sample entry, pending real data.</p>
        )}
      </div>
    </section>
  );
}
