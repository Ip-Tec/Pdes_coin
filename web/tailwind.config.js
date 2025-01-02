/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mainBG: "#FBF0EC",
        grayLight: "#f9fafb",
        textPrimary: "#1f2937",
        primary: {
          light: "#3a91a2",
          DEFAULT: "#00687E",
          dark: "#3a91a2",
        },
        text: {
          light: "#f9fafb",
          DEFAULT: "#1f2937",
          dark: "#3a91a2",
        },
        secondary: {
          DEFAULT: "#d67d34",
          dark: "#b05f2a",
        },
        bgColor: {
          DEFAULT: "#00687E",
        },
        textColor: {
          DEFAULT: "#00687E",
        },
      },
    },
  },
  plugins: [],
};
