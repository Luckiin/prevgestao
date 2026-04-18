-- =============================================================
--  PrevGestao v3.0 - Schema Supabase
--  Sistema de Gerenciamento de Escritorio Juridico Previdenciario
-- =============================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------
-- DROP (ordem reversa de dependencias)
-- DROP TABLE CASCADE remove triggers e indices automaticamente.
-- Functions sao dropadas antes para evitar dependencias.
-- ---------------------------------------------------------------
drop function if exists fn_update_ano_referencia(uuid, text) cascade;
drop function if exists fn_trigger_documento_ano()            cascade;
drop function if exists fn_trigger_prazo_ano()                cascade;
drop function if exists fn_trigger_cliente_ano()              cascade;
drop function if exists fn_set_updated_at()                   cascade;

drop view if exists public.v_prazos_proximos   cascade;
drop view if exists public.v_resumo_anual      cascade;
drop view if exists public.v_clientes_completo cascade;

drop table if exists public.auditoria        cascade;
drop table if exists public.historico_anual  cascade;
drop table if exists public.documentos       cascade;
drop table if exists public.prazos           cascade;
drop table if exists public.clientes         cascade;
drop table if exists public.subdivisoes      cascade;


-- ===============================================================
-- TABELAS
-- ===============================================================

-- 1. Subdivisoes Previdenciarias (dinamicas e ilimitadas)
create table public.subdivisoes (
  id            uuid        primary key default gen_random_uuid(),
  nome          text        not null,
  tipo          text        not null check (tipo in ('administrativo', 'judicial')),
  ativo         boolean     not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Dados iniciais
insert into public.subdivisoes (nome, tipo) values
  ('Aposentadoria por Idade',                 'administrativo'),
  ('Aposentadoria por Tempo de Contribuicao', 'administrativo'),
  ('Aposentadoria por Invalidez',             'administrativo'),
  ('Auxilio-Doenca',                          'administrativo'),
  ('BPC/LOAS',                                'administrativo'),
  ('Pensao por Morte',                        'administrativo'),
  ('Salario-Maternidade',                     'administrativo'),
  ('Revisao de Beneficio',                    'administrativo'),
  ('Aposentadoria por Idade',                 'judicial'),
  ('Aposentadoria por Invalidez',             'judicial'),
  ('Auxilio-Doenca',                          'judicial'),
  ('BPC/LOAS',                                'judicial'),
  ('Pensao por Morte',                        'judicial'),
  ('Revisao de Beneficio',                    'judicial'),
  ('Auxilio-Acidente',                        'judicial');


-- 2. Clientes / Processos
create table public.clientes (
  id               uuid        primary key default gen_random_uuid(),

  -- Dados pessoais
  nome             text        not null,
  cpf              text        not null unique,
  data_nascimento  date        not null,

  -- Credenciais INSS (criptografadas AES-256-GCM na camada de aplicacao)
  login_inss       text,
  senha_inss       text,

  -- Processo
  tipo_processo    text        not null check (tipo_processo in ('administrativo', 'judicial')),
  subdivisao_id    uuid        references public.subdivisoes(id) on delete set null,
  status           text        not null default 'Ativo'
                               check (status in ('Ativo', 'Inativo', 'Concluído')),
  numero_processo  text,
  valor_beneficio  numeric(12,2),
  observacoes      text,

  -- Rastreamento anual (indexado para buscas rapidas)
  ano_referencia   integer     not null default extract(year from now())::integer,

  -- Controle
  data_entrada     timestamptz not null default now(),
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create index idx_clientes_cpf           on public.clientes (cpf);
create index idx_clientes_status        on public.clientes (status);
create index idx_clientes_ano           on public.clientes (ano_referencia);
create index idx_clientes_subdivisao    on public.clientes (subdivisao_id);
create index idx_clientes_tipo_processo on public.clientes (tipo_processo);


-- 3. Prazos
create table public.prazos (
  id            uuid        primary key default gen_random_uuid(),
  cliente_id    uuid        not null references public.clientes(id) on delete cascade,
  descricao     text        not null,
  data_prazo    date        not null,
  concluido     boolean     not null default false,
  criado_por    text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index idx_prazos_cliente   on public.prazos (cliente_id);
create index idx_prazos_data      on public.prazos (data_prazo);
create index idx_prazos_concluido on public.prazos (concluido);


-- 4. Documentos
create table public.documentos (
  id            uuid        primary key default gen_random_uuid(),
  cliente_id    uuid        not null references public.clientes(id) on delete cascade,
  nome          text        not null,
  tipo_mime     text,
  tamanho       integer,
  storage_path  text        not null,
  pasta         text        not null default 'Geral',
  criado_por    text,
  criado_em     timestamptz not null default now()
);

create index idx_documentos_cliente on public.documentos (cliente_id);
create index idx_documentos_pasta   on public.documentos (pasta);


-- 5. Historico Anual (log de migracoes de ano)
create table public.historico_anual (
  id            uuid        primary key default gen_random_uuid(),
  cliente_id    uuid        not null references public.clientes(id) on delete cascade,
  ano_anterior  integer     not null,
  ano_novo      integer     not null,
  motivo        text        not null,
  usuario_email text,
  migrado_em    timestamptz not null default now()
);

create index idx_hist_anual_cliente on public.historico_anual (cliente_id);
create index idx_hist_anual_anos    on public.historico_anual (ano_anterior, ano_novo);


-- 6. Auditoria (imutavel)
create table public.auditoria (
  id               uuid        primary key default gen_random_uuid(),
  tabela           text        not null,
  registro_id      uuid,
  acao             text        not null,
  dados_anteriores jsonb,
  dados_novos      jsonb,
  usuario_email    text,
  usuario_nome     text,
  ip_address       text,
  criado_em        timestamptz not null default now()
);

create index idx_auditoria_tabela    on public.auditoria (tabela);
create index idx_auditoria_registro  on public.auditoria (registro_id);
create index idx_auditoria_usuario   on public.auditoria (usuario_email);
create index idx_auditoria_criado_em on public.auditoria (criado_em desc);


-- ===============================================================
-- FUNCOES AUXILIARES
-- Nota: usamos $func$ como delimitador para evitar conflito com
-- aspas simples, e := (SELECT ...) em vez de SELECT INTO variable
-- para compatibilidade com o SQL Editor do Supabase.
-- ===============================================================

-- fn_set_updated_at: atualiza atualizado_em automaticamente
create or replace function fn_set_updated_at()
returns trigger language plpgsql as $func$
begin
  new.atualizado_em := now();
  return new;
end;
$func$;


-- fn_update_ano_referencia: migra cliente para o ano corrente se necessario
create or replace function fn_update_ano_referencia(
  p_cliente_id uuid,
  p_motivo     text default 'Atividade registrada'
)
returns void language plpgsql security definer as $func$
declare
  ano_atual    integer;
  ano_anterior integer;
begin
  ano_atual    := extract(year from now())::integer;
  ano_anterior := (
    select c.ano_referencia
      from public.clientes c
     where c.id = p_cliente_id
  );

  if ano_anterior is not null and ano_anterior <> ano_atual then
    insert into public.historico_anual
      (cliente_id, ano_anterior, ano_novo, motivo)
    values
      (p_cliente_id, ano_anterior, ano_atual, p_motivo);

    update public.clientes
       set ano_referencia = ano_atual
     where id = p_cliente_id;
  end if;
end;
$func$;


-- Trigger: clientes -> atualiza ano ao mudar status ou dados sensiveis
create or replace function fn_trigger_cliente_ano()
returns trigger language plpgsql as $func$
begin
  if (new.status = 'Ativo' and old.status <> 'Ativo')
     or (new.observacoes is distinct from old.observacoes and new.observacoes is not null)
     or (new.numero_processo is distinct from old.numero_processo)
     or (new.valor_beneficio is distinct from old.valor_beneficio)
     or (new.subdivisao_id   is distinct from old.subdivisao_id)
  then
    perform fn_update_ano_referencia(
      new.id,
      'Alteracao de dados do cliente'
    );
  end if;
  return new;
end;
$func$;

create trigger trg_cliente_ano
  after update on public.clientes
  for each row
  execute function fn_trigger_cliente_ano();


-- Trigger: prazos -> atualiza ano do cliente ao adicionar prazo
create or replace function fn_trigger_prazo_ano()
returns trigger language plpgsql as $func$
begin
  perform fn_update_ano_referencia(
    new.cliente_id,
    'Novo prazo adicionado: ' || new.descricao
  );
  return new;
end;
$func$;

create trigger trg_prazo_ano
  after insert on public.prazos
  for each row
  execute function fn_trigger_prazo_ano();


-- Trigger: documentos -> atualiza ano do cliente ao fazer upload
create or replace function fn_trigger_documento_ano()
returns trigger language plpgsql as $func$
begin
  perform fn_update_ano_referencia(
    new.cliente_id,
    'Upload de documento: ' || new.nome
  );
  return new;
end;
$func$;

create trigger trg_documento_ano
  after insert on public.documentos
  for each row
  execute function fn_trigger_documento_ano();


-- Triggers de updated_at
create trigger trg_cliente_updated_at
  before update on public.clientes
  for each row execute function fn_set_updated_at();

create trigger trg_prazo_updated_at
  before update on public.prazos
  for each row execute function fn_set_updated_at();

create trigger trg_subdivisao_updated
  before update on public.subdivisoes
  for each row execute function fn_set_updated_at();


-- ===============================================================
-- ROW LEVEL SECURITY (RLS)
-- Ambos os usuarios tem role 'authenticated' com acesso identico.
-- ===============================================================

alter table public.subdivisoes     enable row level security;
alter table public.clientes        enable row level security;
alter table public.prazos          enable row level security;
alter table public.documentos      enable row level security;
alter table public.historico_anual enable row level security;
alter table public.auditoria       enable row level security;

-- Subdivisoes
create policy "subdivisoes_select" on public.subdivisoes for select to authenticated using (true);
create policy "subdivisoes_insert" on public.subdivisoes for insert to authenticated with check (true);
create policy "subdivisoes_update" on public.subdivisoes for update to authenticated using (true);

-- Clientes
create policy "clientes_select" on public.clientes for select to authenticated using (true);
create policy "clientes_insert" on public.clientes for insert to authenticated with check (true);
create policy "clientes_update" on public.clientes for update to authenticated using (true);
create policy "clientes_delete" on public.clientes for delete to authenticated using (true);

-- Prazos
create policy "prazos_select" on public.prazos for select to authenticated using (true);
create policy "prazos_insert" on public.prazos for insert to authenticated with check (true);
create policy "prazos_update" on public.prazos for update to authenticated using (true);
create policy "prazos_delete" on public.prazos for delete to authenticated using (true);

-- Documentos
create policy "documentos_select" on public.documentos for select to authenticated using (true);
create policy "documentos_insert" on public.documentos for insert to authenticated with check (true);
create policy "documentos_delete" on public.documentos for delete to authenticated using (true);

-- Historico anual (leitura; escrita via service_role pelo trigger)
create policy "historico_anual_select" on public.historico_anual for select to authenticated using (true);

-- Auditoria (somente leitura; INSERT via service_role)
create policy "auditoria_select" on public.auditoria for select to authenticated using (true);


-- ===============================================================
-- SUPABASE STORAGE
-- ===============================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('documentos-clientes', 'documentos-clientes', false, 52428800)
on conflict (id) do nothing;

create policy "storage_select" on storage.objects for select
  to authenticated using (bucket_id = 'documentos-clientes');

create policy "storage_insert" on storage.objects for insert
  to authenticated with check (bucket_id = 'documentos-clientes');

create policy "storage_delete" on storage.objects for delete
  to authenticated using (bucket_id = 'documentos-clientes');


-- ===============================================================
-- VIEWS
-- ===============================================================

-- View: clientes com subdivisao e contagens
create or replace view public.v_clientes_completo as
select
  c.id,
  c.nome,
  c.cpf,
  c.data_nascimento,
  extract(year from age(c.data_nascimento))::integer as idade,
  c.tipo_processo,
  s.nome  as subdivisao,
  s.tipo  as subdivisao_tipo,
  c.status,
  c.ano_referencia,
  c.numero_processo,
  c.valor_beneficio,
  c.observacoes,
  c.data_entrada,
  c.atualizado_em,
  (select count(*) from public.prazos p2
    where p2.cliente_id = c.id and not p2.concluido)                       as prazos_pendentes,
  (select count(*) from public.documentos d2 where d2.cliente_id = c.id)   as total_documentos,
  (select max(p3.data_prazo) from public.prazos p3
    where p3.cliente_id = c.id and not p3.concluido)                       as proximo_prazo
from public.clientes c
left join public.subdivisoes s on s.id = c.subdivisao_id;


-- View: resumo por ano
create or replace view public.v_resumo_anual as
select
  ano_referencia                                            as ano,
  count(*)                                                  as total_clientes,
  count(*) filter (where status = 'Ativo')                  as ativos,
  count(*) filter (where status = 'Concluído')              as concluidos,
  count(*) filter (where status = 'Inativo')                as inativos,
  coalesce(sum(valor_beneficio), 0)                         as valor_total_beneficios,
  count(*) filter (where tipo_processo = 'administrativo')  as administrativos,
  count(*) filter (where tipo_processo = 'judicial')        as judiciais
from public.clientes
group by ano_referencia
order by ano_referencia desc;


-- View: prazos proximos (30 dias)
create or replace view public.v_prazos_proximos as
select
  p.id,
  p.descricao,
  p.data_prazo,
  p.concluido,
  p.criado_por,
  c.id     as cliente_id,
  c.nome   as cliente_nome,
  c.cpf    as cliente_cpf,
  c.status as cliente_status,
  (p.data_prazo - current_date) as dias_restantes
from public.prazos p
join public.clientes c on c.id = p.cliente_id
where not p.concluido
  and p.data_prazo between current_date and (current_date + interval '30 days')
order by p.data_prazo;
