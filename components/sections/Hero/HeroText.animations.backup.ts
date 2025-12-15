/**
 * BACKUP: Original ABBAS Animation Values
 * Created: Before letter-by-letter refactor
 *
 * This file preserves the original whole-word bounce animation
 * in case we need to revert or reference it later.
 */

export const ABBAS_ANIMATION_BACKUP = {
  // ABBAS: Bouncy entrance from below with funky skew/rotation
  from: {
    opacity: 0,
    y: 150,
    skewX: -15,
    rotate: -8,
    scale: 0.9,
  },
  to: {
    opacity: 1,
    y: 0,
    skewX: 0,
    rotate: 0,
    scale: 1,
    duration: 1,
    ease: 'elastic.out(1, 0.5)', // Bouncy elastic ease
  },
  position: '-=0.2', // Slight overlap with MOHED
};

export const HAND_POP_BACKUP = {
  // Hand: Pop out from behind the "B" as a surprise
  from: {
    opacity: 0,
    scale: 0,
    rotate: -45,
    transformOrigin: 'bottom center',
  },
  to: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    duration: 0.5,
    ease: 'back.out(2)', // Snappy pop
  },
  position: '-=0.3', // Pop right after ABBAS settles
};

export const HAND_WAVE_BACKUP = {
  // Hand: Loose springy wave - like a wobbly spiral
  keyframes: [
    { rotate: 35, scaleX: 1.15, scaleY: 0.9, duration: 0.18 },
    { rotate: -30, scaleX: 0.88, scaleY: 1.12, duration: 0.22 },
    { rotate: 32, scaleX: 1.12, scaleY: 0.92, duration: 0.2 },
    { rotate: -28, scaleX: 0.9, scaleY: 1.1, duration: 0.2 },
    { rotate: 25, scaleX: 1.08, scaleY: 0.94, duration: 0.18 },
    { rotate: -18, scaleX: 0.94, scaleY: 1.06, duration: 0.16 },
    { rotate: 12, scaleX: 1.04, scaleY: 0.97, duration: 0.14 },
    { rotate: -8, scaleX: 0.97, scaleY: 1.03, duration: 0.12 },
    { rotate: 5, scaleX: 1.02, scaleY: 0.99, duration: 0.1 },
  ],
  ease: 'sine.inOut',

  // Final wobbly settle
  settle: {
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
    duration: 0.8,
    ease: 'elastic.out(0.8, 0.15)',
  },
};
