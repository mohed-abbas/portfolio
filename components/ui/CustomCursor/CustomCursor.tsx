'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import { features } from '@/data';
import styles from './CustomCursor.module.css';

// Trail sphere configuration from features data
const cursorConfig = features.customCursor;
const TRAIL_CONFIG = {
  count: cursorConfig.trail.count,
  colors: [
    cursorConfig.trail.colors.primary,
    'var(--color-accent-purple)', // Uses CSS variable for dynamic accent
    cursorConfig.trail.colors.secondary,
    cursorConfig.trail.colors.tertiary,
  ],
  sizes: cursorConfig.trail.sizes,
  lerpFactors: cursorConfig.trail.lerpFactors,
};

interface TrailSphere {
  element: HTMLDivElement | null;
  pos: { x: number; y: number };
  lerpFactor: number;
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const trailSpheresRef = useRef<TrailSphere[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Store mouse position
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });
  const hasMovedMouse = useRef(false);

  // Movement detection for burst effect
  const lastMousePos = useRef({ x: 0, y: 0 });
  const isMoving = useRef(false);
  const isSpotlightActive = useRef(false);
  const movementTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBurst = useRef(false);

  // PERF: Track ticker state to avoid unnecessary 60fps updates
  const tickerActiveRef = useRef(false);
  const animateFnRef = useRef<(() => void) | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth lerp factor for main cursor
  const lerpFactor = 0.15;

  useEffect(() => {
    const cursor = cursorRef.current;
    const trailContainer = trailContainerRef.current;

    if (!cursor || !trailContainer) return;

    // Burst animation - spheres collapse into main cursor
    const triggerBurst = () => {
      if (hasBurst.current || isSpotlightActive.current) return;
      hasBurst.current = true;

      // Animate each trail sphere to burst into the main cursor
      trailSpheresRef.current.forEach((sphere, index) => {
        if (sphere.element) {
          const delay = index * 0.03;

          // Animate to cursor position and shrink
          gsap.to(sphere.element, {
            x: cursorPos.current.x,
            y: cursorPos.current.y,
            scale: 0,
            opacity: 0,
            duration: 0.3,
            delay,
            ease: 'power3.in',
          });
        }
      });

      // Pulse the main cursor when spheres merge
      gsap.timeline()
        .to(cursor, {
          scale: 1.5,
          duration: 0.15,
          delay: 0.1,
          ease: 'power2.out',
        })
        .to(cursor, {
          scale: 1,
          duration: 0.3,
          ease: 'elastic.out(1, 0.5)',
        });
    };

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Show cursor on first mouse move
      if (!hasMovedMouse.current) {
        hasMovedMouse.current = true;
        cursorPos.current = { x: e.clientX, y: e.clientY };

        // Initialize trail positions
        trailSpheresRef.current.forEach(sphere => {
          sphere.pos = { x: e.clientX, y: e.clientY };
        });

        setIsVisible(true);
      }

      // Detect movement
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2) {
        isMoving.current = true;
        hasBurst.current = false;

        // Show trail spheres when moving (ONLY if spotlight is NOT active)
        if (!isSpotlightActive.current) {
          trailSpheresRef.current.forEach(sphere => {
            if (sphere.element) {
              gsap.to(sphere.element, {
                opacity: 1,
                scale: 1,
                duration: 0.2,
                ease: 'power2.out',
              });
            }
          });
        }

        // Clear existing timeout
        if (movementTimeout.current) {
          clearTimeout(movementTimeout.current);
        }

        // Set timeout to detect when movement stops
        movementTimeout.current = setTimeout(() => {
          isMoving.current = false;
          triggerBurst();
        }, 100);
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };

      // PERF: Ensure ticker is running when mouse moves
      startTicker();
    };

    // Create trail sphere elements
    trailSpheresRef.current = TRAIL_CONFIG.colors.map((color, index) => {
      const element = document.createElement('div');
      element.className = styles.trailSphere;
      element.style.backgroundColor = color;
      element.style.width = `${TRAIL_CONFIG.sizes[index]}px`;
      element.style.height = `${TRAIL_CONFIG.sizes[index]}px`;
      element.style.opacity = '0';
      trailContainer.appendChild(element);

      return {
        element,
        pos: { x: 0, y: 0 },
        lerpFactor: TRAIL_CONFIG.lerpFactors[index],
      };
    });

    // Track mouse movement
    window.addEventListener('mousemove', handleMouseMove);

    // PERF: Start ticker only when needed
    const startTicker = () => {
      if (!tickerActiveRef.current && animateFnRef.current) {
        gsap.ticker.add(animateFnRef.current);
        tickerActiveRef.current = true;
      }
    };

    // PERF: Stop ticker when cursor is idle
    const stopTicker = () => {
      if (tickerActiveRef.current && animateFnRef.current) {
        gsap.ticker.remove(animateFnRef.current);
        tickerActiveRef.current = false;
      }
    };

    // PERF: Schedule idle check - stop ticker after 150ms of no movement
    const scheduleIdleCheck = () => {
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      idleTimeoutRef.current = setTimeout(() => {
        // Check if cursor has settled (lerp nearly complete)
        const dx = Math.abs(mousePos.current.x - cursorPos.current.x);
        const dy = Math.abs(mousePos.current.y - cursorPos.current.y);
        if (dx < 0.5 && dy < 0.5) {
          stopTicker();
        }
      }, 150);
    };

    // Animate with GSAP ticker for smooth 60fps updates
    const animate = () => {
      if (!hasMovedMouse.current) return;

      // Lerp main cursor position
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * lerpFactor;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * lerpFactor;

      // Apply transforms to main cursor
      gsap.set(cursor, {
        x: cursorPos.current.x,
        y: cursorPos.current.y,
        xPercent: -50,
        yPercent: -50,
      });

      // Update CSS variables for cursor position (used by spotlight effect)
      document.documentElement.style.setProperty('--cursor-x', `${cursorPos.current.x}px`);
      document.documentElement.style.setProperty('--cursor-y', `${cursorPos.current.y}px`);

      // Update trail spheres - each follows the one ahead
      trailSpheresRef.current.forEach((sphere, index) => {
        if (!sphere.element) return;

        // First sphere follows cursor, others follow the sphere ahead
        const target = index === 0
          ? cursorPos.current
          : trailSpheresRef.current[index - 1].pos;

        sphere.pos.x += (target.x - sphere.pos.x) * sphere.lerpFactor;
        sphere.pos.y += (target.y - sphere.pos.y) * sphere.lerpFactor;

        gsap.set(sphere.element, {
          x: sphere.pos.x,
          y: sphere.pos.y,
          xPercent: -50,
          yPercent: -50,
        });
      });

      // PERF: Check if settled and schedule idle
      const dx = Math.abs(mousePos.current.x - cursorPos.current.x);
      const dy = Math.abs(mousePos.current.y - cursorPos.current.y);
      if (dx < 0.5 && dy < 0.5) {
        scheduleIdleCheck();
      }
    };

    // Store reference for cleanup and control
    animateFnRef.current = animate;

    // PERF: Don't start ticker immediately - wait for mouse move
    // gsap.ticker.add(animate); // REMOVED - ticker starts on demand

    // Handle cursor visibility when leaving/entering window
    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      cursorPos.current = { x: e.clientX, y: e.clientY };
      trailSpheresRef.current.forEach(sphere => {
        sphere.pos = { x: e.clientX, y: e.clientY };
      });
      setIsVisible(true);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Handle hover states on interactive elements
    const handleLinkHover = () => {
      gsap.to(cursor, {
        scale: 2,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Expand trail on hover
      trailSpheresRef.current.forEach((sphere, index) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            scale: 1.5,
            duration: 0.3,
            delay: index * 0.02,
            ease: 'power2.out',
          });
        }
      });
    };

    const handleLinkLeave = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Reset trail scale
      trailSpheresRef.current.forEach((sphere) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });
    };

    // Handle tagline spotlight - cursor becomes the spotlight
    const handleSpotlightEnter = (e: Event) => {
      const customEvent = e as CustomEvent<{ size: number }>;
      const spotlightSize = customEvent.detail?.size || 100;

      isSpotlightActive.current = true;

      // Set CSS variable for spotlight state
      document.documentElement.style.setProperty('--spotlight-active', '1');
      document.documentElement.style.setProperty('--spotlight-size', `${spotlightSize / 2}px`);

      // Hide the main cursor so the spotlight (reveal mask) takes over completely
      // This prevents color clashing (difference mode vs purple background)
      gsap.to(cursor, {
        scale: 1.5, // Slight scale up before disappearing for effect
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
      });

      // Fade out trail during spotlight mode
      trailSpheresRef.current.forEach((sphere) => {
        if (sphere.element) {
          gsap.to(sphere.element, {
            opacity: 0,
            scale: 0.5,
            duration: 0.2,
            ease: 'power2.out',
          });
        }
      });
    };

    const handleSpotlightLeave = () => {
      isSpotlightActive.current = false;

      // Reset CSS variable for spotlight state
      document.documentElement.style.setProperty('--spotlight-active', '0');

      // Bring back the main cursor
      gsap.to(cursor, {
        scale: 1,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      // Trail will reappear naturally on next movement
    };

    // Listen for spotlight events
    window.addEventListener('tagline-spotlight-enter', handleSpotlightEnter);
    window.addEventListener('tagline-spotlight-leave', handleSpotlightLeave);

    // PERF: Use event delegation instead of adding listeners to every element
    // This handles dynamically added elements and reduces memory usage
    const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, select';

    const handleInteractiveEnter = (e: Event) => {
      const target = e.target;
      // Ensure target is an Element with closest method
      if (target instanceof Element && target.closest(INTERACTIVE_SELECTOR)) {
        handleLinkHover();
      }
    };

    const handleInteractiveLeave = (e: Event) => {
      const target = e.target;
      const relatedTarget = (e as MouseEvent).relatedTarget;

      // Ensure target is an Element with closest method
      if (!(target instanceof Element)) return;

      // Only trigger leave if not moving to another interactive element
      if (target.closest(INTERACTIVE_SELECTOR)) {
        const isRelatedInteractive = relatedTarget instanceof Element &&
          relatedTarget.closest(INTERACTIVE_SELECTOR);
        if (!isRelatedInteractive) {
          handleLinkLeave();
        }
      }
    };

    // Use capture phase for better delegation performance
    document.addEventListener('mouseenter', handleInteractiveEnter, true);
    document.addEventListener('mouseleave', handleInteractiveLeave, true);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('tagline-spotlight-enter', handleSpotlightEnter);
      window.removeEventListener('tagline-spotlight-leave', handleSpotlightLeave);

      // PERF: Clean up ticker properly
      if (animateFnRef.current) {
        gsap.ticker.remove(animateFnRef.current);
      }
      tickerActiveRef.current = false;

      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }

      // PERF: Clean up idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      // PERF: Remove delegated event listeners
      document.removeEventListener('mouseenter', handleInteractiveEnter, true);
      document.removeEventListener('mouseleave', handleInteractiveLeave, true);

      // Remove trail elements
      trailSpheresRef.current.forEach(sphere => {
        if (sphere.element && sphere.element.parentNode) {
          sphere.element.parentNode.removeChild(sphere.element);
        }
      });
    };
  }, []);

  return (
    <>
      {/* Trail container - outside blend wrapper so colors stay vibrant */}
      <div
        ref={trailContainerRef}
        className={styles.trailContainer}
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        aria-hidden="true"
      />
      {/* Cursor wrapper with mix-blend-mode for inversion effect */}
      <div
        className={styles.cursorWrapper}
        style={{ visibility: isVisible ? 'visible' : 'hidden' }}
        aria-hidden="true"
      >
        <div ref={cursorRef} className={styles.cursor} />
      </div>
    </>
  );
}
