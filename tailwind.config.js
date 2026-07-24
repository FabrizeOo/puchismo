// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal — Oscuro estilo Kick
        dark: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#0d2911',
          800: '#0a1f0c',
          900: '#071508',
          950: '#030b04',
        },
        // Verde neón Kick
        neon: {
          300: '#b9ff7a',
          400: '#7fff00',
          500: '#53fc18',
          600: '#2dab0a',
        },
        // Colores personalizados
        electric: '#53fc18',
        purple: '#8b5cf6',
        gold: '#fbbf24',
        kick: '#53fc18',
      },

      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.white'),
            a: {
              color: theme('colors.electric'),
              '&:hover': {
                color: theme('colors.cyan[400]'),
              },
            },
          },
        },
      }),

      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        manrope: ['var(--font-manrope)', 'sans-serif'],
      },

      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        
        // Gradientes personalizados — Verde neón
        'gradient-electric': 'linear-gradient(135deg, #53fc18, #2dab0a)',
        'gradient-footer': 'linear-gradient(180deg, transparent, rgba(6, 14, 7, 0.95))',
        'gradient-card': 'linear-gradient(135deg, rgba(83, 252, 24, 0.08), rgba(45, 171, 10, 0.05))',
        'gradient-neon': 'linear-gradient(135deg, #53fc18, #00ff87)',
      },

      boxShadow: {
        'glow-electric': '0 0 20px rgba(83, 252, 24, 0.5)',
        'glow-neon': '0 0 30px rgba(83, 252, 24, 0.7), 0 0 60px rgba(83, 252, 24, 0.2)',
        'glow-kick': '0 0 25px rgba(83, 252, 24, 0.8), 0 0 50px rgba(45, 171, 10, 0.4)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-gold': '0 0 15px rgba(251, 191, 36, 0.3)',
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.2)',
        'elevation-2': '0 3px 6px rgba(0, 0, 0, 0.3)',
        'elevation-3': '0 10px 20px rgba(0, 0, 0, 0.4)',
        'glassmorphism': '0 8px 32px rgba(83, 252, 24, 0.1)',
      },

      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'slide-in-top': 'slideInTop 0.6s ease-out',
        'slide-in-bottom': 'slideInBottom 0.6s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },

      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(83, 252, 24, 0.5)' },
          '50%': { 'box-shadow': '0 0 40px rgba(83, 252, 24, 0.9), 0 0 80px rgba(83, 252, 24, 0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        slideInTop: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },

      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },

      transitionDuration: {
        '2000': '2000ms',
        '3000': '3000ms',
      },

      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },

      aspectRatio: {
        'video': '16 / 9',
        'square': '1 / 1',
      },
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),

    // Plugin personalizado para glassmorphism
    function ({ addComponents, theme }) {
      addComponents({
        '.glassmorphism': {
          '@apply bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl':
            {},
        },
        '.glass-card': {
          '@apply bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 rounded-2xl': {},
        },
        '.card-hover': {
          '@apply transition-all duration-300 hover:shadow-elevation-3 hover:translate-y-[-4px]': {},
        },
        '.text-gradient': {
          '@apply bg-clip-text text-transparent bg-gradient-to-r from-electric via-cyan-400 to-purple': {},
        },
      });
    },
  ],
};
