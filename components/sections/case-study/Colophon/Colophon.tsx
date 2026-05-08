"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionLabel } from "../SectionLabel";
import styles from "./Colophon.module.css";

type Credit = {
  role: string;
  primary: string;
  secondary?: string;
};

const CREDITS: readonly Credit[] = [
  { role: "Design Lead", primary: "Mohed Abbas", secondary: "Brand · Product · Motion" },
  { role: "Engineering", primary: "Aria Cole", secondary: "Sven Ortega" },
  { role: "Product", primary: "Mira Tarek", secondary: "Strategy & PM" },
  { role: "Special thanks", primary: "Atelier Marchand", secondary: "Studio Petralla, Cadence Works" },
] as const;

export function Colophon() {
  const sectionRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const left = leftRef.current;
      const right = rightRef.current;
      if (!section || !left || !right) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = [left, right];
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
      className={styles.colophon}
      aria-labelledby="colophon-eyebrow"
    >
      <div className={styles.inner}>
        <div ref={leftRef}>
          <SectionLabel id="colophon-eyebrow" className={styles.eyebrow}>
            Colophon
          </SectionLabel>
          <h2 className={styles.title}>
            Made with a small{" "}
            <span className={styles.titleAccent}>circle</span>.
          </h2>
          <dl className={styles.credits}>
            {CREDITS.map((c) => (
              <div key={c.role} className={styles.credit}>
                <dt>{c.role}</dt>
                <dd>{c.primary}</dd>
                {c.secondary && <dd>{c.secondary}</dd>}
              </div>
            ))}
          </dl>
        </div>

        <div ref={rightRef} className={styles.bio}>
          <SectionLabel className={styles.eyebrow}>About M.A</SectionLabel>
          <p>
            Mohed Abbas is an independent designer working at the seam of
            brand, product and the small motion details that make software
            feel made. Selected work from 2018 → present.
          </p>
          <p>
            Currently taking on one new engagement per quarter — typically a
            6 to 14-week sprint covering identity, a flagship surface, and
            the design system that holds them together.
          </p>
          <div className={styles.actions}>
            <a className={`${styles.pill} ${styles.pillSolid}`} href="#">
              Start a project →
            </a>
            <a className={styles.pill} href="#">
              Read approach
            </a>
            <a className={`${styles.pill} ${styles.pillGhost}`} href="#">
              All works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
