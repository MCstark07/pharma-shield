/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#0f172a',
        'surface-highlight': '#1e293b',
        'ops-border': '#334155',
        'neon-cyan': '#06b6d4',
        'neon-emerald': '#10b981',
        'neon-rose': '#f43f5e',
        'neon-amber': '#f59e0b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}

