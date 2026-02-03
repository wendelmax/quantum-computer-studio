/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          card: 'rgb(var(--bg-card) / <alpha-value>)'
        },
        primary: 'rgb(var(--primary) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        theme: {
          text: 'rgb(var(--text) / <alpha-value>)',
          'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
          border: 'rgb(var(--border) / <alpha-value>)',
          'input-bg': 'rgb(var(--input-bg) / <alpha-value>)',
          surface: 'rgb(var(--surface) / <alpha-value>)'
        }
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        'bar-grow': {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' }
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'gate-pop': {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '70%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 8px rgb(14 165 233 / 0.3)' },
          '50%': { boxShadow: '0 0 16px rgb(14 165 233 / 0.5)' }
        },
        'cell-breathe': {
          '0%, 100%': { backgroundColor: 'rgb(14 165 233 / 0.08)' },
          '50%': { backgroundColor: 'rgb(14 165 233 / 0.15)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
        'bar-grow': 'bar-grow 0.5s ease-out forwards',
        'shimmer': 'shimmer 1.5s linear infinite',
        'gate-pop': 'gate-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'cell-breathe': 'cell-breathe 2.5s ease-in-out infinite'
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms'
      }
    },
  },
  plugins: [],
}
