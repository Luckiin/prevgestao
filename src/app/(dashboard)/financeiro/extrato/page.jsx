"use client";

import { useState } from "react";
import { FileText, RefreshCw, CheckCircle } from "lucide-react";
import { useMovimentacoes, useContas } from "@/hooks/useFinanceiro";
import { toast } from "sonner";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

export default function Extrato() {
  const hoje = new Date();
  const inicioDefault = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
  const fimDefault    = hoje.toISOString().split("T")[0];

  const [inicio,  setInicio]  = useState(inicioDefault);
  const [fim,     setFim]     = useState(fimDefault);

  const { movimentacoes: movs, isLoading: loadingMovs, mutate } = useMovimentacoes({
    data_inicio: inicio,
    data_fim: fim,
    limit: 500
  });

  const loading = loadingMovs;

  async function conciliar(id, val) {
    mutate(
      (current) => {
        const list = current?.data || current || [];
        return list.map((m) => m.id === id ? { ...m, conciliado: !val } : m);
      },
      { revalidate: false }
    );

    try {
      const res = await fetch(`/api/financeiro/movimentacoes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conciliado: !val })
      });
      if (!res.ok) throw new Error();
      toast.success(val ? "Conciliação removida" : "Movimentação conciliada");
      mutate();
    } catch {
      toast.error("Erro ao conciliar");
      mutate();
    }
  }

  const totalEntrada  = movs.filter(m => m.tipo === "entrada").reduce((s, m) => s + m.valor, 0);
  const totalSaida    = movs.filter(m => m.tipo === "saida").reduce((s, m) => s + m.valor, 0);
  const saldoPeriodo  = totalEntrada - totalSaida;

  // ── PDF Exportação ────────────────────────────────────────────────────────
  function exportarPDF() {
    const movsOrdenados = [...movs].sort((a, b) => a.data_movimento > b.data_movimento ? 1 : -1);
    let saldoAcumulado = 0;

    const linhas = movsOrdenados.map((m, i) => {
      const entrada = m.tipo === "entrada" ? m.valor : 0;
      const saida   = m.tipo === "saida"   ? m.valor : 0;
      saldoAcumulado += (entrada - saida);
      const corSaldo = saldoAcumulado >= 0 ? "#166534" : "#991b1b";
      return `
        <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"}">
          <td>${fmtDate(m.data_movimento)}</td>
          <td>${m.descricao || "—"}</td>
          <td style="color:#166534;text-align:right">${entrada > 0 ? fmt(entrada) : "—"}</td>
          <td style="color:#991b1b;text-align:right">${saida > 0 ? fmt(saida) : "—"}</td>
          <td style="color:${corSaldo};text-align:right;font-weight:700">${fmt(saldoAcumulado)}</td>
          <td style="text-align:center;color:${m.conciliado ? "#166534" : "#9ca3af"}">${m.conciliado ? "&#10003;" : "&#9675;"}</td>
        </tr>`;
    }).join("");

    const dataGeracao = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const periodoFmt  = `${fmtDate(inicio)} a ${fmtDate(fim)}`;
    const numExtrato  = `EXT-${Date.now().toString().slice(-6)}`;
    const corSaldoFinal = saldoPeriodo >= 0 ? "#166534" : "#991b1b";

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Extrato — PrevGestao</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',Arial,sans-serif;font-size:11px;color:#1f2937;background:#fff}
    .page{width:210mm;min-height:297mm;padding:14mm 14mm 10mm;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:10px;border-bottom:3px solid #1e3a5f;margin-bottom:14px}
    .company-name{font-size:20px;font-weight:700;color:#1e3a5f}
    .company-slogan{font-size:10px;color:#6b7280;margin-top:2px}
    .stmt-title{font-size:24px;font-weight:700;color:#1e3a5f;text-align:right}
    .meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
    .meta-box{border:1px solid #d1d5db}
    .section-hdr{background:#1e3a5f;color:#fff;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px}
    .meta-row{display:flex;justify-content:space-between;font-size:10.5px;padding:4px 10px;border-bottom:1px solid #f3f4f6}
    .meta-row:last-child{border-bottom:none}
    .meta-label{color:#6b7280}
    .meta-value{font-weight:600;color:#111827}
    table{width:100%;border-collapse:collapse;font-size:10px}
    thead tr{background:#1e3a5f;color:#fff}
    thead th{padding:7px 8px;text-align:left;font-weight:600;font-size:10px;letter-spacing:.05em}
    tbody td{padding:6px 8px;border-bottom:1px solid #e5e7eb;vertical-align:middle}
    tfoot td{padding:8px;font-weight:700;font-size:11px;background:#1e3a5f;color:#fff}
    .footer{margin-top:20px;border-top:2px solid #1e3a5f;padding-top:12px;text-align:center}
    .footer-h{font-size:13px;font-weight:700;color:#1e3a5f;margin-bottom:4px}
    .footer-t{font-size:9px;color:#6b7280;line-height:1.6}
    .footer-c{font-size:9px;color:#374151;margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{padding:10mm}}
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="company-name">PrevGestao</div>
      <div class="company-slogan">Sistema de Gestao Previdenciaria</div>
    </div>
    <div class="stmt-title">Extrato</div>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <div class="section-hdr">Informacoes do Extrato</div>
      <div class="meta-row"><span class="meta-label">Data de Emissao</span><span class="meta-value">${dataGeracao}</span></div>
      <div class="meta-row"><span class="meta-label">N&#xBA; do Extrato</span><span class="meta-value">${numExtrato}</span></div>
      <div class="meta-row"><span class="meta-label">Periodo</span><span class="meta-value">${periodoFmt}</span></div>
      <div class="meta-row"><span class="meta-label">Conta</span><span class="meta-value">Conta Principal</span></div>
    </div>
    <div class="meta-box">
      <div class="section-hdr">Resumo do Periodo</div>
      <div class="meta-row"><span class="meta-label">Total de Entradas</span><span class="meta-value" style="color:#166534">${fmt(totalEntrada)}</span></div>
      <div class="meta-row"><span class="meta-label">Total de Saidas</span><span class="meta-value" style="color:#991b1b">${fmt(totalSaida)}</span></div>
      <div class="meta-row"><span class="meta-label">N&#xBA; de Movimentacoes</span><span class="meta-value">${movs.length}</span></div>
      <div class="meta-row"><span class="meta-label" style="font-weight:700">Saldo do Periodo</span><span class="meta-value" style="color:${corSaldoFinal};font-size:13px">${fmt(saldoPeriodo)}</span></div>
    </div>
  </div>

  <div class="section-hdr">Movimentacoes Detalhadas</div>
  <table>
    <thead>
      <tr>
        <th>Data</th>
        <th>Descricao</th>
        <th style="text-align:right">Entrada</th>
        <th style="text-align:right">Saida</th>
        <th style="text-align:right">Saldo</th>
        <th style="text-align:center">Conc.</th>
      </tr>
    </thead>
    <tbody>
      ${linhas || `<tr><td colspan="6" style="text-align:center;padding:20px;color:#9ca3af">Nenhuma movimentacao no periodo.</td></tr>`}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2">Total Geral do Periodo</td>
        <td style="text-align:right;color:#86efac">${fmt(totalEntrada)}</td>
        <td style="text-align:right;color:#fca5a5">${fmt(totalSaida)}</td>
        <td style="text-align:right;color:${saldoPeriodo >= 0 ? "#86efac" : "#fca5a5"}">${fmt(saldoPeriodo)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <div class="footer-h">Saldo do Periodo: ${fmt(saldoPeriodo)}</div>
    <div class="footer-t">
      Este extrato foi gerado automaticamente pelo sistema PrevGestao e e valido como documento de controle interno.<br/>
      Movimentacoes marcadas como Conciliadas (&#10003;) foram verificadas e confirmadas com o extrato bancario fisico.
    </div>
    <div class="footer-c">
      PrevGestao &mdash; Sistema de Gestao Previdenciaria &nbsp;|&nbsp;
      Gerado em: ${hoje.toLocaleString("pt-BR")} &nbsp;|&nbsp;
      Ref: ${numExtrato}
    </div>
  </div>
</div>
</body>
</html>`;

    const janela = window.open("", "_blank", "width=900,height=700");
    if (!janela) { toast.error("Habilite popups para exportar o PDF."); return; }
    janela.document.write(html);
    janela.document.close();
    janela.onload = () => setTimeout(() => janela.print(), 500);
  }

  const S = { background: "rgba(255,255,255,.04)", border: "1px solid rgba(201,169,110,.12)", borderRadius: 4, padding: "8px 12px", fontSize: 12, color: "var(--ink-200)", outline: "none" };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <FileText size={20} className="text-gold-500" /> Extrato e Conciliacao
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={exportarPDF}
            disabled={loading || movs.length === 0}
            title="Exportar extrato em formato PDF bancario"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#1e3a5f,#2563eb)", color: "#fff", border: "1px solid rgba(37,99,235,.4)" }}
          >
            <FileText size={14} />
            Exportar PDF
          </button>
          <button onClick={() => mutate()} className="p-2 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all" title="Atualizar dados">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(201,169,110,.6)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Data Inicio</label>
          <input type="date" style={S} value={inicio} onChange={e => setInicio(e.target.value)} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: "rgba(201,169,110,.6)", marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Data Fim</label>
          <input type="date" style={S} value={fim} onChange={e => setFim(e.target.value)} />
        </div>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l: "Total de Entrada", v: fmt(totalEntrada),  c: "#22c55e" },
          { l: "Total de Saida",   v: fmt(totalSaida),    c: "#ef4444" },
          { l: "Saldo do Periodo", v: fmt(saldoPeriodo),  c: saldoPeriodo >= 0 ? "#22c55e" : "#ef4444" },
          { l: "Movimentacoes",    v: movs.length,         c: "#C9A96E" },
        ].map(c => (
          <div key={c.l} className="glass-card rounded-xl p-4">
            <p className="text-[11px] text-ink-500 mb-1">{c.l}</p>
            <p className="text-lg font-bold" style={{ color: c.c }}>{c.v}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(201,169,110,.3)", borderTopColor: "#C9A96E" }} />
          </div>
        ) : movs.length === 0 ? (
          <div className="text-center py-16 text-sm text-ink-500">Nenhuma movimentacao encontrada.</div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Data", "Descricao", "Entrada", "Saida", "Conciliado"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-ink-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {movs.map(m => (
                <tr key={m.id} className="table-row-hover transition-colors">
                  <td className="px-4 py-3 text-ink-400 text-xs whitespace-nowrap">{fmtDate(m.data_movimento)}</td>
                  <td className="px-4 py-3 text-ink-200">{m.descricao}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-success-500">{m.tipo === "entrada" ? fmt(m.valor) : "—"}</td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-danger-400">{m.tipo === "saida" ? fmt(m.valor) : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => conciliar(m.id, m.conciliado)}
                      className={`w-7 h-7 flex items-center justify-center rounded transition-all ${m.conciliado ? "text-success-500 bg-success-500/10" : "text-ink-600 hover:text-success-500 hover:bg-success-500/10"}`}>
                      <CheckCircle size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
