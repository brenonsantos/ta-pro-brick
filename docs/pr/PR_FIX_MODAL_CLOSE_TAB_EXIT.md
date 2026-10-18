# PR: Prevenir Fechamento do Site ao Fechar Modais em Aba Nova (`fix/modal-close-tab-exit`)

## 🎯 Contexto e Causa Raiz
Ao abrir o site em uma nova guia do navegador após já ter jogado o desafio diário, o modal de resultado (`VictoryModal`) estava sendo inicializado aberto por padrão (`isVictoryModalOpen: true`), o que fazia com que o hook `useBrowserBackClose` executasse no mount inicial.

Quando o usuário clicava no botão "X" (ou backdrop) para fechar o modal e inspecionar os detalhes do carro ou placar, `registerModalClose` executava cegamente `window.history.back()`. Em uma guia recém-aberta sem histórico prévio de navegação no domínio (ou onde entradas adicionadas sem gesto do usuário ativam a intervenção de histórico do Chrome/Safari), chamar `window.history.back()` forçava o navegador a sair do site ou fechar a aba inteira.

## 🛠️ O que foi corrigido

1. **Guarda de Primeiro Render no Hook `useBrowserBackClose` (`src/hooks/useBrowserBackClose.ts`):**
   - Adicionada a ref `isFirstRenderRef` para detectar quando um modal já é montado aberto no primeiro render da página (ex: recarga ou abertura de nova aba).
   - Nesses casos, a chamada para `registerModalOpen` passa `pushHistory = false`, registrando o modal na pilha de fechamento sem poluir o histórico de uma aba limpa.

2. **Segurança Reforçada no Gerenciador de Histórico (`src/utils/modalHistoryManager.ts`):**
   - `registerModalOpen` agora rastreia `hasPushedHistory` individualmente por modal.
   - `registerModalClose` agora só invoca `window.history.back()` se:
     1. O modal efetivamente empurrou uma entrada de histórico na sessão atual (`hasPushedHistory === true`);
     2. O modal era o topo da pilha de modais;
     3. O estado atual da janela realmente pertence a esse modal (`window.history.state?.tpbModal === id`).
   - Se o modal abriu no carregamento inicial ou se o estado do histórico já foi consumido, o modal é apenas fechado no DOM sem disparar navegação no navegador.

3. **Estado Inicial de `isVictoryModalOpen` (`src/App.tsx`):**
   - Definido como `false` por padrão no mount inicial da aplicação.
   - Ao retornar ao site em uma nova sessão/aba no mesmo dia, o jogador agora pousa diretamente na tela principal com o banner de contagem regressiva da próxima diária, botão de compartilhar, e o botão `Ver Resultado da Rodada 🏆` caso queira reabrir o modal a qualquer momento.
   - Quando o jogador conclui o jogo em uma partida ativa, o modal continua abrindo automaticamente com todas as celebrações e confetes.

## 🧪 Verificações Executadas
- **Testes Unitários:** 52/52 testes passando no Vitest (`npm test`).
  - Novos testes adicionados cobrindo `pushHistory: false`, verificação de `window.history.state?.tpbModal === id` e prevenção de `history.back()` indevido.
- **Teste de Regressão em Navegador Real:**
  - Script automatizado via Chrome DevTools Protocol simulou abertura de nova aba com jogo finalizado, abertura voluntária pelo botão e fechamento pelo "X".
  - A aba permaneceu aberta, o modal fechou sem sair da página e a navegação funcionou como esperado.
- **Build de Produção:** `npm run build` executado com sucesso (0 erros de TypeScript e Vite).
