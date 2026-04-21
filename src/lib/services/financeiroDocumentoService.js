import { registrarAuditoria } from "./auditService";

const BUCKET = "financeiro-documentos";


export async function listarDocumentosFinanceiro(supabase, lancamentoId) {
  const { data, error } = await supabase
    .from("lancamentos_documentos")
    .select("*")
    .eq("lancamento_id", lancamentoId)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data;
}


export async function gerarUrlDownloadFinanceiro(supabase, storagePath, download = false) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600, download ? { download: true } : {});

  if (error) throw error;
  return data.signedUrl;
}


export async function registrarDocumentoFinanceiro(supabase, {
  lancamento_id,
  nome,
  tipo_mime,
  tamanho,
  storage_path,
}, usuarioEmail, usuarioNome) {
  const { data, error } = await supabase
    .from("lancamentos_documentos")
    .insert({
      lancamento_id,
      nome,
      tipo_mime,
      tamanho,
      storage_path,
      criado_por: usuarioEmail,
    })
    .select()
    .single();

  if (error) throw error;

  await registrarAuditoria({
    tabela:        "lancamentos_documentos",
    registro_id:   data.id,
    entidade_id:   lancamento_id,
    acao:          "INSERT",
    dados_novos:   { nome, lancamento_id, tamanho },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}


export async function gerarUrlUploadFinanceiro(supabase, lancamentoId, nomeArquivo) {
  const ext  = nomeArquivo.split(".").pop();
  const path = `${lancamentoId}/${Date.now()}_${nomeArquivo}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { signedUrl: data.signedUrl, path };
}


export async function excluirDocumentoFinanceiro(supabase, id, usuarioEmail, usuarioNome) {
  const { data: doc } = await supabase
    .from("lancamentos_documentos")
    .select("nome, storage_path, lancamento_id")
    .eq("id", id)
    .single();

  if (doc?.storage_path) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const { error } = await supabase.from("lancamentos_documentos").delete().eq("id", id);
  if (error) throw error;

  await registrarAuditoria({
    tabela:           "lancamentos_documentos",
    registro_id:      id,
    entidade_id:      doc.lancamento_id,
    acao:             "DELETE",
    dados_anteriores: doc,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });
}
