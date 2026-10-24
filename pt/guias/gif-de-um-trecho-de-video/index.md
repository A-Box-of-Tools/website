# Como fazer um GIF de uma parte de um vídeo

Um GIF feito do clipe inteiro é enorme, e quase tudo dentro dele ninguém queria ver. O trabalho são, na verdade, duas decisões: primeiro quais segundos, depois quais ajustes. As duas acontecem no seu próprio computador, porque nenhuma das duas ferramentas envia nada.

Última atualização 13 de outubro de 2026

## A resposta curta

Para um único momento contínuo, abra o conversor de [Vídeo para GIF](https://abox.tools/pt/video-para-gif/), solte o vídeo e marque o trecho na linha do tempo dele: só é convertido o que fica entre as marcas, então não há nada para cortar antes. Escolha largura e quadros por segundo, e exporte.

Para vários momentos, como dois gols ou preparação e desfecho, monte primeiro o clipe com o [Cortador de vídeo](https://abox.tools/pt/aparar-video/). Ele pode juntar partes compatíveis copiando se os inícios posteriores caírem em quadros-chave. Outras seleções precisam do método exato indicado, que recodifica a imagem. Confira essa escolha antes de exportar para o conversor.

A passagem é um clique: assim que o cortador exporta, uma linha sob o botão de download oferece levar o resultado direto para o conversor, e o clipe chega lá já carregado — nada de salvar e soltar de novo no meio do caminho.

Nos dois casos a ordem é a mesma: decidir os segundos primeiro, gastar os ajustes depois. O resto desta página explica por que essa ordem importa muito mais para um GIF do que para qualquer outra coisa que este site produz.

## Mostre o problema e a ação que o causou

Para um relato de erro, comece antes do clique ou gesto, não só no resultado incorreto, e termine quando houver tempo de reconhecê-lo. Uma captura de três segundos a 480 pixels e 12 quadros por segundo serve para começar; texto pequeno pode precisar de mais largura. Desative pontilhamento para cores planas de interface e veja o GIF exportado no tamanho do rastreador de problemas.

O mesmo corte explica uma etapa de artesanato ou interação com produto que se entende melhor vendo. Mantenha a mão ou cursor que dá contexto e use uma única seção do conversor se bastar. Se depender de palavras faladas, use vídeo curto: GIF não leva som. Para etapas separadas, monte primeiro e confira todas as junções antes de converter.

## Por que cada segundo de GIF custa tão caro

GIF não é vídeo. É uma pilha de imagens completas, cada uma tirada de uma paleta de no máximo 256 cores, comprimida com um método de 1987 que não sabe nada de movimento. Um codec moderno descreve o que *mudou* entre quadros; um GIF em grande parte repete o que ficou igual.

A consequência prática: um GIF de dez segundos, 480 pixels de largura, a 12 quadros por segundo, pesa normalmente de 5 a 10 MB, dez vezes o mesmo clipe em MP4, com uma fração da qualidade. O conversor não tem culpa; o formato é assim. O [guia de conversão para GIF](https://abox.tools/pt/guias/transformar-um-video-em-gif/) cobre quando um GIF ainda vale a pena e quando um vídeo mudo em loop serve melhor.

Como o tamanho cresce a cada quadro, os megabytes mais baratos de economizar são segundos inteiros. Reduzir a largura à metade divide o tamanho mais ou menos por quatro; reduzir os quadros à metade divide mais ou menos por dois; mas cortar imagens que nunca deviam estar ali economiza o custo inteiro delas e melhora o resultado: um GIF que começa na ação se lê melhor do que um que gasta dois segundos andando até ela.

## Quando a linha do tempo do conversor basta

A linha do tempo do conversor marca um trecho: um começo, um fim, e tudo que fica no meio vira o GIF. Se o momento que você quer é contínuo, dure o que durar, esse é o trabalho todo, e colocar o cortador na frente só daria uma segunda casa às mesmas duas marcas.

Marque um tiquinho mais apertado do que folgado. Um loop esconde a costura quando o último quadro fica perto do primeiro, e cada quadro raspado das pontas volta em tamanho de arquivo.

![O cartão da seção: um quadro de vídeo com código de tempo, e pontos de entrada e saída marcados aos onze e aos catorze segundos na barra de baixo.](https://abox.tools/screens/make-a-gif-from-part-of-a-video/marks.webp)

O conversor tem os próprios pontos de entrada e saída, e para um pedaço de três segundos de um clipe maior eles bastam sozinhos.

## Quando cortar antes com o Cortador de vídeo

O cortador ganha o lugar dele assim que o GIF precisa de mais de um pedaço:

- **Vários momentos, um GIF.** Marque cada parte com `I` e `O` durante a reprodução, ordene se o melhor deve vir primeiro e exporte um arquivo. Escolha Copiar só se esses inícios posteriores forem permitidos; senão, o método exato e sua recodificação.
- **Dois vídeos, um GIF.** O cortador aceita mais de um arquivo e junta partes marcadas de um e de outro: copia quando os arquivos combinam no formato, recodifica quando não combinam, e diz qual das duas coisas fez.
- **Você quer o clipe também como vídeo.** O MP4 montado vale guardar: é menor e mais nítido do que qualquer GIF que sair dele, e é a coisa certa para postar onde vídeo toca.

Adicione o clipe montado ao conversor sem marcar nada: tudo é a sequência prevista. Se for rejeitado por ajustes de reprodução, salve um vídeo novo com eles aplicados em um editor local. Não contorne a rejeição: material oculto não deve reaparecer no GIF. Como não leva áudio, omita no corte intermediário para evitar ajustes de reprodução de som.

## Gastando os ajustes

Com os segundos decididos, três controles definem o tamanho, em ordem do quanto custam:

- **Largura.** A maior alavanca. 480 pixels sobram para um chat ou um fórum; 320 ainda se lê bem em gravações de tela sem texto. O tamanho cai com o quadrado da largura.
- **Quadros por segundo.** De 10 a 12 é onde a maioria dos GIFs mora; o movimento ainda se lê, e o arquivo cai pela metade contra 25. Abaixo de 8 começa a parecer uma apresentação de slides.
- **Pontilhado (dithering).** Com 256 cores, degradês suaves viram faixas. O pontilhado ordenado troca as faixas por um padrão fino; costuma ficar melhor e comprimir um pouco pior. Exporte dos dois jeitos: quem trabalha é o seu computador, então uma segunda tentativa não custa nada e não envia nada.

## Se você faz isso toda semana

Os dois passos morarem aqui em duas páginas é de propósito: cada página faz um trabalho, e cada uma consegue provar sozinha que nada sai do seu computador. Mas tudo que as duas executam é código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências com um README que nomeia cada um.

Então, se essa mesma sequência faz parte da sua semana, não precisa percorrê-la na mão toda vez. Aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para compor a lógica de trechos do cortador e o codificador de GIF numa página só, do jeito do seu caso. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
