import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0f1115",
          900: "#171b22",
          700: "#252b35",
          500: "#5d6573",
        },
        paper: {
          50: "#f8f4ec",
          100: "#efe6d8",
          200: "#d9ccb8",
          300: "#bcae98",
        },
        sage: {
          300: "#bfd0b0",
          400: "#97af86",
          500: "#6c815f",
        },
        bronze: {
          500: "#b7864f",
        },
        wood: {
          700: "#2a241d",
          900: "#1b1713",
        },
      },
      boxShadow: {
        key: "0 18px 45px rgba(15, 17, 21, 0.14)",
        panel: "0 28px 70px rgba(0, 0, 0, 0.28)",
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};

export default config;
