import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import animationConfig from "@/data/animation-config.json";

// Register GSAP plugins
// Note: Registration happens client-side only
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Default GSAP configuration
gsap.defaults({
  ease: "power3.out",
  duration: animationConfig.durations.slow,
});

// Export configured gsap and plugins
export { gsap, ScrollTrigger };

// Animation configuration constants (from data)
export const ANIMATION_CONFIG = {
  duration: animationConfig.durations,
  ease: animationConfig.easing.gsap,
  stagger: animationConfig.stagger,
  delays: animationConfig.delays,
} as const;
