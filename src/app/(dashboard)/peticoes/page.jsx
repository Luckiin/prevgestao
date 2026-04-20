"use client";

import { useEffect, useState } from "react";
import { Scale, Search, FileText, Download, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function PeticoesPage() {
  const [tipos, setTipos]             = useState([]);
  const [modelos, setModelos]         = useState([]);
  const [clientes, setClientes]       = useState([]);
  const [busca, setBusca]             = useState("");
  const [clienteSel, setClienteSel]   = useState(null);
  const [tipoPeticao, setTipoPeticao] = useState("");
  const [gerando, setGerando]         = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buscaTimeout, setBuscaTimeout] = useState(null);

  // Carrega tipos e modelos
  useEffect(() => {
    fetch("/api/peticoes/tipos")
      .then(r => r.json())
      .then(d => setTipos(Array.isArray(d) ? d.filter(t => t.ativo) : []))
      .catch(() => {});

    fetch("/api/peticoes/modelos")
      .then(r => r.json())
      .then(d => setModelos(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Busca clientes conforme digitação
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
    setTipoPeticao("");
  }

  // Tipos que possuem modelo cadastrado
  const tiposComModelo = tipos.filter(t => modelos.some(m => m.tipo_peticao === t.slug));

  async function gerarDocumento() {
    if (!clienteSel || !tipoPeticao) return;
    setGerando(true);
    try {
      const res = await fetch("/api/peticoes/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cliente_id: clienteSel.id, tipo_peticao: tipoPeticao }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.erro || "Erro ao gerar petição");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*=UTF-8''(.+)/);
      const nomeArquivo = match ? decodeURIComponent(match[1]) : "peticao.docx";

      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href    = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Petição gerada com sucesso!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGerando(false);
    }
  }

  const tipoPeticaoLabel = tipos.find(t => t.slug === tipoPeticao)?.nome;
  const podeGerar = clienteSel && tipoPeticao && !gerando;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <Scale size={20} className="text-ink-400" />
          Petições
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          Gere petições automaticamente a partir dos dados do cliente
        </p>
      </div>

      {/* Formulário */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-ink-200">Gerar petição</h2>

        {/* Busca de cliente */}
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

        {/* Tipo de petição */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-ink-400">Tipo de petição</label>
          <select
            value={tipoPeticao}
            onChange={e => setTipoPeticao(e.target.value)}
            className="w-full bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5 text-sm text-ink-100
                       focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all"
          >
            <option value="">Selecione o tipo de petição...</option>
            {tiposComModelo.map(t => (
              <option key={t.slug} value={t.slug}>{t.nome}</option>
            ))}
          </select>

          {tiposComModelo.length === 0 && (
            <p className="text-xs text-ink-600 mt-1">
              Nenhum modelo cadastrado ainda. Configure em{" "}
              <a href="/configuracoes" className="text-gold-500 hover:underline">Configurações</a>.
            </p>
          )}
        </div>

        {/* Botão gerar ou estado vazio */}
        {clienteSel && tipoPeticao ? (
          <button
            onClick={gerarDocumento}
            disabled={!podeGerar}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                       bg-gold-500/10 border border-gold-500/30 text-gold-400 font-medium text-sm
                       hover:bg-gold-500/20 hover:border-gold-500/50 transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {gerando ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Gerando petição...
              </>
            ) : (
              <>
                <Download size={15} />
                Gerar e baixar — {tipoPeticaoLabel}
              </>
            )}
          </button>
        ) : (
          <div className="border border-dashed border-dark-50 rounded-xl py-8 flex flex-col items-center gap-2 text-center">
            <Scale size={24} className="text-ink-700" />
            <p className="text-sm text-ink-600">
              {!clienteSel && !tipoPeticao
                ? "Selecione um cliente e o tipo de petição"
                : !clienteSel
                ? "Selecione um cliente"
                : "Selecione o tipo de petição"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
