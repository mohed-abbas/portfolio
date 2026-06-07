/* /about page hero — variant registry.
   The hero look is switched via ?hero= and a dev-only picker, mirroring the
   home About (?about=) and Workflow (?wf=) sections. The original editorial
   statement is kept as a fallback; `cover` is the photo-led editorial cover
   under review as the new default. */

export type HeroVariant = 'statement' | 'cover';

export const HERO_VARIANT_ORDER: HeroVariant[] = ['statement', 'cover'];

export const DEFAULT_HERO_VARIANT: HeroVariant = 'statement';

export const HERO_LABELS: Record<HeroVariant, string> = {
  statement: 'Statement',
  cover: 'Cover',
};

export function isHeroVariant(value: string | null | undefined): value is HeroVariant {
  return !!value && (HERO_VARIANT_ORDER as string[]).includes(value);
}
