"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  formatData, formatCPF, diasRestantes, corPrazo, cn 
} from "@/lib/utils";
import { 
  getDaysInMonth, formatISOLocal, MONTH_NAMES, DAY_NAMES 
} from "@/lib/calendarUtils";
import { 
  CalendarClock, CheckCircle, AlertTriangle, 
  ChevronLeft, ChevronRight, List, Calendar as CalendarIcon,
  Clock, User, ExternalLink
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function PrazosPage() {
  const [prazos, setPrazos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list
  
  // Estado do Calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayISO, setSelectedDayISO] = useState(formatISOLocal(new Date()));

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const carregar = useCallback(async () => {
    setLoading(true);
    // Buscamos um range maior para o calendário (90 dias ou conforme o mês)
    const res = await fetch(`/api/prazos?limit=500`);
    const data = await res.json();
    setPrazos(data);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  async function toggle(id, concluido) {
    await fetch(`/api/prazos/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ concluido: !concluido }),
    });
    carregar();
  }

  // Navegação do Calendário
  const irParaMesAnterior = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const irParaMesProximo = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const irParaHoje = () => {
    const hoje = new Date();
    setCurrentDate(hoje);
    setSelectedDayISO(formatISOLocal(hoje));
  };

  // Cálculo dos dias do mês
  const calendarDays = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);

  // Agrupa prazos por data para facilitar exibição no grid
  const prazosPorData = useMemo(() => {
    const map = {};
    prazos.forEach(p => {
      const d = p.data_prazo;
      if (!map[d]) map[d] = [];
      map[d].push(p);
    });
    return map;
  }, [prazos]);

  // Prazos do dia selecionado
  const prazosDoDia = prazosPorData[selectedDayISO] || [];

  // Renderização do Modo Lista (Original refatorado)
  const renderLista = () => (
    <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/[0.03] animate-in fade-in slide-in-from-bottom-2">
      {prazos.length === 0 ? (
        <p className="p-12 text-center text-sm text-ink-500">Nenhum prazo encontrado.</p>
      ) : (
        prazos.map(p => {
          const dias = diasRestantes(p.data_prazo);
          return (
            <div key={p.id} className={cn("flex items-center gap-4 px-5 py-4 table-row-hover", p.concluido && "opacity-40")}>
              <button
                onClick={() => toggle(p.id, p.concluido)}
                className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  p.concluido
                    ? "bg-success-500 border-success-500 text-white"
                    : dias < 0
                    ? "border-danger-500"
                    : dias <= 3
                    ? "border-warn-500"
                    : "border-ink-600 hover:border-gold-500"
                )}
              >
                {p.concluido && <CheckCircle size={12} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", p.concluido ? "line-through text-ink-500" : "text-ink-200")}>
                  {p.descricao}
                </p>
                <Link href={`/clientes/${p.clientes?.id}`} className="text-xs text-ink-500 hover:text-gold-500 transition-colors flex items-center gap-1">
                   {p.clientes?.nome} <ExternalLink size={10} />
                </Link>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("text-sm font-semibold", p.concluido ? "text-ink-500" : corPrazo(dias))}>
                  {formatData(p.data_prazo)}
                </p>
                {!p.concluido && <p className={cn("text-[11px]", corPrazo(dias))}>{dias === 0 ? "Hoje" : dias < 0 ? `${Math.abs(dias)}d atrás` : `${dias}d`}</p>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-100 flex items-center gap-2">
            <CalendarClock size={24} className="text-gold-500" />
            Agenda de Prazos
          </h1>
          <p className="text-sm text-ink-500 mt-1">Gerencie compromissos e audiências do escritório</p>
        </div>

        <div className="flex items-center gap-2 bg-dark-200/50 p-1 rounded-xl border border-white/[0.05]">
          <button 
            onClick={() => setViewMode("calendar")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", 
              viewMode === "calendar" ? "bg-gold-500 text-dark-400 shadow-lg" : "text-ink-500 hover:text-ink-200")}
          >
            <CalendarIcon size={14} /> Calendário
          </button>
          <button 
            onClick={() => setViewMode("list")}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", 
              viewMode === "list" ? "bg-gold-500 text-dark-400 shadow-lg" : "text-ink-500 hover:text-ink-200")}
          >
            <List size={14} /> Lista
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "list" ? renderLista() : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Calendário Grid */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-card rounded-2xl overflow-hidden overflow-hidden border border-white/[0.05]">
              {/* Controles do Calendário */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-white/[0.01]">
                <h2 className="text-lg font-bold text-ink-100">
                  {MONTH_NAMES[currentMonth]} <span className="text-ink-500 font-normal">{currentYear}</span>
                </h2>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={irParaMesAnterior}>
                    <ChevronLeft size={18} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={irParaHoje} className="text-xs px-3">
                    Hoje
                  </Button>
                  <Button variant="ghost" size="icon" onClick={irParaMesProximo}>
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </div>

              {/* Grid de Dias */}
              <div className="grid grid-cols-7 text-center">
                {DAY_NAMES.map(d => (
                  <div key={d} className="py-2 text-[10px] uppercase tracking-wider font-bold text-ink-600 border-b border-white/[0.03]">
                    {d}
                  </div>
                ))}
                
                {calendarDays.map((cell, idx) => {
                  const iso = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                  const isSelected = selectedDayISO === iso;
                  const isToday = formatISOLocal(new Date()) === iso;
                  const dayPrazos = prazosPorData[iso] || [];
                  const temUrgente = dayPrazos.some(p => !p.concluido && diasRestantes(p.data_prazo) <= 0);
                  const temPendentes = dayPrazos.some(p => !p.concluido);

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDayISO(iso)}
                      className={cn(
                        "relative h-20 sm:h-24 p-2 border-b border-r border-white/[0.03] transition-all flex flex-col items-start group",
                        !cell.isCurrentMonth && "opacity-20 bg-black/10",
                        isSelected && "bg-gold-500/10 ring-1 ring-inset ring-gold-500/30",
                        !isSelected && cell.isCurrentMonth && "hover:bg-white/[0.02]"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                        isToday ? "bg-gold-500 text-dark-400 font-bold" : isSelected ? "text-gold-500" : "text-ink-400 group-hover:text-ink-100"
                      )}>
                        {cell.day}
                      </span>
                      
                      {/* Indicadores de Prazos */}
                      <div className="mt-auto w-full flex flex-wrap gap-0.5">
                        {dayPrazos.slice(0, 3).map(p => (
                          <div 
                            key={p.id} 
                            className={cn(
                              "h-1 rounded-full",
                              p.concluido ? "bg-success-500/50 w-2" : temUrgente ? "bg-danger-500 w-full" : "bg-gold-500 w-full"
                            )} 
                          />
                        ))}
                        {dayPrazos.length > 3 && <div className="text-[9px] text-ink-600 font-bold">+{dayPrazos.length - 3}</div>}
                      </div>

                      {temUrgente && !isSelected && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-danger-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lateral: Detalhes do Dia Selecionado */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card rounded-2xl p-6 border border-white/[0.05] h-full min-h-[400px]">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-ink-500 font-bold mb-1">Agenda para</p>
                <h3 className="text-xl font-bold text-ink-100 flex items-center gap-2">
                  <Clock size={18} className="text-gold-500" />
                  {formatData(selectedDayISO)}
                </h3>
              </div>

              <div className="space-y-4">
                {prazosDoDia.length === 0 ? (
                  <div className="py-12 text-center text-ink-600">
                    <CalendarIcon size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Nenhum compromisso agendado para este dia.</p>
                  </div>
                ) : (
                  prazosDoDia.map(p => {
                    const dias = diasRestantes(p.data_prazo);
                    return (
                      <div key={p.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all flex gap-3 group">
                        <button
                          onClick={() => toggle(p.id, p.concluido)}
                          className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all text-white",
                            p.concluido
                              ? "bg-success-500 border-success-500"
                              : dias < 0
                              ? "border-danger-500"
                              : "border-ink-600 hover:border-gold-500"
                          )}
                        >
                          {p.concluido && <CheckCircle size={12} />}
                        </button>
                        
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                             <Badge variant={p.concluido ? "ativo" : dias < 0 ? "urgente" : "gold"}>
                               {p.concluido ? "Concluído" : dias < 0 ? "Em atraso" : "Pendente"}
                             </Badge>
                             <Link href={`/clientes/${p.clientes?.id}`} title="Ir para o cliente">
                               <ExternalLink size={14} className="text-ink-600 hover:text-gold-500 transition-colors" />
                             </Link>
                          </div>
                          <p className={cn("text-sm font-semibold leading-snug", p.concluido ? "text-ink-500 line-through" : "text-ink-100")}>
                            {p.descricao}
                          </p>
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-ink-500">
                             <span className="flex items-center gap-1"><User size={12} /> {p.clientes?.nome?.split(' ')[0]}</span>
                             <span className="flex items-center gap-1"><Clock size={12} /> {p.criado_por || "Adm"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/[0.05]">
                <p className="text-[10px] text-ink-600 uppercase font-bold text-center">PrevGestão · Agenda de Prazos</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
