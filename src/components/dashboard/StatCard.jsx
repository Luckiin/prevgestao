"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, sub, color = "brand", trend }) {
  const colors = {
    brand: "text-gold-500",
    gold: "text-gold-500",
    success: "text-success-500",
    danger: "text-danger-500",
    warn: "text-warn-500",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5 border border-white/[0.05] transition-all hover:bg-ink-100/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-ink-500 uppercase tracking-widest">{label}</p>
          <h3 className="text-2xl font-bold text-ink-100 mt-2 tracking-tight">
            {value}
          </h3>
          {sub && <p className="text-[11px] text-ink-600 mt-1 truncate">{sub}</p>}
        </div>
        
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.03] border border-white/[0.05] shadow-inner", colors[color])}>
          <Icon size={18} />
        </div>
      </div>

      {trend !== undefined && (
        <div className={cn(
          "text-[10px] font-bold px-2 py-0.5 rounded-lg inline-flex mt-4",
          trend >= 0
            ? "text-success-500 bg-success-500/10"
            : "text-danger-500 bg-danger-500/10"
        )}>
          {trend >= 0 ? "+" : ""}{trend}%
        </div>
      )}
    </motion.div>
  );
}