"use client";

/* ABOUT PAGE · Hero
   Editorial open that borrows the case-study reading language: a back
   affordance, eyebrow, a pill row, and a large statement that reveals
   word-by-word on load. No pinned-card grow here, the page reads as a
   document, not a cinematic. From content.about + hero. */

import { useRef } from "react";
import { TransitionLink } from "@/components/transitions";
import { useAccentColor } from "@/lib/AccentColorContext";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import { content } from "@/data";
import { SectionLabel } from "@/components/sections/case-study/SectionLabel";
import styles from "./Hero.module.css";

const PILLS = ["Full Stack Web Engineer", "Builds independently", "TASKTROX"];

export function AboutPageHero() {
  const { color: currentAccent } = useAccentColor();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useWordLineReveal(titleRef, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.top}>
        <TransitionLink
          href="/"
          className={styles.back}
          aria-label="Back to home"
          payload={{ accent: currentAccent }}
        >
          <span aria-hidden="true">←</span> Back
        </TransitionLink>
        <div className={styles.pills}>
          {PILLS.map((p, i) => (
            <span
              key={p}
              className={i === PILLS.length - 1 ? `${styles.pill} ${styles.pillSolid}` : styles.pill}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <SectionLabel className={styles.eyebrow}>About · Mohed Abbas</SectionLabel>

      <h1 ref={titleRef} className={styles.statement}>
        {content.about.lede}
      </h1>
    </section>
  );
}
