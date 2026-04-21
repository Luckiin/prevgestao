import { registrarAuditoria } from "./auditService";

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax",
  path:     "/",
  maxAge:   7 * 24 * 60 * 60,
};

export { COOKIE_OPTS };


export async function loginEtapa1(supabase, email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) throw new Error(error.message);

  const { user, session } = data;


  const { data: factors } = await supabase.auth.mfa.listFactors();
  const totpFactor = factors?.totp?.find((f) => f.status === "verified");

  if (totpFactor) {

    const { data: challengeData, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

    if (challengeErr) throw new Error(challengeErr.message);

    return {
      mfa_required: true,
      factor_id:    totpFactor.id,
      challenge_id: challengeData.id,
      usuario: {
        id:    user.id,
        email: user.email,
        nome:  user.user_metadata?.nome || user.email,
      },
    };
  }


  await registrarAuditoria({
    tabela:        "auth",
    acao:          "LOGIN",
    usuario_email: user.email,
    usuario_nome:  user.user_metadata?.nome || user.email,
    dados_novos:   { metodo: "email_senha" },
  });

  return {
    mfa_required: false,
    session,
    usuario: {
      id:    user.id,
      email: user.email,
      nome:  user.user_metadata?.nome || user.email,
    },
  };
}


export async function loginEtapa2(supabase, factorId, challengeId, codigo) {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code: codigo,
  });

  if (error) throw new Error("Código 2FA inválido ou expirado");

  const { data: { user } } = await supabase.auth.getUser();

  await registrarAuditoria({
    tabela:        "auth",
    acao:          "LOGIN_2FA",
    usuario_email: user?.email,
    usuario_nome:  user?.user_metadata?.nome || user?.email,
    dados_novos:   { metodo: "totp" },
  });

  return {
    session: data.session,
    usuario: {
      id:    user?.id,
      email: user?.email,
      nome:  user?.user_metadata?.nome || user?.email,
    },
  };
}


export async function logout(supabase, usuarioEmail) {
  await registrarAuditoria({
    tabela:        "auth",
    acao:          "LOGOUT",
    usuario_email: usuarioEmail,
  });
  await supabase.auth.signOut();
}
