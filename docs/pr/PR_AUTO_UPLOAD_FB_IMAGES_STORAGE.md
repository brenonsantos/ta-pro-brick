# PR: Migração Automática de Fotos do Facebook Marketplace para o Supabase Storage Permanente

## 🎯 Objetivo
Evitar fotos quebradas nos desafios causadas pela expiração de links da CDN do Facebook (`scontent...fbcdn.net`).
Links da CDN do Facebook possuem parâmetros de assinatura e expiração temporária (`oe=...`), retornando erro `403 Forbidden` após algum tempo. Este PR implementa o download automático dessas fotos e sua re-hospedagem no bucket permanente `challenges` do Supabase Storage.

---

## 🛠️ O que foi implementado

### 1. Helpers no `src/services/storageService.ts`
- **`isExternalPhotoUrl(url)`**: Identifica se uma URL é externa (como CDN do Facebook ou sites externos) e necessita de migração para o Storage, ignorando fotos locais (`/cars/...`) e fotos já salvas no Supabase Storage.
- **`uploadPhotoFromUrl(imageUrl, fileNamePrefix)`**: Realiza o download da imagem via `fetch()` como `Blob`, sanitiza o nome e formato (`.jpg`, `.png`, `.webp`) e envia para `cars/<slug>-<timestamp>.<ext>` no bucket `challenges` do Supabase Storage.
- **`transferExternalPhotosToStorage(photoUrls, titlePrefix, onProgress)`**: Processa listas de fotos em lote, fornecendo progresso em tempo real e mantendo o link original com relatório de erros caso algum link específico já esteja inacessível.

### 2. Auto-Transferência no Modal de Importação (`src/components/ImportChallengeModal.tsx`)
- Adicionada opção com checkbox (ativa por padrão quando o Supabase está conectado):
  > *"Salvar fotos no Supabase Storage automaticamente (Recomendado) — Baixa as fotos do Facebook CDN e hospeda permanentemente no nosso banco para evitar links quebrados por expiração."*
- Ao importar o JSON colado do Extrator do Facebook ou arquivo `.json`, o modal transfere as imagens em segundo plano exibindo barra de progresso em tempo real (`Salvando fotos no Supabase Storage... (2/5)`).
- Os links permanentes do Supabase já são inseridos no formulário do desafio.

### 3. Painel de Administração (`src/pages/AdminPage.tsx`)
- **Detecção de Fotos Externas**: Sempre que houver links externos/expirando no campo de fotos, exibe um banner de alerta informativo:
  > *"⚠️ X foto(s) externa(s) detectada(s). Links do Facebook expiram com o tempo."*
- **Botão de 1 Clique**: Botão *"☁️ Migrar para Supabase"* para converter todas as fotos externas de um desafio existente direto para o Supabase Storage com feedback de progresso.
- **Badges Visuais**: Nas miniaturas das fotos, exibe a origem de cada uma:
  - Badge Laranja **FB**: Foto externa / Facebook CDN (temporária).
  - Badge Verde **✓**: Foto hospedada permanentemente no Supabase Storage.

---

## 🧪 Verificações e Testes
- **Testes Unitários**: 82/82 testes passando com sucesso (`npm test`).
  - `src/services/__tests__/storageService.test.ts` (9 novos testes cobrindo `isExternalPhotoUrl`, `uploadPhotoFromUrl`, fallbacks de erro 403 e migração em lote).
  - `src/components/__tests__/ImportChallengeModal.test.tsx` (3 novos testes cobrindo renderização, fallback offline e toggle de auto-upload).
- **Build de Produção**: `npm run build` executado com 0 erros e 0 warnings.
- **Validação Visual**: Capturados screenshots via Chrome DevTools Protocol no viewport mobile (412x915):
  - `admin_import_modal_mobile.png` (Modal de importação com opção de auto-upload).
  - `admin_photos_migration_banner_mobile.png` (Banner de alerta, botão de migração e badges FB/✓).
