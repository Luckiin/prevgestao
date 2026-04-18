"use client";

import { motion } from "framer-motion";

const PILARES = [
  {
    num: "01",
    title: "Análise sem compromisso",
    desc: "Avaliamos seu caso antes de qualquer contrato. Se não pudermos ajudar, dizemos antes. Sua confiança vale mais do que qualquer honorário.",
  },
  {
    num: "02",
    title: "Honorários somente pelo êxito",
    desc: "Trabalhamos com honorários condicionados ao resultado. Você não paga nada antecipado.",
  },
  {
    num: "03",
    title: "Acompanhamento integral do processo",
    desc: "Da primeira consulta à concessão do benefício, você terá acesso direto à Dra. Deise. Transparência e comunicação em cada etapa do seu processo.",
  },
];

export default function QuemSomos() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <section id="quem-somos" style={{ background: "#cdba99", padding: "120px 0", borderTop: "1px solid rgba(71,0,2,.1)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 32px" }}>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
          style={{ maxWidth: 900, marginBottom: 80 }}
        >
          <motion.div variants={item} style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#470002", opacity: 0.8, marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "block", width: 28, height: 1, background: "#470002" }} />
            Quem Somos
          </motion.div>
          <motion.h2 variants={item} style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 700, color: "#470002", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 28 }}>
            Cada trabalhador merece receber o benefício ao qual tem direito.{" "}
            <span style={{ color: "#7d1230" }}>Nós garantimos isso.</span>
          </motion.h2>
          <motion.p variants={item} style={{ fontSize: 17, lineHeight: 1.8, color: "#470002", opacity: 0.85, maxWidth: 680 }}>
            Em um sistema previdenciário cada vez mais burocrático, a diferença entre receber
            o benefício correto e ficar sem nada está na qualidade da representação jurídica.
            Com sede em Salvador/BA, o escritório Deise Lisboa Advocacia existe para ser essa diferença.
          </motion.p>
        </motion.div>

        <div style={{ height: 1, background: "linear-gradient(90deg, #47000240, transparent)", marginBottom: 80 }} />

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 48 }}
        >
          {PILARES.map((p, i) => (
            <motion.div key={p.num} variants={item}>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 64, fontWeight: 700, lineHeight: 1, color: "rgba(71,0,2,.1)", marginBottom: 24, userSelect: "none" }}>{p.num}</div>
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#470002", marginBottom: 16, lineHeight: 1.3 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(71,0,2,.8)" }}>
                {p.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
