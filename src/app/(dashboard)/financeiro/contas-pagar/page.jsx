"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Filter, RefreshCw, ChevronLeft, ChevronRight,
  ChevronDown, CheckCircle, Trash2, AlertTriangle, X,
  Receipt, FileText, Download, Repeat, SplitSquareHorizontal, Info,
  ChevronsLeft, ChevronsRight, ArrowUpDown, Pencil, User
} from "lucide-react";
import { toast } from "sonner";
import { useLancamentos, useCategorias } from "@/hooks/useFinanceiro";
import AnexoFinanceiro from "@/components/financeiro/AnexoFinanceiro";
import ModalLancamento from "@/components/financeiro/ModalLancamento";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { maskMoeda } from "@/lib/utils";

const MESES_ABREV = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
const PAGE_SIZES = [25, 50, 100];

const fmt = (v) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v||0);
const fmtDate = (d) => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "—";

function cn(...c) { return c.filter(Boolean).join(" "); }


function EmptyState({ onNovo }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
        <ellipse cx="60" cy="82" rx="50" ry="5" fill="rgba(201,169,110,0.06)" />
        <path d="M20 75 Q35 40 55 35 Q65 32 75 40 Q90 50 100 75" stroke="rgba(201,169,110,0.15)" strokeWidth="1.5" fill="rgba(13,3,7,0.4)" />
        <path d="M38 75 Q48 48 60 42 Q72 48 82 75" stroke="rgba(201,169,110,0.2)" strokeWidth="1.5" fill="rgba(30,13,18,0.6)" />
        <path d="M52 75 Q57 55 60 50 Q63 55 68 75" stroke="rgba(201,169,110,0.3)" strokeWidth="1" fill="rgba(42,21,27,0.8)" />

        <line x1="60" y1="50" x2="60" y2="36" stroke="#C9A96E" strokeWidth="1.2"/>
        <path d="M60 36 L68 40 L60 44 Z" fill="#C9A96E" opacity="0.7"/>

        <circle cx="60" cy="49" r="3" fill="#C9A96E" opacity="0.5"/>
        <line x1="60" y1="52" x2="60" y2="60" stroke="#C9A96E" strokeWidth="1.2" opacity="0.5"/>
        <line x1="56" y1="55" x2="60" y2="53" stroke="#C9A96E" strokeWidth="1" opacity="0.5"/>
        <line x1="64" y1="55" x2="60" y2="53" stroke="#C9A96E" strokeWidth="1" opacity="0.5"/>
      </svg>
      <p className="text-sm text-ink-400 font-medium">Nenhum registro localizado.</p>
      <p className="text-xs text-ink-600">
        Clique em <button onClick={onNovo} className="text-gold-500 hover:underline font-semibold">Novo +</button> para incluir um novo registro.
      </p>
    </div>
  );
}


export default function ContasPagar() {
  const hoje    = new Date();
  const [ano,   setAno]   = useState(hoje.getFullYear());
  const [mes,   setMes]   = useState(hoje.getMonth());
  const [filtPago,    setFiltPago]    = useState(true);
  const [filtAPagar,  setFiltAPagar]  = useState(true);
  const [modal,   setModal]   = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [pageSize, setPageSize] = useState(50);
  const [page,     setPage]    = useState(1);
  const [sortCol,  setSortCol] = useState("data_vencimento");
  const [sortAsc,  setSortAsc] = useState(true);
  const [selecionados, setSelecionados] = useState(new Set());

  const mesISO = `${ano}-${String(mes+1).padStart(2,"0")}`;

  const { lancamentos: dados, isLoading, mutate } = useLancamentos({ tipo: 'despesa', mes: mesISO, limit: 500 });

  useEffect(() => {
    fetch(`/api/clientes?limit=500&status=ativo`)
      .then(r => r.json())
      .then(j => setClientes(j?.data || j || []))
      .catch(() => {});
  }, []);

  async function marcarPago(id, statusAtual) {
    const novoStatus = statusAtual === "pago" ? "pendente" : "pago";
    try {
      await fetch(`/api/financeiro/lancamentos/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ status:novoStatus, data_pagamento: novoStatus==="pago" ? hoje.toISOString().slice(0,10) : null }),
      });
      toast.success(novoStatus==="pago" ? "Marcado como pago!" : "Reaberto como pendente");
      mutate();
    } catch { toast.error("Erro."); }
  }

  async function confirmarExclusao() {
    if (!excluindoId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/financeiro/lancamentos/${excluindoId}`, { method:"DELETE" });
      toast.success("Lançamento excluído com sucesso.");
      mutate();
    } catch {
      toast.error("Erro ao excluir lançamento.");
    } finally {
      setIsDeleting(false);
      setExcluindoId(null);
    }
  }


  const filtrados = useMemo(() => {
    return dados.filter(l => {
      if (l.status === "pago"     && !filtPago)   return false;
      if (l.status !== "pago"     && !filtAPagar) return false;
      return true;
    });
  }, [dados, filtPago, filtAPagar]);


  const ordenados = useMemo(() => {
    return [...filtrados].sort((a,b) => {
      let va = a[sortCol] ?? "", vb = b[sortCol] ?? "";
      if (typeof va === "number") return sortAsc ? va-vb : vb-va;
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [filtrados, sortCol, sortAsc]);


  const totalPags  = Math.max(1, Math.ceil(ordenados.length / pageSize));
  const pagActual  = Math.min(page, totalPags);
  const inicio     = (pagActual-1)*pageSize;
  const pagina     = ordenados.slice(inicio, inicio+pageSize);

  function toggleSort(col) {
    if (sortCol===col) setSortAsc(a=>!a);
    else { setSortCol(col); setSortAsc(true); }
  }

  function toggleUm(id) {
    const s = new Set(selecionados);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelecionados(s);
  }

  function toggleAll() {
    if (selecionados.size === pagina.length && pagina.length > 0) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(pagina.map(l => l.id)));
    }
  }


  const totalAPagar  = filtrados.filter(l=>l.status!=="pago").reduce((s,l)=>s+(l.valor||0),0);
  const totalPagoVal = filtrados.filter(l=>l.status==="pago").reduce((s,l)=>s+(l.valor_pago||l.valor||0),0);
  const totalGeral   = filtrados.reduce((s,l)=>s+(l.valor||0),0);
  const hojeISO      = hoje.toISOString().slice(0,10);

  const ThBtn = ({col,children}) => (
    <th className="text-left px-3 py-2.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-ink-200 transition-colors select-none"
      onClick={()=>toggleSort(col)}>
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown size={10} className={sortCol===col ? "text-gold-500" : "text-ink-700"} />
      </span>
    </th>
  );

  return (
    <div className="flex flex-col h-full min-h-screen p-0">


      <div className="flex items-center gap-2 px-5 py-3 border-b border-light/5 dark:border-white/[0.05] bg-dark-300 glass-card">
        <button onClick={()=>setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background:"linear-gradient(135deg,#C9A96E,#b08840)" }}>
          <Plus size={14}/> Nova Despesa
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-400 border border-white/10 hover:text-ink-200 hover:border-white/20 transition-all">
          <Filter size={12}/> Filtros
        </button>
        <div className="flex-1"/>
        <button className="p-2 rounded-lg text-ink-500 hover:text-ink-200 hover:bg-white/5 transition-all" title="Recibo">
          <Receipt size={15}/>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-ink-400 border border-white/10 hover:text-ink-200 transition-all">
          <FileText size={12}/> Relatório
        </button>
        <button className="p-2 rounded-lg text-ink-500 hover:text-ink-200 hover:bg-white/5 transition-all" title="Exportar">
          <Download size={15}/>
        </button>
      </div>


      <div className="flex items-center gap-3 px-5 py-3 border-b border-light/5 dark:border-white/[0.04] bg-dark-200">

        <div className="flex items-center gap-1">
          <button onClick={()=>setAno(a=>a-1)} className="p-1 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"><ChevronLeft size={16}/></button>
          <span className="text-sm font-bold text-gold-500 min-w-[40px] text-center">{ano}</span>
          <button onClick={()=>setAno(a=>a+1)} className="p-1 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"><ChevronRight size={16}/></button>
        </div>


        <div className="flex gap-1 flex-1 flex-wrap">
          {MESES_ABREV.map((m,i) => {
            const isAtivo = i===mes;
            return (
              <button key={m} onClick={()=>setMes(i)}
                className={cn("px-3 py-1 rounded-full text-[11px] font-bold transition-all",
                  isAtivo
                    ? "text-white"
                    : "text-ink-500 hover:text-ink-200 hover:bg-white/5"
                )}
                style={isAtivo ? { background:"#16a34a" } : {}}>
                {m}
              </button>
            );
          })}
        </div>


        <div className="flex items-center gap-3">
          {[["filtPago","Pago",filtPago,setFiltPago],["filtAPagar","A Pagar",filtAPagar,setFiltAPagar]].map(([key,lbl,val,setVal])=>(
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


      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead className="bg-dark-300 sticky top-0 z-10 glass-card">
            <tr className="border-b border-white/[0.06]">
              <th className="px-3 py-2.5 w-8">
                <div onClick={toggleAll} className={cn("w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer",
                  selecionados.size > 0 && selecionados.size === pagina.length ? "bg-gold-500 border-gold-500 text-dark-300" :
                  selecionados.size > 0 ? "bg-gold-500/20 border-gold-500 text-gold-500" : "border-ink-600 hover:border-gold-500"
                )}>
                  {selecionados.size > 0 && <CheckCircle size={10} />}
                </div>
              </th>
              <th className="px-2 py-2.5 w-6">
                <ArrowUpDown size={12} className="text-ink-600"/>
              </th>
              <ThBtn col="descricao">Descrição</ThBtn>
              <ThBtn col="data_vencimento">Vencimento</ThBtn>
              <ThBtn col="valor">A Pagar</ThBtn>
              <ThBtn col="valor_pago">Pago</ThBtn>
              <ThBtn col="data_pagamento">Pagamento</ThBtn>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider">Tipo</th>
              <th className="text-left px-3 py-2.5 text-[11px] font-bold text-ink-500 uppercase tracking-wider">Cliente</th>
              <ThBtn col="categoria">Categoria de Despesa</ThBtn>
              <th className="px-3 py-2.5 w-20"/>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {isLoading ? (
              <tr><td colSpan={11} className="py-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor:"rgba(201,169,110,.3)", borderTopColor:"#C9A96E" }}/>
              </td></tr>
            ) : pagina.length === 0 ? (
              <tr><td colSpan={11}><EmptyState onNovo={()=>setModal(true)}/></td></tr>
            ) : (
              pagina.map(l => {
                const pago     = l.status === "pago";
                const vencido  = !pago && l.data_vencimento < hojeISO;
                const nomeCliente = l.clientes?.nome || clientes.find(c=>c.id===l.cliente_id)?.nome || "—";
                return (
                  <tr key={l.id} className={cn("table-row-hover transition-colors group", pago && "opacity-60", selecionados.has(l.id) && "bg-gold-500/5")}>
                    <td className="px-3 py-2.5">
                      <div onClick={()=>toggleUm(l.id)} className={cn("w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition-colors",
                        selecionados.has(l.id) ? "bg-gold-500 border-gold-500 text-dark-300" : "border-ink-600 hover:border-gold-500"
                      )}>
                        {selecionados.has(l.id) && <CheckCircle size={10}/>}
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <button onClick={()=>marcarPago(l.id, l.status)}
                        title={pago ? "Desfazer pagamento" : "Marcar como pago"}
                        className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          pago ? "bg-success-500 border-success-500 text-white" : "border-ink-600 hover:border-success-500")}>
                        {pago && <CheckCircle size={10}/>}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <p className={cn("font-medium truncate", pago ? "text-ink-500 line-through" : "text-ink-200")}>{l.descricao}</p>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {vencido
                        ? <span className="flex items-center gap-1 text-danger-400 text-xs font-semibold"><AlertTriangle size={11}/>{fmtDate(l.data_vencimento)}</span>
                        : <span className="text-xs text-ink-400">{fmtDate(l.data_vencimento)}</span>
                      }
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-danger-400">{fmt(l.valor)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-success-500">{pago ? fmt(l.valor_pago||l.valor) : "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs text-ink-400">{pago ? fmtDate(l.data_pagamento) : "—"}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full border font-medium",
                        pago ? "bg-success-500/10 text-success-500 border-success-500/20" : vencido ? "bg-danger-500/10 text-danger-500 border-danger-500/20" : "bg-warn-500/10 text-warn-500 border-warn-500/20")}>
                        {pago ? "Pago" : vencido ? "Vencido" : "A Pagar"}
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
                        <button onClick={()=>setModal(l)}
                          className="w-6 h-6 flex items-center justify-center rounded text-ink-600 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
                          <Pencil size={12}/>
                        </button>
                        <button onClick={()=>setExcluindoId(l.id)}
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


      <div className="flex items-center gap-3 px-5 py-2.5 border-t border-light/5 dark:border-white/[0.05] bg-dark-100">
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
            {ordenados.length === 0 ? "Não há registros" : `${ordenados.length} registro(s)`}
          </span>
        </div>
      </div>


      <div className="flex items-center gap-6 px-5 py-2.5 border-t border-light/5 dark:border-white/[0.06] bg-dark-300">
        <span className="text-[12px] font-bold">
          <span className="text-ink-500 mr-1">Total à Pagar</span>
          <span className="text-danger-400">{fmt(totalAPagar)}</span>
        </span>
        <span className="text-[12px] font-bold">
          <span className="text-ink-500 mr-1">Total Pago</span>
          <span className="text-success-500">{fmt(totalPagoVal)}</span>
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

      {modal && <ModalLancamento tipo="despesa" original={typeof modal === 'object' ? modal : null} onClose={()=>setModal(false)} onSalvo={mutate}/>}


      <Modal open={!!excluindoId} onClose={() => !isDeleting && setExcluindoId(null)} title="Excluir despesa" size="sm">
        <p className="text-sm text-ink-300 mb-6">
          Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setExcluindoId(null)} disabled={isDeleting}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarExclusao} loading={isDeleting}>Excluir Agora</Button>
        </div>
      </Modal>
    </div>
  );
}
