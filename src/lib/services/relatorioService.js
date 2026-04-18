/**
 * relatorioService.js — otimizado para performance
 */

/** Resumo anual (via view v_resumo_anual) */
export async function resumoAnual(supabase) {
  const { data, error } = await supabase
    .from("v_resumo_anual")
    .select("*");
  if (error) throw error;
  return data;
}

/** Clientes de um ano específico */
export async function clientesPorAno(supabase, ano, { limit = 200, offset = 0, busca } = {}) {
  let query = supabase
    .from("v_clientes_completo")
    .select("*", { count: "exact" })
    .eq("ano_referencia", ano)
    .order("atualizado_em", { ascending: false })
    .range(offset, offset + limit - 1);

  if (busca) query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count };
}

/**
 * Estatísticas do dashboard — queries otimizadas:
 * - Usa `head: true` (só count, sem dados) onde possível
 * - Agrega valor_total com range limitado
 * - Remove query de porSubdivisao desnecessária
 */
export async function estatisticasDashboard(supabase) {
  const anoAtual = new Date().getFullYear();
  const hoje = new Date().toISOString().split("T")[0];

  const [
    { count: totalAtivos,   error: e1 },
    { count: totalAnoAtual, error: e2 },
    { count: prazosVencidos, error: e3 },
    { data:  valorRows,     error: e4 },
  ] = await Promise.all([
    // COUNT apenas — sem baixar registros
    supabase.from("clientes")
      .select("*", { count: "exact", head: true })
      .eq("status", "Ativo"),

    supabase.from("clientes")
      .select("*", { count: "exact", head: true })
      .eq("ano_referencia", anoAtual),

    supabase.from("prazos")
      .select("*", { count: "exact", head: true })
      .eq("concluido", false)
      .lte("data_prazo", hoje),

    // Só o campo necessário, limitado a 2000 registros
    supabase.from("clientes")
      .select("valor_beneficio")
      .eq("status", "Ativo")
      .not("valor_beneficio", "is", null)
      .limit(2000),
  ]);

  if (e1 || e2 || e3 || e4) {
    const err = e1 || e2 || e3 || e4;
    throw new Error(err.message);
  }

  const valorTotal = (valorRows || []).reduce(
    (acc, c) => acc + (c.valor_beneficio || 0), 0
  );

  return {
    total_ativos:    totalAtivos    || 0,
    total_ano_atual: totalAnoAtual  || 0,
    prazos_vencidos: prazosVencidos || 0,
    valor_total:     valorTotal,
  };
}

/** Prazos próximos */
export async function prazosProximos(supabase, dias = 30) {
  const hoje = new Date().toISOString().split("T")[0];
  const ate  = new Date();
  ate.setDate(ate.getDate() + dias);
  const ateStr = ate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("prazos")
    .select("id, descricao, data_prazo, concluido, clientes(id, nome, cpf, status)")
    .eq("concluido", false)
    .gte("data_prazo", hoje)
    .lte("data_prazo", ateStr)
    .order("data_prazo")
    .limit(50);

  if (error) throw error;
  return data;
}
