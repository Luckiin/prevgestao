"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const supabase                = createClient();

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUsuario({
          id:    user.id,
          email: user.email,
          nome:  user.user_metadata?.nome || user.email,
        });
      }
      setLoading(false);
    });

    // Listener de mudanças de sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUsuario({
            id:    session.user.id,
            email: session.user.email,
            nome:  session.user.user_metadata?.nome || session.user.email,
          });
        } else {
          setUsuario(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsuario(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
