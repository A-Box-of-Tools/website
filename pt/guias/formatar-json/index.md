# Como formatar JSON sem entregar para ninguém

Formatar JSON deveria mudar os espaços e mais nada. A maioria das ferramentas que se oferecem para fazer isso muda bem mais, e nenhuma comenta. Aqui está o que observar, como ler o erro quando o arquivo não passa pelo leitor, e por que a caixa em que você cola um arquivo de configuração merece um pensamento.

[Abrir Formatador de JSON](https://abox.tools/pt/formatar-json/): JSON, XML, HTML, CSS e YAML, formatados ou convertidos. Nada é colado no servidor de ninguém.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Texto e código](https://abox.tools/pt/formatar-json/), cole o JSON na caixa, e leia. A identação acontece enquanto você digita, a linguagem é deduzida do texto, e a identação é de dois espaços a não ser que você diga outra coisa. Nada é enviado, porque não há para onde: o leitor são umas poucas centenas de linhas de JavaScript rodando na aba que você já tem aberta.

Tudo o que vem abaixo é o que vale saber antes de colar um arquivo de configuração em qualquer das alternativas: o que um formatador tem direito de mudar, o que a maioria muda mesmo assim, e como ler o erro quando o arquivo não passa de jeito nenhum.

![Dois painéis: uma única linha de JSON à esquerda, o mesmo documento formatado com dois espaços de recuo à direita.](https://abox.tools/screens/format-json-without-uploading-it/panes.webp)

Entra uma linha, sai algo legível. Para isso nada foi enviado a lugar nenhum.

## O que é formatar, e o que não é

JSON quase não tem sintaxe. Um objeto, um array, uma string, um número, e as três palavras `true`, `false` e `null`. Entre essas peças, espaço em branco não quer dizer nada: o arquivo

```
{"name":"thing","tags":["local","offline"]}
```

e o arquivo

```
{
  "name": "thing",
  "tags": [
    "local",
    "offline"
  ]
}
```

são o mesmo documento. Formatar é o trabalho de sair do primeiro e chegar ao segundo, e *o trabalho é esse*. Qualquer outra coisa que um formatador faça com o seu arquivo — reordenar, arredondar, largar pelo caminho — é uma mudança no que o documento diz, feita sem ninguém pedir.

Três dessas mudanças são comuns o bastante para merecer nome, porque são silenciosas e porque é o que um formatador escrito numa tarde faz por padrão.

## As três coisas que um formatador não deve mudar

### A ordem das suas chaves

Essa é a que pega as pessoas. O jeito óbvio de escrever um formatador de JSON em JavaScript é chamar `JSON.parse` e depois `JSON.stringify` com uma identação, e essa dupla não preserva a ordem de chaves que parecem inteiros:

```
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))
// ['2', '10', 'x']
```

Não é bug no código de ninguém. Objetos de JavaScript são especificados para pôr as chaves parecidas com inteiro primeiro, em ordem numérica crescente, e todo valor que passa pelo `JSON.parse` vira um objeto de JavaScript. Um formatador feito assim vai remexer um arquivo indexado por id, por número de porta, por ano ou por código de status HTTP, e vai fazer isso sem dizer nada.

Se isso importa depende do arquivo. Objetos JSON não têm ordem em princípio, então tecnicamente nada quebrou — mas o diff contra a versão do seu repositório vai ficar enorme, a revisão vai ficar ilegível, e se alguma coisa lá na frente lê o arquivo em ordem, o comportamento muda.

### Os dígitos dos seus números

JSON não diz o tamanho que um número pode ter, e JavaScript diz: todo número é um double. Então um formatador que lê para um double e imprime de volta perde tudo o que um double não segura.

```
JSON.stringify(JSON.parse('{"id":123456789012345678901}'))
// {"id":123456789012345680000}

JSON.stringify(JSON.parse('{"size":1e999}'))
// {"size":null}
```

Um id de vinte e um dígitos — um id do Twitter, um id Snowflake, uma referência bancária — volta como outro número, e um valor grande demais para um double volta como `null`. Os dois arquivos continuam sendo lidos, e nenhum dos dois é o arquivo com que você começou.

A saída é não ler os números de jeito nenhum. Um formatador só precisa saber onde um número começa e acaba para diagramar o documento; ele nunca precisa do valor, então o seguro é copiar os dígitos exatamente como estavam escritos. É o que a ferramenta daqui faz.

### As suas chaves repetidas

`{"a": 1, "a": 2}` é JSON válido, e o padrão se recusa a dizer qual das duas ganha. Na prática os leitores discordam: a maioria fica com a última, alguns com a primeira, uns poucos recusam o documento. Um formatador que escreve uma delas em silêncio tomou essa decisão por você, e escondeu o fato bem mais útil de que havia duas — o que quase sempre é um erro no arquivo, e um que você ia querer ver.

## Quando o arquivo não passa

Quase todo JSON que falha não tem nada de exótico. É uma de umas seis coisas, e o erro diz qual, se disser onde está em termos que você consiga achar. Um deslocamento tipo `posição 4193` não diz; uma linha e uma coluna dizem.

- **Uma vírgula sobrando no fim.** `{"a": 1,}` é legal em JavaScript e não em JSON. A causa isolada mais comum, geralmente deixada por apagar o último item de uma lista.
- **Aspas simples.** `{'a': 1}` é um literal de objeto de JavaScript, não JSON. Strings e chaves vão as duas entre aspas duplas, e chaves vão sempre entre aspas.
- **Uma chave sem aspas.** `{a: 1}`, o mesmo erro do outro lado — normalmente por colar algo tirado de código em vez de tirado de um arquivo.
- **Comentários.** `// assim` também não é JSON. É JSONC, que as configurações do VS Code e o `tsconfig.json` usam, e não é lido em nenhum outro lugar. Se um comentário precisa sobreviver, a convenção é uma chave: `"_comment": "..."`.
- **Uma quebra de linha ou tabulação de verdade dentro de uma string.** Elas têm que ser escritas como `\n` e `\t`. É o que costuma dar errado quando um comando de terminal ou um certificado foi colado na mão dentro de um valor.
- **Um número que o JSON não permite.** Zeros à esquerda (`01`), um ponto decimal solto (`.5`), `NaN`, `Infinity` e `+1` são todos coisas que as pessoas escrevem e nenhum deles é JSON.

Um que não é erro e parece: um arquivo que começa com uma marca de ordem de bytes. Ela é invisível na maioria dos editores, não é espaço em branco, e faz com que o primeiríssimo caractere do documento seja inesperado. Se o erro está na linha 1, coluna 1 de um arquivo que parece perfeito, é isso.

![A mesma ferramenta com um documento quebrado: um erro que aponta a linha e a coluna de uma vírgula sobrando, e o painel de entrada mostrando a linha culpada.](https://abox.tools/screens/format-json-without-uploading-it/error.webp)

Quando não dá para ler, a mensagem diz onde. Uma vírgula sobrando é a causa mais comum e a mais difícil de ver a olho nu.

## Minificar, e o pouco que costuma render

Espremer os espaços é a mesma operação ao contrário, e vale ser realista sobre o que ela compra. Espaço em branco é altamente repetitivo, e todo servidor e todo navegador entre você e quem lê já comprime a resposta com gzip ou Brotli, que são muito bons exatamente nesse tipo de repetição.

Então JSON minificado costuma ser trinta por cento menor como arquivo e só uns poucos por cento menor no fio. Onde ele realmente ganha o salário é nos lugares sem compressão na frente: um valor numa coluna de banco, um campo numa linha de log, uma carga dentro de um QR code, ou um documento que você vai pôr em Base64 dentro de um cabeçalho.

O que custa é legibilidade, e se o arquivo está versionado custa também os diffs — um arquivo de uma linha muda inteiro sempre que qualquer coisa nele muda. Minifique na saída do seu editor, não na entrada.

## Ordenar as chaves, e quando não

Ordenar as chaves de cada objeto aqui é oferecido como opção em vez de aplicado por padrão, porque é uma mudança de verdade no arquivo e o valor disso depende inteiramente do que você vai fazer em seguida.

Ajuda quando você está comparando dois documentos que deveriam dizer a mesma coisa — a configuração de dois ambientes, uma resposta de API antes e depois de uma mudança — e um deles lista as chaves em outra ordem. Ordenar os dois antes transforma um diff de tudo num diff das duas linhas que de fato diferem.

Atrapalha quando a ordem estava fazendo alguma coisa. Um `package.json` tem convenções sobre o que vem primeiro; uma configuração escrita à mão costuma agrupar ajustes parentes; e um arquivo cujas chaves uma ferramenta ordenou e que depois foi comitado produz um único commit enorme e sem sentido. Ordene uma cópia, não o original.

Um detalhe que vale saber: aqui a ordenação é por como as chaves se leem e não pelos pontos de código delas, então `item2` vem antes de `item10` em vez de depois. Ordenar por ponto de código é o que põe `item10` no meio dos que começam com um, o que é tecnicamente correto e inútil para quem lê.

## Comparar dois arquivos JSON

O jeito confiável é formatar os dois igual primeiro. Dois documentos que dizem a mesma coisa podem diferir em todas as linhas se um estava minificado e o outro não, e não há diff que enxergue além disso.

Então: formate o primeiro, formate o segundo, e compare os dois resultados. Os três passos estão aqui na mesma página — a aba *Comparar* divide a caixa com *Formatar* exatamente por isso. Se os dois ainda listarem as chaves em ordens diferentes, ordene as duas enquanto formata e a comparação encolhe até a diferença que você procurava.

## A parte que ninguém põe na página

Procure um formatador de JSON e você vai achar dezenas de sites com uma caixa. Colar naquela caixa é um envio. O que quer que estivesse na sua área de transferência — uma resposta de API com o endereço de um cliente dentro, um arquivo de configuração com uma string de conexão, um token que você estava depurando — foi mandado para uma máquina que você não controla, e agora é o arquivo de log deles, o relatório de erro deles e o backup deles.

Isso não é uma hipótese sobre má-fé. Um site perfeitamente bem-intencionado ainda guarda logs de acesso, ainda roda analytics, e ainda tem uma hospedagem. O dado mais seguro é o dado que nunca saiu, e para um trabalho que é inteiramente manipulação de texto não existe razão nenhuma para ele sair.

Duas checagens, e elas funcionam em qualquer site que faça essa promessa, não só neste:

1. **Abra o DevTools, olhe a aba de rede, e formate alguma coisa.** Se o seu texto está sendo enviado, existe uma requisição carregando ele. Nenhuma outra coisa pode ser verdade ao mesmo tempo.
2. **Desconecte da internet e tente de novo.** Uma ferramenta que faz o trabalho no seu navegador nem percebe. Uma ferramenta que manda o seu texto para algum lugar para de funcionar, na hora e por completo.

Existe uma versão mais longa das duas, com outras duas checagens, em [é seguro enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/).

## E o YAML, o XML e o resto?

A mesma página lê XML, HTML, CSS e YAML, e converte entre JSON e o primeiro e o último deles. Duas coisas valem ser trazidas de cima, porque são o mesmo argumento em outra roupa:

- **Converter YAML para JSON perde os comentários**, porque JSON não tem onde botar um. Âncoras e apelidos — o jeito do YAML de dizer “o mesmo nó duas vezes” — também não têm como ser expressos, e aqui são recusados em vez de chutados.
- **`no` é uma string.** No YAML 1.1, `yes`, `no`, `on` e `off` eram booleanos, e é por isso que uma lista de códigos de país contendo a Noruega voltava com um `false` dentro. O YAML 1.2 largou isso e aqui também — mas essas palavras continuam sendo escritas de volta entre aspas, porque o que abrir o arquivo depois pode ser um leitor 1.1.
