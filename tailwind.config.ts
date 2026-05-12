import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:                "#0A0F1C",
        foreground:                "#e2e2e8",
        "primary-fixed":           "#818CF8",
        "primary-fixed-dim":       "#6366F1",
        "secondary-fixed-dim":     "#34D399",
        error:                     "#ffb4ab",
        surface:                   "#0D1424",
        "surface-container":       "#111827",
        "surface-container-low":   "#0F1720",
        "surface-container-lowest":"#070C17",
        "surface-container-high":  "#1E2A3A",
        "surface-bright":          "#2A3A50",
        "outline-variant":         "#1E3A5F",
        "on-surface":              "#e2e2e8",
        "on-surface-variant":      "#b9cacb",
        outline:                   "#4A6080",
        "primary-container":       "#818CF8",
        "secondary-container":     "#34D399",
        "surface-dim":             "#0A0F1C",
      },
      fontFamily: {
        sora:  ["Sora",  "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
