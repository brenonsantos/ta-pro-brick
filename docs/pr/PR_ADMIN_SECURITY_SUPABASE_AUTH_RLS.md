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
- **`signInAdmin(email, password)`**: Autentica diretamente contra a API do Supabase Auth (`supabase.auth.signInWithPassword`), com tratamento e tradução de mensagens de erro em português.
- **`signOutAdmin()`**: Encerra a sessão ativa no servidor.
- **`getAdminSession()`**: Recupera a sessão ativa do navegador de forma persistente.
- **`subscribeToAuthChanges(callback)`**: Sincroniza o estado de autenticação em tempo real em todas as abas.

### 2. Painel Admin Seguro (`src/pages/AdminPage.tsx`)
- Tela de login com campos de **E-mail de Administrador** e **Senha**, integrada ao Supabase Auth.
- Exibição do e-mail do administrador autenticado no cabeçalho com badge de segurança.
- Restauração automática de sessão ao recarregar a página (sem deslogar).
- Fallback seguro para modo desenvolvedor/offline quando o Supabase não estiver configurado.

### 3. Script SQL de RLS de Produção (`supabase/secure_production_rls.sql`)
- Script pronto para execução no **Supabase SQL Editor**:
  - `challenges` (Leitura anônima): `is_published = true AND publish_date <= CURRENT_DATE` (bloqueia vazamento de carros de amanhã/semana que vem).
  - `challenges` (Leitura admin): Irrestrita para usuários com `role = 'authenticated'`.
  - `challenges` (Insert/Update/Delete): Restrito exclusivamente a usuários com `role = 'authenticated'`.
  - `storage.objects` (Bucket `challenges`): Uploads, alterações e exclusões de fotos restritos exclusivamente a usuários com `role = 'authenticated'`; leitura das imagens pública para exibição do jogo.

### 4. Arquivos de SEO e Rastreadores
- **`public/robots.txt`**: Bloqueia indexação de `/admin` e `/#admin` pelos crawlers.
- **`public/sitemap.xml`**: Define o mapa do site canônico para `https://taprobrick.com.br/`.

---

## 🧪 Verificações e Testes
- **Testes Unitários**: 96/96 testes passando (`npm test`), incluindo 7 testes para o `authService` cobrindo login, logout, erro de credencial e listeners.
- **Build de Produção**: `npm run build` executado com 0 erros e 0 warnings.
- **Validação Visual**:
  - `admin_secure_login_mobile.png` (Tela de login com e-mail, senha e Supabase Auth).

---

## 📋 Como ativar no seu projeto Supabase:
1. No painel do Supabase ([supabase.com/dashboard](https://supabase.com/dashboard)), vá em **Authentication > Users** e clique em **Add user** (informe o seu e-mail e a sua senha pessoal de administrador).
2. Abra o **SQL Editor** do Supabase e cole o conteúdo de `supabase/secure_production_rls.sql`, depois clique em **Run**.
3. Pronto! Seu banco e storage estão blindados.
