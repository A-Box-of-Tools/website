# Como comparar dois arquivos JSON

Compare dois arquivos JSON do jeito que vêm e quase tudo que acende não é nada: indentação, quebras de linha, chaves em outra ordem. O conserto não é um diff mais esperto — é passar antes os dois arquivos pelo mesmo formatador, para que só sobrem as diferenças de verdade. Os dois passos rodam no seu navegador, que é onde arquivos de configuração com segredos dentro devem ficar.

[Abrir Comparador de textos](https://abox.tools/pt/comparar-textos/): Dois textos entram, cada diferença sai marcada, linha a linha e palavra por palavra. Nada é colado no servidor de ninguém.

Última atualização 13 de outubro de 2026

## A resposta curta

1. Abra o [Formatador de JSON](https://abox.tools/pt/formatar-json/), cole o primeiro arquivo, ponha a indentação em dois espaços e marque *Ordenar as chaves de cada objeto*. Copie o resultado.
2. Abra o [Comparador de textos](https://abox.tools/pt/comparar-textos/) e cole na caixa da esquerda.
3. Faça o mesmo com o segundo arquivo, na caixa da direita.

O resultado fica muito mais legível: um valor alterado, uma chave nova, uma entrada removida. Somem as diferenças de formatação e as chaves reordenadas que atrapalhariam uma comparação comum, pois os dois lados foram escritos da mesma forma antes da comparação.

Nenhuma das duas páginas tem função de rede alguma, e vale saber disso: o JSON que as pessoas comparam é tantas vezes um arquivo de configuração com as credenciais ainda dentro.

## Alterações de configuração e regressões de API

Para comparar homologação com produção, preserve os originais e formate uma cópia de cada um com dois espaços e chaves ordenadas. Coloque homologação à esquerda e produção à direita, desative Ignorar maiúsculas e minúsculas e Ignorar espaços e confira endpoints, indicadores de recursos e limites. Espaços dentro de uma string e maiúsculas em uma chave podem importar. Confirme qual ambiente está em cada lado antes de baixar o patch.

A mesma receita confere uma resposta de API antes e depois de uma alteração. Use as mesmas entradas da requisição e considere separadamente datas e IDs gerados. Arrays mantêm a ordem: uma lista reordenada ainda difere, como deve ocorrer em uma sequência JSON ordenada. Números equivalentes como `1` e `1.0` ou strings com escapes diferentes também podem divergir. A comparação é de texto formatado; não valida um esquema nem a equivalência de todos os valores JSON. [O padrão JSON](https://www.rfc-editor.org/rfc/rfc8259.html#section-1) distingue objetos sem ordem de arrays ordenados.

## Por que um diff de JSON cru é quase só ruído

JSON não liga para espaço em branco, e não dá significado à ordem das chaves. O mesmo documento pode ser uma linha ou quatrocentas, as chaves na ordem em que foram digitadas ou na que alguma biblioteca cuspiu, e as ferramentas reescrevem as duas coisas sem pedir. Um lado minificado, o outro aberto; um salvo à mão, o outro por um serializador que ordena em ordem alfabética: um diff de linhas vê dois arquivos sem parentesco.

Os dois piores casos bastam para o argumento. Um arquivo **minificado** é uma linha, então um diff contra ele é uma única linha mudada, gigante: verdadeiro e inútil. E dois arquivos com **o mesmo conteúdo em outra ordem** comparam como tudo-mudou, quando a resposta honesta seria “nada”.

![As opções de comparação: visão lado a lado ou em linha, uma chave para mostrar só as linhas alteradas e chaves para ignorar espaços, maiúsculas e linhas em branco.](https://abox.tools/screens/compare-two-json-files/options.webp)

Use com cuidado as opções de ignorar: elas afetam a visualização, mas o patch baixado preserva todas as diferenças da entrada, incluindo finais de linha.

## O que a forma canônica do formatador conserta

Passar os dois arquivos pelo mesmo formatador com os mesmos ajustes é exatamente o que um diff precisa: uma grafia por documento.

- **A mesma indentação** põe cada chave na sua própria linha: o diff trabalha então linha a linha, e as marcas de palavra dele conseguem apontar o único valor que mudou dentro de uma.
- **Chaves ordenadas** põem os dois lados na mesma ordem, e a ordem deixa de ser uma diferença. A ordenação segue como as chaves se leem, não os pontos de código — `item2` antes de `item10` — e é aplicada idêntica dos dois lados.
- **Nada mais se move.** Este formatador mantém os números com os dígitos que você escreveu e mantém chaves duplicadas em vez de resolvê-las: canonizar não consegue inventar sozinho uma diferença. O [guia do formatador](https://abox.tools/pt/guias/formatar-json/) explica por que isso é mais raro do que deveria.

Uma ressalva honesta: a saída ordenada é o documento com as chaves movidas. Se alguma ferramenta adiante liga para a ordem das chaves — poucas ligam, mas existem — trate as cópias ordenadas como a coisa comparada, não como substitutas dos originais.

## Lendo o resultado, e levando com você

O comparador marca à esquerda as linhas removidas, à direita as adicionadas, e destaca dentro de uma linha mudada as palavras que diferem: numa forma canônica, isso costuma ser o único valor que foi de `false` para `true`. O meio sem mudanças se dobra num contador, então uma configuração de duas mil linhas com três retoques se lê como três trechos curtos.

O download é um patch unificado, um `.patch`: o formato que a revisão de código entende. Ele descreve as formas canônicas, que costuma ser o que uma revisão quer de qualquer jeito: a mudança, sem a reformatação.

Formatar antes de comparar também facilita revisar YAML ou XML, mas suas regras de espaços e conversão diferem das do JSON. Preserve a linguagem original se só precisa mudar a apresentação. As opções de ignorar afetam a visualização; o patch compara as strings reais de entrada. Aqui são as cópias formatadas, portanto o patch não se aplica aos originais intactos.

![Duas versões de uma configuração JSON lado a lado, com as linhas alteradas marcadas: um número de versão, uma contagem de novas tentativas, uma opção adicionada e uma região adicionada.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Quatro diferenças de verdade, e nada mais apontado. Ler é a metade fácil; o trabalho foi feito pelos ajustes de cima.

## Se você faz isso toda semana

Formatar duas vezes, colar duas vezes: os passos moram em duas páginas porque cada página faz um trabalho, e cada uma consegue provar sozinha que nada do que você colou foi para lugar nenhum. Mas as duas são código aberto: licença MIT, módulos ES sem dependências — o parser do formatador mantém ordem de chaves e dígitos, o diff é o algoritmo de Myers — cada um com um README que o explica.

Se isso faz parte do seu dia, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça uma página de duas caixas que canoniza enquanto compara: `parseJson`, `printJson` e `compareText` estão a três imports dali. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
