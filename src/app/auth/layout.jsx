import "../globals.css";

export const metadata = { title: "Entrar | PrevGestão" };

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center p-4">
      {/* Gradiente de fundo */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gold-500/5 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
