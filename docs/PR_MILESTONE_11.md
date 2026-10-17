# PR: Atualização de Contatos, Domínio Canônico e Extrator Híbrido do Facebook Marketplace

## Resumo das Mudanças
Esta entrega conclui a padronização oficial de marca e cria o fluxo híbrido e autônomo de curadoria de anúncios para o Tá pro Brick.

### 1. Atualização de Canais de Contato e Domínio Canônico
- **E-mail Oficial:** Alterado para `taprobrick.jogo@gmail.com` em `ContactModal.tsx` e links de suporte.
- **Instagram Oficial:** Alterado para `@taprobrick.jogo` (`https://instagram.com/taprobrick.jogo` e `https://ig.me/m/taprobrick.jogo`).
- **Domínio Canônico:** Padronizado para `https://taprobrick.com.br` em `index.html` (tags Open Graph, WhatsApp preview e Twitter card) e no texto de compartilhamento (`shareText.ts`).
- **Testes Unitários:** Atualizados em `ContactAndCookies.test.tsx` com 100% de aprovação.

### 2. Extrator Híbrido do Facebook Marketplace (`scripts/fb-marketplace-extractor.js`)
- Executável como **Bookmarklet** de 1 clique ou via DevTools Console em qualquer anúncio de veículo no Facebook Marketplace.
- Extrai no contexto autenticado do navegador do curador:
  - Título do anúncio.
  - Preço numérico limpo (ex: `R$ 44.900` ➔ `44900`).
  - Descrição completa com expansão automática de texto truncado ("Ver mais").
  - Localização aproximada (Cidade, UF).
  - Tempo de publicação.
  - Fotos em alta resolução (filtrando avatares, ícones e URLs duplicadas).
  - Link original limpo do anúncio.
- Interface flutuante sobreposta ao Facebook com botão para **Copiar JSON em 1 clique**.

### 3. Importação em 1 Clique no Painel Administrativo (`AdminPage.tsx`)
- Adicionado botão e modal **"Importar Anúncio (JSON)"** no topo do formulário do curador.
- Ao colar o JSON gerado pelo extrator, todos os campos (título, preço, fotos, localização, tempo de anúncio, descrição e link original) são preenchidos instantaneamente.
- Oferece também o código do Bookmarklet pronto para instalação.

### 4. Verificação e Qualidade
- **Testes:** 36/36 testes passando no Vitest (`npm test`).
- **Build:** Compilação de produção limpa (`npm run build`).
- **Git Branch:** `feature/brand-links-and-marketplace-scraper` integrada à `main`.
