# Como transformar uma pasta de imagens em um vídeo

Uma apresentação de slides é simples de fazer e fácil de ter que renderizar duas vezes, porque dois dos ajustes não significam o que parecem significar. Aqui está o que cada um controla, e o que escolher.

[Abrir Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/), jogue as imagens dentro, coloque em ordem, defina quanto tempo cada uma fica na tela e crie o vídeo. Você recebe um MP4 com vídeo H.264, que toca em basicamente qualquer coisa.

Os dois ajustes que mais costumam obrigar a uma segunda passada são a duração e a resolução, e vale entendê-los antes da primeira renderização, não depois.

## Taxa de quadros e duração não são a mesma coisa

Essa é a confusão que custa uma nova renderização às pessoas.

**Duração** é quanto tempo cada imagem fica na tela. É o ajuste com que você de fato se importa. Três segundos é um padrão confortável para uma apresentação que alguém está assistindo, um a dois segundos parece ágil, e qualquer coisa acima de cinco arrasta, a menos que haja narração por cima.

**Taxa de quadros** é quantas vezes por segundo o vídeo repete aquela imagem. Ela não muda nada na aparência da apresentação, porque uma imagem parada mantida por três segundos fica idêntica a 24 quadros por segundo e a 60, e muda bastante o tamanho do arquivo e o tempo de codificação.

Então, para uma apresentação simples, escolha uma taxa de quadros baixa. 24 ou 30 dá e sobra. O motivo para subir é se houver movimento no vídeo: um travelling ou zoom sobre cada foto, ou uma transição entre elas, onde uma taxa baixa aparece como serrilhado no movimento.

![Os ajustes de resolução e taxa de quadros, com um resumo contando as imagens, a duração total, os quadros e o tamanho estimado.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Taxa de quadros e duração são coisas diferentes, e no resumo isso fica óbvio: mudar uma mexe no número de quadros, não na duração.

## Resolução, e imagens de formato errado

Um vídeo tem um único tamanho de quadro do começo ao fim. As suas fotografias quase certamente não têm todas o mesmo, então alguma coisa precisa acontecer com as que não couberem, e essa alguma coisa é a escolha que vale fazer de propósito.

Comece escolhendo a resolução a partir do destino do vídeo:

- **⁦1920×1080⁩** para qualquer coisa geral. Suportado universalmente, toca em todo lugar, e é o que a maioria das pessoas chama de HD.
- **⁦1080×1920⁩**, que são os mesmos números ao contrário, para um destino pensado no celular: stories, reels, shorts.
- **⁦3840×2160⁩** só se as imagens realmente tiverem todo esse detalhe e o destino for exibi-lo. São quatro vezes os pixels, quatro vezes o tempo de codificação e mais ou menos quatro vezes o arquivo.

Depois decida o que acontece com as que não batem. Caber cada imagem dentro do quadro mantém tudo e deixa tarjas nas laterais, o que é seguro e é a resposta certa quando as imagens importam mais do que a apresentação. Preencher o quadro e cortar o que sobra fica mais bonito e vai cortar o topo de algumas delas. Misturar fotos em pé e deitadas num vídeo só é o caso em que não existe boa resposta, e decidir antes de qual jeito você prefere errar poupa uma nova renderização.

## Ordem, e a armadilha do nome de arquivo

Como em qualquer trabalho em lote, os nomes de arquivo se ordenam de um jeito que não é o jeito como você contou. `photo2.jpg` vem depois de `photo10.jpg` numa ordenação alfabética, porque a comparação é caractere por caractere.

Ordenar pela data em que a foto foi tirada costuma estar certo para fotografias de um evento, já que você as tirou na ordem em que as coisas aconteceram. Arrastar os quadradinhos está certo para qualquer coisa em que a história não seja cronológica. Confira antes de renderizar, porque o vídeo é o único produto em que consertar a ordem significa refazer o trabalho inteiro.

![Seis imagens na ordem em que vão passar, cada uma com um campo de duração, acima de uma linha que ajusta todas as durações de uma vez.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

A ordem é a lista, e a lista se arrasta. Ela vem da ordem em que você adicionou, que não é a que os nomes dos arquivos sugerem.

## Não há trilha sonora, e isso não é pouca coisa

O MP4 que esta ferramenta escreve tem uma única trilha de vídeo e nenhuma trilha de áudio. Se a sua apresentação precisa de música ou narração, você vai precisar de um editor de vídeo para essa etapa.

Vale saber por quê, e não apenas que é assim: acrescentar áudio significa decodificar um arquivo de música, codificá-lo em AAC e intercalá-lo com o vídeo dentro do contêiner. As três coisas são trabalho de verdade, e fazê-las mal produz um arquivo que vai perdendo o sincronismo enquanto toca. Está na lista em vez de estar pela metade.

Uma nota prática, se você for acrescentar música depois: escolha a faixa primeiro e ajuste a duração por imagem para que a apresentação saia perto da duração da música. Aparar a música para caber no vídeo sempre soa pior que ajustar o vídeo à música.

## O que sai, e o que fazer se não tocar

MP4 com H.264 é o alvo, e é a combinação mais amplamente reproduzível que existe. Num navegador sem WebCodecs a ferramenta recua para gravar WebM, que são as mesmas imagens num contêiner que menos editores e menos plataformas sociais aceitam.

Se você acabar com um WebM e alguma coisa recusar, o conserto é um navegador com suporte a WebCodecs, e não uma conversão: as versões atuais do Chrome, do Edge e do Safari têm. Renderizar de novo é melhor do que converter, porque converter significa mais uma geração de codificação com perdas.

A ferramenta não tem limite embutido para quantas imagens você pode usar. O teto é a memória do seu próprio computador, porque o vídeo pronto é montado ali antes de você baixar, e uma apresentação longa em 4K é a primeira coisa a sentir isso.

## Deixando o arquivo menor

Se o resultado ficar grande demais para onde ele vai, na ordem do que de fato ajuda:

**Baixe a taxa de quadros.** Numa apresentação de imagens paradas isso não custa nada visível e é a maior economia isolada disponível.

**Baixe a resolução.** 1080p em vez de 4K é um quarto dos pixels, e numa tela de celular ninguém vai perceber.

**Encurte.** Três segundos por imagem em vez de cinco tira 40% da duração e 40% do arquivo, e em geral dá uma apresentação melhor.

Diminuir as fotografias de origem não ajuda muito. O vídeo é codificado na resolução que você escolheu de todo jeito, então uma foto de 4000 pixels e uma de 2000 produzem quase o mesmo número de bytes num vídeo 1080p. O que isso faz é acelerar a codificação, e empurrar aquele teto de memória.

## Por que isso não precisa de servidor, com uma exceção declarada

Codificar vídeo já foi o caso mais evidente a favor do envio: navegadores não davam conta, e uma máquina com FFmpeg dava. O WebCodecs mudou isso ao expor o codificador de hardware que já está no seu computador, que é o mesmo que o seu celular usa para gravar vídeo em tempo real. Compor os quadros é um canvas. Nenhuma das duas etapas precisa de nada além do seu próprio hardware.

Uma exceção nesta ferramenta específica, declarada em vez de escondida: a função opcional de “adicionar a partir de um endereço da web” busca uma imagem num endereço que você cola, e o servidor daquele endereço enxerga o seu IP e o que você pediu. Isso é inerente à função, e não um defeito dela, e é a única etapa de rede em toda a ferramenta. Não use essa função e nada sai do seu computador.

O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz quatro verificações que dizem a mesma coisa sobre qualquer ferramenta, esta inclusive.
