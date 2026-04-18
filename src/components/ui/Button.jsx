import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:   "bg-gold-500 hover:bg-gold-300 text-dark-400 font-bold shadow-sm",
  secondary: "bg-dark-50/40 hover:bg-dark-50 text-ink-200 border border-white/[0.06]",
  danger:    "bg-danger-600 hover:bg-danger-500 text-white",
  ghost:     "text-ink-300 hover:text-ink-200 hover:bg-white/[0.04]",
  outline:   "border border-gold-500/50 text-gold-500 hover:bg-gold-500/10",
};

const sizes = {
  sm:   "text-xs px-3 py-1.5 rounded",
  md:   "text-sm px-4 py-2.5 rounded",
  lg:   "text-sm px-5 py-3 rounded",
  icon: "p-2 rounded",
};

export default function Button({
  children,
  variant   = "primary",
  size      = "md",
  loading   = false,
  disabled  = false,
  className,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      style={{ letterSpacing: "0.04em" }}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
