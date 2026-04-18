import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: {
    default: "PrevGestão",
    template: "%s | PrevGestão",
  },
  description: "Sistema de Gerenciamento Integrado de Escritório Jurídico Previdenciário",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
