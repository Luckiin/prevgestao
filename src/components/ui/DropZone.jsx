"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DropZone({ onFilesDropped, children, className, disabled = false }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter]   = useState(0);

  function handleDragEnter(e) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragActive(true);
  }

  function handleDragLeave(e) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    const newCounter = dragCounter - 1;
    setDragCounter(newCounter);
    if (newCounter === 0) {
      setIsDragActive(false);
    }
  }

  function handleDragOver(e) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e) {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFilesDropped(files);
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn("relative transition-all", className)}
    >
      {isDragActive && (
        <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center rounded-xl bg-gold-600/10 border-2 border-dashed border-gold-500/50 backdrop-blur-[2px] pointer-events-none animate-in fade-in transition-all">
          <div className="flex flex-col items-center gap-3 scale-110">
            <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-500 shadow-lg shadow-gold-500/10">
              <Upload size={24} className="animate-bounce" />
            </div>
            <p className="text-sm font-bold text-gold-400 drop-shadow-md">Solte os arquivos para anexar</p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
