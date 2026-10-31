/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        command: {
          950: '#060913',
          900: '#0a0f1d',
          800: '#11192e',
          700: '#1e293b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'sans-serif'],
=======
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
>>>>>>> ba3b8f0d9b43c398a687806f4638ea935ada9bf5
      }
    },
  },
  plugins: [],
}

