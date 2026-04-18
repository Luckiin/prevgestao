import { cn } from "@/lib/utils";

const variants = {
  ativo:     "bg-success-500/10 text-success-500 border-success-500/20",
  inativo:   "bg-ink-500/10 text-ink-400 border-ink-500/20",
  concluido: "bg-brand-500/10 text-brand-400 border-brand-500/20",
  urgente:   "bg-danger-500/10 text-danger-500 border-danger-500/20",
  aviso:     "bg-warn-500/10 text-warn-500 border-warn-500/20",
  neutro:    "bg-dark-50/40 text-ink-300 border-dark-50",
  gold:      "bg-gold-500/10 text-gold-500 border-gold-500/20",
};

export default function Badge({ children, variant = "neutro", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border",
        variants[variant] || variants.neutro,
        className
      )}
    >
      {children}
    </span>
  );
}
