/**
 * Design Tokens
 * Semantic color names based on their purpose/usage
 * Single source of truth for all colors in the app
 */

import { articleColors, palette } from './colors';

/**
 * Semantic colors for Tailwind and components
 */
export const colors = {
  // Background colors
  background: palette.purple[100],  // Light purple background
  surface: palette.neutral[0],      // White cards

  // Primary brand color (buttons, main elements)
  primary: {
    DEFAULT: palette.purple[900],   // Dark purple
    foreground: palette.neutral[0], // White text on primary
  },

  // Accent colors for highlights
  accent: {
    purple: palette.purple[500],    // Main purple accent
    orange: palette.orange[500],    // Streak/progress
    green: palette.green[500],      // Success
  },

  // Text colors
  text: {
    main: palette.neutral[900],     // Dark text
    muted: palette.neutral[500],    // Secondary text
  },

  // Utility colors
  gray: {
    50: palette.neutral[50],
    100: palette.neutral[100],
    200: palette.neutral[200],
    300: palette.neutral[300],
    500: palette.neutral[500],
  },
};

/**
 * Export for inline styles (React Native components)
 */
export const Colors = {
  // Background
  background: colors.background,
  surface: colors.surface,

  // Primary
  primary: colors.primary.DEFAULT,
  primaryForeground: colors.primary.foreground,

  // Accents
  accentPurple: colors.accent.purple,
  accentOrange: colors.accent.orange,
  accentGreen: colors.accent.green,

  // Text
  textMain: colors.text.main,
  textMuted: colors.text.muted,

  // Grays
  gray50: colors.gray[50],
  gray100: colors.gray[100],
  gray200: colors.gray[200],
  gray300: colors.gray[300],
  gray500: colors.gray[500],

  // Article colors (for word cards)
  articleColors,
};

/**
 * Border radius tokens
 */
export const borderRadius = {
  card: '1.5rem',   // 24px
  button: '9999px', // Full rounded
  xl: '0.75rem',    // 12px
  lg: '0.5rem',     // 8px
};

/**
 * Shadow tokens
 */
export const shadows = {
  soft: '0 10px 40px -10px rgba(0,0,0,0.08)',
  card: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

/**
 * Font family tokens
 */
export const fontFamily = {
  rubik: ['Rubik', 'sans-serif'],
};
