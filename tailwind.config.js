/** @type {import('tailwindcss').Config} */
const { colors, borderRadius, shadows, fontFamily } = require('./constants/design-tokens');

module.exports = {
  // Указываем пути ко всем файлам, где используем классы стилей
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...colors,
        // Alias for backward compatibility
        'accent-yellow': colors.accent.orange,
        'accent-purple': colors.accent.purple,
        'accent-green': colors.accent.green,
        'text-main': colors.text.main,
        'text-muted': colors.text.muted,
      },
      borderRadius: {
        ...borderRadius,
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
