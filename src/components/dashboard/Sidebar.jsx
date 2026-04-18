"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Scale, LayoutDashboard, Users, CalendarClock, FolderOpen,
  BarChart3, ScrollText, Settings, LogOut, X, CalendarDays,
} from "lucide-react";

const ANO_ATUAL = new Date().getFullYear();

const navItems = [
  { href: "/home",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clientes",      icon: Users,           label: "Clientes / Processos" },
  { href: `/por-ano?ano=${ANO_ATUAL}`, icon: CalendarDays, label: "Clientes por Ano" },
  { href: "/prazos",        icon: CalendarClock,   label: "Prazos & Agenda" },
  { href: "/documentos",    icon: FolderOpen,      label: "Documentos" },
  { href: "/relatorios",    icon: BarChart3,       label: "Relatórios" },
  { href: "/auditoria",     icon: ScrollText,      label: "Histórico / Auditoria" },
  { href: "/configuracoes", icon: Settings,        label: "Configurações" },
];

function NavItem({ href, icon: Icon, label, active }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
        active
          ? "bg-brand-600/20 text-brand-300 border border-brand-600/30"
          : "text-ink-400 hover:text-ink-200 hover:bg-white/[0.04]"
      )}
    >
      <Icon
        size={16}
        className={cn(
          "flex-shrink-0 transition-colors",
          active ? "text-brand-400" : "text-ink-500 group-hover:text-ink-300"
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const pathname   = usePathname();
  const { usuario, logout } = useAuth();

  const nomeExibido = usuario?.nome ?? usuario?.email ?? "Usuário";
  const inicial     = nomeExibido.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 z-50 flex flex-col",
          "bg-dark-400/95 backdrop-blur-xl border-r border-white/[0.05]",
          "transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.05]">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-brand-800 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/50">
            <Scale size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-100 leading-none">PrevGestão</p>
            <p className="text-[10px] text-ink-500 mt-0.5">Jurídico Previdenciário</p>
          </div>

          <button
            onClick={onClose}
            className="ml-auto lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-ink-500 hover:text-ink-200 hover:bg-white/[0.06]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              active={pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/") && item.href !== "/home"
                      || pathname === item.href.split("?")[0]}
            />
          ))}
        </nav>

        {/* Usuário + logout */}
        <div className="px-3 py-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {inicial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-ink-200 truncate">{nomeExibido}</p>
              <p className="text-[10px] text-ink-500 truncate">{usuario?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="text-ink-600 hover:text-danger-500 transition-colors flex-shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
