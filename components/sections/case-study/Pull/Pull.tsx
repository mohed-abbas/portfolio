"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "./Pull.module.css";

export function Pull() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const attrRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const quote = quoteRef.current;
      const attr = attrRef.current;
      if (!section || !quote || !attr) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = [quote, attr];
        gsap.set(targets, { autoAlpha: 0, y: 28 });

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.08,
              clearProps: "transform",
            }),
        });

        return () => {
          trigger.kill();
          gsap.set(targets, { clearProps: "all" });
        };
      });
    },
    { scope: sectionRef }
  );

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
