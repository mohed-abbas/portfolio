"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "./Hero.module.css";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const card = cardRef.current;
      if (!section || !card) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Measure visual bounds BEFORE re-parenting (so transforms on
        // any ancestor — e.g. .middle's translateY — are baked in).
        const sRect = section.getBoundingClientRect();
        const cRect = card.getBoundingClientRect();
        const start = {
          left: cRect.left - sRect.left,
          top: cRect.top - sRect.top,
          width: cRect.width,
          height: cRect.height,
        };

        // Re-parent card to <body> AND make it position: fixed from the
        // start. ScrollTrigger pin leaves a transform on the section to
        // maintain layout, and any ancestor with a transform becomes the
        // containing block for fixed descendants — breaking viewport-
        // relative fixing. Living on body with position:fixed means the
        // card is always anchored to the actual viewport, and we animate
        // from there to full-bleed. The card stays in place throughout
        // the intro phase (no scroll movement) and only moves/grows in P2.
        const originalParent = card.parentElement;
        const fixedAt = {
          left: cRect.left,
          top: cRect.top,
          width: cRect.width,
          height: cRect.height,
        };
        document.body.appendChild(card);

        gsap.set(card, {
          position: "fixed",
          left: fixedAt.left,
          top: fixedAt.top,
          width: fixedAt.width,
          height: fixedAt.height,
          margin: 0,
          zIndex: 5,
        });

        // ── PHASE 1 ── Brief pin while intro elements fade out
        const introTL = gsap
          .timeline()
          .to(
            [metaRef.current, ledeRef.current],
            { autoAlpha: 0, y: -20, ease: "power2.in", duration: 0.5 },
            0
          )
          .to(
            badgeRef.current,
            { autoAlpha: 0, scale: 0.6, ease: "power2.in", duration: 0.5 },
            0
          )
          .to(
            titleRef.current,
            { autoAlpha: 0, y: 60, ease: "power2.in", duration: 0.6 },
            0.1
          );

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=25%",
          pin: true,
          pinType: "fixed",
          scrub: 0.4,
          animation: introTL,
          anticipatePin: 1,
        });

        // ── PHASE 2 ── Section unpins and free-scrolls under the card; the
        // card grows from its fixed rest position to fill the viewport,
        // then slides up to release the next section.
        const scaleTL = gsap
          .timeline()
          .to(
            card,
            {
              left: 0,
              top: 0,
              width: () => window.innerWidth,
              height: () => window.innerHeight,
              "--card-radius": "0px",
              ease: "power2.inOut",
              duration: 1,
            },
            0
          )
          .fromTo(
            innerRef.current,
            { scale: 1.04 },
            { scale: 1, ease: "none", duration: 1 },
            0
          )
          // Brief hold at full-bleed, then slide the card up off the
          // viewport so the next section can take over.
          .to(
            card,
            {
              top: () => -window.innerHeight,
              ease: "power2.in",
              duration: 0.5,
            },
            1.15
          );

        ScrollTrigger.create({
          trigger: section,
          start: "top+=25% top",
          end: () => "+=" + window.innerHeight * 1.6,
          scrub: 0.6,
          animation: scaleTL,
        });

        return () => {
          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === section || st.pin === card) st.kill();
          });
          gsap.set(card, { clearProps: "all" });
          if (originalParent && card.parentElement !== originalParent) {
            originalParent.appendChild(card);
          }
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div className={styles.top}>
        <div ref={metaRef} className={styles.metaRow}>
          <span className={styles.pill}>2024</span>
          <span className={styles.pill}>Architecture · SaaS</span>
          <span className={`${styles.pill} ${styles.pillSolid}`}>
            Brand · Product · Web
          </span>
        </div>
        <p ref={ledeRef} className={styles.lede}>
          A complete identity and product redesign for a project-management
          platform built for architecture studios — moving from spreadsheet
          sprawl to a single, sensorial workspace.
        </p>
      </div>

      <div className={styles.middle}>
        <figure ref={cardRef} className={styles.imageCard}>
          <div ref={innerRef} className={styles.imageInner}>
            <Image
              src="/images/work/tasktrox/Hero.jpg"
              alt="Tasktrox marketing landing"
              width={2400}
              height={1500}
              priority
            />
          </div>
          <span ref={badgeRef} className={styles.badge} aria-hidden="true">
            View
            <br />
            Case
          </span>
        </figure>
      </div>

      <h1 ref={titleRef} className={styles.titleText}>
        TASKTROX
      </h1>
    </section>
  );
}
