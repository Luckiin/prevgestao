"use client";

import { useEffect, useState, useCallback } from "react";
import { FileSignature, Search, FileText, Download, Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { toast } from "sonner";
import { TIPOS_DOC } from "@/lib/contratos/tipos";

export default function ContratosPage() {
  const [modelos, setModelos]           = useState([]);
  const [tiposAcao, setTiposAcao]       = useState([]);
  const [clientes, setClientes]         = useState([]);
  const [busca, setBusca]               = useState("");
  const [clienteSel, setClienteSel]     = useState(null);
  const [tipoAcao, setTipoAcao]         = useState("");
  const [gerando, setGerando]           = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buscaTimeout, setBuscaTimeout] = useState(null);


  useEffect(() => {
    fetch("/api/contratos/modelos")
      .then(r => r.json())
      .then(d => setModelos(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch("/api/contratos/tipos")
      .then(r => r.json())
      .then(d => setTiposAcao(Array.isArray(d) ? d.filter(t => t.ativo) : []))
      .catch(() => {});
  }, []);


  useEffect(() => {
    if (buscaTimeout) clearTimeout(buscaTimeout);
    if (!busca.trim()) { setClientes([]); return; }

    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clientes?busca=${encodeURIComponent(busca)}&limit=8`);
        const json = await res.json();
        setClientes(json.data || []);
        setDropdownOpen(true);
      } catch {}
    }, 300);
    setBuscaTimeout(t);
  }, [busca]);

  function selecionarCliente(c) {
    setClienteSel(c);
    setBusca(c.nome);
    setClientes([]);
    setDropdownOpen(false);
  }

  function limparCliente() {
    setClienteSel(null);
    setBusca("");
    setClientes([]);
    setTipoAcao("");
  }


  const docsDisponiveis = tipoAcao
    ? TIPOS_DOC.filter(td => modelos.some(m => m.tipo_acao === tipoAcao && m.tipo_doc === td.value))
    : [];

  const tiposAcaoComModelo = tiposAcao.filter(ta =>
    modelos.some(m => m.tipo_acao === ta.slug)
  );

  async function gerarDocumento(tipoDoc) {
    if (!clienteSel || !tipoAcao) return;
    setGerando(g => ({ ...g, [tipoDoc]: true }));
    try {
      const res = await fetch("/api/contratos/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente_id: clienteSel.id, tipo_acao: tipoAcao, tipo_doc: tipoDoc }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.erro || "Erro ao gerar documento");
      }


      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      const nomeArquivo = match ? decodeURIComponent(match[1]) : "contrato.docx";

      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href    = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${TIPOS_DOC.find(t => t.value === tipoDoc)?.label} gerado com sucesso!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGerando(g => ({ ...g, [tipoDoc]: false }));
    }
  }

  const tipoAcaoLabel = tiposAcao.find(t => t.slug === tipoAcao)?.nome;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <FileSignature size={20} className="text-ink-400" />
          Contratos
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          Gere contratos, procurações e declarações automaticamente
        </p>
      </div>


      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-ink-200">Gerar documentos</h2>


        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-ink-400">Cliente</label>
          <div className="relative">
            <div className="flex items-center gap-2 bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5">
              <Search size={14} className="text-ink-600 shrink-0" />
              <input
                type="text"
                value={busca}
                onChange={e => { setBusca(e.target.value); if (clienteSel) setClienteSel(null); }}
                placeholder="Digite o nome ou CPF do cliente..."
                className="flex-1 bg-transparent text-sm text-ink-100 placeholder-ink-600 outline-none"
              />
              {clienteSel && (
                <button onClick={limparCliente} className="text-ink-500 hover:text-ink-300 transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>


            {dropdownOpen && clientes.length > 0 && !clienteSel && (
              <div className="absolute z-20 top-full mt-1 w-full bg-dark-200 border border-dark-50 rounded-xl overflow-hidden shadow-xl">
                {clientes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selecionarCliente(c)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-dark-100 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center text-xs font-bold text-gold-500 shrink-0 mt-0.5">
                      {c.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-100">{c.nome}</p>
                      <p className="text-xs text-ink-500">{c.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>


          {clienteSel && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-gold-500/10 border border-gold-500/20 rounded-lg">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-wine-700 to-wine-900 flex items-center justify-center text-xs font-bold text-gold-500 shrink-0">
                {clienteSel.nome.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-gold-400">{clienteSel.nome}</p>
                <p className="text-xs text-ink-500">{clienteSel.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
              </div>
            </div>
          )}
        </div>


        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-ink-400">Tipo de ação</label>
          <select
            value={tipoAcao}
            onChange={e => setTipoAcao(e.target.value)}
            className="w-full bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5 text-sm text-ink-100
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
          >
            <option value="">Selecione o tipo de ação...</option>
            {tiposAcaoComModelo.map(t => (
              <option key={t.slug} value={t.slug}>{t.nome}</option>
            ))}
          </select>
          {tiposAcaoComModelo.length === 0 && (
            <p className="text-xs text-ink-600 mt-1">
              Nenhum modelo cadastrado ainda. Configure os modelos em{" "}
              <a href="/configuracoes" className="text-gold-500 hover:underline">Configurações</a>.
            </p>
          )}
        </div>


        {tipoAcao && clienteSel && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-ink-400">Documentos disponíveis</p>

            {docsDisponiveis.length === 0 ? (
              <p className="text-xs text-ink-600 py-2">
                Nenhum modelo configurado para <span className="text-ink-400">{tipoAcaoLabel}</span>.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {docsDisponiveis.map(td => (
                  <button
                    key={td.value}
                    onClick={() => gerarDocumento(td.value)}
                    disabled={!!gerando[td.value]}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-dark-50 bg-dark-300
                               hover:border-gold-500/30 hover:bg-dark-200 transition-all text-left group
                               disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center shrink-0 group-hover:bg-gold-500/15 transition-colors">
                      {gerando[td.value]
                        ? <Loader2 size={15} className="text-gold-500 animate-spin" />
                        : <FileText size={15} className="text-gold-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-200 group-hover:text-ink-100 transition-colors">{td.label}</p>
                      <p className="text-xs text-ink-600 flex items-center gap-1 mt-0.5">
                        <Download size={10} />
                        {gerando[td.value] ? "Gerando..." : "Clique para baixar"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}


        {(!tipoAcao || !clienteSel) && (
          <div className="border border-dashed border-dark-50 rounded-xl py-8 flex flex-col items-center gap-2 text-center">
            <FileSignature size={24} className="text-ink-700" />
            <p className="text-sm text-ink-600">
              {!clienteSel && !tipoAcao
                ? "Selecione um cliente e o tipo de ação para gerar os documentos"
                : !clienteSel
                ? "Selecione um cliente"
                : "Selecione o tipo de ação"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
