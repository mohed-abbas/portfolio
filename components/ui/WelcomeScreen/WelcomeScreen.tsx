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
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = '';
        if (containerRef.current) {
          containerRef.current.style.display = 'none';
        }
        window.dispatchEvent(new CustomEvent('welcome-complete'));
      }
    });

    document.body.style.overflow = 'hidden';

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

      const flightTl = gsap.timeline();

      flightTl.to(mRef.current, {
        x: deltaMx,
        y: deltaMy,
        duration: 1.2,
        ease: "power4.inOut"
      })
      .to(aRef.current, {
        x: deltaAx,
        y: deltaAy,
        duration: 1.2,
        ease: "power4.inOut"
      }, 0)
      .to(containerRef.current, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        duration: 0.8,
        ease: "power2.inOut"
      }, 0.4);

    }, "+=0.1");

    tl.to({}, { duration: 1.2 });

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
