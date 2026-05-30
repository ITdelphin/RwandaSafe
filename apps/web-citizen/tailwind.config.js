/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B5E82',
        emergency: '#D32F2F',
      },
    },
  },
  plugins: [],
};
