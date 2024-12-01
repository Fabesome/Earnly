/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0891b2',
          light: '#22d3ee'
        },
        secondary: '#5856D6',
        success: '#34C759',
        warning: '#FF9500',
        danger: '#FF3B30',
        background: '#f8fafc',
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'ios': '10px',
      },
      boxShadow: {
        'ios': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}
