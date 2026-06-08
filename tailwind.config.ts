import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f0e8",
        foreground: "#1c1917",
        sidebar: "#1c1917",
        "sidebar-hover": "#292524",
        "sidebar-active": "#44403c",
        surface: "#ffffff",
        muted: "#78716c",
        border: "#e7e5e4",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        "warning-bg": "#fef3c7",
        "success-bg": "#dcfce7",
        "danger-bg": "#fee2e2"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(to right, #a855f7, #e879f9)",
        "gradient-avatar": "linear-gradient(to bottom, #d946ef, #8b5cf6)",
      }
    }
  },
  plugins: []
};

export default config;
