'use client';

/* ABOUT PAGE · hero switcher.
   Resolves one of the hero looks (statement / descent / build-log) from ?hero=
   and a dev picker, mirroring the home About (?about=) and Workflow (?wf=)
   sections. Each variant renders its own <section>, so the page composition is
   unchanged. useSyncExternalStore keeps SSR + first client render on the
   default (statement), then switches to the URL value after hydration, which is
   hydration-safe because production has no ?hero param. */

import { useSyncExternalStore, type ComponentType } from 'react';
import { AboutPageHero } from './Hero';
import { AboutPageHeroCover } from './HeroCover';
import { HeroPicker } from './HeroPicker';
import { DEFAULT_HERO_VARIANT, isHeroVariant, type HeroVariant } from './heroVariants';

const SHOW_PICKER = process.env.NODE_ENV !== 'production';

const heroListeners = new Set<() => void>();
function subscribeHero(listener: () => void) {
  heroListeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    heroListeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}
function getHeroSnapshot(): HeroVariant {
  const param = new URLSearchParams(window.location.search).get('hero');
  return isHeroVariant(param) ? param : DEFAULT_HERO_VARIANT;
}
function getHeroServerSnapshot(): HeroVariant {
  return DEFAULT_HERO_VARIANT;
}
function setHeroParam(next: HeroVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set('hero', next);
  window.history.replaceState(null, '', url);
  heroListeners.forEach((l) => l());
}

const VARIANTS: Record<HeroVariant, ComponentType> = {
  statement: AboutPageHero,
  cover: AboutPageHeroCover,
};

export function AboutPageHeroSwitcher() {
  const variant = useSyncExternalStore(subscribeHero, getHeroSnapshot, getHeroServerSnapshot);
  const Active = VARIANTS[variant];

  return (
    <>
      <Active />
      {SHOW_PICKER && <HeroPicker value={variant} onChange={setHeroParam} />}
    </>
  );
}
