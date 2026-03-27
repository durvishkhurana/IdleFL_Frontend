/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        green:  '#00ff88',
        cyan:   '#00d4ff',
        amber:  '#ffaa00',
        red:    '#ff4444',
        bg:     '#0a0a0f',
        surface:  '#111118',
        surface2: '#16161e',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,255,136,0)' },
          '50%':       { boxShadow: '0 0 12px 4px rgba(0,255,136,0.25)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0' },
        },
      },
      animation: {
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
    },
  },
  plugins: [],
}
