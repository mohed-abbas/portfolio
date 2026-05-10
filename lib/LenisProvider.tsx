'use client';

import { useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

// ============================================
// LENIS CONTEXT - Allows child components to scroll programmatically
// ============================================
interface LenisContextValue {
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => void;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisContextValue>({
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
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

  // Stable callback functions that access ref internally (safe in callbacks)
  const scrollTo = useCallback((target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => {
    lenisRef.current?.scrollTo(target, options);
  }, []);

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<LenisContextValue>(() => ({
    scrollTo,
    stop,
    start,
  }), [scrollTo, stop, start]);

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
