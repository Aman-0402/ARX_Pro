/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "3.75rem",
      },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1F44",
          50: "#f0f4ff",
          100: "#d9e4ff",
          700: "#1a3366",
          800: "#0d2659",
          900: "#0A1F44",
        },
        gold: {
          DEFAULT: "#C9A84C",
          300: "#d4b96a",
          400: "#C9A84C",
          500: "#b5932f",
          600: "#9e7d20",
        },
      },
    },
  },
  plugins: [],
};
