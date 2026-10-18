# PR: Widget de Ranking Semanal na Tela Principal & Correção de Fechamento de Modais

## 🎯 Contexto e Objetivos
1. **Widget de Ranking Semanal na Tela Principal (`Milestone 14`):**
   - Atende ao pedido do usuário para que, após concluir a rodada do dia e retornar à tela principal, o jogador veja não apenas o cronômetro para o próximo desafio e o botão de compartilhar, mas também um widget elegante de **Ranking Semanal Ao Vivo**.
   - O widget exibe o aviso do ciclo semanal ("Zera domingo 00h • Xd Yh restantes"), o card de classificação do jogador logado/anônimo ("Sua Posição", vitórias, total de pontos) e o Top 3 do pódio com medalhas ouro/prata/bronze.
   - Fornece um botão direto que abre o `LeaderboardModal` com a aba semanal pré-selecionada.

2. **Correção de Fechamento de Modais em Nova Guia (`Milestone 13`):**
   - Corrige o bug onde, ao abrir o site em uma nova guia após já ter completado o jogo, fechar o modal no "X" provocava o fechamento da guia ou saída do site devido ao `history.back()` executado em aba limpa.
   - Implementada guarda de primeiro render no hook `useBrowserBackClose`, checagem estrita de `window.history.state?.tpbModal === id` e inicialização de `isVictoryModalOpen: false` no mount.

## 🛠️ O que mudou
- **`src/components/WeeklyLeaderboardWidget.tsx`:**
  - Componente visual com layout dark-zinc / âmbar perfeitamente alinhado com o design system do Tá pro Brick.
  - Carrega dados de pontuação agregada via `getWeeklyLeaderboard()` (compatível com Supabase e fallback local).
  - Destaca o jogador logado em âmbar caso esteja no Top 3 ou adiciona uma linha separada de "Sua Posição" caso esteja fora do pódio.
- **`src/components/LeaderboardModal.tsx`:**
  - Adicionado suporte à prop `initialTab?: 'daily' | 'weekly'` para alternar diretamente para a aba da semana quando invocado pelo widget.
- **`src/App.tsx`:**
  - Inserido `WeeklyLeaderboardWidget` diretamente abaixo de `DailyCountdown` quando `gameMode === 'daily' && isDailyCompleted`.
  - Configurado `initialTab` no `LeaderboardModal` e `isVictoryModalOpen: false` por padrão.
- **`src/utils/modalHistoryManager.ts` & `src/hooks/useBrowserBackClose.ts`:**
  - Travas de segurança para garantir que `history.back()` só seja chamado se houver entrada de histórico legítima empurrada nesta sessão.

## 🧪 Verificações Realizadas
- **Testes Unitários:** `54/54` testes passando no Vitest (`npm test`).
  - Adicionados testes para `WeeklyLeaderboardWidget` e testes de segurança de histórico.
- **Build de Produção:** `npm run build` gerado com sucesso (zero erros de tipagem TypeScript e Vite).
- **Inspeção Visual & Funcional via Chrome:**
  - Screenshot capturada e validada: layout responsivo, espaçamento adequado, visual idêntico ao do mockup.
  - Verificada a interação de clique que abre diretamente a aba da semana no modal de ranking.
