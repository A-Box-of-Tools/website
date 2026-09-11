# Como salvar um quadro de um vídeo como imagem

Pausar o player e apertar a tecla de captura dá uma imagem de uma janela. Às vezes é só isso que você precisa. Aqui está qual é a diferença, e como pegar o quadro em si quando ela importa.

[Abrir Extrator de quadro](https://abox.tools/pt/extrair-quadro-de-video/): Uma imagem em qualidade cheia, de qualquer ponto.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Extrator de quadro](https://abox.tools/pt/extrair-quadro-de-video/), solte o vídeo lá dentro, ache o momento e aperte *Extrair este quadro*. O que cai nos seus downloads é o quadro na resolução do próprio vídeo — ⁦3840 × 2160⁩ de um vídeo em 4K, seja qual for o tamanho da prévia na página.

Deixe o formato em PNG, a não ser que o tamanho do arquivo seja um problema. O resto desta página é sobre por que essas duas frases não são a mesma coisa que uma captura de tela, e quando a diferença vale a pena.

## Por que uma captura do player pausado é outra imagem

Todo mundo já tem um jeito de fazer isso: pausar, apertar a tecla de captura, cortar os controles fora. Funciona, e para mandar rápido é exatamente o esforço certo. Só que a essa altura quatro coisas aconteceram com a imagem, e nenhuma delas tem volta:

- **Ela tem o tamanho da janela, não o do vídeo.** Um vídeo em 4K num player ocupando meia tela dá uma imagem de um player ocupando meia tela. Todo pixel que estava no arquivo e não estava na tela se foi.
- **Ela foi redimensionada.** O que quer que o player tenha feito para caber o quadro naquela janela — suavizar, dar nitidez ou simplesmente reamostrar — ficou assado ali dentro.
- **Ela passou pela cadeia de exibição.** Gerenciamento de cor, e num vídeo HDR um mapeamento de tons escolhido para o seu monitor, não para o arquivo.
- **Ela quase sempre traz mobília junto.** Controles, barra de progresso, faixa de legenda, o cursor.

Um extrator de quadro pula as quatro: ele decodifica o quadro que o arquivo realmente guarda e escreve aqueles pixels. A imagem tem o tamanho que o vídeo tem, e ninguém desenhou nada em cima.

## Cair no quadro que você queria

Esta é a parte que a maioria das ferramentas erra em silêncio, e vale saber o que procurar em qualquer uma delas.

Vídeo não é uma tira de fotos na ordem em que você assiste. A maior parte dos quadros é guardada como uma descrição do que muda em relação a outros quadros, e em qualquer arquivo com quadros B a ordem em que eles estão guardados não é a ordem em que aparecem. Uma ferramenta que manda um player para um instante e pega o que aparecer fica à mercê de como aquele player arredonda; e uma que avança “um quadro” somando um trinta avos de segundo erra em todo vídeo que não seja exatamente de 30 fps — ou seja, quase todo vídeo de celular, porque eles variam a taxa de quadros conforme a luz muda.

A saída é ler a lista de quadros do próprio arquivo e chamar os quadros pelo lugar que ocupam nela. Num MP4 a ferramenta daqui faz isso: o controle anda um quadro por passo, as setas andam um quadro, e ela consegue dizer que você está no quadro 812 de 3.540 porque contou. Nos formatos que ela não lê direto, ela avisa, e anda mais ou menos um quadro em vez de fingir.

Um teste rápido para qualquer extrator: avance alguns quadros em cima de algo com movimento rápido. Se a imagem às vezes não muda, ou pula de dois em dois, a ferramenta está chutando em cima de marcas de tempo.

![O localizador de quadros: uma imagem parada com o código de tempo gravado, uma barra de rolagem, botões de passo e campos com o instante exato e o número do quadro.](https://abox.tools/screens/grab-a-frame-from-a-video/find.webp)

Andar quadro a quadro é como se acerta o que você queria. O instante e o número do quadro apontam a mesma coisa, e os dois podem ser digitados.

## Em que formato salvar

Na prática só existem três respostas, e a escolha é sobre o que acontece com a imagem depois.

- **PNG** — o padrão, e o único que guarda o quadro exato. Escolha ele se a imagem vai ser editada, impressa, comparada com outro quadro ou guardada. É também o maior: conte alguns megabytes vindo de 1080p e uns oito vindo de 4K, porque imagem fotográfica não é aquilo em que a compressão do PNG é boa.
- **JPEG** — um décimo do tamanho, e aceito em todo lugar. Escolha ele para uma miniatura, uma prévia, ou qualquer coisa que vá direto para um documento ou uma conversa. É uma segunda rodada de compressão com perda em cima da do próprio vídeo, então é o ponto de partida errado para continuar editando.
- **WebP** — menor ainda com a mesma qualidade visível, e hoje suportado onde importa. A única ressalva é software antigo: alguns programas de computador ainda não abrem.

Uma coisa que vale deixar clara: um quadro tirado de um vídeo já é uma imagem comprimida. Salvar em PNG não desfaz isso e não recupera o detalhe que o codec jogou fora quando o vídeo foi gravado. O que o PNG te dá é que nada seja jogado fora *duas vezes*. Se você vai corrigir cor ou recortar a imagem depois, isso importa; se vai mandar para alguém, não.

## Extrair muitos de uma vez

Uma imagem a cada tantos segundos é um trabalho diferente de uma imagem num momento, e aparece mais do que parece: uma folha de contato de uma gravação longa, miniaturas para escolher uma capa, uma amostra regular do material para conferir foco ou exposição ao longo de uma diária.

Defina um intervalo, aperte o botão da série, e a ferramenta percorre o vídeo uma vez tirando uma imagem em cada marca. Duas observações práticas. Seja generoso com o intervalo num vídeo longo — uma imagem por segundo de uma hora de material são 3.600 fotos, que é por isso que a ferramenta limita uma rodada em 500. E escolha JPEG para isso, a menos que tenha um motivo para não escolher: cem PNGs de 4K são quase um gigabyte segurado na página antes de você ter baixado qualquer um.

Elas voltam num ZIP só, com o timecode no nome, então se ordenam na sequência em que aconteceram e cada uma dá para achar de novo no vídeo.

![Três imagens paradas tiradas do mesmo clipe, em miniatura e com seus tempos, e um botão para salvar todas de uma vez.](https://abox.tools/screens/grab-a-frame-from-a-video/shots.webp)

Tire várias e escolha depois. Elas ficam na página até você salvar, e salvar é um botão.

## Vídeos em pé, e a clássica imagem deitada

Se você já tirou um quadro de um vídeo de celular e ele saiu deitado, é por isso. O celular filma deitado e escreve um quarto de volta dentro do arquivo em vez de girar os pixels. Os players leem essa volta e aplicam; uma ferramenta que lê só os pixels não aplica, e o resultado é uma imagem perfeitamente boa do momento certo, girada 90 graus.

Não há nada de errado com o arquivo, e girar a imagem de volta depois não custa nada além da chateação. A ferramenta daqui lê a rotação na faixa e aplica antes de desenhar, então um vídeo em pé dá uma imagem em pé.

## O que não dá para recuperar

Uma imagem parada só pode ser tão boa quanto o quadro de onde ela veio, e duas coisas limitam isso, seja qual for a ferramenta.

**O borrão de movimento está no quadro.** Se o assunto estava se mexendo durante a exposição, todo quadro daquele movimento está borrado, e não existe ali dentro um quadro nítido para achar. Filmar com velocidade de obturador mais alta é o único conserto, e ele tem que acontecer antes da gravação.

**A compressão também está no quadro.** Vídeo é comprimido bem mais forte que uma fotografia, e mais forte ainda nos quadros entre quadros-chave. Se uma imagem sai quadriculada, tente andar um ou dois quadros para qualquer lado: um quadro-chave é guardado inteiro e costuma ficar visivelmente mais limpo que os vizinhos.

E se a imagem precisar de outro tamanho ou outro formato depois, faça isso como um passo separado: o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) redimensiona, recorta e converte, e [o guia dele](https://abox.tools/pt/guias/redimensionar-uma-imagem/) conta o que cada uma dessas coisas custa.

## Por que isso não precisa de envio

Decodificar vídeo dentro de um navegador é recente e é real: o WebCodecs expõe o mesmo decodificador de hardware que o seu celular usa para tocar vídeo. O trabalho acontece na máquina que já tem o arquivo, o que para um vídeo de vários gigabytes é também o único arranjo que faz sentido — subir uma hora de 4K para receber de volta uma imagem de 8 MB é um mau negócio em todas as direções.

A ferramenta aqui não tem função de rede de espécie alguma, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. Desligue a internet e extraia um quadro assim mesmo, se você prefere conferir a acreditar.

[É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) reúne mais três checagens que você pode fazer em qualquer ferramenta.
