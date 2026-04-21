import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { registrarAuditoria } from "@/lib/services/auditService";

export async function PUT(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload  = await request.json();
    const { data: anterior } = await supabase.from("movimentacoes").select("*").eq("id", params.id).single();

    const { data: novo, error } = await supabase
      .from("movimentacoes")
      .update(payload)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    await registrarAuditoria({
      tabela:           "movimentacoes",
      registro_id:      params.id,
      acao:             "UPDATE",
      dados_anteriores: anterior,
      dados_novos:      novo,
      usuario_email:    user.email,
      usuario_nome:     user.user_metadata?.nome || user.email
    });

    return NextResponse.json(novo);
  } catch (err) {
    console.error("[PUT /api/financeiro/movimentacoes/[id]]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { data: anterior } = await supabase.from("movimentacoes").select("*").eq("id", params.id).single();

    const { error } = await supabase.from("movimentacoes").delete().eq("id", params.id);
    if (error) throw error;

    await registrarAuditoria({
      tabela:           "movimentacoes",
      registro_id:      params.id,
      acao:             "DELETE",
      dados_anteriores: anterior,
      usuario_email:    user.email,
      usuario_nome:     user.user_metadata?.nome || user.email
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/financeiro/movimentacoes/[id]]", err.message);
    return NextResponse.json({ erro: err.message }, { status: 400 });
  }
}

