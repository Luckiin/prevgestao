"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Settings, Plus, Pencil, Power, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const [subdivisoes, setSubdivisoes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [editando, setEditando]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({ nome: "", tipo: "administrativo" });

  async function carregar() {
    setLoading(true);
    const res = await fetch("/api/subdivisoes?tipo=");
    // Busca todas (sem filtro de tipo)
    const resAdm = await fetch("/api/subdivisoes?tipo=administrativo");
    const resJud = await fetch("/api/subdivisoes?tipo=judicial");
    const [adm, jud] = await Promise.all([resAdm.json(), resJud.json()]);
    setSubdivisoes([...adm, ...jud]);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvar(e) {
    e.preventDefault();
    setSaving(true);
    const url    = editando ? `/api/subdivisoes/${editando.id}` : "/api/subdivisoes";
    const method = editando ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    if (res.ok) { setModal(false); setEditando(null); setForm({ nome: "", tipo: "administrativo" }); carregar(); }
    else alert("Erro ao salvar");
    setSaving(false);
  }

  async function toggleAtivo(s) {
    await fetch(`/api/subdivisoes/${s.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ativo: !s.ativo }),
    });
    carregar();
  }

  function abrirEditar(s) {
    setEditando(s);
    setForm({ nome: s.nome, tipo: s.tipo });
    setModal(true);
  }

  const adm = subdivisoes.filter(s => s.tipo === "administrativo");
  const jud = subdivisoes.filter(s => s.tipo === "judicial");

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <Settings size={20} className="text-ink-400" />
          Configurações
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">Gerenciar subdivisões, usuários e sistema</p>
      </div>

      {/* Subdivisões */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div>
            <h2 className="text-sm font-semibold text-ink-200">Subdivisões Previdenciárias</h2>
            <p className="text-xs text-ink-500 mt-0.5">Lista dinâmica e ilimitada</p>
          </div>
          <Button size="sm" onClick={() => { setEditando(null); setForm({ nome: "", tipo: "administrativo" }); setModal(true); }}>
            <Plus size={13} /> Nova
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">
            {[{ label: "Administrativo", items: adm }, { label: "Judicial", items: jud }].map(col => (
              <div key={col.label}>
                <p className="px-5 py-3 text-xs font-medium text-ink-500 border-b border-white/[0.05]">
                  {col.label} ({col.items.length})
                </p>
                <div className="divide-y divide-white/[0.03]">
                  {col.items.map(s => (
                    <div key={s.id} className="flex items-center gap-3 px-5 py-3 table-row-hover">
                      <div className="flex-1">
                        <p className={`text-sm ${s.ativo ? "text-ink-200" : "text-ink-600 line-through"}`}>
                          {s.nome}
                        </p>
                      </div>
                      <Badge variant={s.ativo ? "ativo" : "inativo"}>{s.ativo ? "Ativo" : "Inativo"}</Badge>
                      <button onClick={() => abrirEditar(s)} className="text-ink-600 hover:text-gold-500 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => toggleAtivo(s)} className="text-ink-600 hover:text-warn-500 transition-colors">
                        <Power size={13} />
                      </button>
                    </div>
                  ))}
                  {col.items.length === 0 && (
                    <p className="px-5 py-4 text-xs text-ink-600">Nenhuma subdivisão cadastrada.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usuário atual */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ink-200 mb-4 flex items-center gap-2">
          <Shield size={15} className="text-brand-400" />
          Usuário atual
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-ink-500 mb-1">Nome</p>
            <p className="text-sm text-ink-200">{usuario?.nome || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-ink-500 mb-1">E-mail</p>
            <p className="text-sm text-ink-200">{usuario?.email || "—"}</p>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-xl bg-brand-500/5 border border-brand-500/10">
          <p className="text-xs text-ink-400">
            Para habilitar o <strong className="text-ink-200">2FA (TOTP)</strong>, acesse o painel do Supabase → Authentication → MFA e ative para seu usuário.
            Na próxima vez que fizer login, o sistema solicitará o código do app autenticador.
          </p>
        </div>
      </div>

      {/* Modal de subdivisão */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setEditando(null); }}
        title={editando ? "Editar subdivisão" : "Nova subdivisão"}
        size="sm"
      >
        <form onSubmit={handleSalvar} className="space-y-4">
          <Input
            label="Nome"
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            required
            placeholder="Ex: Aposentadoria por Invalidez"
          />
          <Select
            label="Tipo"
            value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
          >
            <option value="administrativo">Administrativo</option>
            <option value="judicial">Judicial</option>
          </Select>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
