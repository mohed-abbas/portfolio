"use client";

import { useRef } from "react";
import { useScrubbedActsReveal } from "@/lib/useScrubbedActsReveal";
import styles from "./Pull.module.css";

const ACT2_LINES: Array<{ text: string; accent?: boolean }> = [
  { text: "“For the first time" },
  { text: "the software" },
  { text: "respects", accent: true },
];

const ACT3_LINES: Array<{ text: string; accent?: boolean }> = [
  { text: "the way our studio" },
  { text: "actually thinks.”" },
];

export function Pull() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const act1Ref = useRef<HTMLElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const act3Ref = useRef<HTMLDivElement>(null);

  useScrubbedActsReveal({
    scope: sectionRef,
    sticky: stickyRef,
    act1: act1Ref,
    act2: act2Ref,
    act3: act3Ref,
  });

  return (
    <section
      ref={sectionRef}
      className={styles.pull}
      aria-label="Client testimonial"
    >
      <figure className={styles.figure}>
        <div ref={stickyRef} className={styles.sticky}>
          {/* Pre-set aria-label on the attribution + the two quote
              acts: splitTextIntoWords synthesises an aria-label on any
              root it splits when none exists, which would (a) double-
              announce the testimonial alongside the <blockquote>'s
              own aria-label and (b) replace the <b> semantics of the
              name with an upper-cased flat string. The blockquote's
              aria-label below is the single source of truth for the
              quote; the figcaption supplies the speaker. */}
          <figcaption
            ref={act1Ref}
            className={styles.act1}
            aria-label="Léa Marchand, Principal, Atelier Marchand, Lyon"
          >
            <span className={styles.avatar} aria-hidden="true" />
            <span className={styles.attrText}>
              <b>Léa Marchand</b>
              <span>Principal, Atelier Marchand, Lyon</span>
            </span>
          </figcaption>

          <blockquote
            className={styles.quote}
            aria-label="For the first time the software respects the way our studio actually thinks."
          >
            <div ref={act2Ref} className={styles.act2} aria-hidden="true">
              {ACT2_LINES.map((line, i) => (
                <span
                  key={i}
                  className={
                    line.accent
                      ? `${styles.quoteLine} ${styles.accent}`
                      : styles.quoteLine
                  }
                >
                  {line.text}
                </span>
              ))}
            </div>
            <div ref={act3Ref} className={styles.act3} aria-hidden="true">
              {ACT3_LINES.map((line, i) => (
                <span key={i} className={styles.quoteLine}>
                  {line.text}
                </span>
              ))}
            </div>
          </blockquote>
        </div>
      </figure>
    </section>
  );
}
