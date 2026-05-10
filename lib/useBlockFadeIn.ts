import { useGSAP } from "@gsap/react";
import { type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface BlockFadeGroup {
  targets: Array<RefObject<HTMLElement | null>>;
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
}

export interface UseBlockFadeInOptions {
  start?: string;
  groups: BlockFadeGroup[];
}

export function useBlockFadeIn(
  scopeRef: RefObject<HTMLElement | null>,
  { start = "top 88%", groups }: UseBlockFadeInOptions
) {
  useGSAP(
    () => {
      const section = scopeRef.current;
      if (!section) return;

      const resolved = groups.map((g) => ({
        ...g,
        els: g.targets
          .map((r) => r.current)
          .filter((el): el is HTMLElement => !!el),
      }));
      if (resolved.every((g) => g.els.length === 0)) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        resolved.forEach((g) => {
          if (g.els.length) gsap.set(g.els, { autoAlpha: 0, y: g.y ?? 24 });
        });

        const trigger = ScrollTrigger.create({
          trigger: section,
          start,
          once: true,
          onEnter: () => {
            resolved.forEach((g) => {
              if (!g.els.length) return;
              gsap.to(g.els, {
                autoAlpha: 1,
                y: 0,
                duration: g.duration ?? 0.9,
                ease: g.ease ?? "expo.out",
                delay: g.delay ?? 0,
                stagger: g.stagger ?? 0,
                clearProps: "transform",
              });
            });
          },
        });

        return () => {
          trigger.kill();
          const allEls = resolved.flatMap((g) => g.els);
          if (allEls.length) gsap.set(allEls, { clearProps: "all" });
        };
      });
    },
    { scope: scopeRef }
  );
}
