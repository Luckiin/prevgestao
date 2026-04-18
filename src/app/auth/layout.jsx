export const metadata = { title: "Entrar | Deise Lisboa Advocacia" };

export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#080102",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-5%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(107,21,48,.45) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: 500, height: 400, background: "radial-gradient(ellipse, rgba(107,21,48,.2) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}>
        {children}
      </div>
    </div>
  );
}
