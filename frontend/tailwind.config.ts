import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#08090E",
        surface: "#0E0F17",
        s2:      "#13141F",
        border:  "#1C1D2E",
        green:   "#00D37A",
        red:     "#FF4D6A",
        yellow:  "#FFB547",
        blue:    "#4F8EF7",
        text1:   "#E8E9F0",
        text2:   "#9899B0",
        text3:   "#5A5B72",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
