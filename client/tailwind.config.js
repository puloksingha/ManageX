/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefbf3",
          100: "#d7f4e2",
          500: "#21b66f",
          700: "#147848",
          900: "#0d4a2d"
        }
      }
    }
  },
  plugins: []
};