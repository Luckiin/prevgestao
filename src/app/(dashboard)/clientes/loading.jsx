import { Sk, SkCard } from "@/components/ui/Skeleton";

export default function LoadingClientes() {
  return (
    <div style={{ padding: 24, maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <Sk w={220} h={26} rounded={6} />
          <div style={{ marginTop:8 }}><Sk w={180} h={13} rounded={4} /></div>
        </div>
        <Sk w={130} h={38} rounded={8} />
      </div>


      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {[80,100,90,110,80].map((w,i) => <Sk key={i} w={w} h={32} rounded={20} />)}
      </div>


      <SkCard style={{ padding:0, overflow:"hidden" }}>

        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px", gap:16, padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
          {["Cliente","CPF","Tipo","Status","Situação",""].map((_, i) => (
            <Sk key={i} w="80%" h={12} rounded={3} />
          ))}
        </div>

        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px", gap:16, padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,.03)", alignItems:"center" }}>
            <div>
              <Sk w="75%" h={13} rounded={4} />
              <div style={{ marginTop:6 }}><Sk w="50%" h={10} rounded={3} /></div>
            </div>
            <Sk w="80%" h={12} rounded={4} />
            <Sk w={70} h={22} rounded={11} />
            <Sk w={60} h={22} rounded={11} />
            <Sk w={65} h={22} rounded={11} />
            <div style={{ display:"flex", gap:6 }}>
              <Sk w={28} h={28} rounded={6} />
              <Sk w={28} h={28} rounded={6} />
            </div>
          </div>
        ))}
      </SkCard>
    </div>
  );
}
