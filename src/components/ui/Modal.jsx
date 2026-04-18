"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  const sizes = {
    sm:  "max-w-sm",
    md:  "max-w-lg",
    lg:  "max-w-2xl",
    xl:  "max-w-4xl",
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full glass-card rounded-2xl shadow-2xl shadow-black/50 animate-slide-up",
          sizes[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
          <h2 className="text-base font-semibold text-ink-100">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-200 hover:bg-white/[0.06] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
