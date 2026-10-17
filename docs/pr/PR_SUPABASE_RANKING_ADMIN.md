# PR: Ranking por Pontos, Sessões/Auth, Painel Admin e Schema Supabase (Milestone 7)

## Contexto & Motivação
Prepara o Tá pro Brick para a camada de persistência em nuvem e competição entre pilotos:
1. **Ranking por Pontos**: Leaderboard baseado na pontuação das rodadas (precisão + bônus de risco), com abas para o Desafio de Hoje e Classificação Geral acumulada.
2. **Sessão & Identidade**: Usuários anônimos por padrão com apelidos personalizáveis ("Piloto #123") e botão de conexão Google para sincronização entre dispositivos.
3. **Painel de Curadoria (`/admin`)**: Interface administrativa protegida por senha para agendamento de desafios diários com fotos, pistas e registro de autorização.
4. **Resiliência Offline / Supabase Ready**: Schema SQL completo pronto para rodar no Supabase, com fallback automático em armazenamento local caso as variáveis de ambiente ainda não tenham sido configuradas.

## Funcionalidades Implementadas

### 1. Sistema de Ranking por Pontos (`rankingService.ts`, `LeaderboardModal.tsx`)
- Ordenação estrita:
  1. Maior pontuação total (`score DESC`).
  2. Menor número de tentativas em caso de empate (`attemptsCount ASC`).
  3. Horário de conclusão (`completedAt ASC`).
- Abas:
  - **Hoje (#X)**: Ranking diário bloqueado com cadeado anti-spoiler até o jogador concluir a sua própria rodada.
  - **Geral (Total)**: Ranking histórico da temporada com medalhas de ouro 🥇, prata 🥈 e bronze 🥉.
- Atalhos de acesso:
  - Botão de troféu (`Trophy`) no cabeçalho.
  - Botão de acesso direto no modal de vitória/derrota.

### 2. Gestão de Pilotos & Sessões (`playerService.ts`)
- Gera identificador único de jogador e apelidos temáticos automáticos (ex: *Piloto da Caravan #210*).
- Permite renomear o apelido inline no ranking.
- Integração preparada com OAuth do Google via Supabase (`signInWithGoogle()`).

### 3. Painel Administrativo de Curadoria (`src/pages/AdminPage.tsx`, `adminService.ts`)
- Acesso via rota `/admin`, `?admin` ou `#admin`, com link discreto no rodapé.
- Protegido por senha (padrão: `adminbrick`, configurável via `VITE_ADMIN_PASSWORD`).
- Métricas no topo: Desafios cadastrados, desafio ativo de hoje e cobertura de dias futuros.
- Formulário de cadastro completo:
  - Data de publicação
  - Título do anúncio
  - Preço anunciado pelo vendedor (R$)
  - Galeria de fotos com preview dinâmico de miniaturas
  - Pistas: Descrição, Cidade/Estado e Tempo anunciado
  - Registro de autorização/permissão do anúncio
- Calendário / Tabela com status (`HOJE`, `AGENDADO`, `PASSADO`) e ações de edição e exclusão.

### 4. Schema PostgreSQL para Supabase (`supabase/schema.sql`, `.env.example`)
- Tabelas: `challenges`, `players`, `daily_results`.
- View agregadora `view_leaderboard_all_time`.
- Políticas RLS (Row Level Security) para proteger desafios futuros contra vazamento de spoilers.

## Validação Executada (Estritamente Local)
- **29 testes unitários passando** (`npm test`).
- **Build de produção verificado com 0 erros/avisos** (`npm run build`).
- Validação visual em navegador headless com captura de screenshots:
  - Modal de ranking (desafio de hoje com anti-spoiler e geral por pontos).
  - Tela de login administrativo e dashboard completo de agendamento.
- **Nenhum deploy remoto realizado** (trabalho preservado na branch `feature/supabase-ranking-admin`).
