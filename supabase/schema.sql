-- ============================================================================
-- NEXO — schema do Supabase (login por código pessoal, múltiplos perfis)
-- Cole tudo isto no SQL Editor do seu projeto Supabase e execute.
--
-- O login é por código pessoal, mas cada código vira um usuário real do
-- Supabase Auth (o app usa o código como e-mail interno + senha). Cada linha
-- pertence a um usuário (auth.users) e o isolamento entre perfis é feito por
-- RLS: cada pessoa só enxerga/edita as próprias linhas (auth.uid() = user_id).
--
-- IMPORTANTE: no painel, em Authentication → Providers → Email, DESLIGUE
-- "Confirm email" (senão o cadastro pelo código não devolve sessão).
--
-- Se você JÁ tinha a versão antiga (com a coluna user_code), veja o bloco de
-- MIGRAÇÃO no final.
-- ============================================================================

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_date date not null,
  sleep_hours numeric,
  screen_off_before_bed boolean,
  read_before_bed boolean,
  sleep_quality smallint check (sleep_quality between 1 and 5),
  study_hours numeric,
  study_focus smallint check (study_focus between 1 and 5),
  did_all_ankis boolean,
  ate_as_planned boolean,
  notes text,
  created_at timestamptz default now(),
  unique (user_id, entry_date)
);

create table if not exists weekly_weight (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start date not null,
  weight_kg numeric,
  created_at timestamptz default now(),
  unique (user_id, week_start)
);

-- Vários treinos por dia → uma linha por treino.
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_date date not null,
  style text not null,        -- 'musculacao' | 'natacao' | 'corrida' | texto livre
  minutes numeric,
  calories numeric,           -- calorias QUEIMADAS no treino (não é contagem de dieta)
  created_at timestamptz default now()
);
create index if not exists workouts_user_date on workouts (user_id, entry_date);

-- Receitas criadas/editadas pelo usuário (as curadas ficam no código do app).
create table if not exists custom_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  time_min integer,
  meal_type text[],           -- ex.: '{cafe_da_manha,lanche}'
  ingredients text[],
  steps text,
  created_at timestamptz default now()
);
create index if not exists custom_recipes_user on custom_recipes (user_id);

-- ----------------------------------------------------------------------------
-- Row Level Security: cada pessoa só acessa as próprias linhas.
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
      drop policy if exists %1$s_own on %1$s;
      create policy %1$s_own on %1$s
        for all
        to authenticated
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- MIGRAÇÃO (só se você já tinha as tabelas antigas com `user_code`):
-- Como até agora o app rodava em modo local (sem sync), as tabelas do Supabase
-- provavelmente estão vazias — o mais simples é apagá-las e recriar:
--   drop table if exists entries, weekly_weight, workouts, custom_recipes cascade;
-- e então rodar este arquivo inteiro de novo.
--
-- Se tiver dados que quer preservar, aí é preciso migrar user_code → user_id
-- manualmente (mapeando cada código a um usuário do Auth) — me avise que eu ajudo.
-- ----------------------------------------------------------------------------
