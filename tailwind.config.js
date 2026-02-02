/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pixel-blue': '#4a90d9',
        'pixel-gold': '#f7c948',
        'pixel-dark': '#1a1a2e',
        'pixel-cyan': '#4ecdc4',
        'pixel-coral': '#ff6b6b',
        'pixel-purple': '#9b59b6',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        zpix: ['Zpix', 'sans-serif'],
      },
      animation: {
        'pixel-blink': 'blink 1s step-end infinite',
        'pixel-bounce': 'pixelBounce 0.5s ease-in-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
