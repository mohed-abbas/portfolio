'use client';

import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { Menu } from './Menu';
import { useAccentColor } from '@/lib/AccentColorContext';
import styles from './Navbar.module.css';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navContactRef = useRef<HTMLAnchorElement>(null);
  const hamburgerLinesRef = useRef<HTMLSpanElement[]>([]);
  const { cycleColor } = useAccentColor();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
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
    ).fromTo(
      navContactRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=0.6'
    );
  }, { scope: navRef });

  // Hamburger morph animation
  useGSAP(() => {
    if (!menuButtonRef.current || hamburgerLinesRef.current.length < 3) return;

    const [line1, line2, line3] = hamburgerLinesRef.current;
    const navTextEl = menuButtonRef.current.querySelector(`.${styles.navText}`);

    if (isMenuOpen) {
      // Morph to X - white for teal background
      // y offset = 8px to center (gap:6px + line:2px = 8px between line centers)
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
      // Nav text white for teal background
      if (navTextEl) {
        gsap.to(navTextEl, {
          color: 'var(--color-background)',
          duration: 0.3,
        });
      }
      if (navContactRef.current) {
        gsap.to(navContactRef.current, {
          color: 'var(--color-background)',
          duration: 0.3,
        });
      }
    } else {
      // Morph back to hamburger
      gsap.to(line1, {
        rotation: 0,
        y: 0,
        backgroundColor: 'var(--color-black)',
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
        backgroundColor: 'var(--color-black)',
        duration: 0.4,
        ease: 'power2.out',
      });
      // Reset nav text color
      if (navTextEl) {
        gsap.to(navTextEl, {
          color: 'var(--color-black)',
          duration: 0.3,
        });
      }
      if (navContactRef.current) {
        gsap.to(navContactRef.current, {
          color: 'var(--color-primary-text)',
          duration: 0.3,
        });
      }
    }
  }, { dependencies: [isMenuOpen] });

  return (
    <>
      <nav ref={navRef} className={`${styles.navbar} ${isMenuOpen ? styles.menuOpen : ''}`}>
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
          <span className={styles.navText}>{isMenuOpen ? 'CLOSE' : 'MENU'}</span>
        </button>
        
      </nav>
      <Menu isOpen={isMenuOpen} onClose={closeMenu} onRevealStart={cycleColor} />
    </>
  );
}
