# A foto que seu celular salvou, e o formato que nada abre

O iPhone salva fotos em HEIC, um formato menor e melhor que o JPEG e que um monte de programa ainda se recusa a abrir. Aqui está o que o formato é de fato, o que a conversão custa à imagem, e por que quase todo conversor quer que você mande a foto para ele primeiro.

[Abrir HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [conversor de HEIC para JPG](https://abox.tools/pt/heic-para-jpg/), jogue as fotos dentro e clique em “Converter”. Deixe o controle de qualidade onde está e deixe marcado “manter a data, a câmera e os ajustes”, a menos que você tenha um motivo para não deixar. Você recebe JPEGs de volta, um botão de download para cada, ou um zip se forem vários.

Nada é enviado enquanto você faz isso. Isso é incomum neste trabalho específico, e o motivo é a metade interessante desta página.

![O cartão de opções: um menu de formato em JPEG, um controle de qualidade em 85 e uma chave para manter a data, a câmera e o lugar do original.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

A conversão inteira são esses três. A chave dos metadados é a que merece uma parada, e a seção mais abaixo diz por quê.

## O que HEIC é de verdade

HEIC não é bem um formato de imagem do jeito que o JPEG é. É um contêiner, com a mesma estrutura de caixas com que um MP4 é montado, e dentro dele fica um quadro parado de vídeo **HEVC**. O HEVC, também chamado de H.265, é o codec que substituiu o que a sua filmadora antiga usava, e é muito bom: uma foto de iPhone em HEIC tem mais ou menos metade do tamanho da mesma foto como JPEG na mesma qualidade.

A Apple mudou para ele no iOS 11, em 2017, e o deixou como padrão. O que significa que, a menos que alguém tenha entrado em Ajustes e escolhido “Mais compatível”, toda foto que o celular daquela pessoa tirou em quase uma década está num formato que:

- o Windows não pré-visualiza sem uma extensão da Store;
- a maioria dos formulários de envio na web recusa de cara;
- um monte de software de computador mais antigo nunca ouviu falar;
- e navegador nenhum, exceto o Safari, exibe.

A foto está ótima. É um arquivo melhor do que o JPEG teria sido. Ela apenas está escrita numa língua que a maior parte do mundo nunca aprendeu.

## Por que só o Safari abre um

Esta é a parte que explica todo conversor que você já usou, então merece um parágrafo.

Decodificar HEVC precisa de um decodificador de HEVC, e HEVC é patenteado. O licenciamento é administrado por mais de um consórcio de patentes, e distribuir um decodificador significa pagar alguém. Os navegadores lidam com isso apoiando-se no sistema operacional, e é assim que o Chrome toca *vídeo* HEVC numa máquina cujo hardware já tem um decodificador licenciado. Só que esse caminho está ligado à reprodução de vídeo, e não a imagens paradas. Então um HEIC entregue a uma `<img>` é recusado, no Chrome, no Firefox e no Edge igualmente, em qualquer sistema operacional.

O Safari em hardware da Apple é a exceção, porque o macOS e o iOS têm o decodificador e o Safari tem permissão de pedir a ele. Em todo o resto, a imagem simplesmente não é decodificável pelo navegador.

O que deixa um conversor com exatamente duas opções, e a escolha entre elas é a história inteira desse tipo de ferramenta.

## Por que quase todo conversor de HEIC quer um envio

Opção um: colocar o decodificador num servidor. A foto é enviada, decodificada numa máquina que você nunca viu, recodificada como JPEG e mandada de volta. É isso que quase todo “conversor de HEIC online gratuito” faz, e é por isso que todos precisam dos seus arquivos. Não é preguiça, porque o navegador genuinamente não dá conta sozinho.

Vale ser direto sobre o que isso custa. Fotos de celular são os arquivos mais pessoais que a maioria das pessoas tem, e um HEIC recém-saído de um iPhone normalmente carrega as coordenadas de onde foi tirado, com precisão de poucos metros, junto com a data até o segundo e um identificador de câmera. Enviar uma pasta cheia deles a um serviço gratuito significa entregar as imagens e isso tudo junto. O que acontece depois é regido por uma política de privacidade que você não leu, num servidor que você não pode inspecionar, numa jurisdição que você não escolheu.

Opção dois: colocar o decodificador na página. É isso que [este aqui](https://abox.tools/pt/heic-para-jpg/) faz. Ele carrega a `libheif`, compilada para WebAssembly, como um arquivo servido deste site, com cerca de 1,4 MB, baixados uma vez e depois guardados em cache. O seu navegador roda isso no seu próprio computador, no seu próprio hardware, e a foto não vai a lugar nenhum. Carregue a página uma vez e você pode desligar completamente a internet que ela continua funcionando, o que é uma coisa que conversor nenhum que envia consegue fazer, e a prova mais simples que existe.

Os 1,4 MB são o preço inteiro. Se você está numa conexão tarifada é um custo real e vale saber, e é por isso que a página diz isso em voz alta em vez de baixar em silêncio.

## O que a conversão custa à imagem

HEIC e JPEG são codecs diferentes, então não há caminho entre os dois que não envolva decodificar a imagem e codificá-la de novo. Essa segunda codificação é com perdas. Na prática isso importa bem menos do que soa:

- **Na qualidade 92**, que é onde o conversor começa, uma fotografia é muito difícil de distinguir do original em qualquer tamanho normal de visualização. Você estaria procurando diferenças em gradientes suaves, como um céu limpo, e em geral não vai achar.
- **O JPEG vai ser maior.** Normalmente entre um terço maior e o dobro do tamanho, porque JPEG é um codec de 1992 e HEVC não é. Essa é a troca: um arquivo maior que tudo abre.
- **Converter duas vezes é o que se deve evitar.** Toda codificação com perdas custa um pouco. Converta a partir do HEIC original, e não de um JPEG que alguém já fez para você, e faça uma vez só.

Se você não quer perda nenhuma, o PNG está no menu de formatos. Prepare-se para o arquivo: uma fotografia como PNG costuma ter de cinco a dez vezes o tamanho do JPEG, porque a compressão do PNG foi desenhada para cor chapada e desenho de traço, não para grama e pele.

## A data, a câmera e as coordenadas

A reclamação de sempre sobre conversores de HEIC é que as fotos voltam sem o dia em que foram tiradas, então uma viagem inteira de fotos vai parar no fim da biblioteca com a data de hoje. Isso acontece porque converter por um canvas rende pixels e mais nada, já que um canvas não guarda etiquetas. Então, a não ser que o conversor vá buscar os metadados à parte, eles simplesmente somem.

A ferramenta daqui copia o bloco EXIF do HEIC e o escreve dentro do JPEG, então a data sobrevive. Existe uma caixinha, e ela vem marcada. Desmarque e o JPEG sai com a imagem e nada mais.

Antes de decidir, olhe a lista: a linha de cada foto diz se o arquivo carrega coordenadas de GPS, e diz isso antes de qualquer coisa ser convertida. Se as fotos vão para algum lugar público, é essa a linha para ler. Se vão para a sua própria biblioteca, manter os metadados quase certamente é o que você quer.

Uma etiqueta muda de qualquer jeito, e vale saber por quê. Um HEIC registra a rotação dele em dois lugares: no contêiner e no bloco EXIF. O decodificador aplica a rotação do contêiner enquanto decodifica, então os pixels entregues já estão no sentido certo. Se o EXIF ainda dissesse “gire isto 90 graus”, um visualizador faria de novo e toda foto em pé sairia deitada. Então a etiqueta de orientação é ajustada para “em pé” e todo o resto é copiado exatamente como o celular escreveu.

Se o que você quer é percorrer as etiquetas em detalhe, ou apagá-las de fotos que já são JPEG, isso é outro trabalho e existe [um guia para ele](https://abox.tools/pt/guias/remover-dados-exif-e-gps/).

## Coisas que pegam as pessoas de surpresa

- **Um HEIC chamado “.jpg”.** Muitíssimo comum: alguma coisa no caminho renomeou o arquivo sem convertê-lo, e é por isso que ele continua não abrindo. Todo arquivo jogado no conversor é identificado pelos primeiros bytes e não pelo nome, então um desses funciona sem problema. É também por isso que um arquivo que é genuinamente um JPEG recebe esse aviso, em vez de ser convertido numa cópia de si mesmo.
- **Um arquivo, várias imagens.** Uma rajada ou uma Live Photo pode guardar mais de uma imagem parada. Todas são convertidas, e as extras são numeradas depois do nome original. A metade em vídeo de uma Live Photo é um arquivo separado que o celular guarda ao lado do HEIC, então não está ali dentro para ser convertida.
- **AVIF não é HEIC.** Eles se parecem, com o mesmo contêiner e um codec diferente lá dentro, mas todo navegador atual abre um AVIF nativamente. Não há o que converter, e a ferramenta avisa isso em vez de fingir que trabalhou.
- **Cortar o problema na origem.** No celular: Ajustes → Câmera → Formatos → Mais compatível. Dali em diante as fotos novas são JPEGs. Isso usa mais armazenamento e não encosta nas fotos que você já tem, mas significa nunca mais fazer isso.
- **Compartilhar às vezes já converte.** Mandar uma foto por AirDrop ou por e-mail a um aparelho que não é da Apple muitas vezes entrega um JPEG, porque o iOS converte na saída. Se uma foto chegou como HEIC mesmo assim, ela veio por um caminho que não converteu.

## Como saber se um conversor está enviando

Isso vale para qualquer ferramenta, não só para esta, e leva uns quinze segundos.

1. Abra a página, então abra as ferramentas do desenvolvedor do seu navegador e vá para a aba “Rede”.
2. Converta uma foto e observe. Uma ferramenta que decodifica no seu computador não faz requisição nenhuma naquele momento. Uma ferramenta que envia faz uma do tamanho da sua foto, e você consegue ver o tamanho.
3. Ou, mais simples ainda: carregue a página, desligue a internet e tente converter alguma coisa. Uma ferramenta que mandou a sua foto para ser decodificada em outro lugar para de funcionar. Uma que carrega o decodificador não para.

O conversor daqui foi feito para passar nas duas verificações, e há uma versão mais longa desse argumento em [é seguro enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/).
