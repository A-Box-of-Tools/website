# Como converter um SVG em PNG no tamanho certo

Converter é a metade fácil. A pergunta que decide se o resultado serve para alguma coisa é aquela que ninguém responde para você: quantos pixels? Aqui está de onde vem esse número, e o que um desenho perde no caminho até virar um.

[Abrir SVG para imagem](https://abox.tools/pt/svg-para-png/): Diga o tamanho. Um vetor não tem tamanho próprio a perder.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [SVG para imagem](https://abox.tools/pt/svg-para-png/), jogue o arquivo dentro e diga um tamanho. Se ninguém disse a você que tamanho usar, **1024 pixels no lado maior** é um bom padrão: grande o bastante para quase tudo e pequeno o bastante para mandar por e-mail. Deixe o formato em PNG, deixe o fundo em transparente e leve o arquivo.

Tudo o que vem abaixo é o que fazer quando esse padrão não basta: quando um número foi especificado para você, quando a coisa vai para impressão, ou quando ela volta com cara de errada.

![O cartão de prévia: o desenho renderizado no tamanho pedido, com as medidas em pixels embaixo.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

A ferramenta desenha antes de salvar, e no tamanho em que vai salvar. O que estiver errado na exportação aparece aqui primeiro.

## Por que o tamanho é decisão sua e não do arquivo

Um JPEG é uma grade de pixels medidos, e perguntar de que tamanho ele é tem resposta. Um SVG não é uma imagem, é um conjunto de instruções, do tipo desenhe um círculo aqui, este traçado naquela cor, e instruções não têm tamanho. Um navegador pode executá-las a 16 pixels ou a 4000 e o resultado é igualmente nítido dos dois jeitos, porque ele não está escalando nada. Está desenhando de novo.

É por isso que a conversão não pode escolher um número por você, e por isso que não custa nada a você escolher um grande. Este é o único trabalho de imagem em que “faça maior” é de graça.

A maioria dos arquivos SVG carrega mesmo um atributo `width` e um `height`, e a ferramenta vai mostrar, mas é um padrão, não um limite. Um ícone que diz `width="24"` só está dizendo que quem o desenhou tinha em mente uma barra de ferramentas de 24 pixels.

## De onde o número realmente vem

**Para um site.** Pegue o tamanho que a imagem ocupa na página em pixels de CSS e multiplique pela densidade de pixels das telas com que você se importa. Uma logomarca num espaço de 200 pixels de largura precisa de um arquivo de 400 pixels para um notebook Retina e de 600 para um celular recente. É isso o que `@2x` e `@3x` significam, e é por isso que uma ferramenta que os escreve poupa você de fazer a conta três vezes.

**Para um ícone de aplicativo, uma ficha de loja ou um favicon.** O número é publicado e não há o que descobrir: o que a página da loja disser, exatamente. Para um favicon, não rasterize de jeito nenhum. [Faça um .ico](https://abox.tools/pt/guias/criar-um-favicon/), que guarda vários tamanhos num arquivo só, porque uma aba de navegador, um favorito e um atalho do Windows pedem tamanhos diferentes.

**Para impressão.** Multiplique o tamanho físico em polegadas pela resolução da impressora. Uma logomarca indo para um cartão de visita com cinco centímetros de largura a 300 DPI dá 600 pixels, e a mesma logomarca atravessando uma página A4, com 21 centímetros, dá cerca de 2500. As gráficas pedem 300 DPI por hábito, e para um banner de grande formato visto do outro lado de uma sala 150 dá e sobra.

**Para uma prévia em rede social ou uma imagem OG.** A plataforma nomeia uma caixa, normalmente ⁦1200 × 630⁩ nas prévias de link, e a caixa tem formato diferente da sua logomarca. É para isso que serve o ajuste de “completar com margem”: o desenho centralizado nas proporções dele, com uma cor de fundo preenchendo o resto, em vez de uma logomarca esticada que conta a todo mundo que você não conferiu.

Quando dois desses casos se aplicam, use o maior. Um PNG maior do que precisa é um download um pouco maior, e um pequeno demais não tem conserto depois, pelo motivo da próxima seção.

![O cartão de tamanho: um menu com as formas de dizer o tamanho, em largura, com 1024 digitado e larguras prontas ao lado.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Cinco jeitos de dizer a mesma coisa. Qual é o certo depende de terem te dado um número ou um lugar onde colocar.

## Não dá para voltar

Rasterizar é caminho de mão única. Assim que o desenho vira um PNG ele é pixel como qualquer outra imagem, e ampliá-lo depois obriga a inventar detalhe que nunca foi medido, com o mesmo resultado macio e borrado que se obtém ao ampliar uma fotografia.

Então guarde o SVG. Ele é a cópia mestra, é quase sempre o arquivo menor, e todo tamanho futuro sai dele perfeito. O PNG é uma exportação para um uso específico, e quando você precisar de outro tamanho a jogada certa é exportar de novo, e não redimensionar o que você exportou.

Existe software que afirma converter um PNG de volta em SVG. O que ele faz é traçar: chutar quais curvas poderiam explicar uma grade de pixels. Funciona razoavelmente numa arte chapada de duas cores e produz besteira cara em qualquer outra coisa, e nunca recupera o que o desenho original tinha.

## Três coisas mudam no instante em que vira pixel

Um SVG rasterizado que sai com cara de errado quase sempre sai errado por um destes três motivos, e vale conhecer os três antes de exportar, não depois.

**Texto é desenhado com a fonte que a máquina tiver.** Um SVG que contém texto não contém a fonte: ele nomeia uma e deixa que o renderizador a encontre. Se a fonte não estiver instalada, uma substituta é usada, e a substituta tem outro desenho de letra e outras larguras, então o texto pode reorganizar ou transbordar. Um arquivo que puxa a fonte de um endereço da web se sai ainda pior: um SVG rasterizado por meio de uma `<img>` não tem permissão de buscar coisa alguma, então nada chega.

O conserto é o que todo designer já sabe: **converta o texto em contornos** antes de exportar o SVG (o Illustrator chama de Criar Contornos, o Figma chama de Flatten, o Inkscape chama de Objeto para Caminho). As letras viram geometria, a fonte deixa de importar e a imagem fica igual em qualquer máquina. Faça numa cópia, porque texto contornado deixa de ser editável como texto.

**Fios de cabelo ficam cinza ou somem.** Um traço que dá menos de um pixel no tamanho que você escolheu não pode ser desenhado como linha sólida, então é desenhado tênue. É por isso que uma logomarca delicada rasterizada a 64 pixels fica desbotada enquanto o mesmo arquivo a 512 fica perfeito. Se o tamanho pequeno é a exigência, a resposta é um desenho simplificado com traços mais pesados, e não outro ajuste de exportação, que é o mesmo motivo de um favicon ser um símbolo e não uma logomarca escrita.

**A animação para.** Um SVG animado rasteriza para uma única imagem parada: o que quer que seja o primeiro quadro. Não existe ajuste de exportação que mude isso. Se você precisa do movimento, precisa de um GIF ou de um vídeo, feito de outro jeito.

## Transparência, e qual formato escolher

**PNG**, a menos que você tenha um motivo. É sem perdas, mantém a transparência, e comprime bem cor chapada com bordas duras, que é a maior parte do que um desenho tem. Uma logomarca rasterizada normalmente é um PNG *menor* do que seria um JPEG, além de mais limpo.

**JPEG** não tem transparência nenhuma. Cada pixel transparente tem que virar alguma cor, e se nada escolher uma por você ele vira preto, que é de onde vem aquele resultado de logomarca sobre caixa preta que as pessoas acham que é bug. Ele também é com perdas do jeito que pior aparece exatamente nesse tipo de imagem: um anel de sujeirinha em volta de cada borda dura. Use quando alguma coisa insistir nele.

**WebP** faz tudo o que o PNG faz, num arquivo menor, e é lido por todo navegador atual. O motivo para não usar é o que acontece depois do navegador: software mais antigo, algumas gráficas e um bom número de formulários de envio ainda não abrem um.

Escolher uma cor de fundo com PNG também é uma coisa perfeitamente comum de se querer. Transparência só é útil quando aquilo em que a imagem vai cair é de uma cor que você não consegue prever, e quando você já sabe que é uma página branca, achatar sobre branco evita uma categoria inteira de surpresa.

## Quando a exportação sai em branco ou errada

**Nada além de espaço vazio.** Normalmente um atributo `xmlns` faltando no elemento raiz. Um arquivo sem ele não é SVG do ponto de vista de uma tag de imagem, e é desenhado como nada. Abrir o arquivo num navegador é o teste rápido: se o navegador também não mostrar nada, o problema é o arquivo, e não o conversor.

**O desenho está pequeno, no canto superior esquerdo.** O arquivo tem `width` e `height` mas não tem `viewBox`, então não há sistema de coordenadas a escalar e a arte mantém as unidades originais num canvas maior. Um bom conversor coloca um viewBox por você. Se o seu não colocou, acrescentar `viewBox="0 0 *largura* *altura*"` no elemento raiz à mão resolve, e o arquivo é texto puro, então dá para fazer.

**Falta parte da imagem.** Alguma coisa no arquivo apontava para um endereço em vez de conter a arte: uma fotografia embutida guardada como link, uma folha de estilo, uma fonte. Um rasterizador que se recusa a buscar essas coisas está fazendo o certo, e é a mesma recusa que impede um SVG que você baixou de algum lugar de dar notícia a quem o fez. Reexporte do programa de desenho com as imagens embutidas.

**Ele recusa um tamanho muito grande.** Os navegadores limitam o tamanho de um canvas, e não concordam sobre onde: passando de mais ou menos 16.000 pixels de lado nada volta, e o Safari num iPhone ou iPad desiste bem antes, por volta de ⁦4096 × 4096⁩. Uma ferramenta que avisa está poupando você de um arquivo em branco, porque é isso que um navegador produz quando não dá conta, em vez de uma mensagem de erro.

## Nada disso precisa de envio

Rasterizar um SVG é coisa que todo navegador faz milhares de vezes por dia, com o mesmo maquinário que desenha um ícone numa página web. Não há motivo técnico para a sua arte viajar até um servidor e voltar para sair como PNG, e a ferramenta daqui não manda a arte para lugar nenhum: a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, e nenhum deles é deste site.

Isso importa mais que de costume com SVG, porque um SVG é um documento e não uma imagem. Ele pode conter um script e um endereço remoto, e uma logomarca que uma agência mandou para você é um arquivo que você não escreveu. Desenhado por meio de uma tag de imagem, ele fica no que a especificação chama de *modo estático seguro*: o script não pode rodar e o endereço nunca é acessado. Quem faz isso valer é o navegador, e não o site.

Se você prefere conferir a acreditar, carregue a página, desligue a internet e converta alguma coisa assim mesmo. O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações que você pode fazer em qualquer ferramenta.
