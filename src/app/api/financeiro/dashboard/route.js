import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const hoje = new Date().toISOString().split("T")[0];
    const mesAtual = hoje.slice(0, 7);
    const inicioMes = `${mesAtual}-01`;
    const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString().split("T")[0];
    const anoAtual = new Date().getFullYear();

    const [
      { data: saldoContas },
      { count: aPagar },
      { count: aReceber },
      { count: vencidosPagar },
      { data: pagosNoMes },
      { data: recebidosNoMes },
      { data: receitasMes },
      { data: despesasMes },
      { data: receitasAno },
      { data: despesasAno },
    ] = await Promise.all([
      supabase.from("contas").select("saldo_atual").eq("ativo", true),
      supabase.from("lancamentos").select("*", { count: "exact", head: true })
        .eq("tipo", "despesa").eq("status", "pendente"),
      supabase.from("lancamentos").select("*", { count: "exact", head: true })
        .eq("tipo", "receita").eq("status", "pendente"),
      supabase.from("lancamentos").select("*", { count: "exact", head: true })
        .eq("tipo", "despesa").eq("status", "pendente").lt("data_vencimento", hoje),
      supabase.from("lancamentos").select("valor")
        .eq("tipo", "despesa").eq("status", "pago")
        .gte("data_pagamento", inicioMes).lte("data_pagamento", fimMes),
      supabase.from("lancamentos").select("valor")
        .eq("tipo", "receita").eq("status", "pago")
        .gte("data_pagamento", inicioMes).lte("data_pagamento", fimMes),
      supabase.from("lancamentos").select("valor")
        .eq("tipo", "receita").eq("status", "pendente")
        .gte("data_vencimento", inicioMes).lte("data_vencimento", fimMes),
      supabase.from("lancamentos").select("valor")
        .eq("tipo", "despesa").eq("status", "pendente")
        .gte("data_vencimento", inicioMes).lte("data_vencimento", fimMes),
      supabase.from("lancamentos").select("valor, data_vencimento")
        .eq("tipo", "receita").eq("status", "pago")
        .gte("data_pagamento", `${anoAtual}-01-01`).lte("data_pagamento", `${anoAtual}-12-31`),
      supabase.from("lancamentos").select("valor, data_vencimento")
        .eq("tipo", "despesa").eq("status", "pago")
        .gte("data_pagamento", `${anoAtual}-01-01`).lte("data_pagamento", `${anoAtual}-12-31`),
    ]);

    const soma = (arr) => (arr || []).reduce((s, r) => s + (r.valor || 0), 0);
    const saldoTotal = (saldoContas || []).reduce((s, c) => s + (c.saldo_atual || 0), 0);


    const porMes = (arr, campo = "data_vencimento") => {
      const meses = Array(12).fill(0);
      (arr || []).forEach(r => {
        const dStr = r[campo] || r.data_vencimento;
        if (!dStr) return;
        const m = new Date(dStr).getMonth();
        meses[m] += r.valor || 0;
      });
      return meses;
    };

    return NextResponse.json({
      saldo_atual:        saldoTotal,
      a_pagar:            aPagar || 0,
      a_receber:          aReceber || 0,
      vencidos_pagar:     vencidosPagar || 0,
      pago_mes:           soma(pagosNoMes),
      recebido_mes:       soma(recebidosNoMes),
      a_pagar_mes:        soma(despesasMes),
      a_receber_mes:      soma(receitasMes),
      saldo_previsto_mes: soma(receitasMes) - soma(despesasMes),
      saldo_realizado_mes: soma(recebidosNoMes) - soma(pagosNoMes),
      grafico_receitas:   porMes(receitasAno),
      grafico_despesas:   porMes(despesasAno),
    });
  } catch (err) {
    console.error("[GET /api/financeiro/dashboard]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao carregar dados do dashboard" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
