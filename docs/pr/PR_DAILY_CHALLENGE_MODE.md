# PR: Mecânica de Desafio Diário Oficial & Modo Garagem (Milestone 5)

## Contexto & Motivação
Para transformar o Tá pro Brick em um jogo diário de retenção real (estilo Wordle), todos os jogadores passam a receber exatamente o mesmo veículo no dia, com contagem regressiva para o próximo anúncio à meia-noite. Para preservar a diversão e exploração de amigos, foi mantido um "Modo Garagem / Treino" acessível.

## Funcionalidades Implementadas

### 1. Agendador Diário Determinístico (`src/utils/dailyChallenge.ts`)
- Mapeamento determinístico da data do dia (`YYYY-MM-DD`) para o índice do anúncio da vez.
- Numeração sequencial do desafio diário (ex: `Tá pro Brick #1`, `#2`, etc.).
- Cálculo dinâmico do tempo restante até a meia-noite (`00:00:00`).

### 2. Painel de Contagem Regressiva (`src/components/DailyCountdown.tsx`)
- Ao concluir o desafio do dia (vitória ou esgotamento das 5 tentativas), a tela exibe:
  - *"Desafio Diário #X Concluído!"*
  - Relógio regressivo em tempo real (`HH:MM:SS`) para a meia-noite.
  - Botão de compartilhamento com a numeração do dia.
  - Botão de atalho para o *"Modo Treino 🚗"*.

### 3. Modo Treino / Garagem Separado
- O desafio diário principal é limpo, direto e sem distrações (sem seletor de carros).
- Pelo cabeçalho ou pelo banner de encerramento, o jogador pode alternar para o **Modo Treino**:
  - Testa qualquer um dos 5 carros livremente.
  - O treino não quebra nem altera o streak diário oficial.

### 4. Compartilhamento Atualizado
- O texto gerado agora inclui a hashtag oficial do dia: `Tá pro Brick #1`.

## Validação Executada (Estritamente Local)
- 25 testes unitários passando (`npm test`).
- Build de produção validado com zero erros (`npm run build`).
- Rodando localmente em `http://localhost:5173` na branch `feature/daily-challenge-mode`.
- **Nenhum deploy realizado** (conforme solicitado pelo usuário).
