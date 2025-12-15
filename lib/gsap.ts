import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
// Note: Registration happens client-side only
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Default GSAP configuration
gsap.defaults({
  ease: "power3.out",
  duration: 0.8,
});

// Export configured gsap and plugins
export { gsap, ScrollTrigger };

// Animation configuration constants
export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.8,
    slower: 1.2,
  },
  ease: {
    outExpo: "expo.out",
    outQuart: "power4.out",
    inOutQuart: "power4.inOut",
  },
} as const;
