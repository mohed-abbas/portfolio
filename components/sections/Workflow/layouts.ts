/* ============================================================
   WORKFLOW · TRANSIT LINE — layout geometries
   One GSAP driver (useTransitDriver) renders any of these.
   A layout is pure geometry + label placement; the stop NAMES,
   copy and accents come from data/content.json (content.workflow).

   The bullet rides the route via getPointAtLength, so straight
   (trunk/rail/diagonal) and curved (loop/star) routes share the
   exact same driver. Stations are positioned at runtime from
   `stopFrac` (fraction along the path), so a disc always sits on
   the line regardless of the route shape.
   ============================================================ */

export type WorkflowVariant = 'trunk' | 'rail' | 'loop' | 'diagonal' | 'star';

export const VARIANT_ORDER: WorkflowVariant[] = ['trunk', 'rail', 'loop', 'diagonal', 'star'];
export const DEFAULT_VARIANT: WorkflowVariant = 'trunk';

/** Flag (station label) placement, used when labelMode === 'fixed'. */
export interface StopLabel {
  fx: number;
  fy: number;
  anchor: 'start' | 'middle' | 'end';
}

/** CSS placard-position modifier (matches a class in Workflow.module.css). */
export type PlacardMode = 'placardBottomLeft' | 'placardRight' | 'placardCenter';

export interface TransitLayout {
  /** Human label for the dev variant picker. */
  label: string;
  viewBox: string;
  /** Route path data, in viewBox user units. */
  d: string;
  /** Closed loop (affects nothing structural; documents intent). */
  closed: boolean;
  /** Fraction along the path (0..1) where each stop's station sits. */
  stopFrac: number[];
  /** How station flags are positioned. 'fixed' uses `labels`; 'radial'
   *  pushes each flag outward from `center`. */
  labelMode: 'fixed' | 'radial';
  labels?: StopLabel[];
  center?: { x: number; y: number };
  placard: PlacardMode;
  /** Scroll runway in viewport-heights while the section is pinned. */
  pinVH: number;
}

// Brand four-point star, scaled from the 24×24 STAR_PATH
// (components/sections/Services/Star.tsx) into the 1200×700 viewBox:
//   point(x,y) -> (336 + 22x, 86 + 22y)   [scale 22, centre 600,350]
// Cusps land at: top(600,86) right(864,350) bottom(600,614) left(336,350).
const STAR_D =
  'M600 86 C600 86 655 295 864 350 C655 405 600 614 600 614 ' +
  'C600 614 545 405 336 350 C545 295 600 86 600 86 Z';

// Octolinear loop (octagon) centred at (600,350).
const LOOP_D = 'M380 150 L820 150 L960 290 L960 410 L820 550 L380 550 L240 410 L240 290 Z';

export const LAYOUTS: Record<WorkflowVariant, TransitLayout> = {
  // ── Horizontal Trunk: one clean main line, evenly spaced stations ──
  trunk: {
    label: 'Horizontal Trunk',
    viewBox: '0 0 1200 700',
    d: 'M140 350 L1060 350',
    closed: false,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'fixed',
    labels: [
      { fx: 0, fy: -32, anchor: 'middle' },
      { fx: 0, fy: 46, anchor: 'middle' },
      { fx: 0, fy: -32, anchor: 'middle' },
      { fx: 0, fy: 46, anchor: 'middle' },
      { fx: 0, fy: -32, anchor: 'middle' },
    ],
    placard: 'placardBottomLeft',
    pinVH: 3.5,
  },

  // ── Vertical Rail: route descends; scroll-down = forward ──
  rail: {
    label: 'Vertical Rail',
    viewBox: '0 0 1200 700',
    d: 'M360 90 L360 610',
    closed: false,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'fixed',
    labels: [
      { fx: -38, fy: 6, anchor: 'end' },
      { fx: -38, fy: 6, anchor: 'end' },
      { fx: -38, fy: 6, anchor: 'end' },
      { fx: -38, fy: 6, anchor: 'end' },
      { fx: -38, fy: 6, anchor: 'end' },
    ],
    placard: 'placardRight',
    pinVH: 3.5,
  },

  // ── Circle Loop: bullet orbits, active title sits in the centre ──
  loop: {
    label: 'Circle Loop',
    viewBox: '0 0 1200 700',
    d: LOOP_D,
    closed: true,
    stopFrac: [0, 0.2, 0.4, 0.6, 0.8],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
  },

  // ── Diagonal Cross: bold corner-to-corner sweep ──
  diagonal: {
    label: 'Diagonal Cross',
    viewBox: '0 0 1200 700',
    d: 'M180 560 L1040 150',
    closed: false,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'fixed',
    labels: [
      { fx: 8, fy: 40, anchor: 'start' },
      { fx: -12, fy: -26, anchor: 'end' },
      { fx: 8, fy: 40, anchor: 'start' },
      { fx: -12, fy: -26, anchor: 'end' },
      { fx: 8, fy: 40, anchor: 'start' },
    ],
    placard: 'placardBottomLeft',
    pinVH: 3.5,
  },

  // ── Star: bullet rides the brand sparkle; 4 cusps + 1 climb stop ──
  star: {
    label: 'Star',
    viewBox: '0 0 1200 700',
    d: STAR_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 0.875],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
  },
};

export function isVariant(value: string | null | undefined): value is WorkflowVariant {
  return !!value && (VARIANT_ORDER as string[]).includes(value);
}
