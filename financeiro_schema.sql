-- ══════════════════════════════════════════════════════════════
-- MÓDULO FINANCEIRO — PrevGestão v3.0
-- Execute no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════

-- Contas bancárias / financeiras
CREATE TABLE IF NOT EXISTS contas (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          text        NOT NULL,
  tipo          text        NOT NULL DEFAULT 'corrente', -- corrente | poupanca | caixa | investimento
  banco         text,
  agencia       text,
  conta_numero  text,
  saldo_inicial numeric(12,2) DEFAULT 0,
  saldo_atual   numeric(12,2) DEFAULT 0,
  ativo         boolean     DEFAULT true,
  criado_em     timestamptz DEFAULT now()
);

-- Categorias financeiras (receita / despesa)
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id    uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  nome  text    NOT NULL,
  tipo  text    NOT NULL, -- receita | despesa
  cor   text    DEFAULT '#C9A96E',
  ativo boolean DEFAULT true
);

-- Lançamentos (contas a pagar e a receber)
CREATE TABLE IF NOT EXISTS lancamentos (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo            text        NOT NULL, -- receita | despesa
  descricao       text        NOT NULL,
  valor           numeric(12,2) NOT NULL,
  data_vencimento date        NOT NULL,
  data_pagamento  date,
  status          text        DEFAULT 'pendente', -- pendente | pago | vencido | cancelado
  conta_id        uuid        REFERENCES contas(id) ON DELETE SET NULL,
  categoria_id    uuid        REFERENCES categorias_financeiras(id) ON DELETE SET NULL,
  cliente_id      uuid        REFERENCES clientes(id) ON DELETE SET NULL,
  recorrente      boolean     DEFAULT false,
  observacoes     text,
  criado_em       timestamptz DEFAULT now(),
  atualizado_em   timestamptz DEFAULT now()
);

-- Movimentações / Extrato bancário
CREATE TABLE IF NOT EXISTS movimentacoes (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  conta_id        uuid        REFERENCES contas(id) ON DELETE CASCADE NOT NULL,
  descricao       text        NOT NULL,
  valor           numeric(12,2) NOT NULL,
  tipo            text        NOT NULL, -- entrada | saida
  data_movimento  date        NOT NULL,
  conciliado      boolean     DEFAULT false,
  lancamento_id   uuid        REFERENCES lancamentos(id) ON DELETE SET NULL,
  criado_em       timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo        ON lancamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status      ON lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_vencimento  ON lancamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente     ON lancamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_conta     ON movimentacoes(conta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data      ON movimentacoes(data_movimento);

-- Trigger para atualizar atualizado_em nos lançamentos
CREATE OR REPLACE FUNCTION update_lancamento_timestamp()
RETURNS TRIGGER AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_lancamentos_updated
  BEFORE UPDATE ON lancamentos
  FOR EACH ROW EXECUTE FUNCTION update_lancamento_timestamp();

-- Trigger para atualizar saldo da conta ao inserir movimentação
CREATE OR REPLACE FUNCTION update_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.tipo = 'entrada' THEN
      UPDATE contas SET saldo_atual = saldo_atual + NEW.valor WHERE id = NEW.conta_id;
    ELSE
      UPDATE contas SET saldo_atual = saldo_atual - NEW.valor WHERE id = NEW.conta_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.tipo = 'entrada' THEN
      UPDATE contas SET saldo_atual = saldo_atual - OLD.valor WHERE id = OLD.conta_id;
    ELSE
      UPDATE contas SET saldo_atual = saldo_atual + OLD.valor WHERE id = OLD.conta_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_saldo_conta
  AFTER INSERT OR DELETE ON movimentacoes
  FOR EACH ROW EXECUTE FUNCTION update_saldo_conta();

-- RLS
ALTER TABLE contas                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE lancamentos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_contas"                 ON contas                 FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_categorias_financeiras" ON categorias_financeiras FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_lancamentos"            ON lancamentos            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_movimentacoes"          ON movimentacoes          FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Categorias padrão
INSERT INTO categorias_financeiras (nome, tipo, cor) VALUES
  ('Honorários',           'receita', '#C9A96E'),
  ('Êxito',                'receita', '#22c55e'),
  ('Consulta',             'receita', '#d4b87d'),
  ('Outras Receitas',      'receita', '#86efac'),
  ('Aluguel',              'despesa', '#ef4444'),
  ('Salários',             'despesa', '#f97316'),
  ('Cartório / Taxas',     'despesa', '#f59e0b'),
  ('Serviços de TI',       'despesa', '#8b5cf6'),
  ('Material de Escritório','despesa','#6b7280'),
  ('Outras Despesas',      'despesa', '#dc2626')
ON CONFLICT DO NOTHING;
