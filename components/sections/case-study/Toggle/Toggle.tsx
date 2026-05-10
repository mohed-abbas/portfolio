"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useWordLineReveal } from "@/lib/useWordLineReveal";
import { SectionLabel } from "../SectionLabel";
import styles from "./Toggle.module.css";

type Mode = "gallery" | "list";

type Screen = {
  src: string;
  alt: string;
  galleryCaption?: { label: string; num: string };
  list: { num: string; name: string; desc: string; meta: string };
};

const SCREENS: readonly Screen[] = [
  {
    src: "/images/work/tasktrox/Hero.jpg",
    alt: "Marketing landing",
    list: {
      num: "01",
      name: "Marketing landing",
      desc: "Hero composition, scroll-led greeting",
      meta: "2400 × 1500",
    },
  },
  {
    src: "/images/work/tasktrox/Dashboard.jpg",
    alt: "Studio dashboard",
    list: {
      num: "02",
      name: "Studio dashboard",
      desc: "Sectional header + living grid",
      meta: "2400 × 1500",
    },
  },
  {
    src: "/images/work/tasktrox/Product.jpg",
    alt: "Product surface",
    galleryCaption: { label: "02 — Product surface", num: "03 / 24" },
    list: {
      num: "03",
      name: "Product surface",
      desc: "Card system, 8-pt grid",
      meta: "2400 × 1500",
    },
  },
  {
    src: "/images/work/tasktrox/About.jpg",
    alt: "Studio profile",
    galleryCaption: { label: "03 — Studio profile", num: "11 / 24" },
    list: {
      num: "04",
      name: "Studio profile",
      desc: "Folio-style team page",
      meta: "2400 × 1500",
    },
  },
  {
    src: "/images/work/tasktrox/Price.jpg",
    alt: "Pricing",
    galleryCaption: { label: "04 — Pricing", num: "14 / 24" },
    list: {
      num: "05",
      name: "Pricing",
      desc: "Three tiers, no asterisks",
      meta: "2400 × 1500",
    },
  },
  {
    src: "/images/work/tasktrox/testimonials.jpg",
    alt: "Testimonials",
    galleryCaption: { label: "05 — Testimonials", num: "19 / 24" },
    list: {
      num: "06",
      name: "Testimonials",
      desc: "Studio quotes, marginalia",
      meta: "2400 × 1500",
    },
  },
  {
    src: "/images/work/tasktrox/footer.jpg",
    alt: "Footer marquee",
    galleryCaption: { label: "06 — Footer marquee", num: "24 / 24" },
    list: {
      num: "07",
      name: "Footer marquee",
      desc: "Closing flourish",
      meta: "2400 × 1500",
    },
  },
] as const;

const GALLERY_SCREENS = SCREENS.filter((s) => s.galleryCaption);

export function Toggle() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>("gallery");
  // Preview position is updated via direct style mutation in
  // handleRowMove rather than React state — pumping setState on every
  // mousemove forces a re-render of all 24 list rows + the gallery.
  // Visibility + src still go through state because they change rarely.
  const [preview, setPreview] = useState<{ visible: boolean; src: string }>(
    { visible: false, src: "" }
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      const modes = modesRef.current;
      const view = viewRef.current;
      if (!section || !modes || !view) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Mode toggle + view stack get a quiet block fade — title runs
        // its own per-line cascade via useWordLineReveal below.
        const targets = [modes, view];
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

  useWordLineReveal(titleRef, { scope: sectionRef });

  const movePreview = (clientX: number, clientY: number) => {
    const el = previewRef.current;
    if (!el) return;
    el.style.left = `${clientX}px`;
    el.style.top = `${clientY}px`;
  };
  const handleRowEnter = (src: string) => (e: React.MouseEvent) => {
    movePreview(e.clientX, e.clientY);
    setPreview({ visible: true, src });
  };
  const handleRowLeave = () => setPreview((p) => ({ ...p, visible: false }));
  const handleRowMove = (e: React.MouseEvent) => {
    movePreview(e.clientX, e.clientY);
  };

  return (
    <section
      ref={sectionRef}
      className={styles.toggle}
      aria-labelledby="toggle-eyebrow"
    >
      <div className={styles.controls}>
        <div>
          <SectionLabel id="toggle-eyebrow" className={styles.eyebrow}>
            The Build
          </SectionLabel>
          <h2 ref={titleRef} className={styles.title}>
            All <span className={styles.titleAccent}>24</span> screens.
          </h2>
        </div>

        <div
          ref={modesRef}
          className={styles.modes}
          role="group"
          aria-label="Toggle view"
        >
          <button
            type="button"
            className={styles.modeBtn}
            aria-pressed={mode === "gallery"}
            onClick={() => setMode("gallery")}
          >
            Gallery
          </button>
          <button
            type="button"
            className={styles.modeBtn}
            aria-pressed={mode === "list"}
            onClick={() => setMode("list")}
          >
            List
          </button>
        </div>
      </div>

      <div ref={viewRef}>
        {mode === "gallery" ? (
          <div className={styles.gallery}>
            {GALLERY_SCREENS.map((s) => (
              <figure key={s.src}>
                <div className={styles.frame}>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={2400}
                    height={1500}
                  />
                </div>
                <figcaption className={styles.caption}>
                  <span>{s.galleryCaption!.label}</span>
                  <span>{s.galleryCaption!.num}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className={styles.list}>
            {SCREENS.map((s) => (
              <div
                key={s.src}
                className={styles.row}
                onMouseEnter={handleRowEnter(s.src)}
                onMouseLeave={handleRowLeave}
                onMouseMove={handleRowMove}
              >
                <span className={styles.rowN}>{s.list.num}</span>
                <span className={styles.rowName}>{s.list.name}</span>
                <span className={styles.rowDesc}>{s.list.desc}</span>
                <span className={styles.rowMeta}>{s.list.meta}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cursor-following hover preview (list mode only) */}
      <div
        ref={previewRef}
        className={`${styles.preview} ${preview.visible ? styles.previewVisible : ""}`}
        aria-hidden
      >
        {preview.src && (
          <Image src={preview.src} alt="" width={560} height={400} />
        )}
      </div>
    </section>
  );
}
