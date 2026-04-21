"use client";

import { useState, useEffect, Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Sun, Moon } from "lucide-react";
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { SWRConfig } from "swr";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

function TopBar({ onMenuOpen }) {
  const { usuario } = useAuth();
  const nome    = usuario?.nome ?? "Usuário";
  const inicial = nome.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-6 bg-dark-300 border-b border-gold-500/10" 
      style={{ backdropFilter: "blur(20px)" }}>
      {/* Burger mobile */}
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

      {/* Avatar */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gold-500/5 border border-gold-500/10 rounded">
        <div style={{
          width: 26, height: 26, borderRadius: 2,
          background: "linear-gradient(135deg, #6B1530, #3d0a1a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#C9A96E", fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>{inicial}</div>
        <span className="topbar-nome text-xs text-ink-300 whitespace-nowrap">
          {nome}
        </span>
      </div>
    </header>
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

  // Trigger loading on route change (traditional)
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
          transition={{ duration: 2, ease: "easeOut" }} // Slow reveal to simulate progress
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

  // Reset navigating state when route actually changes
  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  // Global click interceptor for truly instant feedback
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
