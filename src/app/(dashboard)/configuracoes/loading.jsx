import { Sk, SkCard } from "@/components/ui/Skeleton";
export default function LoadingConfiguracoes() {
  return (
    <div style={{ padding:24, maxWidth:900, margin:"0 auto" }}>
      <div style={{ marginBottom:24 }}>
        <Sk w={180} h={26} rounded={6} />
        <div style={{ marginTop:8 }}><Sk w={260} h={13} rounded={4} /></div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {[1,2,3].map(i=>(
          <SkCard key={i}>
            <Sk w={160} h={18} rounded={5} />
            <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[1,2,3,4].map(j=>(
                <div key={j}>
                  <Sk w={100} h={12} rounded={3} />
                  <div style={{ marginTop:8 }}><Sk w="100%" h={38} rounded={8} /></div>
                </div>
              ))}
            </div>
          </SkCard>
        ))}
      </div>
    </div>
  );
}
