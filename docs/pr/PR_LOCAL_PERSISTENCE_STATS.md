# PR: Persistência Local e Estatísticas do Jogador (Opção 1)

## Contexto & Motivação
Para que o Tá pro Brick ofereça a mesma sensação de retenção diária de jogos como Wordle sem exigir cadastro obrigatório (princípio do MVP sem fricção), os jogadores agora têm seu progresso preservado no navegador e podem acompanhar seu histórico vitalício de desempenho.

## Funcionalidades Implementadas

### 1. Persistência de Progresso da Rodada (`localStorage`)
- Salva o estado dos palpites de cada anúncio automaticamente em `taprobrick_game_states_v1`.
- Recarregar a página ou reabrir o navegador no celular não faz mais o jogador perder seus palpites ou pistas desbloqueadas.
- O botão "Jogar Novamente este Anúncio" continua permitindo reiniciar um anúncio específico para testes.

### 2. Gestor de Estatísticas & Streaks (`src/utils/statsManager.ts`)
- Estrutura de dados `PlayerStats` armazenada em `taprobrick_player_stats_v1`:
  - **Jogos Jogados** (`gamesPlayed`)
  - **% de Vitórias** (`gamesWon`)
  - **Sequência Atual** (`currentStreak`) com cálculo de dias consecutivos.
  - **Melhor Sequência** (`maxStreak`).
  - **Distribuição de Tentativas** (`guessDistribution` de 1 a 5).
  - Prevenção de duplicidade: jogar o mesmo carro repetidas vezes não infla artificialmente as métricas.

### 3. Modal de Estatísticas (`src/components/StatsModal.tsx`)
- Visual minimalista e moderno inspirado no Wordle:
  - 4 cartões com números-chave (Jogos, % Vitórias, Sequência 🔥 e Recorde 🏆).
  - Gráfico de barras horizontais proporcionais com a distribuição de palpites (Tentativas 1 a 5).
- Acessível a qualquer momento pelo botão de gráfico (`BarChart2`) no cabeçalho ou pelo modal de vitória.

## Testes & Validação
- 6 novos testes unitários adicionados em `src/utils/__tests__/statsManager.test.ts`.
- Suite total de 21 testes unitários passando (`npm test`).
- Build de produção compilado sem erros (`npm run build`).
