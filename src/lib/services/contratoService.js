/**
 * contratoService.js
 * Gestão de modelos de contrato e geração de DOCX via docxtemplater
 */

import { TIPOS_DOC } from "@/lib/contratos/tipos";
export { TIPOS_DOC };

const BUCKET = "modelos-contrato";

// ── Tipos de ação (dinâmicos) ────────────────────────────────────────────────

function gerarSlug(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function listarTiposAcao(supabase) {
  const { data, error } = await supabase
    .from("tipos_acao_contrato")
    .select("*")
    .order("nome");
  if (error) throw error;
  return data;
}

export async function criarTipoAcao(supabase, { nome }) {
  const slug = gerarSlug(nome);
  const { data, error } = await supabase
    .from("tipos_acao_contrato")
    .insert({ nome, slug })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function atualizarTipoAcao(supabase, id, campos) {
  const updates = { ...campos };
  if (campos.nome) updates.slug = gerarSlug(campos.nome);
  const { data, error } = await supabase
    .from("tipos_acao_contrato")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function excluirTipoAcao(supabase, id) {
  // Verifica se há modelos vinculados ao slug deste tipo
  const { data: tipo } = await supabase
    .from("tipos_acao_contrato")
    .select("slug")
    .eq("id", id)
    .single();

  if (tipo) {
    const { count } = await supabase
      .from("modelos_contrato")
      .select("id", { count: "exact", head: true })
      .eq("tipo_acao", tipo.slug);
    if (count > 0) throw new Error("Não é possível excluir: há modelos vinculados a este tipo.");
  }

  const { error } = await supabase.from("tipos_acao_contrato").delete().eq("id", id);
  if (error) throw error;
}

/** Lista todos os modelos cadastrados */
export async function listarModelos(supabase) {
  const { data, error } = await supabase
    .from("modelos_contrato")
    .select("*")
    .order("tipo_acao")
    .order("tipo_doc");

  if (error) throw error;
  return data;
}

/** Registra modelo no banco após upload */
export async function registrarModelo(supabase, { tipo_acao, tipo_doc, nome, storage_path }) {
  // Upsert: substitui se já existir para o mesmo (tipo_acao, tipo_doc)
  const { data, error } = await supabase
    .from("modelos_contrato")
    .upsert({ tipo_acao, tipo_doc, nome, storage_path }, { onConflict: "tipo_acao,tipo_doc" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Gera URL assinada para download/visualização de um modelo */
export async function gerarUrlDownloadModelo(supabase, id) {
  const { data: modelo, error } = await supabase
    .from("modelos_contrato")
    .select("storage_path, nome")
    .eq("id", id)
    .single();

  if (error || !modelo) throw new Error("Modelo não encontrado.");

  const { data, error: errUrl } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(modelo.storage_path, 3600);

  if (errUrl) throw new Error("Falha ao gerar URL de acesso.");
  return { url: data.signedUrl, nome: modelo.nome };
}

/** Remove modelo do banco e do Storage */
export async function excluirModelo(supabase, id) {
  const { data: modelo } = await supabase
    .from("modelos_contrato")
    .select("storage_path")
    .eq("id", id)
    .single();

  if (modelo?.storage_path) {
    await supabase.storage.from(BUCKET).remove([modelo.storage_path]);
  }

  const { error } = await supabase.from("modelos_contrato").delete().eq("id", id);
  if (error) throw error;
}

/** Sanitiza nome de arquivo removendo acentos, espaços e caracteres especiais */
function sanitizarNome(nomeArquivo) {
  const partes = nomeArquivo.split(".");
  const ext  = partes.pop();
  const base = partes.join(".")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `${base}.${ext}`;
}

/** Gera URL assinada para upload do modelo */
export async function gerarUrlUploadModelo(supabase, tipo_acao, tipo_doc, nomeArquivo) {
  const nomeSeguro = sanitizarNome(nomeArquivo);
  const path = `${tipo_acao}/${tipo_doc}/${Date.now()}_${nomeSeguro}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { signedUrl: data.signedUrl, path };
}

/** Gera DOCX preenchido a partir do modelo e dados do cliente */
export async function gerarDocx(supabase, clienteId, tipoAcao, tipoDoc) {
  // 1. Busca modelo
  const { data: modelo, error: errModelo } = await supabase
    .from("modelos_contrato")
    .select("storage_path, nome")
    .eq("tipo_acao", tipoAcao)
    .eq("tipo_doc", tipoDoc)
    .single();

  if (errModelo || !modelo) throw new Error("Modelo não encontrado para este tipo de ação e documento.");

  // 2. Busca dados do cliente
  const { data: cliente, error: errCliente } = await supabase
    .from("clientes")
    .select(`
      nome, cpf, data_nascimento,
      rg, nacionalidade, estado_civil, endereco, cep, profissao, telefone,
      login_inss, senha_inss,
      tipo_processo, numero_processo, valor_beneficio,
      status, situacao, observacoes,
      subdivisoes (nome)
    `)
    .eq("id", clienteId)
    .single();

  if (errCliente || !cliente) throw new Error("Cliente não encontrado.");

  // 3. Baixa o template do Storage
  const { data: arquivoData, error: errDownload } = await supabase.storage
    .from(BUCKET)
    .download(modelo.storage_path);

  if (errDownload || !arquivoData) throw new Error("Falha ao baixar o modelo do servidor.");

  // 4. Prepara os dados para substituição
  const hoje = new Date();
  const formatarData = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };
  const formatarCPF = (cpf) => {
    if (!cpf) return "—";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  const formatarMoeda = (v) => {
    if (!v) return "—";
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };
  const calcIdade = (nascimento) => {
    if (!nascimento) return "—";
    const nasc = new Date(nascimento);
    const idade = Math.floor((hoje - nasc) / (365.25 * 24 * 60 * 60 * 1000));
    return `${idade} anos`;
  };
  const tipoAcaoLabel = TIPOS_ACAO.find(t => t.value === tipoAcao)?.label || tipoAcao;

  const variaveis = {
    // Dados pessoais
    NOME:              cliente.nome || "—",
    CPF:               formatarCPF(cliente.cpf),
    RG:                cliente.rg || "—",
    DATA_NASCIMENTO:   formatarData(cliente.data_nascimento),
    IDADE:             calcIdade(cliente.data_nascimento),
    NACIONALIDADE:     cliente.nacionalidade || "Brasileira",
    ESTADO_CIVIL:      cliente.estado_civil || "—",
    PROFISSAO:         cliente.profissao || "—",
    ENDERECO:          cliente.endereco || "—",
    CEP:               cliente.cep || "—",
    TELEFONE:          cliente.telefone || "—",
    // Credenciais INSS
    LOGIN_INSS:        cliente.login_inss || "—",
    SENHA_INSS:        cliente.senha_inss || "—",
    // Processo
    TIPO_PROCESSO:     cliente.tipo_processo
                         ? cliente.tipo_processo.charAt(0).toUpperCase() + cliente.tipo_processo.slice(1)
                         : "—",
    SUBDIVISAO:        cliente.subdivisoes?.nome || "—",
    NUMERO_PROCESSO:   cliente.numero_processo || "—",
    STATUS:            cliente.status || "—",
    SITUACAO:          cliente.situacao || "—",
    VALOR_BENEFICIO:   formatarMoeda(cliente.valor_beneficio),
    DESCRICAO:         cliente.observacoes || "—",
    // Contrato
    TIPO_ACAO:         tipoAcaoLabel,
    DATA_HOJE:         hoje.toLocaleDateString("pt-BR"),
    DATA:              hoje.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }),
  };

  // 5. Preenche o template com docxtemplater
  const PizZip     = (await import("pizzip")).default;
  const Docxtemplater = (await import("docxtemplater")).default;

  const arrayBuffer = await arquivoData.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: "{", end: "}" },
  });

  doc.render(variaveis);

  const buffer = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });

  const tipoDocLabel = TIPOS_DOC.find(t => t.value === tipoDoc)?.label || tipoDoc;
  const nomeArquivo  = `${cliente.nome.replace(/\s+/g, "_")}_${tipoDocLabel}.docx`;

  return { buffer, nomeArquivo };
}
