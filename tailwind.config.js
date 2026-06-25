/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: '#070710',
          1: '#0B0B17',
          2: '#11111F',
          3: '#16162A',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,.07)',
          strong: 'rgba(255,255,255,.12)',
        },
        fox: {
          DEFAULT: '#ECECF5',
          2: '#9A9AB0',
          3: '#5E5E78',
        },
        violet: '#8B5CF6',
        cyan: '#22D3EE',
        lime: '#34D399',
        amber: '#F59E0B',
        red: '#F87171',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Syncopate', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 60px -30px rgba(0,0,0,.8)',
      },
      backgroundImage: {},
    },
  },
  plugins: [],
}