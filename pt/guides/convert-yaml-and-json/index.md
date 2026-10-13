# Como converter entre YAML e JSON

Converta um documento localmente e confira os valores antes de usar. JSON perde comentários YAML e este leitor recusa deliberadamente construções não aceitas.

[Abrir Conversor de YAML para JSON](https://abox.tools/pt/converter-yaml-para-json/): Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.

Última atualização 12 de outubro de 2026

## Escolha a direção e adicione o texto

Cole um documento ou escolha um arquivo. O menu seleciona YAML para JSON ou JSON para YAML; importar um arquivo `.json`, `.yaml` ou `.yml` escolhe a direção correspondente. Revise antes de Copiar ou Baixar.

A conversão roda no navegador sem enviar a configuração. Guarde o original: mudanças de formato e comentários podem importar para quem mantém o arquivo, mesmo sem mudar os dados.

![Entrada YAML e saída JSON com a contagem de comentários descartados.](https://abox.tools/screens/convert-yaml-and-json/values.webp)

O comentário desaparece; no continua string e o inteiro grande mantém seus dígitos.

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
