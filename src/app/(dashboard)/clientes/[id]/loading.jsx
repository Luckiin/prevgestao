import { Sk, SkCard } from "@/components/ui/Skeleton";
export default function LoadingClienteDetalhe() {
  return (
    <div style={{ padding:24, maxWidth:1280, margin:"0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:20 }}>
        <Sk w={80} h={13} rounded={4} />
        <Sk w={8} h={8} rounded={4} />
        <Sk w={160} h={13} rounded={4} />
      </div>
      {/* Header do cliente */}
      <SkCard style={{ marginBottom:20 }}>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <Sk w={64} h={64} rounded={32} />
          <div style={{ flex:1 }}>
            <Sk w={280} h={24} rounded={6} />
            <div style={{ marginTop:10, display:"flex", gap:10 }}>
              <Sk w={80} h={24} rounded={12} />
              <Sk w={90} h={24} rounded={12} />
              <Sk w={100} h={24} rounded={12} />
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Sk w={100} h={36} rounded={8} />
            <Sk w={90} h={36} rounded={8} />
          </div>
        </div>
      </SkCard>
      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:16 }}>
        {[100,110,90,120,100].map((w,i)=><Sk key={i} w={w} h={36} rounded={8} />)}
      </div>
      {/* Conteúdo */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[1,2,3,4].map(i=>(
          <SkCard key={i}>
            <Sk w={140} h={16} rounded={4} />
            <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:12 }}>
              {[1,2,3].map(j=>(
                <div key={j} style={{ display:"flex", justifyContent:"space-between" }}>
                  <Sk w="40%" h={12} rounded={4} />
                  <Sk w="45%" h={12} rounded={4} />
                </div>
              ))}
            </div>
          </SkCard>
        ))}
      </div>
    </div>
  );
}
