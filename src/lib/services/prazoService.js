import { registrarAuditoria } from "./auditService";


export async function listarPrazos(supabase, clienteId) {
  const { data, error } = await supabase
    .from("prazos")
    .select("*, clientes(nome, cpf)")
    .eq("cliente_id", clienteId)
    .order("data_prazo", { ascending: true });

  if (error) throw error;
  return data;
}


export async function listarTodosPrazos(supabase, { concluido, dias_ate, limit = 100 } = {}) {
  let query = supabase
    .from("prazos")
    .select("*, clientes(id, nome, cpf, status)")
    .order("data_prazo", { ascending: true })
    .limit(limit);

  if (concluido !== undefined) query = query.eq("concluido", concluido);
  if (dias_ate) {
    const ate = new Date();
    ate.setDate(ate.getDate() + Number(dias_ate));
    query = query.lte("data_prazo", ate.toISOString().split("T")[0]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}


export async function criarPrazo(supabase, payload, usuarioEmail, usuarioNome) {
  const { data, error } = await supabase
    .from("prazos")
    .insert({ ...payload, criado_por: usuarioEmail })
    .select("*, clientes(nome)")
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "prazos",
    registro_id:   data.id,
    entidade_id:   data.cliente_id,
    acao:          "INSERT",
    dados_novos:   { descricao: data.descricao, data_prazo: data.data_prazo, cliente_id: data.cliente_id },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}


export async function atualizarPrazo(supabase, id, payload, usuarioEmail, usuarioNome) {
  const { data: anterior } = await supabase
    .from("prazos")
    .select("descricao, concluido, data_prazo, cliente_id")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("prazos")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:           "prazos",
    registro_id:      id,
    entidade_id:      anterior.cliente_id,
    acao:             "UPDATE",
    dados_anteriores: anterior,
    dados_novos:      payload,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });

  return data;
}


export async function excluirPrazo(supabase, id, usuarioEmail, usuarioNome) {
  const { data: anterior } = await supabase
    .from("prazos")
    .select("descricao, data_prazo, cliente_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("prazos").delete().eq("id", id);
  if (error) throw error;

  await registrarAuditoria({
    tabela:           "prazos",
    registro_id:      id,
    entidade_id:      anterior.cliente_id,
    acao:             "DELETE",
    dados_anteriores: anterior,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });
}
