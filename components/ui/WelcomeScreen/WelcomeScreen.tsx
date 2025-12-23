'use client';

import { useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { useGSAP } from '@gsap/react';
import styles from './WelcomeScreen.module.css';

const GREETINGS = ["Hello", "Bonjour", "Ola", "سلام"];

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

    const tl = gsap.timeline({
      onComplete: () => {
        unlockScroll(); // Restore scrollbar without jump (if we handled padding correctly, jump is minimized)
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

        greetingElements.forEach((el, i) => {
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
    tl.add(() => {
      const targetM = document.getElementById('target-m');
      const targetA = document.getElementById('target-a');

      if (!targetM || !targetA || !mRef.current || !aRef.current) return;

      const rectM = targetM.getBoundingClientRect();
      const rectA = targetA.getBoundingClientRect();
      const currentM = mRef.current.getBoundingClientRect();
      const currentA = aRef.current.getBoundingClientRect();

      const deltaMx = rectM.left - currentM.left;
      const deltaMy = rectM.top - currentM.top;
      const deltaAx = rectA.left - currentA.left;
      const deltaAy = rectA.top - currentA.top;

      const flightTl = gsap.timeline({
        onComplete: () => {
             // Cleanup handled by parent timeline
        }
      });

      const flightDuration = 1.2;
      const handoffDuration = 0.3; // Duration of the cross-fade

      // A. Fly to destination
      flightTl.to(mRef.current, {
        x: deltaMx,
        y: deltaMy,
        duration: flightDuration,
        ease: "power4.inOut"
      })
      .to(aRef.current, {
        x: deltaAx,
        y: deltaAy,
        duration: flightDuration,
        ease: "power4.inOut"
      }, 0)
      
      // B. Cross-Dissolve: Fade OUT flying letters as they arrive
      // Starts 'handoffDuration' before the end
      .to([mRef.current, aRef.current], {
        opacity: 0,
        duration: handoffDuration,
        ease: "power1.in"
      }, `-=${handoffDuration}`)

      // C. Trigger HeroText Fade IN
      // Dispatched exactly when the cross-fade starts
      .call(() => {
        window.dispatchEvent(new CustomEvent('welcome-handoff'));
      }, null, `-=${handoffDuration}`)

      // D. Fade out background (optional, keeps it clean)
      .to(containerRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        duration: 0.8,
        ease: "power2.inOut"
      }, 0.4);

    }, "+=0.1");

    // Add a buffer at the end of the main timeline to ensure flight finishes
    // The flightTl inside 'add' runs asynchronously to the main tl unless we return it, 
    // but 'add' with callback doesn't wait. We just pad the main timeline.
    tl.to({}, { duration: 1.4 }); 


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
