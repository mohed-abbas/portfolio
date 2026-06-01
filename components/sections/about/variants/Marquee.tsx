'use client';

/* ABOUT · Kinetic marquee
   Loud, brutalist-editorial: stacked bands of NAME / ROLE / skills / verbs
   loop in alternating directions, with the lede parked in a calm inset over a
   themed scrim. Pure-CSS marquee; reduced-motion pauses the tracks. */

import { Fragment } from 'react';
import { StarIcon } from '@/components/sections/Hero/StarIcon';
import { content } from '@/data';
import styles from './Marquee.module.css';

const SEP = '✦';

// One scrolling band. The group (items repeated, separated by an accent star)
// is rendered twice inside the track so the -50% loop is seamless.
function Band({
  items,
  direction,
  outline,
  size,
}: {
  items: string[];
  direction: 'left' | 'right';
  outline?: boolean;
  size: 'lg' | 'md';
}) {
  const reps = Array.from({ length: 3 }).flatMap(() => items);
  const group = (
    <span className={styles.group} aria-hidden="true">
      {reps.map((item, i) => (
        <Fragment key={i}>
          <span className={styles.item}>{item}</span>
          <span className={styles.sep}>{SEP}</span>
        </Fragment>
      ))}
    </span>
  );
  return (
    <div
      className={[
        styles.band,
        styles[size],
        outline ? styles.outline : '',
        direction === 'right' ? styles.toRight : styles.toLeft,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.track}>
        {group}
        {group}
      </div>
    </div>
  );
}

export function AboutMarquee() {
  const { firstName, lastName, title } = content.hero;
  const { label, lede } = content.about;
  const verbs = content.about.verbs.map((v) => v.replace(/\.$/, ''));

  return (
    <section className={styles.section} id="about" aria-label={`About: ${lede}`}>
      <div className={styles.eyebrow}>
        <StarIcon variant="outline" baseClassName={styles.starIcon} />
        {label}
      </div>

      <div className={styles.bands}>
        <Band items={[`${firstName} ${lastName}`]} direction="left" size="lg" />
        <Band items={[title]} direction="right" size="md" outline />
        <Band items={content.skills.marqueeItems} direction="left" size="md" />
        <Band items={verbs} direction="right" size="lg" outline />
      </div>

      <p className={styles.lede}>{lede}</p>
    </section>
  );
}
