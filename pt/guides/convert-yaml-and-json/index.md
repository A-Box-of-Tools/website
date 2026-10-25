# Como converter entre YAML e JSON

Converta um documento localmente e confira os valores antes de usar. JSON perde comentários YAML e este leitor recusa deliberadamente construções não aceitas.

[Abrir Conversor de YAML para JSON](https://abox.tools/pt/converter-yaml-para-json/): Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.

Última atualização 13 de outubro de 2026

## Escolha a direção e adicione o texto

Cole um documento ou escolha um arquivo. O menu seleciona YAML para JSON ou JSON para YAML; importar um arquivo `.json`, `.yaml` ou `.yml` escolhe a direção correspondente. Revise antes de Copiar ou Baixar.

A conversão roda no navegador sem enviar a configuração. Guarde o original: mudanças de formato e comentários podem importar para quem mantém o arquivo, mesmo sem mudar os dados.

![Entrada YAML e saída JSON com a contagem de comentários descartados.](https://abox.tools/screens/convert-yaml-and-json/values.webp)

O comentário desaparece; no continua string e o inteiro grande mantém seus dígitos.

## Passar uma configuração de aplicativo entre formatos

Se um aplicativo espera YAML e outro JSON, comece com uma cópia de um documento de configuração. Escolha a direção e dois espaços; deixe a ordenação desativada se os grupos ajudarem na revisão. Confira se identificadores entre aspas continuam strings, opções continuam booleanos e listas contêm o esperado. Salve com outro nome e use a validação do aplicativo de destino antes de substituir seu arquivo ativo. Converter com sucesso prova que o parser entendeu a sintaxe compatível, não que as configurações sejam válidas para o aplicativo.

Também serve para revisar dois ambientes escritos em formatos diferentes. Converta a cópia YAML para JSON e siga [o fluxo de comparação JSON](https://abox.tools/pt/guias/comparar-dois-arquivos-json/) com ambas as cópias formatadas igualmente. Confira nomes de hosts, limites e opções; preserve o YAML por seus comentários. Converta documentos YAML separados individualmente e use um parser mais completo se a configuração contiver âncoras, aliases ou tags.

## Use o subconjunto YAML aceito

O leitor aceita mapeamentos, sequências e valores escalares comuns com resolução no estilo YAML 1.2. Não implementa todo YAML 1.2. Âncoras, aliases, tags personalizadas e fluxos de vários documentos interrompem a conversão. Se o arquivo precisar deles, use um parser compatível; remover um alias sem manter seu significado muda a configuração.

Um erro oferece Ir ao erro. Corrija a entrada indicada em vez de usar a saída anterior, que fica indisponível ao editar.

## Confira comentários, strings e números

```
enabled: true
country: no
account: 12345678901234567890
```

Aqui `no` continua a string `"no"`, sem virar false como pode ocorrer em YAML 1.1. O conversor mantém o texto numérico sem arredondar essa conta longa via ponto flutuante do JavaScript. A aplicação que lê o resultado pode impor limites numéricos próprios.

JSON não tem comentários: os comentários YAML são descartados e a ferramenta informa os que leu. Um `#` dentro de uma string entre aspas ou escalar de bloco é conteúdo, não comentário.

## Convertendo JSON de volta para YAML

O modelo de dados é mantido, mas o resultado é YAML recém-escrito, não recuperação de comentários ou formato antigos. Palavras ambíguas recebem aspas para leitores YAML 1.1. Confira versão e esquema da aplicação de destino, principalmente em configurações de implantação.

A [especificação YAML](https://yaml.org/spec/1.2.2/) descreve a linguagem completa. Para conferir ou minificar só JSON, use o [formatador JSON](https://abox.tools/pt/formatar-json/).
