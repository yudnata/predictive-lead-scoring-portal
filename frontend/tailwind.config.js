/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderWidth: {
        0.5: '0.5px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'loading-bar': 'loading-bar 1s ease-in-out infinite',
      },
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
      },
      colors: {
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          input: '#2C2C2C',
          hover: '#242424',
        },
        light: {
          bg: "#F0F2F5",
          card: "#FAFAFA",
          input: "#E3E3E3",
          hover: "#DDDDDD",
        },
        brand: {
          DEFAULT: '#66BB6A',
          hover: '#2C6B28',
        },
      },
    },
  },
  plugins: [],
};
