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
  CalendarRange, FileText, TrendingUp, FileSignature, Scale,
} from "lucide-react";

const NAV_PRINCIPAL = [
  { href: "/home",       icon: LayoutDashboard, label: "Dashboard"             },
  { href: "/clientes",   icon: Users,           label: "Clientes / Processos"  },
  { href: "/prazos",     icon: CalendarClock,    label: "Prazos & Agenda"       },
  { href: "/contratos",  icon: FileSignature,   label: "Contratos"             },
  { href: "/peticoes",   icon: Scale,           label: "Petições"              },
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

function NavItem({ href, icon: Icon, label, active, sub = false, onClick }) {
  return (
    <Link href={href} prefetch={true} onClick={onClick}
      className={`flex items-center gap-2.5 rounded font-medium transition-all no-underline ${sub ? 'py-2 pr-3.5 pl-7 text-[12px]' : 'py-2.5 px-3.5 text-[13px]'} ${active ? 'text-gold-500 bg-gold-500/10 border-l-2 border-gold-500' : 'text-ink-500 border-l-2 border-transparent hover:text-ink-200 hover:bg-dark-300'}`}
    >
      <Icon size={sub ? 13 : 15} className={`shrink-0 ${active ? 'text-gold-500' : 'opacity-70'}`} />
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
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
          backdropFilter:"blur(20px)",
          transition:"transform .25s ease",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
        className="sidebar-root bg-dark-400 border-r border-gold-500/10"
      >

        <div className="flex items-center gap-3 px-5 py-[18px] border-b border-gold-500/10">
          <Image src="/logo.svg" alt="Deise Lisboa" width={38} height={38} className="object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-serif text-[13px] font-bold text-gold-500 tracking-[0.08em] uppercase">Deise Lisboa</div>
            <div className="text-[10px] text-ink-200 opacity-60 tracking-[0.15em] uppercase mt-0.5">Advocacia</div>
          </div>
          <button onClick={onClose} className="sidebar-close-btn p-1 text-gold-500/40 hover:text-gold-500 transition-colors bg-transparent border-none cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="h-[2px] w-full" style={{ background:"linear-gradient(90deg,#C9A96E,rgba(201,169,110,.1))" }} />


        <nav style={{ flex:1, overflowY:"auto", padding:"10px 12px", display:"flex", flexDirection:"column", gap:2 }}>
          {NAV_PRINCIPAL.map(item => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={onClose} />
          ))}

          <div className="h-px bg-gold-500/10 mx-1 my-2.5" />


          <button onClick={() => setFinOpen(v => !v)}
            className={`flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded font-semibold text-xs tracking-[0.08em] uppercase transition-all bg-transparent border-none cursor-pointer ${financeiroAtivo ? 'text-gold-500 bg-gold-500/10' : 'text-ink-500 hover:text-gold-500'}`}
          >
            <DollarSign size={14} className="shrink-0" />
            <span className="flex-1 text-left">Financeiro</span>
            <ChevronDown size={13} style={{ transition:"transform .2s", transform: finOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          {finOpen && (
            <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
              {NAV_FINANCEIRO.map(item => (
                <NavItem key={item.href} {...item} active={isActive(item.href)} sub onClick={onClose} />
              ))}
            </div>
          )}

        </nav>


      </aside>
    </>
  );
}
