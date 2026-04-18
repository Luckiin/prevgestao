"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const STATS = [
  { value: 1200, suffix: "+", label: "Casos resolvidos" },
  { value: 98,   suffix: "%", label: "Taxa de êxito"    },
  { value: 12,   suffix:"+",  label: "Anos de experiência" },
  { value: 3,    suffix:"x",  label: "Mais rápido que a média" },
];

const DEPOIMENTOS = [
  {
    nome: "Maria Aparecida S.",
    cargo: "Aposentada por Invalidez",
    texto: "Meu benefício tinha sido negado duas vezes pelo INSS. A Dra. Deise conseguiu reverter em menos de 4 meses. Profissional incrível, explicou tudo com clareza e paciência.",
  },
  {
    nome: "João Carlos M.",
    cargo: "Aposentadoria por Tempo de Contribuição",
    texto: "Tentei sozinho durante anos e não conseguia. Com o escritório, em 6 meses estava aposentado com o valor correto. Recomendo de olhos fechados.",
  },
  {
    nome: "Ana Paula R.",
    cargo: "BPC / LOAS",
    texto: "Pensava que não teria direito ao benefício. A equipe da Dra. Deise provou que sim. Hoje recebo o BPC e pude dar uma vida melhor para minha família.",
  },
  {
    nome: "Roberto F.",
    cargo: "Revisão de Benefício",
    texto: "Descobri que recebia menos do que deveria há anos. A revisão trouxe um valor retroativo que não esperava. Serviço honesto e resultado real.",
  },
];

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
          else setCount(target);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatItem({ value, suffix, label }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 700, color: "#C9A96E", lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 13, color: "rgba(245,240,232,.4)", marginTop: 10, letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}

export default function Depoimentos() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive(a => (a + 1) % DEPOIMENTOS.length), []);

  useEffect(() => {
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next]);

  const d = DEPOIMENTOS[active];

  return (
    <section id="depoimentos" style={{ background: "#070102", padding: "120px 0", borderTop: "1px solid rgba(201,169,110,.06)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        {/* Counters */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 48, marginBottom: 100 }}>
          {STATS.map(s => <StatItem key={s.label} {...s} />)}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,169,110,.2), transparent)", marginBottom: 80 }} />

        {/* Depoimentos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>

          {/* Nav lateral */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
              Depoimentos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {DEPOIMENTOS.map((dep, i) => (
                <button key={i} onClick={() => setActive(i)}
                  style={{
                    textAlign: "left", background: "none", border: "none", cursor: "pointer",
                    padding: "12px 16px", borderRadius: 4, transition: "all .2s",
                    borderLeft: `2px solid ${i === active ? "#C9A96E" : "rgba(201,169,110,.1)"}`,
                    background: i === active ? "rgba(201,169,110,.05)" : "transparent",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: i === active ? "#C9A96E" : "rgba(245,240,232,.5)" }}>{dep.nome}</div>
                  <div style={{ fontSize: 11, color: "rgba(245,240,232,.3)", marginTop: 3 }}>{dep.cargo}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Texto */}
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 64, fontFamily: "Georgia, serif", color: "rgba(201,169,110,.2)", lineHeight: 1, marginBottom: 16, userSelect: "none" }}>"</div>
            <blockquote style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(18px, 2.2vw, 26px)", lineHeight: 1.6, color: "rgba(245,240,232,.85)", margin: 0, marginBottom: 32, fontStyle: "italic" }}>
              {d.texto}
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 1, background: "#C9A96E" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#C9A96E" }}>{d.nome}</div>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,.35)", marginTop: 2 }}>{d.cargo}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
