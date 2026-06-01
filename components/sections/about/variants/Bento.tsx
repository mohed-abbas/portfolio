'use client';

/* ABOUT · Bento profile grid
   Modular tiles: a big name/role block, an accent "currently building" tile,
   the lede, stack chips, location, and a star/independent tile. Tiles stagger
   in with a CSS delay (reduced-motion shows them settled). All from existing
   content. */

import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content, navigation } from '@/data';
import styles from './Bento.module.css';

const basedIn = navigation.location.replace(/^based in\s*/i, '');

export function AboutBento() {
  const { firstName, lastName, title } = content.hero;
  const { label, lede } = content.about;
  const chips = content.skills.marqueeItems;

  // index drives the entrance stagger; order matches DOM order below
  let i = 0;
  const tile = () => ({ '--i': i++ } as React.CSSProperties);

  return (
    <section className={styles.section} id="about">
      <div className={styles.inner}>
        <div className={styles.metaLabel}>
          <StarIcon variant="outline" baseClassName={styles.starIcon} />
          {label}
        </div>

        <div className={styles.grid}>
          <div className={`${styles.tile} ${styles.name}`} style={tile()}>
            <h2 className={styles.nameType}>
              <span>{firstName}</span>
              <span>{lastName}</span>
            </h2>
            <span className={styles.role}>{title}</span>
          </div>

          <div className={`${styles.tile} ${styles.task}`} style={tile()}>
            <span className={styles.taskLabel}>Currently building</span>
            <span className={styles.taskName}>TASKTROX</span>
          </div>

          <div className={`${styles.tile} ${styles.lede}`} style={tile()}>
            <p>{lede}</p>
          </div>

          <div className={`${styles.tile} ${styles.focus}`} style={tile()}>
            <span className={styles.tileLabel}>Focus</span>
            <ul className={styles.chips}>
              {chips.map((c) => (
                <li key={c} className={styles.chip}>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.tile} ${styles.loc}`} style={tile()}>
            <span className={styles.tileLabel}>Based in</span>
            <span className={styles.locValue}>{basedIn}</span>
          </div>

          <div className={`${styles.tile} ${styles.star}`} style={tile()}>
            <StarIcon variant="outline" baseClassName={styles.starBig} />
            <span className={styles.starWord}>Independent</span>
          </div>
        </div>
      </div>
    </section>
  );
}
