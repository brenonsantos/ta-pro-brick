-- ==============================================================================
-- Script de Segurança e Políticas RLS de Produção (Tá pro Brick)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/_/sql/new
--
-- ==============================================================================
-- COMO TRANSFORMAR SEU USUÁRIO EM ADMINISTRADOR:
-- Substitua 'seu-email-aqui@exemplo.com' pelo e-mail do seu usuário e execute:
--
-- UPDATE auth.users 
-- SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb 
-- WHERE email = 'seu-email-aqui@exemplo.com';
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. FUNÇÃO DE VERIFICAÇÃO DE ADMINISTRADOR (public.is_admin)
-- ------------------------------------------------------------------------------
-- Esta função lê o token JWT gerado pelo Supabase Auth e verifica se a chave
-- app_metadata (ou user_metadata) contém "is_admin": true.
-- O app_metadata só pode ser alterado diretamente pelo SQL do Supabase.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. TABELA DE DESAFIOS (public.challenges)
-- ------------------------------------------------------------------------------

alter table public.challenges enable row level security;

-- Remove políticas antigas
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

-- A) Leitura: Jogadores públicos só leem desafios publicados até a data atual.
-- Administradores (is_admin = true) têm acesso irrestrito para ver o calendário futuro.
create policy "Public players can read current and past challenges"
  on public.challenges
  for select
  using (
    (is_published = true and publish_date <= current_date)
    or public.is_admin()
  );

-- B) Criação de novos desafios: restrito exclusivamente a administradores
create policy "Admins can insert challenges"
  on public.challenges
  for insert
  to authenticated
  with check (public.is_admin());

-- C) Edição de desafios existentes: restrito exclusivamente a administradores
create policy "Admins can update challenges"
  on public.challenges
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- D) Exclusão de desafios: restrito exclusivamente a administradores
create policy "Admins can delete challenges"
  on public.challenges
  for delete
  to authenticated
  using (public.is_admin());


-- ------------------------------------------------------------------------------
-- 3. SUPABASE STORAGE (storage.objects para o bucket 'challenges')
-- ------------------------------------------------------------------------------

drop policy if exists "Imagens de desafios são públicas para leitura" on storage.objects;
drop policy if exists "Upload de imagens para desafios" on storage.objects;
drop policy if exists "Atualização de imagens de desafios" on storage.objects;
drop policy if exists "Deleção de imagens de desafios" on storage.objects;
drop policy if exists "Challenges storage is public for read" on storage.objects;
drop policy if exists "Challenges storage upload authenticated only" on storage.objects;
drop policy if exists "Challenges storage update authenticated only" on storage.objects;
drop policy if exists "Challenges storage delete authenticated only" on storage.objects;

-- Leitura pública das fotos dos carros para o jogo carregar normalmente
create policy "Challenges storage is public for read"
  on storage.objects
  for select
  using (bucket_id = 'challenges');

-- Upload permitido apenas para administradores confirmados
create policy "Challenges storage upload authenticated only"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'challenges'
    and public.is_admin()
  );

-- Atualização permitida apenas para administradores confirmados
create policy "Challenges storage update authenticated only"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'challenges'
    and public.is_admin()
  );

-- Exclusão permitida apenas para administradores confirmados
create policy "Challenges storage delete authenticated only"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'challenges'
    and public.is_admin()
  );
