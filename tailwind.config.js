/** @type {import('tailwindcss').Config} */
module.exports = {
  // Указываем пути ко всем файлам, где используем классы стилей
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#F3F0FF', // Светло-сиреневый фон
        surface: '#FFFFFF',    // Белые карточки
        primary: {
          DEFAULT: '#2D2B4A',  // Темный текст/кнопки
          foreground: '#FFFFFF',
        },
        accent: {
          purple: '#8B5CF6',
          yellow: '#FFB84C', // Для страйков
          green: '#10B981',
        },
        text: {
          main: '#1F1E2E',
          muted: '#6B7280',
        }
      },
      borderRadius: {
        'card': '1.5rem', // 24px
        'button': '9999px', // Full
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
