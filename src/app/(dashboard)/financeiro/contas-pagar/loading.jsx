import { Sk, SkCard } from "@/components/ui/Skeleton";

export default function LoadingTabela() {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh" }}>

      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.05)", background:"rgba(13,3,7,.5)" }}>
        <Sk w={130} h={36} rounded={8} />
        <Sk w={90} h={36} rounded={8} />
        <div style={{ flex:1 }} />
        <Sk w={80} h={32} rounded={8} />
        <Sk w={90} h={32} rounded={8} />
        <Sk w={32} h={32} rounded={8} />
      </div>


      <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,.04)", background:"rgba(13,3,7,.3)" }}>
        <Sk w={90} h={28} rounded={14} />
        {[...Array(12)].map((_,i) => <Sk key={i} w={44} h={28} rounded={14} />)}
      </div>


      <div style={{ flex:1, overflow:"hidden" }}>

        <div style={{ display:"grid", gridTemplateColumns:"40px 32px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px", gap:8, padding:"10px 12px", background:"rgba(13,3,7,.6)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
          {[...Array(11)].map((_,i) => <Sk key={i} h={12} rounded={3} />)}
        </div>

        {[...Array(8)].map((_,i) => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"40px 32px 2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 80px", gap:8, padding:"14px 12px", borderBottom:"1px solid rgba(255,255,255,.03)", alignItems:"center" }}>
            <Sk h={16} rounded={4} />
            <Sk w={20} h={20} rounded={10} />
            <Sk w="80%" h={13} rounded={4} />
            <Sk w="70%" h={12} rounded={4} />
            <Sk w="60%" h={12} rounded={4} />
            <Sk w="50%" h={12} rounded={4} />
            <Sk w="65%" h={12} rounded={4} />
            <Sk w={55} h={22} rounded={11} />
            <Sk w="70%" h={12} rounded={4} />
            <Sk w="75%" h={12} rounded={4} />
            <Sk w={60} h={24} rounded={6} />
          </div>
        ))}
      </div>


      <div style={{ padding:"10px 20px", borderTop:"1px solid rgba(255,255,255,.05)", background:"rgba(13,3,7,.4)" }}>
        <Sk w={300} h={20} rounded={4} />
      </div>


      <div style={{ display:"flex", gap:24, padding:"10px 20px", borderTop:"1px solid rgba(255,255,255,.06)", background:"rgba(10,2,5,.6)" }}>
        <Sk w={160} h={16} rounded={4} />
        <Sk w={140} h={16} rounded={4} />
        <Sk w={120} h={16} rounded={4} />
        <div style={{ flex:1 }} />
        <Sk w={80} h={14} rounded={4} />
        <Sk w={80} h={14} rounded={4} />
        <Sk w={90} h={14} rounded={4} />
      </div>
    </div>
  );
}
