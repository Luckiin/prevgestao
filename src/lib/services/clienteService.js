import { calcIdade } from "@/lib/utils";
import { registrarAuditoria } from "./auditService";

const SELECT_COMPLETO = `
  id, nome, cpf, data_nascimento,
  rg, nacionalidade, estado_civil, endereco, cep, profissao, telefone,
  login_inss, senha_inss,
  tipo_processo, subdivisao_id, status, situacao, ano_referencia,
  numero_processo, valor_beneficio, observacoes,
  data_entrada, criado_em, atualizado_em,
  subdivisoes (id, nome, tipo)
`;


const SELECT_LISTA = `
  id, nome, cpf, data_nascimento,
  tipo_processo, subdivisao_id, status, situacao, ano_referencia,
  numero_processo, valor_beneficio,
  atualizado_em,
  subdivisoes (id, nome, tipo)
`;


export async function listarClientes(supabase, {
  status,
  tipo_processo,
  situacao,
  subdivisao_id,
  subdivisao_nome,
  ano_referencia,
  busca,
  limit  = 50,
  offset = 0,
} = {}) {
  let query = supabase
    .from("clientes")
    .select(SELECT_LISTA, { count: "exact" })
    .order("atualizado_em", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status)         query = query.eq("status", status);
  if (tipo_processo)  query = query.eq("tipo_processo", tipo_processo);
  if (situacao)       query = query.eq("situacao", situacao);
  if (subdivisao_id)   query = query.eq("subdivisao_id", subdivisao_id);

  if (subdivisao_nome) {
    const { data: subs } = await supabase.from("subdivisoes").select("id").eq("nome", subdivisao_nome);
    if (subs && subs.length > 0) {
      query = query.in("subdivisao_id", subs.map(s => s.id));
    } else {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }
  if (ano_referencia) query = query.eq("ano_referencia", Number(ano_referencia));
  if (busca) {
    query = query.or(
      `nome.ilike.%${busca}%,cpf.ilike.%${busca}%,numero_processo.ilike.%${busca}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data.map((c) => ({ ...c, idade: calcIdade(c.data_nascimento) })),
    total: count,
  };
}


export async function buscarCliente(supabase, id) {
  const { data, error } = await supabase
    .from("clientes")
    .select(`${SELECT_COMPLETO}, prazos (*), documentos (*)`)
    .eq("id", id)
    .single();

  if (error) throw error;
  return {
    ...data,
    idade: calcIdade(data.data_nascimento),
  };
}


export async function criarCliente(supabase, payload, usuarioEmail, usuarioNome) {
  const {
    login_inss, senha_inss, documentos, prazos, subdivisoes, idade,
    id, criado_em, atualizado_em, data_entrada, ...resto
  } = payload;
  const { data, error } = await supabase
    .from("clientes")
    .insert({
      ...resto,
      login_inss,
      senha_inss,
      cpf: payload.cpf.replace(/\D/g, ""),
    })
    .select(SELECT_COMPLETO)
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "clientes",
    registro_id:   data.id,
    entidade_id:   data.id,
    acao:          "INSERT",
    dados_novos:   { nome: data.nome, cpf: data.cpf, tipo_processo: data.tipo_processo },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return {
    ...data,
    idade: calcIdade(data.data_nascimento),
  };
}


export async function atualizarCliente(supabase, id, payload, usuarioEmail, usuarioNome) {

  const { data: anterior } = await supabase
    .from("clientes")
    .select(`
      nome, cpf, data_nascimento, tipo_processo, subdivisao_id, status, situacao,
      numero_processo, valor_beneficio, observacoes, ano_referencia,
      subdivisoes (nome)
    `)
    .eq("id", id)
    .single();

  const {
    login_inss, senha_inss, documentos, prazos, subdivisoes, idade,
    id: _id, criado_em, atualizado_em, data_entrada, ...resto
  } = payload;
  const updates = { ...resto };


  if (login_inss !== undefined) updates.login_inss = login_inss || null;
  if (senha_inss !== undefined) updates.senha_inss = senha_inss || null;

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
    entidade_id:      id,
    acao:             "UPDATE",
    dados_anteriores: {
      ...anterior,
      subdivisao_nome: anterior.subdivisoes?.nome
    },
    dados_novos:      {
      nome: data.nome, cpf: data.cpf, data_nascimento: data.data_nascimento,
      tipo_processo: data.tipo_processo, subdivisao_id: data.subdivisao_id,
      subdivisao_nome: data.subdivisoes?.nome,
      status: data.status, situacao: data.situacao, numero_processo: data.numero_processo,
      valor_beneficio: data.valor_beneficio, observacoes: data.observacoes,
      ano_referencia: data.ano_referencia
    },
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });

  return {
    ...data,
    idade: calcIdade(data.data_nascimento),
  };
}


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
    entidade_id:      id,
    acao:             "DELETE",
    dados_anteriores: anterior,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });
}


export async function buscarHistoricoAnual(supabase, clienteId) {
  const { data, error } = await supabase
    .from("historico_anual")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("migrado_em", { ascending: false });

  if (error) throw error;
  return data;
}
