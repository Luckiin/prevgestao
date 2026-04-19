import { Sk, SkCard } from "@/components/ui/Skeleton";
export default function LoadingAuditoria() {
  return (
    <div style={{ padding:24, maxWidth:1280, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <Sk w={220} h={26} rounded={6} />
        <div style={{ marginTop:8 }}><Sk w={280} h={13} rounded={4} /></div>
      </div>
      <SkCard style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"flex", gap:8 }}>
          {[120,90,80,100].map((w,i)=><Sk key={i} w={w} h={32} rounded={8} />)}
        </div>
        {[1,2,3,4,5,6,7,8].map(i=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 2fr 3fr 1fr", gap:16, padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,.03)", alignItems:"center" }}>
            <Sk w="70%" h={12} rounded={4} />
            <Sk w="80%" h={12} rounded={4} />
            <Sk w="90%" h={12} rounded={4} />
            <Sk w={60} h={22} rounded={11} />
          </div>
        ))}
      </SkCard>
    </div>
  );
}
