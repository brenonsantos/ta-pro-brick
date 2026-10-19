# PR: Exibir Desempenho Diário como Percentil ("Melhor que X% dos jogadores")

## Contexto & Motivação
O usuário solicitou que o ranking diário apresentasse o desempenho do jogador relativo aos demais competidores no formato "Melhor que X% dos jogadores hoje" ("better than % of players"), em vez de mensagens genéricas ou puramente estáticas.

## O que mudou
1. **Lógica de Cálculo de Percentil (`src/services/rankingService.ts`)**:
   - `calculatePlayerPercentile(totalPlayers, rank)`:
     - Se `totalPlayers <= 1` ou `rank === 1`: retorna `100%`.
     - Se `rank >= totalPlayers`: retorna `0%`.
     - Caso contrário: `Math.round(((totalPlayers - rank) / (totalPlayers - 1)) * 100)`.
   - `formatPlayerPercentileText(percentile)`:
     - 100%: `"Melhor que 100% dos jogadores hoje! 🏆"`
     - > 0%: `"Melhor que ${percentile}% dos jogadores hoje 🔥"`
     - 0%: `"Você completou o desafio de hoje! 🏁"`
2. **Atualização do Widget na Tela Principal (`src/components/WeeklyLeaderboardWidget.tsx`)**:
   - O subtítulo da aba Diária agora exibe a mensagem de percentil dinâmica quando o jogador completou o desafio diário.
   - Na linha do jogador dentro da listagem (caso esteja no top 3 ou fora), adicionou-se a tag de percentil (`• Melhor que X%`).
3. **Atualização do Modal de Ranking (`src/components/LeaderboardModal.tsx`)**:
   - Na aba Diária, quando o jogador completou o desafio de hoje, exibe uma faixa de destaque no topo com seu percentil de desempenho diário.
4. **Testes Unitários & Validação**:
   - Adicionados testes específicos para `calculatePlayerPercentile` e `formatPlayerPercentileText` em `src/services/__tests__/rankingService.test.ts`.
   - Atualizados testes de `WeeklyLeaderboardWidget.test.tsx` cobrindo a renderização do percentil.
   - Todos os 70 testes passando com 100% de sucesso.
   - Build de produção verificado com zero erros.
   - Screenshots geradas em viewport mobile (390x844).

## Verificações Executadas
- [x] `npm test`: 70 testes passando sem falhas.
- [x] `npm run build`: Compilação de produção com TypeScript (`tsc -b`) e Vite sem warnings.
- [x] Verificação visual mobile via automação CDP no Chrome para widget e modal.
