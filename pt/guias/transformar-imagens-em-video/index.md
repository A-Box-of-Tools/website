# Transforme uma sequência de imagens ou apresentação de fotos em MP4

Uma sequência renderizada precisa de uma imagem por quadro de vídeo; uma apresentação precisa de tempo para olhar cada fotografia. Comece por essa escolha e confira a ordem, as dimensões e a duração antes de codificar no seu dispositivo.

[Abrir Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Crie um MP4 a partir de uma sequência renderizada, fotos de timelapse ou uma apresentação.

Última atualização 23 de outubro de 2026

## A resposta curta

Abra [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/), adicione e ordene fotos, escolha segundos para slides ou quadros para sequências, informe a duração de cada uma e crie o vídeo. MP4 com H.264 é recomendado; teste no aplicativo receptor antes de compartilhar.

Os dois ajustes que mais costumam obrigar a uma segunda passada são a duração e a resolução, e vale entendê-los antes da primeira renderização, não depois.

## De uma sequência renderizada numerada a MP4

1. Em [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/), adicione as imagens estáticas exportadas pelo Blender, After Effects ou outro renderizador. Use um formato de imagem que o navegador consiga decodificar, como PNG ou JPG.
2. Escolha Ordenar por nome. A ordenação entende números, então frame_2 vem antes de frame_10. Confira se há quadros faltando ou se a numeração recomeça onde não deveria.
3. Deixe Manter cada imagem por em um quadro e ajuste a taxa de quadros para a mesma da renderização. Uma sequência de 240 imagens a 24 fps dura dez segundos.
4. Escolha as dimensões de saída e Ajustar dentro para preservar a imagem inteira. As áreas transparentes recebem o fundo selecionado: MP4 com H.264 não mantém o canal alfa.
5. Crie o vídeo, assista ao começo e ao fim, baixe e abra no aplicativo que vai recebê-lo.

Uma pasta de fotografias para time-lapse segue os mesmos passos. A taxa de quadros define a velocidade de reprodução; Ordenar por data usa a data de modificação do arquivo, então confira a ordem se as fotografias foram copiadas ou editadas. Para um vídeo que já existe, use o [Criador de time-lapse](https://abox.tools/pt/fazer-timelapse/).

## Slides, stop motion ou registro de progresso

Para férias, resumo de evento ou catálogo, mude Manter cada imagem por para segundos, informe por exemplo três e aperte Aplicar a todas. Ordene a história, escolha 1080p ou formato vertical do destino e Ajustar dentro para preservar a foto inteira. Confira a duração antes de criar e veja primeira, central e última imagem no vídeo final.

Para stop motion, render ou fotos periódicas de progresso, use quadros: uma imagem por um quadro a 24 fps dá 24 imagens por segundo. Ordene por nome e confira. Grava cortes diretos entre imagens, sem zoom, transição nem som. Uma apresentação narrada precisa de outro editor; um registro visual silencioso fica completo aqui.

## Taxa de quadros e duração não são a mesma coisa

Essa é a confusão que custa uma nova renderização às pessoas.

**Duração em segundos** indica quanto cada imagem permanece. Três segundos é um início confortável para slides; um ou dois é rápido; mais de cinco se arrasta salvo se houver narração.

**Taxa, com segundos escolhidos,** é quantas vezes a imagem se repete por segundo. Uma imagem estática de três segundos parece igual a 24 e 60 fps, mas muda bastante o tamanho e tempo de codificação.

Começa com um quadro por imagem. Assim a taxa muda a duração: 24 imagens a 24 fps duram um, a 12 duram dois segundos. Para slides comuns mude para segundos; 24 ou 30 fps bastam. Sem panorâmicas, zoom nem transições, aumentar a taxa não adiciona movimento.

![Os ajustes de resolução e taxa de quadros, com um resumo contando as imagens, a duração total, os quadros e o tamanho estimado.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Em segundos, mudar a taxa muda a quantidade de quadros, mas preserva a duração de cada imagem. Em quadros, muda também a duração.

## Resolução, e imagens de formato errado

Um vídeo tem um único tamanho de quadro do começo ao fim. As suas fotografias quase certamente não têm todas o mesmo, então alguma coisa precisa acontecer com as que não couberem, e essa alguma coisa é a escolha que vale fazer de propósito.

Comece escolhendo a resolução a partir do destino do vídeo:

- **⁦1920×1080⁩** para qualquer coisa geral. Suportado universalmente, toca em todo lugar, e é o que a maioria das pessoas chama de HD.
- **⁦1080×1920⁩**, que são os mesmos números ao contrário, para um destino pensado no celular: stories, reels, shorts.
- **⁦3840×2160⁩** só se as imagens realmente tiverem todo esse detalhe e o destino for exibi-lo. São quatro vezes os pixels, quatro vezes o tempo de codificação e mais ou menos quatro vezes o arquivo.

Depois decida o que acontece com as que não batem. Caber cada imagem dentro do quadro mantém tudo e deixa tarjas nas laterais, o que é seguro e é a resposta certa quando as imagens importam mais do que a apresentação. Preencher o quadro e cortar o que sobra fica mais bonito e vai cortar o topo de algumas delas. Misturar fotos em pé e deitadas num vídeo só é o caso em que não existe boa resposta, e decidir antes de qual jeito você prefere errar poupa uma nova renderização.

## Ordem, e a armadilha do nome de arquivo

Como em qualquer trabalho em lote, os nomes de arquivo se ordenam de um jeito que não é o jeito como você contou. `photo2.jpg` vem depois de `photo10.jpg` numa ordenação alfabética, porque a comparação é caractere por caractere.

Ordenar por nome conta números: photo2 vem antes de photo10. Por data usa modificação do arquivo, não necessariamente captura; fotos copiadas ou editadas podem precisar de ordem manual. Arraste se a história não for cronológica. Confira antes de criar: mudar a ordem do vídeo exige repetir tudo.

![Seis imagens na ordem em que vão passar, cada uma com um campo de duração, acima de uma linha que ajusta todas as durações de uma vez.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

A ordem é a lista, e a lista se arrasta. Ela vem da ordem em que você adicionou, que não é a que os nomes dos arquivos sugerem.

## Não há trilha sonora, e isso não é pouca coisa

O MP4 que esta ferramenta escreve tem uma única trilha de vídeo e nenhuma trilha de áudio. Se a sua apresentação precisa de música ou narração, você vai precisar de um editor de vídeo para essa etapa.

Vale saber por quê, e não apenas que é assim: acrescentar áudio significa decodificar um arquivo de música, codificá-lo em AAC e intercalá-lo com o vídeo dentro do contêiner. As três coisas são trabalho de verdade, e fazê-las mal produz um arquivo que vai perdendo o sincronismo enquanto toca. Está na lista em vez de estar pela metade.

Uma nota prática, se você for acrescentar música depois: escolha a faixa primeiro e ajuste a duração por imagem para que a apresentação saia perto da duração da música. Aparar a música para caber no vídeo sempre soa pior que ajustar o vídeo à música.

## O que sai, e o que fazer se não tocar

O objetivo é MP4 com H.264, a combinação que toca em mais lugares. Se esse codificador não estiver disponível, a ferramenta pode recorrer à gravação da reprodução em tempo real, geralmente em WebM, aceito por menos editores e plataformas sociais. Mantenha a aba visível durante essa gravação. Os tempos dessa alternativa são aproximados e imagens podem ser puladas se a decodificação atrasar; para uma sequência numerada exata, use um codificador MP4 compatível.

Se o resultado for WebM e um aplicativo recusá-lo, renderize as imagens originais novamente com MP4 selecionado em um navegador cujo codificador WebCodecs aceite H.264 nas dimensões escolhidas. Isso evita a geração adicional de codificação com perdas que converter o vídeo causaria.

Não há um máximo fixo de imagens. O vídeo é montado na memória antes do download, e a saída MP4 precisa ficar abaixo de 4 GiB (cerca de 4,3 GB); a memória pode acabar antes. O codificador do navegador também precisa aceitar as dimensões escolhidas. Uma apresentação longa em 4K pode atingir esses limites com relativamente poucas imagens de origem.

## Confira o resultado antes de compartilhar

Se os slides passarem rápido demais, confira se a unidade de duração está em segundos e pressione Aplicar a todas. Se uma sequência renderizada tocar devagar demais, confira a taxa de quadros e a duração de cada imagem em quadros. As barras preservam a imagem inteira; bordas faltando geralmente indicam que Preencher quadro foi selecionado. Exporte novamente a partir das imagens originais ao mudar essas opções.

Para criar uma animação que precise continuar como GIF, use o [Criador de GIF](https://abox.tools/pt/criar-gif/). Para transformar um GIF existente em vídeo, use [GIF para MP4](https://abox.tools/pt/gif-para-mp4/) diretamente, preservando seus tempos de reprodução. Extrair PNGs primeiro exige ajustar os tempos manualmente; o [guia para extrair quadros de um GIF](https://abox.tools/pt/guias/separar-um-gif-em-quadros/) explica quando essa etapa adicional é útil.

## Deixando o arquivo menor

Se o resultado ficar grande demais para onde ele vai, na ordem do que de fato ajuda:

**Baixe a taxa de quadros.** Numa apresentação de imagens paradas isso não custa nada visível e é a maior economia isolada disponível.

**Baixe a resolução.** 1080p em vez de 4K é um quarto dos pixels, e numa tela de celular ninguém vai perceber.

**Encurte.** Três segundos por imagem em vez de cinco tira 40% da duração e 40% do arquivo, e em geral dá uma apresentação melhor.

Diminuir as fotografias de origem não ajuda muito. O vídeo é codificado na resolução que você escolheu de todo jeito, então uma foto de 4000 pixels e uma de 2000 produzem quase o mesmo número de bytes num vídeo 1080p. O que isso faz é acelerar a codificação, e empurrar aquele teto de memória.

## Por que isso não precisa de servidor, com uma exceção declarada

Codificar vídeo já foi o caso mais evidente a favor do envio: navegadores não davam conta, e um computador com FFmpeg dava. O WebCodecs mudou isso ao expor o codificador de hardware que já está no seu computador, que é o mesmo que o seu celular usa para gravar vídeo em tempo real. Compor os quadros é um canvas. Nenhuma das duas etapas precisa de nada além do seu próprio hardware.

Uma exceção nesta ferramenta específica, declarada em vez de escondida: a função opcional de “adicionar a partir de um endereço da web” busca uma imagem num endereço que você cola, e o servidor daquele endereço enxerga o seu IP e o que você pediu. Isso é inerente à função, e não um defeito dela, e é a única etapa de rede em toda a ferramenta. Não use essa função e nada sai do seu computador.

O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz quatro verificações que dizem a mesma coisa sobre qualquer ferramenta, esta inclusive.
