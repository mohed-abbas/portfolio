"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { content } from "@/data";
import styles from "./Hero.module.css";

const TITLE = "TASKTROX";

const LEDE_TEXT =
  "A complete identity and product redesign for a project-management platform built for architecture studios — moving from spreadsheet sprawl to a single, sensorial workspace.";
const LEDE_WORDS = LEDE_TEXT.split(" ");

// Portal-entry directions (matches landing hero — letter slides in from
// outside its own mask along one of four cardinal axes).
const PORTAL_DIRECTIONS = [
  { x: 0, y: -110 },
  { x: 0, y: 110 },
  { x: -110, y: 0 },
  { x: 110, y: 0 },
] as const;

const randomPortalDirection = () =>
  PORTAL_DIRECTIONS[Math.floor(Math.random() * PORTAL_DIRECTIONS.length)];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const backRef = useRef<HTMLAnchorElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const ledeRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // ── ON-LOAD entrance ──
  // (a) TASKTROX title — each letter sits inside its own overflow:hidden
  //     mask; the inner span starts pushed 110% along a random cardinal
  //     direction and slides home with a staggered cascade. Mirrors the
  //     landing-hero portal pattern so the case-study reads as a
  //     continuation of the same motion language.
  // (b) Lede paragraph — each word is wrapped in its own mask; we group
  //     masks by their post-layout offsetTop to recover visual lines
  //     (since wrapping is responsive), then animate inner spans up
  //     from yPercent:110 → 0 with a per-line stagger so each row of
  //     text rises from its own baseline.
  useGSAP(
    () => {
      const title = titleRef.current;
      const lede = ledeRef.current;
      if (!title) return;

      const innerLetters = title.querySelectorAll<HTMLElement>(
        `.${styles.titleLetterInner}`
      );
      const ledeMasks = lede
        ? lede.querySelectorAll<HTMLElement>(`.${styles.ledeWord}`)
        : null;
      const ledeInners = lede
        ? lede.querySelectorAll<HTMLElement>(`.${styles.ledeWordInner}`)
        : null;

      if (!innerLetters.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Title — per-letter portal entrance.
        innerLetters.forEach((el) => {
          const dir = randomPortalDirection();
          gsap.set(el, { xPercent: dir.x, yPercent: dir.y });
        });

        const titleTween = gsap.to(innerLetters, {
          xPercent: 0,
          yPercent: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          delay: 0.1,
        });

        // Back link — sits above the pills and shares their reading-order
        // entrance so the back-to-home affordance is visible from frame one.
        const backEl = backRef.current;
        let backTween: gsap.core.Tween | null = null;
        if (backEl) {
          gsap.set(backEl, { autoAlpha: 0, y: 8 });
          backTween = gsap.to(backEl, {
            autoAlpha: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            delay: 0,
            clearProps: "transform",
          });
        }

        // Pills — top-of-cascade entrance (fires earliest so the eye
        // moves from pills → title → lede in reading order).
        const pillEls = metaRef.current
          ? metaRef.current.querySelectorAll<HTMLElement>(`.${styles.pill}`)
          : null;
        let pillsTween: gsap.core.Tween | null = null;
        if (pillEls && pillEls.length) {
          gsap.set(pillEls, { autoAlpha: 0, y: 12 });
          pillsTween = gsap.to(pillEls, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.07,
            delay: 0.05,
            clearProps: "transform",
          });
        }

        // Badge — late flourish; rests at the CSS-defined 8deg tilt so
        // the final rotation value is 8 (not 0). Initial rotation:-45
        // gives the pop room to swing into place.
        const badge = badgeRef.current;
        let badgeTween: gsap.core.Tween | null = null;
        if (badge) {
          gsap.set(badge, { autoAlpha: 0, scale: 0, rotation: -45 });
          badgeTween = gsap.to(badge, {
            autoAlpha: 1,
            scale: 1,
            rotation: 8,
            duration: 0.7,
            ease: "back.out(1.4)",
            delay: 0.6,
            // Hand transform back to the CSS rotate(8deg) baseline once the
            // pop completes, so the :hover rule can compose without GSAP's
            // inline transform shadowing it.
            clearProps: "transform",
          });
        }

        // Lede — line-grouped baseline reveal. Group word masks by
        // their offsetTop (rounded to absorb sub-pixel rounding) so
        // every word on the same wrapped line shares one tween.
        let ledeTL: gsap.core.Timeline | null = null;
        if (ledeMasks && ledeInners && ledeMasks.length) {
          const lineMap = new Map<number, HTMLElement[]>();
          ledeMasks.forEach((mask, i) => {
            const key = Math.round(mask.offsetTop);
            if (!lineMap.has(key)) lineMap.set(key, []);
            lineMap.get(key)!.push(ledeInners[i]);
          });
          const lineGroups = [...lineMap.entries()]
            .sort(([a], [b]) => a - b)
            .map(([, els]) => els);

          gsap.set(ledeInners, { yPercent: 110 });

          ledeTL = gsap.timeline({ delay: 0.4 });
          lineGroups.forEach((group, lineIdx) => {
            ledeTL!.to(
              group,
              { yPercent: 0, duration: 0.7, ease: "power2.out" },
              lineIdx * 0.12
            );
          });
        }

        return () => {
          titleTween.kill();
          gsap.set(innerLetters, { clearProps: "transform" });
          if (backTween) backTween.kill();
          if (backEl) gsap.set(backEl, { clearProps: "all" });
          if (pillsTween) pillsTween.kill();
          if (pillEls) gsap.set(pillEls, { clearProps: "all" });
          if (badgeTween) badgeTween.kill();
          if (badge) gsap.set(badge, { clearProps: "all" });
          if (ledeTL) ledeTL.kill();
          if (ledeInners) gsap.set(ledeInners, { clearProps: "transform" });
        };
      });
    },
    { scope: sectionRef }
  );

  // ── IDLE PARALLAX ── Subtle viewport-driven mouse follow on the
  // image inner so the framed photo feels alive at rest. ±6px max
  // translate is small enough not to fight the master scroll-grow's
  // scale fromTo, and quickTo lerps between targets so per-frame
  // updates stay cheap. Touch and reduced-motion users skip it.
  useGSAP(
    () => {
      const inner = innerRef.current;
      if (!inner) return;

      const mm = gsap.matchMedia();

      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          const xTo = gsap.quickTo(inner, "x", {
            duration: 0.7,
            ease: "power2.out",
          });
          const yTo = gsap.quickTo(inner, "y", {
            duration: 0.7,
            ease: "power2.out",
          });

          const handleMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            xTo(nx * 6);
            yTo(ny * 6);
          };

          window.addEventListener("mousemove", handleMove, { passive: true });

          return () => {
            window.removeEventListener("mousemove", handleMove);
            gsap.set(inner, { clearProps: "x,y" });
          };
        }
      );
    },
    { scope: sectionRef }
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const card = cardRef.current;
      if (!section || !card) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Measure visual bounds BEFORE re-parenting (so transforms on
        // any ancestor — e.g. .middle's translateY — are baked in).
        const cRect = card.getBoundingClientRect();

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

        // Resolve --card-radius to a concrete px value so GSAP can tween
        // (and reverse) it cleanly. getComputedStyle on a custom property
        // returns the unresolved clamp() string, which GSAP can't reverse;
        // borderRadius is the shorthand, which IS resolved to px.
        const initialRadiusPx =
          parseFloat(getComputedStyle(card).borderRadius) || 0;

        gsap.set(card, {
          position: "fixed",
          left: fixedAt.left,
          top: fixedAt.top,
          width: fixedAt.width,
          height: fixedAt.height,
          margin: 0,
          zIndex: 5,
          autoAlpha: 0,
          "--card-radius": initialRadiusPx + "px",
        });

        // ── ON-LOAD card fade-in ── Card box is locked in place by the
        // gsap.set above, so a pure autoAlpha tween won't perturb the
        // measurements the master scroll-timeline relies on. Runs
        // independently of the scrubbed master TL.
        const cardEntranceTween = gsap.to(card, {
          autoAlpha: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        });

        // ── PINNED MASTER TIMELINE ── Two pin triggers on the same
        // element don't accumulate pin distance (they share one
        // pin-spacer sized for the first), so intro fade and grow are
        // sequenced in a single timeline under a single pin trigger.
        // Total normalised duration: 1.35 (0.25 fade-out + 1.0 grow +
        // 0.1 hold tail at full-bleed). Pin scroll range is mapped to
        // the same 1.35 × vh so 1 timeline-unit ≈ 1 vh of scroll.
        const masterTL = gsap
          .timeline()
          // Intro fade — plays in the first 0.5 units of the timeline.
          .to(
            [metaRef.current, ledeRef.current],
            { autoAlpha: 0, y: -20, ease: "power2.in", duration: 0.5 },
            0
          )
          .to(
            titleRef.current,
            { autoAlpha: 0, y: 60, ease: "power2.in", duration: 0.5 },
            0.05
          )
          // Grow — starts as the intro is finishing so the transition
          // feels continuous. Runs for 1 unit (≈ 1 vh of scroll).
          .to(
            card,
            {
              left: 0,
              top: 0,
              width: () => window.innerWidth,
              height: () => window.innerHeight,
              ease: "power2.inOut",
              duration: 1,
            },
            0.25
          )
          .fromTo(
            innerRef.current,
            { scale: 1.04 },
            { scale: 1, ease: "none", duration: 1 },
            0.25
          )
          // Fade box-shadow out as the card reaches full-bleed — at full
          // scale there's no surrounding canvas for a shadow to land on.
          .to(
            card,
            {
              boxShadow: "0 0 0 0 rgba(0, 0, 0, 0)",
              ease: "power2.inOut",
              duration: 1,
            },
            0.25
          )
          // Hold rounded corners until ~80% of the grow, then snap.
          .to(
            card,
            {
              "--card-radius": "0px",
              ease: "power2.out",
              duration: 0.22,
            },
            1.05
          );

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 1.35,
          pin: true,
          pinType: "fixed",
          scrub: 0.5,
          animation: masterTL,
          anticipatePin: 1,
        });

        // ── BADGE SCROLL-FADE ── Lives outside the master timeline so
        // the on-load pop tween (delay 0.6s) can't be clobbered by the
        // master TL's lazy fromState capture. Explicit fromTo values +
        // immediateRender:false guarantees the badge is read as
        // (autoAlpha:1, scale:1) the first time the user scrolls into
        // this trigger's range — no matter what state the entrance
        // tween is in at that moment.
        const badgeFadeTL = gsap.fromTo(
          badgeRef.current,
          { autoAlpha: 1, scale: 1, immediateRender: false },
          { autoAlpha: 0, scale: 0.6, ease: "power2.in" }
        );

        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * 0.5,
          scrub: 0.5,
          animation: badgeFadeTL,
        });

        // ── EXIT (unpinned, 1:1 scrub) ── As the page scrolls 1 vh
        // past the pin, the card translates from top:0 to top:-vh
        // linearly. The ledger sits in document flow immediately after
        // the section, so it climbs into the viewport at the same
        // rate — bottom-of-card and top-of-ledger share one line
        // throughout, and the card is fully off-screen at the moment
        // the ledger lands at viewport top.
        const exitTL = gsap.timeline().to(
          card,
          {
            top: () => -window.innerHeight,
            ease: "none",
            duration: 1,
          },
          0
        );

        ScrollTrigger.create({
          trigger: section,
          start: () => window.innerHeight * 1.35,
          end: () => window.innerHeight * 2.35,
          scrub: true,
          animation: exitTL,
          invalidateOnRefresh: true,
        });

        return () => {
          cardEntranceTween.kill();
          ScrollTrigger.getAll().forEach((st) => {
            if (st.trigger === section || st.pin === card) st.kill();
          });
          gsap.set(card, { clearProps: "all" });
          if (originalParent?.isConnected && card.parentElement !== originalParent) {
            originalParent.appendChild(card);
          }
        };
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className={styles.hero}>
      {/* Hidden width-only sizer — mirrors the wordmark's per-letter
          inline-block structure so its rendered width matches the
          visible title to the pixel. See .titleSizer in CSS. */}
      <span className={styles.titleSizer} aria-hidden="true">
        {TITLE.split("").map((letter, i) => (
          <span key={i} className={styles.titleLetter}>
            {letter}
          </span>
        ))}
      </span>
      <div className={styles.top}>
        <div className={styles.metaCol}>
          <Link
            ref={backRef}
            href="/"
            className={styles.backLink}
            aria-label="Back to home"
          >
            <span aria-hidden="true">←</span>
            {content.ui.buttons.back}
          </Link>
          <div ref={metaRef} className={styles.metaRow}>
            <span className={styles.pill}>2024</span>
            <span className={styles.pill}>Architecture · SaaS</span>
            <span className={`${styles.pill} ${styles.pillSolid}`}>
              Brand · Product · Web
            </span>
          </div>
        </div>
        <p ref={ledeRef} className={styles.lede}>
          {LEDE_WORDS.map((word, i) => (
            <Fragment key={i}>
              <span className={styles.ledeWord}>
                <span className={styles.ledeWordInner}>{word}</span>
              </span>
              {i < LEDE_WORDS.length - 1 ? " " : null}
            </Fragment>
          ))}
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

      <h1 ref={titleRef} className={styles.titleText} aria-label={TITLE}>
        {TITLE.split("").map((letter, index) => (
          <span
            key={index}
            className={styles.titleLetter}
            aria-hidden="true"
          >
            <span className={styles.titleLetterInner}>{letter}</span>
          </span>
        ))}
      </h1>
    </section>
  );
}
