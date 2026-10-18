# PR: Dual Daily & Weekly Leaderboard Widget on Home Screen

## Contexto & Motivação
O widget de classificação exibido na tela inicial após o término do desafio diário focava exclusivamente no ranking semanal. O usuário solicitou que o widget apresentasse tanto as informações do **ranking diário** (da rodada jogada hoje) quanto do **ranking semanal** (acumulado da semana).

## O que mudou
1. **Seletor de Abas no Widget da Tela Principal (`src/components/WeeklyLeaderboardWidget.tsx`)**:
   - Adicionado controle segmentado no topo do widget: `[ 📅 Ranking de Hoje (#X) ]` e `[ 🏆 Ranking Semanal ]`.
   - Consulta simultânea e veloz de `getDailyLeaderboard(challengeId)` e `getWeeklyLeaderboard()` via `Promise.all`.
2. **Visão Diária ("Ranking de Hoje")**:
   - Exibe o pódio dos 3 melhores pilotos da rodada de hoje com número de chutes utilizados e horário de conclusão.
   - Destaca a posição do próprio jogador ("Você") ou sua linha separada caso esteja fora do Top 3.
   - Subtítulo contextual e botão de rodapé "Ver Classificação Diária Completa".
3. **Visão Semanal ("Ranking Semanal")**:
   - Mantém as informações acumuladas da semana (pontos totais, vitórias e rodadas jogadas).
   - Aviso de reset semanal ("Zera em Xd Yh (domingo 00h)").
   - Botão de rodapé "Ver Ranking Semanal Completo".
4. **Integração no `App.tsx`**:
   - O widget agora recebe `challengeId={dailyChallenge.id}` e `dayNumber={dailyChallengeNumber}`.
   - O callback `onOpenLeaderboard(tab)` abre o `LeaderboardModal` diretamente na aba selecionada pelo jogador (`daily` ou `weekly`).
5. **Testes Unitários & Validação**:
   - Suíte de testes atualizada em `src/components/__tests__/WeeklyLeaderboardWidget.test.tsx` com 100% de sucesso.
   - Build de produção verificado com zero erros.
   - Screenshots geradas em viewport mobile (390x844) validando ambas as abas.

## Verificações Executadas
- [x] `npm test`: 61 testes passando sem falhas.
- [x] `npm run build`: Compilação de produção com TypeScript (`tsc -b`) e Vite sem warnings.
- [x] Verificação visual mobile via automação CDP no Chrome para aba Diária e aba Semanal.
