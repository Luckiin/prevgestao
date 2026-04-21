"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Loader2, KeyRound } from "lucide-react";
import Image from "next/image";

/* ── estilos inline reutilizáveis ─────────────────────────── */
const INPUT = {
  width: "100%", background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(201,169,110,.15)", borderRadius: 4,
  padding: "13px 16px", fontSize: 14, color: "var(--ink-200)",
  outline: "none", transition: "border-color .2s",
  boxSizing: "border-box",
};
const LABEL = { display: "block", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(201,169,110,.6)", marginBottom: 8 };
const BTN_PRIMARY = {
  width: "100%", padding: "14px", background: "#C9A96E", color: "#080102",
  fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase",
  border: "none", borderRadius: 4, cursor: "pointer", transition: "background .2s",
  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
};

function EntrarContent() {
  const router  = useRouter();
  const params  = useSearchParams();
  const next    = params.get("next") || "/home";

  const [etapa,      setEtapa]      = useState(1);
  const [email,      setEmail]      = useState("");
  const [senha,      setSenha]      = useState("");
  const [codigo,     setCodigo]     = useState("");
  const [mfaCtx,     setMfaCtx]    = useState(null);
  const [mostraSenha,setMostraSenha]= useState(false);
  const [erro,       setErro]       = useState("");
  const [loading,    setLoading]    = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErro(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Erro ao fazer login");
      if (json.mfa_required) { setMfaCtx({ factor_id: json.factor_id, challenge_id: json.challenge_id }); setEtapa(2); }
      else { router.push(next); router.refresh(); }
    } catch (err) { setErro(err.message); }
    finally { setLoading(false); }
  }

  async function handleMFA(e) {
    e.preventDefault();
    setErro(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/verificar-mfa", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...mfaCtx, codigo }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.erro || "Código inválido");
      router.push(next); router.refresh();
    } catch (err) { setErro(err.message); setCodigo(""); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ animation: "fadeIn .5s ease-out forwards" }}>

      {/* Logo + nome */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Image src="/logo.svg" alt="Deise Lisboa Advocacia" width={72} height={72} priority style={{ objectFit: "contain" }} />
        </div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#C9A96E", marginBottom: 6 }}>
          Deise Lisboa
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(201,169,110,.4)" }}>
          Advocacia — Área Restrita
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,.025)",
        border: "1px solid rgba(201,169,110,.12)",
        borderRadius: 6, padding: "36px 32px",
        backdropFilter: "blur(16px)",
      }}>
        {/* Linha ouro topo */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #C9A96E, rgba(201,169,110,.3))", borderRadius: 2, marginBottom: 32 }} />

        {etapa === 1 ? (
          <>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: "var(--ink-200)", marginBottom: 28 }}>
              Acesso ao sistema
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 20 }}>
                <label style={LABEL}>E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="advogada@escritorio.com"
                  style={INPUT}
                  onFocus={e => e.target.style.borderColor = "rgba(201,169,110,.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(201,169,110,.15)"}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={LABEL}>Senha</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={mostraSenha ? "text" : "password"} value={senha}
                    onChange={e => setSenha(e.target.value)} required placeholder="••••••••"
                    style={{ ...INPUT, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = "rgba(201,169,110,.5)"}
                    onBlur={e => e.target.style.borderColor = "rgba(201,169,110,.15)"}
                  />
                  <button type="button" onClick={() => setMostraSenha(v => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(201,169,110,.5)", display: "flex", alignItems: "center" }}>
                    {mostraSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 20 }}>
                  {erro}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ ...BTN_PRIMARY, opacity: loading ? .6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#e8d5a3"; }}
                onMouseLeave={e => e.currentTarget.style.background = "#C9A96E"}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando…</> : "Entrar"}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <ShieldCheck size={20} style={{ color: "#C9A96E" }} />
              <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: "var(--ink-200)" }}>
                Verificação em 2 etapas
              </p>
            </div>

            <p style={{ fontSize: 13, color: "var(--ink-400)", marginBottom: 28, lineHeight: 1.7 }}>
              Abra o aplicativo autenticador e insira o código de 6 dígitos.
            </p>

            <form onSubmit={handleMFA}>
              <div style={{ marginBottom: 24 }}>
                <label style={LABEL}>Código TOTP</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={codigo} onChange={e => setCodigo(e.target.value.replace(/\D/g, ""))}
                  required placeholder="000000" autoFocus
                  style={{ ...INPUT, textAlign: "center", fontSize: 28, fontFamily: "monospace", letterSpacing: "0.5em", paddingTop: 16, paddingBottom: 16 }}
                  onFocus={e => e.target.style.borderColor = "rgba(201,169,110,.5)"}
                  onBlur={e => e.target.style.borderColor = "rgba(201,169,110,.15)"}
                />
              </div>

              {erro && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#f87171", marginBottom: 20 }}>
                  {erro}
                </div>
              )}

              <button type="submit" disabled={loading || codigo.length !== 6}
                style={{ ...BTN_PRIMARY, opacity: (loading || codigo.length !== 6) ? .5 : 1, cursor: (loading || codigo.length !== 6) ? "not-allowed" : "pointer", marginBottom: 12 }}
                onMouseEnter={e => { if (!loading && codigo.length === 6) e.currentTarget.style.background = "#e8d5a3"; }}
                onMouseLeave={e => e.currentTarget.style.background = "#C9A96E"}
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Verificando…</> : <><KeyRound size={14} /> Confirmar</>}
              </button>

              <button type="button" onClick={() => { setEtapa(1); setErro(""); setCodigo(""); }}
                style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(201,169,110,.45)", padding: "8px 0", transition: "color .2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#C9A96E"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(201,169,110,.45)"}
              >
                ← Voltar
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink-600)", marginTop: 24, letterSpacing: "0.05em" }}>
        PrevGestão v3.0 — Acesso restrito ao escritório
      </p>
    </div>
  );
}

export default function EntrarPage() {
  return <Suspense fallback={null}><EntrarContent /></Suspense>;
}
