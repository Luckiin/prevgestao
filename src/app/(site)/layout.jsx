export const metadata = {
  title: "Deise Lisboa Advocacia — Direito Previdenciário",
  description: "Escritório especializado em Direito Previdenciário. Aposentadorias, benefícios e revisões junto ao INSS. Atendimento humanizado e resultados comprovados.",
  icons: {
    icon:     [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple:    "/favicon.svg",
  },
  openGraph: {
    title:       "Deise Lisboa Advocacia",
    description: "Especialistas em Direito Previdenciário. Seu benefício, nossa causa.",
    type:        "website",
  },
};

export default function SiteLayout({ children }) {
  return <>{children}</>;
}
