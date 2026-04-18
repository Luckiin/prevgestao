import "./globals.css";

export const metadata = {
  title: {
    default: "PrevGestão",
    template: "%s | PrevGestão",
  },
  description: "Sistema de Gerenciamento Integrado de Escritório Jurídico Previdenciário",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
