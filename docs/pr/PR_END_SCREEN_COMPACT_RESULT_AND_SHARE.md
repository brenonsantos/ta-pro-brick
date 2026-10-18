# PR: Compact End-Screen Result, Hide Input Bar & Native Mobile Share

## Contexto & Motivação
Após a conclusão do desafio diário, a experiência na tela principal ainda mantinha a barra de chute ("Quanto o vendedor pediu?"), que perdia a utilidade já que a rodada estava encerrada. Além disso, o usuário era obrigado a abrir um modal separado ("Ver Resultado") para conferir o preço real e o resumo do seu desempenho, e o botão de compartilhamento no celular apenas copiava o texto em vez de acionar a folha de compartilhamento nativa (WhatsApp, redes sociais, etc).

## O que mudou
1. **Ocultação da Barra de Chutes Concluída (`src/App.tsx`)**:
   - `<GuessInput />` é condicionalmente ocultado quando `currentGameState.status === 'completed'`.
2. **Card Compacto de Resultado Integrado (`src/components/DailyCountdown.tsx`)**:
   - Exibe diretamente na tela principal o cabeçalho de conclusão com troféu, preço real do anúncio, melhor chute do jogador (com heat indicator e diferença de valor/percentual), pontuação final e contagem de tentativas.
   - Link direto para visualizar o anúncio original no Marketplace (`externalLink`).
   - Botão de destaque "Compartilhar Resultado" e link secundário sutil para quem desejar abrir as estatísticas detalhadas.
3. **Compartilhamento Nativo no Celular (`src/utils/shareText.ts`)**:
   - Implementada a função utilitária `shareGameResult`: utiliza a **Web Share API** (`navigator.share`) em smartphones (iOS e Android) com captura de cancelamento (`AbortError` sem alertas indesejados), mantendo fallback seguro de cópia na área de transferência (`navigator.clipboard.writeText`) para desktop e navegadores sem suporte.
   - Integrada tanto no botão principal da contagem regressiva quanto no `VictoryModal.tsx`.
4. **Testes Unitários & Robustez**:
   - Adicionados testes para `shareGameResult` (cobertura de Web Share, cancelamento e clipboard fallback).
   - Adicionados testes para o card compacto do `DailyCountdown`.
   - Total de 60 testes automatizados passando e build TypeScript sem avisos.

## Verificações Executadas
- [x] `npm test`: 12 arquivos de teste, 60 testes passando com 100% de sucesso.
- [x] `npm run build`: Compilação de produção com Vite e TypeScript (`tsc -b`) bem-sucedida.
- [x] Verificação visual mobile via automação CDP no Chrome: screenshot gerada em 390x844 confirmando ocultação do input, layout do card compacto e visualização do ranking semanal.
