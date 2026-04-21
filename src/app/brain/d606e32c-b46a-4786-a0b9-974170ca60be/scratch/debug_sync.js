const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSync() {
  console.log('--- Checking Lancamentos ---')
  const { data: lancs, error: err1 } = await supabase
    .from('lancamentos')
    .select('id, descricao, status, data_pagamento, valor')
    .eq('status', 'pago')
    .limit(10)
  
  if (err1) console.error(err1)
  else console.table(lancs)

  console.log('--- Checking Movimentacoes ---')
  const { data: movs, error: err2 } = await supabase
    .from('movimentacoes')
    .select('id, lancamento_id, descricao, data_movimento, valor')
    .limit(10)

  if (err2) console.error(err2)
  else console.table(movs)
  
  if (lancs && movs) {
    const missing = lancs.filter(l => !movs.some(m => m.lancamento_id === l.id))
    console.log(`\nLançamentos pagos sem movimentação: ${missing.length}`)
    if (missing.length > 0) {
      console.log('Exemplos de IDs faltantes:', missing.map(m => m.id).join(', '))
    }
  }
}

checkSync()
