import { registrarAuditoria } from "./auditService";

export async function listarSubdivisoes(supabase, tipo) {
  let query = supabase
    .from("subdivisoes")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (tipo) query = query.eq("tipo", tipo);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarSubdivisao(supabase, { nome, tipo }, usuarioEmail, usuarioNome) {
  const { data, error } = await supabase
    .from("subdivisoes")
    .insert({ nome: nome.trim(), tipo })
    .select()
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "subdivisoes",
    registro_id:   data.id,
    acao:          "INSERT",
    dados_novos:   { nome, tipo },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}

export async function atualizarSubdivisao(supabase, id, payload, usuarioEmail, usuarioNome) {
  const { data, error } = await supabase
    .from("subdivisoes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "subdivisoes",
    registro_id:   id,
    acao:          "UPDATE",
    dados_novos:   payload,
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}

export async function excluirSubdivisao(supabase, id, usuarioEmail, usuarioNome) {

  const { data, error } = await supabase
    .from("subdivisoes")
    .update({ ativo: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "subdivisoes",
    registro_id:   id,
    acao:          "DESATIVAR",
    dados_novos:   { ativo: false },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}
