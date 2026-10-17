-- Configuração do Supabase Storage para Fotos dos Desafios do Tá pro Brick

-- 1. Cria o Bucket público 'challenges'
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'challenges',
  'challenges',
  true,
  10485760, -- 10MB por imagem
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];

-- 2. Políticas de Leitura Pública (Qualquer jogador pode carregar as fotos no jogo)
drop policy if exists "Imagens de desafios são públicas para leitura" on storage.objects;
create policy "Imagens de desafios são públicas para leitura"
  on storage.objects for select
  using (bucket_id = 'challenges');

-- 3. Políticas de Upload (Permite envio de fotos para o bucket de desafios)
drop policy if exists "Upload de imagens para desafios" on storage.objects;
create policy "Upload de imagens para desafios"
  on storage.objects for insert
  with check (bucket_id = 'challenges');

-- 4. Políticas de Atualização e Deleção
drop policy if exists "Atualização de imagens de desafios" on storage.objects;
create policy "Atualização de imagens de desafios"
  on storage.objects for update
  using (bucket_id = 'challenges');

drop policy if exists "Deleção de imagens de desafios" on storage.objects;
create policy "Deleção de imagens de desafios"
  on storage.objects for delete
  using (bucket_id = 'challenges');
