"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/ui/Badge";
import { Users, CalendarClock, DollarSign, AlertTriangle, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
import { formatMoeda, formatData, diasRestantes, corPrazo } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const ANO_ATUAL = new Date().getFullYear();

export default function HomePage() {
  const [stats, setStats]   = useState(null);
  const [anual, setAnual]   = useState([]);
  const [prazos, setPrazos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, a, p] = await Promise.all([
        fetch("/api/relatorios?tipo=dashboard").then(r => r.json()),
        fetch("/api/relatorios?tipo=anual").then(r => r.json()),
        fetch("/api/relatorios?tipo=prazos&dias=14").then(r => r.json()),
      ]);
      setStats(s);
      setAnual(a.slice(0, 6).reverse());
      setPrazos(p.slice(0, 5));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-100">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-0.5">Visão geral do escritório — {ANO_ATUAL}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Clientes Ativos"
          value={stats?.total_ativos ?? "—"}
          color="brand"
        />
        <StatCard
          icon={CalendarDays}
          label={`Clientes ${ANO_ATUAL}`}
          value={stats?.total_ano_atual ?? "—"}
          sub="Ano de referência atual"
          color="gold"
        />
        <StatCard
          icon={AlertTriangle}
          label="Prazos Vencidos"
          value={stats?.prazos_vencidos ?? "—"}
          sub="Necessitam atenção"
          color={stats?.prazos_vencidos > 0 ? "danger" : "success"}
        />
        <StatCard
          icon={DollarSign}
          label="Valor Total Estimado"
          value={formatMoeda(stats?.valor_total)}
          sub="Processos ativos"
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Gráfico anual */}
        <div className="xl:col-span-3 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-ink-200">Clientes por Ano</h2>
              <p className="text-xs text-ink-500 mt-0.5">Distribuição histórica</p>
            </div>
            <TrendingUp size={16} className="text-brand-400" />
          </div>

          {anual.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={anual} barSize={28}>
                <XAxis
                  dataKey="ano"
                  tick={{ fill: "#6b7fa0", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7fa0", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "#101828",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    color: "#e8eef8",
                    fontSize: 12,
                  }}
                  cursor={{ fill: "rgba(37,99,235,0.06)" }}
                />
                <Bar dataKey="total_clientes" radius={[6, 6, 0, 0]}>
                  {anual.map((entry) => (
                    <Cell
                      key={entry.ano}
                      fill={entry.ano === ANO_ATUAL ? "#2563eb" : "#1e3a8a"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-ink-500">
              Nenhum dado disponível
            </div>
          )}
        </div>

        {/* Prazos próximos */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-200">Prazos Próximos</h2>
              <p className="text-xs text-ink-500 mt-0.5">Próximos 14 dias</p>
            </div>
            <CalendarClock size={16} className="text-warn-500" />
          </div>

          {prazos.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-sm text-ink-500">
              Nenhum prazo pendente
            </div>
          ) : (
            <div className="space-y-2.5">
              {prazos.map((p) => {
                const dias = diasRestantes(p.data_prazo);
                return (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.07] transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-ink-200 truncate">{p.clientes?.nome}</p>
                      <p className="text-[11px] text-ink-500 truncate">{p.descricao}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-xs font-semibold ${corPrazo(dias)}`}>
                        {dias === 0 ? "Hoje" : dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d`}
                      </p>
                      <p className="text-[10px] text-ink-600">{formatData(p.data_prazo)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/prazos"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Ver todos os prazos <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Link módulo anual */}
      <Link
        href={`/por-ano?ano=${ANO_ATUAL}`}
        className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-brand-500/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
          <CalendarDays size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-200 group-hover:text-ink-100 transition-colors">
            Clientes do Ano {ANO_ATUAL}
          </p>
          <p className="text-xs text-ink-500 mt-0.5">
            {stats?.total_ano_atual ?? 0} cliente(s) com atividade em {ANO_ATUAL}
          </p>
        </div>
        <ArrowRight size={16} className="text-ink-500 group-hover:text-brand-400 transition-colors" />
      </Link>
    </div>
  );
}
