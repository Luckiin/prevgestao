"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Eye, EyeOff, ShieldCheck, Loader2, KeyRound } from "lucide-react";

export default function EntrarPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const next         = params.get("next") || "/home";

  const [etapa, setEtapa]       = useState(1); // 1=email+senha, 2=código TOTP
  const [email, setEmail]       = useState("");
  const [senha, setSenha]       = useState("");
  const [codigo, setCodigo]     = useState("");
  const [mfaCtx, setMfaCtx]    = useState(null); // { factor_id, challenge_id }
  const [mostraSenha, setMostraSenha] = useState(false);
  const [erro, setErro]         = useState("");
  const [loading, setLoading]   = useState(false);

  /* ── Etapa 1: e-mail + senha ──────────────────────────────── */
  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, senha }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.erro || "Erro ao fazer login");

      if (json.mfa_required) {
        setMfaCtx({ factor_id: json.factor_id, challenge_id: json.challenge_id });
        setEtapa(2);
      } else {
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Etapa 2: código TOTP ─────────────────────────────────── */
  async function handleMFA(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/verificar-mfa", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...mfaCtx, codigo }),
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.erro || "Código inválido");

      router.push(next);
      router.refresh();
    } catch (err) {
      setErro(err.message);
      setCodigo("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/50 mb-4">
          <Scale size={26} className="text-white" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-ink-100 tracking-tight">PrevGestão</h1>
        <p className="text-sm text-ink-400 mt-1">Escritório Jurídico Previdenciário</p>
      </div>

      {/* Card */}
      <div className="glass-card rounded-2xl p-7">
        {etapa === 1 ? (
          <>
            <h2 className="text-base font-semibold text-ink-200 mb-5">Acessar sistema</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="advogado@escritorio.com"
                  className="w-full bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5 text-sm text-ink-100 placeholder-ink-600
                             focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={mostraSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink-100 placeholder-ink-600
                               focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setMostraSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300 transition-colors"
                  >
                    {mostraSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {erro && (
                <p className="text-xs text-danger-500 bg-danger-500/10 border border-danger-500/20 rounded-lg px-3 py-2">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed
                           text-white font-semibold text-sm rounded-xl py-2.5 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Verificando…</>
                ) : "Entrar"}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Etapa 2 – TOTP */}
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={18} className="text-brand-400" />
              <h2 className="text-base font-semibold text-ink-200">Verificação em 2 etapas</h2>
            </div>

            <p className="text-sm text-ink-400 mb-5">
              Abra seu app autenticador e insira o código de 6 dígitos.
            </p>

            <form onSubmit={handleMFA} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-400 mb-1.5">Código TOTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                  required
                  placeholder="000000"
                  autoFocus
                  className="w-full bg-dark-300 border border-dark-50 rounded-xl px-3.5 py-2.5 text-lg text-center font-mono tracking-[0.4em] text-ink-100 placeholder-ink-600
                             focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
              </div>

              {erro && (
                <p className="text-xs text-danger-500 bg-danger-500/10 border border-danger-500/20 rounded-lg px-3 py-2">
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || codigo.length !== 6}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 disabled:cursor-not-allowed
                           text-white font-semibold text-sm rounded-xl py-2.5 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Verificando…</>
                ) : (
                  <><KeyRound size={14} /> Confirmar</>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setEtapa(1); setErro(""); setCodigo(""); }}
                className="w-full text-xs text-ink-500 hover:text-ink-300 transition-colors py-1"
              >
                ← Voltar
              </button>
            </form>
          </>
        )}
      </div>

      <p className="text-center text-xs text-ink-600 mt-6">
        PrevGestão v3.0 — Acesso restrito ao escritório
      </p>
    </div>
  );
}
