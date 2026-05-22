'use client';

import { useReducedMotion } from '@/lib/useReducedMotion';
import { useStaticFallback } from './useStaticFallback';
import { StaticServices } from './StaticServices';
import { DrumServices } from './DrumServices';

export function Services() {
  const reducedMotion = useReducedMotion();
  const isCoarseOrSmall = useStaticFallback();
  const useStaticLayout = reducedMotion || isCoarseOrSmall;

  return useStaticLayout ? <StaticServices /> : <DrumServices />;
}
