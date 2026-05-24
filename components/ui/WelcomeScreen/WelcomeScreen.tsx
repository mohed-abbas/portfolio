'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { content, features } from '@/data';
import styles from './WelcomeScreen.module.css';

const GREETINGS = content.welcomeScreen.greetings;
const INITIALS = content.welcomeScreen.initials;

export const WelcomeScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(() => {
    // Skip greeting on Next.js client-side navigation. The inline script in
    // app/layout.tsx sets window.__freshLoad on every full document load
    // (cold visit + F5 refresh) — it never re-runs on Link clicks, so its
    // absence here means we got here via in-app navigation.
    if (features.welcomeScreen.skipOnReturn && !window.__freshLoad) {
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-hidden', 'true');
        containerRef.current.style.display = 'none';
      }
      const handoffTimer = setTimeout(() => {
        window.__welcomeHandoff = true;
        window.dispatchEvent(new CustomEvent('welcome-handoff'));
        window.__welcomeComplete = true;
        window.dispatchEvent(new CustomEvent('welcome-complete'));
      }, 0);
      return () => clearTimeout(handoffTimer);
    }
    // Consume the flag so a same-tab client-nav back here is treated as a
    // return visit (no re-greeting).
    delete window.__freshLoad;

    // Helper to handle scrollbar lock without layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    const lockScroll = () => {
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
    };

    const unlockScroll = () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    };

    // Reduced-motion path: skip flash + flight; hide welcome and dispatch
    // handoff/complete events so Hero & HeroText proceed normally.
    if (reducedMotion) {
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-hidden', 'true');
        containerRef.current.style.display = 'none';
      }
      // Defer to next tick so sibling components have attached their listeners.
      const handoffTimer = setTimeout(() => {
        window.__welcomeHandoff = true;
        window.dispatchEvent(new CustomEvent('welcome-handoff'));
        window.__welcomeComplete = true;
        window.dispatchEvent(new CustomEvent('welcome-complete'));
      }, 0);
      return () => clearTimeout(handoffTimer);
    }

    // Context for flight tweens to ensure proper cleanup
    const flightCtx = gsap.context(() => {});
    // Handoff delayedCall is created later inside tl.call; track it so the
    // cleanup return can kill it. Without this, an unmount mid-flight (HMR,
    // dev navigation) lets the call fire after the DOM is gone.
    let handoffCall: gsap.core.Tween | null = null;

    // Failure handler — guarantees we don't leave scroll locked or the rest
    // of the app waiting on handoff/complete events if timeline setup throws.
    const bailOut = (err: unknown) => {
      console.error('[WelcomeScreen] Animation setup failed, bailing out:', err);
      unlockScroll();
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-hidden', 'true');
        containerRef.current.style.display = 'none';
      }
      window.__welcomeHandoff = true;
      window.dispatchEvent(new CustomEvent('welcome-handoff'));
      window.__welcomeComplete = true;
      window.dispatchEvent(new CustomEvent('welcome-complete'));
    };

    const tl = gsap.timeline({
      onComplete: () => {
        unlockScroll();
        // Note: Don't call flightCtx.revert() here - animations are done
        // revert() would reset elements to pre-animation state causing visual glitch
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
        window.__welcomeComplete = true;
        window.dispatchEvent(new CustomEvent('welcome-complete'));
      }
    });

    lockScroll(); // Lock immediately

    try {

    const greetingElements = containerRef.current?.querySelectorAll(`.${styles.greeting}`);

    if (greetingElements && greetingElements.length > 0) {
        // 1. Initial Setup: Stack all greetings in the center
        gsap.set(greetingElements, { 
            x: 0, 
            y: 0, 
            opacity: 0, 
            scale: 1,
            position: 'absolute',
            left: '50%',
            top: '50%',
            xPercent: -50,
            yPercent: -50
        });

        // Initial state for initials is set by the fromTo tween below
        // (scale: 1.2, opacity: 0). A standalone gsap.set here would be
        // overwritten by fromTo's starting frame — dead code.

        // 2. The Rapid Flash Sequence
        // Show each greeting for a short burst
        const flashDuration = 0.25; // Increased to 250ms per word for better readability

        greetingElements.forEach((el) => {
            tl.to(el, {
                opacity: 1,
                duration: 0, // Instant ON
            })
            .to(el, {
                opacity: 1, // Hold
                duration: flashDuration 
            })
            .to(el, {
                opacity: 0, // Instant OFF
                duration: 0
            });
        });

        // 3. Initials Reveal
        // PERF: dropped filter:blur — paint-heavy on Firefox/Linux. scale+opacity
        // alone provide the same perceptual reveal at compositor-only cost.
        tl.fromTo(initialsRef.current,
            {
                scale: 1.2,
                opacity: 0,
            },
            {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: "power2.out"
            }
        );
    }

      // 4. The Travel Transition
      // Using a label to properly sequence the flight animation
      tl.addLabel("flightStart", "+=0.1");

      // Calculate positions at the right moment, then animate
      tl.call(() => {
        const targetM = document.getElementById('target-m');
        const targetA = document.getElementById('target-a');

        // Validate targets exist with helpful error message
        if (!targetM || !targetA) {
          console.warn('[WelcomeScreen] Target elements not found:', {
            targetM: !!targetM,
            targetA: !!targetA
          });
          // Dispatch handoff anyway to prevent UI from being stuck
          window.__welcomeHandoff = true;
          window.dispatchEvent(new CustomEvent('welcome-handoff'));
          return;
        }

        if (!mRef.current || !aRef.current) {
          console.warn('[WelcomeScreen] Letter refs not available');
          window.__welcomeHandoff = true;
          window.dispatchEvent(new CustomEvent('welcome-handoff'));
          return;
        }

        // Batch all getBoundingClientRect calls together to minimize reflow
        const rects = {
          targetM: targetM.getBoundingClientRect(),
          targetA: targetA.getBoundingClientRect(),
          currentM: mRef.current.getBoundingClientRect(),
          currentA: aRef.current.getBoundingClientRect()
        };

        const deltaMx = rects.targetM.left - rects.currentM.left;
        const deltaMy = rects.targetM.top - rects.currentM.top;
        const deltaAx = rects.targetA.left - rects.currentA.left;
        const deltaAy = rects.targetA.top - rects.currentA.top;

        const flightDuration = 1.2;
        const handoffDuration = 0.3;

        // Add flight tweens to context for proper cleanup
        flightCtx.add(() => {
          // A. Fly both letters to destination (parallel)
          gsap.to(mRef.current, {
            x: deltaMx,
            y: deltaMy,
            duration: flightDuration,
            ease: "power4.inOut"
          });

          gsap.to(aRef.current, {
            x: deltaAx,
            y: deltaAy,
            duration: flightDuration,
            ease: "power4.inOut"
          });

          // B. Cross-Dissolve: Fade OUT flying letters as they arrive
          gsap.to([mRef.current, aRef.current], {
            opacity: 0,
            duration: handoffDuration,
            ease: "power1.in",
            delay: flightDuration - handoffDuration
          });

          // D. Fade out container — opacity is compositor-only, whereas the
          // previous backgroundColor tween triggered paint every frame. By the
          // time this delay fires, all children (greetings, initials) have
          // already faded, so opacity on the container is visually equivalent.
          if (containerRef.current) {
            gsap.to(containerRef.current, {
              opacity: 0,
              duration: 0.8,
              ease: "power2.inOut",
              delay: 0.4
            });
          }
        });

        // C. Trigger HeroText Fade IN when cross-fade starts
        // Kept OUTSIDE flightCtx (revert() would kill it) but captured in
        // handoffCall so the cleanup path can kill it on unmount.
        handoffCall = gsap.delayedCall(flightDuration - handoffDuration, () => {
          window.__welcomeHandoff = true;
          window.dispatchEvent(new CustomEvent('welcome-handoff'));
        });
      }, [], "flightStart");

      // Wait for flight animation to complete (matches flightDuration + buffer)
      tl.to({}, { duration: 1.3 }, "flightStart");
    } catch (err) {
      bailOut(err);
    }

    // Cleanup on unmount
    return () => {
      handoffCall?.kill();
      tl.kill();
      flightCtx.revert();
      unlockScroll();
    };
  }, { scope: containerRef, dependencies: [reducedMotion] });

  return (
    <div
      ref={containerRef}
      data-welcome-wrapper
      className={styles.welcomeWrapper}
    >
      <div className={styles.textContainer}>
        {/* Centered Greetings (Stacked) */}
        {GREETINGS.map((text, i) => (
          <div key={i} className={styles.greeting}>
            {text}
          </div>
        ))}

        {/* Initials (Center Target) */}
        <div ref={initialsRef} className={styles.initialsContainer}>
          <span ref={mRef} className={styles.letterM}>{INITIALS.first}</span>
          <span style={{ width: '0.1em' }}></span> {/* Spacer */}
          <span ref={aRef} className={styles.letterA}>{INITIALS.last}</span>
        </div>
      </div>
    </div>
  );
};
