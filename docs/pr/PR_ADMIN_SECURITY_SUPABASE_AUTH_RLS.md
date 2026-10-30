# PR: Segurança de Produção do Admin (Supabase Auth, RLS Estrito e Proteção contra Crawlers)

## 🎯 Objetivo
Blindar a aplicação Tá pro Brick para o lançamento público:
1. Eliminar a senha em texto claro no código cliente (`VITE_ADMIN_PASSWORD`).
2. Proteger o painel de administração (`/admin`) com autenticação real via **Supabase Auth** (E-mail e Senha).
3. Aplicar **Row Level Security (RLS)** estrito no banco de dados e no Storage do Supabase:
   - Impedir que usuários anônimos criem, modifiquem ou excluam desafios e fotos.
   - Impedir o vazamento de desafios futuros (jogadores anônimos só conseguem ver desafios publicados até a data de hoje).
4. Adicionar `robots.txt` e `sitemap.xml` impedindo mecanismos de busca (Google, Bing) de indexarem o painel de admin.

---

## 🛠️ O que foi implementado

### 1. Serviço de Autenticação (`src/services/authService.ts`)
- **`isUserAdmin(user)`**: Valida se o usuário autenticado possui o atributo `is_admin: true` em `app_metadata` (protegido por SQL) ou `user_metadata`.
- **`signInAdmin(email, password)`**: Autentica diretamente contra a API do Supabase Auth (`supabase.auth.signInWithPassword`), verifica se possui `is_admin: true` e, caso contrário, desloga imediatamente e recusa o acesso com mensagem explicativa.
- **`signOutAdmin()`**: Encerra a sessão ativa no servidor.
- **`getAdminSession()`**: Recupera a sessão ativa do navegador apenas se o usuário for administrador confirmado.
- **`subscribeToAuthChanges(callback)`**: Sincroniza o estado de autenticação em tempo real em todas as abas.

### 2. Painel Admin Seguro (`src/pages/AdminPage.tsx`)
- Tela de login com campos de **E-mail de Administrador** e **Senha**, integrada ao Supabase Auth.
- Exibição do e-mail do administrador autenticado no cabeçalho com badge de segurança.
- Restauração automática de sessão ao recarregar a página (sem deslogar).
- Fallback seguro para modo desenvolvedor/offline quando o Supabase não estiver configurado.

### 3. Script SQL de RLS de Produção (`supabase/secure_production_rls.sql`)
- Script pronto para execução no **Supabase SQL Editor**:
  - Função de segurança `public.is_admin()` que verifica `(auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true`.
  - `challenges` (Leitura anônima): `is_published = true AND publish_date <= CURRENT_DATE` (bloqueia vazamento de carros de amanhã/semana que vem).
  - `challenges` (Leitura admin): Irrestrita para usuários com `public.is_admin()`.
  - `challenges` (Insert/Update/Delete): Restrito exclusivamente a usuários com `public.is_admin()`.
  - `storage.objects` (Bucket `challenges`): Uploads, alterações e exclusões de fotos restritos exclusivamente a usuários com `public.is_admin()`; leitura das imagens pública para exibição do jogo.

### 4. Arquivos de SEO e Rastreadores
- **`public/robots.txt`**: Bloqueia indexação de `/admin` e `/#admin` pelos crawlers.
- **`public/sitemap.xml`**: Define o mapa do site canônico para `https://taprobrick.com.br/`.

---

## 🧪 Verificações e Testes
- **Testes Unitários**: 100/100 testes passando (`npm test`), incluindo 11 testes para o `authService` cobrindo login, logout, bloqueio de não-admin, erro de credencial e listeners.
- **Build de Produção**: `npm run build` executado com 0 erros e 0 warnings.
- **Validação Visual**:
  - `admin_secure_login_mobile.png` (Tela de login com e-mail, senha e Supabase Auth).

---

## 📋 Como ativar no seu projeto Supabase:
1. No painel do Supabase ([supabase.com/dashboard](https://supabase.com/dashboard)), se ainda não tiver usuário criado, vá em **Authentication > Users** e crie um ou use o seu existente.
2. Abra o **SQL Editor** do Supabase e execute o script `supabase/secure_production_rls.sql`.
3. Promova seu usuário a administrador executando no **SQL Editor**:
   ```sql
   UPDATE auth.users 
   SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb 
   WHERE email = 'seu-email@aqui.com';
   ```
4. Pronto! Seu banco, storage e painel de admin estão blindados com controle de acesso granular.
