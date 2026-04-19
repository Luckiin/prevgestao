import { Sk, SkCard } from "@/components/ui/Skeleton";
export default function LoadingRelatorios() {
  return (
    <div style={{ padding:24, maxWidth:1280, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <Sk w={180} h={26} rounded={6} />
        <div style={{ marginTop:8 }}><Sk w={300} h={13} rounded={4} /></div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[1,2,3].map(i => (
          <SkCard key={i}>
            <Sk w={40} h={40} rounded={10} />
            <div style={{ marginTop:12 }}><Sk w="70%" h={16} rounded={4} /></div>
            <div style={{ marginTop:8 }}><Sk w="90%" h={12} rounded={3} /></div>
            <div style={{ marginTop:16 }}><Sk w={100} h={34} rounded={8} /></div>
          </SkCard>
        ))}
      </div>
      <SkCard>
        <Sk w={200} h={16} rounded={4} />
        <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:12 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center" }}>
              <Sk w={36} h={36} rounded={18} />
              <div style={{ flex:1 }}><Sk w="60%" h={13} rounded={4} /></div>
              <Sk w={80} h={13} rounded={4} />
              <Sk w={70} h={24} rounded={6} />
            </div>
          ))}
        </div>
      </SkCard>
    </div>
  );
}
