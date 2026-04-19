"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus, Filter, RefreshCw, ChevronLeft, ChevronRight,
  ChevronDown, CheckCircle, Trash2, AlertTriangle, X,
  Receipt, FileText, Download, Repeat, SplitSquareHorizontal, Info,
  ChevronsLeft, ChevronsRight, ArrowUpDown, User, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { useLancamentos } from "@/hooks/useFinanceiro";

const MESES_ABREV = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
const CATS_RECEITA = ["Investimento","Prêmios","Outros","Salário","Serviço"];
const PAGE_SIZES   = [25, 50, 100];

const fmt     = (v) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const fmtDate = (d) => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "—";

function cn(...c) { return c.filter(Boolean).join(" "); }

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNovo }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
        <ellipse cx="60" cy="82" rx="50" ry="5" fill="rgba(34,197,94,0.06)" />
        <path d="M20 75 Q35 40 55 35 Q65 32 75 40 Q90 50 100 75" stroke="rgba(34,197,94,0.15)" strokeWidth="1.5" fill="rgba(13,3,7,0.4)" />
        <path d="M38 75 Q48 48 60 42 Q72 48 82 75" stroke="rgba(34,197,94,0.2)" strokeWidth="1.5" fill="rgba(30,13,18,0.6)" />
        <path d="M52 75 Q57 55 60 50 Q63 55 68 75" stroke="rgba(34,197,94,0.3)" strokeWidth="1" fill="rgba(42,21,27,0.8)" />
        <line x1="60" y1="50" x2="60" y2="36" stroke="#22c55e" strokeWidth="1.2"/>
        <path d="M60 36 L68 40 L60 44 Z" fill="#22c55e" opacity="0.7"/>
        <circle cx="60" cy="49" r="3" fill="#22c55e" opacity="0.5"/>
        <line x1="60" y1="52" x2="60" y2="60" stroke="#22c55e" strokeWidth="1.2" opacity="0.5"/>
        <line x1="56" y1="55" x2="60" y2="53" stroke="#22c55e" strokeWidth="1" opacity="0.5"/>
        <line x1="64" y1="55" x2="60" y2="53" stroke="#22c55e" strokeWidth="1" opacity="0.5"/>
      </svg>
      <p className="text-sm text-ink-400 font-medium">Nenhum registro localizado.</p>
      <p className="text-xs text-ink-600">
        Clique em <button onClick={onNovo} className="text-success-500 hover:underline font-semibold">Novo +</button> para incluir um novo registro.
      </p>
    </div>
  );
}

// ── Modal Nova Receita ────────────────────────────────────────────────────────
function ModalNovaReceita({ onClose, onSalvo, clientes }) {
  const [tab, setTab]     = useState("lancamento");
  const [saving, setSaving] = useState(false);
  const [form, setForm]   = useState({
    descricao:"", categoria:"", cliente_id:"",
    data_vencimento: new Date().toISOString().slice(0,10),
    valor:"",
    recorrente:false, parcelado:false, mais_info:false,
    recebido:false,
    data_recebimento: new Date().toISOString().slice(0,10),
    conta:"", juros:"", desconto:"", valor_recebido:"",
  });

  function set(k,v) { setForm(f=>({...f,[k]:v})); }

  async function salvar() {
    if (!form.descricao) { toast.error("Informe a descrição."); return; }
    if (!form.valor)     { toast.error("Informe o valor."); return; }
    setSaving(true);
    try {
      const payload = {
        tipo: "receita",
        descricao: form.descricao,
        categoria: form.categoria,
        cliente_id: form.cliente_id || null,
        data_vencimento: form.data_vencimento,
        valor: parseFloat(form.valor.replace(",",".")||0),
        status: form.recebido ? "pago" : "pendente",
        data_pagamento: form.recebido ? form.data_recebimento : null,
        valor_pago: form.valor_recebido ? parseFloat(form.valor_recebido.replace(",",".")) : null,
        observacao: [
          form.juros   ? `Juros: ${form.juros}`     : "",
          form.desconto? `Desconto: ${form.desconto}`: "",
        ].filter(Boolean).join(" | ") || null,
      };
      const res = await fetch("/api/financeiro/lancamentos", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Receita cadastrada!");
      onSalvo(); onClose();
    } catch { toast.error("Erro ao salvar receita."); }
    finally { setSaving(false); }
  }

  const inputCls = "w-full bg-dark-100/80 border border-white/10 rounded-lg px-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all";
  const labelCls = "block text-[11px] font-semibold text-ink-500 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.8)", backdropFilter:"blur(4px)" }}>
      <div className="w-full max-w-xl rounded-xl overflow-hidden shadow-2xl" style={{ background:"#1a0d14", border:"1px solid rgba(34,197,94,.2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5" style={{ background:"rgba(34,197,94,0.12)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-success-500/20 flex items-center justify-center">
              <span className="text-success-500 font-bold text-sm">$</span>
            </div>
            <h2 className="text-sm font-bold text-ink-100">Incluindo Nova Receita</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-ink-500 hover:text-ink-100 transition-colors"><X size={16}/></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pt-4 border-b border-white/[0.06] pb-0">
          {[["lancamento","Lançamento"],["anexo","Anexo de documentos"]].map(([k,lbl])=>(
            <button key={k} onClick={()=>setTab(k)}
              className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all",
                tab===k ? "bg-white/5 text-ink-100 border-gold-500" : "text-ink-500 border-transparent hover:text-ink-300")}>
              {k==="lancamento" ? <Receipt size={12}/> : <FileText size={12}/>}{lbl}
            </button>
          ))}
        </div>

        {tab==="lancamento" ? (
          <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">

            {/* Descrição + Categoria */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Descrição</label>
                <input type="text" value={form.descricao} onChange={e=>set("descricao",e.target.value)}
                  placeholder="Informe a descrição da receita" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Categoria</label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <select value={form.categoria} onChange={e=>set("categoria",e.target.value)}
                      className={cn(inputCls,"appearance-none pr-7")}>
                      <option value="">Selecione a categoria de receita</option>
                      {CATS_RECEITA.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
                  </div>
                  <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-success-500/20 text-success-500 hover:bg-success-500/30 transition-all">
                    <Plus size={14}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Cliente + Data + Valor */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Cliente</label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <select value={form.cliente_id} onChange={e=>set("cliente_id",e.target.value)}
                      className={cn(inputCls,"appearance-none pr-7")}>
                      <option value="">Selecione o cliente</option>
                      {clientes.map(c=>(
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
                  </div>
                  <button className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-success-500/20 text-success-500 hover:bg-success-500/30 transition-all">
                    <Plus size={14}/>
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Data vencimento</label>
                <input type="date" value={form.data_vencimento} onChange={e=>set("data_vencimento",e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Valor a Receber</label>
                <input type="text" value={form.valor} onChange={e=>set("valor",e.target.value)}
                  placeholder="0,00" className={inputCls} />
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-white/[0.06]"/>

            {/* Toggles */}
            <div className="flex gap-2">
              {[["recorrente","Recorrente",Repeat],["parcelado","Parcelado",SplitSquareHorizontal],["mais_info","Mais informações",Info]].map(([k,lbl,Icon])=>(
                <button key={k} type="button" onClick={()=>set(k,!form[k])}
                  className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all",
                    form[k] ? "bg-gold-500/15 border-gold-500/40 text-gold-400" : "bg-dark-100/50 border-white/10 text-ink-500 hover:text-ink-200")}>
                  <Icon size={12}/>{lbl}
                </button>
              ))}
            </div>

            {/* Separador */}
            <div className="border-t border-white/[0.06]"/>

            {/* Checkbox Recebido */}
            <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
              <div onClick={()=>set("recebido",!form.recebido)}
                className={cn("w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                  form.recebido ? "bg-success-500 border-success-500 text-white" : "border-ink-500 group-hover:border-gold-500")}>
                {form.recebido && <CheckCircle size={10}/>}
              </div>
              <span className="text-sm font-medium text-ink-300">Recebido</span>
            </label>

            {/* Seção de recebimento — sempre visível */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-1">
                <label className={labelCls}>Data recebimento</label>
                <input type="date" value={form.data_recebimento} onChange={e=>set("data_recebimento",e.target.value)}
                  disabled={!form.recebido}
                  className={cn(inputCls, !form.recebido && "opacity-40 cursor-not-allowed")} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Conta</label>
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <select value={form.conta} onChange={e=>set("conta",e.target.value)}
                      disabled={!form.recebido}
                      className={cn(inputCls,"appearance-none pr-7", !form.recebido && "opacity-40 cursor-not-allowed")}>
                      <option value=""/>
                      <option>Conta Corrente</option>
                      <option>Caixa</option>
                      <option>Poupança</option>
                    </select>
                    <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
                  </div>
                  <button disabled={!form.recebido}
                    className={cn("w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-success-500/20 text-success-500 hover:bg-success-500/30 transition-all",
                      !form.recebido && "opacity-40 cursor-not-allowed")}>
                    <Plus size={14}/>
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Juros/Multa</label>
                <input type="text" value={form.juros} onChange={e=>set("juros",e.target.value)}
                  disabled={!form.recebido} placeholder="0,00"
                  className={cn(inputCls, !form.recebido && "opacity-40 cursor-not-allowed")} />
              </div>
              <div>
                <label className={labelCls}>Desconto</label>
                <input type="text" value={form.desconto} onChange={e=>set("desconto",e.target.value)}
                  disabled={!form.recebido} placeholder="0,00"
                  className={cn(inputCls, !form.recebido && "opacity-40 cursor-not-allowed")} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Valor Recebido</label>
              <input type="text" value={form.valor_recebido} onChange={e=>set("valor_recebido",e.target.value)}
                disabled={!form.recebido} placeholder={form.valor || "0,00"}
                className={cn(inputCls,"max-w-[160px]", !form.recebido && "opacity-40 cursor-not-allowed")} />
            </div>
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center h-48 text-ink-600">
            <FileText size={28} className="mb-3 opacity-25"/>
            <p className="text-sm">Anexo de documentos em breve.</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-white/[0.06]">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background:"#f59e0b" }}>
            Cancelar
          </button>
          <button onClick={salvar} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background:"#16a34a" }}>
            {saving ? <RefreshCw size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página Contas a Receber ───────────────────────────────────────────────────
export default function ContasReceber() {
  const hoje = new Date();
  const [ano,  setAno]  = useState(hoje.getFullYear());
  const [mes,  setMes]  = useState(hoje.getMonth());
  const [filtRecebido,  setFiltRecebido]  = useState(true);
  const [filtAReceber,  setFiltAReceber]  = useState(true);
  const [modal,   setModal]   = useState(false);
  const [clientes,setClientes]= useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [page,     setPage]    = useState(1);
  const [sortCol,  setSortCol] = useState("data_vencimento");
  const [sortAsc,  setSortAsc] = useState(true);

  const mesISO = `${ano}-${String(mes+1).padStart(2,"0")}`;

  const { lancamentos: dados, isLoading, mutate } = useLancamentos({ tipo: 'receita', mes: mesISO, limit: 500 });

  useEffect(() => {
    fetch(`/api/clientes?limit=500&status=ativo`)
      .then(r => r.json())
      .then(j => setClientes(j?.data || j || []))
      .catch(() => {});
  }, []);

  async function marcarRecebido(id, statusAtual) {
    const novoStatus = statusAtual === "pago" ? "pendente" : "pago";
    try {
      await fetch(`/api/financeiro/lancamentos/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ status:novoStatus, data_pagamento: novoStatus==="pago" ? hoje.toISOString().slice(0,10) : null }),
      });
      toast.success(novoStatus==="pago" ? "Marcado como recebido!" : "Reaberto como pendente");
      mutate();
    } catch { toast.error("Erro ao atualizar."); }
  }

  async function excluir(id) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await fetch(`/api/financeiro/lancamentos/${id}`, { method:"DELETE" });
      toast.success("Excluído."); mutate();
    } catch { toast.error("Erro."); }
  }

  // Filtragem
  const filtrados = useMemo(() => dados.filter(l => {
    if (l.status==="pago" && !filtRecebido) return false;
    if (l.status!=="pago" && !filtAReceber) return false;
    return true;
  }), [dados, filtRecebido, filtAReceber]);

  // Ordenação
  const ordenados = useMemo(() => [...filtrados].sort((a,b) => {
    let va = a[sortCol]??"", vb = b[sortCol]??"";
    if (typeof va==="number") return sortAsc ? va-vb : vb-va;
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  }), [filtrados, sortCol, sortAsc]);

  // Paginação
  const totalPags = Math.max(1, Math.ceil(ordenados.length/pageSize));
  const pagActual = Math.min(page, totalPags);
  const inicio    = (pagActual-1)*pageSize;
  const pagina    = ordenados.slice(inicio, inicio+pageSize);

  function toggleSort(col) {
    if (sortCol===col) setSortAsc(a=>!a);
    else { setSortCol(col); setSortAsc(true); }
  }

  // Totais
  const totalAReceber  = filtrados.filter(l=>l.status!=="pago").reduce((s,l)=>s+(l.valor||0),0);
  const totalRecebido  = filtrados.filter(l=>l.status==="pago").reduce((s,l)=>s+(l.valor_pago||l.valor||0),0);
  const totalGeral     = filtrados.reduce((s,l)=>s+(l.valor||0),0);
  const hojeISO        = hoje.toISOString().slice(0,10);

  const ThBtn = ({col,children}) => (
    <th onClick={()=>toggleSort(col)}
      className="text-left px-3 py-2.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-ink-200 transition-colors select-none">
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown size={10} className={sortCol===col ? "text-gold-500" : "text-ink-700"}/>
      </span>
    </th>
  );

  return (
    <div className="flex flex-col h-full min-h-screen p-0">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]" style={{ background:"rgba(13,3,7,.5)" }}>
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background:"linear-gradient(135deg,#22c55e,#16a34a)" }}>
          <Plus size={14}/> Nova Receita
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-400 border border-white/10 hover:text-ink-200 hover:border-white/20 transition-all">
          <Filter size={12}/> Filtros
        </button>
        <div className="flex-1"/>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-400 border border-white/10 hover:text-ink-200 transition-all" title="Recibo">
          <Receipt size={12}/> Recibo
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-400 border border-white/10 hover:text-ink-200 transition-all" title="Boleto">
          <BarChart3 size={12}/> Boleto
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-400 border border-white/10 hover:text-ink-200 transition-all">
          <FileText size={12}/> Relatório
        </button>
        <button className="p-2 rounded-lg text-ink-500 hover:text-ink-200 hover:bg-white/5 transition-all" title="Exportar">
          <Download size={15}/>
        </button>
      </div>

      {/* ── Navegação Mês/Ano ── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.04]" style={{ background:"rgba(13,3,7,.3)" }}>
        <div className="flex items-center gap-1">
          <button onClick={()=>setAno(a=>a-1)} className="p-1 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"><ChevronLeft size={16}/></button>
          <span className="text-sm font-bold text-gold-500 min-w-[40px] text-center">{ano}</span>
          <button onClick={()=>setAno(a=>a+1)} className="p-1 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"><ChevronRight size={16}/></button>
        </div>
        <div className="flex gap-1 flex-1 flex-wrap">
          {MESES_ABREV.map((m,i) => (
            <button key={m} onClick={()=>setMes(i)}
              className={cn("px-3 py-1 rounded-full text-[11px] font-bold transition-all",
                i===mes ? "text-white" : "text-ink-500 hover:text-ink-200 hover:bg-white/5")}
              style={i===mes ? { background:"#16a34a" } : {}}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {[["filtRecebido","Recebido",filtRecebido,setFiltRecebido],["filtAReceber","A Receber",filtAReceber,setFiltAReceber]].map(([key,lbl,val,setVal])=>(
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <div onClick={()=>setVal(v=>!v)}
                className={cn("w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                  val ? "bg-success-500 border-success-500 text-white" : "border-ink-500 hover:border-gold-500")}>
                {val && <CheckCircle size={10}/>}
              </div>
              <span className="text-xs text-ink-400">{lbl}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[860px]">
          <thead style={{ background:"rgba(13,3,7,.6)", position:"sticky", top:0, zIndex:10 }}>
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-2.5 w-8">
                <div className="w-4 h-4 rounded border-2 border-ink-600 hover:border-gold-500 cursor-pointer transition-colors"/>
              </th>
              <th className="px-2 py-2.5 w-6">
                <ArrowUpDown size={12} className="text-ink-600"/>
              </th>
              <ThBtn col="descricao">Descrição</ThBtn>
              <ThBtn col="data_vencimento">Vencimento</ThBtn>
              <ThBtn col="valor">A Receber</ThBtn>
              <ThBtn col="valor_pago">Recebido</ThBtn>
              <ThBtn col="data_pagamento">Recebimento</ThBtn>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider">Cliente</th>
              <ThBtn col="categoria">Categoria de Receita</ThBtn>
              <th className="px-3 py-2.5 w-24"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading ? (
              <tr><td colSpan={11} className="py-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:"rgba(34,197,94,.2)", borderTopColor:"#22c55e" }}/>
              </td></tr>
            ) : pagina.length===0 ? (
              <tr><td colSpan={11}><EmptyState onNovo={()=>setModal(true)}/></td></tr>
            ) : (
              pagina.map(l => {
                const recebido = l.status==="pago";
                const vencido  = !recebido && l.data_vencimento < hojeISO;
                const nomeCliente = l.clientes?.nome || clientes.find(c=>c.id===l.cliente_id)?.nome || "—";
                return (
                  <tr key={l.id} className={cn("table-row-hover transition-colors group", recebido && "opacity-60")}>
                    <td className="px-3 py-2.5">
                      <div className="w-4 h-4 rounded border-2 border-ink-600 cursor-pointer hover:border-gold-500 transition-colors"/>
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={()=>marcarRecebido(l.id, l.status)}
                        title={recebido ? "Desfazer recebimento" : "Marcar como recebido"}
                        className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          recebido ? "bg-success-500 border-success-500 text-white" : "border-ink-600 hover:border-success-500")}>
                        {recebido && <CheckCircle size={10}/>}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <p className={cn("font-medium truncate", recebido ? "text-ink-500 line-through" : "text-ink-200")}>{l.descricao}</p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {vencido
                        ? <span className="flex items-center gap-1 text-danger-400 text-xs font-semibold"><AlertTriangle size={11}/>{fmtDate(l.data_vencimento)}</span>
                        : <span className="text-xs text-ink-400">{fmtDate(l.data_vencimento)}</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-danger-400">{fmt(l.valor)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-success-500">{recebido ? fmt(l.valor_pago||l.valor) : "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-ink-400">{recebido ? fmtDate(l.data_pagamento) : "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium",
                        recebido ? "bg-success-500/10 text-success-500 border-success-500/20"
                        : vencido ? "bg-danger-500/10 text-danger-500 border-danger-500/20"
                        : "bg-warn-500/10 text-warn-500 border-warn-500/20")}>
                        {recebido ? "Recebido" : vencido ? "Vencido" : "A Receber"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {nomeCliente !== "—" ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0">
                            <User size={10} className="text-gold-500"/>
                          </div>
                          <span className="text-xs text-ink-300 truncate max-w-[120px]">{nomeCliente}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-600">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-ink-400">{l.categoria || l.categorias_financeiras?.nome || "—"}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>excluir(l.id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-ink-600 hover:text-danger-400 hover:bg-danger-500/10 transition-all">
                          <Trash2 size={12}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginação ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-t border-white/[0.05]" style={{ background:"rgba(13,3,7,.4)" }}>
        <div className="flex items-center gap-1">
          <button onClick={()=>setPage(1)} disabled={pagActual===1} className="p-1 rounded text-ink-500 hover:text-gold-500 disabled:opacity-30 transition-all"><ChevronsLeft size={14}/></button>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={pagActual===1} className="p-1 rounded text-ink-500 hover:text-gold-500 disabled:opacity-30 transition-all"><ChevronLeft size={14}/></button>
          <span className="text-[11px] text-ink-500 mx-2">
            Página <span className="text-ink-200 font-semibold">{pagActual}</span> de <span className="text-ink-200 font-semibold">{totalPags}</span>
          </span>
          <button onClick={()=>setPage(p=>Math.min(totalPags,p+1))} disabled={pagActual===totalPags} className="p-1 rounded text-ink-500 hover:text-gold-500 disabled:opacity-30 transition-all"><ChevronRight size={14}/></button>
          <button onClick={()=>setPage(totalPags)} disabled={pagActual===totalPags} className="p-1 rounded text-ink-500 hover:text-gold-500 disabled:opacity-30 transition-all"><ChevronsRight size={14}/></button>
        </div>
        <button onClick={mutate} className="p-1.5 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"><RefreshCw size={13}/></button>
        <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
          Mostrar
          <div className="relative">
            <select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1);}}
              className="appearance-none bg-dark-100 border border-white/10 rounded px-2 py-1 pr-5 text-[11px] text-ink-200 focus:outline-none cursor-pointer">
              {PAGE_SIZES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"/>
          </div>
        </div>
        <div className="flex-1 text-right">
          <span className="text-[11px] text-ink-600">
            {ordenados.length===0 ? "Não há registros" : `Número de lançamentos ${ordenados.length}`}
          </span>
        </div>
      </div>

      {/* ── Barra de Totais ── */}
      <div className="flex items-center gap-6 px-5 py-2.5 border-t border-white/[0.06]" style={{ background:"rgba(10,2,5,.6)" }}>
        <span className="text-[12px] font-bold">
          <span className="text-ink-500 mr-1">Total à Receber</span>
          <span className="text-danger-400">{fmt(totalAReceber)}</span>
        </span>
        <span className="text-[12px] font-bold">
          <span className="text-ink-500 mr-1">Total Recebido</span>
          <span className="text-success-500">{fmt(totalRecebido)}</span>
        </span>
        <span className="text-[12px] font-bold">
          <span className="text-ink-500 mr-1">Total</span>
          <span className="text-gold-500">{fmt(totalGeral)}</span>
        </span>
        <div className="flex-1"/>
        <span className="text-[11px] text-ink-600">Juros <span className="text-ink-400 font-semibold">R$ 0,00</span></span>
        <span className="text-[11px] text-ink-600">Multa <span className="text-ink-400 font-semibold">R$ 0,00</span></span>
        <span className="text-[11px] text-ink-600">Desconto <span className="text-ink-400 font-semibold">R$ 0,00</span></span>
      </div>

      {modal && <ModalNovaReceita onClose={()=>setModal(false)} onSalvo={mutate} clientes={clientes}/>}
    </div>
  );
}
