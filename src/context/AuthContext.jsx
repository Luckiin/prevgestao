"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const supabase                = createClient();

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user && mounted) {
          const user = session.user;
          setUsuario({
            id:    user.id,
            email: user.email,
            nome:  user.user_metadata?.nome || user.user_metadata?.full_name || user.email,
          });
        }
      } catch (err) {
        console.error("Erro ao verificar auth:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUsuario({
            id:    session.user.id,
            email: session.user.email,
            nome:  session.user.user_metadata?.nome || session.user.user_metadata?.full_name || session.user.email,
          });
        } else {
          setUsuario(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUsuario(null);
    window.location.href = "/login";
  }

  async function updateProfile(metadata) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Sessão não encontrada ou expirada. Por favor, tente recarregar a página.");

    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    if (error) throw error;
    if (data.user) {
      setUsuario({
        id:    data.user.id,
        email: data.user.email,
        nome:  data.user.user_metadata?.nome || data.user.user_metadata?.full_name || data.user.email,
      });
    }
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
