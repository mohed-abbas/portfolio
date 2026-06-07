'use client';

/* ============================================================
   WORKFLOW — section orchestrator
   Reads the active variant (dev ?wf= deep link) and hands off to
   the matching renderer:
     • transit  → TransitWorkflow  (original metro layouts, refs)
     • orbit    → OrbitWorkflow     (sparkle / plusgrid / cosmic)
     • typering → TypeRingWorkflow  (big-type ring)
   The dev variant picker is rendered once here, above whichever
   renderer is active. Mounted in the home scroll just before Contact.
     • orrery / constellation / eclipse / signal → one variant each,
       self-contained concept renderers.
   ============================================================ */

import { useEffect, useSyncExternalStore } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import {
  LAYOUTS,
  DEFAULT_VARIANT,
  isVariant,
  type WorkflowVariant,
} from './layouts';
import { TransitWorkflow } from './variants/TransitWorkflow';
import { OrbitWorkflow } from './variants/OrbitWorkflow';
import { TypeRingWorkflow } from './variants/TypeRingWorkflow';
import { OrreryWorkflow } from './variants/OrreryWorkflow';
import { ConstellationWorkflow } from './variants/ConstellationWorkflow';
import { EclipseWorkflow } from './variants/EclipseWorkflow';
import { SignalWorkflow } from './variants/SignalWorkflow';
import { ResolveWorkflow } from './variants/ResolveWorkflow';
import { ApertureWorkflow } from './variants/ApertureWorkflow';
import { RegisterWorkflow } from './variants/RegisterWorkflow';
import { SettlingWorkflow } from './variants/SettlingWorkflow';
import { VariantPicker } from './VariantPicker';

const SHOW_PICKER = process.env.NODE_ENV !== 'production';

// ── Active variant store (dev-preview ?wf= deep link) ──
// useSyncExternalStore keeps SSR + first client render on DEFAULT (the
// server snapshot), then switches to the URL value after hydration. This is
// hydration-safe: production has no ?wf param, so the snapshots always agree.
const variantListeners = new Set<() => void>();
function subscribeVariant(listener: () => void) {
  variantListeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    variantListeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}
function getVariantSnapshot(): WorkflowVariant {
  const param = new URLSearchParams(window.location.search).get('wf');
  return isVariant(param) ? param : DEFAULT_VARIANT;
}
function getVariantServerSnapshot(): WorkflowVariant {
  return DEFAULT_VARIANT;
}
function setVariantParam(next: WorkflowVariant) {
  const url = new URL(window.location.href);
  url.searchParams.set('wf', next);
  window.history.replaceState(null, '', url);
  variantListeners.forEach((l) => l());
}

export function Workflow() {
  const variant = useSyncExternalStore(
    subscribeVariant,
    getVariantSnapshot,
    getVariantServerSnapshot,
  );

  const renderer = LAYOUTS[variant].renderer ?? 'transit';

  // A variant change can swap renderers (e.g. the server-default `trunk` →
  // a client `?wf=` orbit/typering), which unmounts one workflow component and
  // mounts another — so the workflow pin is recreated AFTER the later Contact
  // pin already exists. GSAP refreshes equal-priority pins in *creation* order,
  // so the out-of-order workflow pin's spacing isn't counted in Contact's
  // start — Contact then pins ~3000px early and bleeds over the workflow.
  // ScrollTrigger.sort() re-orders pins by document position; refresh() then
  // recomputes every start/end correctly. (refresh() alone does NOT re-sort.)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, [variant]);

  return (
    <>
      {renderer === 'orbit' && <OrbitWorkflow variant={variant} />}
      {renderer === 'typering' && <TypeRingWorkflow variant={variant} />}
      {renderer === 'orrery' && <OrreryWorkflow variant={variant} />}
      {renderer === 'constellation' && <ConstellationWorkflow variant={variant} />}
      {renderer === 'eclipse' && <EclipseWorkflow variant={variant} />}
      {renderer === 'signal' && <SignalWorkflow variant={variant} />}
      {renderer === 'resolve' && <ResolveWorkflow variant={variant} />}
      {renderer === 'aperture' && <ApertureWorkflow variant={variant} />}
      {renderer === 'register' && <RegisterWorkflow variant={variant} />}
      {renderer === 'settling' && <SettlingWorkflow variant={variant} />}
      {renderer === 'transit' && <TransitWorkflow variant={variant} />}

      {SHOW_PICKER && <VariantPicker value={variant} onChange={setVariantParam} />}
    </>
  );
}
