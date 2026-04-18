import { cn } from "@/lib/utils";

export default function Input({
  label,
  error,
  hint,
  className,
  containerClassName,
  ...props
}) {
  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label className="block text-xs font-medium text-ink-400">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full bg-dark-300 border rounded-xl px-3.5 py-2.5 text-sm text-ink-100 placeholder-ink-600",
          "focus:outline-none focus:ring-1 transition-all",
          error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
            : "border-dark-50 focus:border-brand-500 focus:ring-brand-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

export function Select({ label, error, children, containerClassName, className, ...props }) {
  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label className="block text-xs font-medium text-ink-400">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          "w-full bg-dark-300 border rounded-xl px-3.5 py-2.5 text-sm text-ink-100",
          "focus:outline-none focus:ring-1 transition-all appearance-none",
          error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
            : "border-dark-50 focus:border-brand-500 focus:ring-brand-500/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, containerClassName, className, ...props }) {
  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <label className="block text-xs font-medium text-ink-400">
          {label}
        </label>
      )}
      <textarea
        rows={3}
        className={cn(
          "w-full bg-dark-300 border rounded-xl px-3.5 py-2.5 text-sm text-ink-100 placeholder-ink-600 resize-none",
          "focus:outline-none focus:ring-1 transition-all",
          error
            ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
            : "border-dark-50 focus:border-brand-500 focus:ring-brand-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
