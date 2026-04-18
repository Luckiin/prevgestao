"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatCPF, formatData, formatDataHora, formatMoeda } from "@/lib/utils";
import { CalendarDays, Search, Download, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: ANO_ATUAL - 2019 + 3 }, (_, i) => 2020 + i);

const statusVariant = { "Ativo": "ativo", "Inativo": "inativo", "Concluído": "concluido" };

function PorAnoContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const anoParam = Number(searchParams.get("ano")) || ANO_ATUAL;
  const [ano, setAno]           = useState(anoParam);
  const [clientes, setClientes] = useState([]);
  const [total, setTotal]       = useState(0);
  const [busca, setBusca]       = useState("");
  const [resumo, setResumo]     = useState(null);
  const [loading, setLoading]   = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tipo: "por-ano", ano: String(ano), limit: "200" });
    if (busca) params.set("busca", busca);

    const [res, resumoRes] = await Promise.all([
      fetch(`/api/relatorios?${params}`).then(r => r.json()),
      fetch("/api/relatorios?tipo=anual").then(r => r.json()),
    ]);

    setClientes(res.data || []);
    setTotal(res.total || 0);
    setResumo((resumoRes || []).find(r => r.ano === ano) || null);
    setLoading(false);
  }, [ano, busca]);

  useEffect(() => { carregar(); }, [carregar]);

  function mudarAno(novoAno) {
    setAno(novoAno);
    router.push(`/por-ano?ano=${novoAno}`, { scroll: false });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
            <CalendarDays size={20} className="text-gold-500" />
            Clientes por Ano
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">Módulo de rastreamento anual</p>
        </div>
      </div>

      {/* Seletor de ano */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => mudarAno(ano - 1)}
            disabled={ano <= 2020}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-100 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex flex-wrap gap-2">
            {ANOS.map(a => (
              <button
                key={a}
                onClick={() => mudarAno(a)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  a === ano
                    ? "bg-brand-600 text-white"
                    : a === ANO_ATUAL
                    ? "bg-gold-500/10 text-gold-500 border border-gold-500/20"
                    : "text-ink-400 hover:text-ink-200 hover:bg-white/[0.04]"
                }`}
              >
                {a}
                {a === ANO_ATUAL && " ★"}
              </button>
            ))}
          </div>

          <button
            onClick={() => mudarAno(ano + 1)}
            disabled={ano >= ANO_ATUAL + 2}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-ink-100 hover:bg-white/[0.06] disabled:opacity-30 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Cards de resumo do ano */}
      {resumo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",     value: resumo.total_clientes || 0,  color: "brand" },
            { label: "Ativos",    value: resumo.ativos || 0,           color: "success" },
            { label: "Concluídos",value: resumo.concluidos || 0,       color: "gold" },
            { label: "Inativos",  value: resumo.inativos || 0,         color: "neutro" },
          ].map(c => (
            <div key={c.label} className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-ink-500 mb-1">{c.label}</p>
              <p className="text-2xl font-bold text-ink-100">{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filtro */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <Search size={14} className="text-ink-500 flex-shrink-0" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou CPF..."
          className="flex-1 bg-transparent text-sm text-ink-100 placeholder-ink-600 focus:outline-none"
        />
        <span className="text-xs text-ink-500">{total} cliente(s)</span>
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clientes.length === 0 ? (
          <div className="py-20 text-center text-sm text-ink-500">
            Nenhum cliente com atividade em {ano}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Nome", "CPF", "Subdivisão", "Status", "Última atividade", "Usuário", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {clientes.map(c => (
                  <tr key={c.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-100">{c.nome}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-300 font-mono text-xs">
                      {formatCPF(c.cpf)}
                    </td>
                    <td className="px-4 py-3 text-ink-400 text-xs">
                      {c.subdivisao || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[c.status] || "neutro"}>{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {formatDataHora(c.atualizado_em)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">—</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clientes/${c.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-500 hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                      >
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PorAnoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PorAnoContent />
    </Suspense>
  );
}

