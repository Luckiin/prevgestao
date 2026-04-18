"use client";

import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function TopBar({ onMenuOpen }) {
  const { usuario } = useAuth();
  const nome    = usuario?.nome ?? "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <header style={{
      height: 56, display: "flex", alignItems: "center", gap: 12,
      padding: "0 24px", position: "sticky", top: 0, zIndex: 30,
      background: "rgba(8,1,3,.92)", backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(201,169,110,.07)",
    }}>
      {/* Burger mobile */}
      <button onClick={onMenuOpen} className="topbar-burger"
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,.5)", display: "flex", alignItems: "center", padding: 8 }}>
        <Menu size={18} />
      </button>

      <div style={{ height: 18, width: 1, background: "rgba(201,169,110,.2)" }} className="topbar-divider" />
      <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(201,169,110,.35)" }} className="topbar-label">
        Área Interna
      </span>

      <div style={{ flex: 1 }} />

      {/* Avatar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 14px", background: "rgba(201,169,110,.05)",
        border: "1px solid rgba(201,169,110,.1)", borderRadius: 4,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 2,
          background: "linear-gradient(135deg, #6B1530, #3d0a1a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#C9A96E", fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>{inicial}</div>
        <span style={{ fontSize: 12, color: "rgba(245,240,232,.6)", whiteSpace: "nowrap" }} className="topbar-nome">
          {nome}
        </span>
      </div>
    </header>
  );
}

function DashboardInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0307" }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main" style={{ transition: "margin-left .3s" }}>
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />
        <main style={{ padding: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardInner>{children}</DashboardInner>
    </AuthProvider>
  );
}
