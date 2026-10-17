-- Script de Correção de RLS para a Tabela de Desafios (Challenges)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/bmjsduzvyftfpetuyvlb/sql/new

-- 1. Garante que RLS está habilitado
alter table public.challenges enable row level security;

-- 2. Remove políticas antigas caso existam
drop policy if exists "Desafios publicados são visíveis até a data atual" on public.challenges;
drop policy if exists "Todos podem ver desafios" on public.challenges;
drop policy if exists "Desafios podem ser criados" on public.challenges;
drop policy if exists "Desafios podem ser atualizados" on public.challenges;
drop policy if exists "Desafios podem ser deletados" on public.challenges;

-- 3. Cria políticas permissivas para o painel de curadoria e jogo
-- Leitura de desafios
create policy "Todos podem ver desafios"
  on public.challenges for select
  using (true);

-- Criação de novos desafios (necessário para o botão 'Agendar Desafio')
create policy "Desafios podem ser criados"
  on public.challenges for insert
  with check (true);

-- Edição de desafios existentes (necessário para o upsert)
create policy "Desafios podem ser atualizados"
  on public.challenges for update
  using (true)
  with check (true);

-- Exclusão de desafios
create policy "Desafios podem ser deletados"
  on public.challenges for delete
  using (true);
