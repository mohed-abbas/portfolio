/* ============================================================
   WORKFLOW — variant registry
   The section ships two scroll-driven treatments of the same five
   process steps (content.workflow). Eclipse is the production default;
   Ecliptic is reachable in dev via the on-screen toggle or ?wf=ecliptic.
   Both renderers share the 1200×700 viewBox and a 0..1 scrubbed pin.
   ============================================================ */

export type WorkflowVariant = 'eclipse' | 'ecliptic';

/** Rendered in production (the dev toggle/`?wf=` only overrides in dev). */
export const DEFAULT_VARIANT: WorkflowVariant = 'eclipse';

/** Order + labels for the dev-only variant toggle. */
export const WORKFLOW_VARIANTS: ReadonlyArray<{ key: WorkflowVariant; label: string }> = [
  { key: 'eclipse', label: '◓ Eclipse' },
  { key: 'ecliptic', label: '◉ Ecliptic' },
];

/** Shared SVG coordinate space for both renderers. */
export const VIEWBOX = '0 0 1200 700';

export function isVariant(value: string | null | undefined): value is WorkflowVariant {
  return value === 'eclipse' || value === 'ecliptic';
}
