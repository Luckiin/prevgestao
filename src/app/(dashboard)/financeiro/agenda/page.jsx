"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, CalendarRange } from "lucide-react";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES_PT = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export default function AgendaFinanceiro() {
  const hoje = new Date();
  const [ano,  setAno]  = useState(hoje.getFullYear());
  const [mes,  setMes]  = useState(hoje.getMonth());
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("mes");

  async function carregar() {
    setLoading(true);
    const mesStr = `${ano}-${String(mes + 1).padStart(2, "0")}`;
    const res = await fetch(`/api/financeiro/lancamentos?mes=${mesStr}&limit=300`);
    const json = await res.json();
    setLancamentos(json.data || []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [ano, mes]);

  const navMes = (dir) => {
    let m = mes + dir, a = ano;
    if (m < 0)  { m = 11; a--; }
    if (m > 11) { m = 0;  a++; }
    setMes(m); setAno(a);
  };


  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes   = new Date(ano, mes + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < primeiroDia; i++) cells.push(null);
  for (let d = 1; d <= diasNoMes; d++) cells.push(d);


  const porDia = {};
  lancamentos.forEach(l => {
    const d = new Date(l.data_vencimento + "T12:00:00").getDate();
    if (!porDia[d]) porDia[d] = [];
    porDia[d].push(l);
  });

  const totalAPagar    = lancamentos.filter(l => l.tipo === "despesa" && l.status === "pendente").reduce((s, l) => s + l.valor, 0);
  const totalAReceber  = lancamentos.filter(l => l.tipo === "receita" && l.status === "pendente").reduce((s, l) => s + l.valor, 0);
  const totalPago      = lancamentos.filter(l => l.tipo === "despesa" && l.status === "pago").reduce((s, l) => s + l.valor, 0);
  const totalRecebido  = lancamentos.filter(l => l.tipo === "receita" && l.status === "pago").reduce((s, l) => s + l.valor, 0);

  const hojeD = hoje.getDate(), hojeM = hoje.getMonth(), hojeA = hoje.getFullYear();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
            <CalendarRange size={20} className="text-gold-500" /> Agenda Financeira
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">

          <div className="flex items-center gap-1 glass-card rounded px-1 py-1">
            {["dia","semana","mes"].map(v => (
              <button key={v} onClick={() => setView(v)}
                style={{ padding: "4px 12px", borderRadius: 3, fontSize: 12, fontWeight: 500, border: "none", cursor: "pointer", background: view === v ? "#C9A96E" : "transparent", color: view === v ? "#080102" : "var(--ink-500)", transition: "all .2s" }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "A Pagar",    value: fmt(totalAPagar),   color: "#ef4444", bg: "rgba(239,68,68,.1)"    },
          { label: "A Receber",  value: fmt(totalAReceber), color: "#22c55e", bg: "rgba(34,197,94,.1)"    },
          { label: "Pago",       value: fmt(totalPago),     color: "#C9A96E", bg: "rgba(201,169,110,.1)"  },
          { label: "Recebido",   value: fmt(totalRecebido), color: "#C9A96E", bg: "rgba(201,169,110,.1)"  },
        ].map(c => (
          <div key={c.label} className="glass-card rounded-xl p-4">
            <p className="text-[11px] text-ink-500 mb-1">{c.label}</p>
            <p className="text-lg font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>


      <div className="glass-card rounded-2xl overflow-hidden">
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid rgba(201,169,110,.07)" }}>
          <button onClick={() => navMes(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,.6)", display: "flex", alignItems: "center", padding: 4, borderRadius: 4 }}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-200)", minWidth: 180, textAlign: "center" }}>{MESES_PT[mes]} {ano}</span>
          <button onClick={() => navMes(1)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,.6)", display: "flex", alignItems: "center", padding: 4, borderRadius: 4 }}><ChevronRight size={16} /></button>
          <button onClick={() => { setMes(hoje.getMonth()); setAno(hoje.getFullYear()); }}
            style={{ marginLeft: 8, padding: "4px 12px", background: "rgba(201,169,110,.1)", border: "1px solid rgba(201,169,110,.2)", borderRadius: 4, color: "#C9A96E", fontSize: 12, cursor: "pointer" }}>
            Hoje
          </button>
        </div>


        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid rgba(201,169,110,.07)" }}>
          {SEMANA.map(s => (
            <div key={s} style={{ padding: "10px 8px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "rgba(201,169,110,.5)", letterSpacing: "0.08em" }}>{s}</div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((dia, i) => {
            const isHoje = dia && dia === hojeD && mes === hojeM && ano === hojeA;
            const eventos = dia ? (porDia[dia] || []) : [];
            return (
              <div key={i} style={{
                minHeight: 90, padding: "8px 6px",
                borderRight: "1px solid rgba(201,169,110,.04)",
                borderBottom: "1px solid rgba(201,169,110,.04)",
                background: isHoje ? "rgba(201,169,110,.06)" : "transparent",
              }}>
                {dia && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: isHoje ? 700 : 400, color: isHoje ? "#C9A96E" : "var(--ink-400)", marginBottom: 4, textAlign: "right" }}>{dia}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {eventos.slice(0, 3).map(ev => (
                        <div key={ev.id} style={{
                          fontSize: 10, padding: "2px 5px", borderRadius: 3, lineHeight: 1.3,
                          background: ev.tipo === "receita" ? "rgba(34,197,94,.15)" : "rgba(239,68,68,.15)",
                          color: ev.tipo === "receita" ? "#22c55e" : "#ef4444",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {ev.descricao}
                        </div>
                      ))}
                      {eventos.length > 3 && <div style={{ fontSize: 10, color: "rgba(201,169,110,.5)", paddingLeft: 4 }}>+{eventos.length - 3}</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
