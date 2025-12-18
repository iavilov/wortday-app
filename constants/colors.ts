/**
 * Color Palette
 * Base colors - raw hex values that don't change
 * Inspired by the app screenshot design
 */

export const palette = {
  // Purple shades (main brand color)
  purple: {
    50: '#FAF9FC',
    100: '#E8E4F3',   // Light background
    200: '#D4CCEB',
    300: '#A89BDC',   // Medium accent
    400: '#9B8CD9',
    500: '#8B5CF6',   // Primary purple
    600: '#7C4EE8',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#2D2847',   // Dark text/buttons
  },

  // Orange shades (streak, progress)
  orange: {
    300: '#FFD29B',
    400: '#FFB84C',
    500: '#FF9B57',   // Main streak color
    600: '#F97316',
    700: '#EA580C',
  },

  // Neutral shades (backgrounds, text)
  neutral: {
    0: '#FFFFFF',     // Pure white
    50: '#F9FAFB',
    100: '#F3F4F6',   // Light gray
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',   // Muted text
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#1F1E2E',   // Dark text
  },

  // Green (success, das article)
  green: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    300: '#6EE7B7',
    500: '#10B981',
    700: '#047857',
  },

  // Blue (der article)
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    300: '#93C5FD',
    500: '#3B82F6',
    700: '#1D4ED8',
  },

  // Red (die article, favorites)
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    300: '#FCA5A5',
    500: '#EF4444',
    700: '#B91C1C',
  },
};

/**
 * Article colors (adapted to new palette)
 */
export const articleColors = {
  der: {
    bg: palette.blue[100],
    text: palette.blue[700],
    border: palette.blue[300],
    accent: palette.blue[500],
  },
  die: {
    bg: palette.red[100],
    text: palette.red[700],
    border: palette.red[300],
    accent: palette.red[500],
  },
  das: {
    bg: palette.green[100],
    text: palette.green[700],
    border: palette.green[300],
    accent: palette.green[500],
  },
  none: {
    bg: palette.neutral[100],
    text: palette.neutral[700],
    border: palette.neutral[300],
    accent: palette.neutral[500],
  },
} as const;
