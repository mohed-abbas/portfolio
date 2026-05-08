"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionLabel } from "../SectionLabel";
import styles from "./Context.module.css";

export function Context() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const inner = innerRef.current;
      const col = colRef.current;
      if (!section || !inner || !col) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = [inner, col];
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
      className={styles.context}
      aria-labelledby="context-eyebrow"
    >
      <aside className={styles.margin}>
        <div ref={innerRef} className={styles.marginInner}>
          <SectionLabel id="context-eyebrow" className={styles.eyebrow}>
            Context
          </SectionLabel>
          <div className={styles.fact}>
            <b>Discipline</b>Brand · Product · Web
          </div>
          <div className={styles.fact}>
            <b>Duration</b>32 weeks
          </div>
          <div className={styles.fact}>
            <b>Team</b>1 designer · 2 engineers · 1 PM
          </div>
        </div>
      </aside>

      <div ref={colRef} className={styles.col}>
        <p className={styles.lede}>
          <strong>Tasktrox arrived</strong> with a stack of Notion docs, a
          battle-scarred Trello board, and one question. Why does software for
          architects feel like software for accountants?
        </p>
        <p>
          The brief was deceptively simple: build a project-management tool
          that actually feels like the studios it serves. Tactile. Editorial.
          Quietly precise. Not another rectangle of tabs and toasts.
        </p>
        <p>
          We threw out the SaaS playbook on day one.{" "}
          <strong>
            No purple gradients, no dashboard spaghetti, no AI-as-mascot.
          </strong>{" "}
          Instead we anchored the system in the language architects already
          speak: gridlines, plates, sectional cuts, marginalia.
        </p>
      </div>
    </section>
  );
}
