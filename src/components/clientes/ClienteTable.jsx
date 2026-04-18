"use client";

import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { formatCPF, formatData, formatMoeda, corStatus } from "@/lib/utils";
import { Eye, Pencil, Trash2, CalendarClock } from "lucide-react";

const statusVariant = {
  "Ativo":     "ativo",
  "Inativo":   "inativo",
  "Concluído": "concluido",
};

export default function ClienteTable({ clientes, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "rgba(201,169,110,.3)", borderTopColor: "#C9A96E" }} />
      </div>
    );
  }

  if (!clientes?.length) {
    return (
      <div className="text-center py-20 text-sm text-ink-500">
        Nenhum cliente encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {["Cliente", "CPF", "Tipo / Subdivisão", "Status", "Situação", "Ano", "Próx. Prazo", ""].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.03]">
          {clientes.map((c) => (
            <tr key={c.id} className="table-row-hover transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-ink-100 leading-none">{c.nome}</p>
                <p className="text-[11px] text-ink-500 mt-1">{c.idade ? `${c.idade} anos` : ""}</p>
              </td>

              <td className="px-4 py-3 text-ink-300 font-mono text-xs whitespace-nowrap">
                {formatCPF(c.cpf)}
              </td>

              <td className="px-4 py-3">
                <p className="text-ink-300 capitalize">{c.tipo_processo}</p>
                {c.subdivisoes?.nome && (
                  <p className="text-[11px] text-ink-500 mt-0.5 truncate max-w-[160px]">
                    {c.subdivisoes.nome}
                  </p>
                )}
              </td>

              <td className="px-4 py-3">
                <Badge variant={statusVariant[c.status] || "neutro"}>
                  {c.status}
                </Badge>
              </td>

              <td className="px-4 py-3">
                <Badge variant={c.situacao === "Finalizado" ? "ativo" : "aviso"}>
                  {c.situacao || "Pendente"}
                </Badge>
              </td>

              <td className="px-4 py-3">
                <span className="text-xs text-ink-400 bg-dark-100/60 px-2 py-0.5 rounded-lg">
                  {c.ano_referencia}
                </span>
              </td>

              <td className="px-4 py-3 text-xs text-ink-400 whitespace-nowrap">
                {c.proximo_prazo ? (
                  <span className="flex items-center gap-1 text-warn-500">
                    <CalendarClock size={12} />
                    {formatData(c.proximo_prazo)}
                  </span>
                ) : (
                  <span className="text-ink-600">—</span>
                )}
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    href={`/clientes/${c.id}`}
                    className="w-7 h-7 flex items-center justify-center rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                    title="Ver detalhes"
                  >
                    <Eye size={13} />
                  </Link>
                  <button
                    onClick={() => onEdit?.(c)}
                    className="w-7 h-7 flex items-center justify-center rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => onDelete?.(c)}
                    className="w-7 h-7 flex items-center justify-center rounded text-ink-500 hover:text-danger-500 hover:bg-danger-500/10 transition-all"
                    title="Excluir"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
