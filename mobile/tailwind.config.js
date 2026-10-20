/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#DCE7FF',
          200: '#BCD0FF',
          400: '#5A8BFF',
          500: '#2F6BFF',
          600: '#1F55E0',
          700: '#1A46BD',
          900: '#14286B',
        },
        ink: {
          900: '#0B1220',
          800: '#1E293B',
          700: '#334155',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
        },
        background: '#F5F7FB',
        canvas: '#F5F7FB',
        line: '#E8ECF3',
        success: '#16A34A',
        danger: '#E11D48',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
