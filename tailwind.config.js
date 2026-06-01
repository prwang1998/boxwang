/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#e8a849',
        'primary-hover': '#d4943a',
        surface: {
          DEFAULT: '#1a1a1a',
          elevated: '#242424',
          hover: '#2e2e2e',
        },
        accent: {
          DEFAULT: '#e8a849',
          hover: '#d4943a',
          muted: 'rgba(232, 168, 73, 0.15)',
        },
        success: '#4ade80',
        error: '#f87171',
        warning: '#fbbf24',
        obsidian: {
          DEFAULT: '#0f0f0f',
          50: '#f5f0eb',
          100: '#8a8580',
          200: '#3a3a3a',
          300: '#2a2a2a',
          400: '#242424',
          500: '#1a1a1a',
          600: '#141414',
          700: '#0f0f0f',
        },
      },
      fontFamily: {
        display: ['"Noto Serif SC"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        lyric: ['"LXGW WenKai"', '"Noto Serif SC"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(232, 168, 73, 0.15)',
        'glow-lg': '0 0 40px rgba(232, 168, 73, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        'radial-glow': 'radial-gradient(ellipse at 20% 50%, rgba(232, 168, 73, 0.06) 0%, transparent 60%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
