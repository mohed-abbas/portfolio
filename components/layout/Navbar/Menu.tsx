'use client';

import { useRef, useEffect, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import styles from './Menu.module.css';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuLinks = [
  { label: 'Work', href: '#work', desc: 'Selected projects and case studies' },
  { label: 'About', href: '#about', desc: 'The story behind the craft' },
  { label: 'Services', href: '#services', desc: 'Expert solutions for your needs' },
  { label: 'Contact', href: '#contact', desc: 'Start a conversation today' },
];

// Custom easing matching Framer Motion [0.76, 0, 0.24, 1]
const MENU_EASE = 'power4.inOut';

export function Menu({ isOpen, onClose }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLUListElement>(null);
  const isAnimating = useRef(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isAnimating.current) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Animation effect
  useEffect(() => {
    if (!menuRef.current || !overlayRef.current || !linksContainerRef.current) return;

    const links = linksContainerRef.current.querySelectorAll(`.${styles.linkInner}`);
    const linkNumbers = linksContainerRef.current.querySelectorAll(`.${styles.linkNumber}`);
    if (links.length === 0) return;

    // Kill any running animations
    gsap.killTweensOf([menuRef.current, overlayRef.current, links, linkNumbers]);

    isAnimating.current = true;

    if (isOpen) {
      // === OPEN ANIMATION ===

      // Show container
      gsap.set(menuRef.current, { visibility: 'visible' });

      // Set initial states
      gsap.set(overlayRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(links, { y: '110%' });
      gsap.set(linkNumbers, { opacity: 0, x: -20 });

      // Create timeline
      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        }
      });

      // 1. Overlay clips in from top
      tl.to(overlayRef.current, {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 0.7,
        ease: MENU_EASE,
      })
      // 2. Links stagger up (starts 0.3s after overlay begins)
      .to(links, {
        y: '0%',
        duration: 0.8,
        stagger: 0.1,
        ease: MENU_EASE,
      }, 0.3)
      // 3. Numbers fade in
      .to(linkNumbers, {
        opacity: 0.4,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.5);

    } else {
      // === CLOSE ANIMATION ===

      const tl = gsap.timeline({
        onComplete: () => {
          if (menuRef.current) {
            gsap.set(menuRef.current, { visibility: 'hidden' });
          }
          isAnimating.current = false;
        }
      });

      // 1. Numbers fade out first
      tl.to(linkNumbers, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        stagger: { each: 0.03, from: 'end' },
        ease: 'power2.in',
      })
      // 2. Links stagger down (reverse order)
      .to(links, {
        y: '110%',
        duration: 0.5,
        stagger: { each: 0.05, from: 'end' },
        ease: MENU_EASE,
      }, 0.1)
      // 3. Overlay clips out (delayed until links exit)
      .to(overlayRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.7,
        ease: MENU_EASE,
      }, 0.4);
    }
  }, [isOpen]);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (isAnimating.current) return;

    onClose();
    // Delay scroll to allow menu close animation
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 800);
  }, [onClose]);

  return (
    <div ref={menuRef} className={`${styles.menu} ${isOpen ? styles.isOpen : ''}`}>
      <div ref={overlayRef} className={styles.overlay}>
        {/* Background grid decoration */}
        <div className={styles.gridDecoration} />
        <div className={styles.glowDecoration} />
      </div>

      <nav className={styles.nav} role="navigation" aria-label="Main menu">
        <ul ref={linksContainerRef} className={styles.linkList}>
          {menuLinks.map((link, index) => (
            <li key={link.href} className={styles.linkItem}>
              <div className={styles.linkMask}>
                <a
                  href={link.href}
                  className={styles.link}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <span className={styles.linkNumber}>0{index + 1}</span>
                  <span className={styles.linkInner}>
                    <span className={styles.linkText}>{link.label}</span>
                    <span className={styles.linkFill} aria-hidden="true">{link.label}</span>
                  </span>
                </a>
              </div>
              <p className={styles.linkDesc}>{link.desc}</p>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
