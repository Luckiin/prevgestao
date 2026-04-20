"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarClock,
  BarChart3, ScrollText, Settings, LogOut, X,
  DollarSign, ChevronDown, ArrowDownCircle, ArrowUpCircle,
  CalendarRange, FileText, TrendingUp, FileSignature,
} from "lucide-react";

const NAV_PRINCIPAL = [
  { href: "/home",       icon: LayoutDashboard, label: "Dashboard"             },
  { href: "/clientes",   icon: Users,           label: "Clientes / Processos"  },
  { href: "/prazos",     icon: CalendarClock,    label: "Prazos & Agenda"       },
  { href: "/contratos",  icon: FileSignature,   label: "Contratos"             },
  { href: "/relatorios", icon: BarChart3,        label: "Relatórios"            },
  { href: "/auditoria",  icon: ScrollText,      label: "Histórico / Auditoria" },
];

const NAV_FINANCEIRO = [
  { href: "/financeiro",                icon: LayoutDashboard, label: "Dashboard"        },
  { href: "/financeiro/contas-pagar",   icon: ArrowDownCircle, label: "Contas a Pagar"   },
  { href: "/financeiro/contas-receber", icon: ArrowUpCircle,   label: "Contas a Receber" },
  { href: "/financeiro/agenda",         icon: CalendarRange,   label: "Agenda"           },
  { href: "/financeiro/extrato",        icon: FileText,        label: "Extrato"          },
  { href: "/financeiro/fluxo-caixa",   icon: TrendingUp,      label: "Fluxo de Caixa"  },
];

function NavItem({ href, icon: Icon, label, active, sub = false }) {
  return (
    <Link href={href} prefetch={true} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: sub ? "8px 14px 8px 28px" : "10px 14px",
      borderRadius: 4, fontSize: sub ? 12 : 13, fontWeight: 500,
      textDecoration: "none", transition: "all .15s",
      color:      active ? "#C9A96E"               : "rgba(245,240,232,.45)",
      background: active ? "rgba(201,169,110,.08)" : "transparent",
      borderLeft: active ? "2px solid #C9A96E"     : "2px solid transparent",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = "rgba(245,240,232,.85)"; e.currentTarget.style.background = "rgba(255,255,255,.03)"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = "rgba(245,240,232,.45)"; e.currentTarget.style.background = "transparent"; }}}
    >
      <Icon size={sub ? 13 : 15} style={{ flexShrink: 0, color: active ? "#C9A96E" : "rgba(245,240,232,.3)" }} />
      <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
    </Link>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();
  const nome    = usuario?.nome ?? usuario?.email ?? "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  const financeiroAtivo = pathname.startsWith("/financeiro");
  const [finOpen, setFinOpen] = useState(financeiroAtivo);

  const isActive = (href) => {
    if (href === "/home" || href === "/financeiro") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {isOpen && (
        <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)", zIndex:40 }} />
      )}
      <aside
        style={{
          position:"fixed", top:0, left:0, height:"100vh", width:256, zIndex:50,
          display:"flex", flexDirection:"column",
          background:"rgba(8,1,3,.97)",
          borderRight:"1px solid rgba(201,169,110,.08)",
          backdropFilter:"blur(20px)",
          transition:"transform .25s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="sidebar-root"
      >
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"18px 20px", borderBottom:"1px solid rgba(201,169,110,.07)" }}>
          <Image src="/logo.svg" alt="Deise Lisboa" width={38} height={38} style={{ objectFit:"contain", flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:13, fontWeight:700, color:"#C9A96E", letterSpacing:"0.08em", textTransform:"uppercase" }}>Deise Lisboa</div>
            <div style={{ fontSize:10, color:"rgba(201,169,110,.4)", letterSpacing:"0.15em", textTransform:"uppercase", marginTop:2 }}>Advocacia</div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn"
            style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(201,169,110,.4)", display:"flex", alignItems:"center", padding:4 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ height:2, background:"linear-gradient(90deg,#C9A96E,rgba(201,169,110,.1))" }} />

        {/* Nav */}
        <nav style={{ flex:1, overflowY:"auto", padding:"10px 12px", display:"flex", flexDirection:"column", gap:2 }}>
          {NAV_PRINCIPAL.map(item => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}

          <div style={{ height:1, background:"rgba(201,169,110,.07)", margin:"10px 4px" }} />

          {/* Financeiro colapsável */}
          <button onClick={() => setFinOpen(v => !v)}
            style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"9px 14px", borderRadius:4, fontSize:12, fontWeight:600,
              background: financeiroAtivo ? "rgba(201,169,110,.06)" : "transparent",
              border:"none", cursor:"pointer", letterSpacing:"0.08em",
              textTransform:"uppercase", color: financeiroAtivo ? "#C9A96E" : "rgba(245,240,232,.35)",
              transition:"all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color="#C9A96E"; }}
            onMouseLeave={e => { if (!financeiroAtivo) e.currentTarget.style.color="rgba(245,240,232,.35)"; }}
          >
            <DollarSign size={14} style={{ flexShrink:0 }} />
            <span style={{ flex:1, textAlign:"left" }}>Financeiro</span>
            <ChevronDown size={13} style={{ transition:"transform .2s", transform: finOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          {finOpen && (
            <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
              {NAV_FINANCEIRO.map(item => (
                <NavItem key={item.href} {...item} active={isActive(item.href)} sub />
              ))}
            </div>
          )}

          <div style={{ height:1, background:"rgba(201,169,110,.07)", margin:"10px 4px" }} />
          <NavItem href="/configuracoes" icon={Settings} label="Configurações" active={isActive("/configuracoes")} />
        </nav>

        {/* Rodapé */}
        <div style={{ borderTop:"1px solid rgba(201,169,110,.07)", padding:"14px 16px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:2, flexShrink:0, background:"linear-gradient(135deg,#6B1530,#3d0a1a)", display:"flex", alignItems:"center", justifyContent:"center", color:"#C9A96E", fontSize:12, fontWeight:700 }}>{inicial}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"rgba(245,240,232,.8)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{nome}</div>
              <div style={{ fontSize:10, color:"rgba(201,169,110,.4)", letterSpacing:"0.05em" }}>Administrador</div>
            </div>
          </div>
          <button onClick={logout} style={{
            display:"flex", alignItems:"center", gap:8, width:"100%",
            padding:"8px 12px", borderRadius:4, fontSize:12, fontWeight:500,
            background:"rgba(201,169,110,.04)", border:"1px solid rgba(201,169,110,.08)",
            color:"rgba(245,240,232,.4)", cursor:"pointer", transition:"all .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color="#C9A96E"; e.currentTarget.style.borderColor="rgba(201,169,110,.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="rgba(245,240,232,.4)"; e.currentTarget.style.borderColor="rgba(201,169,110,.08)"; }}
          >
            <LogOut size={13} /> Sair da conta
          </button>
        </div>
      </aside>
    </>
  );
}
