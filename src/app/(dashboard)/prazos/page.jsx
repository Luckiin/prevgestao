"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatData, formatCPF, diasRestantes, corPrazo } from "@/lib/utils";
import { CalendarClock, CheckCircle, AlertTriangle, Filter } from "lucide-react";

export default function PrazosPage() {
  const [prazos, setPrazos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro]   = useState("pendentes"); // pendentes | todos | vencidos

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();

    if (filtro === "pendentes") { params.set("concluido", "false"); params.set("dias_ate", "90"); }
    else if (filtro === "vencidos") params.set("concluido", "false");

    const res = await fetch(`/api/prazos?${params}&limit=200`);
    let data  = await res.json();

    if (filtro === "vencidos") {
      const hoje = new Date().toISOString().split("T")[0];
      data = data.filter(p => p.data_prazo < hoje);
    }

    setPrazos(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [filtro]);

  async function toggle(id, concluido) {
    await fetch(`/api/prazos/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ concluido: !concluido }),
    });
    carregar();
  }

  const vencidos  = prazos.filter(p => !p.concluido && diasRestantes(p.data_prazo) < 0).length;
  const hoje_cnt  = prazos.filter(p => !p.concluido && diasRestantes(p.data_prazo) === 0).length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <CalendarClock size={20} className="text-warn-500" />
          Prazos & Agenda
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          {vencidos > 0 && <span className="text-danger-500 font-medium">{vencidos} vencido(s) · </span>}
          {hoje_cnt > 0 && <span className="text-warn-500 font-medium">{hoje_cnt} para hoje · </span>}
          {prazos.length} registro(s)
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "pendentes", label: "Pendentes (90 dias)" },
          { id: "vencidos",  label: "Vencidos" },
          { id: "todos",     label: "Todos" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filtro === f.id
                ? "bg-brand-600/20 text-brand-300 border border-brand-600/30"
                : "text-ink-400 hover:text-ink-200 glass-card"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : prazos.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">Nenhum prazo encontrado.</p>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {prazos.map(p => {
              const dias = diasRestantes(p.data_prazo);
              return (
                <div key={p.id} className={`flex items-center gap-4 px-5 py-4 table-row-hover ${p.concluido ? "opacity-40" : ""}`}>
                  <button
                    onClick={() => toggle(p.id, p.concluido)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      p.concluido
                        ? "bg-success-500 border-success-500 text-white"
                        : dias < 0
                        ? "border-danger-500"
                        : dias <= 3
                        ? "border-warn-500"
                        : "border-ink-600 hover:border-brand-500"
                    }`}
                  >
                    {p.concluido && <CheckCircle size={12} />}
                    {!p.concluido && dias < 0 && <AlertTriangle size={10} className="text-danger-500" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${p.concluido ? "line-through text-ink-500" : "text-ink-200"}`}>
                      {p.descricao}
                    </p>
                    <Link href={`/clientes/${p.clientes?.id}`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                      {p.clientes?.nome} · {formatCPF(p.clientes?.cpf)}
                    </Link>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${p.concluido ? "text-ink-500" : corPrazo(dias)}`}>
                      {formatData(p.data_prazo)}
                    </p>
                    {!p.concluido && (
                      <p className={`text-xs ${corPrazo(dias)}`}>
                        {dias === 0 ? "Hoje" : dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
