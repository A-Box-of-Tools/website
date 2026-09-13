# Como comprimir uma imagem para um tamanho de arquivo exato

Alguém passou um número para você, seja 100 KB, 500 KB ou 2 MB, e a sua foto está longe dele. Aqui está o que esse número custa, em que vale gastá-lo, e como saber se o resultado ainda está bom o bastante para mandar.

[Abrir Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), jogue a foto dentro, digite o número que passaram para você e clique no botão. Ele codifica a imagem várias vezes, fica com o melhor resultado que cabe abaixo do seu alvo e diz quanto isso custou. Para a maioria das fotografias e a maioria dos alvos, o resumo honesto é que você não vai conseguir ver diferença.

O resto desta página é para quando não é isso que acontece: quando o resultado sai borrado, quando um PNG quase não se mexe, ou quando você quer saber o que a ferramenta está de fato fazendo com a sua imagem antes de mandá-la para alguém.

![O cartão do alvo: 200 kB digitados, botões com os limites mais comuns, um menu de formato e uma nota com o que a ferramenta vai tentar.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Diga o número que te deram. Tudo abaixo é a ferramenta trabalhando na direção dele, em vez de você chutando num controle de qualidade.

## O que um limite de tamanho está realmente pedindo

Um JPEG ou um WebP não guarda a sua fotografia. Guarda uma descrição dela, e o ajuste de qualidade decide o quanto essa descrição pode ser detalhada. Abaixe o ajuste e o arquivo diminui porque a descrição fica mais vaga: texturas finas viram média, gradientes ganham faixas e as bordas pegam uma leve auréola de blocos.

Ou seja, um limite de tamanho é um orçamento de detalhe. A pergunta útil não é “consigo chegar a 500 KB?”, porque você sempre consegue chegar a qualquer número. A pergunta é quanto da imagem você precisa entregar para chegar lá, e se isso importa para o que você vai fazer com ela.

Duas regras de bolso. Uma fotografia de uma cena real, com rostos, folhagem e tecido, esconde bem a compressão, porque o olho não tem nenhuma área perfeitamente lisa onde perceber o estrago. Já uma captura de tela, um gráfico, uma logomarca ou qualquer coisa com grandes áreas de cor chapada e bordas duras de texto mostra o estrago na hora, e em geral deveria ser um PNG ou um WebP, e não um JPEG.

## Por que não existe fórmula, e o que fazer a respeito

Não tem como calcular o ajuste de qualidade que produz um arquivo de 500 KB. A relação entre os dois depende inteiramente do que está na imagem: no mesmo ajuste, a foto de uma parede lisa pode sair com um décimo do tamanho da foto de uma floresta. Toda ferramenta que oferece “qualidade: 60” e torce está chutando no seu lugar.

O único método confiável é tentar. Codificar a imagem, olhar o tamanho, ajustar, codificar de novo. Fazer isso na mão é chato, e é por isso que os compressores pedem um número de qualidade: assim a chatice passa a ser sua. Fazer automaticamente dá umas oito codificações, e oito codificações de uma foto de celular são uma fração de segundo em qualquer computador feito nesta década. Por isso a ferramenta deste site pede o tamanho e faz a busca sozinha.

Todo tamanho que ela informa é um arquivo codificado de verdade, não uma estimativa. Isso importa quando o formulário tem um limite rígido, porque uma estimativa 2% otimista é um envio recusado.

## Gaste qualidade antes de gastar pixels

Só existem dois jeitos de deixar um arquivo de imagem menor. Você pode descrever a mesma imagem com menos precisão, que é qualidade. Ou pode descrever menos pixels, que é redimensionar. Não são equivalentes, e a ordem importa.

Qualidade vem primeiro, porque os primeiros 30% mais ou menos de redução de qualidade são genuinamente invisíveis numa fotografia: você está jogando fora detalhe que o formato guardava com mais cuidado do que qualquer olho consegue conferir. Pixels vêm depois, porque assim que a qualidade cai o bastante para os artefatos aparecerem, uma imagem menor com qualidade decente fica melhor do que uma imagem em tamanho cheio que foi arruinada. Menos pixels bons ganham de mais pixels ruins.

Essa é a estratégia inteira, e vale saber mesmo que você use outra ferramenta: baixe a qualidade até começar a ficar errado e então diminua a imagem, em vez de baixar mais ainda.

### Quando redimensionar de propósito

Às vezes os pixels nunca foram necessários. Uma foto de 4000 pixels de largura exibida numa coluna de 600 pixels numa página web carrega seis vezes o detalhe que alguém vai ver. Se você sabe onde a imagem vai morar, redimensione para lá primeiro e o problema de tamanho muitas vezes some sem gastar qualidade nenhuma. O [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) é a ferramenta para esse trabalho, e [o guia dele](https://abox.tools/pt/guias/redimensionar-uma-imagem/) trata de escolher um tamanho.

## Escolhendo um formato

Três formatos valem a pena conhecer, e o navegador sabe escrever os três.

- **JPEG** é para fotografias. É com perdas, é entendido por tudo o que já foi fabricado, e para uma imagem de cena real continua sendo uma excelente escolha. Não guarda transparência.
- **WebP** é para o mesmo trabalho, feito melhor: de 25% a 35% menor que o JPEG numa qualidade que você não distingue, e mantém a transparência. Todo navegador atual lê. Alguns programas de computador mais antigos e alguns formulários de envio corporativos ainda não leem, e esse é o único motivo real para não usar.
- **PNG** é sem perdas, o que significa que é exato e é grande. É a resposta certa para capturas de tela, logomarcas, desenho de traço e qualquer coisa com bordas nítidas ou cor chapada, e a resposta errada para uma fotografia.

Se quem pediu o arquivo não impôs restrição nenhuma, o WebP leva você até o alvo com menos estrago visível que o JPEG. Se o arquivo vai entrar em algo antigo, ou num sistema que você não tem como testar, o JPEG é a resposta segura.

## Por que o seu PNG não vai ficar muito menor

Esta é a surpresa mais comum, e não é um defeito da ferramenta que você está usando. PNG é um formato sem perdas: ele guarda os pixels exatos e não tem botão de qualidade para girar, porque girar um faria dele outro formato. Tudo o que um compressor de PNG pode fazer é empacotar os mesmos pixels de forma mais esperta, o que costuma render alguns por cento.

Então, se você precisa de um arquivo bem menor e ele tem que continuar PNG, a única alavanca que sobra é o tamanho: menos pixels, ou menos cores. Se ele pode deixar de ser PNG, a pergunta é o que tem dentro:

- **Uma fotografia salva como PNG.** Muito comum, quase sempre por acidente, e a vitória mais fácil desta página: converter para JPEG ou WebP costuma deixar o arquivo de cinco a dez vezes menor sem mudança visível.
- **Uma captura de tela ou um diagrama.** Converta para WebP, que também é sem perdas quando você pede, e em geral é menor que o PNG para os mesmos pixels. Ir para JPEG deixa as bordas do texto borradas.
- **Uma logomarca com transparência.** O WebP mantém a transparência, e o JPEG vai preenchê-la com uma cor sólida, o que quase nunca é o que você queria.

## Como saber se o resultado está bom o bastante

Olhar a miniatura não prova nada, porque em tamanho de miniatura tudo parece ótimo. Duas verificações melhores:

**Olhe em tamanho cheio, na coisa mais lisa do quadro.** Céu, pele, uma parede pintada. O estrago da compressão aparece primeiro em gradientes suaves, como blocos ou faixas de leve, muito antes de encostar nas áreas detalhadas.

**Leia a medição, quando a ferramenta tiver uma.** O compressor daqui decodifica o próprio resultado, compara com o original e informa o SSIM: um número que compara brilho, contraste e estrutura locais em vez de contar pixels alterados, o que chega bem mais perto daquilo que incomoda o olho. Acima de mais ou menos 0,98 as duas imagens são difíceis de separar lado a lado. Abaixo de uns 0,95, olhe antes de mandar. Ele também informa o PSNR, a tradicional medida em decibéis, para quem preferir.

Os dois são calculados no seu próprio computador e aparecem para você, e é esse o motivo de existirem: eles transformam “perda mínima de qualidade” de uma afirmação num número que você pode conferir.

![Uma linha de resultado com o original em 1,4 MB e a cópia comprimida em 196 kB, a qualidade que chegou lá e um link para comparar as duas.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

O que saiu de verdade, ao lado do que entrou. O link de comparação é como você descobre se o número custou algo que dá para ver.

## Três coisas que vale saber antes de mandar o arquivo

**Comprimir apaga os metadados.** Recodificar significa decodificar a imagem em pixels e codificar esses pixels de novo, e um canvas cheio de pixels não carrega etiqueta nenhuma, então a posição de GPS, o modelo da câmera, os horários e o resto simplesmente não são escritos no arquivo novo. Em geral isso é um bônus. Se você queria as etiquetas fora mas a imagem intacta, esse é outro trabalho: o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) reescreve o contêiner sem recomprimir nada, e [o guia dele](https://abox.tools/pt/guias/remover-dados-exif-e-gps/) explica o que tem lá dentro.

**Nunca comprima o mesmo arquivo duas vezes.** Cada codificação com perdas joga detalhe fora em definitivo, e codificar uma imagem já comprimida joga fora mais ainda, além de preservar fielmente os artefatos da primeira passada às custas de detalhe de verdade. Volte sempre ao original e comprima uma vez só.

**Guarde o original.** Não existe volta de uma codificação com perdas. Seja lá o que você mandar, guarde em algum lugar o arquivo de onde partiu.

## Nada disso precisa de envio

Todo navegador já vem há anos com um codificador de JPEG, PNG e WebP, que é o mesmo código que salva uma imagem a partir de um canvas. Comprimir uma imagem é um dos trabalhos que não têm motivo técnico nenhum para envolver um servidor, e é por isso que a ferramenta daqui não tem um. A imagem é decodificada, codificada e medida no seu próprio computador, e não existe na `Content-Security-Policy` da página nenhum endereço deste site para onde ela pudesse ser mandada.

O jeito mais simples de confirmar isso, aqui ou em qualquer outro lugar, é carregar a página, desligar a internet e comprimir alguma coisa assim mesmo. Se continuar funcionando, nada estava sendo enviado. O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações do mesmo tipo.
