# Como empilhar fotografias para reduzir o ruído, ou tirar pessoas

Uma sequência de fotos tem mais informação que cada quadro sozinho. A média reduz ruído aleatório independente; o valor central de cada pixel pode remover o que aparece em menos da metade dos quadros. A escolha depende do que se mexeu.

[Abrir Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.

Última atualização 8 de outubro de 2026

## A resposta curta

Abra o [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/), solte a sequência inteira dentro, e escolha o método pelo que você quer se livrar:

- **Ruído**, e nada se mexeu — média.
- **Ruído**, e alguma coisa se mexeu — sigma clipping.
- **Pessoas, carros, um avião** — mediana.
- **Um céu escuro que você quer como rastros de estrelas** — clarear.
- **Uma macro com quase nenhuma profundidade de campo** — focus stacking.

Comece com **Automático com perspectiva** para reduzir ruído, inclusive em fotos noturnas feitas no tripé: as estrelas se movem mesmo com a câmera parada. Use **Não** para rastros de estrelas intencionais ou quadros que já se encaixam. Os RAW podem entrar direto quando contêm uma prévia JPEG utilizável. A linha mostra o tamanho real da imagem.

Tudo o que vem abaixo é o motivo pelo qual aquelas cinco linhas são o que são.

## Por que uma sequência guarda mais do que um quadro

Uma fotografia feita com pouca luz é a imagem mais o ruído, e o ruído é diferente a cada vez. É essa última parte que faz o empilhamento funcionar. Faça o mesmo disparo dezesseis vezes e a imagem é idêntica nas dezesseis enquanto o ruído não é, então tirar a média deles deixa a imagem e cancela a maior parte do ruído.

A melhora é a raiz quadrada do número de quadros. Quatro quadros reduzem o ruído à metade. Dezesseis, a um quarto. Cem cortam por dez. É uma curva brutal para se estar — ir de dezesseis para sessenta e quatro quadros compra a mesma melhora de novo, por quatro vezes mais disparos — e é por isso que quase toda pilha prática fica entre oito e trinta quadros.

A média também deixa as estimativas de tom mais estáveis porque cada quadro com ruído foi arredondado de um jeito um pouco diferente. A ferramenta usa acumuladores mais amplos e arredonda o valor combinado no final. O PNG ou JPEG salvo continua com oito bits por canal: uma média mais limpa não aumenta a profundidade da saída.

## A pergunta que escolhe o método

Não “o que eu quero guardar”, mas **o que era diferente entre os quadros**. Todo o resto vem daí.

### Nada se mexeu: média

A média simples. É a redução de ruído mais eficaz que existe num conjunto em que a única diferença entre os quadros é o ruído, e é a mais fácil de estragar: um quadro com um pássaro põe um pássaro fantasma na pilha inteira, porque uma média não tem opinião sobre um valor que discorda dos outros. Ela simplesmente o inclui.

### Alguma coisa cruzou o quadro: mediana

Alinhe uma dúzia de fotografias de uma praça movimentada e olhe para um pixel. Na maioria delas ele é calçada; numa ou duas ele é o casaco de alguém. Ordene aqueles doze valores e pegue o do meio e você recebe calçada, porque o casaco nunca esteve na maioria.

Faça isso para cada pixel e a praça sai vazia. Este é o truque por trás de todo artigo do tipo “tire os turistas da sua foto de férias”, e ele não precisa de nada mais esperto do que uma sequência e paciência. A única coisa que ele exige é que **nenhuma parte da cena esteja ocupada mais da metade do tempo**. Uma pessoa parada em oito dos seus doze quadros é a maioria naqueles pixels, e a mediana vai mantê-la.

### As duas coisas: sigma clipping

A mediana reduz ruído aleatório independente com menos eficiência que a média. Sua saída vem do valor central, ou do par central, em vez da média de todos os valores. Esse é o preço de ser menos afetada por poucos valores muito diferentes dos demais.

Sigma clipping estima primeiro a média e a dispersão de cada canal, depois tira a média só dos valores dentro do limite escolhido. Pode rejeitar um objeto que passou por poucos quadros e aproveitar o fundo restante. É menos confiável em conjuntos pequenos ou quando o objeto aparece com frequência. No limite padrão, um valor diferente entre quatro idênticos ainda pode ser aceito. Use mediana se remover o objeto for mais importante que obter a maior redução de ruído.

O limite é medido em desvios padrão e começa em dois. Diminuir rejeita mais valores, inclusive detalhes reais. Se todos os valores de um canal forem rejeitados, a ferramenta mantém a média original desse canal em vez de deixar um buraco.

### Só as coisas claras importam: clarear

Guarde o valor mais claro que cada pixel já teve. Fotografe o céu noturno como duzentas exposições de trinta segundos e clareie-as juntas, e cada estrela desenha o seu próprio arco no resultado — um rastro de estrela, montado a partir de exposições curtas que individualmente nunca estouraram. O mesmo método monta um fogo de artifício a partir dos quadros da sua própria explosão, e um light painting a partir de uma volta por um quarto escuro com uma lanterna.

O oposto dele, escurecer, é o discreto do par: um pixel só continua claro se estava claro em *todos* os quadros, então reflexos numa janela, faróis passando e gotas de chuva iluminadas por um flash somem todos.

### O assunto é mais fundo do que o foco: focus stacking

Uma macro em f/8 tem talvez um milímetro em foco, o que não basta para um inseto. A resposta é fazer vinte quadros ao longo do anel de foco e guardar, de cada um, só a parte que estava nítida nele. A ferramenta mede quanto cada pixel difere dos seus vizinhos — muito numa borda, quase zero num borrão — e pega o vencedor.

Este quer um tripé mais do que todos os outros, porque mexer no anel de foco com a mão move a câmera, e um quadro feito de um pouco mais longe não é a mesma imagem noutro foco.

### Uma mistura mais clara: somar

Somar adiciona os valores de imagem decodificados antes de aplicar o multiplicador de Exposição. São valores de oito bits, então o resultado é uma mistura aditiva e não uma simulação de uma exposição mais longa da câmera. As áreas claras podem estourar. **Normalizar brilho** define o multiplicador como um dividido pelo número de quadros. Você também pode digitar diretamente um multiplicador menor.

![Métodos e ajustes da pilha, com tamanho planejado de saída, memória de trabalho estimada, decodificações planejadas e leituras de inspeção.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

O modo é a pergunta desta seção. O plano embaixo é a ferramenta dizendo o custo da rodada antes de começar.

## Alinhar os quadros

Empilhar é aritmética por pixel, então parte do princípio de que um dado pixel é a mesma parte da cena em todos os quadros. Na mão, não é: uma sequência deriva dezenas de pixels, e tirar a média disso produz um borrão em vez de uma imagem limpa. É de longe o motivo mais comum de uma primeira tentativa de empilhamento decepcionar.

Cada quadro é medido contra o marcado como **Referência** e reposicionado quando há uma correção confiável. O primeiro é o padrão. **Usar como referência** muda essa marca sem reordenar a lista. Escolha um quadro nítido com detalhes estáticos claros. São quatro ajustes de alinhamento:

- **Automático com perspectiva** é o padrão. Corrige deslocamento, rotação e escala e usa correção de perspectiva quando medições confiáveis espalhadas pela imagem a sustentam. Ajuda em sequências noturnas de campo amplo em que o centro se alinha, mas as estrelas das bordas ainda deixam rastros. Se não encontrar um ajuste de perspectiva estável, usa a correção mais simples.
- **Só deslocamento** para uma sequência que se deslocou sem girar nem mudar de perspectiva. Corrige apenas a translação.
- **Deslocamento, rotação e escala** para uma série em que você também girou um pouco ou o zoom mudou. Exige medições adicionais por quadro, mesmo quando os quadros estão retos.
- **Não** se os quadros estáticos já se encaixam ou se você quer transformar estrelas em movimento em rastros. Um tripé não mantém as estrelas nos mesmos pixels durante uma sequência noturna.

O que alinhamento algum conserta é um assunto que se moveu em vez de uma câmera que se moveu, e nem uma fotografia tirada um passo à esquerda. Andar para o lado muda quanto as coisas próximas se deslocam em relação às distantes, e nenhuma correção única descreve as duas de uma vez. Girar no lugar tudo bem; caminhar não.

Depois de empilhar, abra **Detalhes de alinhamento** para ver o estado e a correção de cada quadro. Um quadro que não pôde ser alinhado continua incluído onde estava; remova-o e rode de novo se deixar o resultado sem nitidez. O resultado abre com a referência à esquerda e a pilha à direita. Arraste o divisor com o mouse ou o dedo, ou coloque o foco nele e use as setas esquerda e direita. Leve-o até uma borda para ver uma imagem inteira. O divisor fica disponível em **Ajustar à janela**. Escolher **100% — pixels reais** mostra todo o resultado empilhado e remove a opção de comparação. A 100%, arraste a imagem para percorrê-la ou coloque o foco na prévia e use as teclas de seta. Use **Mostrar** para examinar a referência ou a pilha separadamente. Volte a Ajustar à janela para comparar de novo com o divisor.

![Uma comparação dividida com o quadro de referência à esquerda, o resultado empilhado à direita e um divisor móvel.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Mova o divisor sobre ruído e bordas finas para comparar a mesma parte das duas imagens. Confira os detalhes de alinhamento se a pilha parecer sem nitidez.

## Onde os arquivos RAW entram

CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF e formatos relacionados podem ser abertos quando contêm uma prévia JPEG utilizável. Vale explicar exatamente o que acontece porque é diferente de revelar os dados RAW do sensor.

Muitos RAW contêm uma **prévia JPEG renderizada pela câmera**. A ferramenta encontra a maior utilizável e a decodifica com o decodificador comum do navegador. Essa prévia pode ser menor que a imagem do sensor, e alguns arquivos não têm nenhuma. Confira as dimensões de cada quadro.

Duas consequências, uma boa e uma que vale a pena saber:

- **Evita decodificar o sensor.** Encontrar a prévia normalmente exige pequenas leituras de diretórios e cabeçalhos, e o navegador depois lê a fatia JPEG para decodificá-la. O número de inspeção conta essas leituras, não todos os bytes lidos pelo decodificador de imagens.
- **É a interpretação da câmera, não a sua.** Oito bits por canal, com o balanço de branco e o estilo de imagem em que a câmera estava — não os doze ou catorze bits de dados lineares do sensor que você teria de um conversor.

Uma prévia utilizável pode bastar para reduzir ruído, criar rastros de estrelas, remover pessoas e fazer focus stacking. Suas dimensões e a renderização da câmera são os limites. Para escolher balanço de branco, ajustar tons ou recuperar sombras RAW, revele os quadros primeiro e exporte JPEG ou PNG para empilhar aqui. O resultado salvo continua sendo uma imagem de oito bits.

## Quanto custa rodar

Vale a pena saber porque é a diferença entre uma pilha que leva oito segundos e uma que leva dois minutos.

Seis métodos têm acumuladores cujo tamanho não cresce com o número de quadros. Média, clarear, escurecer, somar e focus stacking fazem uma passagem por faixa. Sigma clipping faz duas: uma para estimar a média e a dispersão e outra para tirar a média dos valores aceitos. Inspeção e alinhamento também decodificam os arquivos, então uma passagem de empilhamento não significa uma única leitura no total.

Mediana precisa guardar os valores de cada quadro para a faixa combinada. Vinte quadros de 24 megapixels precisariam de cerca de 1,4 GB só para esses valores. As faixas permitem processar menos linhas por vez, ao custo de decodificar cada quadro novamente para cada faixa. Os outros métodos também podem ser divididos em faixas quando seus buffers excedem o orçamento.

Antes de começar, a ferramenta mostra o tamanho planejado do resultado, a memória de trabalho estimada, as decodificações planejadas da pilha e os bytes lidos na inspeção. A estimativa inclui os buffers de trabalho modelados; processos internos do navegador e liberação de memória podem aumentar o uso total. Reduzir a resolução de trabalho um nível divide a área da imagem por quatro e pode diminuir as decodificações repetidas. O alinhamento pode recortar o resultado o suficiente para precisar de menos faixas que o plano inicial.

## Fotografando com isso em mente

A maior parte da qualidade de uma pilha é decidida antes de qualquer programa vê-la.

- **Faça mais quadros do que você acha que precisa.** A curva da raiz quadrada é implacável no começo e generosa no fim: ir de quatro para nove quadros é uma mudança visível maior do que ir de vinte para quarenta.
- **Não mude a exposição entre os quadros.** Empilhar parte do princípio de que os quadros são da mesma cena com o mesmo brilho. Trave a exposição, ou a ferramenta vai estar tirando a média de duas imagens diferentes.
- **Para tirar pessoas, espere entre os quadros.** Uma sequência feita em dois segundos pega a mesma pessoa no mesmo lugar em todos os quadros, e a mediana a mantém. Dez quadros com alguns segundos de intervalo funciona muito melhor do que cinquenta em rajada.
- **Para rastros de estrelas, mantenha os intervalos curtos.** Clarear desenha exatamente o que os quadros registraram, então uma pausa entre as exposições vira um tracinho visível em cada rastro.

## Nada disso sai do seu computador

Uma pilha de vinte quadros RAW é cerca de um gigabyte de fotografias, o que é muito para entregar a um site a fim de que se tire uma média disso. O [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/) lê os arquivos do seu próprio disco e faz a aritmética no seu próprio navegador. Não há passo de envio, não há conta e não há fila, e você pode conferir essa afirmação como conferiria a de qualquer um: abra o painel de rede do seu navegador enquanto ele roda, ou simplesmente tire o cabo da internet e empilhe mesmo assim.

A pergunta relacionada — como saber, para qualquer ferramenta, se entregar o arquivo ao serviço era necessário — tem [um guia próprio](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/).
