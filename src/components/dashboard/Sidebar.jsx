"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import {
  LayoutDashboard, Users, CalendarClock, FolderOpen,
  BarChart3, ScrollText, Settings, LogOut, X, CalendarDays,
} from "lucide-react";

const ANO_ATUAL = new Date().getFullYear();

const NAV = [
  { href: "/home",                     icon: LayoutDashboard, label: "Dashboard"             },
  { href: "/clientes",                 icon: Users,           label: "Clientes / Processos"  },
  { href: "/prazos",                   icon: CalendarClock,   label: "Prazos & Agenda"       },
  { href: "/relatorios",               icon: BarChart3,       label: "Relatórios"            },
  { href: "/auditoria",                icon: ScrollText,      label: "Histórico / Auditoria" },
  { href: "/configuracoes",            icon: Settings,        label: "Configurações"         },
];

function NavItem({ href, icon: Icon, label, active }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 4, fontSize: 13, fontWeight: 500,
      textDecoration: "none", transition: "all .2s",
      color:      active ? "#C9A96E"               : "rgba(245,240,232,.45)",
      background: active ? "rgba(201,169,110,.08)" : "transparent",
      borderLeft: active ? "2px solid #C9A96E"     : "2px solid transparent",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "rgba(245,240,232,.8)"; e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "rgba(245,240,232,.45)"; e.currentTarget.style.background = "transparent"; }}}
    >
      <Icon size={15} style={{ flexShrink: 0, color: active ? "#C9A96E" : "rgba(245,240,232,.3)" }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </Link>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const nome    = usuario?.nome ?? usuario?.email ?? "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  const isActive = (href) => {
    const base = href.split("?")[0];
    if (base === "/home") return pathname === "/home";
    return pathname === base || pathname.startsWith(base + "/");
  };

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)", zIndex: 40 }} />
      )}

      <aside
        style={{
          position: "fixed", top: 0, left: 0, height: "100vh", width: 256, zIndex: 50,
          display: "flex", flexDirection: "column",
          background: "rgba(8,1,3,.97)",
          borderRight: "1px solid rgba(201,169,110,.08)",
          backdropFilter: "blur(20px)",
          transition: "transform .3s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="sidebar-root"
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 20px", borderBottom: "1px solid rgba(201,169,110,.07)" }}>
          <Image src="/logo.svg" alt="Deise Lisboa" width={38} height={38} style={{ objectFit: "contain", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 13, fontWeight: 700, color: "#C9A96E", letterSpacing: "0.08em", textTransform: "uppercase" }}>Deise Lisboa</div>
            <div style={{ fontSize: 10, color: "rgba(201,169,110,.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 2 }}>Advocacia</div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,.4)", display: "flex", alignItems: "center", padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Linha dourada */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #C9A96E, rgba(201,169,110,.1))" }} />

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(item => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>

        {/* Rodapé — usuário + sair */}
        <div style={{ borderTop: "1px solid rgba(201,169,110,.07)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Info usuário */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 2, flexShrink: 0,
              background: "linear-gradient(135deg, #6B1530, #3d0a1a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#C9A96E", fontSize: 12, fontWeight: 700,
            }}>{inicial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(245,240,232,.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nome}</div>
              <div style={{ fontSize: 10, color: "rgba(201,169,110,.4)", letterSpacing: "0.05em" }}>Administrador</div>
            </div>
          </div>

          {/* Botão sair */}
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "8px 12px", borderRadius: 4, fontSize: 12, fontWeight: 500,
            background: "rgba(201,169,110,.04)", border: "1px solid rgba(201,169,110,.08)",
            color: "rgba(245,240,232,.4)", cursor: "pointer", transition: "all .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "#C9A96E"; e.currentTarget.style.borderColor = "rgba(201,169,110,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(245,240,232,.4)"; e.currentTarget.style.borderColor = "rgba(201,169,110,.08)"; }}
          >
            <LogOut size={13} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
