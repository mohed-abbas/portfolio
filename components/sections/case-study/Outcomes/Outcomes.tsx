"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import { SectionLabel } from "../SectionLabel";
import styles from "./Outcomes.module.css";

type Metric = {
  value: string;
  unit?: string;
  title: string;
  caption: string;
};

const METRICS: readonly Metric[] = [
  { value: "38", unit: "+", title: "Studios", caption: "onboarded in private beta" },
  { value: "2.4", unit: "×", title: "Time saved", caption: "weekly admin hours" },
  { value: "94", unit: "%", title: "Retention", caption: "3-month active studios" },
  { value: "01", title: "Tool replaced", caption: "Notion · Trello · sheets" },
] as const;

export function Outcomes() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const eyebrow = eyebrowRef.current;
      const grid = gridRef.current;
      if (!section || !eyebrow || !grid) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([eyebrow, grid], { autoAlpha: 0, y: 24 });
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 88%",
          once: true,
          onEnter: () => {
            gsap.to(eyebrow, {
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              ease: "expo.out",
              clearProps: "transform",
            });
            gsap.to(grid, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: "expo.out",
              delay: 0.35,
              clearProps: "transform",
            });
          },
        });
        return () => {
          trigger.kill();
          gsap.set([eyebrow, grid], { clearProps: "all" });
        };
      });
    },
    { scope: sectionRef }
  );

  useWordLineReveal(titleRef, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className={styles.outcomes}
      aria-labelledby="outcomes-eyebrow"
    >
      <div className={styles.head}>
        <SectionLabel
          ref={eyebrowRef}
          id="outcomes-eyebrow"
          className={styles.eyebrow}
        >
          Outcome
        </SectionLabel>
        <h2 ref={titleRef} className={styles.title}>
          What changed,
          <br />
          in <span className={styles.titleAccent}>numbers.</span>
        </h2>
      </div>

      <div ref={gridRef} className={styles.grid}>
        {METRICS.map((m) => (
          <div key={m.title} className={styles.metric}>
            <span className={styles.value}>
              {m.value}
              {m.unit && <sup>{m.unit}</sup>}
            </span>
            <span className={styles.label}>
              <b>{m.title}</b>
              {m.caption}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
