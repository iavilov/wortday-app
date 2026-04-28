/** @type {import('tailwindcss').Config} */
const { colors, borderRadius, borderWidth, shadows, fontFamily } = require('./constants/design-tokens');

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors,
        // System aliases (canonical)
        'bg-main': colors.background,
        'ink': colors.text.main,
        'card-bg': colors.surface,

        // Semantic action colors — use these by role, not by hue
        'action': colors.primary.DEFAULT,
        'action-fg': colors.primary.foreground,
        'attention': colors.accent.yellow,
        'meta': colors.accent.pink,
        'progress': colors.accent.blue,
        'destructive': '#EF4444',
        'destructive-soft': '#FFF1F1',

        // Legacy hue aliases (kept for back-compat — prefer semantic above)
        'accent-yellow': colors.accent.yellow,
        'accent-pink': colors.accent.pink,
        'accent-blue': colors.accent.blue,

        // Article colors (separate sub-palette — never mix with system)
        'article-der': '#93C5FD',
        'article-die': '#F9A8D4',
        'article-das': '#6BCF7F',

        'text-main': colors.text.main,
        'text-muted': colors.text.muted,

        // Etymology / info background
        'info-soft': '#E7F8E5',
      },
      borderRadius: {
        ...borderRadius,
        'tag': 4,
        'btn': 12,
        'card': 20,
        'pill': 999,
      },
      borderWidth: {
        ...borderWidth,
      },
      boxShadow: {
        ...shadows,
      },
      fontFamily: {
        ...fontFamily,
      },
      minWidth: { 'tap': '44px' },
      minHeight: { 'tap': '44px' },
    },
  },
  plugins: [],
}
