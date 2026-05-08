"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SectionLabel } from "../SectionLabel";
import styles from "./Product.module.css";

export function Product() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const eyebrow = eyebrowRef.current;
      const title = titleRef.current;
      const col = colRef.current;
      if (!section || !eyebrow || !title || !col) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = [eyebrow, title, col];
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
      className={styles.product}
      aria-labelledby="product-eyebrow"
    >
      <div className={styles.head}>
        <div className={styles.row}>
          <SectionLabel
            ref={eyebrowRef}
            id="product-eyebrow"
            className={styles.eyebrow}
          >
            The Product
          </SectionLabel>
          <h2 ref={titleRef} className={styles.title}>
            The dashboard,
            <br />
            read like a <span className={styles.titleAccent}>plate</span>.
          </h2>
        </div>
      </div>

      <div ref={colRef} className={styles.col}>
        <p>
          The dashboard treats every project as an architectural plate.{" "}
          <strong>
            Sectional header, living grid, margin notes
          </strong>{" "}
          — the right rail is for context, never controls, lifted directly
          from the way studios annotate drawings.
        </p>
        <p>
          Cards align to the 8-pt grid but breathe within it. No two states
          look identical without reason. Motion is 240ms expo.out — fast
          enough to feel earned, slow enough to read.
        </p>
      </div>
    </section>
  );
}
