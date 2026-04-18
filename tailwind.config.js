module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vinho/bordô — cor de destaque principal (botões, active, links)
        brand: {
          50:  "#fdf2f5",
          100: "#fce4ec",
          200: "#f9bfcf",
          300: "#d4698a",
          400: "#C9A96E",   // ouro (hover suave)
          500: "#C9A96E",   // ouro principal — usado em acentos
          600: "#6B1530",   // vinho principal — botões primários
          700: "#531128",
          800: "#3d0a1a",
          900: "#280612",
        },
        // Dourado — badges, destaques, ícones
        gold: {
          50:  "#fffdf0",
          100: "#fef4d8",
          200: "#fde8b0",
          300: "#e8d5a3",
          400: "#d4b87d",
          500: "#C9A96E",   // ouro da logo
          600: "#b08840",
          700: "#8a6628",
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
        // Vinho/bordô — cor principal do site institucional
        wine: {
          50:  "#fdf2f5",
          100: "#fce7ec",
          200: "#f9c5d0",
          300: "#f390a6",
          400: "#e85c7b",
          500: "#c93058",
          600: "#a01a3f",
          700: "#7d1230",
          800: "#6B1530",   // bordô principal (logo)
          900: "#3d0a1a",
          950: "#1a0309",
        },
        // Ouro institucional — destaque e elegância
        oro: {
          300: "#e8d5a3",
          400: "#d4b87d",
          500: "#C9A96E",   // ouro da logo
          600: "#b08840",
          700: "#8a6628",
        },
        // Fundo escuro — ambiente profissional (tons vinho-escuro)
        dark: {
          50:  "#1e0d12",   // superfície mais clara (cards, inputs)
          100: "#160a0e",
          200: "#100608",
          300: "#0d0307",   // fundo principal do dashboard
          400: "#080102",   // fundo mais escuro
        },
        // Texto — tons quentes neutros (contrastes legíveis no fundo #0d0307)
        ink: {
          100: "#ffffff",
          200: "#f5f0e8",   // branco quente — texto principal
          300: "#d4c2c8",   // texto secundário claro
          400: "#b09aa2",   // texto de suporte — legível no escuro
          500: "#8a7280",   // labels, cabeçalhos de tabela — contraste OK
          600: "#5c4a52",   // texto muito sutil (divisores, placeholders)
          700: "#3d2e34",   // quase invisível — só bordas/fundos
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        heading: ["'DM Sans'", "Inter", "system-ui", "sans-serif"],
        serif:   ["'Playfair Display'", "Georgia", "serif"],
      },
      animation: {
        "fade-in":       "fadeIn 0.4s ease-out forwards",
        "slide-up":      "slideUp 0.4s ease-out forwards",
        "pulse-dot":     "pulseDot 2s ease-in-out infinite",
        "reveal":        "reveal 0.7s ease-out forwards",
        "reveal-left":   "revealLeft 0.7s ease-out forwards",
        "reveal-right":  "revealRight 0.7s ease-out forwards",
        "shimmer":       "shimmer 2.5s linear infinite",
        "float":         "float 4s ease-in-out infinite",
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
        reveal: {
          from: { opacity: "0", transform: "translateY(32px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        revealLeft: {
          from: { opacity: "0", transform: "translateX(-32px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        revealRight: {
          from: { opacity: "0", transform: "translateX(32px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
