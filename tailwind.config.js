/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        wellinder: {
          cream: '#F9F5F0',
          dark: '#2E2A26',
          gold: '#C0A06F',
        },
      },
    },
  },
  plugins: [],
}