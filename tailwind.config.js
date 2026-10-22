/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Plus Jakarta Sans"',
          "system-ui",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        apple: {
          surface: "rgba(255, 255, 255, 0.04)",
          surfaceHover: "rgba(255, 255, 255, 0.08)",
          glassBorder: "rgba(255, 255, 255, 0.12)",
          glassBorderHover: "rgba(255, 255, 255, 0.25)",
          glassHighlight: "rgba(255, 255, 255, 0.35)",
        },
      },
      backdropBlur: {
        xs: "2px",
        "2xl": "40px",
        "3xl": "64px",
      },
      boxShadow: {
        "liquid-card": "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2), inset 0 -1px 1px rgba(0, 0, 0, 0.3)",
        "liquid-glow": "0 0 35px -5px rgba(56, 189, 248, 0.25)",
        "liquid-pill": "0 8px 24px -4px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35)",
        "specular": "inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.2)",
      },
      animation: {
        "liquid-drift": "liquid-drift 18s ease-in-out infinite alternate",
        "liquid-pulse": "liquid-pulse 10s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
      },
      keyframes: {
        "liquid-drift": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(30px, -40px) scale(1.1)" },
          "100%": { transform: "translate(-20px, 30px) scale(0.95)" },
        },
        "liquid-pulse": {
          "0%, 100%": { opacity: "0.45", filter: "blur(70px)" },
          "50%": { opacity: "0.75", filter: "blur(90px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
