/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'drop': {
          '0%': { transform: 'translateY(-100px) scale(1.3)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'drop-reverse': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '100%': { transform: 'translateY(-100px) scale(1.3)', opacity: '1' },
        }
      },
      animation: {
        'drop': 'drop 0.6s ease-out forwards',
        'drop-reverse': 'drop-reverse 0.6s ease-out forwards'
      },
    },
    screens: {
      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "780px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }
    },
  },
  plugins: [],
}


