/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        bg: {
          base:     '#0E1117',
          surface:  '#161B27',
          elevated: '#1E2535',
          overlay:  '#252D3D',
        },
        accent: {
          DEFAULT: '#10B981',
          hover:   '#059669',
        },
        ai: {
          DEFAULT: '#38BDF8',
        },
        border: {
          DEFAULT: '#1E2D40',
          strong:  '#2A3A52',
        },
        text: {
          primary:   '#F0F4F8',
          secondary: '#8B9AB5',
          muted:     '#4A5568',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#F87171',
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
        xl: '12px',
      },
    },
  },
  plugins: [],
};
