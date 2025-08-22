/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: '#1A3B29',
        'accent-1': '#FFA500',
        'accent-2': '#FFD700',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)'],
        opensans: ['var(--font-opensans)'],
      },
      keyframes: {
        slideIn: {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        scaleUp: {
          '0%': { 
            transform: 'scale(0.9)',
            opacity: '0.8'
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1'
          }
        },
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeOut: {
          '0%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
          '100%': { 
            opacity: '0',
            transform: 'translateY(-10px)'
          }
        },
        blink: {
          '0%, 100%': { borderRightColor: 'transparent' },
          '50%': { borderRightColor: 'currentColor' }
        },
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14.0deg)' },
          '20%': { transform: 'rotate(-8.0deg)' },
          '30%': { transform: 'rotate(14.0deg)' },
          '40%': { transform: 'rotate(-4.0deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' }
        },
        scaleIn: {
          '0%': { 
            transform: 'scale(0.95)',
            opacity: '0' 
          },
          '100%': { 
            transform: 'scale(1)',
            opacity: '1' 
          }
        },
        fadeInFast: {
          '0%': { 
            opacity: '0' 
          },
          '100%': { 
            opacity: '1' 
          }
        }
      },
      animation: {
        slideIn: 'slideIn 0.5s ease-out forwards',
        scaleUp: 'scaleUp 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        fadeOut: 'fadeOut 0.5s ease-out forwards',
        blink: 'blink 0.7s step-end infinite',
        wave: 'wave 1.5s linear infinite',
        scaleIn: 'scaleIn 0.3s ease-out forwards',
        fadeInFast: 'fadeInFast 0.2s ease-out forwards'
      }
    },
  },
  plugins: [],
}