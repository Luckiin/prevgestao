/**
 * documentoService.js
 * Upload e gerenciamento de documentos no Supabase Storage
 */
import { registrarAuditoria } from "./auditService";

const BUCKET = "documentos-clientes";

/** Lista documentos de um cliente */
export async function listarDocumentos(supabase, clienteId, pasta) {
  let query = supabase
    .from("documentos")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("criado_em", { ascending: false });

  if (pasta) query = query.eq("pasta", pasta);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/** Gera URL temporária para download (1 hora de validade) */
export async function gerarUrlDownload(supabase, storagePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Registra documento no banco após upload direto do client
 * O upload é feito direto pelo browser via URL assinada
 */
export async function registrarDocumento(supabase, {
  cliente_id,
  nome,
  tipo_mime,
  tamanho,
  storage_path,
  pasta = "Geral",
}, usuarioEmail, usuarioNome) {
  const { data, error } = await supabase
    .from("documentos")
    .insert({
      cliente_id,
      nome,
      tipo_mime,
      tamanho,
      storage_path,
      pasta,
      criado_por: usuarioEmail,
    })
    .select()
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "documentos",
    registro_id:   data.id,
    acao:          "INSERT",
    dados_novos:   { nome, pasta, cliente_id, tamanho },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}

/** Gera URL para upload direto pelo browser */
export async function gerarUrlUpload(supabase, clienteId, nomeArquivo) {
  const ext  = nomeArquivo.split(".").pop();
  const path = `${clienteId}/${Date.now()}_${nomeArquivo}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { signedUrl: data.signedUrl, path };
}

/** Exclui documento do Storage e do banco */
export async function excluirDocumento(supabase, id, usuarioEmail, usuarioNome) {
  const { data: doc } = await supabase
    .from("documentos")
    .select("nome, storage_path, cliente_id")
    .eq("id", id)
    .single();

  // Remove do Storage
  if (doc?.storage_path) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const { error } = await supabase.from("documentos").delete().eq("id", id);
  if (error) throw error;

  await registrarAuditoria({
    tabela:           "documentos",
    registro_id:      id,
    acao:             "DELETE",
    dados_anteriores: doc,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });
}
