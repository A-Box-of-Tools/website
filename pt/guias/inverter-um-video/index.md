# Como inverter um vídeo

Tocar um vídeo de trás para frente parece a edição mais simples que existe, e é justamente aquela para a qual um arquivo de vídeo é menos preparado. Isto é o que precisa acontecer de verdade, quanto custa, e o único passo que vale a pena dar antes.

[Abrir Inversor de vídeo](https://abox.tools/pt/inverter-video/): O último quadro primeiro, com som e tudo.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Inversor de vídeo](https://abox.tools/pt/inverter-video/), solte o vídeo lá dentro, decida se você quer o som invertido também, e exporte. O que sai é o mesmo vídeo com o último quadro na frente, com exatamente a mesma duração do que entrou.

Diferente do corte, aqui todo quadro precisa ser escrito de novo, e o som também. Isso não é falha de uma ferramenta específica; é o que inverter é. O resto desta página explica o porquê, e o que isso significa para o tempo que você vai ficar esperando.

## Por que um vídeo não pode simplesmente ser tocado de trás para frente

Um arquivo de vídeo não é uma pilha de fotos. Mais ou menos um quadro a cada cinquenta é uma imagem inteira — um *quadro-chave* — e tudo o que está entre eles é uma descrição do que mudou em relação aos quadros vizinhos. É por isso que uma hora de vídeo cabe num celular.

Isso quer dizer também que um decodificador só sabe ir para a frente. Para mostrar o último quadro de um vídeo, ele precisa achar o quadro-chave antes dele e decodificar tudo o que vem no meio. Peça o penúltimo e ele refaz o mesmo trabalho.

Por isso a inversão é feita um grupo por vez: decodificar um grupo para a frente, segurar os quadros, entregar ao codificador na outra ordem, ir para o grupo anterior. A alternativa óbvia — decodificar o vídeo inteiro numa lista e percorrer a lista de trás para frente — precisa de uns 3 MB de memória por quadro em 1080p, ou 5 GB por minuto, que é por isso que as ferramentas feitas assim caem em qualquer coisa mais longa do que uns poucos segundos.

![O cartão de origem: o nome do clipe, o tamanho, o tamanho do quadro, a duração e o codec.](https://abox.tools/screens/reverse-a-video/source.webp)

O que a ferramenta descobriu sobre o arquivo. Inverter é a única operação que não dá para fazer de passagem, então esses números decidem se cabe na memória.

## O que acontece com o som

É aqui que as ferramentas de inversão mais divergem, e é aqui que vale conferir o que você realmente recebeu.

O som é comprimido em pacotes de algumas dezenas de milissegundos, cada um codificado em cima do anterior. Escrever esses pacotes de trás para frente *não* toca uma trilha ao contrário: toca pedacinhos para a frente na ordem errada, o que soa como gagueira ou defeito, não como inversão. O único jeito de inverter som direito é decodificar a trilha inteira, pôr as amostras na ordem contrária e codificar de novo.

É isso que acontece aqui, e é por isso que o som é recodificado, enquanto o [Cortador de vídeo](https://abox.tools/pt/aparar-video/) e o [Recortador de vídeo](https://abox.tools/pt/cortar-video/) nunca encostam nele: esses trabalhos não mudam *quando* as coisas acontecem, e este não muda mais nada.

Se você quer a imagem ao contrário e nenhum som — que é a escolha comum para qualquer coisa que vá para um feed que toca mudo — desmarque a caixinha. É mais rápido, e o arquivo fica menor.

![O cartão de exportação: um controle de qualidade, uma chave para manter o som e um resumo com o tamanho de saída, a duração e o número de quadros.](https://abox.tools/screens/reverse-a-video/export.webp)

A chave do som está aqui porque fala ao contrário quase nunca é o que alguém queria, e é mais fácil decidir antes da exportação do que depois.

## O que custa à imagem

Uma recodificação. Os quadros saem numa ordem para a qual nada no arquivo original foi codificado, então cada um precisa ser escrito do zero.

O que uma ferramenta bem-comportada não vai fazer é gastar *mais* do que o original gastou. Um vídeo invertido tem exatamente as mesmas imagens do que chegou, então um bitrate maior não tem nada de novo para descrever: deixa o arquivo maior sem deixar a imagem melhor. O ajuste de qualidade aqui se move abaixo desse teto, e não acima.

Como sempre, as etapas com perda se acumulam. Inverter um original é uma geração. Inverter a exportação de um download de uma gravação de tela são quatro, e dá para ver.

## Corte primeiro, inverta depois

Se o vídeo precisa das duas coisas, corte antes. Cortar é de graça — um bom cortador passa quadros inteiros sem decodificar — e cada segundo que você tira é um segundo que ninguém vai ter que decodificar e codificar de novo.

Fazer ao contrário significa inverter imagem que você está prestes a jogar fora. Num vídeo longo, essa é a diferença entre um trabalho de poucos segundos e um de vários minutos. O [guia de corte](https://abox.tools/pt/guias/aparar-um-video/) explica por que esse primeiro passo não precisa custar qualidade nenhuma.

A mesma ordem vale para o recorte: corte, recorte, inverta, e você paga uma recodificação só, do vídeo mais curto possível.

## Para que as pessoas usam isso de verdade

- **A piada do rebobinar.** Alguma coisa cai, quebra ou espirra, e a inversão põe tudo de volta. Lê-se como piada porque imagem real tocada ao contrário é inconfundível: a fumaça se junta, a água sobe.
- **Boomerangs na mão.** Inverta um vídeo curto e emende no original com o [Cortador de vídeo](https://abox.tools/pt/aparar-video/); você fica com o laço de ida e volta sem o aplicativo que costuma fazer isso, e com a duração que você quiser em vez da dele.
- **Revelações.** Filme o estado final já pronto e inverta, para um prato montado virar ingredientes ou uma coisa montada se desmontar. É mais fácil de filmar do que a versão para a frente, e é justamente essa a graça.
- **Fala ao contrário.** Que só tem graça se o som estiver de fato invertido — veja acima.

## Formatos, e quanto tempo leva

**MP4, M4V e MOV** são lidos direto, seja lá o que tiver dentro — H.264, HEVC, AV1 ou VP9 — desde que o seu navegador saiba decodificar aquele codec. Esse é o caminho rápido: o arquivo é percorrido de trás para frente, um grupo de quadros por vez, na velocidade da sua máquina.

**Qualquer outra coisa que o seu navegador toque**, WebM à frente, é invertida fazendo o player do próprio navegador andar para trás pelo vídeo, um instante de cada vez. Funciona, e é mais devagar, porque cada um desses saltos obriga o navegador a decodificar a partir do quadro-chave anterior. A página avisa qual dos dois caminhos está usando, e por quê, antes de você começar.

**AVI, WMV, FLV e a maioria dos MKV** o navegador não consegue nem ler nem tocar, e a ferramenta recusa com uma mensagem em vez de falhar no meio do caminho.

De um jeito ou de outro, este é um dos trabalhos mais lentos deste site, porque todo quadro é decodificado e codificado e alguns são decodificados mais de uma vez. Um vídeo curto são segundos; um longo em 4K é daqueles de começar e deixar quieto.

## Por que isso não precisa de envio

Decodificar e recodificar vídeo dentro de um navegador é recente e é real: o WebCodecs expõe o mesmo codificador de hardware que o seu celular usa para gravar vídeo, e é rápido pelo mesmo motivo. O trabalho acontece na máquina que já tem o arquivo, o que para um vídeo grande também é o único arranjo que faz sentido: subir e baixar o resultado custa mais tempo do que a codificação.

A ferramenta aqui não tem função de rede de espécie alguma, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. Desligue a internet e inverta um vídeo assim mesmo, se você prefere conferir a acreditar.

[É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) reúne mais três checagens que você pode fazer em qualquer ferramenta.
