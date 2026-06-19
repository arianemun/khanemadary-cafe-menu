import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--primary-bg)",
        foreground: "var(--primary-text)",
        card: "var(--card-bg)",
        muted: "var(--secondary-bg)",
        accent: "var(--accent-color)",
        border: "var(--border-color)",
        "secondary-text": "var(--secondary-text)",
        status: "var(--status-open)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        btn: "var(--radius-btn)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      spacing: {
        section: "var(--spacing-section)",
        "card-gap": "var(--spacing-card-gap)",
      },
      fontFamily: {
        fa: ["var(--font-vazirmatn)", "sans-serif"],
        en: ["var(--font-vazirmatn)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        handset: "480px",
        web: "960px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
