import { registrarAuditoria } from "./auditService";

const BUCKET = "documentos-clientes";


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


export async function gerarUrlDownload(supabase, storagePath, download = false) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600, download ? { download: true } : {});

  if (error) throw error;
  return data.signedUrl;
}


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
    entidade_id:   cliente_id,
    acao:          "INSERT",
    dados_novos:   { nome, pasta, cliente_id, tamanho },
    usuario_email: usuarioEmail,
    usuario_nome:  usuarioNome,
  });

  return data;
}


function sanitizarNome(nomeArquivo) {
  const ext = nomeArquivo.split(".").pop();
  const base = nomeArquivo
    .substring(0, nomeArquivo.length - ext.length - 1)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
  return `${base}.${ext}`;
}


export async function gerarUrlUpload(supabase, clienteId, nomeArquivo) {
  const nomeSeguro = sanitizarNome(nomeArquivo);
  const path = `${clienteId}/${Date.now()}_${nomeSeguro}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (error) throw error;
  return { signedUrl: data.signedUrl, path, nomeOriginal: nomeArquivo };
}


export async function excluirDocumento(supabase, id, usuarioEmail, usuarioNome) {
  const { data: doc } = await supabase
    .from("documentos")
    .select("nome, storage_path, cliente_id")
    .eq("id", id)
    .single();


  if (doc?.storage_path) {
    await supabase.storage.from(BUCKET).remove([doc.storage_path]);
  }

  const { error } = await supabase.from("documentos").delete().eq("id", id);
  if (error) throw error;

  await registrarAuditoria({
    tabela:           "documentos",
    registro_id:      id,
    entidade_id:      doc.cliente_id,
    acao:             "DELETE",
    dados_anteriores: doc,
    usuario_email:    usuarioEmail,
    usuario_nome:     usuarioNome,
  });
}
