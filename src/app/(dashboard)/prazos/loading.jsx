import { Sk, SkCard } from "@/components/ui/Skeleton";

export default function LoadingPrazos() {
  return (
    <div style={{ padding: 24, maxWidth: 1152, margin: "0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <Sk w={200} h={26} rounded={6} />
          <div style={{ marginTop:8 }}><Sk w={280} h={13} rounded={4} /></div>
        </div>
        <Sk w={180} h={38} rounded={12} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"8fr 4fr", gap:24 }}>

        <SkCard>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <Sk w={160} h={22} rounded={6} />
            <div style={{ display:"flex", gap:8 }}>
              <Sk w={32} h={32} rounded={8} />
              <Sk w={60} h={32} rounded={8} />
              <Sk w={32} h={32} rounded={8} />
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:2 }}>
            {[...Array(7)].map((_,i) => <Sk key={i} h={28} rounded={4} />)}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
            {[...Array(35)].map((_,i) => <Sk key={i} h={80} rounded={4} />)}
          </div>
        </SkCard>


        <SkCard>
          <Sk w={80} h={11} rounded={3} />
          <div style={{ marginTop:8 }}><Sk w={160} h={22} rounded={6} /></div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:24 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ padding:16, borderRadius:12, border:"1px solid rgba(255,255,255,.05)", background:"rgba(255,255,255,.02)" }}>
                <Sk w={70} h={20} rounded={10} />
                <div style={{ marginTop:10 }}><Sk w="90%" h={14} rounded={4} /></div>
                <div style={{ marginTop:8 }}><Sk w="60%" h={11} rounded={4} /></div>
              </div>
            ))}
          </div>
        </SkCard>
      </div>
    </div>
  );
}
