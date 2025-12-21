'use client';

import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import styles from './Menu.module.css';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuLinks = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
];

export function Menu({ isOpen, onClose }: MenuProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLUListElement>(null);

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
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useGSAP(() => {
    if (!overlayRef.current || !linksContainerRef.current) return;

    const links = linksContainerRef.current.querySelectorAll('a');
    if (links.length === 0) return;

    // Kill existing animations on these elements
    gsap.killTweensOf([overlayRef.current, ...links]);

    if (isOpen) {
      // Set initial states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(links, { y: '100%', opacity: 0 });

      // Create animation timeline
      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      })
      .to(links, {
        y: '0%',
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
      }, '-=0.3');
    }
  }, { dependencies: [isOpen] });

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    // Delay scroll to allow menu close animation
    setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <div className={`${styles.menu} ${isOpen ? styles.menuOpen : ''}`}>
      <div ref={overlayRef} className={styles.overlay} />
      <nav className={styles.nav} role="navigation" aria-label="Main menu">
        <ul ref={linksContainerRef} className={styles.linkList}>
          {menuLinks.map((link) => (
            <li key={link.href} className={styles.linkItem}>
              <div className={styles.linkMask}>
                <a
                  href={link.href}
                  className={styles.link}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <span className={styles.linkText}>{link.label}</span>
                  <span className={styles.linkFill} aria-hidden="true">{link.label}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
