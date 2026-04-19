"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/ui/Badge";
import { Users, CalendarClock, DollarSign, AlertTriangle, CalendarDays, TrendingUp, ArrowRight } from "lucide-react";
import { formatMoeda, formatData, diasRestantes, corPrazo } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import useSWR from "swr";
import Skeleton from "@/components/ui/Skeleton";
import { motion } from "framer-motion";

const ANO_ATUAL = new Date().getFullYear();

export default function HomePage() {
  const { data: stats, isLoading: loadingStats } = useSWR("/api/relatorios?tipo=dashboard");
  const { data: anualRaw, isLoading: loadingAnual } = useSWR("/api/relatorios?tipo=anual");
  const { data: prazosRaw, isLoading: loadingPrazos } = useSWR("/api/relatorios?tipo=prazos&dias=14");

  const anual = anualRaw ? anualRaw.slice(0, 6).reverse() : [];
  const prazos = prazosRaw ? prazosRaw.slice(0, 5) : [];

  const isLoading = loadingStats || loadingAnual || loadingPrazos;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const [hoveredBar, setHoveredBar] = useState(null);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-xl font-bold text-ink-100">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-0.5">Visão geral do escritório — {ANO_ATUAL}</p>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {["Clientes Ativos", `Clientes ${ANO_ATUAL}`, "Prazos Vencidos", "Valor Total Estimado"].map((label, i) => {
          if (isLoading) return <Skeleton key={i} className="h-32 rounded-2xl" />;
          
          const components = [
            <StatCard key={0} icon={Users} label="Clientes Ativos" value={stats?.total_ativos ?? "—"} color="brand" />,
            <StatCard key={1} icon={CalendarDays} label={`Clientes ${ANO_ATUAL}`} value={stats?.total_ano_atual ?? "—"} sub="Ano de referência atual" color="gold" />,
            <StatCard key={2} icon={AlertTriangle} label="Prazos Vencidos" value={stats?.prazos_vencidos ?? "—"} sub="Necessitam atenção" color={stats?.prazos_vencidos > 0 ? "danger" : "success"} />,
            <StatCard key={3} icon={DollarSign} label="Valor Total Estimado" value={formatMoeda(stats?.valor_total)} sub="Processos ativos" color="success" />,
          ];
          return components[i];
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Gráfico anual */}
        <motion.div variants={item} className="xl:col-span-3 glass-card rounded-2xl p-5 border border-white/[0.05] relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-ink-200">Clientes por Ano</h2>
              <p className="text-xs text-ink-500 mt-0.5">Distribuição histórica</p>
            </div>
            <TrendingUp size={16} className="text-gold-500" />
          </div>

          {isLoading ? <Skeleton className="h-48 w-full" /> : (
            anual.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart 
                    data={anual} 
                    onMouseMove={(state) => {
                      if (state.activePayload && state.activePayload.length > 0) {
                        setHoveredBar({
                          label: state.activeLabel,
                          total: state.activePayload[0]?.payload?.total_clientes ?? 0,
                          ativos: state.activePayload[0]?.payload?.ativos ?? 0,
                          inativos: state.activePayload[0]?.payload?.inativos ?? 0,
                          x: state.activeCoordinate.x,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <XAxis dataKey="ano" tick={{ fill: "#6b7fa0", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#6b7fa0", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={() => null} cursor={{ fill: "rgba(201, 169, 110, 0.05)" }} />
                    
                    <Bar name="Total" dataKey="total_clientes" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.6} />
                    <Bar name="Ativos" dataKey="ativos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar name="Inativos" dataKey="inativos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Stable Floating Tooltip */}
                {hoveredBar && (
                  <div 
                    className="absolute z-10 glass-card p-3.5 rounded-xl border border-white/10 shadow-2xl backdrop-blur-xl pointer-events-auto min-w-[170px]"
                    style={{ 
                      left: hoveredBar.x,
                      top: 0,
                      transform: "translate(-50%, -100%)",
                      marginTop: -10,
                    }}
                  >
                    <p className="text-[11px] font-bold text-ink-300 mb-2 uppercase tracking-wider border-b border-white/5 pb-1.5">{hoveredBar.label}</p>
                    <div className="space-y-1.5">
                      <p className="text-xs text-ink-100 flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                          Total:
                        </span>
                        <span className="font-bold text-white">{hoveredBar.total}</span>
                      </p>
                      <p className="text-xs text-ink-100 flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                          Ativos:
                        </span>
                        <span className="font-bold text-[#10b981]">{hoveredBar.ativos}</span>
                      </p>
                      <p className="text-xs text-ink-100 flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f43f5e]" />
                          Inativos:
                        </span>
                        <span className="font-bold text-[#f43f5e]">{hoveredBar.inativos}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-ink-500">Nenhum dado disponível</div>
            )
          )}
        </motion.div>

        {/* Prazos próximos */}
        <motion.div variants={item} className="xl:col-span-2 glass-card rounded-2xl p-5 border border-white/[0.05]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-200">Prazos Próximos</h2>
              <p className="text-xs text-ink-500 mt-0.5">Próximos 14 dias</p>
            </div>
            <CalendarClock size={16} className="text-warn-500" />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            prazos.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-ink-500">Nenhum prazo pendente</div>
            ) : (
              <div className="space-y-2.5">
                {prazos.map((p) => {
                  const dias = diasRestantes(p.data_prazo);
                  return (
                    <div key={p.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.07] transition-all">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-ink-200 truncate">{p.clientes?.nome}</p>
                        <p className="text-[11px] text-ink-500 truncate">{p.descricao}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-semibold ${corPrazo(dias)}`}>{dias === 0 ? "Hoje" : dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d`}</p>
                        <p className="text-[10px] text-ink-600">{formatData(p.data_prazo)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          <Link href="/prazos" className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gold-500 hover:text-gold-500 transition-colors">
            Ver todos os prazos <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>

    </motion.div>
  );
}
