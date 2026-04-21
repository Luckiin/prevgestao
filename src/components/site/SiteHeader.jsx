"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, MessageCircle } from "lucide-react";

const NAV = [
  { label: "Início", href: "#inicio" },
  { label: "Quem Somos", href: "#quem-somos" },
  { label: "Áreas de Atuação", href: "#areas" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "Contato", href: "#contato" },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (href) => {
    setMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "background .35s, box-shadow .35s",
      background: scrolled ? "rgba(8,1,3,.96)" : "transparent",
      backdropFilter: scrolled ? "blur(18px)" : "none",
      boxShadow: scrolled ? "0 1px 0 rgba(201,169,110,.12)" : "none",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>


        <button onClick={() => go("#inicio")} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer" }}>
          <Image src="/logo.svg" alt="Deise Lisboa Advocacia" width={48} height={48} priority style={{ objectFit: "contain" }} />
          <div style={{ textAlign: "left", lineHeight: 1.2 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A96E" }}>Deise Lisboa</div>
            <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(201,169,110,.5)" }}>Advocacia</div>
          </div>
        </button>


        <nav style={{ display: "flex", gap: 36, alignItems: "center" }} className="hidden-mobile">
          {NAV.map(l => (
            <button key={l.href} onClick={() => go(l.href)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "0.04em", color: "rgba(255,255,255,.72)", transition: "color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.72)"}
            >{l.label}</button>
          ))}
        </nav>


        <a href="https://wa.me/5571987806608?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consulta%20."
          target="_blank" rel="noopener noreferrer"
          className="hidden-mobile"
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", background: "#C9A96E", color: "#0a0102", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2, textDecoration: "none", transition: "background .2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#e8d5a3"}
          onMouseLeave={e => e.currentTarget.style.background = "#C9A96E"}
        >
          <MessageCircle size={14} /> Consulta
        </a>


        <button onClick={() => setMenuOpen(v => !v)} className="show-mobile"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#C9A96E", padding: 8 }}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>


      {menuOpen && (
        <div style={{ background: "rgba(8,1,3,.98)", backdropFilter: "blur(20px)", padding: "16px 32px 28px", borderTop: "1px solid rgba(201,169,110,.1)" }}>
          {NAV.map(l => (
            <button key={l.href} onClick={() => go(l.href)}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "14px 0", fontSize: 15, color: "rgba(245,240,232,.7)", borderBottom: "1px solid rgba(201,169,110,.06)", letterSpacing: "0.03em" }}
              onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,.7)"}
            >{l.label}</button>
          ))}
          <a href="https://wa.me/5571987806608?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consulta%20."
            target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 20, padding: "13px", background: "#C9A96E", color: "#0a0102", fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 2, textDecoration: "none" }}
          >
            <MessageCircle size={15} /> Consulta
          </a>
        </div>
      )}
    </header>
  );
}
