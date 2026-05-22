import { getServicesFaces } from '@/data';
import type { ServiceFace } from '@/data';

export const FACES: ReadonlyArray<ServiceFace> = getServicesFaces();
export const TOTAL_LABEL = String(FACES.length).padStart(2, '0');

export const NBSP = ' ';

export type FaceWordChar = { readonly ch: string; readonly accent: boolean };

/* Splits a face word into render-ready characters. The `' ' → NBSP`
   substitution keeps multi-word titles ("SYSTEMS & APIs.") from collapsing to
   zero width inside the flex-laid bigword (white-space: nowrap on an
   inline-block flex item drops bare spaces). Both the drum's imperative
   painter and the static fallback's JSX consume this list, so the substitution
   rule lives in one place. */
export const classifyFaceWord = (word: string): FaceWordChar[] =>
  [...word].map((c) => ({
    ch: c === ' ' ? NBSP : c,
    accent: c === '.',
  }));

export const formatFaceIndex = (i: number): string =>
  `${String(i + 1).padStart(2, '0')} / ${TOTAL_LABEL}`;

export const formatFaceAnnouncement = (i: number): string => {
  const face = FACES[i];
  return `Showing face ${i + 1} of ${FACES.length}: ${face.rail}. ${face.label}.`;
};

/* Marquee repetition factor for the tools track. Each face's tool list is
   repeated this many times to form a "unit"; the unit is then doubled so
   the CSS animation can translate by exactly one unit's width and loop
   seamlessly. Four is wide enough to cover any reasonable viewport given
   our font-size clamp without flooding the DOM. */
export const TOOLS_UNIT_REPEAT = 4;

/* Touch gesture threshold — minimum vertical travel before we count a
   touchmove as a face-advancing swipe. */
export const TOUCH_THRESHOLD_PX = 40;

/* Gesture-coalescing inactivity gap. A continuous wheel burst (trackpad
   momentum, sustained scroll) keeps emitting events ~8–30 ms apart, so any
   gap under this threshold counts as part of the same physical gesture and
   gets absorbed. The next wheel event with a gap larger than this is the
   start of a new gesture. The `swapping` gate still prevents face skipping
   if a trackpad stutter splits one physical flick into two gestures. */
export const GESTURE_GAP_MS = 70;

/* How long the boundary-release scroll runs before we re-arm the wheel path.
   Matches the duration passed to lenis.scrollTo / window.scrollTo below so we
   don't re-fire a fresh scroll mid-animation under a sustained burst. */
export const BOUNDARY_RELEASE_MS = 400;

/* Stable IDs for the section landmark and the current-face description. Only
   one Services exists on the page, so a hand-rolled namespace is simpler than
   useId() (which has known hydration-mismatch failure modes under hot reload
   when paired with useSyncExternalStore-based hooks above it in the tree). */
export const HEADING_ID = 'services-heading';
export const CURRENT_FACE_ID = 'services-current-face';

/* Subscribe to `(pointer: coarse)` and small-screen media queries so a user
   rotating a tablet, resizing the window, or dragging across devices in dev-
   tools picks up the right mode without a full reload. Mirrors useReducedMotion. */
export const STATIC_QUERY = '(pointer: coarse), (max-width: 767px)';
