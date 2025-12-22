import { Colors as DesignTokens, FontNames } from './design-tokens';

const tintColorLight = DesignTokens.accentPink;

const sharedColors = {
  text: DesignTokens.textMain,
  background: DesignTokens.background,
  tint: tintColorLight,
  icon: DesignTokens.textMuted,
  tabIconDefault: DesignTokens.textMuted,
  tabIconSelected: tintColorLight,
};

export const Colors = {
  light: sharedColors,
  dark: sharedColors,
};

export const Fonts = {
  ios: {
    sans: FontNames.regular,
    serif: FontNames.medium,
    rounded: FontNames.regular,
    mono: FontNames.regular,
  },
  default: {
    sans: FontNames.regular,
    serif: FontNames.medium,
    rounded: FontNames.regular,
    mono: FontNames.regular,
  },
  web: {
    sans: 'Manrope, sans-serif',
    serif: 'Manrope, serif',
    rounded: 'Manrope, sans-serif',
    mono: 'Manrope, monospace',
  },
};
