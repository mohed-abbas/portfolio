"use client";

/* ABOUT PAGE · Hero variant — "Cover".
   A photo-led editorial cover (Dennis Snellenberg vein): the portrait centred,
   the name set huge and overlapping the lower edge of the photo, muted paper
   palette, small meta chips, a grain wash for texture. The page's detail
   (vitals, bio, experience) lives below; this is purely the masthead moment.
   From content.about + hero + navigation. */

import { useRef } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/transitions";
import { useAccentColor } from "@/lib/AccentColorContext";
import { useBlockFadeIn } from "@/lib/useBlockFadeIn";
import { animationConfig, content, navigation } from "@/data";
import { SectionLabel } from "@/components/sections/case-study/SectionLabel";
import styles from "./HeroCover.module.css";

const cs = animationConfig.caseStudy;
const basedIn = navigation.location.replace(/^based in\s*/i, "");

export function AboutPageHeroCover() {
  const { color: currentAccent } = useAccentColor();
  const sectionRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

  useBlockFadeIn(sectionRef, {
    start: cs.scrollTrigger.early,
    groups: [
      { targets: [topRef], y: cs.blockFade.yShort, duration: cs.blockFade.durationShort },
      { targets: [portraitRef], y: cs.blockFade.yMedium, duration: cs.blockFade.durationLong, delay: 0.1 },
      { targets: [nameRef], y: cs.blockFade.yTall, duration: cs.blockFade.durationLong, delay: 0.25 },
      { targets: [footRef], y: cs.blockFade.yShort, duration: cs.blockFade.durationShort, delay: 0.5 },
    ],
  });

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.grain} aria-hidden="true" />

      <div ref={topRef} className={styles.top}>
        <TransitionLink
          href="/"
          className={styles.back}
          aria-label="Back to home"
          payload={{ accent: currentAccent }}
        >
          <span aria-hidden="true">←</span> Back
        </TransitionLink>
        <SectionLabel className={styles.eyebrow}>About · No. 01</SectionLabel>
      </div>

      <div className={styles.stage}>
        <span className={`${styles.chip} ${styles.chipLoc}`}>
          <span className={styles.dot} aria-hidden="true" />
          {basedIn}
        </span>
        <span className={`${styles.chip} ${styles.chipRole}`}>{content.hero.title}</span>

        <div ref={portraitRef} className={styles.portrait}>
          <Image
            className={styles.photo}
            src="/images/about/mohed-portrait.webp"
            alt="Mohed Abbas"
            width={800}
            height={800}
            priority
            sizes="(min-width: 1024px) 620px, 80vw"
          />
        </div>

        <h1 ref={nameRef} className={styles.name}>
          Mohed Abbas
        </h1>
      </div>

      <div ref={footRef} className={styles.foot}>
        <p className={styles.line}>
          I build web products end to end, from the interface to the containers it runs in.
        </p>
        <span className={styles.scroll} aria-hidden="true">
          Scroll <span className={styles.scrollArrow}>↓</span>
        </span>
      </div>
    </section>
  );
}
