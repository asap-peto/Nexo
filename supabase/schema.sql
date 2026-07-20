-- ============================================================================
-- Painel de Hábitos — schema do Supabase
-- Cole tudo isto no SQL Editor do seu projeto Supabase e execute uma vez.
-- Se você JÁ tinha criado a versão antiga, veja o bloco de MIGRAÇÃO no final.
-- ============================================================================

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_code text not null,
  entry_date date not null,
  sleep_hours numeric,
  screen_off_before_bed boolean,
  read_before_bed boolean,
  feels_rested boolean,
  study_hours numeric,
  did_all_ankis boolean,
  ate_as_planned boolean,
  notes text,
  created_at timestamptz default now(),
  unique (user_code, entry_date)
);

create table if not exists weekly_weight (
  id uuid primary key default gen_random_uuid(),
  user_code text not null,
  week_start date not null,
  weight_kg numeric,
  created_at timestamptz default now(),
  unique (user_code, week_start)
);

-- Vários treinos por dia → uma linha por treino.
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_code text not null,
  entry_date date not null,
  style text not null,        -- 'musculacao' | 'natacao' | 'corrida' | texto livre
  minutes numeric,
  calories numeric,           -- calorias QUEIMADAS no treino (não é contagem de dieta)
  created_at timestamptz default now()
);
create index if not exists workouts_user_date on workouts (user_code, entry_date);

-- Receitas criadas/editadas pelo usuário (as curadas ficam no código do app).
create table if not exists custom_recipes (
  id uuid primary key default gen_random_uuid(),
  user_code text not null,
  title text not null,
  time_min integer,
  meal_type text[],           -- ex.: '{cafe_da_manha,lanche}'
  ingredients text[],
  steps text,
  created_at timestamptz default now()
);
create index if not exists custom_recipes_user on custom_recipes (user_code);

-- ----------------------------------------------------------------------------
-- Row Level Security
--
-- NÃO há autenticação real (JWT/sessão). O "login" é só um código pessoal que
-- o app envia junto de cada query. As policies abaixo apenas EXIGEM que
-- user_code esteja presente e não-vazio — evitam varreduras sem filtro, mas
-- NÃO isolam um código do outro. Trade-off aceito para dados de hábito pessoal
-- de baixa sensibilidade. Ver o README. Não guarde nada sensível aqui.
-- ----------------------------------------------------------------------------

alter table entries enable row level security;
alter table weekly_weight enable row level security;
alter table workouts enable row level security;
alter table custom_recipes enable row level security;

do $$
declare t text;
begin
  foreach t in array array['entries','weekly_weight','workouts','custom_recipes'] loop
    execute format($f$
      drop policy if exists %1$s_all on %1$s;
      create policy %1$s_all on %1$s
        for all
        using (user_code is not null and length(user_code) > 0)
        with check (user_code is not null and length(user_code) > 0);
    $f$, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- MIGRAÇÃO (rode apenas se você já tinha a versão antiga da tabela `entries`):
--   alter table entries add column if not exists feels_rested boolean;
--   alter table entries add column if not exists did_all_ankis boolean;
--   -- a antiga coluna study_method pode ser mantida (ignorada) ou removida:
--   -- alter table entries drop column if exists study_method;
-- E crie as tabelas `workouts` e `custom_recipes` acima (os create ... if not exists cuidam disso).
-- ----------------------------------------------------------------------------
