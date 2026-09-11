# Como tarjar um PDF para que o texto suma de verdade

Um retângulo preto sobre um nome e um nome que foi apagado são idênticos na tela. Um dos dois sobrevive a ser selecionado e copiado. Esta é a diferença, os lugares em que uma palavra se esconde e que não estão na página, e a conferência de trinta segundos que lhe diz qual dos dois você tem.

[Abrir Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/): As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/), solte o documento dentro, digite as palavras que precisam sair, marque as que você quer, e aperte “Retirar”. As letras são apagadas das próprias instruções de desenho da página, as mesmas palavras são tiradas dos marcadores, dos comentários, dos campos de formulário e das propriedades do documento, e o arquivo pronto é reaberto e pesquisado na sua frente antes de ser oferecido a você.

Tudo o que vem abaixo é o motivo pelo qual essa última frase é a importante, e como saber se a ferramenta que você já usa consegue dizer o mesmo.

## A falha de que se trata

Desenhe um retângulo preto sobre um nome num leitor de PDF. O que você vê é um nome com um retângulo preto por cima. O que a maioria dos leitores *salva* é um documento contendo o nome e, separadamente, um retângulo com uma posição, um tamanho e uma cor.

Um retângulo desenhado assim é uma **anotação**: um objeto que fica ao lado da página em vez de dentro dela. O texto embaixo está exatamente como estava. Selecione a área e aperte copiar, ou passe no arquivo qualquer extrator de texto, ou abra-o num programa que desenhe anotações de outro jeito, e o nome volta. Nada na tela distingue isso de uma tarjagem de verdade, que é precisamente por que isso continua acontecendo com organizações que empregam advogados.

Isso já publicou peças judiciais, avaliações de inteligência, contratos e — em dezembro de 2025 — nomes enegrecidos numa divulgação em massa de documentos do Departamento de Justiça dos Estados Unidos, que estavam legíveis poucas horas depois da publicação. O padrão é sempre o mesmo. O retângulo era a anotação, e a anotação nunca foi o texto.

## O que uma tarjagem de verdade faz no lugar

Uma página num PDF é uma lista de instruções: use esta fonte, mova a caneta para cá, desenhe estes glifos. As palavras na página existem em exatamente um lugar, como os operandos dessas instruções de desenho:

```
BT /F1 12 Tf 72 700 Td (Prezado senhor Silva) Tj ET
```

Tarjar o nome significa **apagar aquelas letras daquela instrução** e reescrever a página. Depois disso não há o que recuperar, não porque o arquivo esconde bem, mas porque as letras não estão no arquivo. Não há um retângulo com algo embaixo, porque embaixo não há nada.

Uma coisa precisa ser reposta, ou o resultado fica visivelmente errado. O texto é desenhado avançando uma caneta pela página, então apagar cinco letras puxa o resto da linha cinco letras para a esquerda: as colunas param de alinhar e os totais escorregam para baixo dos títulos errados. Uma ferramenta que faz isso direito mede quanto as letras retiradas teriam avançado e repõe essa distância como uma instrução de espaçamento, que move a caneta sem desenhar nada.

A tarja preta, se houver uma, é desenhada *depois*, sobre uma lacuna que já está vazia. É uma gentileza com quem ler o documento — um sinal de que algo foi retirado — e não é a tarjagem. É toda a distinção numa frase: numa tarjagem de verdade, a tarja é enfeite; numa falsa, a tarja *é* a tarjagem.

![O cartão de busca: dois termos digitados, com a contagem de ocorrências e uma lista de cada lugar em que aparecem no documento.](https://abox.tools/screens/redact-a-pdf/find.webp)

Você diz o que tem que sumir e a ferramenta acha todas as ocorrências, inclusive as da página três de que ninguém lembrava.

## Os quatro lugares em que uma palavra se esconde e que não são a página

Esta é a parte que pega quem fez a primeira parte direito. Um PDF carrega texto em vários lugares ao mesmo tempo, e um leitor mostra, pesquisa ou copia todos eles. Retirar um nome da página e deixá-lo em qualquer um destes não é tê-lo retirado.

- **As propriedades do documento.** Título, autor e o nome do arquivo de que este foi exportado. Um documento cujas páginas tiveram um nome retirado e cujas propriedades ainda dizem `acordo Silva versao 3.docx` não foi tarjado. Costuma haver uma segunda cópia da mesma informação num pacote XMP, que também precisa sair.
- **Os marcadores.** O sumário na lateral de um leitor é uma lista de títulos com números de página anexados — e um título é uma linha de texto sobre a qual nada na página manda.
- **Campos de formulário e comentários.** O que alguém digitou num formulário é guardado duas vezes: uma como o valor do campo e outra como a aparência que o leitor desenha. As duas precisam sair. Uma nota adesiva carrega o seu texto e o nome de quem a escreveu.
- **O texto de substituição.** Um PDF pode declarar que uma sequência de glifos “soletra” outra coisa, para que uma ligadura ou uma linha partida por hífen seja copiada como a palavra que representa. Isso significa que um documento pode mostrar uma coisa e entregar outra a quem aperta Ctrl+C, e uma tarjagem que retirasse só o que foi desenhado deixaria a frase intacta para quem selecionasse o parágrafo.

Os anexos são o quinto. Um PDF pode carregar outros arquivos inteiros dentro de si, e nada do que você faça com as páginas os toca.

![O cartão da página: o texto de uma página, extraído e selecionável, com os termos encontrados destacados.](https://abox.tools/screens/redact-a-pdf/page.webp)

Essa é a parte que surpreende. Um PDF não é uma imagem: as palavras dele podem ser selecionadas, buscadas e copiadas por qualquer um que o receba.

## Como conferir um arquivo, em trinta segundos

Faça isto com qualquer coisa que você esteja prestes a mandar, seja qual for a ferramenta que a produziu. É a conferência que teria pegado cada uma das falhas publicadas.

1. **Abra o arquivo pronto e aperte Ctrl+F** (Cmd+F num Mac). Pesquise a palavra que você retirou. Uma tarjagem de verdade não devolve nada. Se o leitor saltar para um retângulo preto, a palavra continua ali dentro e o retângulo está apenas por cima dela.
2. **Selecione a área enegrecida e copie.** Arraste sobre o retângulo, aperte Ctrl+C, e cole numa caixa de texto. Se chegar alguma coisa, você encontrou a mesma falha pelo outro lado.
3. **Selecione o documento inteiro e copie também.** Ctrl+A e depois Ctrl+C, cole em qualquer editor de texto, e leia o que sai. Esta é de longe a mais útil das três, porque lhe mostra o documento como um extrator de texto o vê — incluindo texto que você não sabia que estava lá, o que numa página digitalizada é comum.
4. **Olhe as propriedades** — Arquivo → Propriedades na maioria dos leitores — e o painel de marcadores. Os dois são lugares onde um nome sobrevive a uma tarjagem perfeita na página.

O [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/) faz a primeira e a terceira delas por você e mostra a contagem, porque uma ferramenta afirmando que retirou algo não é prova, e uma pesquisa no arquivo pronto é.

## Documentos digitalizados são outro problema

Uma digitalização é a fotografia de uma página. As palavras nela são pixels, não texto, e nenhuma edição da camada de texto as toca — porque não há camada de texto, ou porque a que há descreve a imagem em vez de ser a imagem.

A maioria dos digitalizadores e das ferramentas de PDF modernas acrescenta uma camada de texto invisível sobre a imagem, escrita por reconhecimento óptico de caracteres, para que a página possa ser pesquisada. Essa camada é texto de verdade e pode ser retirada. Vale a pena retirá-la: é o que uma pesquisa, uma cópia e todo sistema automático que lê documentos teriam encontrado. Não muda nada na imagem, na qual as palavras continuam perfeitamente legíveis para quem olhar a página.

Então para uma digitalização a sequência honesta é: tire as palavras da camada de texto e depois cuide da imagem à parte — o que significa sobrescrever pixels. É isso que o [tarjador de imagens](https://abox.tools/pt/guias/tarjar-uma-imagem/) faz, e o guia ao lado dele explica por que um desfoque ou um mosaico não bastam para texto.

## Por que não simplesmente imprimir e digitalizar de novo

Porque funciona, e lhe custa todo o resto. Imprimir uma página tarjada e digitalizá-la de volta produz mesmo um documento sem camada de texto para vazar — e um documento que ninguém consegue pesquisar, que nenhum leitor de tela consegue ler, que é de cinco a cinquenta vezes maior, e cuja qualidade é a que o digitalizador do escritório resolveu dar. Também depende de a página ter sido impressa como se via: uma anotação pode ser marcada como visível na tela e não no papel, e quando era isso que a sua tarja preta era, a folha que sai da impressora tem o nome nela.

O mesmo argumento vale para “achatar em imagem”, que algumas ferramentas oferecem como tarjagem. Isso converte cada página numa fotografia de si mesma. Se as palavras estavam cobertas em vez de apagadas, a cobertura agora é permanente — mas todo o resto do documento se foi junto, e o arquivo que você manda é um com que ninguém consegue trabalhar.

## Por que este é o trabalho que menos vale a pena enviar

Um serviço de tarjagem precisa receber o arquivo não tarjado. É toda a transação: a versão privada chega primeiro, intacta, e é a versão que fica no disco de outra pessoa. Diga o que disser a política de privacidade, a sequência não é discutível — o documento com que você teve cuidado é aquele que você entregou.

O que as pessoas tarjam torna isso pior do que parece. Depoimentos de testemunhas, cartas médicas, extratos bancários indo para um locador, um contrato com o nome de um cliente indo para outro, uma petição com um endereço residencial. São esses os documentos, e é exatamente por isso que a ferramenta para eles não deveria ter um servidor do outro lado.

Tudo no [tarjador deste site](https://abox.tools/pt/tarjar-pdf/) acontece no seu próprio navegador: o arquivo é lido, editado, escrito e conferido na sua máquina, e as palavras que você pesquisa também nunca saem da aba. Tire o cabo da internet e ele continua funcionando, que é a prova mais simples que existe de que nada está sendo mandado a lugar nenhum. Veja [é seguro enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) para o que um envio de fato envolve.
