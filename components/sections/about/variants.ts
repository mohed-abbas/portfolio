/* About section — variant registry.
   Toggleable looks share the same content (content.about + hero/skills +
   navigation.location), switched via ?about= and a dev picker, mirroring the
   Workflow section. The verb-stack is the baseline/default. The dossier,
   timeline, ide and editorial variants additionally surface the CV blocks
   (experience / certifications / education). */

export type AboutVariant =
  | 'verbstack'
  | 'terminal'
  | 'bento'
  | 'marquee'
  | 'ledger'
  | 'dossier'
  | 'timeline'
  | 'ide'
  | 'editorial';

export const ABOUT_VARIANT_ORDER: AboutVariant[] = [
  'verbstack',
  'terminal',
  'bento',
  'marquee',
  'ledger',
  'dossier',
  'timeline',
  'ide',
  'editorial',
];

export const DEFAULT_ABOUT_VARIANT: AboutVariant = 'verbstack';

export const ABOUT_LABELS: Record<AboutVariant, string> = {
  verbstack: 'Verb Stack',
  terminal: 'Terminal',
  bento: 'Bento',
  marquee: 'Marquee',
  ledger: 'Ledger',
  dossier: 'Dossier',
  timeline: 'Timeline',
  ide: 'IDE',
  editorial: 'Editorial',
};

export function isAboutVariant(value: string | null | undefined): value is AboutVariant {
  return !!value && (ABOUT_VARIANT_ORDER as string[]).includes(value);
}
