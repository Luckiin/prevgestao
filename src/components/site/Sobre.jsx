"use client";

import { useEffect, useRef } from "react";

const PILARES = [
  {
    num: "01",
    title: "Análise gratuita e sem compromisso",
    desc: "Avaliamos seu caso antes de qualquer contrato. Se não pudermos ajudar, dizemos antes. Sua confiança vale mais do que qualquer honorário.",
  },
  {
    num: "02",
    title: "Honorários somente pelo êxito",
    desc: "Trabalhamos com honorários condicionados ao resultado. Você não paga nada antecipado. Só investimos nosso tempo quando temos certeza de que podemos vencer.",
  },
  {
    num: "03",
    title: "Acompanhamento integral do processo",
    desc: "Da primeira consulta à concessão do benefício, você terá acesso direto à Dra. Deise. Transparência e comunicação em cada etapa do seu processo.",
  },
];

export default function QuemSomos() {
  const refs = useRef([]);

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            el.style.transition = "opacity .7s ease, transform .7s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, i * 150);
          obs.disconnect();
        }
      }, { threshold: 0.1 });
      obs.observe(el);
    });
  }, []);

  return (
    <section id="quem-somos" style={{ background: "#fefcf7", padding: "120px 0", borderTop: "1px solid rgba(201,169,110,.15)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        <div ref={el => refs.current[0] = el} style={{ maxWidth: 900, marginBottom: 80 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b08840", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
            Quem Somos
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 700, color: "#12060b", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 28 }}>
            Cada trabalhador merece receber o benefício ao qual tem direito.{" "}
            <span style={{ color: "#b08840" }}>Nós garantimos isso.</span>
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: "#4a3a40", maxWidth: 680 }}>
            Em um sistema previdenciário cada vez mais burocrático, a diferença entre receber
            o benefício correto e ficar sem nada está na qualidade da representação jurídica.
            Com sede em Salvador/BA, o escritório Deise Lisboa Advocacia existe para ser essa diferença.
          </p>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, rgba(201,169,110,.4), transparent)", marginBottom: 80 }} />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48 }}>
          {PILARES.map((p, i) => (
            <div key={p.num} ref={el => refs.current[i + 1] = el}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 64, fontWeight: 700, lineHeight: 1, color: "rgba(176,136,64,.15)", marginBottom: 24, userSelect: "none" }}>{p.num}</div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#12060b", marginBottom: 16, lineHeight: 1.3 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(18,6,11,.75)" }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
