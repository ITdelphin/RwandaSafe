/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
  colors: {
    primary: '#0F4C75',
    emergency: '#EF4444',
    dark: '#0F172A',
    surface: '#F1F5F9',
  },
    },
  },
  plugins: [],
};
