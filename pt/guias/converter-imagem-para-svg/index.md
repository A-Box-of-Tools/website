# Como vetorizar uma imagem em SVG

Um PNG ampliado é uma escada. Um SVG é uma instrução de desenho, então é nítido em qualquer tamanho — e transformar um no outro se chama vetorizar. Funciona lindamente em formas e mal em fotos, e vale entender a diferença antes de começar.

[Abrir Imagem para SVG](https://abox.tools/pt/imagem-para-svg/): Uma forma, um contorno. Aponte para o que não deveria estar ali.

Última atualização 31 de agosto de 2026

## A resposta curta

Abra o [Imagem para SVG](https://abox.tools/pt/imagem-para-svg/), solte a imagem nele e olhe a linha vermelha. Essa linha é o contorno como está agora, desenhado por cima dos pixels de onde ele veio. Se ela está seguindo a forma, pegue o arquivo. Se há algo nela que não deveria estar — um cisco, um grampo, uma legenda, uma sombra —, clique naquilo e ele some.

Tudo abaixo são as duas perguntas que decidem se isso funciona de verdade: **sua imagem é uma forma ou uma foto**, e **qual dos dois jeitos de achar a forma ela quer**.

![Os dois painéis: à esquerda a imagem com o contorno vermelho vetorizado por cima, e à direita o SVG pronto.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

O contorno é desenhado por cima da imagem, e não só ao lado dela. Esse é o único lugar em que a questão pode ser resolvida — um contorno está certo ou errado em relação a esses pixels e a mais nada.

## Vetorizar não é converter, e fotos não vetorizam

Converter um JPEG em PNG é uma conversão: a mesma imagem, descrita de outro jeito, e nada é decidido no caminho. Vetorizar não é isso. Joga fora quase tudo e guarda uma coisa só — a fronteira de uma forma — e depois descreve essa fronteira como curvas. Se a sua imagem tem uma forma clara, é exatamente o que você queria. Se é a foto de um cômodo, não há forma nenhuma para guardar, e o que volta é cada mancha de cor parecida virada num borrão próprio.

Isso não é uma limitação esperando a engenharia resolver, então vale dizer claramente como são os números. Uma página A4 de desenho a traço vetoriza em três formas e seis kilobytes. Uma página de texto à mão, em cinquenta formas e cento e cinquenta. Um único megapixel de foto vetoriza em **quatro mil formas e um megabyte e meio** — maior que o JPEG, mais lento para abrir, e não parece a foto. A ferramenta para de desenhar nesse ponto e avisa, em vez de deixar você descobrir depois de baixar.

![O aviso mostrado quando uma foto é vetorizada: milhares de formas separadas e um arquivo enorme.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

No que dá uma foto vetorizada como desenho a traço. O arquivo continua sendo seu para baixar; a página só se recusa a fingir que é um desenho.

O que vetoriza bem:

- logotipos, marcas e monogramas;
- estênceis, carimbos e arquivos de corte;
- assinaturas e lettering à mão;
- desenho a traço, hachuras e arte-final de quadrinhos;
- silhuetas, e qualquer coisa que já seja preto no branco.

Há um trabalho fotográfico que funciona, sim, e é um trabalho diferente: recortar um objeto do fundo como uma silhueta sólida. É para isso que serve a segunda configuração.

## Os dois jeitos de achar a forma

Vetorizar precisa de um bit por pixel — dentro, ou fora — e há dois jeitos de decidir isso.

**Claro e escuro** pergunta se cada pixel é mais escuro que um nível, e o nível é calculado para você. É exatamente certo para tinta no papel, e é o que você quer para todo logotipo, escaneamento e estêncil. Quando erra, costuma errar de um jeito que dá para ver: mova o limiar até os traços finos sobreviverem sem que o papel fique cinza junto.

**O assunto** faz outra pergunta, porque numa foto a primeira não tem resposta. Uma figura vermelho-escura em pé sobre pedra cinza-escura é escuro sobre escuro: não há brilho que separe os dois, então nenhum limiar consegue. Em vez disso, este aprende o que é o *fundo* numa faixa em volta da borda da imagem, mede cada pixel em relação a ele e guarda a maior coisa que não for ele. Uma legenda no canto não é a maior coisa, então é descartada em vez de vetorizada.

Ele tem uma falha que vale conhecer de antemão: uma foto cortada tão rente que o assunto sai por dois ou três lados. A borda então é quase toda assunto, o modelo aprende as cores do próprio assunto, e a resposta sai do avesso. Nada disso se conserta cutucando um controle — a suposição estava errada, não a aritmética. Desligue *aprender o fundo pelas bordas*, marque *clicar para dizer “isto é fundo”* e clique no fundo duas ou três vezes.

## Consertar o que ele errou, apontando

Um limiar é um número só para a imagem inteira, e sempre está errado em algum lugar: uma sombra vira tinta, um grampo sobrevive, o meio de um O se fecha. Cada um desses é um erro local com uma solução local óbvia, e a solução não é mais um controle — é apontar para a coisa.

Clique em qualquer coisa que não deveria estar no desenho e ela some; clique de novo e ela volta. Um clique pega **a mancha inteira daquela cor**, então um clique tira um cisco inteiro ou um carimbo inteiro, e não um pixel. Clicar num pedaço de fundo cercado o preenche, e é assim que um buraco que não deveria ser buraco se fecha. A linha embaixo das imagens diz qual dos dois é e de que tamanho antes de você clicar, então um clique que levaria a maior parte da imagem nunca é surpresa.

As correções ficam guardadas separadas do limiar, então mover o controle depois não as joga fora, e inverter a imagem as inverte junto — um cisco que você apagou continua apagado em vez de reaparecer como um furo no fundo.

## Os dois números da suavização, e quando mexer neles

**Detalhe** é quanto a linha pode se afastar dos pixels ao ser simplificada. Abaixo de mais ou menos um, não faz nada — um degrau da escada fica um pixel inteiro fora da linha a que pertence, então uma tolerância menor guarda cada degrau e não sobra nada para simplificar. Acima de mais ou menos dois, começa a comer curvas de verdade. É calculado por forma a menos que você diga o contrário, porque um número só não consegue servir ao mesmo tempo a uma figura inteira e à haste de dois pixels de uma letra.

**Nitidez dos cantos** é quanto o contorno precisa virar para que essa curva fique como canto em vez de ser arredondada. É só metade da decisão — um vértice também fica como canto se estiver longe o bastante dos vizinhos, o que pega sozinho todo canto óbvio —, então esse número só decide as curvas suaves. Abaixo de uns vinte graus tudo vira canto e um círculo volta como polígono.

A maioria das imagens não precisa mexer em nenhum dos dois. Vale conhecê-los pelos dois casos em que precisa: um escaneamento de texto muito pequeno, que quer mais detalhe, e uma forma que você vai cortar numa máquina, que normalmente quer menos.

## O que você recebe, e o que fazer com ele

Um arquivo com um único `<path>` dentro. Os contornos giram num sentido e os buracos dentro deles no outro, e é isso que deixa uma forma com quarenta buracos ser um único elemento sem regra de preenchimento para definir — então o Illustrator, o Inkscape, o Figma, um navegador e a maioria dos softwares de corte leem todos do mesmo jeito.

![O último passo: quantas formas e pontos o desenho tem, seu tamanho e o botão de download.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

A contagem merece uma olhada antes de baixar. Um desenho tem dezenas ou centenas de pontos; milhares quer dizer que a imagem era uma foto.

O caminho contrário — um SVG que você já tem, e um PNG de que precisa — é [outro trabalho, com guia próprio](https://abox.tools/pt/guias/converter-svg-para-png/). Nada na vetorização é reversível: o SVG que sai daqui é um desenho novo da forma, não a imagem de que ele foi feito.
