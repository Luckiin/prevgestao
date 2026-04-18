"use client";

import { useEffect, useState } from "react";
import { formatDataHora } from "@/lib/utils";
import { ScrollText, Search } from "lucide-react";

const ACOES_CORES = {
  INSERT:        "text-success-500 bg-success-500/10",
  UPDATE:        "text-gold-500 bg-wine-800/10",
  DELETE:        "text-danger-500 bg-danger-500/10",
  LOGIN:         "text-gold-500 bg-gold-500/10",
  LOGIN_2FA:     "text-gold-500 bg-gold-500/10",
  LOGOUT:        "text-ink-400 bg-ink-500/10",
  MIGRAÇÃO_ANO:  "text-warn-500 bg-warn-500/10",
  DESATIVAR:     "text-warn-500 bg-warn-500/10",
};

export default function AuditoriaPage() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busca, setBusca]         = useState("");
  const [filtroTabela, setFiltroTabela] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "200" });
    if (filtroTabela) params.set("tabela", filtroTabela);

    fetch(`/api/auditoria?${params}`)
      .then(r => r.json())
      .then(data => { setRegistros(data); setLoading(false); });
  }, [filtroTabela]);

  const filtrados = registros.filter(r =>
    !busca ||
    r.acao?.toLowerCase().includes(busca.toLowerCase()) ||
    r.usuario_email?.toLowerCase().includes(busca.toLowerCase()) ||
    r.tabela?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <ScrollText size={20} className="text-ink-400" />
          Histórico / Auditoria
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">Registro imutável de todas as ações</p>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por ação, usuário, tabela..."
            className="w-full bg-dark-300 border border-dark-50 rounded-xl pl-9 pr-3.5 py-2 text-sm text-ink-100 placeholder-ink-600
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
          />
        </div>

        <select
          value={filtroTabela}
          onChange={e => setFiltroTabela(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded-xl px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-gold-500"
        >
          <option value="">Todas as tabelas</option>
          <option value="clientes">Clientes</option>
          <option value="prazos">Prazos</option>
          <option value="documentos">Documentos</option>
          <option value="subdivisoes">Subdivisões</option>
          <option value="auth">Autenticação</option>
        </select>

        <span className="self-center text-xs text-ink-500 px-2">{filtrados.length} registro(s)</span>
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">Nenhum registro encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Data/Hora", "Tabela", "Ação", "Usuário", "Detalhes"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtrados.map(r => (
                  <tr key={r.id} className="table-row-hover">
                    <td className="px-4 py-3 text-xs text-ink-500 whitespace-nowrap">
                      {formatDataHora(r.criado_em)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400 capitalize">
                      {r.tabela}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${ACOES_CORES[r.acao] || "text-ink-300 bg-ink-500/10"}`}>
                        {r.acao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {r.usuario_nome || r.usuario_email || "sistema"}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500 max-w-[200px] truncate">
                      {r.dados_novos
                        ? JSON.stringify(r.dados_novos).slice(0, 80)
                        : "—"}
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
