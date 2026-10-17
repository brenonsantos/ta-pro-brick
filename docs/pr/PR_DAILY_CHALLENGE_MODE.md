# PR: Desafio Diário Oficial, Polimento de Jogabilidade & Identidade Visual (Launch Ready)

## Contexto & Motivação
Prepara o Tá pro Brick para lançamento oficial:
1. Mecânica de desafio diário determinístico estilo Wordle com contagem regressiva para a meia-noite e Modo Treino/Garagem independente.
2. Identidade visual oficial com o novo mascote ("Lasanha no carrinho de compras com alavanca de câmbio").
3. Polimento fino de UX/UI com base em testes reais de jogabilidade (revelação de todas as pistas no fim do jogo, eliminação de bloqueios de fluxo no modal de vitória, e cabeçalho simplificado).

## Funcionalidades & Melhorias Implementadas

### 1. Desafio Diário & Modo Treino
- Mapeamento determinístico da data (`YYYY-MM-DD`) para o anúncio oficial do dia (`dailyChallenge.ts`).
- Painel com contagem regressiva (`HH:MM:SS`) em tempo real após a conclusão (`DailyCountdown.tsx`).
- Modo Treino / Garagem para jogar os outros carros livremente sem afetar streaks diários oficiais.
- Compartilhamento social formatado com numeração diária (`Tá pro Brick #X`).

### 2. Polimento de Gameplay & Pistas (`ClueViewer.tsx`)
- **Fim de Jogo**: Todas as pistas bloqueadas (fotos completas, descrição, localização e tempo de publicação) são reveladas automaticamente após o encerramento da rodada.
- **Galeria Mobile**: Suporte a touch swipe e paginação com dots interativos.
- Removido badge residual "mais fotos liberadas" ao navegar entre fotos.

### 3. Resolução de Dilema & Segurança (`VictoryModal.tsx`)
- Correção de bug de fluxo: o botão de fechar modal (`X`) fica oculto durante o dilema ("Garantir Vitória" vs "Arriscar para Cravar"), garantindo que o jogador não feche a tela sem registrar sua decisão e concluir a rodada.

### 4. Cabeçalho & Botão de Chute (`Header.tsx`, `GuessInput.tsx`)
- Contador de tentativas transferido do topo para o botão de confirmação (`CONFIRMAR 1/5` a `5/5`).
- Cabeçalho limpo com a logo oficial no badge arredondado âmbar (`bg-amber-500 shadow-md shadow-amber-500/20`).

### 5. Identidade Visual do Mascote (`public/logo.png`, `index.html`)
- Mascote oficial integrado na logo e no favicon do site.
- Imagem master de alta resolução otimizada para padrão Retina web (300px altura, 136 KB), mantendo traço ultra-nítido e carregamento instantâneo.

### 6. Limpeza Pré-Lançamento
- Removido o painel temporário de testes e o seletor de paletas de cores (`ReviewToolbar.tsx`), mantendo o design nativo Âmbar Garagem.

## Validação Executada (Estritamente Local)
- **25 testes unitários passando** (`npm test`).
- **Build de produção verificado com 0 erros/avisos** (`npm run build`).
- Bundle otimizado: CSS (47.16 kB) e JS (316.01 kB).
- Testado visualmente e funcionalmente via dev server local (`http://localhost:5173`).
- **Nenhum deploy remoto realizado** (alterações preservadas na branch local `feature/daily-challenge-mode`).
