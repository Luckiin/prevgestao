"use client";

import { MessageCircle, Phone, Mail, MapPin } from "lucide-react";

export default function Contato() {
  return (
    <section id="contato" style={{ background: "#fdfaf5", padding: "120px 0", borderTop: "1px solid rgba(201,169,110,.15)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>

          {/* Esquerda — CTA principal */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#b08840", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "block", width: 28, height: 1, background: "#C9A96E" }} />
              Contato
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 700, color: "#12060b", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 20 }}>
              Comece com uma consulta gratuita.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: "#4a3a40", marginBottom: 40 }}>
              Sem compromisso. Avaliamos seu caso e dizemos com honestidade se podemos ajudar e quais são suas chances reais de sucesso.
            </p>
            <a href="https://wa.me/5571987806608?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20consulta%20gratuita."
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "18px 40px", background: "#b08840", color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 4, transition: "background .2s", boxShadow: "0 8px 24px rgba(176,136,64,.25)" }}
              onMouseEnter={e => e.currentTarget.style.background = "#C9A96E"}
              onMouseLeave={e => e.currentTarget.style.background = "#b08840"}
            >
              <MessageCircle size={16} /> Falar no WhatsApp
            </a>
          </div>

          {/* Direita — Infos de contato */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { icon: Phone,   label: "Telefone / WhatsApp", value: "(71) 98780-6608" },
              { icon: Mail,    label: "E-mail",              value: "contato@deiselisboa.adv.br" },
              { icon: MapPin,  label: "Atendimento",         value: "Salvador/BA — Presencial e Online" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "24px 28px", background: "#fff", border: "1px solid rgba(176,136,64,.15)", borderRadius: 8, boxShadow: "0 4px 12px rgba(176,136,64,.05)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 6, background: "rgba(176,136,64,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} style={{ color: "#b08840" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#b08840", fontWeight: 600, marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 15, color: "#12060b", fontWeight: 500 }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
