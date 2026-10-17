-- Schema do Tá pro Brick para Supabase (PostgreSQL)

-- 1. Habilita extensões necessárias
create extension if not exists "uuid-ossp";

-- 2. Tabela de Desafios Diários
create table if not exists public.challenges (
  id text primary key default uuid_generate_v4()::text,
  publish_date date not null unique,
  title text not null,
  price numeric not null,
  photos jsonb not null default '[]'::jsonb,
  description text not null default '',
  location text not null default '',
  time_posted text not null default '',
  source_url text,
  authorization_notes text,
  is_published boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índice para busca rápida por data
create index if not exists idx_challenges_publish_date on public.challenges (publish_date);

-- 3. Tabela de Jogadores (Anônimos ou Autenticados)
create table if not exists public.players (
  id text primary key default uuid_generate_v4()::text,
  auth_id uuid references auth.users(id) on delete set null,
  nickname text not null,
  is_anonymous boolean not null default true,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_players_auth_id on public.players (auth_id);

-- 4. Tabela de Resultados Diários (Submissões de Palpites/Rodadas)
create table if not exists public.daily_results (
  id uuid primary key default uuid_generate_v4(),
  challenge_id text not null,
  player_id text not null references public.players(id) on delete cascade,
  score integer not null,
  attempts_count integer not null,
  best_guess numeric,
  won boolean not null default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_player_challenge unique (challenge_id, player_id)
);

-- Índices otimizados para ranking por pontos
create index if not exists idx_daily_results_challenge_ranking 
  on public.daily_results (challenge_id, score desc, attempts_count asc, completed_at asc);

create index if not exists idx_daily_results_player 
  on public.daily_results (player_id);

-- 5. View para Ranking Geral (Pontuação Acumulada)
create or replace view public.view_leaderboard_all_time as
select 
  p.id as player_id,
  p.nickname,
  p.avatar_url,
  p.is_anonymous,
  sum(r.score) as total_score,
  count(r.id) as games_played,
  count(case when r.won then 1 end) as games_won,
  min(r.attempts_count) as best_attempts,
  max(r.completed_at) as last_played_at
from public.players p
join public.daily_results r on r.player_id = p.id
group by p.id, p.nickname, p.avatar_url, p.is_anonymous
order by total_score desc, games_won desc;

-- 6. Row Level Security (RLS)
alter table public.challenges enable row level security;
alter table public.players enable row level security;
alter table public.daily_results enable row level security;

-- Políticas de Challenges:
-- Qualquer jogador pode ler desafios publicados até a data de hoje (anti-spoiler de dias futuros)
create policy "Desafios publicados são visíveis até a data atual"
  on public.challenges for select
  using (publish_date <= current_date and is_published = true);

-- Políticas de Players:
-- Todos podem criar seu perfil anônimo e atualizar seu próprio nickname
create policy "Jogadores podem criar e ver perfis"
  on public.players for select
  using (true);

create policy "Jogadores podem se cadastrar"
  on public.players for insert
  with check (true);

create policy "Jogadores podem atualizar seu próprio perfil"
  on public.players for update
  using (true);

-- Políticas de Daily Results:
-- Resultados podem ser lidos para compor o ranking
create policy "Resultados são públicos para ranking"
  on public.daily_results for select
  using (true);

-- Jogador pode inserir seu resultado diário
create policy "Jogadores podem registrar resultado"
  on public.daily_results for insert
  with check (true);
