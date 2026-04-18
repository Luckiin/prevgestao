"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDataHora } from "@/lib/utils";
import { FolderOpen, Search, FileText, Download, Trash2 } from "lucide-react";

export default function DocumentosPage() {
  const [docs, setDocs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca]   = useState("");

  useEffect(() => {
    // Lista todos os documentos (via Supabase direto)
    // Nesta implementação, mostramos docs recentes de todos os clientes
    setLoading(false); // Placeholder — integrar conforme necessário
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-100 flex items-center gap-2">
          <FolderOpen size={20} className="text-brand-400" />
          Documentos do Escritório
        </h1>
        <p className="text-sm text-ink-500 mt-0.5">
          Os documentos são gerenciados na aba "Documentos" de cada cliente.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 text-center space-y-4">
        <FolderOpen size={40} className="text-ink-600 mx-auto" />
        <div>
          <p className="text-sm font-medium text-ink-300">Acesso por cliente</p>
          <p className="text-xs text-ink-500 mt-1">
            Para visualizar, fazer upload ou excluir documentos, acesse o perfil do cliente e clique na aba "Documentos".
          </p>
        </div>
        <Link
          href="/clientes"
          className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <FileText size={14} />
          Ir para Clientes
        </Link>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-ink-200 mb-3">Informações sobre armazenamento</h2>
        <div className="space-y-2 text-sm text-ink-400">
          <p>• Armazenamento via <strong className="text-ink-200">Supabase Storage</strong> — bucket <code className="text-brand-400 bg-dark-100/40 px-1.5 py-0.5 rounded">documentos-clientes</code></p>
          <p>• Upload direto pelo browser via URL assinada (sem passar pelo servidor)</p>
          <p>• Downloads protegidos com URLs temporárias (1 hora de validade)</p>
          <p>• Todo upload atualiza automaticamente o <strong className="text-ink-200">Ano de Referência</strong> do cliente</p>
          <p>• Tamanho máximo por arquivo: <strong className="text-ink-200">50 MB</strong></p>
          <p>• Pastas organizadas por cliente (personalizáveis)</p>
        </div>
      </div>
    </div>
  );
}
