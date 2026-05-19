import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)"],
        inter: ["var(--font-inter)"],
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'fade-left': 'fadeInFromLeft 0.6s ease-out forwards',
        'fade-right': 'fadeInFromRight 0.6s ease-out forwards',
        'fade-top': 'fadeInFromTop 0.6s ease-out forwards',
        'fade-bottom': 'fadeInFromBottom 0.6s ease-out forwards',
        'fade-scale': 'fadeInScale 0.6s ease-out forwards',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            backgroundSize: '200% 200%',
            backgroundPosition: 'left center'
          },
          '50%': {
            backgroundSize: '200% 200%',
            backgroundPosition: 'right center'
          }
        },
        fadeInFromLeft: {
          from: { opacity: '0', transform: 'translateX(-50px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInFromRight: {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        fadeInFromTop: {
          from: { opacity: '0', transform: 'translateY(-50px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInFromBottom: {
          from: { opacity: '0', transform: 'translateY(50px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        fadeInScale: {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' }
        }
      },
      spacing: {
        '18': '4.5rem',
      },
      screens: {
        'xs': '475px',
      },
      backdropBlur: {
        'xs': '2px',
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(15, 23, 42, 0.7)',
          border: {
            light: 'rgba(255, 255, 255, 0.3)',
            dark: 'rgba(255, 255, 255, 0.1)',
          }
        }
      },
    },
  },
  plugins: [],
};

export default config;
