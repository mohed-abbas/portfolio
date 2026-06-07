/* ============================================================
   WORKFLOW · TRANSIT LINE — layout geometries
   One GSAP driver (useTransitDriver) renders any of these.
   A layout is pure geometry + label placement; the stop NAMES,
   copy and accents come from data/content.json (content.workflow).

   The bullet rides the route via getPointAtLength, so the straight
   trunk and the curved loop/star routes share the exact same
   driver. Stations are positioned at runtime from
   `stopFrac` (fraction along the path), so a disc always sits on
   the line regardless of the route shape.
   ============================================================ */

export type WorkflowVariant =
  // ── transit layouts (metro diagram renderer) ──
  | 'trunk'
  | 'loop'
  | 'star'
  // ── theme-aligned reimaginings (type-ring + orbit renderers) ──
  | 'typering'
  | 'cosmic'
  // ── concept renderers (orrery + eclipse each carry a few forms) ──
  | 'orrery'
  | 'ecliptic'
  | 'atom'
  | 'constellation'
  | 'eclipse'
  | 'annular'
  | 'horizon'
  | 'signal';

export const VARIANT_ORDER: WorkflowVariant[] = [
  'trunk',
  'loop',
  'star',
  'typering',
  'cosmic',
  'orrery',
  'ecliptic',
  'atom',
  'constellation',
  'eclipse',
  'annular',
  'horizon',
  'signal',
];
export const DEFAULT_VARIANT: WorkflowVariant = 'trunk';

/** Which driver renders a layout. Absent → 'transit' (the original metro
 *  driver), so the five original layouts are unchanged. Each concept renderer
 *  (orrery / constellation / eclipse / signal) owns exactly one variant and a
 *  self-contained driver + stylesheet; they reuse only the proven pin/scrub
 *  shape (pin viewport once, scrub a 0..1 progress, preserve scroll on
 *  teardown). */
export type RendererKind =
  | 'transit'
  | 'orbit'
  | 'typering'
  | 'orrery'
  | 'constellation'
  | 'eclipse'
  | 'signal';

/** Decoration strategy for the orbit driver (currently the cosmic variant;
 *  the type keeps the full marker/bullet/field vocabulary so new orbit
 *  variants are a data-only addition).
 *  The orbit driver reuses the proven transit pin + getPointAtLength riding;
 *  this only swaps what the markers, bullet and field look like. */
export interface OrbitStyle {
  /** Glyph drawn at each station. */
  marker: 'sparkle' | 'plus' | 'star';
  /** Progressively paint the route line behind the bullet (vs. a static ring). */
  drawLine: boolean;
  /** Bullet visual that rides the route. */
  bullet: 'spark' | 'plus' | 'comet';
  /** Comet-tail length in path-length units (0 = no trail). */
  trail: number;
  /** Background decoration layer painted behind the route. */
  field: 'none' | 'plusgrid' | 'stars';
  /** Route stroke width in user units. */
  lineWidth: number;
  /** Render the resting route as a dashed orbit (cosmic) rather than solid. */
  dashedRoute?: boolean;
}

/** Config for the type-ring renderer (titles orbit as display type). */
export interface RingConfig {
  /** Ring radius as a fraction of the smaller viewport dimension. */
  radiusFrac: number;
}

/** Form selector for the orrery renderer (shared driver, geometry differs). */
export interface OrreryConfig {
  /** concentric circles · flattened ecliptic ovals · crossing atom rings. */
  form: 'concentric' | 'ecliptic' | 'atom';
}

/** Form selector for the eclipse renderer (shared driver, reveal differs). */
export interface EclipseConfig {
  /** sliding crescent · concentric ring of fire · sweeping horizon line. */
  form: 'crescent' | 'annular' | 'horizon';
}

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
  /** Which driver renders this layout. Absent → 'transit'. */
  renderer?: RendererKind;
  /** Orbit-driver decoration (required when renderer === 'orbit'). */
  orbit?: OrbitStyle;
  /** Type-ring config (required when renderer === 'typering'). */
  ring?: RingConfig;
  /** Orrery form (renderer === 'orrery'; absent → 'concentric'). */
  orrery?: OrreryConfig;
  /** Eclipse form (renderer === 'eclipse'; absent → 'crescent'). */
  eclipse?: EclipseConfig;
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

// True circle centred at (600,350), radius 235. Two semicircular arcs; the
// bullet rides it via getPointAtLength exactly like every other route. Used by
// the big-type ring and the cosmic orbit.
const CIRCLE_D = 'M365 350 A235 235 0 1 1 835 350 A235 235 0 1 1 365 350 Z';

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

  // ══════════════════════════════════════════════════════════════════
  //  THEME-ALIGNED REIMAGININGS — shed the metro chrome, speak the
  //  portfolio's own language (big PP Neue Montreal display type,
  //  accent-cycling glow).
  // ══════════════════════════════════════════════════════════════════

  // ── Big-Type Ring: the path goes invisible; the five step names
  //    orbit as huge display type, the active one snapping upright ──
  typering: {
    label: '◌ Big-Type Ring',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'typering',
    ring: { radiusFrac: 0.34 },
  },

  // ── Cosmic Orbit: a comet rides a dashed orbit through a starfield,
  //    accent-cycling glow, dark-mode-first but theme-aware ──
  cosmic: {
    label: '☄ Cosmic Orbit',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.2, 0.4, 0.6, 0.8],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'orbit',
    orbit: {
      marker: 'star',
      drawLine: false,
      bullet: 'comet',
      trail: 150,
      field: 'stars',
      lineWidth: 3,
      dashedRoute: true,
    },
  },

  // ══════════════════════════════════════════════════════════════════
  //  CONCEPT RENDERERS — each owns one variant + a self-contained driver.
  //  Geometry below is mostly a count + viewBox hint; the actual node
  //  positions live in the matching driver (kept there because each
  //  concept's geometry is bespoke, not a shared route).
  // ══════════════════════════════════════════════════════════════════

  // ── Orrery: concentric orbits, planets revolve on scroll, the one on
  //    the 12-o'clock meridian locks; a ✦ sun holds the centre ──
  orrery: {
    label: '☉ Orrery',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'orrery',
    orrery: { form: 'concentric' },
  },

  // ── Ecliptic: the orrery seen near edge-on — flattened oval orbits,
  //    front/back depth, same meridian lock ──
  ecliptic: {
    label: '◉ Ecliptic',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'orrery',
    orrery: { form: 'ecliptic' },
  },

  // ── Atom: equal thin ellipses crossing a ✦ nucleus; electrons orbit,
  //    the active ring + electron ignite ──
  atom: {
    label: '⚛ Atom',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'orrery',
    orrery: { form: 'atom' },
  },

  // ── Constellation: a hairline draws star-to-star through the starfield,
  //    lighting each named step until the figure (an "M") completes ──
  constellation: {
    label: '✶ Constellation',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: false,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardBottomLeft',
    pinVH: 4,
    renderer: 'constellation',
  },

  // ── Eclipse: a dark body slides off a light disc; the active step name
  //    is swept by the growing crescent of accent light, ending on corona ──
  eclipse: {
    label: '◓ Eclipse',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'eclipse',
    eclipse: { form: 'crescent' },
  },

  // ── Ring of Fire: an annular eclipse — a bright accent arc sweeps a
  //    concentric ring past lit beads, the name holds the dark core ──
  annular: {
    label: '☀ Ring of Fire',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'eclipse',
    eclipse: { form: 'annular' },
  },

  // ── First Light: a horizon line of light sweeps top→bottom (a dawn
  //    terminator), revealing the disc and name band by band ──
  horizon: {
    label: '◑ First Light',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: true,
    stopFrac: [0, 0.25, 0.5, 0.75, 1],
    labelMode: 'radial',
    center: { x: 600, y: 350 },
    placard: 'placardCenter',
    pinVH: 4,
    renderer: 'eclipse',
    eclipse: { form: 'horizon' },
  },

  // ── Signal: one continuous oscilloscope trace draws left→right, its
  //    character changing per step; the active step name rises off the peak ──
  signal: {
    label: '∿ Signal',
    viewBox: '0 0 1200 700',
    d: CIRCLE_D,
    closed: false,
    stopFrac: [0, 0.2, 0.4, 0.6, 0.8],
    labelMode: 'fixed',
    placard: 'placardBottomLeft',
    pinVH: 4,
    renderer: 'signal',
  },
};

export function isVariant(value: string | null | undefined): value is WorkflowVariant {
  return !!value && (VARIANT_ORDER as string[]).includes(value);
}
