# Como formatar e conferir XML

Reindente XML sem upload, encontre a origem de um erro e entenda o que muda ao converter o documento para JSON.

[Abrir Formatador de XML](https://abox.tools/pt/formatar-xml/): XML organizado para ler ou espremido para publicar, e convertido em JSON nos dois sentidos. Nada disso é colado no servidor de outra pessoa.

Última atualização 12 de outubro de 2026

## Cole ou importe o XML

Abra o formatador e cole XML ou escolha um arquivo de texto. Use dois espaços, quatro ou uma tabulação para indentar, ou a saída minificada. Copie ou baixe o resultado válido. Digitar invalida a saída anterior enquanto a nova entrada é conferida.

O parser roda localmente. Confere a sintaxe, mas não valida XSD ou DTD, não prova que a configuração serve à sua aplicação nem acessa URLs citadas no texto.

![Entrada XML e conversão JSON com atributo, string e elementos repetidos.](https://abox.tools/screens/format-and-check-xml/mapping.webp)

O atributo vira @region, a porta continua string e elementos feature repetidos viram um array.

## Siga um erro de análise

Uma tag não fechada, fechamento incorreto ou referência de caractere inválida interrompem formatação e conversão. Ir ao erro move o cursor à posição indicada. O documento exige um elemento externo: duas raízes ou texto fora da raiz são recusados.

```
<settings>
  <port>8080</port>
</settings>
```

O texto DOCTYPE é preservado literalmente. Entidades externas não são resolvidas; citar arquivo ou site numa declaração não o carrega.

## Entenda os espaços antes de indentar

Valores de texto, CDATA e elementos de conteúdo misto mantêm seu texto. Espaços só entre elementos filhos são tratados como layout, salvo com `xml:space="preserve"`. Isso facilita ler configurações, mas se a aplicação usa esses espaços como dados, confira antes de reutilizar.

## O que XML para JSON muda

Escolha a direção antes de ler o resultado. Atributos viram chaves com `@`, elementos repetidos viram arrays e texto junto a outros conteúdos usa `#text`. Valores XML continuam strings: `<port>8080</port>` não vira um número inferido.

A conversão JSON perde comentários e a ordem intercalada de texto misto e elementos filhos. Voltar não promete o documento original. Guarde uma cópia e compare os campos usados pela aplicação.

Para formatar JSON sem essa conversão, use o [formatador JSON](https://abox.tools/pt/formatar-json/).
