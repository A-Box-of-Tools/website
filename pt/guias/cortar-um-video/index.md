# Como cortar um vídeo para outro formato de tela

Cortar muda o formato da imagem, o que significa escrever quadros novos. Não tem como escapar disso, e qualquer ferramenta que afirme o contrário está fazendo outra coisa. Aqui está o que isso custa, e como gastar bem.

[Abrir Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Cortador de vídeo](https://abox.tools/pt/cortar-video/), jogue o clipe dentro, arraste a caixa sobre a parte que quer manter, ou trave numa proporção se passaram uma para você, e exporte. O clipe que sai tem exatamente a mesma duração do que entrou, com a temporização e o som intactos.

Ao contrário de aparar, este trabalho precisa escrever quadros novos. Isso não é uma deficiência de uma ferramenta específica, é o que cortar é. O resto desta página trata do que isso custa e de como manter o custo baixo.

## Por que cortar não consegue evitar uma recodificação

Aparar mantém quadros inteiros, então um bom aparador move os quadros intocados e nada é decodificado. Cortar mantém parte de cada quadro, e parte de um quadro é outra imagem. Não tem como guardar outra imagem sem escrever os pixels de novo.

Existe uma exceção estreita, e vale conhecê-la para você reconhecer quando alguém a invoca. Vídeo é codificado em blocos, e se um corte caísse exatamente nas fronteiras de bloco nos quatro lados, parte dos dados poderia em princípio ser reaproveitada. Na prática, as dimensões do próprio quadro, os vetores de movimento e a predição precisam ser reescritos de qualquer jeito, então nada de verdade é construído assim. Presuma que um corte significa uma recodificação.

O que um cortador bem-comportado faz é não gastar *mais* do que o original gastava naquela mesma área. Codificar uma região cortada com uma taxa de bits maior que a da origem só deixa o arquivo maior, e não devolve detalhe que o original não tinha.

![O cartão de exportação: um menu de formato, um controle de qualidade, uma chave para manter o som e um resumo com o tamanho de saída, quanto do enquadramento fica e a duração.](https://abox.tools/screens/crop-a-video/export.webp)

Esse cartão existe porque a imagem precisa ser recodificada. O resumo é a ferramenta dizendo o custo disso antes de fazer.

## Os formatos que estão realmente pedindo isso de você

A maior parte dos cortes é feita porque algum lugar exige uma proporção de tela. A lista curta:

- **9:16, em pé.** Stories, reels, shorts, TikTok. Tela cheia num celular segurado normalmente. É o motivo mais comum para alguém cortar um vídeo.
- **1:1, quadrado.** Publicações de feed em várias plataformas. Funciona de qualquer jeito que a pessoa esteja segurando o celular, e é por isso que persiste.
- **4:5, levemente em pé.** O maior formato que alguns feeds permitem, então ocupa mais tela que um quadrado sem ser um vídeo vertical inteiro.
- **16:9, deitado.** O padrão de vídeo em geral. Em geral você corta *para* ele só para tirar tarjas pretas, ou *a partir* dele para chegar a um dos formatos acima.

Trave a caixa na proporção em vez de arrastar no olho. Errar por alguns pixels significa que a plataforma vai cortar o seu corte, e ela não vai consultar você sobre onde.

![O cartão de corte: um quadro do vídeo com uma moldura quadrada no meio e campos numéricos com esquerda, topo, largura e altura.](https://abox.tools/screens/crop-a-video/box.webp)

A moldura se arrasta ou se digita, e os números dizem exatamente o que fica. Um quadrado tirado de um clipe panorâmico é o pedido mais comum.

## Transformando um clipe deitado em vertical

Este é o caso comum mais difícil, e vale deixar claro que cortar é um arranjo, não uma solução.

Um vídeo 16:9 cortado para 9:16 mantém cerca de 32% da largura da imagem. O que estiver nas laterais some, e numa tomada deitada as laterais costumam ser onde está o contexto. Se duas pessoas conversam em lados opostos do quadro, corte nenhum mantém as duas.

Escolha o corte assistindo ao clipe uma vez e perguntando onde o assunto de fato está na maior parte do tempo. Se a resposta for “ele se mexe”, um corte estático é a ferramenta errada e o que você quer é um editor que consiga movimentar o corte ao longo do tempo. Se a resposta for “no centro, na maior parte”, um corte centralizado resolve e leva dez segundos.

A alternativa que vale lembrar: muitas plataformas aceitam um vídeo deitado e colocam as tarjas por conta própria. Cortar é para quando você quer a tela cheia, não para quando você quer que o vídeo seja aceito.

## Por que a largura e a altura andam de dois em dois

Se você notar que a caixa de corte recusa números ímpares, é o codec sendo difícil, não a interface.

O H.264, que é o codec dentro de um MP4, guarda a cor em metade da resolução na horizontal e na vertical, porque o olho é muito menos sensível a detalhe de cor do que a detalhe de brilho. Isso significa que a imagem é tratada em unidades de dois pixels e não tem como descrever um quadro com um número ímpar de pixels num lado.

As ferramentas lidam com isso arredondando o seu corte depois que você o define, o que move a sua caixa em um pixel sem avisar, ou oferecendo apenas números pares desde o começo. É a segunda coisa que acontece aqui.

## O que acontece com o som

Nada, no caminho do MP4. Cortar muda a imagem e não tem motivo para encostar no áudio, então o áudio é copiado amostra por amostra sem nunca ser decodificado, byte a byte igual ao que estava no arquivo.

No recuo por gravação, descrito abaixo, o som é capturado da reprodução e codificado de novo, o que custa um pouco de qualidade. De todo jeito existe uma caixinha para deixá-lo de fora por completo, que vale usar quando o clipe vai para um lugar que toca sem som mesmo e você quer o menor arquivo possível.

## Formatos, e quanto tempo leva

**MP4, M4V e MOV** são lidos diretamente, seja lá o que houver dentro deles, seja H.264, HEVC, AV1 ou VP9, desde que o seu navegador saiba decodificar aquele codec. Ao contrário de aparar, cortar precisa decodificar, então aqui o codec importa de um jeito que lá não importa.

**Qualquer outra coisa que o seu navegador consiga tocar**, e aí o caso mais óbvio é o WebM, é cortada tocando o arquivo e gravando o resultado, o que funciona e leva o mesmo tempo que o clipe dura.

**AVI, WMV, FLV e a maioria dos MKVs** o navegador não consegue nem ler nem tocar, e a ferramenta os recusa com uma mensagem em vez de falhar no meio do caminho.

Espere que um corte leve tempo de verdade num clipe longo, porque cada quadro está sendo decodificado e recodificado. A ferramenta não tem limite embutido, e o arquivo é percorrido em fatias de alguns megabytes em vez de ser carregado inteiro. O teto prático é o vídeo pronto, que é montado na memória antes de você baixar.

## Corte depois de tudo o mais

Se um clipe precisa ser aparado e cortado, apare primeiro, porque isso é de graça e cada segundo que você tira é um segundo que ninguém precisa recodificar. Depois corte o clipe mais curto uma vez.

Ao contrário, significa cortar imagens que você está prestes a jogar fora, o que custa tempo e qualidade à toa. O [Aparador de vídeo](https://abox.tools/pt/aparar-video/) fica ao lado, e [o guia dele](https://abox.tools/pt/guias/aparar-um-video/) explica por que aquela etapa não precisa custar nada a você.

De forma mais geral: toda etapa com perdas se acumula. Um corte de um original é uma geração. Um corte de uma aparada de uma exportação de um download são quatro, e dá para ver.

## Por que isso não precisa de envio

Decodificar e recodificar vídeo num navegador é coisa recente e é coisa de verdade: o WebCodecs expõe o mesmo codificador de hardware que o seu celular usa para gravar vídeo, e é rápido pelo mesmo motivo. O trabalho acontece no computador que já tem o arquivo, o que, para um vídeo de vários gigabytes, também é o único arranjo que faz sentido, já que enviá-lo e baixar o resultado custa mais tempo do que a codificação.

A ferramenta daqui não tem função de rede de espécie alguma, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site. Se você prefere conferir a acreditar, desligue a internet e corte um clipe assim mesmo.

O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações que você pode fazer em qualquer ferramenta.
