"use client";

import { useRef } from "react";
import { useBlockFadeIn } from "@/lib/useBlockFadeIn";
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

  useBlockFadeIn(sectionRef, {
    groups: [
      { targets: [eyebrowRef], y: 24, duration: 0.7 },
      { targets: [gridRef], y: 24, duration: 0.9, delay: 0.35 },
    ],
  });

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
