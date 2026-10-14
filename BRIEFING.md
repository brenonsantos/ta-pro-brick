# Chuta a FIPE --- Briefing do Projeto

> Documento-base para continuar o desenvolvimento em uma ferramenta de
> CLI/terminal.
>
> **Status:** conceito e escopo inicial definidos; regras numéricas e
> decisões técnicas ainda pendentes. **Mercado:** Brasil. **Idioma do
> produto:** português brasileiro. **Plataforma inicial:** aplicação
> web, mobile-first. **Nome:** provisório; ainda não aprovado.

## 1. Instruções para a IA que trabalhar neste projeto

Use este documento como fonte de contexto do produto. Preserve a
distinção entre:

-   **Decidido:** requisito explicitamente escolhido.
-   **Pendente:** decisão ainda não tomada.
-   **Hipótese:** ideia a validar, não um requisito confirmado.

Não invente decisões pendentes nem trate sugestões como aprovações. Se
uma decisão importante bloquear o trabalho, faça uma pergunta objetiva
de cada vez. Prefira soluções simples e adequadas ao MVP; não antecipe
funcionalidades sem necessidade. Não escolha a stack antes de considerar
os requisitos e o estágio do projeto.

O objetivo inicial é validar a experiência central do jogo, não
construir uma plataforma grande.

## 2. Resumo executivo

O projeto é um jogo diário de adivinhar o preço anunciado por um
vendedor em um anúncio real de carro usado no Brasil. É inspirado no
formato de jogos diários como Wordle: todos recebem o mesmo desafio, têm
um número limitado de tentativas e podem compartilhar o resultado.

A identidade deve refletir a cultura automotiva brasileira, com humor
sobre anúncios curiosos, carros improváveis e preços absurdos. A
interface deve ser limpa e moderna; o humor aparece na linguagem e no
conteúdo, sem transformar toda a experiência em meme.

**Importante:** o jogador tenta acertar o preço pedido pelo vendedor.
Não está tentando adivinhar a FIPE, o valor justo do veículo ou o preço
pelo qual o carro será efetivamente vendido.

O nome "Chuta a FIPE" surgiu como possibilidade de trabalho, mas **não é
o nome definitivo** e pode ser inadequado por sugerir uma mecânica
diferente da real. A escolha do nome permanece em aberto.

## 3. Público e posicionamento

### Público-alvo

-   Entusiastas automotivos brasileiros.
-   Pessoas que acompanham anúncios de carros usados.
-   Pessoas que gostam de curiosidades, preços improváveis e humor
    automotivo.
-   Jogadores casuais que querem uma experiência curta para repetir
    diariamente.

### Tom e apresentação

-   Português brasileiro natural.
-   Humor e referências automotivas na comunicação, nos resultados e na
    seleção de anúncios.
-   Interface clara, rápida e moderna.
-   Prioridade para celular, com adaptação posterior para desktop.
-   A experiência deve continuar compreensível para quem não é
    especialista em carros.

## 4. Mecânica do jogo

### Desafio diário

-   Um único desafio compartilhado por dia.
-   Todos os jogadores recebem o mesmo anúncio e o mesmo preço-resposta.
-   Cada rodada tem seis tentativas.
-   Cada palpite confirmado consome uma tentativa.
-   O preço-resposta é fixado antes da publicação.
-   A rodada continua válida mesmo que o anúncio original seja alterado
    ou removido.

### Pistas progressivas

As pistas devem ser extraídas do conteúdo autorizado do anúncio. Não
inventar fatos sobre o veículo.

A sequência de informações prevista é:

1.  Título do anúncio e foto de capa.
2.  Outras fotos do anúncio.
3.  Descrição do anúncio.
4.  Cidade e estado.
5.  Tempo desde a publicação.

São cinco grupos de pistas para seis tentativas. A distribuição exata
dos grupos entre as tentativas ainda precisa ser decidida.

### Palpites e feedback

Depois de cada palpite confirmado, o jogo deve:

-   Informar se o preço correto é maior ou menor que o palpite.
-   Mostrar um indicador visual de proximidade, como barra ou escala de
    cores.
-   Não exibir um percentual exato de proximidade.
-   Deixar claro quantas tentativas restam.

### Vitória

O jogador vence quando seu palpite fica dentro de uma tolerância
percentual do preço anunciado. A tolerância ainda não foi definida.

Quando atingir a condição de vitória, o jogador pode encerrar a rodada
ou continuar tentando melhorar a pontuação, usando as tentativas
restantes.

Se não atingir a tolerância após seis tentativas, ainda recebe uma
pontuação baseada na proximidade do melhor palpite.

### Melhor palpite e pontuação

-   A pontuação deve combinar precisão e número da tentativa em que o
    melhor palpite foi registrado.
-   O melhor palpite da rodada deve ser preservado.
-   Um palpite posterior pior não pode substituir um melhor resultado
    anterior.
-   A fórmula exata, os limites e o tratamento dos empates ainda não
    foram definidos.

## 5. Resultado e compartilhamento

Ao finalizar a rodada, mostrar:

-   Preço anunciado correto.
-   Anúncio completo utilizado no desafio.
-   Melhor palpite do jogador.
-   Diferença absoluta entre o melhor palpite e o preço real.
-   Pontuação e resultado da rodada.
-   Link para o anúncio original, quando disponível.
-   Ação para compartilhar o resultado.

O resumo compartilhável deve evitar spoilers: não revelar o preço
correto. Deve incluir um link para o desafio diário, para que outras
pessoas possam jogar o mesmo desafio.

## 6. Contas, persistência e estatísticas

### Sem conta

Qualquer pessoa pode jogar sem cadastro. Progresso e estatísticas
básicas são armazenados localmente no navegador. Não haverá
sincronização entre dispositivos para jogadores sem conta no MVP.

### Login opcional

O MVP deve oferecer login opcional com Google.

Para jogadores autenticados, as estatísticas previstas são:

-   Sequência atual de desafios concluídos.
-   Recorde de sequência.
-   Total de desafios concluídos.
-   Total de vitórias.
-   Pontuação acumulada.

Não incluir no MVP ranking competitivo, histórico detalhado dia a dia ou
funcionalidades competitivas avançadas.

### Regra da sequência diária

-   A sequência aumenta quando o jogador completa as seis tentativas,
    independentemente de vencer.
-   Se deixar um dia sem concluir, a sequência atual zera.
-   O recorde histórico permanece salvo.

**Pendente:** definir se uma rodada incompleta pode ser retomada em
outro dispositivo após login e como resolver conflitos entre progresso
local e progresso da conta.

## 7. Conteúdo dos anúncios e permissões

A fonte dos anúncios ainda não foi escolhida. A decisão depende de
pesquisa sobre termos de uso, direitos sobre fotos e textos, permissões
e alternativas.

### Estratégia de curadoria

-   Selecionar anúncios manualmente.
-   Aceitar sugestões da comunidade.
-   Obter as permissões necessárias antes de publicar.
-   Preparar sete desafios antecipadamente por semana.

### Autorização e direitos de uso

A intenção é obter autorização para reproduzir as fotos e as informações
dos anúncios. A disponibilidade pública de uma página não deve ser
interpretada como autorização automática para republicar seu conteúdo.

O processo editorial deve impedir a publicação quando as permissões
necessárias não estiverem confirmadas. Registrar quem autorizou, o que
foi autorizado, quando e quaisquer condições relevantes.

Os requisitos legais e as condições das plataformas precisam ser
verificados antes de decidir a fonte. Este documento não constitui
parecer jurídico.

### Snapshot do desafio

No momento da publicação, preservar uma cópia estável do conteúdo
autorizado, incluindo:

-   Preço-resposta.
-   Título e informações autorizadas.
-   Fotos autorizadas.
-   Localização, quando disponível.
-   Data ou tempo de publicação, quando disponível.
-   URL original, quando disponível.

Se o anúncio original mudar ou desaparecer, a rodada publicada continua
com a resposta e o conteúdo congelados. O link original é complementar e
pode deixar de funcionar.

### Painel administrativo

O MVP inclui um painel administrativo protegido dentro do site para:

-   Cadastrar e editar anúncios.
-   Registrar permissões.
-   Enviar e organizar fotos.
-   Definir preço-resposta.
-   Agendar datas de publicação.
-   Consultar desafios agendados e publicados.

Fluxo editorial previsto:

`Rascunho → Aguardando autorização → Pronto → Agendado → Publicado`

Manter o painel simples; não é necessário construir um CMS genérico.

## 8. Escopo do MVP

### Incluído

-   Desafio diário compartilhado.
-   Seis tentativas por rodada.
-   Pistas progressivas.
-   Feedback de maior/menor e proximidade visual.
-   Vitória baseada em tolerância percentual.
-   Pontuação baseada em precisão e tentativas.
-   Melhor palpite preservado.
-   Revelação final.
-   Compartilhamento sem spoiler.
-   Progresso local sem conta.
-   Login opcional com Google.
-   Estatísticas simples de conta.
-   Painel administrativo protegido.
-   Curadoria manual e agendamento de desafios.
-   Registro das permissões necessárias.
-   Snapshot do conteúdo publicado.

### Fora do MVP

-   Ranking global ou entre amigos.
-   Modo livre.
-   Arquivo público de desafios antigos.
-   Funcionalidades competitivas avançadas.
-   Coleta automatizada de anúncios.
-   Sistema sofisticado de analytics.
-   Sincronização entre dispositivos para jogadores sem conta.

Esses itens podem ser reavaliados depois de validar a mecânica
principal.

## 9. Validação inicial

O lançamento inicial será um teste fechado com amigos e entusiastas
automotivos.

O teste deve avaliar três dimensões, sem depender de analytics
sofisticado:

1.  **Diversão e feedback qualitativo:** entender se a rodada é
    divertida, se as pistas fazem sentido e se as regras são claras e
    justas.
2.  **Retorno diário:** observar se os participantes voltam
    espontaneamente nos dias seguintes.
3.  **Compartilhamento:** observar se compartilham os resultados e
    convidam outras pessoas.

Ainda falta definir o tamanho do grupo, a duração do teste e os
critérios mínimos para decidir se vale avançar.

## 10. Ordem de trabalho recomendada

1.  Consolidar este briefing e manter decisões pendentes explícitas.
2.  Definir as regras mínimas necessárias para um protótipo.
3.  Criar um protótipo navegável da rodada.
4.  Simular palpites, pistas, vitórias, derrotas e pontuação.
5.  Testar se o fluxo é divertido e compreensível.
6.  Pesquisar e validar a origem dos anúncios e as permissões.
7.  Escolher stack, arquitetura, banco de dados e hospedagem com base
    nos requisitos confirmados.
8.  Implementar o jogo central.
9.  Implementar persistência, login, estatísticas e painel
    administrativo.
10. Executar o teste fechado, coletar feedback e priorizar ajustes.

Não começar por funcionalidades periféricas nem escolher a tecnologia
apenas por familiaridade. A escolha técnica deve considerar
simplicidade, manutenção, custo e necessidades reais do MVP.

## 11. Decisões ainda abertas

Não assumir respostas para estes pontos:

  Tema           Decisão pendente
  -------------- --------------------------------------------------
  Nome           Nome definitivo do jogo
  Identidade     Direção visual e marca
  Tolerância     Margem percentual para vitória
  Pontuação      Fórmula, limites e desempates
  Pistas         Mapeamento das cinco etapas para seis tentativas
  Calendário     Horário de renovação e fuso horário
  Fontes         Plataformas ou fontes de anúncios permitidas
  Permissões     Processo e evidências de autorização
  Persistência   Retomada de rodada entre dispositivos com login
  Teste          Tamanho do grupo, duração e critérios de sucesso
  Tecnologia     Stack, arquitetura, hospedagem e banco de dados

## 12. Princípios de produto

-   A diversão da rodada é mais importante que a quantidade de
    funcionalidades.
-   Todos devem jogar o mesmo desafio diário.
-   A resposta deve ser determinística e não mudar depois da publicação.
-   O conteúdo precisa ter origem e permissões rastreáveis.
-   O jogo deve funcionar sem exigir conta.
-   O compartilhamento não deve estragar o desafio para outras pessoas.
-   A primeira versão deve ser simples de operar manualmente.
-   Decisões ainda não tomadas devem continuar identificadas como
    pendentes.

## 13. Primeira entrega recomendada

A primeira entrega de desenvolvimento deve ser um protótipo funcional da
rodada, usando conteúdo de teste autorizado. Deve permitir:

1.  Ver a primeira pista.
2.  Inserir e confirmar um palpite.
3.  Receber feedback de maior/menor e proximidade.
4.  Desbloquear pistas de acordo com as tentativas.
5.  Testar vitória, continuação e fim das seis tentativas.
6.  Visualizar o resultado final e um resumo compartilhável sem spoiler.

O protótipo deve validar a experiência central antes de implementar
autenticação, persistência remota e administração completa.
