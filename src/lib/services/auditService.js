import { createAdminClient } from "@/lib/supabase-server";


export async function registrarAuditoria({
  tabela,
  registro_id,
  entidade_id,
  acao,
  dados_anteriores,
  dados_novos,
  usuario_email,
  usuario_nome,
  ip_address,
}) {
  try {
    const admin = createAdminClient();
    await admin.from("auditoria").insert({
      tabela,
      registro_id:      registro_id || null,
      entidade_id:      entidade_id || null,
      acao,
      dados_anteriores: dados_anteriores || null,
      dados_novos:      dados_novos || null,
      usuario_email:    usuario_email || null,
      usuario_nome:     usuario_nome  || null,
      ip_address:       ip_address    || null,
    });
  } catch (err) {

    console.error("[auditoria]", err.message);
  }
}


export async function buscarAuditoria({ tabela, registro_id, entidade_id, usuario_email, limit = 100, offset = 0 } = {}) {
  const admin = createAdminClient();
  let query = admin
    .from("auditoria")
    .select("*")
    .order("criado_em", { ascending: false })
    .range(offset, offset + limit - 1);

  if (tabela)        query = query.eq("tabela", tabela);
  if (registro_id)   query = query.eq("registro_id", registro_id);
  if (entidade_id)   query = query.eq("entidade_id", entidade_id);
  if (usuario_email) query = query.eq("usuario_email", usuario_email);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
