"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, FileText, Download, RefreshCw, X, Info } from "lucide-react";
import { toast } from "sonner";
import DropZone from "@/components/ui/DropZone";

export default function AnexoFinanceiro({ lancamentoId }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function carregar() {
    if (!lancamentoId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/financeiro/lancamentos/${lancamentoId}/documentos`);
      if (res.ok) setDocumentos(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [lancamentoId]);

  async function processarArquivo(file) {
    setUploading(true);
    try {
      // 1. Obter URL de upload
      const resUrl = await fetch(`/api/financeiro/lancamentos/${lancamentoId}/documentos`, {
        method: "POST",
        body: JSON.stringify({ action: "upload_url", nome: file.name }),
      });
      const { signedUrl, path } = await resUrl.json();

      // 2. Upload para o Storage
      const resStorage = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!resStorage.ok) throw new Error(`Erro no upload do arquivo ${file.name}`);

      // 3. Registrar no Banco
      const resDB = await fetch(`/api/financeiro/lancamentos/${lancamentoId}/documentos`, {
        method: "POST",
        body: JSON.stringify({
          nome: file.name,
          tipo_mime: file.type,
          tamanho: file.size,
          storage_path: path,
        }),
      });
      if (!resDB.ok) throw new Error(`Erro ao registrar documento ${file.name}`);

      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  }

  async function handleFiles(files) {
    if (!files || files.length === 0 || !lancamentoId) return;
    
    setUploading(true);
    let sucessos = 0;
    for (const file of files) {
      const ok = await processarArquivo(file);
      if (ok) sucessos++;
    }
    
    if (sucessos > 0) {
      toast.success(`${sucessos} arquivo(s) anexado(s) com sucesso!`);
      carregar();
    }
    setUploading(false);
  }

  async function excluir(id) {
    if (!confirm("Excluir este anexo?")) return;
    try {
      const res = await fetch(`/api/financeiro/lancamentos/${lancamentoId}/documentos?docId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Anexo removido.");
        carregar();
      }
    } catch (err) {
      toast.error("Erro ao excluir.");
    }
  }

  async function baixar(doc) {
    try {
      const res = await fetch(`/api/documentos/download?path=${encodeURIComponent(doc.storage_path)}&bucket=financeiro-documentos`);
      const { url } = await res.json();
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Erro ao baixar arquivo.");
    }
  }

  if (!lancamentoId) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <Info size={28} className="mb-3 text-ink-600 opacity-30" />
        <p className="text-sm text-ink-400">Salve o lançamento primeiro para poder anexar documentos.</p>
      </div>
    );
  }

  return (
    <DropZone onFilesDropped={handleFiles} disabled={uploading}>
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Documentos Anexados ({documentos.length})</h3>
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gold-500/10 text-gold-500 text-xs font-bold cursor-pointer hover:bg-gold-500/20 transition-all">
            {uploading ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />}
            {uploading ? "Enviando..." : "Anexar arquivo"}
            <input type="file" className="hidden" multiple onChange={(e) => handleFiles(Array.from(e.target.files))} disabled={uploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw size={20} className="animate-spin text-ink-600" />
            </div>
          ) : documentos.length === 0 ? (
            <div className="border-2 border-dashed border-white/5 rounded-xl py-10 flex flex-col items-center justify-center text-ink-600">
              <FileText size={24} className="mb-2 opacity-20" />
              <p className="text-xs">Clique em anexar ou arraste arquivos aqui.</p>
            </div>
          ) : (
            documentos.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-ink-400">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-200 truncate font-medium">{doc.nome}</p>
                  <p className="text-[10px] text-ink-600 uppercase">{(doc.tamanho / 1024).toFixed(0)} KB • {new Date(doc.criado_em).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => baixar(doc)} className="p-1.5 rounded text-ink-500 hover:text-gold-500 hover:bg-gold-500/10 transition-all">
                    <Download size={14} />
                  </button>
                  <button onClick={() => excluir(doc.id)} className="p-1.5 rounded text-ink-500 hover:text-danger-500 hover:bg-danger-500/10 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DropZone>
  );
}
