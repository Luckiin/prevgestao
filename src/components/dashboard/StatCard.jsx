import { cn } from "@/lib/utils";

export default function StatCard({ icon: Icon, label, value, sub, color = "brand", trend }) {
  const colors = {
    brand: "text-gold-500 bg-gold-500/10",
    gold: "text-gold-500 bg-gold-500/10",
    success: "text-success-500 bg-success-500/10",
    danger: "text-danger-500 bg-danger-500/10",
    warn: "text-warn-500 bg-warn-500/10",
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex items-start gap-4 hover:border-gold-500/20 transition-all">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", colors[color])}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-ink-100 leading-none">{value}</p>
        {sub && <p className="text-xs text-ink-500 mt-1 truncate">{sub}</p>}
      </div>

      {trend !== undefined && (
        <div className={cn(
          "text-xs font-medium px-2 py-0.5 rounded-lg",
          trend >= 0
            ? "text-success-500 bg-success-500/10"
            : "text-danger-500 bg-danger-500/10"
        )}>
          {trend >= 0 ? "+" : ""}{trend}%
        </div>
      )}
    </div>
  );
}