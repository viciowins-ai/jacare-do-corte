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
          DEFAULT: "#2E5C31", // Forest Green from logo/headers
          dark: "#1F4221",
          light: "#3E7A42"
        },
        secondary: {
          DEFAULT: "#D4AF37", // Gold from logo/stars
          dark: "#B8962E",
          light: "#E5C558"
        },
        background: {
          DEFAULT: "#FFFFFF",
          muted: "#F5F5F5",
        },
        text: {
          DEFAULT: "#1A1A1A",
          muted: "#666666",
          light: "#FFFFFF"
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
