'use client';

import { useEffect, useRef, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from '@/lib/gsap';

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

    // PERF: RAF loop with visibility optimization
    // Lenis internally optimizes when scroll velocity is zero
    let rafId: number;

    function raf(time: number) {
      // PERF: Skip processing when tab is hidden to save resources
      if (!document.hidden) {
        lenis.raf(time);
      }
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

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
      cancelAnimationFrame(rafId);
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
