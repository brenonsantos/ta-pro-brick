# PR: Desativação Temporária de Ads, Treino (futuro "Arquivo") e Limpeza do Rodapé

## 🎯 Resumo das Mudanças
1. **Desativação do Banner de Anúncios**: Flag `ENABLE_ADS = false` em `App.tsx` para não exibir nenhum slot de publicidade na interface até aprovação/ativação oficial.
2. **Ocultação do Botão de Curadoria**: O link de "Curadoria" foi removido do rodapé público para evitar visibilidade a jogadores comuns. O acesso direto continua 100% funcional via URL (`/#admin`, `/admin`, `?admin`) para administradores.
3. **Limpeza de Emojis no Rodapé**:
   - `Sugerir Anúncio 🚗` ➔ `Sugerir Anúncio`
   - `Remover Anúncio 🛡️` ➔ `Remover Anúncio`
   - `Contato & Redes 📬` ➔ `Contato`
4. **Desativação do Modo Treino & Preparação para "Arquivo"**:
   - Flag `ENABLE_ARCHIVE_MODE = false` em `App.tsx`.
   - Botão de alternância oculto no `Header`.
   - Botão de alternância oculto no `DailyCountdown`.
   - Nomenclatura atualizada internamente em `Header.tsx`, `DailyCountdown.tsx` e `VictoryModal.tsx` de "Treino / Garagem" para "Arquivo", garantindo consistência quando a feature for lançada.

## 🧪 Verificações Executadas
- [x] Testes unitários atualizados: 36/36 testes passando (`npm test`).
- [x] Build de produção limpo: `tsc -b && vite build` (0 erros).
- [x] Branch isolada: `feature/disable-ads-archive-cleanup`.
- [x] Nenhuma alteração enviada para repositório remoto nem deploy efetuado (estritamente local).
