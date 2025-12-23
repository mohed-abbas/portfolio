'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import styles from './WelcomeScreen.module.css';

const GREETINGS = ["Hello", "Bonjour", "Hallo", "Ola", "नमस्ते", "سلام"];

export const WelcomeScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialsRef = useRef<HTMLDivElement>(null);
  const mRef = useRef<HTMLSpanElement>(null);
  const aRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
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

    // Context for flight tweens to ensure proper cleanup
    const flightCtx = gsap.context(() => {});

    const tl = gsap.timeline({
      onComplete: () => {
        unlockScroll();
        // Note: Don't call flightCtx.revert() here - animations are done
        // revert() would reset elements to pre-animation state causing visual glitch
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
        window.dispatchEvent(new CustomEvent('welcome-complete'));
      }
    });

    lockScroll(); // Lock immediately

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

        gsap.set(initialsRef.current, { 
            scale: 1.5, 
            opacity: 0,
            filter: 'blur(0px)'
        });

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
        // Smooth reveal instead of hard snap
        tl.fromTo(initialsRef.current, 
            {
                scale: 1.2,
                opacity: 0,
                filter: 'blur(5px)'
            },
            {
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
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
          window.dispatchEvent(new CustomEvent('welcome-handoff'));
          return;
        }

        if (!mRef.current || !aRef.current) {
          console.warn('[WelcomeScreen] Letter refs not available');
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

          // D. Fade out background
          gsap.to(containerRef.current, {
            backgroundColor: "rgba(255, 255, 255, 0)",
            duration: 0.8,
            ease: "power2.inOut",
            delay: 0.4
          });
        });

        // C. Trigger HeroText Fade IN when cross-fade starts
        // Keep this OUTSIDE flightCtx so it's not killed by revert()
        gsap.delayedCall(flightDuration - handoffDuration, () => {
          window.dispatchEvent(new CustomEvent('welcome-handoff'));
        });
      }, [], "flightStart");

      // Wait for flight animation to complete (matches flightDuration + buffer)
      tl.to({}, { duration: 1.3 }, "flightStart");

      // Cleanup on unmount
      return () => {
        flightCtx.revert();
        unlockScroll();
      };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={styles.welcomeWrapper}>
      <div className={styles.textContainer}>
        {/* Centered Greetings (Stacked) */}
        {GREETINGS.map((text, i) => (
          <div key={i} className={styles.greeting}>
            {text}
          </div>
        ))}

        {/* Initials (Center Target) */}
        <div ref={initialsRef} className={styles.initialsContainer}>
          <span ref={mRef} className={styles.letterM}>M</span>
          <span style={{ width: '0.1em' }}></span> {/* Spacer */}
          <span ref={aRef} className={styles.letterA}>A</span>
        </div>
      </div>
    </div>
  );
};
