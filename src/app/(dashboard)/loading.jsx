export default function Loading() {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      height:"calc(100vh - 56px)",
      flexDirection:"column", gap:16,
    }}>
      <div style={{
        width:32, height:32,
        border:"2px solid rgba(201,169,110,.15)",
        borderTop:"2px solid #C9A96E",
        borderRadius:"50%",
        animation:"spin .7s linear infinite",
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
