import type { Config } from "tailwindcss";

const config = {
  content: [] as string[],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "background-soft": "var(--background-soft)",
        "background-elevated": "var(--background-elevated)",
        foreground: "var(--foreground)",
        "foreground-muted": "var(--foreground-muted)",
        navy: {
          DEFAULT: "var(--navy)",
          light: "var(--navy-light)",
          dark: "var(--navy-dark)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          light: "var(--gold-light)",
          dark: "var(--gold-dark)",
        },
        cherry: {
          DEFAULT: "var(--cherry)",
          light: "var(--cherry-light)",
          dark: "var(--cherry-dark)",
        },
        burgundy: {
          DEFAULT: "var(--burgundy)",
          light: "var(--burgundy-light)",
        },
        accent: {
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
        },
        border: "var(--border)",
        "border-light": "var(--border-light)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        gold: "0 0 20px rgba(212, 175, 55, 0.15)",
        cherry: "var(--shadow-cherry)",
      },
      maxWidth: {
        container: "var(--container-max)",
      },
      spacing: {
        "section-gap": "var(--section-gap)",
        "header-height": "var(--header-height)",
        "category-nav-height": "var(--category-nav-height)",
      },
    },
  },
};

export default config satisfies Config;
