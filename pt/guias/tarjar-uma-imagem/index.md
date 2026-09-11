# Como tarjar uma imagem para que o que foi coberto suma de verdade

Cobrir e remover têm exatamente a mesma aparência na tela e não são a mesma coisa. Aqui está a diferença, os dois estilos que deixam mais rastro do que se imagina, e as conferências que dizem qual das duas coisas você acabou de fazer.

[Abrir Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Censor de imagens](https://abox.tools/pt/tarjar-imagem/), arraste a imagem para dentro, desenhe uma caixa sobre cada coisa que ninguém deve ver e clique em “Tarjar e salvar”. Use a tarja preta para tudo o que se lê como texto. O arquivo que você recebe de volta tem valores de pixel diferentes onde estavam as caixas: não existe nele um retângulo para arrastar, porque não existe retângulo nenhum.

Todo o resto explica por que essa última frase é o ponto, e como saber se um programa que você já usa pode dizer o mesmo de si.

## Cobrir e remover têm a mesma aparência na tela

Desenhe um retângulo preto sobre um nome num leitor de PDF, numa apresentação, num editor de texto ou num editor de imagens com camadas. O que você vê é um nome com um retângulo preto em cima. O que você *salvou*, na maioria desses programas, é um documento que contém o nome e, separadamente, um retângulo com posição, tamanho e cor.

Quem abrir esse arquivo pode mover o retângulo, apagá-lo, ou abrir o documento num programa que desenhe as camadas em outra ordem. O nome continua lá dentro. Nada na tela diz qual das duas coisas acabou de acontecer, e é exatamente por isso que isso continua acontecendo com organizações que têm advogados.

Foi assim que vieram a público peças processuais, relatórios oficiais, contratos e mais de um documento escaneado de jornal. O padrão é sempre o mesmo: o retângulo era a anotação, e a anotação não era a imagem.

## O que é uma tarja de verdade

Uma imagem é uma grade de números, um por pixel. Tarjá-la significa **escrever números diferentes na grade** e depois salvar a grade. Feito isso, não há o que recuperar, não porque o arquivo esconde bem, mas porque os valores não estão no arquivo. É a única versão disso que sobrevive a alguém curioso abrindo o arquivo.

Daí vêm três consequências, e é essa a cara de um arquivo tarjado de verdade:

- **O resultado é uma imagem achatada.** Sem camadas, sem objetos, sem lista de anotações, sem nada para ligar e desligar. Se a sua ferramenta devolve um arquivo com uma camada dentro, ela cobriu em vez de remover.
- **É um arquivo novo, não um antigo editado.** Os pixels passaram por um decodificador e um codificador, então o que sai é escrito a partir da grade já tarjada.
- **Os metadados também somem**, como efeito colateral. Uma grade de pixels não carrega modelo de câmera, posição de GPS nem data. O que estaria ali está descrito em [o que uma foto conta sobre você](https://abox.tools/pt/guias/remover-dados-exif-e-gps/).

Vale detalhar esse último ponto, porque ele esconde outra armadilha. Muitas fotos carregam uma **miniatura embutida**: uma segunda cópia pequena da imagem, escrita quando o arquivo foi criado e nem sempre refeita quando a imagem é editada. Uma foto tarjada por uma ferramenta que edita o arquivo no lugar, em vez de recodificá-lo, pode viajar com uma miniatura do original sem tarja. É uma imagem pequena, e é folgadamente grande o bastante para se ler um nome nela.

![O cartão de salvar: um menu de formato, um controle de qualidade e uma nota dizendo que os pixels cobertos são removidos do arquivo que é escrito.](https://abox.tools/screens/redact-an-image/save.webp)

Salvar é o passo que torna aquilo real. O que sai é um arquivo novo sem aqueles pixels, não o original com um retângulo por cima.

## Tarja, pixelação ou desfoque, e por que não são equivalentes

Os três sobrescrevem os pixels. Só um não deixa nada para trás.

### Tarja preta

Todos os pixels da caixa passam a ter a mesma cor. Do que estava ali não sobrevive nada: nem um contorno, nem um brilho médio, nem a quantidade de caracteres, nem o comprimento da palavra. É a única das três em que a pergunta “isso poderia ser desfeito?” tem um não seco como resposta, e é o que usar para um nome, um endereço, um número de conta, uma placa, uma assinatura ou um código de barras.

### Pixelação

A caixa é cortada em blocos e cada bloco passa a ser a cor média daquele bloco. Os pixels originais somem mesmo, mas uma grade de médias ainda é uma medida do que estava embaixo, e para texto essa medida pode bastar.

O ataque não tem sutileza. Texto vem de um conjunto pequeno de possibilidades: uma fonte, um tamanho, uma posição e uma sequência de caracteres. Quem desconfia do tipo de dado que estava ali pode renderizar cada candidato do mesmo jeito, pixelá-lo com a mesma grade de blocos e comparar as médias com as suas. A correspondência costuma ser única. Isso já foi demonstrado em prints pixelados reais, e existe software publicado que faz isso.

O que decide é **de quantos blocos a pixelação é feita**. Dois blocos sobre uma palavra são dois números, e com dois números não se identifica uma sequência. Quarenta blocos sobre a mesma palavra são quarenta números, e quarenta sobram. Por isso o Censor de imagens informa a quantidade de blocos da pixelação mais fina da imagem em vez de chamar um ajuste de “forte”: o número é o fato, e o adjetivo é uma opinião sobre ele.

### Desfoque

Cada pixel passa a ser uma média ponderada dos vizinhos. Isso é uma convolução, e convoluções em princípio podem ser invertidas: recuperar o original a partir de uma cópia desfocada é um problema padrão com software padrão, e funciona melhor justamente no caso que importa aqui, que é texto nítido desfocado com raio pequeno.

Nada disso torna a pixelação e o desfoque inúteis. Um rosto ao fundo de uma foto de rua, o número de uma casa do outro lado, a tela de um colega atrás de você numa videochamada: tudo isso está ótimo, e a imagem continua parecendo uma imagem. A regra é simples: **se se lê como texto, cubra com tarja preta.**

![O editor: uma foto com uma caixa opaca sobre parte dela, a escolha entre preto, pixelizar e borrar, um controle de intensidade e um resumo das áreas marcadas.](https://abox.tools/screens/redact-an-image/cover.webp)

Três jeitos de cobrir uma coisa, e eles não são equivalentes. Esta seção trata de qual deles sobrevive a alguém tentando desfazer.

## Quatro conferências antes de enviar

Juntas levam um minuto e funcionam no resultado de qualquer ferramenta, incluindo esta. Uma afirmação que dá para conferir vale mais do que uma que pedem para você aceitar.

1. **Tente selecionar o texto.** Abra o arquivo e arraste sobre a área coberta. Se alguma coisa ficar marcada, o texto continua no documento e você está olhando para uma forma desenhada por cima.
2. **Abra num editor e procure camadas.** Uma única camada, chamada de algo como “Fundo”, é a cara de uma imagem tarjada. Um objeto retângulo separado quer dizer que o original está embaixo.
3. **Olhe a miniatura.** Alguns gerenciadores de arquivos e visualizadores mostram a miniatura embutida em vez de reler a imagem. Se a versão pequena ainda mostra o que você cobriu, o arquivo foi editado em vez de reconstruído.
4. **Amplie ao máximo as bordas da caixa.** Uma tarja aplicada aos pixels tem uma borda dura exatamente no limite. Uma borda macia ou semitransparente quer dizer que algo foi desenhado por cima com uma opacidade, e opacidade abaixo de 100 % é uma cópia do original com um tom em cima.

## Corte em vez de cobrir, sempre que der

Se o que você quer esconder está na borda da imagem, como um cabeçalho com o nome de uma conta, uma aba do navegador ou uma barra de tarefas com o seu usuário, cortar é mais forte do que cobrir e ainda produz um arquivo mais limpo. Não há caixa nenhuma de que desconfiar, porque ali não sobrou nada.

O [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) corta, e [o guia dele](https://abox.tools/pt/guias/redimensionar-uma-imagem/) conta o que mais ele faz. Para o que está no meio, use o censor.

## Um print costuma ser o pior caso

Num print, a imagem quase nunca é a única coisa que identifica você. Antes de enviar um, olhe o que cerca a parte que você queria mostrar: o título da janela, a barra de endereços e a lista de sugestões dela, as abas abertas, uma notificação, a hora e a data, a barra de tarefas, um avatar logado no canto, o nome da rede wi-fi. Qualquer um desses pode localizar você, e nenhum era o que você estava olhando na hora.

## Nada disso precisa de envio

Ler uma imagem, escrever por cima de alguns pixels dela e codificá-la de novo são coisas que todo navegador faz há anos. Não existe razão técnica para a foto do seu passaporte, do seu holerite ou do seu extrato bancário viajar até o servidor de um estranho e voltar só para receber uma caixa preta. E são justamente essas as imagens que chegam a uma ferramenta de tarja.

A daqui não manda nada para lugar nenhum: a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum é nosso. Carregue a página, desconecte da internet e tarje alguma coisa assim mesmo, se você prefere conferir a acreditar. [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três conferências que você pode fazer em qualquer ferramenta.
