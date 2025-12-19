/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2A4B2F", // Dark Forest Green from mockup
          dark: "#1F3A23",
          light: "#3E6644"
        },
        secondary: {
          DEFAULT: "#D4AF37", // Gold
          dark: "#B8962E",
          light: "#E5C558"
        },
        background: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F7", // Very light gray for inputs
        },
        text: {
          DEFAULT: "#1A1A1A",
          muted: "#666666",
          light: "#FFFFFF",
          green: "#2A4B2F"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
