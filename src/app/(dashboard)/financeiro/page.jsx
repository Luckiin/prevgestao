"use client";

import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, Label as RechartsLabel
} from "recharts";
import {
  DollarSign, TrendingDown, TrendingUp, AlertTriangle, RefreshCw,
  Plus, X, CheckCircle, ChevronDown, Repeat, SplitSquareHorizontal, Info,
  ArrowDownCircle, ArrowUpCircle, List, BarChart2, FileText, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceiroDashboard, useLancamentos } from "@/hooks/useFinanceiro";

const MESES      = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const MESES_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const fmt        = (v) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v || 0);
const fmtShort   = (v) => v >= 1000 ? `R$${(v/1000).toFixed(0)}k` : `R$${(v||0).toFixed(0)}`;

const CATS_DESPESA = ["Alimentação","Educação","Lazer","Moradia","Pagamentos","Roupas","Saúde","Transporte"];
const CATS_RECEITA = ["Investimento","Prêmios","Outros","Salário","Serviço"];
const CORES        = ["#C9A96E","#22c55e","#8b5cf6","#f97316","#06b6d4","#ec4899","#84cc16","#f59e0b","#14b8a6","#ef4444"];

function cn(...c) { return c.filter(Boolean).join(" "); }

// ── Tooltip personalizado ────────────────────────────────────────────────────
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#14050a", border:"1px solid rgba(201,169,110,.2)", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <p style={{ color:"#f5f0e8", fontWeight:600, marginBottom:2 }}>{payload[0].name}</p>
      <p style={{ color:"#C9A96E" }}>{fmt(payload[0].value)}</p>
    </div>
  );
}

// ── Label central do donut ───────────────────────────────────────────────────
function CenterLabel({ viewBox, total, linha1 }) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#8a7280" fontSize="11" fontFamily="Inter, sans-serif">
        {linha1}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#f5f0e8" fontSize="14" fontWeight="700" fontFamily="Inter, sans-serif">
        {fmt(total)}
      </text>
    </g>
  );
}

// ── Modal de Lançamento ──────────────────────────────────────────────────────
function ModalLancamento({ tipo, onClose, onSalvo }) {
  const [tab, setTab]       = useState("lancamento");
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    descricao:"", categoria:"", cliente_id:"", pessoa:"",
    data_vencimento: new Date().toISOString().slice(0,10),
    valor:"", recorrente:false, parcelado:false, mais_info:false,
    quitado:false, data_pagamento: new Date().toISOString().slice(0,10),
    conta:"", juros_multa:"", desconto:"", valor_pago:"",
  });

  // Clientes podem ser transformados em hook também, mas mantendo para foco no financeiro
  useState(() => {
    if (tipo === "receita") {
      fetch("/api/clientes?limit=500&status=ativo")
        .then(r => r.json())
        .then(j => setClientes(j?.data || j || []))
        .catch(() => {});
    }
  }, [tipo]);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  const isDespesa   = tipo === "despesa";
  const accentColor = isDespesa ? "#ef4444" : "#22c55e";
  const cats        = isDespesa ? CATS_DESPESA : CATS_RECEITA;

  async function salvar() {
    if (!form.descricao || !form.valor) { toast.error("Preencha descrição e valor."); return; }
    setSaving(true);
    try {
      const payload = {
        tipo, descricao: form.descricao, categoria: form.categoria,
        data_vencimento: form.data_vencimento,
        valor: parseFloat(form.valor.replace(",",".")),
        status: form.quitado ? "pago" : "pendente",
        data_pagamento: form.quitado ? form.data_pagamento : null,
        valor_pago: form.quitado && form.valor_pago ? parseFloat(form.valor_pago.replace(",",".")) : null,
        observacao: form.mais_info ? `Juros: ${form.juros_multa||0} | Desconto: ${form.desconto||0}` : null,
      };
      const res = await fetch("/api/financeiro/lancamentos", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(`${isDespesa ? "Despesa" : "Receita"} cadastrada!`);
      onSalvo?.(); onClose();
    } catch { toast.error("Erro ao salvar."); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,.75)", backdropFilter:"blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ background:"#1e0d12", border:`1px solid ${accentColor}35` }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]" style={{ background:`${accentColor}12` }}>
          <div className="flex items-center gap-3">
            {isDespesa ? <ArrowDownCircle size={20} style={{color:accentColor}} /> : <ArrowUpCircle size={20} style={{color:accentColor}} />}
            <h2 className="text-base font-bold text-ink-100">Incluindo Nova {isDespesa ? "Despesa" : "Receita"}</h2>
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
            <div>
              <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Descrição</label>
              <input type="text" value={form.descricao} onChange={e => set("descricao",e.target.value)}
                placeholder={isDespesa ? "Ex: Aluguel escritório..." : "Ex: Honorários cliente..."}
                className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Categoria</label>
                <div className="relative">
                  <select value={form.categoria} onChange={e => set("categoria",e.target.value)}
                    className="w-full appearance-none bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all">
                    <option value="">Selecionar...</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{isDespesa ? "Fornecedor" : "Cliente"}</label>
                {isDespesa ? (
                  <input type="text" value={form.pessoa} onChange={e => set("pessoa",e.target.value)}
                    placeholder="Fornecedor"
                    className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                ) : (
                  <div className="relative">
                    <select value={form.cliente_id} onChange={e => set("cliente_id",e.target.value)}
                      className="w-full appearance-none bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 pr-8 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all">
                      <option value="">Selecione o cliente</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Data de Vencimento</label>
                <input type="date" value={form.data_vencimento} onChange={e => set("data_vencimento",e.target.value)}
                  className="w-full bg-dark-100 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{isDespesa ? "Valor a Pagar" : "Valor a Receber"}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">R$</span>
                  <input type="text" value={form.valor} onChange={e => set("valor",e.target.value)} placeholder="0,00"
                    className="w-full bg-dark-100 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[["recorrente","Recorrente",Repeat],["parcelado","Parcelado",SplitSquareHorizontal],["mais_info","Mais informações",Info]].map(([k,label,Icon]) => (
                <button key={k} type="button" onClick={() => set(k,!form[k])}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    form[k] ? "bg-gold-500/15 border-gold-500/40 text-gold-500" : "bg-dark-100 border-white/10 text-ink-500 hover:text-ink-200")}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>

            {form.mais_info && (
              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                {[["juros_multa","Juros/Multa"],["desconto","Desconto"]].map(([k,label]) => (
                  <div key={k}>
                    <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">R$</span>
                      <input type="text" value={form[k]} onChange={e => set(k,e.target.value)} placeholder="0,00"
                        className="w-full bg-dark-100 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/[0.06]" />

            <label className="flex items-center gap-3 cursor-pointer group">
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
                <div>
                  <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">Conta</label>
                  <div className="relative">
                    <select value={form.conta} onChange={e => set("conta",e.target.value)}
                      className="w-full appearance-none bg-dark-100 border border-white/10 rounded-xl px-3 py-2 text-sm text-ink-200 focus:outline-none focus:border-gold-500/50 transition-all">
                      <option value="">Selecionar...</option>
                      <option>Conta Corrente</option><option>Caixa</option><option>Poupança</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-1.5">{isDespesa ? "Valor Pago" : "Valor Recebido"}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-500">R$</span>
                    <input type="text" value={form.valor_pago} onChange={e => set("valor_pago",e.target.value)} placeholder={form.valor || "0,00"}
                      className="w-full bg-dark-100 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-ink-200 placeholder-ink-600 focus:outline-none focus:border-gold-500/50 transition-all" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center h-48 text-ink-600">
            <Info size={28} className="mb-3 opacity-30" />
            <p className="text-sm">Anexo de documentos em breve.</p>
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

// ── Seção Despesas / Receitas do mês ─────────────────────────────────────────
function SecaoMes({ tipo, lancamentos, loading, onAbrirModal, onRecarregar }) {
  const [viewTab, setViewTab] = useState("grafico");
  const isDespesa   = tipo === "despesa";
  const accentColor = isDespesa ? "#ef4444" : "#22c55e";
  const titulo      = isDespesa ? "Despesas" : "Receitas";
  const Icon        = isDespesa ? ArrowDownCircle : ArrowUpCircle;
  const mesNome     = MESES_FULL[new Date().getMonth()];

  // Lançamentos quitados — estes aparecem no gráfico
  const quitados = lancamentos.filter(l => l.status === "pago");
  const totalQuitado = quitados.reduce((s, l) => s + (l.valor_pago || l.valor || 0), 0);

  // Dados do donut agrupados por categoria (apenas quitados)
  const dadosPie = (() => {
    const mapa = {};
    quitados.forEach(l => {
      const cat = l.categoria || "Outros";
      mapa[cat] = (mapa[cat] || 0) + (l.valor_pago || l.valor || 0);
    });
    return Object.entries(mapa).map(([name, value]) => ({ name, value }));
  })();

  // Donut vazio — exibe anel cinza sem valor
  const pieData = dadosPie.length > 0 ? dadosPie : [{ name: "_empty", value: 1 }];
  const isEmpty  = dadosPie.length === 0;

  async function toggleStatus(id, statusAtual) {
    const novoStatus = statusAtual === "pago" ? "pendente" : "pago";
    try {
      await fetch(`/api/financeiro/lancamentos/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          status: novoStatus,
          data_pagamento: novoStatus === "pago" ? new Date().toISOString().slice(0,10) : null,
        }),
      });
      toast.success(novoStatus === "pago" ? "Marcado como quitado!" : "Reaberto como pendente");
      onRecarregar();
    } catch { toast.error("Erro ao atualizar."); }
  }

  async function excluir(id) {
    if (!confirm("Excluir este lançamento?")) return;
    try {
      await fetch(`/api/financeiro/lancamentos/${id}`, { method:"DELETE" });
      toast.success("Excluído."); onRecarregar();
    } catch { toast.error("Erro ao excluir."); }
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col min-h-[340px]">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: accentColor }} />
          <h3 className="text-sm font-bold text-ink-100">
            {titulo} de <span className="capitalize">{mesNome}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {/* Tabs de visualização */}
          {[["detalhe","Detalhe",List],["grafico","Gráfico",BarChart2]].map(([k,label,TabIcon]) => (
            <button key={k} onClick={() => setViewTab(k)}
              className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all",
                viewTab===k ? "bg-white/10 text-ink-100" : "text-ink-500 hover:text-ink-200")}>
              <TabIcon size={11} />{label}
            </button>
          ))}
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-ink-500 hover:text-ink-200 transition-all">
            <FileText size={11} />Relatório
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onClick={onRecarregar} title="Atualizar"
            className="p-1.5 rounded-lg text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
            <RefreshCw size={12} />
          </button>
          <button onClick={onAbrirModal} title="Novo lançamento"
            className="p-1.5 rounded-lg text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:"rgba(201,169,110,.3)", borderTopColor:"#C9A96E" }} />
        </div>
      ) : viewTab === "grafico" ? (
        /* ═══ Visão Gráfico ═══ */
        <div className="flex flex-col items-center px-6 pt-2 pb-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={68} outerRadius={98}
                paddingAngle={isEmpty ? 0 : (dadosPie.length > 1 ? 3 : 0)}
                dataKey="value"
                stroke="transparent"
                startAngle={90} endAngle={-270}
                animationBegin={0}
                animationDuration={600}
              >
                <RechartsLabel content={({ viewBox }) => (
                  <CenterLabel
                    viewBox={viewBox}
                    total={totalQuitado}
                    linha1={`${titulo} de ${mesNome.slice(0,3)}`}
                  />
                )} position="center" />
                {pieData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={isEmpty ? "rgba(255,255,255,0.05)" : CORES[idx % CORES.length]}
                  />
                ))}
              </Pie>
              {!isEmpty && <CustomTooltip />}
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda de categorias */}
          {!isEmpty ? (
            <div className="w-full grid grid-cols-2 gap-x-6 gap-y-2.5 mt-1">
              {dadosPie.map((d, idx) => (
                <div key={d.name} className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CORES[idx % CORES.length] }} />
                  <span className="text-[11px] text-ink-400 truncate flex-1">{d.name}</span>
                  <span className="text-[11px] text-ink-200 font-semibold">{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <button onClick={onAbrirModal}
              className="mt-1 flex flex-col items-center gap-2 py-3 text-ink-600 hover:text-ink-400 transition-colors group">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-gold-500/50 transition-colors">
                <Plus size={14} />
              </div>
              <span className="text-xs">+ Adicione sua primeira {isDespesa ? "despesa" : "receita"}</span>
            </button>
          )}

          {/* Totalizador pendentes vs quitados */}
          {lancamentos.length > 0 && (
            <div className="w-full mt-4 pt-3 border-t border-white/[0.05] grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-ink-600">Quitado</span>
                <span className="font-semibold" style={{ color: accentColor }}>{fmt(totalQuitado)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Pendente</span>
                <span className="font-semibold text-ink-400">
                  {fmt(lancamentos.filter(l=>l.status!=="pago").reduce((s,l)=>s+(l.valor||0),0))}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ═══ Visão Detalhe ═══ */
        <div className="flex flex-col flex-1">
          {lancamentos.length === 0 ? (
            <button onClick={onAbrirModal}
              className="flex-1 flex flex-col items-center justify-center gap-2 py-12 text-ink-600 hover:text-ink-400 transition-colors group">
              <div className="w-9 h-9 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-gold-500/50 transition-colors">
                <Plus size={15} />
              </div>
              <span className="text-xs">+ Adicione sua primeira {isDespesa ? "despesa" : "receita"}</span>
            </button>
          ) : (
            <>
              <div className="divide-y divide-white/[0.03] flex-1">
                {lancamentos.map(l => {
                  const pago = l.status === "pago";
                  return (
                    <div key={l.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.015] transition-colors group">
                      <button onClick={() => toggleStatus(l.id, l.status)}
                        title={pago ? "Desfazer" : "Marcar como quitado"}
                        className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          pago ? "bg-success-500 border-success-500 text-white" : "border-ink-600 hover:border-gold-500")}>
                        {pago && <CheckCircle size={11} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", pago ? "text-ink-500 line-through" : "text-ink-200")}>
                          {l.descricao}
                        </p>
                        <p className="text-[11px] text-ink-600">{l.categoria || "Sem categoria"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold" style={{ color: pago ? "#5c4f54" : accentColor }}>
                          {fmt(l.valor_pago || l.valor)}
                        </p>
                        <p className="text-[10px] text-ink-600">
                          {pago ? "Quitado" : `Vence ${new Date(l.data_vencimento+"T00:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"})}`}
                        </p>
                      </div>
                      <button onClick={() => excluir(l.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-ink-600 hover:text-danger-500 transition-all flex-shrink-0">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-3 border-t border-white/[0.05] flex items-center justify-between">
                <button onClick={onAbrirModal}
                   className="text-xs text-ink-500 hover:text-gold-500 transition-colors flex items-center gap-1">
                  <Plus size={11} /> Adicionar novo
                </button>
                <span className="text-[11px] text-ink-500">
                  Total: <span className="text-ink-200 font-semibold">{fmt(lancamentos.reduce((s,l)=>s+(l.valor||0),0))}</span>
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard principal ──────────────────────────────────────────────────────
export default function FinanceiroDashboard() {
  const [modal, setModal]       = useState(null);
  const mesISO = new Date().toISOString().slice(0,7);
  const mesAtual = new Date().toLocaleString("pt-BR", { month:"long", year:"numeric" });

  const { dashboard: d, isLoading: loadDash, mutate: mutDash } = useFinanceiroDashboard();
  const { lancamentos: despesas, isLoading: loadDesp, mutate: mutDesp } = useLancamentos({ tipo: 'despesa', mes: mesISO, limit: 50 });
  const { lancamentos: receitas, isLoading: loadRec, mutate: mutRec } = useLancamentos({ tipo: 'receita', mes: mesISO, limit: 50 });

  const loading = loadDash;
  const lancLoading = loadDesp || loadRec;

  function recarregar() { 
    mutDash(); 
    mutDesp(); 
    mutRec(); 
  }

  const grafico = MESES.map((mes,i) => ({
    mes,
    Receita: d?.grafico_receitas?.[i] || 0,
    Despesa: d?.grafico_despesas?.[i] || 0,
  }));

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
            <DollarSign size={20} className="text-gold-500" /> Financeiro
          </h1>
          <p className="text-sm text-ink-500 mt-0.5">Resumo financeiro do escritório</p>
        </div>
        <button onClick={recarregar} className="p-2 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
          <RefreshCw size={15} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:"rgba(201,169,110,.3)", borderTopColor:"#C9A96E" }} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label:"Saldo Atual", value:fmt(d?.saldo_atual),    icon:DollarSign,    color:"#C9A96E", bg:"rgba(201,169,110,.1)" },
              { label:"A Receber",   value:fmt(d?.a_receber_mes),  icon:TrendingUp,    color:"#22c55e", bg:"rgba(34,197,94,.1)"   },
              { label:"A Pagar",     value:fmt(d?.a_pagar_mes),    icon:TrendingDown,  color:"#ef4444", bg:"rgba(239,68,68,.1)"   },
              { label:"Vencidos",    value:d?.vencidos_pagar||0,   icon:AlertTriangle, color:"#f59e0b", bg:"rgba(245,158,11,.1)", suffix:" conta(s)" },
            ].map(c => (
              <div key={c.label} className="glass-card rounded-2xl p-5 flex items-start gap-4">
                <div style={{ width:40, height:40, borderRadius:10, background:c.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <c.icon size={18} style={{ color:c.color }} />
                </div>
                <div>
                  <p className="text-xs text-ink-500 mb-1">{c.label}</p>
                  <p className="text-2xl font-bold text-ink-100 leading-none">{c.value}{c.suffix||""}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Gráfico anual */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-ink-200 mb-4">Despesas e Receitas de {new Date().getFullYear()}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={grafico} margin={{ top:5, right:10, left:-10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" />
                <XAxis dataKey="mes" tick={{ fill:"#8a7280", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtShort} tick={{ fill:"#8a7280", fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background:"#14050a", border:"1px solid rgba(201,169,110,.15)", borderRadius:8, fontSize:12 }} />
                <Legend wrapperStyle={{ fontSize:12, color:"#b09aa2" }} />
                <Line type="monotone" dataKey="Receita" stroke="#22c55e" strokeWidth={2} dot={{ r:3, fill:"#22c55e" }} />
                <Line type="monotone" dataKey="Despesa" stroke="#ef4444" strokeWidth={2} dot={{ r:3, fill:"#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Resumo do mês */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { titulo:"Pagamentos",   sub:mesAtual, itens:[
                { l:"À Pagar",   v:fmt(d?.a_pagar_mes),    c:"#ef4444" },
                { l:"Pago",      v:fmt(d?.pago_mes),       c:"#22c55e" },
                { l:"Em Atraso", v:d?.vencidos_pagar||0,   c:"#f59e0b", suf:" conta(s)" },
              ]},
              { titulo:"Recebimentos", sub:mesAtual, itens:[
                { l:"À Receber", v:fmt(d?.a_receber_mes),  c:"#ef4444" },
                { l:"Recebido",  v:fmt(d?.recebido_mes),   c:"#22c55e" },
                { l:"Em Atraso", v:"—",                    c:"#f59e0b" },
              ]},
              { titulo:"Saldos",       sub:mesAtual, itens:[
                { l:"Realizado",  v:fmt(d?.saldo_realizado_mes), c:"#C9A96E" },
                { l:"Previsto",   v:fmt(d?.saldo_previsto_mes),  c:"#b09aa2" },
              ]},
            ].map(card => (
              <div key={card.titulo} className="glass-card rounded-2xl p-5">
                <div className="flex items-baseline gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-ink-200">{card.titulo}</h3>
                  <span className="text-xs text-ink-500 capitalize">{card.sub}</span>
                </div>
                <div className="flex gap-6">
                  {card.itens.map(it => (
                    <div key={it.l}>
                      <p className="text-[11px] text-ink-500 mb-1">{it.l}</p>
                      <p className="text-base font-bold" style={{ color:it.c }}>{it.v}{it.suf||""}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SecaoMes tipo="despesa" lancamentos={despesas} loading={lancLoading}
              onAbrirModal={() => setModal("despesa")} onRecarregar={recarregar} />
            <SecaoMes tipo="receita" lancamentos={receitas} loading={lancLoading}
              onAbrirModal={() => setModal("receita")} onRecarregar={recarregar} />
          </div>
        </>
      )}

      {modal && (
        <ModalLancamento tipo={modal} onClose={() => setModal(null)} onSalvo={recarregar} />
      )}
    </div>
  );
}
