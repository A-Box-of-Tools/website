# Como empilhar fotografias para reduzir o ruído, ou tirar pessoas

Uma sequência de quadros guarda mais informação do que qualquer um deles. Tirar a média deles cancela o ruído; pegar o valor do meio de cada pixel apaga tudo o que só estava ali parte do tempo. Qual dos dois você quer depende inteiramente do que se mexeu.

[Abrir Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/), solte a sequência inteira dentro, e escolha o método pelo que você quer se livrar:

- **Ruído**, e nada se mexeu — média.
- **Ruído**, e alguma coisa se mexeu — sigma clipping.
- **Pessoas, carros, um avião** — mediana.
- **Um céu escuro que você quer como rastros de estrelas** — clarear.
- **Uma macro com quase nenhuma profundidade de campo** — focus stacking.

Deixe o alinhamento ligado se a câmera estava nas suas mãos e desligue se ela estava num tripé. Arquivos RAW podem entrar direto; não é preciso revelá-los antes.

Tudo o que vem abaixo é o motivo pelo qual aquelas cinco linhas são o que são.

## Por que uma sequência guarda mais do que um quadro

Uma fotografia feita com pouca luz é a imagem mais o ruído, e o ruído é diferente a cada vez. É essa última parte que faz o empilhamento funcionar. Faça o mesmo disparo dezesseis vezes e a imagem é idêntica nas dezesseis enquanto o ruído não é, então tirar a média deles deixa a imagem e cancela a maior parte do ruído.

A melhora é a raiz quadrada do número de quadros. Quatro quadros reduzem o ruído à metade. Dezesseis, a um quarto. Cem cortam por dez. É uma curva brutal para se estar — ir de dezesseis para sessenta e quatro quadros compra a mesma melhora de novo, por quatro vezes mais disparos — e é por isso que quase toda pilha prática fica entre oito e trinta quadros.

Há um segundo ganho, mais discreto. Tirar a média de dezesseis quadros de oito bits dá um resultado com gradações mais finas do que qualquer um deles tinha, porque é justamente o ruído que fazia cada quadro arredondar de um jeito diferente que permite à média cair entre os níveis. Empilhar um conjunto ruidoso não só tira ruído; recupera tom que um único quadro quantizou fora.

## A pergunta que escolhe o método

Não “o que eu quero guardar”, mas **o que era diferente entre os quadros**. Todo o resto vem daí.

### Nada se mexeu: média

A média simples. É a redução de ruído mais eficaz que existe num conjunto em que a única diferença entre os quadros é o ruído, e é a mais fácil de estragar: um quadro com um pássaro põe um pássaro fantasma na pilha inteira, porque uma média não tem opinião sobre um valor que discorda dos outros. Ela simplesmente o inclui.

### Alguma coisa cruzou o quadro: mediana

Alinhe uma dúzia de fotografias de uma praça movimentada e olhe para um pixel. Na maioria delas ele é calçada; numa ou duas ele é o casaco de alguém. Ordene aqueles doze valores e pegue o do meio e você recebe calçada, porque o casaco nunca esteve na maioria.

Faça isso para cada pixel e a praça sai vazia. Este é o truque por trás de todo artigo do tipo “tire os turistas da sua foto de férias”, e ele não precisa de nada mais esperto do que uma sequência e paciência. A única coisa que ele exige é que **nenhuma parte da cena esteja ocupada mais da metade do tempo**. Uma pessoa parada em oito dos seus doze quadros é a maioria naqueles pixels, e a mediana vai mantê-la.

### As duas coisas: sigma clipping

A mediana joga fora a maior parte da informação para conseguir a sua robustez — onze dos seus doze valores são descartados em cada pixel, então ela reduz o ruído bem menos do que uma média do mesmo conjunto reduziria.

O sigma clipping é o meio-termo, e costuma ser o padrão certo para qualquer conjunto do mundo real. Ele olha para cada pixel em todos os quadros, descobre o que ele costuma ser e quanto varia, e então tira a média só dos valores que concordam com isso. Um carro que cruzou um quadro é excluído naqueles pixels; todo outro quadro continua contando em todo lugar. Você fica com a imunidade da mediana a coisas que se mexeram e com a maior parte da redução de ruído da média.

O limiar é em desvios padrão, e dois é o ponto de partida de sempre. Mais baixo rejeita mais, e começa a rejeitar detalhe verdadeiro junto com o carro.

### Só as coisas claras importam: clarear

Guarde o valor mais claro que cada pixel já teve. Fotografe o céu noturno como duzentas exposições de trinta segundos e clareie-as juntas, e cada estrela desenha o seu próprio arco no resultado — um rastro de estrela, montado a partir de exposições curtas que individualmente nunca estouraram. O mesmo método monta um fogo de artifício a partir dos quadros da sua própria explosão, e um light painting a partir de uma volta por um quarto escuro com uma lanterna.

O oposto dele, escurecer, é o discreto do par: um pixel só continua claro se estava claro em *todos* os quadros, então reflexos numa janela, faróis passando e gotas de chuva iluminadas por um flash somem todos.

### O assunto é mais fundo do que o foco: focus stacking

Uma macro em f/8 tem talvez um milímetro em foco, o que não basta para um inseto. A resposta é fazer vinte quadros ao longo do anel de foco e guardar, de cada um, só a parte que estava nítida nele. A ferramenta mede quanto cada pixel difere dos seus vizinhos — muito numa borda, quase zero num borrão — e pega o vencedor.

Este quer um tripé mais do que todos os outros, porque mexer no anel de foco com a mão move a câmera, e um quadro feito de um pouco mais longe não é a mesma imagem noutro foco.

![A lista de modos, média, mediana, mais claro, mais escuro, com um plano embaixo dando o tamanho de saída, a memória necessária e quanto de cada arquivo precisa ser lido.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

O modo é a pergunta desta seção. O plano embaixo é a ferramenta dizendo o custo da rodada antes de começar.

## Alinhar os quadros

Empilhar é aritmética por pixel, então parte do princípio de que um dado pixel é a mesma parte da cena em todos os quadros. Na mão, não é: uma sequência deriva dezenas de pixels, e tirar a média disso produz um borrão em vez de uma imagem limpa. É de longe o motivo mais comum de uma primeira tentativa de empilhamento decepcionar.

Então os quadros são medidos contra um deles e postos de volta no lugar antes, com precisão de fração de pixel. Três ajustes:

- **Só deslocamento** serve para quase tudo feito na mão. Corrige a deriva e o tremor.
- **Deslocamento, rotação e escala** para um conjunto em que você também girava de leve, ou em que um zoom escorregou. Custa uma medição a mais por quadro e não custa nada quando os quadros se revelam retos.
- **Nenhum** para um tripé travado ou uma série de intervalômetro, em que os quadros já estão alinhados e medi-los é tempo perdido.

O que alinhamento algum conserta é um assunto que se moveu em vez de uma câmera que se moveu, e nem uma fotografia tirada um passo à esquerda. Andar para o lado muda quanto as coisas próximas se deslocam em relação às distantes, e nenhuma correção única descreve as duas de uma vez. Girar no lugar tudo bem; caminhar não.

![O resultado: a imagem empilhada, com uma nota dizendo o quanto cada quadro teve que ser movido para alinhar com o primeiro.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Os números do alinhamento valem uma lida. Uma rajada na mão anda alguns pixels por quadro, e é isso que o alinhador desfaz sem dizer nada.

## Onde os arquivos RAW entram

Você pode soltar CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF e o resto direto lá dentro, e vale a pena ser exato sobre o que acontece com eles, porque não é o que um conversor RAW faz.

Todo arquivo RAW já contém um **JPEG em tamanho cheio que a câmera renderizou no momento do disparo**. É o que a traseira da câmera lhe mostra e o que o seu sistema operacional desenha como miniatura. O empilhador encontra aquela imagem e usa aquilo. Ele não decodifica os dados do sensor.

Duas consequências, uma boa e uma que vale a pena saber:

- **É rápido.** Encontrar a prévia significa ler alguns kilobytes de diretório e depois uma fatia, então um quadro de 60 MB abre mais ou menos tão rápido quanto um JPEG. Vinte deles abrem no tempo que um conversor RAW gastaria num. A página lhe mostra quão pouco dos seus arquivos ele leu de fato.
- **É a interpretação da câmera, não a sua.** Oito bits por canal, com o balanço de branco e o estilo de imagem em que a câmera estava — não os doze ou catorze bits de dados lineares do sensor que você teria de um conversor.

Para redução de ruído, rastros de estrelas, tirar transeuntes e focus stacking, essa troca quase sempre compensa: as prévias são em resolução cheia e são o que você teria recebido como JPEG de qualquer jeito. Se você está puxando muito as sombras, ou empilhando para astrofotografia, onde o último pedacinho de faixa dinâmica é o ponto inteiro, revele os quadros num conversor RAW antes e empilhe os TIFFs ou JPEGs que ele der. Esses entram do mesmo jeito.

## Quanto custa rodar

Vale a pena saber porque é a diferença entre uma pilha que leva oito segundos e uma que leva dois minutos.

Seis dos sete métodos só precisam lembrar de uma coisa. Um máximo corrente não se importa com os quadros que já viu, e um total corrente também não, então esses métodos leem cada quadro exatamente uma vez e usam a mesma memória para cem quadros que para dois.

A mediana não pode funcionar assim, porque não dá para saber o valor do meio de um conjunto até ter o conjunto inteiro. Vinte quadros de 24 megapixels são cerca de 1,4 GB de pixels segurados ao mesmo tempo, que navegador nenhum lhe dá, então a imagem é cortada em faixas horizontais e empilhada uma faixa por vez — correto, e mais lento, porque os quadros são lidos de novo para cada faixa.

A ferramenta calcula tudo isso antes de você apertar o botão e lhe diz: que tamanho terá o resultado, mais ou menos quanta memória precisa, e quantas vezes os seus quadros serão decodificados. Se ela disser que a execução vai ser em faixas, baixar um passo a resolução de trabalho divide a memória por quatro e quase sempre a devolve a uma passagem única — e se você está empilhando para tirar ruído, meia resolução já ia sair mais limpa do que a cheia.

## Fotografando com isso em mente

A maior parte da qualidade de uma pilha é decidida antes de qualquer programa vê-la.

- **Faça mais quadros do que você acha que precisa.** A curva da raiz quadrada é implacável no começo e generosa no fim: ir de quatro para nove quadros é uma mudança visível maior do que ir de vinte para quarenta.
- **Não mude a exposição entre os quadros.** Empilhar parte do princípio de que os quadros são da mesma cena com o mesmo brilho. Trave a exposição, ou a ferramenta vai estar tirando a média de duas imagens diferentes.
- **Para tirar pessoas, espere entre os quadros.** Uma sequência feita em dois segundos pega a mesma pessoa no mesmo lugar em todos os quadros, e a mediana a mantém. Dez quadros com alguns segundos de intervalo funciona muito melhor do que cinquenta em rajada.
- **Para rastros de estrelas, mantenha os intervalos curtos.** Clarear desenha exatamente o que os quadros registraram, então uma pausa entre as exposições vira um tracinho visível em cada rastro.

## Nada disso sai da sua máquina

Uma pilha de vinte quadros RAW é cerca de um gigabyte de fotografias, o que é muito para entregar a um site a fim de que se tire uma média disso. O [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/) lê os arquivos do seu próprio disco e faz a aritmética no seu próprio navegador. Não há passo de envio, não há conta e não há fila, e você pode conferir essa afirmação como conferiria a de qualquer um: abra o painel de rede do seu navegador enquanto ele roda, ou simplesmente tire o cabo da internet e empilhe mesmo assim.

A pergunta relacionada — como saber, para qualquer ferramenta, se entregar-lhe um arquivo era necessário — tem [um guia próprio](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/).
