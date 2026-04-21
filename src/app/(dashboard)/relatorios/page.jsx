"use client";

import { useEffect, useState } from "react";
import { formatMoeda } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, Cell,
} from "recharts";

const ANO_ATUAL = new Date().getFullYear();

export default function RelatoriosPage() {
  const [anual, setAnual]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/relatorios?tipo=anual")
      .then(r => r.json())
      .then(data => { setAnual((data || []).reverse()); setLoading(false); });
  }, []);

  const tooltipStyle = {
    contentStyle: {
      background: "#101828",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "12px",
      color: "#e8eef8",
      fontSize: 12,
    },
    cursor: { fill: "rgba(37,99,235,0.06)" },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <BarChart3 size={20} className="text-gold-500" />
          Relatórios
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">Análise anual e comparativos</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h2 className="text-sm font-semibold text-ink-200">Resumo por Ano</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {["Ano", "Total Clientes", "Ativos", "Concluídos", "Inativos", "Adm.", "Judicial", "Valor Estimado"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {anual.map(r => (
                    <tr key={r.ano} className={`table-row-hover ${r.ano === ANO_ATUAL ? "bg-wine-800/[0.03]" : ""}`}>
                      <td className="px-4 py-3 font-semibold text-ink-100">
                        {r.ano}
                        {r.ano === ANO_ATUAL && <span className="ml-2 text-[10px] text-gold-500">atual</span>}
                      </td>
                      <td className="px-4 py-3 text-ink-200">{r.total_clientes}</td>
                      <td className="px-4 py-3 text-success-500">{r.ativos}</td>
                      <td className="px-4 py-3 text-gold-500">{r.concluidos}</td>
                      <td className="px-4 py-3 text-ink-400">{r.inativos}</td>
                      <td className="px-4 py-3 text-ink-300">{r.administrativos}</td>
                      <td className="px-4 py-3 text-ink-300">{r.judiciais}</td>
                      <td className="px-4 py-3 text-gold-500">{formatMoeda(r.valor_total_beneficios)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-ink-200 mb-5 flex items-center gap-2">
                <Users size={15} className="text-gold-500" />
                Clientes por Ano
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={anual} barSize={24}>
                  <XAxis dataKey="ano" tick={{ fill: "#6b7fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7fa0", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="total_clientes" name="Total" radius={[6, 6, 0, 0]}>
                    {anual.map(e => (
                      <Cell key={e.ano} fill={e.ano === ANO_ATUAL ? "#2563eb" : "#1e3a8a"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>


            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-ink-200 mb-5 flex items-center gap-2">
                <DollarSign size={15} className="text-gold-500" />
                Valor Estimado por Ano (R$)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={anual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="ano" tick={{ fill: "#6b7fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7fa0", fontSize: 11 }} axisLine={false} tickLine={false} width={50}
                         tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    {...tooltipStyle}
                    formatter={v => [formatMoeda(v), "Valor"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor_total_beneficios"
                    stroke="#c9a84c"
                    strokeWidth={2}
                    dot={{ fill: "#c9a84c", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
