# A mesma imagem, um terço menor e com a transparência intacta

O modo sem perdas do WebP preserva os pixels do PNG e ainda ocupa menos. O modo com perdas pode reduzir uma foto a um décimo do tamanho. A escolha depende do conteúdo da imagem; veja como decidir.

[Abrir PNG para WebP](https://abox.tools/pt/png-para-webp/): A mesma imagem, muitas vezes um terço menor, com as áreas transparentes intactas.

Última atualização 4 de outubro de 2026

AVIF também é aceito se seu navegador conseguir decodificá-lo. A saída continua sendo WebP. Sequências AVIF produzem apenas a primeira imagem decodificada. O canvas do navegador cria uma cópia SDR de 8 bits: a cor ou o HDR podem mudar, os metadados são omitidos e o arquivo pode ficar maior. O original permanece intacto.

## A resposta curta

Abra o [conversor de PNG para WebP](https://abox.tools/pt/png-para-webp/), arraste os arquivos e escolha entre duas opções:

- **Sem perdas** se houver texto, cores chapadas ou bordas nítidas: captura de tela, diagrama, logotipo, gráfico ou outra imagem desenhada, não fotografada. Cada pixel opaco fica exatamente igual e o arquivo diminui.
- **Menor** se for uma foto. A economia é enorme e a diferença visual costuma ser imperceptível.

Nada é enviado em nenhum dos modos. O navegador grava WebP desde 2020, então o codificador já está no computador.

## Por que PNG ocupa tanto espaço

PNG comprime sem perdas: não descarta informação. Ele procura repetições, como sequências de pixels iguais ou linhas parecidas com a anterior, e as descreve de forma compacta.

Isso funciona muito bem nas imagens para as quais PNG foi criado. Uma captura de tela tem painéis lisos e texto repetido; um logotipo tem poucas cores sólidas. Ambos comprimem bastante.

Em fotos funciona pior, porque quase nada se repete. Cada pedaço de grama, cada trecho do degradê do céu e cada ponto de ruído do sensor é um pouco diferente, e PNG registra tudo. Uma foto de celular salva como PNG pode ocupar dez vezes mais que o JPEG correspondente. O formato não é ruim; você só pediu que um formato sem perdas guardasse algo que normalmente não precisa desse tipo de preservação.

É por isso que a resposta certa depende do que a imagem contém.

## WebP sem perdas: trocar o formato, preservar a imagem

WebP tem um modo sem perdas que comprime melhor que PNG. É mais recente e usa mais técnicas. Nas imagens em que PNG funciona bem, costuma reduzir mais um quinto a um terço sem descartar informação.

É o modo para texto e bordas nítidas: capturas para documentação, modelos de interface, diagramas, desenhos de linhas, logotipos, gráficos e pixel art. O resultado é a mesma imagem, menor. A principal restrição é algum programa não conseguir ler WebP.

A indicação “sem perdas” merece ser conferida, e a ferramenta faz isso. WebP guarda os pixels em um de dois tipos de bloco; o conversor relê o resultado para identificar qual foi gravado. Se algum navegador deixar de atender ao pedido, a linha avisará em vez de entregar uma imagem com perdas chamada de sem perdas. Os navegadores atuais atendem ao pedido.

## WebP com perdas: para fotos

O outro modo descarta detalhes que você provavelmente não notaria, como JPEG, mas com mais eficiência. Em uma foto, é comum reduzir um PNG de 2 MB para menos de 200 KB sem conseguir distinguir os dois lado a lado.

O controle de qualidade começa em 80, o padrão do WebP, que costuma dar bons resultados em fotos. Abaixo de cerca de 60, a perda começa a aparecer.

Esse modo *não* é indicado para cores chapadas. A compressão com perdas suaviza detalhes, justamente o contrário do que texto e bordas nítidas precisam. Pode surgir um halo nas letras, parecido com uma digitalização ruim. Se houver palavras na imagem, use o modo sem perdas.

## A transparência continua nos dois modos

Essa é uma dúvida comum, e a resposta é simples: WebP tem um canal alfa como PNG. Um logotipo com fundo transparente continua transparente. Não é preciso escolher uma cor de fundo nem achatar a imagem.

Vale comparar com o caminho contrário. Converter uma imagem *para* JPEG remove a transparência, pois JPEG não tem canal alfa. O guia sobre [converter WebP para JPG](https://abox.tools/pt/guias/converter-webp-para-jpg/) explica isso em uma seção própria. WebP não tem esse problema, uma das razões para escolhê-lo quando o destino aceita.

Há um detalhe medido que acompanha essa afirmação precisa: a cor armazenada em um pixel *parcialmente* transparente pode mudar muito pouco. Isso acontece ao passar pelo canvas do navegador, não por causa do WebP. O canvas guarda a cor multiplicada pela transparência e não consegue desfazer essa multiplicação com exatidão. A diferença não é visível, porque os pixels cuja cor mais muda são os que menos mostram essa cor. Pixels opacos passam bit por bit.

## WebP abre em todo lugar?

Na web, sim. Chrome, Edge, Firefox e Safari mostram WebP desde 2020. Se o destino é um site, não é mais necessário preparar outro formato por essa razão. Esse é o principal motivo para converter: páginas menores, mesma imagem.

Fora do navegador, a compatibilidade varia. Windows e macOS já exibem prévias, mas programas antigos, alguns formulários e muitos leitores digitais ainda recusam WebP. Se o destino não aceita esse formato, você precisa da ferramenta inversa, [WebP para JPG](https://abox.tools/pt/webp-para-jpg/), e do seu [guia](https://abox.tools/pt/guias/converter-webp-para-jpg/).

## O que fica para trás

Os pixels passam; os dados ao redor não. Converter pelo canvas deixa de fora blocos de texto, perfis de cor ICC e blocos XMP do PNG.

Na maioria dos PNGs isso faz pouca diferença: eles raramente têm dados de câmera, e capturas de tela não os têm. Para saber o que existe no arquivo, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) lê e altera esses dados sem recomprimir a imagem.

## Por que não há envio

As duas partes do trabalho já estão no computador. O navegador decodifica PNG e codifica WebP desde 2020, a mesma capacidade que permitiu a adoção de WebP nos sites.

Um conversor que envia os arquivos para um servidor usa a própria cópia de um programa que você já tem e fica com suas imagens enquanto trabalha. [Esta ferramenta](https://abox.tools/pt/png-para-webp/) faz tudo na página. Ela continua funcionando sem rede, a comprovação mais simples de que o arquivo não saiu. O guia [é seguro enviar arquivos?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) explica a questão geral.
