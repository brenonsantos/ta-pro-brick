# PR: Indicador Compacto de Próximas Pistas e Ocultação de Cards Bloqueados

## Motivação e Problema
Usuários mobile relataram dificuldade em localizar a caixa de entrada de palpite (`GuessInput`) ao abrir o jogo pela primeira vez. 
Os cards grandes cinzas de pistas bloqueadas (Descrição, Cidade/Estado e Tempo de Publicação) ocupavam mais de 250px verticais, empurrando o campo de chute para baixo da dobra da tela em smartphones.

## Solução Implementada
- **Ocultação de Cards Bloqueados:** As seções de pistas bloqueadas não são mais renderizadas como caixas grandes vazias, aproximando imediatamente o input de preço da foto principal.
- **Indicador Compacto (1 linha):** Abaixo da foto e título, exibe uma linha discreta informando as próximas pistas a serem liberadas com ícones e chips (`+Fotos (2º chute)`, `Descrição (3º chute)`, `Cidade (4º chute)`, `Tempo (5º chute)`).
- **Revelação Progressiva Suave:** Conforme os palpites são realizados, as pistas liberadas surgem no DOM com transição e fade-in suave, enquanto o chip correspondente sai da barra compacta.
- **Modos Flexíveis:** Suporte nativo em [`ClueViewer`](file:///Users/brenoniehues/Breno/ta-pro-brick/src/components/ClueViewer.tsx) aos modos `'compact-indicator'`, `'clean'` e `'classic'`.

## Verificação e Testes
- Adicionados 5 testes unitários em [`src/components/__tests__/ClueViewer.test.tsx`](file:///Users/brenoniehues/Breno/ta-pro-brick/src/components/__tests__/ClueViewer.test.tsx).
- Suite completa passando: 44/44 testes (`npm test`).
- Build de produção verificado sem avisos ou erros de compilação (`npm run build`).
