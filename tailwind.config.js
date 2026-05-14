/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fab-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'live-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        /** Shifts a wide linear-gradient so a live card “sync ring” appears to move */
        'live-border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fab-spin': 'fab-spin 0.7s linear infinite',
        'live-pulse': 'live-pulse 1.5s ease-in-out infinite',
        shimmer: 'shimmer 1.4s infinite',
        blink: 'blink 1s ease-in-out infinite',
        'live-border-flow': 'live-border-flow 2.6s ease-in-out infinite',
        'live-border-flow-fast': 'live-border-flow 1.35s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
