"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />


          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full glass-card rounded-2xl shadow-2xl shadow-black/50 overflow-hidden",
              sizes[size]
            )}
          >

            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <h2 className="text-base font-semibold text-ink-100">{title}</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-200 hover:bg-white/[0.06] transition-all"
              >
                <X size={15} />
              </button>
            </div>


            <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
