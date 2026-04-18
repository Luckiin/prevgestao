import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const variants = {
  primary:   "bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-900/40",
  secondary: "bg-dark-50/60 hover:bg-dark-50 text-ink-200 border border-dark-50",
  danger:    "bg-danger-600 hover:bg-danger-500 text-white",
  ghost:     "text-ink-300 hover:text-ink-100 hover:bg-white/[0.04]",
  outline:   "border border-brand-600 text-brand-400 hover:bg-brand-600/10",
};

const sizes = {
  sm:  "text-xs px-3 py-1.5 rounded-lg",
  md:  "text-sm px-4 py-2.5 rounded-xl",
  lg:  "text-sm px-5 py-3 rounded-xl",
  icon:"p-2 rounded-xl",
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
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
}
