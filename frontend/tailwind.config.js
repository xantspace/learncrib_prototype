/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:         '#1939D4',
        'primary-light': '#EEF2FF',
        'primary-dark':  '#0F2391',
        secondary:       '#0A1444',
        accent:          '#F0B429',
        success:         '#00A89D',
        'body-text':     '#2D2D2D',
        surface:         '#F7F7F5',
      },
      fontFamily: {
        outfit:  ['Outfit', 'sans-serif'],
        inter:   ['Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        glass:       '0 8px 32px rgba(25, 57, 212, 0.08)',
        'glass-hover':'0 16px 40px rgba(25, 57, 212, 0.15)',
        glow:        '0 0 20px rgba(25, 57, 212, 0.3)',
      },
      animation: {
        float:        'float 4s ease-in-out infinite',
        shimmer:      'shimmer 1.4s infinite',
        'slide-up':   'slideUp 0.5s ease forwards',
        'pulse-ring': 'pulseRing 1.8s infinite',
        'logo-spin':  'logoPingRotate 3s cubic-bezier(0.4,0,0.2,1) infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.9)', boxShadow: '0 0 0 0 rgba(25,57,212,0.7)' },
          '70%':  { transform: 'scale(1)',   boxShadow: '0 0 0 8px rgba(25,57,212,0)' },
          '100%': { transform: 'scale(0.9)', boxShadow: '0 0 0 0 rgba(25,57,212,0)' },
        },
        logoPingRotate: {
          '0%':   { transform: 'scale(1) rotate(0deg)' },
          '25%':  { transform: 'scale(1) rotate(0deg)' },
          '50%':  { transform: 'scale(1.15) rotate(0deg)', opacity: '0.8' },
          '75%':  { transform: 'scale(1) rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}
