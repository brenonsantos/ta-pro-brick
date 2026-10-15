# PR: Simplificação de Textos no Onboarding e Modal de Vitória

## Contexto & Motivação
Os usuários relataram que as telas continham muito texto para ler, especialmente no primeiro acesso (modal de ajuda/onboarding) e ao vencer/concluir o desafio (modal de vitória). Em jogos casuais para mobile (estilo Wordle), ninguém quer ler manuais de regras longos ou explicações matemáticas de bônus.

## Alterações Realizadas

### 1. Onboarding (`HelpModal.tsx`)
- Substituição de 4 cartões extensos (tabela de todas as pistas por rodada, lista de todas as faixas percentuais de erro e matemática do dilema de risco) por **3 passos visuais diretos**:
  1. 🎯 **Chute o Preço do Anúncio:** Valor pedido na vida real (não é FIPE!).
  2. 💡 **Pistas a Cada Tentativa:** Fotos extras, descrição e detalhes desbloqueados progressivamente.
  3. 🔥 **Dicas de Calor & Direção:** Indicação clara de "O dono pediu mais (▲)" ou "O dono pediu menos (▼)".
- Botão principal simplificado para **"Bora Jogar! 🚀"**.
- Layout compacto que cabe perfeitamente na tela do celular sem necessidade de rolagem.

### 2. Modal de Vitória & Fim de Rodada (`VictoryModal.tsx`)
- **Vitória Antecipada (Dilema de Risco):**
  - Removido texto denso explicativo.
  - Criado destaque visual limpo com a **Pontuação Garantida** e o bônus de palpites restantes.
  - Botões de ação objetivos e claros: **"Garantir Vitória e Pontos"** vs **"Arriscar para Cravar (X restantes)"**.
- **Resultado Final (Concluído):**
  - Card condensado apresentando o **Preço Real**, o **Melhor Palpite** e a **Pontuação Final**.
  - Ações diretas: **"Próximo Desafio 🚗"**, **"Compartilhar Resultado"**, **"Ver Anúncio Original ↗"** e **"Jogar Novamente"**.

## Validação Executada
- `npm test`: 15 testes unitários passaram com sucesso.
- `npm run build`: Build de produção compilado sem avisos ou erros de TypeScript.
