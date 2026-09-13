# Como digitalizar um documento com o celular

Alguém pediu que você “digitalize e devolva” um formulário, e você tem um celular e não tem digitalizador. A distância entre a fotografia de uma página e uma digitalização dela é menor do que parece, e não é sobretudo a inclinação — isto é o que de fato as separa, e o que fazer com cada parte.

[Abrir Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/): Fotografe a página. Você recebe de volta algo com cara de digitalização.

Última atualização 26 de agosto de 2026

## A resposta curta

Ponha a página sobre algo que não seja da mesma cor que ela, fique por cima, preencha o enquadramento, e tire uma fotografia. Depois abra o [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/), confira os quatro cantos que ele encontrou, escolha “cor, uniformizada” ou “preto e branco”, e salve o PDF.

O trabalho é esse. O resto explica o que cada um desses passos está corrigindo, porque saber qual parte faz o quê é o que permite dizer, em três segundos, se a coisa que você está prestes a mandar vai ser aceita.

## O que de fato separa uma foto de uma digitalização

Três coisas, e elas não têm o mesmo peso.

- **A inclinação.** Uma fotografia é tirada de onde você estava, então a página é um quadrilátero em vez de um retângulo. Esta é a que todo mundo nota e a mais fácil de desfazer.
- **A luz.** Um digitalizador arrasta uma luz uniforme pela página. Uma sala não: há uma mancha clara debaixo da lâmpada, um canto escuro longe dela, e muitas vezes a sua própria sombra sobre um dos lados. Esta é a que de fato faz uma fotografia parecer uma fotografia, e é a que as pessoas tentam corrigir com “contraste automático”, o que a piora.
- **O tamanho.** A fotografia de doze megapixels de uma página tem de três a cinco megabytes. Vinte delas são um documento que vai quicar na metade dos servidores de e-mail para onde for mandado.

## Tirando a foto

Cinco coisas, na ordem de quanta diferença fazem:

- **Preencha o enquadramento.** Esta é a única que não dá para corrigir depois. Detalhe que não estava na fotografia não está no arquivo, e uma página fotografada do outro lado da sala é uma página que ninguém consegue ler em resolução alguma. Chegue mais perto em vez de dar zoom: a menos que o celular troque para uma segunda lente mais longa, dar zoom é um recorte do mesmo sensor — ele joga fora exatamente os pixels que você está tentando guardar.
- **Ponha sobre algo de outra cor.** Uma página branca numa mesa branca quase não tem borda para nada encontrar — nem o programa, nem você, quando tiver de arrastar os cantos à mão. Uma mesa escura, um livro, um casaco: qualquer coisa.
- **Não fique entre a página e a luz.** A sua própria sombra sobre a página é de longe o motivo mais comum de uma digitalização feita no celular sair ruim. Gire noventa graus e ela some.
- **Deixe focar, e então fique parado.** O tremido não é recuperável por ferramenta alguma, e um foco perdido também não. Toque na página na tela, espere assentar, e então aperte o botão.
- **Ponha a página inteira dentro, cantos inclusive.** Não porque os cantos sejam preciosos, mas porque é neles que o endireitamento é medido. Uma página que sai pela borda do enquadramento ainda funciona — a borda da fotografia faz as vezes da borda da página — mas uma página com três cantos no enquadramento e um adivinhado é uma página que vai sair um pouco errada.

## Endireitar: por que a forma importa mais do que a inclinação

Desfazer a inclinação é um pedaço de aritmética bem compreendido. Quatro cantos de um retângulo vistos de qualquer lugar determinam a transformação que os repõe, e aplicá-la a cada pixel dá uma página plana. Qualquer ferramenta que diga endireitar uma página faz isso.

A parte que dá errado em silêncio é *que tamanho* a página plana deveria ter. O método óbvio é medir as bordas do quadrilátero e usar a proporção entre elas — e uma fotografia tirada de viés encurta a borda distante, então uma folha A4 sai visivelmente atarracada. Continua parecendo uma digitalização. Cada linha de texto nela simplesmente tem a altura errada, e nada na tela diz isso.

A resposta melhor é que a própria perspectiva carrega a informação: bastando que a câmera seja uma comum, a fotografia de um retângulo é suficiente para recuperar tanto as proporções verdadeiras do retângulo quanto a distância focal da câmera. O [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/) daqui faz isso, e depois lhe diz que forma a página saiu e se aquilo é uma folha padrão — então uma página que diz “1:1,41, que é a forma de um A4 ou de um A5” é uma página em que você pode parar de pensar.

![A foto de uma folha sobre uma mesa, tirada de lado, com um quadrilátero detectado desenhado sobre os cantos e alças para ajustá-los.](https://abox.tools/screens/scan-a-document-with-your-phone/corners.webp)

Os cantos, encontrados e depois arrastados se foram encontrados errado. Acertar neles é o que transforma uma foto em digitalização.

## A luz: dividir, não esticar

Aumentar o contraste de uma página com luz irregular deixa a parte clara branca e a parte escura preta, e o que está escrito na parte escura some junto. O problema nunca foi o contraste estar baixo demais. É que o papel não tem o mesmo brilho num canto e no outro, então não existe um único ajuste que sirva para a página inteira.

O que funciona é estimar o brilho do papel *em cada ponto* e dividir por ele. O papel é a maioria clara de qualquer pedacinho de uma página, então medir o brilho ao longo de uma grade de quadradinhos e pegar um valor alto em cada um dá a forma da luz — o texto é escuro e esparso demais para deslocá-la. Divida por isso e o que sobra é a tinta, com luz uniforme, sem a sombra e com o papel de volta ao branco.

É isso que “cor, uniformizada” e “tons de cinza” fazem. Escolha cor quando a cor faz parte do documento: um carimbo, uma assinatura em tinta azul, uma linha marcada, qualquer coisa sobre a qual alguém possa depois perguntar se era original.

![O cartão de limpeza: a página achatada, uma escolha de modos e um controle de intensidade.](https://abox.tools/screens/scan-a-document-with-your-phone/clean.webp)

A luz dividida em vez de esticada. Os modos vão de um clareamento leve até o preto e branco inteiro, e a seção de baixo diz qual usar e quando.

## Preto e branco, e por que o arquivo fica pequeno de repente

Uma página guardada como fotografia são milhões de pixels com dezesseis milhões de cores possíveis cada, e o codec gasta o seu esforço em degradês sutis que uma página de texto não tem. Uma página guardada em preto e branco é um bit por pixel — tinta ou papel — e comprime como a coisa esmagadoramente repetitiva que é.

A diferença não é pequena: nas mesmas páginas é algo como dezoito vezes. Um contrato de vinte páginas que chega a quinze megabytes como fotografias fica abaixo de um megabyte como páginas de um bit — que é a diferença entre um documento que cabe num e-mail e um que não cabe, e o motivo pelo qual todo digitalizador de escritório vem com isso por padrão.

O senão é que não há meios-tons: uma fotografia na página vira uma bagunça de pontinhos. Use para páginas impressas e escritas, que é o que a maioria dos documentos é, e use tons de cinza para qualquer coisa com uma imagem.

Um detalhe que vale a pena saber, porque explica por que uma ferramenta boa acerta onde uma ruim produz uma página com um canto preto: a decisão entre tinta e papel precisa ser tomada *localmente*. Um limiar único para a página inteira não funciona quando o papel na sombra é mais escuro do que a tinta na luz — e numa página fotografada ele muitas vezes é. Decidir cada pixel contra a média da sua própria vizinhança pequena é o que mantém legível a escrita dentro de uma sombra.

## Várias páginas, um documento

Fotografe as páginas na ordem, acrescente todas de uma vez, e elas viram as páginas de um só PDF na ordem em que foram acrescentadas. Duas coisas para ficar de olho:

- **Os nomes de arquivo não ordenam como você pensa.** `pagina2.jpg` vem depois de `pagina10.jpg` numa ordenação alfabética, porque a comparação é caractere por caractere. Confira a ordem na tira antes de salvar, e não no PDF depois.
- **A limpeza é um único ajuste para o documento inteiro**, e de propósito. Páginas limpas de formas diferentes parecem dois documentos grampeados juntos, que é exatamente a impressão que uma digitalização deve evitar. Escolha o modo que serve para a pior página.

## Antes de mandar

- **Abra o PDF.** Não a prévia — o arquivo. Cada página, do lado certo para cima, sem nada cortado numa borda.
- **Leia a menor coisa que há na página.** Um número de referência, uma data, um número de conta. Se você não conseguir ler na tela a 100%, a pessoa para quem você está mandando também não consegue.
- **Confira se os cantos não foram cortados.** O que fica na borda de um formulário é um número de página, uma linha de assinatura, ou o campo que alguém depois vai dizer que faltava.
- **Confira o que o documento diz sobre você.** Um PDF tem campos para o autor, o produtor e a data de criação, e a maioria das ferramentas os preenche. Se isso importa depende de quem vai receber, mas vale a pena saber que está lá.

## Por que nada disso precisa de um envio

Cada passo acima é aritmética sobre uma imagem que a sua própria máquina já decodificou: quatro cantos, uma transformação, uma divisão, um limiar, e um contêiner escrito byte a byte. Não há nada nisso que um servidor consiga fazer e um navegador não, e nada que precise de um modelo baixado para ser feito.

O que vale a pena pensar um instante, por causa do que estes arquivos são. As pessoas não fotografam páginas ao acaso. Elas fotografam um passaporte, um holerite, um contrato de aluguel, um formulário médico, um contrato — documentos com um nome, um endereço e um número de conta, sendo digitalizados justamente porque uma instituição pediu. Enviar um para um site para ter os cantos endireitados entrega a um estranho o documento inteiro. Veja [como saber se uma ferramenta precisa mesmo dos seus arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) para as quatro conferências que separam as ferramentas que precisam ver o seu arquivo das que simplesmente veem.
