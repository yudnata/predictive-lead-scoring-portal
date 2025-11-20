/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderWidth: {
        0.5: '0.5px',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
      colors: {
        dark: {
          bg: '#121212',
          card: '#1E1E1E',
          input: '#2C2C2C',
          hover: '#242424',
        },
        brand: {
          DEFAULT: '#F28500',
          hover: '#d97700',
        },
      },
    },
  },
  plugins: [],
};
