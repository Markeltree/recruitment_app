/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#DCE7FF',
          500: '#2F6BFF',
          600: '#1F55E0',
          700: '#1A46BD',
        },
        ink: {
          900: '#0B1220',
          800: '#1E293B',
          700: '#334155',
          500: '#64748B',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,18,32,0.04), 0 8px 24px -12px rgba(11,18,32,0.12)',
        pop: '0 12px 32px -8px rgba(11,18,32,0.18), 0 2px 6px rgba(11,18,32,0.06)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        fadeUp: 'fadeUp .35s ease-out both',
        scaleIn: 'scaleIn .2s ease-out both',
      },
    },
  },
  plugins: [],
};
