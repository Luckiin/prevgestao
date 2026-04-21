import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { registrarAuditoria } from "@/lib/services/auditService";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const { data, error } = await supabase.from("contas").select("*").eq("ativo", true).order("nome");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GET /api/financeiro/contas]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao buscar contas" : err.message;
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

    const payload  = await request.json();

    if (!payload.nome) {
      return NextResponse.json({ erro: "Nome da conta é obrigatório" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("contas")
      .insert({
        nome: payload.nome.trim(),
        tipo: payload.tipo || "corrente",
        saldo_inicial: payload.saldo_inicial || 0,
        saldo_atual: payload.saldo_inicial || 0,
        ativo: true
      })
      .select()
      .single();

    if (error) throw error;

    await registrarAuditoria({
      tabela:        "contas",
      registro_id:   data.id,
      acao:          "INSERT",
      dados_novos:   data,
      usuario_email: user.email,
      usuario_nome:  user.user_metadata?.nome || user.email
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("[POST /api/financeiro/contas]", err.message);
    const msg = process.env.NODE_ENV === "production" ? "Erro ao criar conta" : err.message;
    return NextResponse.json({ erro: msg }, { status: 400 });
  }
}
