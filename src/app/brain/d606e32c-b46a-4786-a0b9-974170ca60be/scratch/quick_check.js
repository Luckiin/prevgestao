const url = "https://xadqapftloouaotneths.supabase.co/rest/v1/lancamentos?status=eq.pago&select=id,descricao,status,conta_id,data_pagamento,valor";
const headers = {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZHFhcGZ0bG9vdWFvdG5ldGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0ODEwMTEsImV4cCI6MjA5MjA1NzAxMX0.oGHXpTQT1XwC0jyGY8GV-w-oakQdXvFCapIzvA3Mo28",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZHFhcGZ0bG9vdWFvdG5ldGhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ4MTAxMSwiZXhwIjoyMDkyMDU3MDExfQ._erhwRRjxYC9yHok5r_pCrRj0zh8kHBU6KHRS22qw9s"
};

async function run() {
  console.log("Checking Paid Lancamentos...");
  const res = await fetch(url + "&limit=10", { headers });
  const data = await res.json();
  console.table(data);

  console.log("\nChecking Movimentacoes...");
  const res2 = await fetch("https://xadqapftloouaotneths.supabase.co/rest/v1/movimentacoes?select=id,lancamento_id,descricao,data_movimento&limit=10", { headers });
  const data2 = await res2.json();
  console.table(data2);
  
  if (data.length > 0) {
    const missing = data.filter(l => !data2.some(m => m.lancamento_id === l.id));
    console.log(`\nLançamentos pagos sem movimentação: ${missing.length}`);
    if (missing.length > 0) {
      console.log("Missing Lancamentos IDs:", missing.map(m => m.id));
    }
  }
}

run();
