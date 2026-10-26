/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        surface: '#121216',
        card: '#18181c',
        border: 'rgba(255, 255, 255, 0.08)',
        accent: {
          cyan: '#00f2fe',
          blue: '#38bdf8',
          purple: '#8b5cf6',
          pink: '#ff2e93',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glow: '0 0 40px -10px rgba(0, 242, 254, 0.3)',
      }
    },
  },
  plugins: [],
}
