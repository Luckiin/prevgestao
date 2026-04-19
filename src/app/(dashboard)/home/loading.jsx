import { Sk, SkCard } from "@/components/ui/Skeleton";

export default function LoadingHome() {
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Sk w={200} h={28} rounded={6} />
        <div style={{ marginTop: 8 }}><Sk w={320} h={14} rounded={4} /></div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        {[1,2,3,4].map(i => (
          <SkCard key={i}>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <Sk w={40} h={40} rounded={10} />
              <div style={{ flex:1 }}>
                <Sk w="60%" h={12} rounded={4} />
                <div style={{ marginTop:8 }}><Sk w="80%" h={24} rounded={6} /></div>
              </div>
            </div>
          </SkCard>
        ))}
      </div>

      {/* Gráfico + tabela */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <SkCard style={{ height:320 }}>
          <Sk w={180} h={16} rounded={4} />
          <div style={{ marginTop:16 }}><Sk w="100%" h={240} rounded={8} /></div>
        </SkCard>
        <SkCard style={{ height:320 }}>
          <Sk w={160} h={16} rounded={4} />
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:16 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display:"flex", gap:12 }}>
                <Sk w={32} h={32} rounded={16} />
                <div style={{ flex:1 }}>
                  <Sk w="70%" h={12} rounded={4} />
                  <div style={{ marginTop:6 }}><Sk w="40%" h={10} rounded={4} /></div>
                </div>
                <Sk w={60} h={20} rounded={4} />
              </div>
            ))}
          </div>
        </SkCard>
      </div>
    </div>
  );
}
