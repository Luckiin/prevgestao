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

const FIELD_LABELS = {
  nome: "Nome",
  cpf: "CPF",
  data_nascimento: "Data Nasc.",
  tipo_processo: "Tipo",
  subdivisao_id: "ID Subdiv.",
  subdivisao_nome: "Subdivisão",
  status: "Status",
  situacao: "Situação",
  numero_processo: "Nº Processo",
  valor_beneficio: "Valor",
  observacoes: "Obs.",
  ano_referencia: "Ano",
  descricao: "Descrição",
  data_prazo: "Data do Prazo",
  concluido: "Concluído",
  valor: "Valor",
  valor_pago: "Valor Pago",
  data_vencimento: "Vencimento",
  data_pagamento: "Pagamento",
  conta_id: "ID Conta",
  categoria_id: "ID Categoria",
  tipo: "Tipo",
  status: "Status"
};

function AuditDiff({ anterior, novo }) {
  if (!anterior || !novo) return null;
  const changes = [];

  Object.keys(novo).forEach(key => {
    let oldVal = anterior[key];
    let newVal = novo[key];

    if ((oldVal || "") === (newVal || "")) return;
    if (key === "subdivisao_id" || key === "id" || key === "atualizado_em" || key === "criado_em") return;

    changes.push({
      key,
      label: FIELD_LABELS[key] || key,
      old: typeof oldVal === 'boolean' ? (oldVal ? "Sim" : "Não") : oldVal,
      new: typeof newVal === 'boolean' ? (newVal ? "Sim" : "Não") : newVal,
    });
  });

  if (changes.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5 border-l-2 border-white/[0.05] pl-3 py-1">
      {changes.map(c => (
        <div key={c.key} className="flex items-baseline gap-2 text-[11px]">
          <span className="text-ink-500 font-medium min-w-[50px]">{c.label}:</span>
          <span className="text-ink-600 line-through truncate max-w-[150px]">{c.old || "—"}</span>
          <span className="text-ink-500">→</span>
          <span className="text-gold-500 font-semibold truncate max-w-[150px]">{c.new || "—"}</span>
        </div>
      ))}
    </div>
  );
}

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
          <option value="lancamentos">Lançamentos</option>
          <option value="movimentacoes">Movimentações</option>
          <option value="contas">Contas Bancárias</option>
          <option value="subdivisoes">Subdivisões</option>
          <option value="auth">Autenticação</option>
        </select>

        <span className="self-center text-xs text-ink-500 px-2">{filtrados.length} registro(s)</span>
      </div>


      <div className="glass-card rounded-2xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtrados.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">Nenhum registro encontrado.</p>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filtrados.map(a => {
              const isDoc = a.tabela === "documentos";
              const isPrazo = a.tabela === "prazos";
              const isCliente = a.tabela === "clientes";
              const isAuth = a.tabela === "auth" || a.acao.startsWith("LOG");

              let acaoMsg = a.acao;
              if (a.acao === "INSERT") {
                acaoMsg = isDoc ? "Anexou documento" : 
                          isPrazo ? "Adicionou prazo" : 
                          isCliente ? "Cadastrou cliente" : 
                          a.tabela === "lancamentos" ? "Criou lançamento" :
                          a.tabela === "movimentacoes" ? "Registrou movimentação" :
                          a.tabela === "contas" ? "Cadastrou conta" :
                          `Inseriu em ${a.tabela}`;
              }
              if (a.acao === "UPDATE") {
                acaoMsg = isPrazo ? "Atualizou prazo" : 
                          isCliente ? "Editou cliente" : 
                          a.tabela === "lancamentos" ? "Alterou lançamento" :
                          a.tabela === "movimentacoes" ? "Editou movimentação" :
                          `Atualizou ${a.tabela}`;
              }
              if (a.acao === "DELETE") {
                acaoMsg = isDoc ? "Excluiu documento" : 
                          isPrazo ? "Removeu prazo" : 
                          isCliente ? "Excluiu cliente" : 
                          a.tabela === "lancamentos" ? "Removeu lançamento" :
                          a.tabela === "movimentacoes" ? "Excluiu movimentação" :
                          `Deletou de ${a.tabela}`;
              }

              if (a.acao === "LOGIN" || a.acao === "LOGIN_2FA") acaoMsg = "Acessou o sistema";
              if (a.acao === "LOGOUT") acaoMsg = "Saiu do sistema";
              if (a.acao === "MIGRAÇÃO_ANO") acaoMsg = "Rotina de virada de ano executada";
              if (a.acao === "DESATIVAR") acaoMsg = "Registro inativado";

              const desc = a.dados_novos?.nome || a.dados_novos?.descricao || a.dados_anteriores?.nome || a.dados_anteriores?.descricao || "";

              return (
                <div key={a.id} className="px-5 py-4 flex items-start gap-4 hover:bg-white/[0.01] transition-all">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDoc ? "bg-brand-500/10 text-brand-400" :
                    isPrazo ? "bg-warn-500/10 text-warn-500" :
                    isAuth ? "bg-ink-500/10 text-ink-300" :
                    "bg-gold-500/10 text-gold-500"
                  }`}>
                    <ScrollText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-100">
                      {acaoMsg} <span className="text-ink-400 font-normal">{desc && `· ${desc}`}</span>
                    </p>

                    {a.acao === "UPDATE" && (
                      <AuditDiff anterior={a.dados_anteriores} novo={a.dados_novos} />
                    )}

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] text-ink-500 bg-white/5 px-2 py-0.5 rounded-md font-medium">{a.usuario_nome || a.usuario_email || "Sistema"}</span>
                      {a.tabela && <span className="text-[11px] text-ink-600 font-mono lowercase border border-white/5 px-1.5 rounded bg-black/20">{a.tabela}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-ink-500 font-medium">{formatDataHora(a.criado_em).split(' às ')[0]}</p>
                    <p className="text-[10px] text-ink-600">{formatDataHora(a.criado_em).split(' às ')[1]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
