"use client";

import { useRef } from "react";
import { useBlockFadeIn } from "@/lib/useBlockFadeIn";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import styles from "./Pull.module.css";

export function Pull() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const attrRef = useRef<HTMLDivElement>(null);

  useBlockFadeIn(sectionRef, {
    start: "top 70%",
    groups: [{ targets: [attrRef], y: 20, duration: 0.8, delay: 0.4 }],
  });

  useWordLineReveal(quoteRef, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className={styles.pull}
      aria-label="Client testimonial"
    >
      <blockquote ref={quoteRef} className={styles.quote} cite="#">
        “For the first time the software{" "}
        <span className={styles.quoteAccent}>respects</span> the way our studio
        actually thinks.”
      </blockquote>
      <div ref={attrRef} className={styles.attr}>
        <span className={styles.avatar} aria-hidden />
        <span className={styles.attrText}>
          <b>Léa Marchand</b>Principal — Atelier Marchand, Lyon
        </span>
      </div>
    </section>
  );
}
