// Centralized data exports with type safety
// Import JSON data and re-export with types

import type {
  SiteMetadata,
  Content,
  Navigation,
  DesignTokens,
  AnimationConfig,
  Features,
} from './types';

// Import JSON files
import siteMetadataJson from './site-metadata.json';
import contentJson from './content.json';
import navigationJson from './navigation.json';
import designTokensJson from './design-tokens.json';
import animationConfigJson from './animation-config.json';
import featuresJson from './features.json';

// Export typed data
export const siteMetadata: SiteMetadata = siteMetadataJson;
export const content: Content = contentJson;
export const navigation: Navigation = navigationJson;
export const designTokens: DesignTokens = designTokensJson;
export const animationConfig: AnimationConfig = animationConfigJson;
export const features: Features = featuresJson;

// Re-export types for convenience
export type {
  SiteMetadata,
  Content,
  Navigation,
  DesignTokens,
  AnimationConfig,
  Features,
  // Sub-types that might be useful
  NavLink,
  SocialLink,
  HeroContent,
  SkillsContent,
  WelcomeScreenContent,
  ColorTokens,
  TypographyTokens,
  DurationConfig,
  EasingConfig,
  CustomCursorConfig,
  InteractiveBackgroundConfig,
} from './types';

// Convenience helpers
export const getHeroLetters = () => ({
  firstName: content.hero.firstName.split(''),
  lastName: content.hero.lastName.split(''),
});

export const getAccentColors = () => designTokens.colors.accentPalette;

export const getAnimationDuration = (key: keyof typeof animationConfig.durations) =>
  animationConfig.durations[key];

// Type-safe easing getters for each format
export const getGsapEasing = (key: keyof typeof animationConfig.easing.gsap) =>
  animationConfig.easing.gsap[key];

export const getCssEasing = (key: keyof typeof animationConfig.easing.css) =>
  animationConfig.easing.css[key];

export const getFramerMotionEasing = (key: keyof typeof animationConfig.easing.framerMotion) =>
  animationConfig.easing.framerMotion[key];
