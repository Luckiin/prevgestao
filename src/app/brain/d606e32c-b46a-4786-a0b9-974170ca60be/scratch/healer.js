const headers = {
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZHFhcGZ0bG9vdWFvdG5ldGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0ODEwMTEsImV4cCI6MjA5MjA1NzAxMX0.oGHXpTQT1XwC0jyGY8GV-w-oakQdXvFCapIzvA3Mo28",
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZHFhcGZ0bG9vdWFvdG5ldGhzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ4MTAxMSwiZXhwIjoyMDkyMDU3MDExfQ._erhwRRjxYC9yHok5r_pCrRj0zh8kHBU6KHRS22qw9s",
  "Content-Type": "application/json"
};

const BASE_URL = "https://xadqapftloouaotneths.supabase.co/rest/v1";

async function heal() {
  console.log("--- Iniciando Reparo do Extrato ---");
  
  // 1. Buscar todos os lançamentos pagos
  const resL = await fetch(`${BASE_URL}/lancamentos?status=eq.pago&select=*`, { headers });
  const lancamentos = await resL.json();
  console.log(`Encontrados ${lancamentos.length} lançamentos pagos.`);

  // 2. Buscar todas as movimentações existentes
  const resM = await fetch(`${BASE_URL}/movimentacoes?select=lancamento_id`, { headers });
  const movimentacoes = await resM.json();
  const idsJaSync = new Set(movimentacoes.map(m => m.lancamento_id).filter(Boolean));

  // 3. Filtrar os que não estão sincronizados
  const faltantes = lancamentos.filter(l => !idsJaSync.has(l.id));
  console.log(`Identificados ${faltantes.length} itens faltantes no extrato.`);

  if (faltantes.length === 0) {
    console.log("Tudo já está sincronizado!");
    return;
  }

  // 4. Inserir os faltantes
  for (const l of faltantes) {
    console.log(`Sincronizando: ${l.descricao} (${l.id})...`);
    const payload = {
      lancamento_id:  l.id,
      conta_id:       l.conta_id || "00000000-0000-0000-0000-000000000001",
      data_movimento: l.data_pagamento || l.data_vencimento,
      descricao:      l.descricao,
      valor:          l.valor_pago || l.valor,
      tipo:           l.tipo === "receita" ? "entrada" : "saida",
      conciliado:     false
    };

    const resIn = await fetch(`${BASE_URL}/movimentacoes`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (resIn.ok) {
      console.log(`✓ OK`);
    } else {
      const err = await resIn.json();
      console.error(`✗ Erro:`, err);
    }
  }

  console.log("--- Reparo Concluído! ---");
}

heal();
