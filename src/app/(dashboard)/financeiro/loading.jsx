import { Sk, SkCard } from "@/components/ui/Skeleton";

export default function LoadingFinanceiro() {
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <Sk w={160} h={24} rounded={6} />
          <div style={{ marginTop:8 }}><Sk w={240} h={13} rounded={4} /></div>
        </div>
        <Sk w={32} h={32} rounded={8} />
      </div>


      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[1,2,3,4].map(i => (
          <SkCard key={i}>
            <div style={{ display:"flex", gap:12 }}>
              <Sk w={40} h={40} rounded={10} />
              <div style={{ flex:1 }}>
                <Sk w="60%" h={11} rounded={3} />
                <div style={{ marginTop:8 }}><Sk w="85%" h={28} rounded={6} /></div>
              </div>
            </div>
          </SkCard>
        ))}
      </div>


      <SkCard style={{ marginBottom:20 }}>
        <Sk w={220} h={15} rounded={4} />
        <div style={{ marginTop:16 }}><Sk w="100%" h={220} rounded={8} /></div>
      </SkCard>


      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {[1,2,3].map(i => (
          <SkCard key={i}>
            <Sk w={120} h={14} rounded={4} />
            <div style={{ display:"flex", gap:24, marginTop:16 }}>
              <div><Sk w={60} h={11} rounded={3} /><div style={{ marginTop:8 }}><Sk w={80} h={22} rounded={6} /></div></div>
              <div><Sk w={60} h={11} rounded={3} /><div style={{ marginTop:8 }}><Sk w={80} h={22} rounded={6} /></div></div>
            </div>
          </SkCard>
        ))}
      </div>


      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        {[1,2].map(i => (
          <SkCard key={i}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <Sk w={140} h={15} rounded={4} />
              <Sk w={80} h={24} rounded={6} />
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <Sk w={180} h={180} rounded={90} />
            </div>
          </SkCard>
        ))}
      </div>
    </div>
  );
}
