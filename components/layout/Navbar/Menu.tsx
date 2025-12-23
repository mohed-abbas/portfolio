'use client';

import { useRef, useEffect, useCallback } from 'react';
import { gsap } from '@/lib/gsap';
import styles from './Menu.module.css';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseComplete?: () => void;
  onRevealStart?: () => void;
}

const menuLinks = [
  { label: 'Work', href: '#work', desc: 'Selected projects and case studies' },
  { label: 'About', href: '#about', desc: 'The story behind the craft' },
  { label: 'Services', href: '#services', desc: 'Expert solutions for your needs' },
  { label: 'Contact', href: '#contact', desc: 'Start a conversation today' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'LinkedIn', href: 'https://linkedin.com/' },
  { label: 'GitHub', href: 'https://github.com/' },
  { label: 'Twitter', href: 'https://twitter.com/' },
];

// Custom easing matching Framer Motion [0.76, 0, 0.24, 1]
const MENU_EASE = 'power4.inOut';

export function Menu({ isOpen, onClose, onCloseComplete, onRevealStart }: MenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLUListElement>(null);
  const socialSectionRef = useRef<HTMLDivElement>(null);
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
    if (!menuRef.current || !overlayRef.current || !linksContainerRef.current || !socialSectionRef.current) return;

    // Left side elements
    const links = linksContainerRef.current.querySelectorAll(`.${styles.linkInner}`);
    const linkNumbers = linksContainerRef.current.querySelectorAll(`.${styles.linkNumber}`);
    if (links.length === 0) return;

    // Right side elements (social section)
    const socialLabels = socialSectionRef.current.querySelectorAll(`.${styles.socialLabel}`);
    const socialLinks = socialSectionRef.current.querySelectorAll(`.${styles.socialLink}`);
    const locationText = socialSectionRef.current.querySelector(`.${styles.locationText}`);
    const backButton = socialSectionRef.current.querySelector(`.${styles.backButton}`);

    // Kill any running animations
    gsap.killTweensOf([
      menuRef.current, overlayRef.current, links, linkNumbers,
      socialLabels, socialLinks, locationText, backButton
    ]);

    isAnimating.current = true;

    if (isOpen) {
      // === OPEN ANIMATION ===

      // Show container
      gsap.set(menuRef.current, { visibility: 'visible' });

      // Set initial states - Left side
      gsap.set(overlayRef.current, { clipPath: 'inset(0% 0% 100% 0%)' });
      gsap.set(links, { y: '110%' });
      gsap.set(linkNumbers, { opacity: 0, x: -20 });

      // Set initial states - Right side (social section)
      gsap.set(socialLabels, { opacity: 0, x: 20 });
      gsap.set(socialLinks, { opacity: 0, y: 30 });
      gsap.set(locationText, { opacity: 0 });
      gsap.set(backButton, { opacity: 0, scale: 0.8 });

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
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, 0.5)
      // 4. Social labels slide in from right
      .to(socialLabels, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
      }, 0.4)
      // 5. Social links stagger up
      .to(socialLinks, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: MENU_EASE,
      }, 0.5)
      // 6. Location text fades in
      .to(locationText, {
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      }, 0.7)
      // 7. Back button scales up (last element)
      .to(backButton, {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.7)',
      }, 0.8);

    } else {
      // === CLOSE ANIMATION ===

      // Freeze the current accent color on the overlay before changing CSS variable
      // This ensures the curtain keeps its color while hero text gets the new color
      const currentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-purple').trim();
      overlayRef.current.style.backgroundColor = currentColor;

      // Trigger color change NOW - hero text will have new color when revealed
      // But curtain keeps old color via inline style above
      onRevealStart?.();

      const tl = gsap.timeline({
        onComplete: () => {
          if (menuRef.current) {
            gsap.set(menuRef.current, { visibility: 'hidden' });
          }
          // Clear the inline style so it uses CSS variable again on next open
          if (overlayRef.current) {
            overlayRef.current.style.backgroundColor = '';
          }
          isAnimating.current = false;
          // Trigger callback after close animation completes
          onCloseComplete?.();
        }
      });

      // 1. Back button scales down first
      tl.to(backButton, {
        opacity: 0,
        scale: 0.8,
        duration: 0.25,
        ease: 'power2.in',
      })
      // 2. Location text fades out
      .to(locationText, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      }, 0.05)
      // 3. Social links stagger out
      .to(socialLinks, {
        opacity: 0,
        y: 30,
        duration: 0.3,
        stagger: { each: 0.04, from: 'end' },
        ease: 'power2.in',
      }, 0.1)
      // 4. Social labels slide out
      .to(socialLabels, {
        opacity: 0,
        x: 20,
        duration: 0.3,
        stagger: { each: 0.05, from: 'end' },
        ease: 'power2.in',
      }, 0.15)
      // 5. Numbers fade out
      .to(linkNumbers, {
        opacity: 0,
        x: -20,
        duration: 0.3,
        stagger: { each: 0.03, from: 'end' },
        ease: 'power2.in',
      }, 0.1)
      // 6. Links stagger down (reverse order)
      .to(links, {
        y: '110%',
        duration: 0.5,
        stagger: { each: 0.05, from: 'end' },
        ease: MENU_EASE,
      }, 0.2)
      // 7. Overlay clips out (delayed until content exits)
      .to(overlayRef.current, {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 0.7,
        ease: MENU_EASE,
      }, 0.5);
    }
  }, [isOpen, onCloseComplete, onRevealStart]);

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
      <div ref={overlayRef} className={styles.overlay} />

      <div className={styles.menuContent}>
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

        <aside ref={socialSectionRef} className={styles.socialSection}>
          <div className={styles.socialGroup}>
            <span className={styles.socialLabel}>Social Presence</span>
            <ul className={styles.socialList}>
              {socialLinks.map((social) => (
                <li key={social.label} className={styles.socialItem}>
                  <a
                    href={social.href}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isOpen ? 0 : -1}
                  >
                    {/* Base text - white, moves up on hover */}
                    <span className={styles.socialTextBase}>
                      {social.label.split('').map((char, index) => (
                        <span
                          key={index}
                          className={styles.socialChar}
                          style={{ transitionDelay: `${index * 0.025}s` }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                    {/* Clone text - teal, reveals from below on hover */}
                    <span className={styles.socialTextClone} aria-hidden="true">
                      {social.label.split('').map((char, index) => (
                        <span
                          key={index}
                          className={styles.socialChar}
                          style={{ transitionDelay: `${index * 0.025}s` }}
                        >
                          {char}
                        </span>
                      ))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.locationGroup}>
            <span className={styles.socialLabel}>Location</span>
            <p className={styles.locationText}>Based in Europe,<br />Working Worldwide</p>
          </div>

          <button
            className={styles.backButton}
            onClick={onClose}
            tabIndex={isOpen ? 0 : -1}
            aria-label="Close menu"
          >
            <svg
              className={styles.backArrow}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
            <span className={styles.backText}>Back</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
