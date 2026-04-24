"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Sun, Moon, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SWRConfig } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

function TopBar({ onMenuOpen }) {
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-6 bg-dark-300 border-b border-gold-500/10"
      style={{ backdropFilter: "blur(20px)" }}>

      <button onClick={onMenuOpen} className="topbar-burger"
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,.5)", display: "flex", alignItems: "center", padding: 8 }}>
        <Menu size={18} />
      </button>

      <div className="topbar-divider w-[1px] h-4 bg-ink-200 opacity-20" />
      <span className="topbar-label text-xs uppercase tracking-widest text-ink-200/50 font-medium">
        Área Interna
      </span>

      <div className="flex-1" />

      <ThemeToggle />
      <UserDropdown />
    </header>
  );
}

function UserDropdown() {
  const { usuario, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gold-500/5 border border-gold-500/10 rounded opacity-50">
        <div className="w-6 h-6 rounded bg-dark-200 animate-pulse" />
        <div className="h-3 w-16 bg-dark-200 rounded animate-pulse hidden sm:block" />
      </div>
    );
  }

  const nome    = usuario?.nome ?? usuario?.email ?? "Usuário";
  const inicial = (nome || "U").charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-gold-500/5 border border-gold-500/10 rounded hover:bg-gold-500/10 transition-all cursor-pointer"
      >
        <div style={{
          width: 26, height: 26, borderRadius: 2,
          background: "linear-gradient(135deg, #6B1530, #3d0a1a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#C9A96E", fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>{inicial}</div>
        <span className="topbar-nome text-xs text-ink-300 whitespace-nowrap hidden sm:inline">
          {nome}
        </span>
        <ChevronDown size={14} className={`text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 z-50 glass-card rounded-xl border border-gold-500/10 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-2.5 mb-1 border-b border-white/5">
              <p className="text-xs font-semibold text-ink-100 truncate">{nome}</p>
              <p className="text-[10px] text-gold-500/60 tracking-wider uppercase mt-0.5">Administrador</p>
            </div>

            <div className="flex flex-col gap-0.5">
              <Link
                href="/configuracoes"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-ink-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all no-underline"
              >
                <Settings size={14} />
                Configurações
              </Link>
              
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-ink-400 hover:text-danger-500 hover:bg-danger-500/10 transition-all cursor-pointer border-none bg-transparent"
              >
                <LogOut size={14} />
                Sair da conta
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-colors"
      title="Alternar tema"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function ProgressBar({ forceLoading }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  const active = loading || forceLoading;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ width: 0, opacity: 1 }}
          animate={{ width: "100%", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{
            position: "fixed", top: 0, left: 0, height: 3,
            background: "linear-gradient(90deg, #C9A96E, #E5C78F)",
            zIndex: 9999, pointerEvents: "none",
            boxShadow: "0 0 10px rgba(201, 169, 110, 0.5)",
          }}
        />
      )}
    </AnimatePresence>
  );
}

function DashboardInner({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();


  useEffect(() => {
    setNavigating(false);
  }, [pathname]);


  useEffect(() => {
    const handleGlobalClick = (e) => {
      const anchor = e.target.closest("a");
      if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
        const isExternal = anchor.target === "_blank";
        const isSamePath = anchor.pathname === window.location.pathname;

        if (!isExternal && !isSamePath && !e.ctrlKey && !e.metaKey) {
          setNavigating(true);
        }
      }
    };

    document.addEventListener("mousedown", handleGlobalClick);
    return () => document.removeEventListener("mousedown", handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen bg-dark-400">
      <Suspense fallback={null}>
        <ProgressBar forceLoading={navigating} />
      </Suspense>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main" style={{ transition: "margin-left .3s" }}>
        <TopBar onMenuOpen={() => setSidebarOpen(true)} />
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
      </div>
    </div>
  );
}

const swrConfig = {
  fetcher: (url) => fetch(url).then((res) => res.json()),
  revalidateOnFocus: false,
  revalidateIfStale: true,
  dedupingInterval: 5000,
};

export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SWRConfig value={swrConfig}>
          <Toaster
            theme="system"
            position="top-right"
            expand={false}
            richColors
            toastOptions={{
              className: "glass-card",
              style: {
                color: 'var(--ink-200)',
              },
            }}
          />
          <DashboardInner>{children}</DashboardInner>
        </SWRConfig>
      </AuthProvider>
    </ThemeProvider>
  );
}
