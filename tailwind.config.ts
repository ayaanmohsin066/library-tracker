import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#111318",
        foreground: "#e2e2e8",
        "primary-fixed":           "#7df4ff",
        "primary-fixed-dim":       "#00dbe9",
        "secondary-fixed-dim":     "#2ae500",
        error:                     "#ffb4ab",
        surface:                   "#111318",
        "surface-container":       "#1e2024",
        "surface-container-low":   "#1a1c20",
        "surface-container-lowest":"#0c0e12",
        "surface-container-high":  "#282a2e",
        "surface-bright":          "#37393e",
        "outline-variant":         "#3b494b",
        "on-surface":              "#e2e2e8",
        "on-surface-variant":      "#b9cacb",
        outline:                   "#849495",
        "primary-container":       "#00f0ff",
        "secondary-container":     "#2ff801",
        "surface-dim":             "#111318",
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
