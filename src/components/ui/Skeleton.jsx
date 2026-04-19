export default function Skeleton({ w = "100%", h = 16, rounded = 8, className = "" }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: rounded,
      background: "linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.07) 50%, rgba(255,255,255,.04) 75%)",
      backgroundSize: "200% 100%",
      animation: "sk-shimmer 1.4s ease-in-out infinite",
    }} className={className} />
  );
}

export const Sk = Skeleton;

export function SkCard({ children, style = {} }) {
  return (
    <div style={{
      background: "rgba(42,21,27,0.6)", backdropFilter: "blur(16px)",
      border: "1px solid rgba(201,169,110,.08)", borderRadius: 16, padding: 20,
      ...style,
    }}>
      {children}
      <style>{`@keyframes sk-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}
