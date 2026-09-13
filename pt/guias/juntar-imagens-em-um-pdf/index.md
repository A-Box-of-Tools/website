# Como juntar imagens em um único PDF

Alguém pediu “um PDF só” e você tem onze fotografias de papel. Isto cobre as escolhas que de fato mudam o resultado, ou seja, tamanho de página, ordem, qualidade e o que o documento conta sobre você, e também quais delas dá para ignorar.

[Abrir Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/): Coloque suas imagens num documento só.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/), jogue as imagens dentro, arraste os quadradinhos até a ordem ficar certa e crie o documento. Os padrões, que são páginas A4, uma margem pequena e fotografias copiadas sem recodificação, são o que a maioria das pessoas quer.

As quatro coisas que merecem uma segunda olhada são a ordem, o tamanho da página, o ajuste de qualidade e o que o documento pronto conta sobre você. Nessa ordem de frequência com que dão errado.

![Uma prévia da primeira página do PDF, com um resumo ao lado: quatro páginas, tamanho de página igual ao de cada imagem e quatro de quatro imagens copiadas sem alteração.](https://abox.tools/screens/combine-images-into-a-pdf/preview.webp)

A prévia é a conferência que vale a pena: é a página pronta, no formato que a página pronta vai ter.

## Acerte a ordem antes de qualquer outra coisa

A ordem das páginas é de longe o que mais sai errado, porque nomes de arquivo se ordenam de um jeito que ninguém espera. `IMG_2.jpg` vem depois de `IMG_10.jpg` numa ordenação alfabética, já que a comparação é caractere por caractere e `1` vem antes de `2`. Uma pasta de digitalizações chamadas `page1` a `page12` vai chegar na ordem errada em quase qualquer ferramenta.

Ordenar pela data em que a foto foi tirada costuma ser mais confiável para fotografias, porque você fotografou as páginas na ordem em que elas estavam. De todo jeito, confira os quadradinhos antes de clicar no botão, em vez de conferir o PDF depois.

## Qualidade: a parte que a maioria das ferramentas erra em silêncio

Um PDF consegue carregar dados JPEG diretamente. Isso é uma propriedade do formato: os bytes comprimidos de um JPEG podem ser jogados dentro do documento como estão, e o leitor os decodifica do mesmo jeito que um navegador faria.

Isso importa porque significa que uma fotografia não precisa perder nada no caminho para dentro de um PDF. Ela nunca é decodificada e nunca é comprimida de novo, e a imagem no documento é bit a bit a imagem do seu arquivo. Muitas ferramentas recodificam mesmo assim, porque é mais simples desenhar tudo num canvas e codificar de forma uniforme, e o resultado é uma geração de qualidade perdida sem motivo.

Outros formatos não conseguem pegar essa carona. PNG, WebP, HEIC e os demais não têm filtro correspondente no PDF, então precisam ser convertidos. Você escolhe como:

- **Recodificar como JPEG** (o padrão). Arquivo menor, um pequeno custo de qualidade, e a resposta certa para fotografias.
- **Sem perdas.** Guarda os pixels exatos ao custo de um documento bem maior. É a resposta certa para capturas de tela, diagramas e qualquer coisa com texto ou bordas nítidas, onde os artefatos de JPEG são evidentes.

## Tamanho da página, e quando “caber na imagem” é melhor

Um tamanho de página padrão, seja A4, Carta, Ofício, A3, A5 ou Tabloide, coloca cada imagem numa página daquele tamanho, escalada para caber dentro da sua margem. Use um deles quando o documento for impresso, ou quando alguém oficial for arquivá-lo.

“Exatamente do tamanho de cada imagem” faz cada página bater com a imagem dela, então não sobra espaço branco e não há escala nenhuma. Use quando o PDF for um contêiner de imagens em vez de um documento: um portfólio, um conjunto de capturas de tela, uma história em quadrinhos. Fica errado impresso, porque cada página tem um tamanho.

Vale ter margem em qualquer coisa que vá ser impressa. Impressoras domésticas não conseguem imprimir até a borda do papel, e uma fotografia colocada de ponta a ponta sai cortada.

### Páginas em pé a partir de fotos deitadas

Se você fotografou folhas de papel com o celular deitado, toda imagem vai estar deitada e vai ficar pequenininha no meio de uma página em pé. Girar cada uma um quarto de volta antes de montar o documento é o que conserta, e é uma escolha por imagem, e não geral, porque em geral algumas delas entraram no sentido certo.

![Os ajustes de página: tamanho, orientação, como a imagem encontra a página, a margem e a cor de fundo.](https://abox.tools/screens/combine-images-into-a-pdf/layout.webp)

Tamanho de página e encaixe decidem juntos se a foto aparece inteira ou cortada no papel. A opção que segue cada imagem evita a pergunta por completo.

## O que o PDF pronto conta sobre você

Um PDF carrega um bloco de informações do documento: autor, produtor, data de criação, às vezes o título. Dependendo do que o escreveu, isso pode incluir o nome da sua conta, o nome do seu computador e a hora exata em que você o fez.

Vale pensar nisso, porque um PDF é uma coisa que as pessoas mandam para outras pessoas: uma candidatura a vaga, um pedido de indenização, um documento para o dono do imóvel. Os metadados viajam junto e qualquer leitor consegue exibi-los.

A ferramenta daqui deixa esse bloco vazio, tirando o próprio nome dela: nenhum nome de arquivo, nenhum nome de máquina, nenhum nome de usuário e nenhuma data de criação, a não ser que você marque a caixa pedindo uma. Se você usa outra ferramenta, vale abrir as propriedades do resultado uma vez para ver o que ela escreveu.

À parte disso: as imagens em si. Se as suas fotografias carregam etiquetas EXIF e de GPS, o que acontece com elas depende do caminho. Um JPEG copiado sem recodificação mantém o que tinha dentro, e uma imagem que é recodificada perde as etiquetas como efeito colateral. Se isso importa, limpe as fotos antes com o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/), e [o guia dele](https://abox.tools/pt/guias/remover-dados-exif-e-gps/) explica o que tem lá dentro.

## Se o PDF sair grande demais

Fotos de celular são grandes, e vinte delas fazem um documento que o e-mail vai recusar. Três coisas para tentar, nesta ordem:

**Diminua o lado maior.** Uma fotografia de 4000 pixels de uma folha de papel carrega muito mais detalhe do que qualquer leitor ou impressora vai usar. Baixar o lado maior para algo como 2000 pixels normalmente reduz o arquivo a um quarto e não muda nada que alguém consiga ver numa página.

**Use JPEG em vez de sem perdas** para qualquer coisa fotográfica. Sem perdas é a resposta certa para diagramas e a errada para a foto de uma página.

**Comprima o documento pronto.** O [Compressor de PDF](https://abox.tools/pt/comprimir-pdf/) trabalha em cima do tamanho em que cada imagem é desenhada na página, e não da contagem de pixels dela, que é a medida que importa, e [o guia dele](https://abox.tools/pt/guias/deixar-um-pdf-menor/) trata do que isso custa.

A ferramenta não tem limite embutido para quantas imagens você pode usar. O teto prático é a memória do seu próprio computador, porque o documento pronto é montado ali antes de você baixar. Algumas centenas de fotos de celular em resolução cheia são a primeira coisa a sentir isso, e diminuir o lado maior empurra esse teto para bem longe.

## O que isto não vai entregar a você

Um PDF feito de fotografias é um PDF cheio de imagens. As palavras dentro dele não são texto: você não consegue pesquisar, copiar nem fazer um leitor de tela ler. Isso é uma propriedade daquilo de onde você partiu, e não da conversão.

Se você precisa de texto pesquisável, precisa de OCR, que é outro trabalho. E se o documento original ainda existe como documento em algum lugar, exportar aquilo direto para PDF sempre vai ganhar de fotografá-lo: menor, mais nítido, pesquisável.

## Por que isso não precisa de envio

Escrever um PDF é escrever um arquivo estruturado: um cabeçalho, um conjunto de objetos, uma tabela de referências cruzadas. Não há nada nisso que um navegador não consiga fazer, e nada no trabalho que exija que as imagens viajem para lugar nenhum.

Aqui isso importa por causa do que as pessoas colocam nesses documentos. Documentos de identidade, extratos bancários, laudos médicos, contratos assinados: o motivo inteiro de alguém estar fazendo um PDF costuma ser que vai mandá-lo a uma instituição. A ferramenta daqui não tem função de rede de espécie alguma, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) mostra como conferir isso você mesmo, aqui ou em qualquer outro lugar.
