# PR: Fechamento de Modais e Lightbox com o Botão Voltar do Navegador/Celular

## Motivação e Problema
Em dispositivos móveis (especialmente via botão físico/virtual de voltar do Android ou gesto lateral de retorno no iOS) e navegadores desktop, jogadores frequentemente clicam no botão "Voltar" esperando fechar a janela aberta (modal ou lightbox de fotos).
Como a aplicação é uma SPA sem sincronização de histórico nos modais, a ação de voltar descarregava a página ou navegava para o site anterior no histórico do navegador.

## Solução Implementada
- **Gerenciador de Histórico de Modais (`src/utils/modalHistoryManager.ts`):**
  - Utiliza a History API (`history.pushState` e `popstate`) com pilha global (`modalStack`) para gerenciar a abertura e fechamento de modais.
  - Ao pressionar "Voltar" no navegador/celular, intercepta o evento `popstate` e fecha apenas o modal que está no topo da pilha, mantendo o jogador no jogo.
  - Se o usuário fechar o modal via botão "X" ou clique no backdrop, o histórico é corrigido programaticamente (`history.back()`) de forma transparente, prevenindo histórico fantasma.
- **Hook Reutilizável (`src/hooks/useBrowserBackClose.ts`):**
  - Conectado em todos os modais e overlays do jogo:
    - `PhotoLightboxModal` (fotos ampliadas)
    - `HelpModal` (como jogar)
    - `StatsModal` (estatísticas)
    - `LeaderboardModal` (classificação)
    - `VictoryModal` (resultado da rodada)
    - `ContactModal` (sugerir / remover / contato)
    - `ImportChallengeModal` (painel de curadoria/admin)

## Verificação e Testes
- Adicionados testes unitários em `src/utils/__tests__/modalHistoryManager.test.ts`.
- Suite completa passando: 47/47 testes (`npm test`).
- Build de produção verificado com sucesso (`npm run build`).
