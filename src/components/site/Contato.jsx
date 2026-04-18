"use client";

import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

export default function Contato() {
  return (
    <section id="contato" style={{ background: "#080102", padding: "120px 0", borderTop: "1px solid rgba(201,169,110,.06)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Esquerda — CTA principal */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
              Contato
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, color: "#f5f0e8", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Comece com uma consulta gratuita.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(245,240,232,.45)", marginBottom: 40 }}>
              Sem compromisso. Avaliamos seu caso e dizemos com honestidade se podemos ajudar e quais são suas chances reais de sucesso.
            </p>
            <a href="https://wa.me/5500000000000?text=Olá,%20gostaria%20de%20uma%20consulta%20gratuita."
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 40px", background: "#C9A96E", color: "#0a0102", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 2, transition: "background .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#e8d5a3"}
              onMouseLeave={e => e.currentTarget.style.background = "#C9A96E"}
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
          </div>

          {/* Direita — Infos de contato */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: Phone,   label: "Telefone / WhatsApp", value: "(00) 00000-0000" },
              { icon: Mail,    label: "E-mail",              value: "contato@deiselisboa.adv.br" },
              { icon: MapPin,  label: "Atendimento",         value: "Todo o Brasil — presencial e online" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "24px 28px", background: "rgba(201,169,110,.04)", border: "1px solid rgba(201,169,110,.08)", borderRadius: 4 }}>
                <div style={{ width: 40, height: 40, borderRadius: 2, background: "rgba(201,169,110,.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} style={{ color: "#C9A96E" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(201,169,110,.5)", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 15, color: "rgba(245,240,232,.8)", fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
