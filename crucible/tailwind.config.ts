import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070A12",
          900: "#0B0F1A",
          800: "#121829",
          700: "#1B2238",
          600: "#262E47",
          500: "#3A4364",
        },
        ember: {
          400: "#FFB454",
          500: "#FF8A2A",
          600: "#E66B00",
        },
        plasma: {
          300: "#9DEBFF",
          400: "#5BD3FF",
          500: "#22B8FF",
        },
        signal: {
          green: "#3DDC97",
          red: "#FF5C7A",
          amber: "#FFC857",
          violet: "#B98CFF",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Inter", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(91,211,255,0.18), 0 8px 32px -12px rgba(34,184,255,0.35)",
        ember: "0 0 0 1px rgba(255,138,42,0.25), 0 12px 36px -12px rgba(255,138,42,0.4)",
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
