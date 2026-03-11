/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Clash Display', 'Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          800: '#18181b',
          900: '#09090b',
        }
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'count-up': 'countUp 0.5s ease-out',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateY(-10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseSoft: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        countUp: { from: { transform: 'translateY(10px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
      }
    },
  },
  plugins: [],
}