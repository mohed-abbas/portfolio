'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import styles from './CustomCursor.module.css';

// Trail sphere configuration using palette colors
const TRAIL_CONFIG = {
  count: 3,
  colors: [
    '#A052FF', // --color-accent-purple
    '#FFD700', // gold
    '#A052FF', // purple again for cohesion
  ],
  sizes: [10, 8, 6], // Decreasing sizes
  lerpFactors: [0.12, 0.09, 0.06], // Slower follow = longer trail
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
  const movementTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBurst = useRef(false);

  // Smooth lerp factor for main cursor
  const lerpFactor = 0.15;

  useEffect(() => {
    const cursor = cursorRef.current;
    const trailContainer = trailContainerRef.current;

    if (!cursor || !trailContainer) return;

    // Burst animation - spheres collapse into main cursor
    const triggerBurst = () => {
      if (hasBurst.current) return;
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

        // Show trail spheres when moving
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
    };

    gsap.ticker.add(animate);

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

    // Add hover listeners to all interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select');

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleLinkHover);
      el.addEventListener('mouseleave', handleLinkLeave);
    });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      gsap.ticker.remove(animate);

      if (movementTimeout.current) {
        clearTimeout(movementTimeout.current);
      }

      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleLinkHover);
        el.removeEventListener('mouseleave', handleLinkLeave);
      });

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
