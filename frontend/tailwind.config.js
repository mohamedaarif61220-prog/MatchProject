/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06070a',
          900: '#0b0f19',
          800: '#141b2d',
          700: '#1f293d',
          600: '#2b3954',
          500: '#3e5075',
        },
        accent: {
          teal: '#14b8a6',
          emerald: '#10b981',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          // New: signature duo — cool "algorithm" signal vs warm "human" signal
          cyan: '#22d3ee',
          ember: '#fb7a3c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(20, 184, 166, 0.15)',
        'ember-glow': '0 0 40px 0 rgba(251, 122, 60, 0.25)',
        'cyan-glow': '0 0 40px 0 rgba(34, 211, 238, 0.25)',
      },
      scale: {
        '98': '.98',
      },
      keyframes: {
        dashFlow: {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
        nodePulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(34,211,238,0.25)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(34,211,238,0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'dash-flow': 'dashFlow 1s linear infinite',
        'node-pulse': 'nodePulse 2.6s ease-in-out infinite',
        'float-slow': 'floatSlow 7s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}