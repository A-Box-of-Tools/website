# O que tem de verdade dentro de um GIF

Um GIF é uma pilha de retângulos, cada um com um cronômetro e uma tabela de cor, e quase toda reclamação que as pessoas têm do formato vem de uma dessas três coisas. Aqui está o que cada parte faz, e como descobrir em qual delas o seu arquivo está gastando o tamanho.

[Abrir Analisador de GIF](https://abox.tools/pt/analisar-gif/): Quadros, tempos, paletas e para onde foi cada byte.

Última atualização 26 de agosto de 2026

## A resposta curta

Um GIF é uma tela, uma lista de retângulos para pintar em cima dela, e uma tabela de cor dizendo o que os números dentro desses retângulos significam. Cada retângulo carrega três coisas: por quanto tempo deixá-lo no ar, o que fazer com ele depois, e opcionalmente uma tabela de cor só dele.

Quase tudo o que surpreende as pessoas no formato sai dessa lista. Se o seu GIF está enorme, é porque os retângulos são a tela inteira toda vez, ou porque tem trezentas tabelas de cor lá dentro. Se ele toca devagar demais, é porque os atrasos estão abaixo de um piso que navegador nenhum atravessa. Se ele borra, é o campo chamado *descarte*.

Para ver qual dessas é a sua, num arquivo específico, abra o [Analisador de GIF](https://abox.tools/pt/analisar-gif/) e solte ele lá dentro. O resto desta página é o que os números querem dizer.

![O cartão de resumo de um GIF: a versão, o tamanho da tela, o tamanho do arquivo, o número de quadros, quantas vezes repete e quantas cores usa.](https://abox.tools/screens/whats-inside-a-gif/facts.webp)

Tudo o que um reprodutor nunca mostra, tirado de um arquivo.

## Quadros são retângulos, não imagens

Esta é a parte que surpreende quem só viu GIF tocando. Um quadro não é uma imagem da animação naquele momento. É um retângulo, com posição e tamanho próprios, pintado por cima do que os quadros anteriores deixaram.

Esse retângulo pode ser a tela inteira, e num arquivo mal feito ele sempre é. Mas um GIF tem permissão de guardar só a parte da imagem que mudou desde o último quadro — e onde quase toda a imagem está parada, essa é a diferença entre um arquivo de 12 MB e um de 900 KB. É por isso que a gravação de tela de uma janela quase estática pode ser pequena, e a mesma gravação saída de um conversor desleixado não é.

Olhando a animação você não descobre qual dos dois tem. Os dois parecem idênticos. O único jeito de ver é olhar o que cada quadro guarda, que é uma visão que o analisador tem exatamente por isso: coloque em *só o que cada quadro guarda* e você vê ou uma fileira de formas pequenas em fundo transparente, o que quer dizer que o codificador fez o trabalho dele, ou a imagem inteira de novo e de novo, o que quer dizer que não fez.

Não existe compensação de movimento em lugar nenhum do formato. Nada é guardado como “igual à vez passada, só que quatro pixels para a esquerda”, do jeito que um codec de vídeo faria. O truque do retângulo que mudou é a única economia que o GIF tem, e ela vale muito.

## Os atrasos, e o piso que todo navegador aplica

Cada quadro guarda por quanto tempo segurá-lo, em centésimos de segundo. É a única unidade que o formato tem, então o mais rápido que um arquivo pode pedir é 0,01 segundo — cem quadros por segundo — e o mais longo são uns 655 segundos.

Ele não vai receber cem quadros por segundo. **Todo navegador arredonda um atraso abaixo de 0,02 segundo para 0,10.** A regra foi escrita dentro do Netscape Navigator em 1996, para os globos girando e as plaquinhas animadas de “em construção” da época, e todo navegador desde então copiou. Ninguém nunca tirou, e ninguém vai tirar.

Então um GIF cujos quadros dizem todos 0,01 s toca a dez quadros por segundo, não a cem. Ele roda dez vezes mais devagar do que pretendia o que o fez, e o arquivo não dá pista nenhuma disso: os atrasos ali dentro são exatamente o que foi pedido. Essa é a surpresa mais comum do formato, e é por isso que o analisador informa duas durações — o que o arquivo diz, e o que um navegador vai fazer com ele de verdade.

O conserto, em qualquer programa que faça o arquivo, é escrever 0,02 em vez de 0,01. Isso dá 50 quadros por segundo, que é o teto real, e é mais rápido do que qualquer coisa precisa ser. Na prática 0,05 s — vinte quadros por segundo — já é quase o mais ágil que vale a pena pedir.

Mais uma coisa que os atrasos contam. Se são todos iguais, o arquivo foi feito de um conjunto de quadros a uma taxa fixa. Se estão espalhados — 0,04 aqui, 0,11 ali — alguma coisa converteu um vídeo e jogou quadros fora, esticando os vizinhos para cobrir os buracos. E se o último for bem mais longo que o resto, isso é de propósito: é assim que se faz uma animação pausar antes de recomeçar.

## Descarte: o campo que decide se borra

Cada quadro diz o que deve ficar na tela quando o tempo dele acaba. Existem quatro respostas possíveis e vale conhecer, porque três dos quatro jeitos de uma animação sair errada são este campo errado.

- **Deixar onde está.** O próximo quadro pinta direto por cima. Correto quando os quadros são opacos e se cobrem por inteiro, e é a opção mais barata, porque não há nada para apagar.
- **Limpar de volta para o fundo.** O retângulo do quadro é apagado antes de o próximo desenhar. É disso que a transparência precisa: sem isso, as partes vazadas do quadro seguinte mostram o quadro anterior por baixo, e uma animação de imagens separadas vira uma pilha delas.
- **Devolver o que estava embaixo.** O que estava na tela antes deste quadro desenhar volta ao lugar. É assim que se guarda um objeto pequeno andando sobre um fundo parado — cada quadro pinta o objeto, depois o fundo volta, e a única coisa escrita é o retângulo do objeto.
- **Não especificado.** O arquivo não disse. Todo visualizador trata como “deixar onde está”, o que costuma estar certo e de vez em quando é a razão de um GIF transparente borrar.

Um detalhe em que a especificação e a realidade se separam. “Limpar de volta para o fundo” aponta uma cor de fundo no cabeçalho do arquivo, e todo navegador ignora essa cor e limpa para transparente. Fazem isso há vinte e cinco anos. Um arquivo que conta com aquela cor de fundo aparecer vai parecer certo para quem o fez, no programa em que foi feito, e errado em todo o resto.

## Tabelas de cor, e os 768 bytes que custam

Um pixel de GIF não é uma cor. É um número apontando para uma tabela de no máximo 256 cores, cada uma guardada em três bytes. Uma tabela cheia é portanto 768 bytes, e um arquivo pode ter uma compartilhada por tudo, ou uma por quadro, ou as duas coisas.

Os dois arranjos são legítimos e trocam coisas diferentes:

- **Uma tabela compartilhada** são 768 bytes para o arquivo inteiro, e ela mantém as cores firmes de um quadro para o outro. A tremeliquice do GIF — aquele brilho desagradável num arquivo feito de vídeo — muitas vezes é só a paleta sacudindo de quadro em quadro.
- **Uma tabela por quadro** deixa cada quadro usar cores que a compartilhada não tem, o que importa quando a cena muda por completo. Custa 768 bytes toda vez. Numa animação de 300 quadros isso são 230 KB de tabelas de cor antes de um único pixel ser guardado.

Existe um segundo custo, mais silencioso. O comprimento de uma tabela de cor tem que ser uma potência de dois, então um quadro que usa nove cores ganha mesmo assim uma tabela de dezesseis, e um que usa 130 ganha 256. Um pouco de arredondamento para cima é inevitável. Um arquivo cujas tabelas declaram cinco mil cores às quais os pixels nunca se referem é outra coisa: paletas construídas para uma imagem diferente da que acabou no quadro. O analisador marca as entradas não usadas para que o formato disso apareça de relance.

## Para onde os bytes realmente vão

Todo byte de um GIF está num de poucos lugares, e vale saber quais são antes de decidir que um arquivo está grande demais.

- **Pixels comprimidos.** Num arquivo saudável, quase tudo. A imagem em si, passada pelo LZW — um esquema de compressão de 1984 pensado para capturas de planilha, que é por isso que ele vai bem em cor chapada e mal em fotografia.
- **Tabelas de cor.** 768 bytes por tabela cheia, como acima.
- **Cabeçalhos por quadro.** Oito bytes de tempo e onze de descritor para cada quadro. Num arquivo normal, nada; numa animação de dois mil quadros minúsculos, 38 KB.
- **O empacotamento em blocos.** Os dados comprimidos são cortados em trechos de no máximo 255 bytes, cada um com um byte de comprimento na frente. Cerca de um byte em cada 256, inevitável, e que vale ver porque de outro jeito fica invisível.
- **Metadados.** Comentários, perfis de cor e pacotes XMP. Este é o que produz os resultados genuinamente absurdos: um editor de imagem pode deixar 40 KB de XML descrevendo uma edição feita anos atrás, e num GIF pequeno isso é a maior parte do arquivo. Nenhum visualizador desenha nada disso.

A razão de olhar isso como uma tabela em vez de chutar é que a resposta muda de arquivo para arquivo, e o conserto sai da resposta. Um arquivo que é 95 % pixels comprimidos é simplesmente muita imagem, e só menos quadros, um tamanho menor ou menos cores vão ajudar. Um arquivo que é 30 % tabelas de cor ou 40 % XMP tem um problema bem mais barato.

![Uma barra separando um GIF pelo destino dos bytes, com uma linha por quadro dando o tamanho e a fatia do arquivo.](https://abox.tools/screens/whats-inside-a-gif/budget.webp)

Para onde os bytes foram de verdade, quadro a quadro. Um GIF grande demais quase sempre é grande por um motivo que isso deixa à vista.

## O laço não faz parte do formato

Não existe campo na especificação do GIF dizendo que uma animação se repete. O laço vem de um bloco que a Netscape inventou em 1995 — uma “extensão de aplicativo” com a palavra `NETSCAPE2.0` dentro — que todo mundo implementou mesmo assim e que hoje está em todo GIF animado da internet.

O que quer dizer que um arquivo sem esse bloco toca exatamente uma vez e para, em todo navegador, e parece quebrado para quem o fez. Se uma animação só toca uma vez, é esse bloco que está faltando; é das primeiras coisas que vale conferir e é invisível em qualquer visualizador.

O bloco também pode dizer uma contagem — toque cinco vezes e pare. Zero quer dizer para sempre, e é o que quase todo arquivo diz.

## As outras coisas que um GIF pode carregar

Três blocos que não guardam imagem e que todo visualizador pula:

- **Comentários.** Texto livre, normalmente o nome do programa que escreveu o arquivo, de vez em quando algo que o autor não teria escolhido publicar. Nada mostra, e toda cópia do arquivo carrega junto.
- **XMP.** Os metadados XML da Adobe: o que editou o arquivo, quando, às vezes quem. Chega com um rabo mágico de 258 bytes no fim, um truque para os comprimentos de bloco fecharem, que é por isso que ler um de forma ingênua enche a tela de binário.
- **Texto simples.** Um bloco da especificação de 1989 que pede ao visualizador para desenhar texto sobre a imagem numa grade de células. Nunca foi implementado por nada. Se um arquivo tiver um, o que estiver escrito ali não vai aparecer.

Vale conhecer os três antes de mandar um arquivo para algum lugar: são as partes de um GIF que podem dizer algo sobre você, e elas sobrevivem a toda cópia e a todo reenvio, a menos que alguma coisa as tire de propósito.

## Ler um arquivo danificado

GIFs ficam truncados — um download que parou, um arquivo recuperado de um disco morrendo, algo que um aplicativo escreveu pela metade. Como o formato é um fluxo de blocos e não uma estrutura indexada, um GIF truncado costuma continuar legível até o ponto em que ele para: todo quadro antes da quebra está inteiro e completo.

Vale saber porque a maioria dos programas simplesmente recusa o arquivo. Um analisador que lê até onde consegue e diz onde parou pelo menos conta quanto sobreviveu, e se o que falta é um quadro ou os últimos duzentos.

O problema inverso também existe: bytes sentados *depois* da marca de fim do arquivo. Todo decodificador para naquela marca, então eles nunca são lidos nem desenhados, e normalmente são um segundo arquivo grudado no primeiro por algo que deu errado. São peso puro e cortá-los não perde nada.

## Nada disso precisa de envio

Ler a estrutura de um GIF não é um trabalho pesado — é um passeio por uma lista de blocos e um descompactador pequeno — e nunca houve razão técnica para mandar o arquivo a um servidor para fazer isso. O [Analisador de GIF](https://abox.tools/pt/analisar-gif/) aqui faz tudo dentro da página: o passeio pelos blocos, o LZW, os quadros desenhados na tela e a contabilidade dos bytes.

Isso importa mais neste trabalho do que na maioria, porque os arquivos que as pessoas mais querem desmontar costumam ser justamente aqueles que elas menos têm certeza de querer compartilhar — algo recuperado, algo que alguém mandou, algo com um bloco de comentário que ainda não foi lido. O [argumento mais longo sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) vale aqui tanto quanto em qualquer canto deste site.
