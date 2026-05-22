'use client';

import { gsap, ANIMATION_CONFIG } from '@/lib/gsap';
import { randDir, opposite, dirTransform } from './directions';

const PORTAL_DIST = 110;

export function parkOffStage(elements: HTMLElement[]) {
  elements.forEach((el) => {
    const inv = dirTransform(opposite(randDir()), PORTAL_DIST);
    gsap.set(el, { x: inv.x + '%', y: inv.y + '%' });
  });
}

export function portalOut(elements: HTMLElement[]): Promise<void> {
  return new Promise((resolve) => {
    if (!elements.length) { resolve(); return; }
    const tl = gsap.timeline({
      onComplete: resolve,
      defaults: { duration: 0.25, ease: ANIMATION_CONFIG.ease.inQuad },
    });
    elements.forEach((el, i) => {
      const t = dirTransform(randDir(), PORTAL_DIST);
      tl.to(el, { x: t.x + '%', y: t.y + '%' }, i * 0.018);
    });
  });
}

export function portalIn(elements: HTMLElement[]) {
  elements.forEach((el, i) => {
    const inv = dirTransform(opposite(randDir()), PORTAL_DIST);
    gsap.set(el, { x: inv.x + '%', y: inv.y + '%' });
    gsap.to(el, {
      x: '0%', y: '0%',
      duration: 0.5,
      delay: i * 0.08,
      ease: ANIMATION_CONFIG.ease.outQuad,
    });
  });
}

/* Tools marquee enter/exit. The marquee itself scrolls continuously via
   CSS; on face change we cross-fade the whole track so the content swap
   is hidden. Per-item slide tweens (previous version) are out because
   the SkillsBar-style band is read as one continuous element. */
export function toolsFadeIn(toolsEl: HTMLElement, delay = 0): void {
  gsap.to(toolsEl, {
    opacity: 1,
    duration: 0.4,
    delay,
    ease: ANIMATION_CONFIG.ease.outCubic,
  });
}

export function toolsFadeOut(toolsEl: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    gsap.to(toolsEl, {
      opacity: 0,
      duration: 0.25,
      ease: ANIMATION_CONFIG.ease.inQuad,
      onComplete: () => resolve(),
    });
  });
}
