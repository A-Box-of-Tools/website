# Como separar um GIF em quadros

Tirar os quadros custa um arrastar e um botão. O que vale entender é o que é de fato um “quadro” de GIF, porque o formato guarda uma coisa bem diferente do que você vê — e é dessa diferença que sai o seu décimo quarto quadro, um retângulo com a boca de alguém dentro.

[Abrir Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/): Cada quadro sai no próprio PNG.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/), solte o GIF lá dentro, e cada quadro aparece como um PNG para baixar — um por um, ou todos num ZIP só. Deixe as opções como estão e você recebe exatamente o que quase todo mundo quer dizer: cada quadro como a imagem inteira, do jeito que ela está naquele momento da animação.

O resto desta página é sobre as três coisas que surpreendem depois: um quadro que é só um pedacinho, uma transparência que fica preta em outro lugar, e os tempos, que deixam de existir assim que os quadros viram arquivos separados.

## O que é um quadro de GIF de verdade

Um GIF não é uma pilha de imagens. É *uma* imagem, seguida de uma série de remendos.

Cada quadro depois do primeiro guarda só o retângulo que mudou, junto com uma regra sobre o que fazer com a tela em seguida. Todo o resto na tela é simplesmente o que os quadros anteriores deixaram ali. Uma pessoa falando na frente de uma parede parada custa um retângulo de rosto por quadro em vez de uma imagem inteira por quadro, e essa é a razão inteira de um formato sem compensação de movimento e sem etapa com perda não ser completamente inútil.

Ou seja, existem duas respostas diferentes, e igualmente honestas, para “me dá o quadro 14”, e a ferramenta oferece as duas:

**O quadro como ele aparece.** A imagem inteira naquele momento: o quadro 14 desenhado por cima de tudo o que veio antes. É o padrão, e é o que você quer para uma folha de contato, uma miniatura, uma imagem para postar, ou quadros que vão para um editor de vídeo.

**Só os pixels que aquele quadro guarda.** O remendo em si, no tamanho dele, na posição dele, com tudo o que ele não carrega deixado transparente. O quadro 14 pode ser ⁦60 × 40⁩ pixels de boca. Essa é a visão que explica para onde foram os bytes do GIF, e é a que você quer se estiver editando a animação em vez de colher imagens dela.

Não há nada de errado com o seu arquivo quando um quadro guardado parece um fragmento. Aquilo é o arquivo.

![Doze quadros numerados de uma animação, cada um mostrado como imagem inteira com o tempo em que fica na tela.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Cada quadro como imagem inteira, que não é o que está no arquivo: esta seção trata da diferença.

## A regra de descarte, e por que alguns quadros deixam buracos

Todo quadro carrega também uma de quatro instruções sobre o que acontece com o retângulo dele antes de o próximo quadro ser desenhado. A ferramenta mostra isso embaixo de cada quadro na visão do que está guardado:

**Fica na tela.** A comum. O remendo fica onde caiu e o quadro seguinte desenha por cima.

**Limpa a área dele depois.** O retângulo é apagado antes de o próximo quadro chegar. É o que faz uma animação com um objeto transparente em movimento, e é também a causa clássica dos GIFs que piscam.

**Devolve o que estava embaixo.** A tela volta a ser o que era antes deste quadro desenhar — um carimbo, e depois um desfazer. Rara, e a que mais leitores caseiros de GIF erram.

Um detalhe que vale saber se você compara ferramentas: a especificação diz que “limpa a área dele” deveria devolver a *cor de fundo*, mas todo navegador desde os anos 1990 limpa para *transparente*, porque era isso que as animações da época supunham. Esta ferramenta segue os navegadores de propósito, para que os quadros que você recebe sejam os quadros que você viu.

![O cartão de ajustes: a escolha entre o quadro como ele aparece e o remendo cru guardado no arquivo, com uma cor de fundo para as partes transparentes.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

O modo como aparece repete as regras de descarte e te entrega imagens. O outro te entrega o que está de fato no arquivo, buracos inclusive.

## O que acontece com a transparência

A transparência do GIF é um bit. Um pixel ou está pintado ou está invisível, e não existe meio-termo — nada de bordas suaves, nada de sombras parciais. É por isso que um GIF com fundo transparente tem aquele contorno duro e meio serrilhado.

O PNG guarda exatamente isso, sem perda, então os quadros saem com a transparência intacta e nada é inventado. Mantenha se os quadros vão para algum lugar que entende de transparência.

Preencha com uma cor se não for o caso. Programa que ignora canal alfa costuma desenhar preto, então um quadro que estava ótimo no navegador chega com fundo preto — e um remendo guardado, que é transparente em quase toda a área, chega como um retângulo preto com uma boca dentro. Escolher a cor antes resolve. Ela fica escrita no PNG e não tem como desfazer depois, que é a única razão de não ser o padrão.

## Os tempos, que os quadros não conseguem carregar

Um PNG não tem onde anotar quanto tempo ficou na tela. Separe uma animação em PNGs e os tempos somem, o que importa no instante em que você quer montar tudo de novo.

É para isso que serve o `frames.txt` dentro do ZIP. Ele lista o atraso, a posição e o tamanho de cada quadro, para a animação poder ser reconstruída no [Criador de GIF](https://abox.tools/pt/criar-gif/) ou em qualquer outro lugar. Custa uns poucos kilobytes e não existe jeito de reconstruir isso depois.

Duas coisas sobre os atrasos do GIF que pegam todo mundo:

**A unidade é o centésimo de segundo**, então o passo mais fino que o formato tem é 0,01 s. Não existe GIF de exatamente 30 fps; 0,03 s por quadro dá 33,3 fps e 0,04 s dá 25.

**Qualquer coisa abaixo de 0,02 s toca a 0,10 s.** Os navegadores limitam isso desde os anos 1990 — uma regra escrita para os globos girando daquela época e nunca removida. Um GIF cujo arquivo diz 0,01 s por quadro alega 100 fps e toca a 10. A ferramenta mostra o atraso do jeito que ele realmente toca, e diz ao lado o que o arquivo guarda quando os dois divergem, porque essa diferença é a razão de um GIF que você separou e montou de novo poder sair mais lento que o original.

## Os números dos quadros, e por que eles têm zeros na frente

Os quadros saem como `nome-001.png`, `nome-002.png`, numerados a partir de um e preenchidos até a largura do último número. Isso não é enfeite: `quadro9.png` vem *depois* de `quadro10.png` em qualquer gerenciador de arquivos e na maioria dos programas que importam uma sequência, porque eles ordenam texto e não número. Nomes preenchidos ordenam certo em todo lugar, e todo editor de vídeo que importa uma sequência de imagens espera desse jeito.

Afinar uma animação longa com “fique com um quadro a cada dois” não renumera nada. O quadro 42 continua se chamando 42, então os arquivos batem com o original e com a lista de tempos.

## Por que isso não precisa de servidor

Ler um GIF são dois trabalhos: andar pelos blocos do arquivo e desfazer a compressão LZW em que os pixels dele estão embrulhados. Juntos dão umas poucas centenas de linhas, estão escritos por extenso no repositório, e rodam na sua própria máquina — que é por isso que a página continua funcionando com a rede desligada.

O seu navegador já sabe tocar um GIF, mas não entrega as peças: um `<img>` dá uma animação, desenhar um numa tela dá o primeiro quadro para sempre, e a única API que faz mais não existe no Safari. Então aqui o formato é lido por conta própria, do mesmo jeito em todo navegador — e ler por conta própria é também o que torna possível mostrar os remendos e as regras de descarte.

[É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) reúne quatro checagens que dizem a mesma coisa sobre qualquer ferramenta, esta inclusive.
