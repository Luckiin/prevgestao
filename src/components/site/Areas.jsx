"use client";

import { MessageCircle } from "lucide-react";

const AREAS = [
  { num: "01", title: "Aposentadoria por Idade", desc: "Auxílio na comprovação do tempo de contribuição e idade mínima exigidos pelo INSS." },
  { num: "02", title: "Aposentadoria por Invalidez", desc: "Defesa do seu direito quando a capacidade laboral está comprometida por doença ou acidente." },
  { num: "03", title: "Aposentadoria por Tempo de Contribuição", desc: "Planejamento previdenciário e cálculo do tempo para a aposentadoria mais vantajosa." },
  { num: "04", title: "Auxílio-Doença / Acidente", desc: "Concessão e recurso do benefício temporário por incapacidade laboral." },
  { num: "05", title: "BPC / LOAS", desc: "Benefício de Prestação Continuada para idosos e pessoas com deficiência em situação de vulnerabilidade." },
  { num: "06", title: "Pensão por Morte", desc: "Garantia da pensão para dependentes após o falecimento do segurado." },
  { num: "07", title: "Revisão de Benefício", desc: "Revisão do valor pago pelo INSS para garantir que você receba o que é de direito." },
  { num: "08", title: "Recursos e Indeferimentos", desc: "Recurso administrativo e judicial contra negativas injustas do INSS." },
  { num: "09", title: "Planejamento Previdenciário", desc: "Estratégia personalizada para maximizar o valor da sua aposentadoria futura." },
];

export default function Areas() {
  return (
    <section id="areas" style={{ background: "#0d0307", padding: "120px 0", borderTop: "1px solid rgba(201,169,110,.1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>


        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, marginBottom: 80, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
              Áreas de Atuação
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, color: "#ffffff", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Especialização completa em Direito Previdenciário
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "#a9939e", marginBottom: 28 }}>
              Cada caso é único. Nossa equipe analisa individualmente a situação de cada cliente para encontrar a melhor estratégia jurídica e garantir o benefício mais vantajoso.
            </p>
            <a href="https://wa.me/5571987806608?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consulta%20."
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "none", border: "1.5px solid #C9A96E", color: "#C9A96E", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 4, transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,169,110,.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
            >
              <MessageCircle size={14} /> Falar com especialista
            </a>
          </div>
        </div>


        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 1, background: "rgba(201,169,110,.15)", border: "1px solid rgba(201,169,110,.15)" }}>
          {AREAS.map((a) => (
            <div key={a.num}
              style={{ background: "#0d0307", padding: "36px 32px", transition: "background .2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(107,21,48,.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "#0d0307"}
            >
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 36, fontWeight: 700, lineHeight: 1, color: "rgba(201,169,110,.15)", marginBottom: 16, userSelect: "none" }}>{a.num}</div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: "#fdfaf5", marginBottom: 12, lineHeight: 1.3 }}>{a.title}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "#a9939e" }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
