'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import styles from './Navbar.module.css';

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const navLeftRef = useRef<HTMLDivElement>(null);
  const navContactRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!navRef.current) return;

    const tl = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    });

    // Animate navbar elements from top with stagger
    tl.fromTo(
      navLeftRef.current,
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
      '-=0.6' // Overlap with previous animation
    );
  }, { scope: navRef });

  return (
    <nav ref={navRef} className={styles.navbar}>
      <div ref={navLeftRef} className={styles.navLeft}>
        <button
          className={styles.hamburgerMenu}
          aria-label="Open menu"
          aria-expanded="false"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>
        <span className={styles.navText}>MENU</span>
      </div>
      <a ref={navContactRef} href="#contact" className={styles.navContact}>
        CONTACT
      </a>
    </nav>
  );
}
