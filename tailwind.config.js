/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#1a1a1a',
        border: '#2a2a2a',
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        text: '#f5f5f5',
        'text-muted': '#a3a3a3'
      }
    },
  },
  plugins: [],
}
