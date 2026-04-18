"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ClienteTable from "@/components/clientes/ClienteTable";
import ClienteForm from "@/components/clientes/ClienteForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { Plus, Search, X } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  // Filtros
  const [busca, setBusca]               = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTipo, setFiltroTipo]     = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca)        params.set("busca", busca);
    if (filtroStatus) params.set("status", filtroStatus);
    if (filtroTipo)   params.set("tipo_processo", filtroTipo);

    const res = await fetch(`/api/clientes?${params}`);
    const json = await res.json();
    setClientes(json.data || []);
    setTotal(json.total || 0);
    setLoading(false);
  }, [busca, filtroStatus, filtroTipo]);

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
      alert("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluir() {
    if (!excluindo) return;
    const res = await fetch(`/api/clientes/${excluindo.id}`, { method: "DELETE" });
    if (res.ok) { setExcluindo(null); carregar(); }
    else alert("Erro ao excluir");
  }

  function abrirNovo() {
    setEditando(null);
    setModalOpen(true);
  }

  function abrirEditar(c) {
    setEditando(c);
    setModalOpen(true);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-100">Clientes / Processos</h1>
          <p className="text-sm text-ink-500 mt-0.5">{total} registro(s) encontrado(s)</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus size={15} /> Novo cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou processo..."
            className="w-full bg-dark-300 border border-dark-50 rounded-xl pl-9 pr-3.5 py-2 text-sm text-ink-100 placeholder-ink-600
                       focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
          />
        </div>

        <select
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded-xl px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">Todos os status</option>
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Concluído">Concluído</option>
        </select>

        <select
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
          className="bg-dark-300 border border-dark-50 rounded-xl px-3 py-2 text-sm text-ink-300 focus:outline-none focus:border-brand-500"
        >
          <option value="">Todos os tipos</option>
          <option value="administrativo">Administrativo</option>
          <option value="judicial">Judicial</option>
        </select>

        {(busca || filtroStatus || filtroTipo) && (
          <button
            onClick={() => { setBusca(""); setFiltroStatus(""); setFiltroTipo(""); }}
            className="flex items-center gap-1 text-xs text-ink-500 hover:text-ink-200 transition-colors px-2"
          >
            <X size={13} /> Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <ClienteTable
          clientes={clientes}
          loading={loading}
          onEdit={abrirEditar}
          onDelete={setExcluindo}
        />
      </div>

      {/* Modal de cadastro/edição */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditando(null); }}
        title={editando ? "Editar cliente" : "Novo cliente"}
        size="lg"
      >
        <ClienteForm
          inicial={editando || {}}
          onSubmit={handleSalvar}
          loading={saving}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
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
