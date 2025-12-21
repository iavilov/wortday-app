/** @type {import('tailwindcss').Config} */
const { colors, borderRadius, borderWidth, shadows, fontFamily } = require('./constants/design-tokens');

module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors,
        // User-specified color aliases
        'bg-main': colors.background,
        'ink': colors.text.main,
        'card-bg': colors.surface,
        'accent-yellow': colors.accent.yellow,
        'accent-pink': colors.accent.pink,
        'accent-blue': colors.accent.blue,
        'article-der': '#93C5FD',
        'article-die': '#F9A8D4',
        'article-das': '#86EFAC',
        'text-main': colors.text.main,
        'text-muted': colors.text.muted,
      },
      borderRadius: {
        ...borderRadius,
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
    },
  },
  plugins: [],
}
