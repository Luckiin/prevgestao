"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ClienteForm from "@/components/clientes/ClienteForm";
import Input, { Select } from "@/components/ui/Input";
import {
  formatCPF, formatData, formatDataHora, formatMoeda, diasRestantes, corPrazo, cn,
} from "@/lib/utils";
import {
  User, Shield, FileText, CalendarClock, FolderOpen, Clock,
  Plus, Trash2, CheckCircle, Upload, History, ArrowLeft, Eye, EyeOff, Download,
} from "lucide-react";
import { toast } from "sonner";
import DropZone from "@/components/ui/DropZone";

const statusVariant = { "Ativo": "ativo", "Inativo": "inativo", "Concluído": "concluido" };
const FIELD_LABELS = {
  nome: "Nome",
  cpf: "CPF",
  data_nascimento: "Data Nasc.",
  tipo_processo: "Tipo",
  subdivisao_id: "ID Subdivisão",
  subdivisao_nome: "Subdivisão",
  status: "Status",
  situacao: "Situação",
  numero_processo: "Nº Processo",
  valor_beneficio: "Valor",
  observacoes: "Obs.",
  ano_referencia: "Ano",
};

function AuditDiff({ anterior, novo }) {
  if (!anterior || !novo) return null;
  const changes = [];
  
  Object.keys(novo).forEach(key => {
    let oldVal = anterior[key];
    let newVal = novo[key];
    
    // Pequenos tratamentos para evitar falso positivo (null vs undefined vs "")
    if ((oldVal || "") === (newVal || "")) return;
    if (key === "subdivisao_id") return; // Pulamos o ID técnico agora que temos o nome
    
    changes.push({
      key,
      label: FIELD_LABELS[key] || key,
      old: oldVal,
      new: newVal,
    });
  });

  if (changes.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5 border-l-2 border-white/[0.05] pl-3 py-1">
      {changes.map(c => (
        <div key={c.key} className="flex items-baseline gap-2 text-[11px]">
          <span className="text-ink-500 font-medium min-w-[50px]">{c.label}:</span>
          <span className="text-ink-600 line-through truncate max-w-[100px]">{c.old || "—"}</span>
          <span className="text-ink-500">→</span>
          <span className="text-gold-500 font-semibold">{c.new || "—"}</span>
        </div>
      ))}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
        active
          ? "bg-wine-800/20 text-gold-500 border border-gold-600/30"
          : "text-ink-400 hover:text-ink-200 hover:bg-white/[0.04]"
      }`}
    >
      {children}
    </button>
  );
}

export default function ClienteDetalhePage() {
  const { id }  = useParams();
  const router  = useRouter();

  const [cliente, setCliente]       = useState(null);
  const [historico, setHistorico]   = useState([]);
  const [prazos, setPrazos]         = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [auditoria, setAuditoria]   = useState([]);
  const [tab, setTab]               = useState("dados");
  const [loading, setLoading]       = useState(true);
  const [editModal, setEditModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [mostraSenha, setMostraSenha] = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [docExcluindo, setDocExcluindo] = useState(null);
  const [prazoExcluindo, setPrazoExcluindo] = useState(null);

  // Novo prazo
  const [novoPrazo, setNovoPrazo] = useState({ descricao: "", data_prazo: "" });
  const [addingPrazo, setAddingPrazo] = useState(false);

  async function carregar() {
    setLoading(true);
    const [c, h, a] = await Promise.all([
      fetch(`/api/clientes/${id}`).then(r => r.json()),
      fetch(`/api/clientes/${id}?historico=1`).then(r => r.json()),
      fetch(`/api/auditoria?entidade_id=${id}`).then(r => r.json()),
    ]);
    setCliente(c);
    setPrazos(c.prazos || []);
    setDocumentos(c.documentos || []);
    setHistorico(h);
    setAuditoria(a);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [id]);

  async function handleSalvar(payload) {
    setSaving(true);
    const res = await fetch(`/api/clientes/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    if (res.ok) { 
      toast.success("Dados do cliente atualizados");
      setEditModal(false); 
      carregar(); 
    }
    else toast.error("Erro ao salvar as alterações");
    setSaving(false);
  }

  async function handleAddPrazo(e) {
    e.preventDefault();
    if (!novoPrazo.descricao || !novoPrazo.data_prazo) return;
    setAddingPrazo(true);
    const res = await fetch("/api/prazos", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...novoPrazo, cliente_id: id }),
    });
    if (res.ok) { 
      toast.success("Prazo adicionado com sucesso");
      setNovoPrazo({ descricao: "", data_prazo: "" }); 
      carregar(); 
    } else {
      toast.error("Erro ao adicionar prazo");
    }
    setAddingPrazo(false);
  }

  async function togglePrazo(prazoId, concluido) {
    await fetch(`/api/prazos/${prazoId}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ concluido: !concluido }),
    });
    carregar();
  }

  async function handleExcluirPrazo() {
    if (!prazoExcluindo) return;
    try {
      const res = await fetch(`/api/prazos/${prazoExcluindo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Não foi possível excluir o prazo.");
      
      toast.success("Prazo removido");
      setPrazoExcluindo(null);
      carregar();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function processarArquivo(file) {
    try {
      // 1. Pede URL assinada para o Supabase
      const resUrl = await fetch("/api/documentos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente_id: id, nome_arquivo: file.name }),
      });
      const dataUrl = await resUrl.json();
      if (!resUrl.ok) throw new Error(dataUrl.erro);

      // 2. Upload direto para o Storage
      const resUpload = await fetch(dataUrl.signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!resUpload.ok) throw new Error(`Falha no upload de ${file.name}`);

      // 3. Registra no banco de dados local
      const resReg = await fetch("/api/documentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: id,
          nome: file.name,
          tipo_mime: file.type,
          tamanho: file.size,
          storage_path: dataUrl.path,
          pasta: "Geral",
        }),
      });
      if (!resReg.ok) throw new Error(`Erro ao registrar metadados de ${file.name}`);
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let sucessos = 0;
    for (const file of files) {
      const ok = await processarArquivo(file);
      if (ok) sucessos++;
    }
    if (sucessos > 0) {
      toast.success(`${sucessos} documento(s) enviado(s) com sucesso`);
      carregar();
    }
    setUploading(false);
  }

  async function downloadDocumento(docId, force = false) {
    try {
      const url = `/api/documentos/${docId}${force ? "?download=1" : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (!res.ok) throw new Error(json.erro || "Falha ao recuperar link.");

      if (json.url) {
        if (force) {
          const a = document.createElement("a");
          a.href = json.url;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          window.open(json.url, "_blank");
        }
      }
    } catch (err) {
      toast.error("Erro ao gerar link de acesso");
    }
  }

  async function handleExcluirDocumento() {
    if (!docExcluindo) return;
    const res = await fetch(`/api/documentos/${docExcluindo.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Documento excluído");
      setDocExcluindo(null);
      carregar();
    } else {
      toast.error("Erro ao excluir arquivo");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cliente || cliente.erro) {
    return (
      <div className="p-6 text-center text-ink-500">
        Cliente não encontrado.
        <br />
        <Button variant="ghost" onClick={() => router.back()} className="mt-4">← Voltar</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-ink-500 hover:text-ink-200 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink-100">{cliente.nome}</h1>
            <p className="text-sm text-ink-500 font-mono">{formatCPF(cliente.cpf)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariant[cliente.status] || "neutro"}>{cliente.status}</Badge>
          <span className="text-xs bg-dark-100/60 text-ink-400 px-2.5 py-1 rounded-lg">
            Ano {cliente.ano_referencia}
          </span>
          <Button size="sm" onClick={() => setEditModal(true)}>Editar</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "dados",      label: "Dados" },
          { id: "prazos",     label: `Prazos (${prazos.length})` },
          { id: "documentos", label: `Documentos (${documentos.length})` },
          { id: "historico",  label: "Histórico Anual" },
          { id: "auditoria",  label: "Auditoria" },
        ].map(t => (
          <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </TabBtn>
        ))}
      </div>

      {/* Tab: Dados */}
      {tab === "dados" && (
        <div className="glass-card rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Campo label="Data de nascimento" value={formatData(cliente.data_nascimento)} />
          <Campo label="Idade" value={cliente.idade ? `${cliente.idade} anos` : "—"} />
          <Campo label="RG" value={cliente.rg || "—"} />
          <Campo label="Nacionalidade" value={cliente.nacionalidade || "—"} />
          <Campo label="Estado civil" value={cliente.estado_civil || "—"} />
          <Campo label="Profissão" value={cliente.profissao || "—"} />
          <Campo label="Telefone" value={cliente.telefone || "—"} />
          <Campo label="CEP" value={cliente.cep || "—"} />
          {cliente.endereco && (
            <div className="sm:col-span-2">
              <p className="text-xs text-ink-500 mb-1">Endereço</p>
              <p className="text-sm text-ink-200">{cliente.endereco}</p>
            </div>
          )}
          <div className="sm:col-span-2 pt-2 border-t border-white/[0.05]" />
          <Campo label="Tipo de processo" value={cliente.tipo_processo?.charAt(0).toUpperCase() + cliente.tipo_processo?.slice(1)} />
          <Campo label="Subdivisão" value={cliente.subdivisoes?.nome} />
          <Campo label="Número do processo" value={cliente.numero_processo || "—"} />
          <Campo label="Valor estimado" value={formatMoeda(cliente.valor_beneficio)} />
          <Campo label="Data de entrada" value={formatDataHora(cliente.data_entrada)} />
          <Campo label="Última atualização" value={formatDataHora(cliente.atualizado_em)} />

          {/* Credenciais INSS */}
          <div className="sm:col-span-2 pt-2 border-t border-white/[0.05]">
            <p className="text-xs font-medium text-ink-500 mb-3 flex items-center gap-2">
              <Shield size={12} /> Credenciais INSS (criptografadas)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Login INSS" value={cliente.login_inss || "—"} />
              <div>
                <p className="text-xs text-ink-500 mb-1">Senha INSS</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-200 font-mono">
                    {mostraSenha ? (cliente.senha_inss || "—") : "••••••••"}
                  </span>
                  {cliente.senha_inss && (
                    <button
                      onClick={() => setMostraSenha(v => !v)}
                      className="text-ink-500 hover:text-ink-300 transition-colors"
                    >
                      {mostraSenha ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {cliente.observacoes && (
            <div className="sm:col-span-2">
              <p className="text-xs text-ink-500 mb-1">Observações</p>
              <p className="text-sm text-ink-200 whitespace-pre-line">{cliente.observacoes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Prazos */}
      {tab === "prazos" && (
        <div className="space-y-4">
          {/* Adicionar prazo */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-ink-200 mb-4">Adicionar prazo</h3>
            <form onSubmit={handleAddPrazo} className="flex flex-wrap gap-3">
              <input
                value={novoPrazo.descricao}
                onChange={e => setNovoPrazo(p => ({ ...p, descricao: e.target.value }))}
                placeholder="Descrição do prazo..."
                className="flex-1 min-w-[200px] bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2 text-sm text-ink-100 placeholder-ink-600
                           focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                required
              />
              <input
                type="date"
                value={novoPrazo.data_prazo}
                onChange={e => setNovoPrazo(p => ({ ...p, data_prazo: e.target.value }))}
                className="bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2 text-sm text-ink-100
                           focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20"
                required
              />
              <Button type="submit" loading={addingPrazo} size="md">
                <Plus size={14} /> Adicionar
              </Button>
            </form>
          </div>

          {/* Lista de prazos */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {prazos.length === 0 ? (
              <p className="text-sm text-ink-500 p-6 text-center">Nenhum prazo cadastrado.</p>
            ) : (
              <div className="divide-y divide-white/[0.03]">
                {prazos.map(p => {
                  const dias = diasRestantes(p.data_prazo);
                  return (
                    <div key={p.id} className={`flex items-center gap-4 px-5 py-3.5 ${p.concluido ? "opacity-50" : ""}`}>
                      <button
                        onClick={() => togglePrazo(p.id, p.concluido)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          p.concluido
                            ? "bg-success-500 border-success-500 text-white"
                            : "border-ink-600 hover:border-gold-500"
                        }`}
                      >
                        {p.concluido && <CheckCircle size={12} />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${p.concluido ? "line-through text-ink-500" : "text-ink-200"}`}>
                          {p.descricao}
                        </p>
                        <p className="text-xs text-ink-500 mt-0.5">por {p.criado_por || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-medium ${p.concluido ? "text-ink-500" : corPrazo(dias)}`}>
                          {formatData(p.data_prazo)}
                        </p>
                        {!p.concluido && (
                          <p className={`text-[11px] ${corPrazo(dias)}`}>
                            {dias === 0 ? "Hoje" : dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d restantes`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setPrazoExcluindo(p)}
                        className="text-ink-600 hover:text-danger-500 transition-colors ml-2"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Documentos */}
      {tab === "documentos" && (
        <div className="space-y-4">
          <DropZone onFilesDropped={handleFiles} disabled={uploading}>
            <div className="glass-card rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h1 className="text-md font-semibold text-ink-100">Documentos do Cliente</h1>
                <p className="text-xs text-ink-500">Anexe PDFs, imagens ou arraste e solte arquivos aqui.</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                  disabled={uploading}
                />
                <Button
                  onClick={() => document.getElementById("file-upload").click()}
                  loading={uploading}
                >
                  <div className="flex items-center gap-2 cursor-pointer">
                    <Upload size={14} />
                    {uploading ? "Enviando..." : "Anexar Documento"}
                  </div>
                </Button>
              </div>
            </div>
          </DropZone>

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/[0.03]">
            {documentos.length === 0 ? (
              <p className="p-10 text-center text-sm text-ink-500">Nenhum documento anexado.</p>
            ) : (
                documentos.map(d => (
                  <div key={d.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.01] transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/5 flex items-center justify-center text-gold-500">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-200 truncate">{d.nome}</p>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {(d.tamanho / 1024).toFixed(1)} KB · {formatDataHora(d.criado_em)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => downloadDocumento(d.id, false)} title="Visualizar">
                        <Eye size={13} className="mr-1.5" /> Ver
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadDocumento(d.id, true)} title="Baixar arquivo">
                        <Download size={13} className="mr-1.5" /> Download
                      </Button>
                      <button
                        onClick={() => setDocExcluindo(d)}
                        className="w-8 h-8 flex items-center justify-center text-ink-500 hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
      )}

      {/* Tab: Histórico Anual */}
      {tab === "historico" && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-ink-200 mb-4 flex items-center gap-2">
            <History size={15} /> Migrações de Ano de Referência
          </h3>
          {historico.length === 0 ? (
            <p className="text-sm text-ink-500">Nenhuma migração registrada. Cliente está no ano original de cadastro.</p>
          ) : (
            <div className="space-y-2">
              {historico.map(h => (
                <div key={h.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="text-ink-500">{h.ano_anterior}</span>
                    <span className="text-ink-600">→</span>
                    <span className="text-gold-500">{h.ano_novo}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-ink-400">{h.motivo}</p>
                    <p className="text-[11px] text-ink-600 mt-0.5">{formatDataHora(h.migrado_em)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Auditoria */}
      {tab === "auditoria" && (
        <div className="glass-card rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
          {auditoria.length === 0 ? (
            <p className="p-12 text-center text-sm text-ink-500">Nenhum registro de auditoria disponível para este cliente.</p>
          ) : (
            <div className="divide-y divide-white/[0.03]">
              {auditoria.map(a => {
                const isDoc = a.tabela === "documentos";
                const isPrazo = a.tabela === "prazos";
                const isCliente = a.tabela === "clientes";
                
                let acaoMsg = a.acao;
                if (a.acao === "INSERT") acaoMsg = isDoc ? "Anexou documento" : isPrazo ? "Adicionou prazo" : "Cadastrou cliente";
                if (a.acao === "UPDATE") acaoMsg = isPrazo ? "Atualizou prazo" : "Editou dados";
                if (a.acao === "DELETE") acaoMsg = isDoc ? "Excluiu documento" : isPrazo ? "Removeu prazo" : "Excluiu cliente";

                const desc = a.dados_novos?.nome || a.dados_novos?.descricao || a.dados_anteriores?.nome || a.dados_anteriores?.descricao || "";

                return (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-4 hover:bg-white/[0.01] transition-all">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      isDoc ? "bg-brand-500/10 text-brand-400" : isPrazo ? "bg-warn-500/10 text-warn-500" : "bg-gold-500/10 text-gold-500"
                    )}>
                      {isDoc ? <FileText size={14} /> : isPrazo ? <CalendarClock size={14} /> : <User size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-100 italic">
                        {acaoMsg} <span className="text-ink-300 not-italic font-normal">{desc && `· ${desc}`}</span>
                      </p>
                      
                      {a.acao === "UPDATE" && a.tabela === "clientes" && (
                        <AuditDiff anterior={a.dados_anteriores} novo={a.dados_novos} />
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-ink-500 font-medium">{a.usuario_nome || a.usuario_email || "Sistema"}</span>
                        <span className="text-[11px] text-ink-600">·</span>
                        <span className="text-[11px] text-ink-600 font-mono lowercase">{a.tabela}</span>
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
      )}

      {/* Modal de edição */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Editar cliente" size="lg">
        <ClienteForm key={cliente?.id} inicial={cliente} onSubmit={handleSalvar} loading={saving} />
      </Modal>

      {/* Confirmação de exclusão de documento */}
      <Modal open={!!docExcluindo} onClose={() => setDocExcluindo(null)} title="Excluir documento" size="sm">
        <p className="text-sm text-ink-300 mb-6">
          Tem certeza que deseja excluir o documento <strong className="text-ink-100">{docExcluindo?.nome}</strong>?
          Esta ação removerá o arquivo permanentemente.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDocExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirDocumento}>Excluir Agora</Button>
        </div>
      </Modal>

      {/* Confirmação de exclusão de prazo */}
      <Modal open={!!prazoExcluindo} onClose={() => setPrazoExcluindo(null)} title="Excluir prazo" size="sm">
        <p className="text-sm text-ink-300 mb-6">
          Tem certeza que deseja excluir o prazo <strong className="text-ink-100">{prazoExcluindo?.descricao}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setPrazoExcluindo(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleExcluirPrazo}>Excluir Agora</Button>
        </div>
      </Modal>
    </div>
  );
}

function Campo({ label, value }) {
  return (
    <div>
      <p className="text-xs text-ink-500 mb-1">{label}</p>
      <p className="text-sm text-ink-200">{value ?? "—"}</p>
    </div>
  );
}
