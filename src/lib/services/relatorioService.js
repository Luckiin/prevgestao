/**
 * relatorioService.js
 * Dados para relatórios e dashboard
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

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,cpf.ilike.%${busca}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, total: count };
}

/** Estatísticas gerais para o dashboard */
export async function estatisticasDashboard(supabase) {
  const anoAtual = new Date().getFullYear();

  const [
    { count: totalAtivos },
    { count: totalAnoAtual },
    { count: prazosHoje },
    { data: valorTotal },
    { data: porSubdivisao },
  ] = await Promise.all([
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("status", "Ativo"),
    supabase.from("clientes").select("*", { count: "exact", head: true }).eq("ano_referencia", anoAtual),
    supabase.from("prazos").select("*", { count: "exact", head: true })
      .eq("concluido", false)
      .lte("data_prazo", new Date().toISOString().split("T")[0]),
    supabase.from("clientes").select("valor_beneficio").eq("status", "Ativo"),
    supabase
      .from("clientes")
      .select("subdivisoes(nome), status")
      .eq("status", "Ativo"),
  ]);

  const valorTotalAtivos = (valorTotal || []).reduce(
    (acc, c) => acc + (c.valor_beneficio || 0), 0
  );

  return {
    total_ativos:     totalAtivos || 0,
    total_ano_atual:  totalAnoAtual || 0,
    prazos_vencidos:  prazosHoje || 0,
    valor_total:      valorTotalAtivos,
    por_subdivisao:   porSubdivisao || [],
  };
}

/** Prazos próximos (view v_prazos_proximos) */
export async function prazosProximos(supabase, dias = 30) {
  const ate = new Date();
  ate.setDate(ate.getDate() + dias);

  const { data, error } = await supabase
    .from("prazos")
    .select("*, clientes(id, nome, cpf, status)")
    .eq("concluido", false)
    .lte("data_prazo", ate.toISOString().split("T")[0])
    .gte("data_prazo", new Date().toISOString().split("T")[0])
    .order("data_prazo");

  if (error) throw error;
  return data;
}
