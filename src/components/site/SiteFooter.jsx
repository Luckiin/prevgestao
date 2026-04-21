"use client";

import Image from "next/image";

const ANO = new Date().getFullYear();

const COLS = [
  {
    title: "Navegação",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Quem Somos", href: "#quem-somos" },
      { label: "Áreas de Atuação", href: "#areas" },
      { label: "Depoimentos", href: "#depoimentos" },
      { label: "Contato", href: "#contato" },
    ],
  },
  {
    title: "Áreas de Atuação",
    links: [
      { label: "Aposentadoria por Idade", href: "#areas" },
      { label: "Aposentadoria por Invalidez", href: "#areas" },
      { label: "Auxílio-Doença", href: "#areas" },
      { label: "BPC / LOAS", href: "#areas" },
      { label: "Revisão de Benefício", href: "#areas" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer style={{ background: "#040001", borderTop: "1px solid rgba(201,169,110,.08)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 32px 40px" }}>


        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 64, marginBottom: 80 }}>


          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <Image src="/logo.svg" alt="Deise Lisboa Advocacia" width={52} height={52} style={{ objectFit: "contain" }} />
              <div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 14, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A96E" }}>Deise Lisboa</div>
                <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(201,169,110,.4)" }}>Advocacia</div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(245,240,232,.3)", maxWidth: 320 }}>
              Especialistas em Direito Previdenciário. Mais de uma década defendendo os direitos de quem trabalhou a vida toda.
            </p>
          </div>


          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,169,110,.5)", marginBottom: 24 }}>{col.title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <a href={l.href}
                      style={{ fontSize: 13, color: "rgba(245,240,232,.35)", textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
                      onMouseLeave={e => e.currentTarget.style.color = "rgba(245,240,232,.35)"}
                    >{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


        <div style={{ height: 1, background: "rgba(201,169,110,.08)", marginBottom: 32 }} />


        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 12, color: "rgba(245,240,232,.2)" }}>
            © {ANO} Deise Lisboa Advocacia. Todos os direitos reservados.
          </p>
          <a href="https://wa.me/5571987806608?text=Olá%2C%20gostaria%20de%20uma%20consulta%20." target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: "rgba(201,169,110,.4)", textDecoration: "none", letterSpacing: "0.05em", transition: "color .2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(201,169,110,.4)"}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
