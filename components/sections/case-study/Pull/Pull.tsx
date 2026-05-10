"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import styles from "./Pull.module.css";

export function Pull() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const attrRef = useRef<HTMLDivElement>(null);

  // Attribution row keeps the block fade — avatar + name don't gain
  // anything from a per-word cascade.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const attr = attrRef.current;
      if (!section || !attr) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(attr, { autoAlpha: 0, y: 20 });

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 70%",
          once: true,
          onEnter: () =>
            gsap.to(attr, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "expo.out",
              delay: 0.4,
              clearProps: "transform",
            }),
        });

        return () => {
          trigger.kill();
          gsap.set(attr, { clearProps: "all" });
        };
      });
    },
    { scope: sectionRef }
  );

  // Display quote — same per-line cascade as the hero lede so the
  // testimonial reads as a single, considered statement.
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
