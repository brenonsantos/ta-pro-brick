# PR: Instant Challenge Loading & Elimination of Local Mock Flash

## Contexto & Motivação
Ao abrir a página, a aplicação inicializava o estado de desafios com a lista local estática (`mockChallenges.json`). Poucos instantes depois, a consulta assíncrona ao Supabase retornava os desafios publicados no banco de dados e substituía o veículo na tela. Isso causava uma "piscada" visual (flash de conteúdo), onde o usuário via o carro local por uma fração de segundo antes de trocar subitamente pelo carro real do banco.

## O que mudou
1. **Cache Persistente no Navegador (`src/services/challengeService.ts`)**:
   - Criadas as funções `getCachedChallenges()`, `saveCachedChallenges()`, e `getInitialChallenges()`.
   - Assim que o Supabase entrega a lista de desafios publicados, ela é persistida no `localStorage` sob a chave `taprobrick_cached_challenges_v1`.
   - Em acessos futuros ou recarregamentos de página, `getInitialChallenges()` já lê os desafios reais do cache imediatamente de forma síncrona, eliminando 100% de qualquer piscada ou atraso.
2. **Skeleton Loader Elegante em Cold Starts (`src/App.tsx`)**:
   - Para o primeiríssimo acesso do usuário quando o Supabase está configurado e o cache ainda está vazio, a tela exibe um card de skeleton suave (*"Carregando anúncio de hoje..."*) em vez de renderizar um carro local fictício que desapareceria momentos depois.
   - Assim que o Supabase responde (~200ms), o veículo oficial do dia é renderizado suavemente.
   - Em ambientes locais sem Supabase ou em falhas de rede, mantém fallback resiliente.
3. **Testes Unitários & Robustez**:
   - Criada a suíte `src/services/__tests__/challengeService.test.ts` cobrindo o ciclo de vida do cache e fallbacks.
   - Total de 65 testes passando com sucesso.
   - Build TypeScript e Vite concluídos com zero avisos.

## Verificações Executadas
- [x] `npm test`: 13 arquivos de teste, 65 testes passando.
- [x] `npm run build`: Compilação de produção sem erros de tipagem ou avisos.
- [x] Carregamento síncrono instantâneo via cache local validado.
