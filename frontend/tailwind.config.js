/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#dce5ff',
          300: '#c2d2ff',
          400: '#9cb5ff',
          500: '#637eff', // Brand main blue
          600: '#475df5',
          700: '#394ad9',
          800: '#2f3cae',
          900: '#2a358c',
          950: '#1d2254',
        },
        dark: {
          50: '#b3b3b3',
          100: '#a3a3a3',
          200: '#737373',
          300: '#525252',
          400: '#404040',
          500: '#262626',
          600: '#171717',
          700: '#0a0a0a',
          850: '#121214',
          900: '#030303',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
