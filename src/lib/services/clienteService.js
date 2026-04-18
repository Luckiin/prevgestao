/**
 * clienteService.js
 * CRUD de clientes + regra de ano de referência
 */
import { encryptCredenciais, decryptCredenciais } from "@/lib/cryptoUtils";
import { calcIdade } from "@/lib/utils";
import { registrarAuditoria } from "./auditService";

const SELECT_COMPLETO = `
  id, nome, cpf, data_nascimento,
  login_inss, senha_inss,
  tipo_processo, status, ano_referencia,
  numero_processo, valor_beneficio, observacoes,
  data_entrada, criado_em, atualizado_em,
  subdivisoes (id, nome, tipo)
`;

/** Lista clientes com filtros opcionais */
export async function listarClientes(supabase, {
  status,
  tipo_processo,
  subdivisao_id,
  ano_referencia,
  busca,
  limit  = 50,
  offset = 0,
} = {}) {
  let query = supabase
    .from("clientes")
    .select(SELECT_COMPLETO, { count: "exact" })
    .order("atualizado_em", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status)        query = query.eq("status", status);
  if (tipo_processo) query = query.eq("tipo_processo", tipo_processo);
  if (subdivisao_id) query = query.eq("subdivisao_id", subdivisao_id);
  if (ano_referencia) query = query.eq("ano_referencia", Number(ano_referencia));
  if (busca) {
    query = query.or(
      `nome.ilike.%${busca}%,cpf.ilike.%${busca}%,numero_processo.ilike.%${busca}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data.map((c) => ({
      ...decryptCredenciais(c),
      idade: calcIdade(c.data_nascimento),
    })),
    total: count,
  };
}

/** Busca cliente por ID */
export async function buscarCliente(supabase, id) {
  const { data, error } = await supabase
    .from("clientes")
    .select(`${SELECT_COMPLETO}, prazos (*), documentos (*)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return {
    ...decryptCredenciais(data),
    idade: calcIdade(data.data_nascimento),
  };
}

/** Cria novo cliente */
export async function criarCliente(supabase, payload, usuarioEmail, usuarioNome) {
  const { login_inss, senha_inss, ...resto } = payload;
  const credencias = encryptCredenciais({ login_inss, senha_inss });

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      ...resto,
      ...credencias,
      cpf: payload.cpf.replace(/\D/g, ""),
    })
    .select(SELECT_COMPLETO)
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "clientes",
    registro_id:   data.id,
    acao:          "INSERT",
    dados_novos:   { nome: data.nome, cpf: data.cpf, tipo_processo: data.tipo_processo },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return {
    ...decryptCredenciais(data),
    idade: calcIdade(data.data_nascimento),
  };
}

/** Atualiza cliente */
export async function atualizarCliente(supabase, id, payload, usuarioEmail, usuarioNome) {
  // Busca antes para auditoria
  const { data: anterior } = await supabase
    .from("clientes")
    .select("nome, cpf, status, ano_referencia")
    .eq("id", id)
    .single();

  const { login_inss, senha_inss, ...resto } = payload;
  const updates = { ...resto };

  // Só recriptografa se os campos foram enviados
  if (login_inss !== undefined) updates.login_inss = login_inss ? encryptCredenciais({ login_inss, senha_inss: "" }).login_inss : null;
  if (senha_inss !== undefined) updates.senha_inss = senha_inss ? encryptCredenciais({ login_inss: "", senha_inss }).senha_inss : null;

  if (updates.cpf) updates.cpf = updates.cpf.replace(/\D/g, "");

  const { data, error } = await supabase
    .from("clientes")
    .update(updates)
    .eq("id", id)
    .select(SELECT_COMPLETO)
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:           "clientes",
    registro_id:      id,
    acao:             "UPDATE",
    dados_anteriores: anterior,
    dados_novos:      { nome: data.nome, status: data.status, ano_referencia: data.ano_referencia },
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });

  return {
    ...decryptCredenciais(data),
    idade: calcIdade(data.data_nascimento),
  };
}

/** Exclui cliente */
export async function excluirCliente(supabase, id, usuarioEmail, usuarioNome) {
  const { data: anterior } = await supabase
    .from("clientes")
    .select("nome, cpf")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) throw error;

  await registrarAuditoria({
    tabela:           "clientes",
    registro_id:      id,
    acao:             "DELETE",
    dados_anteriores: anterior,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });
}

/** Busca histórico anual de um cliente */
export async function buscarHistoricoAnual(supabase, clienteId) {
  const { data, error } = await supabase
    .from("historico_anual")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("migrado_em", { ascending: false });

  if (error) throw error;
  return data;
}
