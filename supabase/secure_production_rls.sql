-- ==============================================================================
-- Script de Segurança e Políticas RLS de Produção (Tá pro Brick)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- O que este script faz:
-- 1. Garante que apenas administradores autenticados (via Supabase Auth)
--    possam criar, atualizar ou excluir desafios na tabela 'challenges'.
-- 2. Impede o vazamento de desafios futuros: jogadores não autenticados (anon)
--    só conseguem consultar desafios publicados até a data atual (CURRENT_DATE).
-- 3. Protege o bucket de Storage 'challenges': leitura pública das fotos para
--    o jogo funcionar, mas uploads e exclusões restritos a usuários logados.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABELA DE DESAFIOS (public.challenges)
-- ------------------------------------------------------------------------------

-- Garante que RLS está habilitado
alter table public.challenges enable row level security;

-- Remove quaisquer políticas permissivas legadas
drop policy if exists "Todos podem ver desafios" on public.challenges;
drop policy if exists "Desafios publicados são visíveis até a data atual" on public.challenges;
drop policy if exists "Desafios podem ser criados" on public.challenges;
drop policy if exists "Desafios podem ser atualizados" on public.challenges;
drop policy if exists "Desafios podem ser deletados" on public.challenges;
drop policy if exists "Public players can read current and past challenges" on public.challenges;
drop policy if exists "Admins can read all challenges" on public.challenges;
drop policy if exists "Admins can insert challenges" on public.challenges;
drop policy if exists "Admins can update challenges" on public.challenges;
drop policy if exists "Admins can delete challenges" on public.challenges;

-- A) Leitura para Jogadores Públicos (Anônimos): apenas desafios publicados até a data atual
create policy "Public players can read current and past challenges"
  on public.challenges
  for select
  to anon
  using (
    is_published = true
    and publish_date <= current_date
  );

-- B) Leitura para Administradores Autenticados: acesso irrestrito (inclusive futuros)
create policy "Admins can read all challenges"
  on public.challenges
  for select
  to authenticated
  using (true);

-- C) Criação de novos desafios: restrito a usuários autenticados
create policy "Admins can insert challenges"
  on public.challenges
  for insert
  to authenticated
  with check (auth.role() = 'authenticated');

-- D) Edição de desafios existentes: restrito a usuários autenticados
create policy "Admins can update challenges"
  on public.challenges
  for update
  to authenticated
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- E) Exclusão de desafios: restrito a usuários autenticados
create policy "Admins can delete challenges"
  on public.challenges
  for delete
  to authenticated
  using (auth.role() = 'authenticated');


-- ------------------------------------------------------------------------------
-- 2. SUPABASE STORAGE (storage.objects para o bucket 'challenges')
-- ------------------------------------------------------------------------------

-- Remove políticas antigas de storage
drop policy if exists "Imagens de desafios são públicas para leitura" on storage.objects;
drop policy if exists "Upload de imagens para desafios" on storage.objects;
drop policy if exists "Atualização de imagens de desafios" on storage.objects;
drop policy if exists "Deleção de imagens de desafios" on storage.objects;
drop policy if exists "Challenges storage is public for read" on storage.objects;
drop policy if exists "Challenges storage upload authenticated only" on storage.objects;
drop policy if exists "Challenges storage update authenticated only" on storage.objects;
drop policy if exists "Challenges storage delete authenticated only" on storage.objects;

-- Leitura pública das fotos dos carros
create policy "Challenges storage is public for read"
  on storage.objects
  for select
  using (bucket_id = 'challenges');

-- Upload permitido apenas para administradores logados
create policy "Challenges storage upload authenticated only"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'challenges'
    and auth.role() = 'authenticated'
  );

-- Atualização permitida apenas para administradores logados
create policy "Challenges storage update authenticated only"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'challenges'
    and auth.role() = 'authenticated'
  );

-- Exclusão permitida apenas para administradores logados
create policy "Challenges storage delete authenticated only"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'challenges'
    and auth.role() = 'authenticated'
  );
