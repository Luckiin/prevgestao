"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ClienteTable from "@/components/clientes/ClienteTable";
import ClienteForm from "@/components/clientes/ClienteForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: ANO_ATUAL - 2020 + 3 }, (_, i) => 2020 + i).reverse();

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);


  const [sortCol, setSortCol] = useState("nome");
  const [sortDir, setSortDir] = useState("asc");

  function handleSort(col) {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  }


  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo]     = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");
  const [filtroSubdivisao, setFiltroSubdivisao] = useState("");
  const [filtroAno, setFiltroAno]       = useState(String(ANO_ATUAL));
  const [subdivisoes, setSubdivisoes]   = useState([]);
  const [carregandoDetalhe, setCarregandoDetalhe] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca)         params.set("busca", busca);
    if (filtroStatus) params.set("status", filtroStatus);
    if (filtroTipo)   params.set("tipo_processo", filtroTipo);
    if (filtroSituacao) params.set("situacao", filtroSituacao);
    if (filtroSubdivisao) params.set("subdivisao_nome", filtroSubdivisao);
    if (filtroAno && filtroAno !== "todos") params.set("ano_referencia", filtroAno);

    const res = await fetch(`/api/clientes?${params}`);
    const json = await res.json();
    setClientes(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [busca, filtroStatus, filtroTipo, filtroSituacao, filtroSubdivisao, filtroAno]);

  useEffect(() => {
    async function carregarSubdivisoes() {
      try {
        const res = await fetch("/api/subdivisoes");
        if (res.ok) setSubdivisoes(await res.json());
      } catch (err) {
        console.error("Erro ao carregar subdivisões:", err);
      }
    }
    carregarSubdivisoes();
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function handleSalvar(payload) {
    setSaving(true);
    try {
      const url    = editando ? `/api/clientes/${editando.id}` : "/api/clientes";
      const method = editando ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).erro);
      setModalOpen(false);
      setEditando(null);
      carregar();
    } catch (err) {
      toast.error("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluir() {
    if (!excluindo) return;
    const res = await fetch(`/api/clientes/${excluindo.id}`, { method: "DELETE" });
    if (res.ok) { setExcluindo(null); carregar(); }
    else toast.error("Erro ao excluir");
  }

  function abrirNovo() {
    setEditando(null);
    setModalOpen(true);
  }

  async function abrirEditar(c) {
    setCarregandoDetalhe(true);
    try {
      const res = await fetch(`/api/clientes/${c.id}`);
      const full = await res.json();
      setEditando(full);
      setModalOpen(true);
    } catch (err) {
      toast.error("Erro ao carregar dados do cliente");
    } finally {
      setCarregandoDetalhe(false);
    }
  }


  const clientesOrdenados = [...clientes].sort((a, b) => {
    let va, vb;
    switch (sortCol) {
      case "nome":     va = a.nome?.toLowerCase() || ""; vb = b.nome?.toLowerCase() || ""; break;
      case "cpf":      va = a.cpf || ""; vb = b.cpf || ""; break;
      case "status":   va = a.status || ""; vb = b.status || ""; break;
      case "situacao": va = a.situacao || ""; vb = b.situacao || ""; break;
      case "ano":      va = a.ano_referencia || 0; vb = b.ano_referencia || 0; break;
      default:         va = ""; vb = "";
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-100">Clientes / Processos</h1>
          <p className="text-sm text-ink-500 mt-0.5">{total} registro(s) encontrado(s)</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus size={15} /> Novo cliente
        </Button>
      </div>


      <div className="glass-card rounded p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou processo..."
            className="w-full bg-dark-300 border border-dark-50 rounded pl-9 pr-3.5 py-2 text-sm text-ink-100 placeholder-ink-600
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/15"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-gold-500"
        >
          <option value="">Todos os status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Concluído">Concluído</option>
        </select>

        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-gold-500"
        >
          <option value="">Todos os tipos</option>
          <option value="administrativo">Administrativo</option>
          <option value="judicial">Judicial</option>
        </select>

        <select
          value={filtroSituacao}
          onChange={e => setFiltroSituacao(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-gold-500"
        >
          <option value="">A situação (Todos)</option>
          <option value="Pendente">Pendente</option>
          <option value="Em análise Administrativa">Em análise Administrativa</option>
          <option value="Em análise Judicial">Em análise Judicial</option>
          <option value="Peticionar">Peticionar</option>
          <option value="Requerimento">Requerimento</option>
          <option value="Protocolar">Protocolar</option>
          <option value="Finalizado">Finalizado</option>
        </select>

        <select
          value={filtroSubdivisao}
          onChange={e => setFiltroSubdivisao(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-gold-500 max-w-[180px]"
        >
          <option value="">Subdivisão (Todas)</option>
          {Array.from(new Set(subdivisoes.map(s => s.nome))).sort().map(nome => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>

        <select
          value={filtroAno}
          onChange={e => setFiltroAno(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-gold-500"
        >
          <option value="todos">Todos os anos</option>
          {ANOS.map(year => (
            <option key={year} value={year}>{year}{year === ANO_ATUAL ? " (Atual)" : ""}</option>
          ))}
        </select>

        {(busca || filtroStatus || filtroTipo || filtroSituacao || filtroSubdivisao || filtroAno !== String(ANO_ATUAL)) && (
          <button
            onClick={() => {
              setBusca("");
              setFiltroStatus("");
              setFiltroTipo("");
              setFiltroSituacao("");
              setFiltroSubdivisao("");
              setFiltroAno(String(ANO_ATUAL));
            }}
            className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-200 transition-colors px-2"
          >
            <X size={13} /> Limpar
          </button>
        )}
      </div>


      <div className="glass-card rounded overflow-hidden">
        <ClienteTable
          clientes={clientesOrdenados}
          loading={loading || carregandoDetalhe}
          onEdit={abrirEditar}
          onDelete={setExcluindo}
          sortCol={sortCol}
          sortDir={sortDir}
          onSort={handleSort}
        />
      </div>


      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        title={editando ? "Editar cliente" : "Novo cliente"}
        size="lg"
      >
        <ClienteForm key={editando?.id || "novo"} inicial={editando || {}} onSubmit={handleSalvar} loading={saving} />
      </Modal>


      <Modal
        open={!!excluindo}
        onClose={() => setExcluindo(null)}
        title="Confirmar exclusão"
        size="sm"
      >
        <p className="text-sm text-ink-300 mb-5">
          Tem certeza que deseja excluir <strong className="text-ink-100">{excluindo?.nome}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluir}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
}
