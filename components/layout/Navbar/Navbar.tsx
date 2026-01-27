'use client';

import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Menu } from './Menu';
import { useAccentColor } from '@/lib/AccentColorContext';
import { content } from '@/data';
import styles from './Navbar.module.css';

const INITIALS = content.welcomeScreen.initials;

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Separate state for z-index to keep navbar visible during close animation
  const [keepElevated, setKeepElevated] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerLinesRef = useRef<HTMLSpanElement[]>([]);
  const brandWrapperRef = useRef<HTMLDivElement>(null);
  const { cycleColor } = useAccentColor();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      if (!prev) {
        // Opening menu - elevate navbar immediately
        setKeepElevated(true);
      }
      return !prev;
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    // Keep navbar elevated - will be lowered by onCloseComplete
  }, []);

  const handleCloseComplete = useCallback(() => {
    // Menu close animation is done, safe to lower z-index
    setKeepElevated(false);
  }, []);

  // Initial navbar animation
  useGSAP(() => {
    if (!navRef.current) return;

    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    });

    tl.fromTo(
      menuButtonRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      }
    );
  }, { scope: navRef });

  // Hamburger morph animation
  useGSAP(() => {
    if (!menuButtonRef.current || hamburgerLinesRef.current.length < 3) return;

    const [line1, line2, line3] = hamburgerLinesRef.current;
    
    // Select text elements
    const menuChars = menuButtonRef.current.querySelectorAll(`.${styles.navTextMenu} .${styles.navChar}`);
    const closeChars = menuButtonRef.current.querySelectorAll(`.${styles.navTextClose} .${styles.navChar}`);
    const closeTextItem = menuButtonRef.current.querySelector(`.${styles.navTextClose}`);

    // Kill any running animations to prevent conflicts
    gsap.killTweensOf([line1, line2, line3, menuChars, closeChars, closeTextItem]);

    const brandWrapper = brandWrapperRef.current;

    if (isMenuOpen) {
      // === OPEN STATE ===

      // Hide brand mark
      if (brandWrapper) {
        gsap.to(brandWrapper, { opacity: 0, duration: 0.3, ease: 'power2.in' });
      }

      // 1. Hamburger Morph to X
      gsap.to(line1, {
        rotation: 45,
        y: 8,
        backgroundColor: 'var(--color-background)',
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(line2, {
        opacity: 0,
        x: 20,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(line3, {
        rotation: -45,
        y: -8,
        backgroundColor: 'var(--color-background)',
        duration: 0.4,
        ease: 'power2.out',
      });

      // 2. Text Animation: MENU exits up, CLOSE enters from down
      if (closeTextItem) gsap.set(closeTextItem, { visibility: 'visible' });
      
      gsap.to(menuChars, {
        y: '-100%',
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.in',
      });
      
      gsap.fromTo(closeChars, 
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.1, // Slight delay to sync with hamburger
        }
      );

    } else {
      // === CLOSED STATE ===

      // Show brand mark (delayed until menu curtain retracts)
      if (brandWrapper) {
        gsap.to(brandWrapper, { opacity: 1, duration: 0.3, ease: 'power2.out', delay: 0.5 });
      }

      // 1. Hamburger Morph back to parallel lines
      gsap.to(line1, {
        rotation: 0,
        y: 0,
        backgroundColor: 'var(--color-primary-text)',
        duration: 0.4,
        ease: 'power2.out',
      });
      gsap.to(line2, {
        opacity: 1,
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
        delay: 0.1,
      });
      gsap.to(line3, {
        rotation: 0,
        y: 0,
        backgroundColor: 'var(--color-primary-text)',
        duration: 0.4,
        ease: 'power2.out',
      });

      // 2. Text Animation: CLOSE exits down, MENU enters from up
      // Ensure CLOSE text remains visible for the exit animation
      if (closeTextItem) gsap.set(closeTextItem, { visibility: 'visible' });

      gsap.to(closeChars, {
        y: '100%',
        opacity: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.in',
        onComplete: () => {
          if (closeTextItem) gsap.set(closeTextItem, { visibility: 'hidden' });
        }
      });
      
      gsap.fromTo(menuChars,
        { y: '-100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.1,
        }
      );
    }
  }, { dependencies: [isMenuOpen] });

  return (
    <>
      <nav ref={navRef} className={`${styles.navbar} ${(isMenuOpen || keepElevated) ? styles.menuOpen : ''}`}>
        <button
          ref={menuButtonRef}
          className={styles.navLeft}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="main-menu"
        >
          <span className={styles.hamburgerMenu}>
            <span
              ref={(el) => { if (el) hamburgerLinesRef.current[0] = el; }}
              className={styles.hamburgerLine}
            />
            <span
              ref={(el) => { if (el) hamburgerLinesRef.current[1] = el; }}
              className={`${styles.hamburgerLine} ${styles.hamburgerLineAccent}`}
            />
            <span
              ref={(el) => { if (el) hamburgerLinesRef.current[2] = el; }}
              className={styles.hamburgerLine}
            />
          </span>
          <div className={styles.navTextContainer}>
            <span className={`${styles.navTextItem} ${styles.navTextMenu}`}>
              {'MENU'.split('').map((char, i) => (
                <span key={`m-${i}`} className={styles.navChar}>{char}</span>
              ))}
            </span>
            <span className={`${styles.navTextItem} ${styles.navTextClose}`}>
              {'CLOSE'.split('').map((char, i) => (
                <span key={`c-${i}`} className={styles.navChar}>{char}</span>
              ))}
            </span>
          </div>
        </button>

        <div ref={brandWrapperRef} className={styles.navCenterWrapper}>
          <div id="navbar-brand" className={styles.navCenter}>
            <span id="navbar-brand-m" className={styles.brandLetter}>{INITIALS.first}</span>
            <span className={styles.brandSpacer} />
            <span id="navbar-brand-a" className={styles.brandLetter}>{INITIALS.last}</span>
          </div>
        </div>
      </nav>
      <Menu isOpen={isMenuOpen} onClose={closeMenu} onCloseComplete={handleCloseComplete} onRevealStart={cycleColor} />
    </>
  );
}
