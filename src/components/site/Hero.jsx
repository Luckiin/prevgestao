"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";

const SLIDES = [
  {
    label: "direito previdenciário",
    headline: ["Seu benefício foi negado?", "Nós revertemos."],
    sub: "Especialistas em reverter indeferimentos do INSS em Salvador e todo o Brasil. Análise gratuita e sem compromisso.",
  },
  {
    label: "direito previdenciário",
    headline: ["Aposentadoria. Benefícios.", "Revisões."],
    sub: "Mais de uma década conquistando os direitos previdenciários de trabalhadores em todo o Brasil.",
  },
  {
    label: "direito previdenciário",
    headline: ["A justiça previdenciária", "ao seu lado."],
    sub: "Honorários somente pelo êxito. Se não vencermos, você não paga nada. Esse é o nosso compromisso.",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((idx) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
    }, 500);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      goTo((current + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [current, goTo]);

  const slide = SLIDES[current];

  return (
    <section id="inicio" style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg, #080102 0%, #0d0307 60%, #080102 100%)",
      position: "relative", overflow: "hidden", textAlign: "center",
      padding: "120px 32px 80px",
    }}>

      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(107,21,48,.3) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", transition: "opacity .5s ease, transform .5s ease" }}>


        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
          <span style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "#C9A96E" }}>{slide.label}</span>
          <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
        </div>


        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(36px, 5.5vw, 72px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--ink-200)", marginBottom: 28 }}>
          {slide.headline[0]}<br />
          <span style={{ color: "#C9A96E" }}>{slide.headline[1]}</span>
        </h1>


        <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(245,240,232,.55)", maxWidth: 560, margin: "0 auto 48px" }}>
          {slide.sub}
        </p>


        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="https://wa.me/5571987806608?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consulta%20."
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 40px", background: "#C9A96E", color: "#0a0102", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, transition: "background .2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#e8d5a3"}
            onMouseLeave={e => e.currentTarget.style.background = "#C9A96E"}
          >
            <MessageCircle size={15} /> Consulta
          </a>
          <button
            onClick={() => document.querySelector("#areas")?.scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "15px 40px", background: "none", border: "1.5px solid rgba(201,169,110,.45)", color: "#C9A96E", fontWeight: 600, fontSize: 13, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", borderRadius: 2, transition: "border-color .2s, background .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9A96E"; e.currentTarget.style.background = "rgba(201,169,110,.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,169,110,.45)"; e.currentTarget.style.background = "none"; }}
          >
            Nossas Áreas
          </button>
        </div>
      </div>


      <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer", transition: "all .3s", background: i === current ? "#C9A96E" : "rgba(201,169,110,.25)" }}
          />
        ))}
      </div>


      <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)" }}>
        <ChevronDown size={18} style={{ color: "rgba(201,169,110,.3)", animation: "bounce 2s infinite" }} />
      </div>
    </section>
  );
}
