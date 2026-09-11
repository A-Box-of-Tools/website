# Como fazer um GIF animado com imagens

Fazer o GIF é a parte fácil. Conseguir um pequeno o bastante para dar para postar é a parte que vale ler, porque GIF não tem controle de qualidade e só três coisas mexem no tamanho dele.

[Abrir Criador de GIF](https://abox.tools/pt/criar-gif/): Transforme um punhado de imagens em uma animação só.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Criador de GIF](https://abox.tools/pt/criar-gif/), solte as fotos lá dentro, coloque na ordem em que devem tocar, defina por quanto tempo cada quadro fica, e faça o GIF. Ele já toca na página antes de você salvar.

Tudo o que vem abaixo é sobre as duas coisas que dão errado depois: o arquivo é bem maior do que se esperava, ou a animação toca mais devagar do que os números diziam. As duas têm causas específicas e nenhuma delas é defeito da ferramenta.

## Por que um GIF é tão maior do que você espera

Um GIF de 20 quadros a 640 pixels tranquilamente dá de 8 a 15 MB. A mesma animação em MP4 são algumas centenas de kilobytes. Isso não é um GIF mal feito; isso é o formato.

Todo outro formato de imagem em movimento que você já usou guarda *diferenças*. Um codec de vídeo escreve um quadro inteiro e depois, para os seguintes, só o que se mexeu e para onde — que é por isso que um vídeo de uma pessoa falando na frente de um fundo parado custa quase nada por quadro. Um GIF não consegue fazer isso. Todo quadro é guardado como pixels inteiros, passados por um compressor sem perdas, e a caixa de ferramentas é essa.

Também não existe ajuste de qualidade, porque não há etapa com perda para abaixar. Um JPEG em 60 % de qualidade é uma escolha de verdade com um controle de verdade atrás; um GIF não tem equivalente. Então o tamanho é mais ou menos **área × número de quadros**, e o único jeito de mexer nele é mexer num desses dois números.

## As três coisas que de fato deixam menor

Na ordem em que ajudam:

**1. Deixe menor.** Essa não é uma entre várias opções, é *a* opção. Tamanho é área, então cortar o lado maior pela metade deixa o arquivo num quarto: de 640 px para 320 px transforma 12 MB em uns 3 MB. Um GIF numa página web ou numa janela de conversa está sendo visto em algumas centenas de pixels de qualquer jeito. Os 480 px são o padrão da ferramenta exatamente por isso, e 320 px é uma resposta perfeitamente respeitável.

**2. Use menos quadros.** Dez quadros segurados um quinto de segundo cada são os mesmos dois segundos de animação que vinte quadros a um décimo, e metade do arquivo. Suavidade custa bytes em proporção direta, então gaste só onde o movimento pedir.

**3. Desligue o pontilhado e derrube as cores.** Essa é contraintuitiva. O pontilhado espalha um padrão fino de pixels alternados para fingir as cores que a paleta não tem, e esse padrão é *ruído* — que é justamente o que um compressor sem perdas não consegue comprimir. Em arte chapada, capturas de tela e desenho de linha, desligar pode tirar um terço do arquivo e ainda ficar melhor. Em fotografias troca faixas visíveis pela economia, então teste os dois e olhe.

Cair de 256 para 64 cores também ajuda, embora menos do que as pessoas esperam: encurta as palavras de código em vez de tirar pixels.

Se nada disso deixar pequeno o bastante, a resposta honesta é que o que você está fazendo é um vídeo. [Transformar essas mesmas imagens num MP4](https://abox.tools/pt/guias/transformar-imagens-em-video/) vai dar talvez um décimo do tamanho, e em todo lugar que aceita um GIF para outra coisa que não uma tag `<img>` — incluindo toda rede social — ele é convertido em vídeo no envio de qualquer forma.

## A que velocidade um GIF realmente toca

O formato guarda o atraso de cada quadro em centésimos de segundo, o que dá a entender que você poderia pedir 0,01 s e receber cem quadros por segundo. Não pode.

Todo navegador levanta um atraso abaixo de dois centésimos para um décimo de segundo. A regra vem dos anos 1990, quando as páginas viviam cheias de animações postas para tocar o mais rápido possível e as máquinas da época não aguentavam, e ela sobreviveu a todas as razões pelas quais foi criada. Nunca foi removida, e vale hoje para o seu GIF.

Então a faixa prática é:

- **0,02 s** (50 quadros por segundo) — o mais rápido que um GIF tem permissão de ser, e mais rápido do que costuma precisar.
- **0,05 s** (20 quadros por segundo) — animação lisa, e por onde começar se você está animando movimento.
- **0,1 s** (10 quadros por segundo) — a cara clássica de GIF. Metade dos quadros, metade do arquivo, e se lê como escolha.
- **0,5 s para cima** — uma apresentação de slides. Cada imagem está sendo olhada, não animada.

Nada abaixo de 0,02 s é oferecido, porque é um número que viraria caladamente 0,1 s em todo navegador que existe.

## A paleta, e o que ela está escolhendo de verdade

Um quadro de GIF guarda no máximo 256 cores. Uma fotografia tem dezenas de milhares. Alguma coisa precisa escolher 256 delas, e é essa escolha que define a aparência do resultado — mais do que qualquer outro ajuste.

A ferramenta oferece dois jeitos de fazer isso:

**As melhores cores para cada quadro** dá a cada imagem as suas próprias 256. É o que sai mais nítido, e é o certo para um conjunto de fotos sem relação, em que cada uma quer um conjunto completamente diferente de qualquer forma.

**Uma paleta para o GIF inteiro** monta uma tabela só a partir de todos os quadros de uma vez. Use quando os quadros forem uma *sequência* — a mesma cena, com alguns instantes de diferença. Com paleta por quadro, qualquer mudança na imagem muda quais 256 cores são escolhidas, e o fundo inteiro desloca ligeiramente de cor a cada quadro. Esse tremeluzir é a coisa que faz um GIF caseiro parecer caseiro. Uma paleta compartilhada tira isso, e ainda dá um arquivo menor, porque a tabela é escrita uma vez em vez de em todo quadro.

Menos cores — 128, 64, 32 — vale testar em qualquer coisa chapada. Uma animação de logo com oito cores não perde nada em 32, e numa fotografia você vê a diferença na hora.

![Os ajustes de cor: uma paleta de 128 cores, a escolha entre uma paleta compartilhada e uma por quadro, pontilhado desligado, e um resumo de quadros, duração e tamanho estimado.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

A paleta é o ajuste com maior efeito sobre o tamanho, e o que a maioria das ferramentas esconde. O resumo embaixo se mexe conforme você muda.

## Transparência é um bit, e a história é essa

Um pixel de GIF ou está totalmente pintado ou está totalmente invisível. Não existe meio-termo: nada de sombra a 50 %, nada de borda suave, nada de esmaecer.

Então, se as suas imagens de origem têm transparência, ligar isso mantém as áreas transparentes transparentes — mas toda borda suavizada, que é um degradê da forma para o nada, é cortada no meio do caminho e vira uma borda dura e visivelmente serrilhada. Formas redondas e texto sofrem mais.

Se você sabe em cima de que cor o GIF vai ficar, achatar nessa cor vai ficar melhor sempre. Guarde a transparência só quando o fundo em que ele vai cair for genuinamente desconhecido — e se a resposta for “ele precisa de borda suave em qualquer fundo”, o formato para isso é PNG animado ou WebP, não GIF.

## Ordem, tempo, e o laço fechando direito

Algumas coisas que é mais rápido saber do que descobrir:

**Ordenar por nome conta direito.** Uma sequência de render ou exportação se ordena do jeito que você quis, então `frame_2` cai antes de `frame_10` e não depois. Ordenar por data devolve um rolo de fotos à ordem em que foi tirado, que é o que você quer quando os nomes dos arquivos recomeçaram em 0001.

**Dê mais tempo ao último quadro.** Um laço com todos os quadros do mesmo tamanho lê como implacável. Segurar o último por meio segundo mais ou menos dá ao olho um lugar para descansar e faz tudo parecer intencional. Cada quadro tem o próprio tempo de espera para isso.

**Um laço não deveria dar solavanco.** O último quadro é seguido na hora pelo primeiro, então se esses dois forem muito diferentes o laço estala. Ou você deixa os dois parecidos, ou se apoia no corte segurando o último quadro.

**Tocar uma vez quer dizer uma vez.** Algumas ferramentas escrevem uma contagem de laço igual a um, sobre a qual os decodificadores nunca chegaram a um acordo completo — alguns tocam duas vezes. Escolher “Tocar uma vez” aqui não escreve informação de laço nenhuma, e isso todo decodificador já construído trata igual.

![Cinco quadros em ordem, cada um com o próprio campo de atraso, acima de uma linha que ajusta todos os atrasos de uma vez.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Ordem e tempo, os dois editáveis quadro a quadro. Ajustar tudo de uma vez é a linha de cima, que é o que qualquer um com mais de três quadros quer.

## Por que isso não precisa de servidor

Fazer um GIF são dois trabalhos que o navegador não oferece: escolher a paleta e comprimir os pixels com LZW. Nenhum dos dois é grande. Juntos dão talvez quatrocentas linhas, estão escritos por extenso no repositório, e rodam na sua própria máquina como todo o resto aqui — que é por isso que a página continua funcionando com a rede desligada.

A razão de tantos criadores de GIF subirem seus arquivos não é o trabalho ser difícil. É que servidor é onde ficam a publicidade e as contas. Nada em transformar um punhado de fotografias numa animação exige que as suas fotografias saiam da sala em que estão.

[É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) reúne quatro checagens que dizem a mesma coisa sobre qualquer ferramenta, esta inclusive.
