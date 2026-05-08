"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionLabel } from "../SectionLabel";
import styles from "./Vision.module.css";

export function Vision() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const head = headRef.current;
      const col = colRef.current;
      if (!section || !head || !col) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = [head, col];
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
      className={styles.vision}
      aria-labelledby="vision-eyebrow"
    >
      <div ref={headRef} className={styles.head}>
        <SectionLabel id="vision-eyebrow" className={styles.eyebrow}>
          The Vision
        </SectionLabel>
        <h2 className={styles.title}>
          A workspace that{" "}
          <span className={styles.titleUnderline}>respects</span>
          <br />
          the <span className={styles.titleAccent}>craft</span>.
        </h2>
      </div>

      <div ref={colRef} className={styles.col}>
        <p>
          Three principles shaped every screen.{" "}
          <strong>One: replace dashboards with documents.</strong> A studio
          thinks in artifacts, not metrics — so the product treats every
          project as a living folio you can mark up, not a feed you scroll
          past.
        </p>
        <p>
          <strong>Two: make the chrome quiet.</strong> Toolbars and toasts
          that earn their pixels. State changes that read as movement, not
          noise. <strong>Three: keep the tool truthful.</strong> If a number
          is provisional, say so. If a milestone slipped, show the slippage
          rather than recolour the badge.
        </p>
      </div>
    </section>
  );
}
