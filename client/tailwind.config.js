/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f3f9",
          100: "#d9e1f0",
          200: "#b3c4e0",
          300: "#8da6d1",
          400: "#6689c1",
          500: "#406bb2",
          600: "#1a4d8f",
          700: "#0f3a6b",
          800: "#0a284a",
          900: "#05162e",
          950: "#020b17",
        },
        gold: {
          50: "#fdf8e8",
          100: "#f9efc5",
          200: "#f3df8a",
          300: "#edcf4f",
          400: "#e8c014",
          500: "#c9a50f",
          600: "#a1810c",
          700: "#795e09",
          800: "#503c06",
          900: "#281e03",
        },
      },
    },
  },
  plugins: [],
};
