"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input, { Select } from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { Settings, Plus, Pencil, Power, Upload, Trash2, FileText, CheckCircle2, Info, Download, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { TIPOS_ACAO, TIPOS_DOC } from "@/lib/contratos/tipos";

export default function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const [subdivisoes, setSubdivisoes] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [editando, setEditando]       = useState(null);
  const [saving, setSaving]           = useState(false);
  const [form, setForm]               = useState({ nome: "", tipo: "administrativo" });

  // Modelos de contrato
  const [modelos, setModelos]         = useState([]);
  const [tipoAcaoAtivo, setTipoAcaoAtivo] = useState(TIPOS_ACAO[0].value);
  const [uploadingSlot, setUploadingSlot] = useState(null); // "tipo_doc"
  const [excluindoId, setExcluindoId]     = useState(null);
  const [acessandoId, setAcessandoId]     = useState(null); // id do modelo sendo baixado/visualizado
  const [infoAberto, setInfoAberto]       = useState(false);
  const [dragOver, setDragOver]           = useState(null); // tipo_doc sendo hovered
  const fileInputRef = useRef(null);
  const uploadSlotRef = useRef(null);

  async function carregar() {
    setLoading(true);
    const resAdm = await fetch("/api/subdivisoes?tipo=administrativo");
    const resJud = await fetch("/api/subdivisoes?tipo=judicial");
    const [adm, jud] = await Promise.all([resAdm.json(), resJud.json()]);
    setSubdivisoes([...adm, ...jud]);
    setLoading(false);
  }

  async function carregarModelos() {
    try {
      const res = await fetch("/api/contratos/modelos");
      const data = await res.json();
      setModelos(Array.isArray(data) ? data : []);
    } catch {}
  }

  useEffect(() => { carregar(); carregarModelos(); }, []);

  // ── Modelos: upload ────────────────────────────────────────────────────────
  function iniciarUpload(tipoDoc) {
    uploadSlotRef.current = tipoDoc;
    fileInputRef.current?.click();
  }

  async function processarUpload(file, tipoDoc) {
    if (!file.name.endsWith(".docx")) {
      toast.error("Apenas arquivos .docx são aceitos");
      return;
    }

    setUploadingSlot(tipoDoc);
    try {
      const resUrl = await fetch("/api/contratos/modelos/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo_acao: tipoAcaoAtivo, tipo_doc: tipoDoc, nome_arquivo: file.name }),
      });
      const { signedUrl, path } = await resUrl.json();
      if (!resUrl.ok) throw new Error("Falha ao obter URL de upload");

      const resUp = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
      });
      if (!resUp.ok) throw new Error("Falha no upload do arquivo");

      const resReg = await fetch("/api/contratos/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo_acao: tipoAcaoAtivo, tipo_doc: tipoDoc, nome: file.name, storage_path: path }),
      });
      if (!resReg.ok) throw new Error("Falha ao registrar modelo");

      toast.success("Modelo enviado com sucesso!");
      carregarModelos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    processarUpload(file, uploadSlotRef.current);
  }

  function handleDragOver(e, tipoDoc) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(tipoDoc);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
  }

  async function handleDrop(e, tipoDoc) {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(null);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processarUpload(file, tipoDoc);
  }

  async function handleAcessarModelo(id, modo) {
    setAcessandoId(`${id}-${modo}`);
    try {
      const res = await fetch(`/api/contratos/modelos/${id}`);
      const { url, nome } = await res.json();
      if (!res.ok) throw new Error("Falha ao obter link do arquivo");

      if (modo === "download") {
        const a = document.createElement("a");
        a.href = url;
        a.download = nome;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Visualizar via Microsoft Office Online
        const viewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
        window.open(viewer, "_blank");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAcessandoId(null);
    }
  }

  async function handleExcluirModelo(id) {
    setExcluindoId(id);
    try {
      const res = await fetch(`/api/contratos/modelos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir modelo");
      toast.success("Modelo removido");
      carregarModelos();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExcluindoId(null);
    }
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setSaving(true);
    const url = editando ? `/api/subdivisoes/${editando.id}` : "/api/subdivisoes";
    const method = editando ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar subdivisão");
      
      toast.success(editando ? "Subdivisão atualizada" : "Subdivisão criada com sucesso");
      setModal(false); 
      setEditando(null); 
      setForm({ nome: "", tipo: "administrativo" }); 
      carregar();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAtivo(s) {
    try {
      const res = await fetch(`/api/subdivisoes/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !s.ativo }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status.");
      
      toast.success(`Subdivisão ${!s.ativo ? "ativada" : "desativada"}`);
      carregar();
    } catch (err) {
      toast.error(err.message);
    }
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
            <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
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

      {/* Input oculto para upload de modelos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Modelos de Contrato */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
          <div>
            <h2 className="text-sm font-semibold text-ink-200">Modelos de Contrato</h2>
            <p className="text-xs text-ink-500 mt-0.5">Um modelo .docx por tipo de ação e documento</p>
          </div>
          <button
            onClick={() => setInfoAberto(v => !v)}
            className="text-ink-600 hover:text-gold-500 transition-colors"
            title="Ver variáveis disponíveis"
          >
            <Info size={15} />
          </button>
        </div>

        {/* Painel de variáveis */}
        {infoAberto && (
          <div className="border-b border-white/[0.05] text-xs">
            <div className="px-5 py-3 bg-dark-300/70">
              <p className="text-ink-300 font-semibold mb-0.5">Como usar</p>
              <p className="text-ink-500">
                No seu arquivo Word, escreva a variável entre chaves simples onde quiser o dado.
                Ex: <span className="font-mono text-gold-400 bg-gold-500/10 px-1 rounded">{"{NOME}"}</span> será substituído pelo nome completo do cliente ao gerar.
              </p>
            </div>

            {[
              {
                grupo: "Dados Pessoais",
                itens: [
                  ["{NOME}",           "Nome completo",               "João da Silva"],
                  ["{CPF}",            "CPF formatado",               "000.000.000-00"],
                  ["{RG}",             "RG",                          "00.000.000-0"],
                  ["{DATA_NASCIMENTO}","Data de nascimento",           "01/01/1970"],
                  ["{IDADE}",          "Idade calculada",             "54 anos"],
                  ["{NACIONALIDADE}",  "Nacionalidade",               "Brasileira"],
                  ["{ESTADO_CIVIL}",   "Estado civil",                "Casado(a)"],
                  ["{PROFISSAO}",      "Profissão",                   "Agricultor"],
                  ["{ENDERECO}",       "Endereço completo",           "Rua X, nº 10, Bairro, Cidade/UF"],
                  ["{CEP}",            "CEP",                         "00000-000"],
                  ["{TELEFONE}",       "Telefone",                    "(71) 99999-9999"],
                ],
              },
              {
                grupo: "Credenciais INSS",
                itens: [
                  ["{LOGIN_INSS}",  "Login do Meu INSS",  "000.000.000-00"],
                  ["{SENHA_INSS}",  "Senha do Meu INSS",  "••••••••"],
                ],
              },
              {
                grupo: "Processo",
                itens: [
                  ["{TIPO_PROCESSO}",  "Tipo (Administrativo / Judicial)", "Administrativo"],
                  ["{SUBDIVISAO}",     "Subdivisão previdenciária",         "Aposentadoria por Idade"],
                  ["{NUMERO_PROCESSO}","Número do processo",                "1234567-89.2024.0.00.0000"],
                  ["{STATUS}",         "Status do processo",               "Ativo"],
                  ["{SITUACAO}",       "Situação",                         "Pendente"],
                  ["{VALOR_BENEFICIO}","Valor estimado do benefício",       "R$ 1.412,00"],
                  ["{DESCRICAO}",      "Observações / descrição",           "Texto livre..."],
                ],
              },
              {
                grupo: "Contrato",
                itens: [
                  ["{TIPO_ACAO}",  "Tipo de ação selecionado ao gerar", "Aposentadoria por Idade"],
                  ["{DATA_HOJE}",  "Data de geração do documento",       "20/04/2026"],
                ],
              },
            ].map(({ grupo, itens }) => (
              <div key={grupo} className="border-t border-white/[0.04]">
                <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-ink-600 bg-dark-300/40">
                  {grupo}
                </p>
                <div className="divide-y divide-white/[0.03]">
                  {itens.map(([variavel, descricao, exemplo]) => (
                    <div key={variavel} className="flex items-center gap-3 px-5 py-2 hover:bg-white/[0.02] transition-colors">
                      <code className="shrink-0 text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded text-[11px] font-mono">
                        {variavel}
                      </code>
                      <span className="flex-1 text-ink-400">{descricao}</span>
                      <span className="text-ink-600 hidden sm:block font-mono">{exemplo}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs de tipo de ação */}
        <div className="flex overflow-x-auto border-b border-white/[0.05] px-5 gap-1 pt-3">
          {TIPOS_ACAO.map(ta => (
            <button
              key={ta.value}
              onClick={() => setTipoAcaoAtivo(ta.value)}
              className={`shrink-0 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors ${
                tipoAcaoAtivo === ta.value
                  ? "text-gold-400 border-b-2 border-gold-500 bg-gold-500/5"
                  : "text-ink-600 hover:text-ink-300"
              }`}
            >
              {ta.label}
            </button>
          ))}
        </div>

        {/* Grid de documentos para o tipo selecionado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
          {TIPOS_DOC.map(td => {
            const modelo      = modelos.find(m => m.tipo_acao === tipoAcaoAtivo && m.tipo_doc === td.value);
            const uploading   = uploadingSlot === td.value;
            const excluindo   = excluindoId === modelo?.id;
            const baixando    = acessandoId === `${modelo?.id}-download`;
            const visualizando= acessandoId === `${modelo?.id}-preview`;
            const isDragOver  = dragOver === td.value;

            return (
              <div
                key={td.value}
                onDragOver={e => handleDragOver(e, td.value)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, td.value)}
                className={`relative rounded-xl border p-4 transition-all ${
                  uploading
                    ? "border-gold-500/40 bg-gold-500/5"
                    : isDragOver
                    ? "border-gold-500/60 bg-gold-500/10 scale-[1.01]"
                    : modelo
                    ? "border-gold-500/20 bg-gold-500/5"
                    : "border-dark-50 bg-dark-300/50"
                }`}
              >
                {/* Overlay de drag */}
                {isDragOver && (
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-1">
                      <Upload size={18} className="text-gold-400" />
                      <p className="text-xs font-medium text-gold-400">Solte para enviar</p>
                    </div>
                  </div>
                )}

                <div className={`flex items-start gap-3 transition-opacity ${isDragOver ? "opacity-30" : ""}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    modelo ? "bg-gold-500/15" : "bg-dark-200"
                  }`}>
                    {uploading
                      ? <div className="w-4 h-4 border border-gold-500 border-t-transparent rounded-full animate-spin" />
                      : modelo
                      ? <CheckCircle2 size={15} className="text-gold-500" />
                      : <FileText size={15} className="text-ink-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-200">{td.label}</p>
                    {uploading ? (
                      <p className="text-xs text-gold-500 mt-0.5">Enviando...</p>
                    ) : modelo ? (
                      <p className="text-xs text-ink-500 mt-0.5 truncate" title={modelo.nome}>{modelo.nome}</p>
                    ) : (
                      <p className="text-xs text-ink-600 mt-0.5">Arraste ou clique para enviar</p>
                    )}
                  </div>
                </div>

                <div className={`flex flex-col gap-2 mt-3 transition-opacity ${isDragOver ? "opacity-30" : ""}`}>
                  {/* Linha 1: upload + excluir */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarUpload(td.value)}
                      disabled={uploading}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg
                                 border border-dark-50 hover:border-gold-500/30 text-xs text-ink-500 hover:text-ink-200
                                 transition-all disabled:opacity-50"
                    >
                      <Upload size={11} /> {modelo ? "Substituir" : "Enviar modelo"}
                    </button>

                    {modelo && (
                      <button
                        onClick={() => handleExcluirModelo(modelo.id)}
                        disabled={excluindo}
                        className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg border border-dark-50
                                   hover:border-red-500/30 hover:text-red-400 text-xs text-ink-600
                                   transition-all disabled:opacity-50"
                        title="Excluir modelo"
                      >
                        {excluindo
                          ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <Trash2 size={11} />
                        }
                      </button>
                    )}
                  </div>

                  {/* Linha 2: visualizar + baixar (só se tiver modelo) */}
                  {modelo && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcessarModelo(modelo.id, "preview")}
                        disabled={!!acessandoId}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg
                                   border border-dark-50 hover:border-gold-500/30 text-xs text-ink-500 hover:text-ink-200
                                   transition-all disabled:opacity-50"
                        title="Visualizar no navegador"
                      >
                        {visualizando
                          ? <div className="w-3 h-3 border border-gold-500 border-t-transparent rounded-full animate-spin" />
                          : <Eye size={11} />
                        }
                        Visualizar
                      </button>

                      <button
                        onClick={() => handleAcessarModelo(modelo.id, "download")}
                        disabled={!!acessandoId}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg
                                   border border-dark-50 hover:border-gold-500/30 text-xs text-ink-500 hover:text-ink-200
                                   transition-all disabled:opacity-50"
                        title="Baixar arquivo"
                      >
                        {baixando
                          ? <div className="w-3 h-3 border border-gold-500 border-t-transparent rounded-full animate-spin" />
                          : <Download size={11} />
                        }
                        Baixar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
