/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#1D9E75',
          light:   '#e1f5ee',
          mid:     '#9FE1CB',
          dark:    '#0F6E56',
        },
        navy: {
          DEFAULT: '#0B1026',
          heading: '#0a1628',
        },
        surface: '#f0faf6',
      },
      borderRadius: {
        pill: '999px',
        card: '16px',
      },
    },
  },
  plugins: [],
};
