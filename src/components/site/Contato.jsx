"use client";

import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

export default function Contato() {
  return (
    <section id="contato" style={{ background: "#cdba99", padding: "120px 0", borderTop: "1px solid rgba(71,0,2,.1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Esquerda — CTA principal */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#470002", opacity: 0.8, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 28, height: 1, background: "#470002" }} />
              Contato
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, color: "#470002", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Comece com uma consulta.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#470002", opacity: 0.85, marginBottom: 40 }}>
              Sem compromisso. Avaliamos seu caso e dizemos com honestidade se podemos ajudar e quais são suas chances reais de sucesso.
            </p>
            <a href="https://wa.me/5571987806608?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consulta%20."
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 40px", background: "#470002", color: "#cdba99", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 4, transition: "background .2s", boxShadow: "0 8px 24px rgba(71,0,2,.2)" }}
              onMouseEnter={e => e.currentTarget.style.background = "#7d1230"}
              onMouseLeave={e => e.currentTarget.style.background = "#470002"}
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
          </div>

          {/* Direita — Infos de contato */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: Phone, label: "Telefone / WhatsApp", value: "(71) 98780-6608" },
              { icon: Mail, label: "E-mail", value: "deiselisboa@hotmail.com" },
              { icon: MapPin, label: "Atendimento", value: "R. Floresta Azul - Polo Hab. Litoral Norte, Vida Nova, Lauro De Freitas/BA — Presencial e Online" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "24px 28px", background: "#470002", border: "1px solid rgba(205,186,153,.15)", borderRadius: 8, boxShadow: "0 8px 32px rgba(71,0,2,.15)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 6, background: "rgba(205,186,153,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} style={{ color: "#cdba99" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#cdba99", opacity: 0.6, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 15, color: "#ffffff", fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
