"use client";

import { useState } from "react";
import { FileText, RefreshCw, CheckCircle } from "lucide-react";
import { useMovimentacoes, useContas } from "@/hooks/useFinanceiro";
import { toast } from "sonner";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

export default function Extrato() {
  const hoje = new Date();
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
  const fimDefault    = hoje.toISOString().split("T")[0];

  const [inicio,  setInicio]  = useState(inicioDefault);
  const [fim,     setFim]     = useState(fimDefault);

  const { movimentacoes: movs, isLoading: loadingMovs, mutate } = useMovimentacoes({
    data_inicio: inicio,
    data_fim: fim,
    limit: 500
  });


  const loading = loadingMovs;

  async function conciliar(id, val) {
    try {
      const res = await fetch(`/api/financeiro/movimentacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conciliado: !val })
      });
      if (!res.ok) throw new Error();
      toast.success(val ? "Conciliação removida" : "Movimentação conciliada");
      mutate();
    } catch {
      toast.error("Erro ao conciliar");
    }
  }

  const totalEntrada  = movs.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaida    = movs.filter(m => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const saldoPeriodo  = totalEntrada - totalSaida;

  const S = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,169,110,.12)", borderRadius: 4, padding: "8px 12px", fontSize: 12, color: "#f5f0e8", outline: "none" };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <FileText size={20} className="text-gold-500" /> Extrato e Conciliação
        </h1>
        <button onClick={() => mutate()} className="p-2 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(201,169,110,.6)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Data Início</label>
          <input type="date" style={S} value={inicio} onChange={e => setInicio(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(201,169,110,.6)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Data Fim</label>
          <input type="date" style={S} value={fim} onChange={e => setFim(e.target.value)} />
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total de Entrada", v: fmt(totalEntrada),  c: "#22c55e" },
          { l: "Total de Saída",   v: fmt(totalSaida),    c: "#ef4444" },
          { l: "Saldo do Período", v: fmt(saldoPeriodo),  c: saldoPeriodo >= 0 ? "#22c55e" : "#ef4444" },
          { l: "Movimentações",    v: movs.length,         c: "#C9A96E" },
        ].map(c => (
          <div key={c.l} className="glass-card rounded-xl p-4">
            <p className="text-[11px] text-ink-500 mb-1">{c.l}</p>
            <p className="text-lg font-bold" style={{ color: c.c }}>{c.v}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(201,169,110,.3)", borderTopColor: "#C9A96E" }} />
          </div>
        ) : movs.length === 0 ? (
          <div className="text-center py-16 text-sm text-ink-500">Nenhuma movimentação encontrada.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Data", "Descrição", "Entrada", "Saída", "Conciliado"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {movs.map(m => (
                <tr key={m.id} className="table-row-hover transition-colors">
                  <td className="px-4 py-3 text-ink-400 text-xs whitespace-nowrap">{fmtDate(m.data_movimento)}</td>
                  <td className="px-4 py-3 text-ink-200">{m.descricao}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-success-500">{m.tipo === "entrada" ? fmt(m.valor) : "—"}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-danger-400">{m.tipo === "saida" ? fmt(m.valor) : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => conciliar(m.id, m.conciliado)}
                      className={`w-7 h-7 flex items-center justify-center rounded transition-all ${m.conciliado ? "text-success-500 bg-success-500/10" : "text-ink-600 hover:text-success-500 hover:bg-success-500/10"}`}>
                      <CheckCircle size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
