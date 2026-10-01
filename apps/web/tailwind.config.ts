import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#071422",
          900: "#0B1F3A",
          800: "#143154",
          700: "#1C426E",
        },
        saffron: {
          500: "#E07020",
          700: "#9A3412",
          800: "#7C2D12",
        },
        sand: "#F4F1EB",
        ink: "#142033",
        mute: "#3E4C5E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "var(--font-devanagari)", "sans-serif"],
        serif: ["var(--font-serif)", "var(--font-devanagari)", "serif"],
      },
      maxWidth: {
        page: "72rem",
      },
    },
  },
  plugins: [],
};

export default config;
