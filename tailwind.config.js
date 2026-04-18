module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Azul jurídico — cor principal do escritório
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",   // azul jurídico principal
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3066",
        },
        // Dourado — prestígio e destaques jurídicos
        gold: {
          50:  "#fffdf0",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#c9a84c",   // dourado jurídico
          600: "#a37f2d",
          700: "#7c5f1b",
          800: "#5c430f",
          900: "#3a2a08",
        },
        // Verde — confirmações, concluídos
        success: {
          500: "#22c55e",
          600: "#16a34a",
        },
        // Vermelho — alertas, urgente
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
        // Âmbar — atenção, pendente
        warn: {
          500: "#f59e0b",
          600: "#d97706",
        },
        // Fundo escuro — ambiente profissional
        dark: {
          50:  "#1e2740",
          100: "#161e32",
          200: "#101828",
          300: "#0c1320",
          400: "#080f18",
        },
        // Texto — tom azulado neutro
        ink: {
          100: "#ffffff",
          200: "#e8eef8",
          300: "#9eacc4",
          400: "#6b7fa0",
          500: "#475672",
          600: "#2d3b54",
          700: "#1a2438",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        heading: ["'DM Sans'", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":  "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};
