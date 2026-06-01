'use client';

/* ============================================================
   ABOUT — variant switcher
   Resolves one of five looks (verbstack / terminal / bento /
   marquee / ledger) from ?about= and a dev picker, mirroring the
   Workflow section. Each variant renders its own <section id="about">,
   so the nav anchor works regardless of the active look.
   ============================================================ */

import { useSyncExternalStore, type ComponentType } from 'react';
import { AboutHero } from './Hero';
import { AboutTerminal } from './variants/Terminal';
import { AboutBento } from './variants/Bento';
import { AboutMarquee } from './variants/Marquee';
import { AboutLedger } from './variants/Ledger';
import { AboutDossier } from './variants/Dossier';
import { AboutTimeline } from './variants/Timeline';
import { AboutIDE } from './variants/IDE';
import { AboutEditorial } from './variants/Editorial';
import { AboutPicker } from './AboutPicker';
import { DEFAULT_ABOUT_VARIANT, isAboutVariant, type AboutVariant } from './variants';

const SHOW_PICKER = process.env.NODE_ENV !== 'production';

// ── Active-variant store (dev-preview ?about= deep link) ──
// useSyncExternalStore keeps SSR + first client render on DEFAULT (the server
// snapshot), then switches to the URL value after hydration — hydration-safe
// because production has no ?about param.
const aboutListeners = new Set<() => void>();
function subscribeAbout(listener: () => void) {
  aboutListeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    aboutListeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}
function getAboutSnapshot(): AboutVariant {
  const param = new URLSearchParams(window.location.search).get('about');
  return isAboutVariant(param) ? param : DEFAULT_ABOUT_VARIANT;
}
function getAboutServerSnapshot(): AboutVariant {
  return DEFAULT_ABOUT_VARIANT;
}
function setAboutParam(next: AboutVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set('about', next);
  window.history.replaceState(null, '', url);
  aboutListeners.forEach((l) => l());
}

const VARIANTS: Record<AboutVariant, ComponentType> = {
  verbstack: AboutHero,
  terminal: AboutTerminal,
  bento: AboutBento,
  marquee: AboutMarquee,
  ledger: AboutLedger,
  dossier: AboutDossier,
  timeline: AboutTimeline,
  ide: AboutIDE,
  editorial: AboutEditorial,
};

export function About() {
  const variant = useSyncExternalStore(
    subscribeAbout,
    getAboutSnapshot,
    getAboutServerSnapshot,
  );
  const Active = VARIANTS[variant];

  return (
    <>
      <Active />
      {SHOW_PICKER && <AboutPicker value={variant} onChange={setAboutParam} />}
    </>
  );
}
