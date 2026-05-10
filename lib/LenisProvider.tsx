'use client';

import { useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

// ============================================
// LENIS CONTEXT - Allows child components to scroll programmatically
// ============================================
interface LenisContextValue {
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
}

const LenisContext = createContext<LenisContextValue>({
  scrollTo: () => {},
});

export const useLenis = () => useContext(LenisContext);

// ============================================
// PROVIDER
// ============================================
interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const firstRouteRef = useRef(true);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // PERF: Drive Lenis from gsap.ticker so all RAF-driven animations
    // (Lenis, CustomCursor, GSAP tweens) share a single frame loop.
    // gsap.ticker passes time in seconds; lenis.raf expects ms.
    const tick = (time: number) => {
      if (!document.hidden) {
        lenis.raf(time * 1000);
      }
    };
    // Capture so StrictMode dev-mount→unmount→remount doesn't permanently
    // disable lagSmoothing. Zero-arg getter is supported at runtime but not
    // in GSAP's d.ts; cast around it. Getter returns the threshold only —
    // restoring collapses adjustedLag to GSAP default 33.
    const prevLagSmoothing = (
      gsap.ticker.lagSmoothing as unknown as () => number
    )();
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0); // Required by Lenis to keep scroll timing accurate

    // PERF: Handle visibility change - sync when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && lenisRef.current) {
        // Sync scroll state when tab regains focus
        lenisRef.current.raf(performance.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(prevLagSmoothing);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Reset scroll + ScrollTrigger world on client-side route changes.
  // Cold load is handled by the inline scrollTo(0,0) in layout.tsx, so the
  // very first run of this effect must be a no-op — otherwise Lenis fights
  // the inline reset and ScrollTrigger.refresh() runs before any page-level
  // triggers exist.
  useEffect(() => {
    if (firstRouteRef.current) {
      firstRouteRef.current = false;
      return;
    }
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    ScrollTrigger.refresh();
    ScrollTrigger.update();
  }, [pathname]);

  const scrollTo = useCallback((target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => {
    lenisRef.current?.scrollTo(target, options);
  }, []);

  const contextValue = useMemo<LenisContextValue>(() => ({
    scrollTo,
  }), [scrollTo]);

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
