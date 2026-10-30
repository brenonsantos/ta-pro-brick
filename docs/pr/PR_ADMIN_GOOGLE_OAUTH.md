# PR: Autenticação via Google OAuth para o Painel de Administração

## 🎯 Objetivo
Permitir que curadores e administradores acessem o painel `/admin` diretamente através de suas contas **Google / Gmail**, eliminando a necessidade de gerenciar senhas adicionais, mantendo validação estrita da permissão `is_admin: true`.

---

## 🛠️ O que foi implementado

### 1. Serviço de Autenticação (`src/services/authService.ts`)
- **`signInAdminWithGoogle(redirectTo?)`**: Dispara o fluxo OAuth do Supabase (`supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })`), redirecionando para a tela de permissão da conta Google e retornando automaticamente para `/admin`.
- **`validateAdminSession()`**: Checa se a sessão ativa possui privilégios de administrador (`isUserAdmin(user)`). Caso um usuário logue com uma conta Google não autorizada, faz logout imediato no servidor e retorna erro explicativo.
- **`subscribeToAuthChanges()`**: Atualizado para lidar com redirecionamentos OAuth automaticamente, propagando o erro caso a conta não tenha a permissão necessária.

### 2. Interface do Painel de Admin (`src/pages/AdminPage.tsx`)
- Adicionado botão de destaque **"Entrar com Google"** com logotipo oficial colorido em SVG e estados de carregamento.
- Divisor sutil e elegante **"OU COM E-MAIL"** para preservar a opção tradicional com senha.
- Feedback de erro detalhado caso a conta do Google conectada ainda não possua privilégios de administrador.

---

## 🧪 Verificações e Testes
- **Testes Unitários:** 105/105 testes passando (`npm test`), com 16 testes no `authService.test.ts` cobrindo o fluxo Google OAuth e rejeição de contas não-admin.
- **Build de Produção:** `npm run build` executado com zero erros e warnings de TypeScript resolvidos.
- **Validação Visual:**
  - `admin_secure_login_mobile.png` demonstrando o novo botão Google e o formulário alternativo com e-mail/senha.

---

## 📋 Como habilitar o Google Provider no Supabase (se ainda não estiver ativo):
1. No painel do seu projeto Supabase, acesse **Authentication** > **Providers** > **Google**.
2. Ative o toggle **"Enable Google"**.
3. Adicione o **Client ID** e o **Client Secret** obtidos no Google Cloud Console (com a URL de redirect do Supabase adicionada aos URIs autorizados).
4. No **SQL Editor** do Supabase, certifique-se de que o seu Gmail está promovido com:
   ```sql
   UPDATE auth.users 
   SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb 
   WHERE email = 'seu-email@gmail.com';
   ```
