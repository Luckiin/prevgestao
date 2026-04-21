"use client";

import { useState, Fragment } from "react";
import { TrendingUp, ChevronDown, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useFluxoCaixa } from "@/hooks/useFinanceiro";

const fmt  = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtK = (v) => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${(v||0).toFixed(0)}`;
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";


function PainelDetalhes({ mes }) {
  const temItens = mes.receitas.length > 0 || mes.despesas.length > 0;

  if (!temItens) {
    return (
      <div className="px-6 py-8 text-center text-sm text-ink-600 italic">
        Nenhum lançamento em {mes.nomeMes}.
      </div>
    );
  }


  const MiniTabela = ({ titulo, itens, cor, corFundo }) => (
    <div className="flex-1 min-w-0 overflow-hidden rounded-lg" style={{ border: `1px solid ${cor}20` }}>

      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: corFundo }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cor }}>
          {titulo}
        </span>
        <span className="text-[10px] font-semibold" style={{ color: cor, opacity: 0.7 }}>
          {itens.length} lançamento{itens.length !== 1 ? "s" : ""}
        </span>
      </div>


      <table className="w-full border-collapse text-[10px]">

        <thead>
          <tr style={{ borderBottom: `1px solid ${cor}15`, background: "rgba(0,0,0,.2)" }}>
            <th className="text-left px-3 py-1.5 font-semibold text-ink-600 uppercase tracking-wider whitespace-nowrap w-16">Data</th>
            <th className="text-left px-3 py-1.5 font-semibold text-ink-600 uppercase tracking-wider">Descrição</th>
            <th className="text-left px-3 py-1.5 font-semibold text-ink-600 uppercase tracking-wider">Cliente</th>
            <th className="text-left px-3 py-1.5 font-semibold text-ink-600 uppercase tracking-wider">Categoria</th>
            <th className="text-center px-3 py-1.5 font-semibold text-ink-600 uppercase tracking-wider whitespace-nowrap">Status</th>
            <th className="text-right px-3 py-1.5 font-semibold text-ink-600 uppercase tracking-wider whitespace-nowrap">Valor</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-4 text-center text-ink-600 italic" style={{ fontSize: 10 }}>
                Nenhum registro
              </td>
            </tr>
          ) : (
            itens.map((l, idx) => {
              const pago = l.status === "pago";
              return (
                <tr
                  key={l.id}
                  style={{
                    borderBottom: idx < itens.length - 1 ? `1px solid ${cor}10` : "none",
                    background: idx % 2 === 0 ? "transparent" : "rgba(0,0,0,.12)"
                  }}
                >

                  <td className="px-3 py-2 text-ink-500 whitespace-nowrap">{fmtDate(l.data_vencimento)}</td>


                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: pago ? cor : "rgba(255,255,255,.2)" }} />
                      <span className="text-ink-200 truncate font-medium" style={{ maxWidth: 140 }}>
                        {l.descricao || "—"}
                      </span>
                    </div>
                  </td>


                  <td className="px-3 py-2">
                    {l.clientes?.nome ? (
                      <span
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full truncate"
                        style={{ background: "rgba(201,169,110,.1)", color: "#C9A96E", maxWidth: 110 }}
                        title={l.clientes.nome}
                      >
                        <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                        <span className="truncate">{l.clientes.nome}</span>
                      </span>
                    ) : (
                      <span className="text-ink-700">—</span>
                    )}
                  </td>


                  <td className="px-3 py-2">
                    {l.categorias_financeiras?.nome ? (
                      <span
                        className="inline-block px-1.5 py-0.5 rounded-full truncate"
                        style={{ background: `${cor}15`, color: cor, maxWidth: 100 }}
                        title={l.categorias_financeiras.nome}
                      >
                        {l.categorias_financeiras.nome}
                      </span>
                    ) : (
                      <span className="text-ink-700">—</span>
                    )}
                  </td>


                  <td className="px-3 py-2 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                      style={{
                        background: pago ? `${cor}20` : "rgba(255,255,255,.06)",
                        color: pago ? cor : "#a9939e"
                      }}
                    >
                      {pago ? "Pago" : "Pendente"}
                    </span>
                  </td>


                  <td className="px-3 py-2 text-right font-mono font-bold whitespace-nowrap" style={{ color: pago ? cor : "#a9939e" }}>
                    {fmt(l.valor)}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="px-4 pt-2 pb-4 space-y-3">

      {mes.receitas.length > 0 && (
        <MiniTabela titulo="Receitas" itens={mes.receitas} cor="#22c55e" corFundo="rgba(34,197,94,.07)" />
      )}


      {mes.despesas.length > 0 && (
        <MiniTabela titulo="Despesas" itens={mes.despesas} cor="#ef4444" corFundo="rgba(239,68,68,.07)" />
      )}


      <div
        className="flex items-center justify-end gap-6 px-3 py-1.5 rounded-lg text-[10px]"
        style={{ background: "rgba(201,169,110,.04)", border: "1px solid rgba(201,169,110,.08)" }}
      >
        <span><span className="text-ink-600 mr-1">Rec. Prev.</span><span className="text-success-500 font-semibold">{fmt(mes.recPrevisto)}</span></span>
        <span><span className="text-ink-600 mr-1">Desp. Prev.</span><span className="text-danger-400 font-semibold">{fmt(mes.despPrevisto)}</span></span>
        <span><span className="text-ink-600 mr-1">Saldo Prev.</span><span className="font-bold" style={{ color: mes.saldoPrevisto >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(mes.saldoPrevisto)}</span></span>
        <span className="pl-4 ml-4 font-bold text-[11px]" style={{ borderLeft: "1px solid rgba(201,169,110,.15)", color: mes.saldoReal >= 0 ? "#22c55e" : "#ef4444" }}>
          Saldo Real: {fmt(mes.saldoReal)}
        </span>
      </div>
    </div>
  );
}


export default function FluxoCaixa() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [expandido, setExpandido] = useState(null);
  const { dados, isLoading } = useFluxoCaixa(ano);

  const totalRecReal  = dados.reduce((s, m) => s + m.recReal, 0);
  const totalDespReal = dados.reduce((s, m) => s + m.despReal, 0);
  const saldoAnual    = totalRecReal - totalDespReal;

  function toggleMes(nomeMes) {
    setExpandido(e => e === nomeMes ? null : nomeMes);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-gold-500" /> Fluxo de Caixa
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">Visão anual de receitas e despesas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAno(a => a - 1)} style={{ padding: "6px 12px", background: "rgba(201,169,110,.08)", border: "1px solid rgba(201,169,110,.15)", borderRadius: 4, color: "#C9A96E", fontSize: 13, cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-200)", minWidth: 60, textAlign: "center" }}>{ano}</span>
          <button onClick={() => setAno(a => a + 1)} style={{ padding: "6px 12px", background: "rgba(201,169,110,.08)", border: "1px solid rgba(201,169,110,.15)", borderRadius: 4, color: "#C9A96E", fontSize: 13, cursor: "pointer" }}>›</button>
        </div>
      </div>


      <div className="grid grid-cols-3 gap-4">
        {[
          { l: "Receita Realizada", v: fmt(totalRecReal),  c: "#22c55e" },
          { l: "Despesa Realizada", v: fmt(totalDespReal), c: "#ef4444" },
          { l: "Saldo do Ano",      v: fmt(saldoAnual),    c: saldoAnual >= 0 ? "#22c55e" : "#ef4444" },
        ].map(k => (
          <div key={k.l} className="glass-card rounded-2xl p-5">
            <p className="text-xs text-ink-500 mb-1">{k.l}</p>
            <p className="text-2xl font-bold" style={{ color: k.c }}>{k.v}</p>
          </div>
        ))}
      </div>


      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-ink-300 mb-4">Fluxo de Caixa Mensal {ano}</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(201,169,110,.3)", borderTopColor: "#C9A96E" }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
              <XAxis dataKey="mes" tick={{ fill: "#8a7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fill: "#8a7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background: "#14050a", border: "1px solid rgba(201,169,110,.15)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#b09aa2" }} />
              <Line type="monotone" dataKey="recPrevisto"  name="Receita Prevista"   stroke="#86efac" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="recReal"      name="Receita Realizada"  stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="despPrevisto" name="Despesa Prevista"   stroke="#fca5a5" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              <Line type="monotone" dataKey="despReal"     name="Despesa Realizada"  stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="saldoReal"    name="Saldo Realizado"    stroke="#C9A96E" strokeWidth={2.5} dot={{ r: 4, fill: "#C9A96E" }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>


      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr className="border-b border-white/[0.05]">

              <th className="px-3 py-3 w-8" />
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Mês</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-success-500">Rec. Previsto</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-success-500">Rec. Realizado</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-danger-400">Desp. Prevista</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-danger-400">Desp. Realizada</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gold-500">Saldo Real</th>
            </tr>
          </thead>
          <tbody>
            {dados.map(m => {
              const aberto = expandido === m.nomeMes;
              const temItens = m.receitas.length > 0 || m.despesas.length > 0;

              return (
                <Fragment key={m.mes}>

                  <tr
                    key={m.mes}
                    className={`transition-colors ${aberto ? "" : "table-row-hover"} cursor-pointer`}
                    style={aberto ? { background: "rgba(201,169,110,.05)" } : {}}
                    onClick={() => toggleMes(m.nomeMes)}
                  >

                    <td className="px-3 py-2.5 text-center">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center mx-auto transition-all duration-300"
                        style={{
                          background: aberto ? "rgba(201,169,110,.15)" : "rgba(255,255,255,.04)",
                          transform: aberto ? "rotate(180deg)" : "rotate(0deg)",
                          color: aberto ? "#C9A96E" : "#a9939e"
                        }}
                      >
                        <ChevronDown size={13} />
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-300 font-medium">{m.nomeMes}</span>
                        {temItens && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(201,169,110,.1)", color: "#C9A96E" }}
                          >
                            {m.receitas.length + m.despesas.length}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-success-500/70">{fmt(m.recPrevisto)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-success-500">{fmt(m.recReal)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-danger-400/70">{fmt(m.despPrevisto)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-danger-400">{fmt(m.despReal)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-bold" style={{ color: m.saldoReal >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(m.saldoReal)}</td>
                  </tr>


                  {aberto && (
                    <tr key={`${m.mes}-detalhe`}>
                      <td
                        colSpan={7}
                        style={{
                          padding: 0,
                          borderBottom: "1px solid rgba(201,169,110,.1)",
                          background: "rgba(13,3,7,.6)",
                          borderLeft: "2px solid rgba(201,169,110,.25)"
                        }}
                      >
                        <PainelDetalhes mes={m} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}


            <tr style={{ borderTop: "1px solid rgba(201,169,110,.1)" }}>
              <td />
              <td className="px-4 py-3 text-gold-500 font-bold text-xs uppercase tracking-wider">Total</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-success-500/70">{fmt(dados.reduce((s,m) => s+m.recPrevisto, 0))}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-success-500">{fmt(totalRecReal)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-danger-400/70">{fmt(dados.reduce((s,m) => s+m.despPrevisto, 0))}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-danger-400">{fmt(totalDespReal)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold" style={{ color: saldoAnual >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(saldoAnual)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
