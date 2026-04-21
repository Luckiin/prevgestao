"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useFluxoCaixa } from "@/hooks/useFinanceiro";

const fmt   = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtK  = (v) => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${(v||0).toFixed(0)}`;

export default function FluxoCaixa() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const { dados, isLoading, mutate } = useFluxoCaixa(ano);

  const totalRecReal  = dados.reduce((s, m) => s + m.recReal, 0);
  const totalDespReal = dados.reduce((s, m) => s + m.despReal, 0);
  const saldoAnual    = totalRecReal - totalDespReal;

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

      {/* KPIs */}
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

      {/* Gráfico */}
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

      {/* Tabela mensal */}
      <div className="glass-card rounded-2xl overflow-x-auto">
        <table className="w-full text-sm border-collapse" style={{ minWidth: 700 }}>
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-4 py-3 text-xs font-medium text-ink-500">Mês</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-success-500">Rec. Previsto</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-success-500">Rec. Realizado</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-danger-400">Desp. Prevista</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-danger-400">Desp. Realizada</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gold-500">Saldo Real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {dados.map(m => (
              <tr key={m.mes} className="table-row-hover transition-colors">
                <td className="px-4 py-2.5 text-ink-300 font-medium">{m.nomeMes}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-success-500/70">{fmt(m.recPrevisto)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-success-500">{fmt(m.recReal)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-danger-400/70">{fmt(m.despPrevisto)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs text-danger-400">{fmt(m.despReal)}</td>
                <td className="px-4 py-2.5 text-right font-mono text-xs font-bold" style={{ color: m.saldoReal >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(m.saldoReal)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid rgba(201,169,110,.1)" }}>
              <td className="px-4 py-3 text-gold-500 font-bold text-xs uppercase tracking-wider">Total</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-success-500/70">{fmt(dados.reduce((s,m)=>s+m.recPrevisto,0))}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-success-500">{fmt(totalRecReal)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-danger-400/70">{fmt(dados.reduce((s,m)=>s+m.despPrevisto,0))}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold text-danger-400">{fmt(totalDespReal)}</td>
              <td className="px-4 py-3 text-right font-mono text-xs font-bold" style={{ color: saldoAnual >= 0 ? "#22c55e" : "#ef4444" }}>{fmt(saldoAnual)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
