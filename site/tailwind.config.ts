import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Marca NaPlanta — vermelho + preto + branco
        brand: {
          DEFAULT: "#E60000",
          50: "#FFF1F1",
          100: "#FFDADA",
          200: "#FFB3B3",
          300: "#FF8080",
          400: "#FA3D3D",
          500: "#E60000",
          600: "#CC0001",
          700: "#A30000",
          800: "#7A0000",
          900: "#520000",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#1A1A1A",
          muted: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 2px 6px rgba(0,0,0,.08), 0 14px 34px rgba(0,0,0,.12)",
      },
    },
  },
  plugins: [],
};

export default config;
