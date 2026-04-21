"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  X, CheckCircle, ChevronDown, Info, RefreshCw, 
  ArrowDownCircle, ArrowUpCircle, Plus 
} from "lucide-react";
import { toast } from "sonner";
import { useCategorias } from "@/hooks/useFinanceiro";
import AnexoFinanceiro from "@/components/financeiro/AnexoFinanceiro";
import { maskMoeda } from "@/lib/utils";

function cn(...c) { return c.filter(Boolean).join(" "); }

/**
 * Componente unificado para inclusão e edição de Lançamentos Financeiros (Receitas e Despesas).
 * @param {string} tipo - "receita" ou "despesa"
 * @param {object} original - Dados do lançamento para edição (opcional)
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onSalvo - Callback após sucesso no salvamento
 */
export default function ModalLancamento({ tipo, original = null, onClose, onSalvo }) {
  const [tab, setTab]       = useState("lancamento");
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    id: original?.id || null,
    descricao: original?.descricao || "",
    categoria_id: original?.categoria_id || "",
    cliente_id: original?.cliente_id || "",
    data_vencimento: original?.data_vencimento || new Date().toISOString().slice(0,10),
    valor: maskMoeda(original?.valor || ""),
    mais_info: !!original?.observacao || !!original?.observacoes,
    quitado: original?.status === "pago",
    data_pagamento: original?.data_pagamento || new Date().toISOString().slice(0,10),
    juros_multa: "",
    desconto: "",
    valor_pago: maskMoeda(original?.valor_pago || ""),
  });

  const { categorias } = useCategorias();
  const cats = useMemo(() => {
    return categorias.filter(c => c.tipo === tipo);
  }, [categorias, tipo]);

  useEffect(() => {
    fetch("/api/clientes?limit=1000")
      .then(r => r.json())
      .then(j => setClientes(j?.data || j || []))
      .catch(() => {});
  }, []);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const isDespesa   = tipo === "despesa";
  const accentColor = isDespesa ? "#ef4444" : "#22c55e";

  async function salvar() {
    if (!form.descricao || !form.valor) { 
      toast.error("Preencha descrição e valor."); 
      return; 
    }
    setSaving(true);
    try {
      const payload = {
        tipo, 
        descricao: form.descricao, 
        categoria_id: form.categoria_id || null,
        cliente_id: form.cliente_id || null,
        data_vencimento: form.data_vencimento,
        valor: parseFloat(form.valor.replace(/\./g, "").replace(",", ".")),
        status: form.quitado ? "pago" : "pendente",
        data_pagamento: form.quitado ? form.data_pagamento : null,
        valor_pago: form.quitado && form.valor_pago ? parseFloat(form.valor_pago.replace(/\./g, "").replace(",", ".")) : null,
        observacoes: form.mais_info ? `Juros: ${form.juros_multa||0} | Desconto: ${form.desconto||0}` : null,
        conta_id: "00000000-0000-0000-0000-000000000001" // Conta Principal Fixa
      };
      
      const url = form.id ? `/api/financeiro/lancamentos/${form.id}` : "/api/financeiro/lancamentos";
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const saved = await res.json();

      toast.success(`${isDespesa ? "Despesa" : "Receita"} ${form.id ? "atualizada" : "cadastrada"}!`);
      onSalvo?.(); 
      onClose();
    } catch { 
      toast.error("Erro ao salvar."); 
    } finally { 
      setSaving(false); 
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.75)", backdropFilter:"blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background:"#1e0d12", border:`1px solid ${accentColor}35` }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]" style={{ background:`${accentColor}12` }}>
          <div className="flex items-center gap-3">
            {isDespesa ? <ArrowDownCircle size={20} style={{color:accentColor}} /> : <ArrowUpCircle size={20} style={{color:accentColor}} />}
            <h2 className="text-base font-bold text-ink-100">{form.id ? "Editando" : "Incluindo Nova"} {isDespesa ? "Despesa" : "Receita"}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-500 hover:text-ink-100 hover:bg-white/10 transition-all"><X size={16} /></button>
        </div>

        <div className="flex border-b border-white/[0.06]">
          {[["lancamento","Lançamento"],["anexo","Anexo de documentos"]].map(([k,label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={cn("px-5 py-2.5 text-xs font-semibold transition-all border-b-2",
                tab===k ? "text-ink-100 border-gold-500" : "text-ink-500 border-transparent hover:text-ink-200")}>
              {label}
            </button>
          ))}
        </div>

        {tab === "lancamento" ? (
          <div className="p-6 space-y-4 max-h-[68vh] overflow-y-auto">
            {/* Descrição e Categoria */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Descrição</label>
                <input type="text" value={form.descricao} onChange={e => set("descricao",e.target.value)}
                  placeholder={isDespesa ? "Ex: Aluguel escritório..." : "Ex: Honorários cliente..."}
                  className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Categoria</label>
                <div className="relative">
                  <select value={form.categoria_id} onChange={e => set("categoria_id", e.target.value)}
                    className="w-full appearance-none bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all">
                    <option value="">Selecionar...</option>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Cliente, Vencimento e Valor */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Cliente</label>
                <div className="relative">
                  <select value={form.cliente_id} onChange={e => set("cliente_id", e.target.value)}
                    className="w-full appearance-none bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 pr-8 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all">
                    <option value="">Nenhum...</option>
                    {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Vencimento</label>
                <input type="date" value={form.data_vencimento} onChange={e => set("data_vencimento",e.target.value)}
                  className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all" />
              </div>
              <div className="col-span-1">
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Valor</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">R$</span>
                  <input type="text" value={form.valor} onChange={e => set("valor", maskMoeda(e.target.value))} placeholder="0,00"
                    className="w-full bg-dark-100 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                </div>
              </div>
            </div>

            {/* Mais Informações Toggle */}
            <div className="flex gap-2">
              <button type="button" onClick={() => set("mais_info",!form.mais_info)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  form.mais_info ? "bg-gold-500/15 border-gold-500/40 text-gold-500" : "bg-dark-100 border-white/10 text-ink-500 hover:text-ink-200")}>
                <Info size={12} />{form.mais_info ? "Ocultar detalhes" : "Mais detalhes (Juros/Desconto)"}
              </button>
            </div>

            {form.mais_info && (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                {[["juros_multa","Juros/Multa"],["desconto","Desconto"]].map(([k,label]) => (
                  <div key={k}>
                    <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">R$</span>
                      <input type="text" value={form[k]} onChange={e => set(k, maskMoeda(e.target.value))} placeholder="0,00"
                        className="w-full bg-dark-100 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/[0.06]" />

            {/* Status de Pagamento */}
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div onClick={() => set("quitado",!form.quitado)}
                className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
                  form.quitado ? "bg-success-500 border-success-500 text-white" : "border-ink-600 group-hover:border-gold-500")}>
                {form.quitado && <CheckCircle size={12} />}
              </div>
              <span className="text-sm font-medium text-ink-200">{isDespesa ? "Pago" : "Recebido"}</span>
            </label>

            {form.quitado && (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div>
                  <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{isDespesa ? "Data do Pagamento" : "Data do Recebimento"}</label>
                  <input type="date" value={form.data_pagamento} onChange={e => set("data_pagamento",e.target.value)}
                    className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{isDespesa ? "Valor Pago" : "Valor Recebido"}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">R$</span>
                    <input type="text" value={form.valor_pago} onChange={e => set("valor_pago", maskMoeda(e.target.value))} placeholder={form.valor || "0,00"}
                      className="w-full bg-dark-100 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-[68vh] overflow-y-auto min-h-[300px]">
            <AnexoFinanceiro lancamentoId={form.id} />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="px-4 py-2 text-sm text-ink-500 hover:text-ink-200 transition-colors">Cancelar</button>
          <button onClick={salvar} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-dark-400 transition-all disabled:opacity-50"
            style={{ background:"linear-gradient(135deg,#C9A96E,#b08840)" }}>
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
