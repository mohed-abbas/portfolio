'use client';

import { content } from '@/data';
import { Star } from './Star';
import {
  FACES,
  HEADING_ID,
  classifyFaceWord,
  formatFaceIndex,
} from './constants';
import styles from './Services.module.css';

/* Static fallback — rendered when prefers-reduced-motion is set OR the user
   is on a coarse-pointer / small-screen device. All faces are visible in
   flow; no scroll hijack, no GSAP. Mirrors the InteractiveBackground
   architectural convention of stripping interactive flourishes when input
   modality or motion preference can't support them. */
export function StaticServices() {
  return (
    <section className={styles.wrapper} aria-labelledby={HEADING_ID}>
      <div className={styles.metaLabel}>
        <Star className={styles.starIcon} />
        {content.services.label}
      </div>

      <header className={styles.head}>
        <h2 id={HEADING_ID}>
          {content.services.headline.lead}
          <br />
          <em>{content.services.headline.accent}</em>
        </h2>
        <p dangerouslySetInnerHTML={{ __html: content.services.intro }} />
      </header>

      <ol className={styles.stack}>
        {FACES.map((face, i) => (
          <li key={face.word} className={styles.stackCard}>
            <div className={styles.stackHead}>
              <strong>{face.rail}</strong>
              <span>{formatFaceIndex(i)}</span>
            </div>
            <span className={styles.stackWord}>
              {classifyFaceWord(face.word).map(({ ch, accent }, j) => (
                <span key={j} className={accent ? styles.accent : undefined}>{ch}</span>
              ))}
            </span>
            <p
              className={styles.stackCopy}
              dangerouslySetInnerHTML={{ __html: face.copy }}
            />
            <div className={styles.stackTools}>
              {face.tools.map((tool) => (
                <span key={tool} className={styles.stackTool}>{tool}</span>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
