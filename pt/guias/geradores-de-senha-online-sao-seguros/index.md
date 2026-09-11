# É seguro usar um gerador de senhas online?

Sua suspeita está certa, e vale conservá-la: uma página que fabrica senhas é exatamente a página que não pode lembrá-las. A boa notícia é que isso se verifica — o acaso nasce na sua máquina, envios são visíveis, e um gerador que guarda o que fez pode ser pego no ato.

Última atualização 26 de agosto de 2026

## A resposta curta

A suspeita por trás desta pergunta é exatamente a certa, então conserve-a. Uma página que fabrica senhas é a única página da web que não tem nada sensível a receber e tudo de sensível a *guardar*: a saída dela é o segredo, e um gerador que transmitisse o que fabrica não seria uma ferramenta fraca, seria uma coleção de senhas. A pergunta nunca é se uma página geradora parece confiável. É se ela *conseguiria* ficar com a senha se quisesse — e isso, coisa rara, dá para verificar.

Três coisas decidem: de onde vem o acaso, se o resultado pode sair da página, e se algo no resultado é previsível. As três têm respostas honestas que um visitante pode conferir — mais do que se pode dizer de um aplicativo baixado que gera numa janela onde ninguém enxerga.

## De onde vem o acaso do navegador

Todo gerador sério num navegador bebe do mesmo poço: `crypto.getRandomValues`, o gerador aleatório criptográfico do navegador, semeado e ressemeado pelo sistema operacional com ruído do hardware. É a mesma fonte de onde o navegador tira as chaves TLS — a criptografia sobre a qual roda a sua conexão com o banco. Não existe sentido útil em que um programa de desktop tenha acesso a acaso melhor que uma página web; os dois terminam no mesmo poço do sistema.

O que uma página *não* deve usar é `Math.random()`, a função de uso geral para jogar um dado. Os navegadores a implementam com um gerador rápido cujo estado interno se reconstrói a partir de um punhado de saídas consecutivas — ou seja, senhas construídas sobre ele parecem aleatórias e são calculáveis por quem viu uma delas. Não é teórico; já foi demonstrado contra geradores em circulação mais de uma vez. E é invisível de fora, que é o argumento mais forte a favor dos geradores de código legível: a diferença entre as duas funções é uma palavra no fonte.

Há um grau de capricho mais fino ainda. Transformar palavras aleatórias de 32 bits em “um número abaixo de 26” com um resto simples é levissimamente enviesado para as primeiras letras; um gerador cuidadoso sorteia de novo em vez de tomar o resto. O [gerador daqui](https://abox.tools/pt/gerador-de-senha/) faz isso — o viés evitado é de uma parte em 165 milhões, invisível no uso e exatamente o tipo de detalhe que separa uma ferramenta construída para o trabalho de um trecho copiado de fórum.

## O que uma página geradora ruim poderia fazer

Vamos nomear as falhas sem rodeio, porque cada uma se verifica:

- **Mandar a senha para fora.** A página gera em local e depois envia o que fez — no clique, com a telemetria, ou em lote mais tarde. Essa é a falha desclassificante, e é visível: precisa ser uma requisição de rede, e requisições podem ser vigiadas.
- **Gerar no servidor.** A senha chega pela rede em vez de sair por ela — então o operador a viu primeiro, e sobre como foi feita você não aprende nada. Mesma verificação, na outra direção.
- **Gerar fraco.** `Math.random`, uma semente de relógio, uma lista de poucas centenas de palavras vendida como forte. Essa nenhuma aba de Rede pega; só código legível pega, ou um indicador de força honesto, contado a partir dos ajustes reais.
- **Manter um histórico.** Lembrar prestativamente as suas últimas vinte senhas — num armazenamento que sobrevive à aba, numa máquina que pode ser compartilhada.

O [gerador de senhas e frases- senha](https://abox.tools/pt/gerador-de-senha/) deste site é construído contra as quatro por concepção: `crypto.getRandomValues` e nada mais, geração na página, nenhum armazenamento de espécie alguma, sem histórico, e uma linha de força que informa exatamente quantos resultados eram possíveis com os seus ajustes. As listas de palavras das frases-senha são as listas Diceware da EFF, embarcadas sem alteração na pasta da ferramenta.

## Como verificar qualquer gerador, este incluído

O método completo está escrito no [guia sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/), e esta é a página em que aplicá-lo antes de qualquer outra:

- **Puxe o cabo primeiro.** Carregue a página, fique offline, *depois* gere. Uma senha feita sem conexão não pode ter vindo de fora nem ter saído no momento em que nasceu. Esta página continua funcionando offline; esse é o sentido dela.
- **Olhe a aba de Rede enquanto gera.** Aperte o botão e leia a lista: nada deve sair. Depois copie a senha e olhe de novo — a cópia é o momento que uma página desonesta escolheria.
- **Procure o que uma coleção precisaria ter.** Uma conta, uma sincronização, uma lista de “geradas recentemente”. Gerador com memória tem cópia.

Uma ressalva honesta pertence ao final. Uma verificação diz o que a página fez enquanto você olhava; código publicado e servido legível — como tudo neste site — diz o que ela faz em geral. Sobra a máquina em si: nenhuma página web protege uma senha de um navegador comprometido ou de um programa espião, e um gerador não é exceção. O que as verificações compram é menor e real — uma senha que servidor nenhum jamais viu, fabricada por uma aritmética que deixaram você ler.
