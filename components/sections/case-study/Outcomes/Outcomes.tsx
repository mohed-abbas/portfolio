"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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
  const headRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const head = headRef.current;
      const grid = gridRef.current;
      if (!section || !head || !grid) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = [head, grid];
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
      className={styles.outcomes}
      aria-labelledby="outcomes-eyebrow"
    >
      <div ref={headRef} className={styles.head}>
        <SectionLabel id="outcomes-eyebrow" className={styles.eyebrow}>
          Outcome
        </SectionLabel>
        <h2 className={styles.title}>
          What changed,
          <br />
          in <span className={styles.titleAccent}>numbers</span>.
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
