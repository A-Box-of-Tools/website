# Como abrir um arquivo DICOM, e o que há dentro de um

Um disco de hospital é uma pasta de arquivos sem extensão e um visualizador escrito para o Windows XP. Os arquivos são DICOM, e não há nada de exótico neles: um exame é um cabeçalho cheio de campos e um bloco de pixels. É assim que se olha para um, é isso que os controles significam, e é isso que o arquivo carrega além da imagem.

[Abrir Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/): Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/) e arraste a pasta inteira de arquivos para ele. Eles são lidos na sua própria máquina, devolvidos às séries de onde vieram, e empilhados na ordem em que o aparelho os registrou. Nada é enviado, e nada é escrito de volta nos seus arquivos.

Se lhe deram um disco e você está se perguntando qual arquivo abrir: todos, de uma vez. Uma tomografia ou uma ressonância não é um arquivo. É um arquivo por corte, e um estudo de tórax são trezentos deles.

## O que há num disco de hospital

Normalmente quatro coisas, e só uma delas importa.

- **Uma pasta de exames**, muitas vezes chamada `DICOM`, `IMAGES` ou `ST0001`, com arquivos chamados `IM000001`, `I0000001` ou um número longo com pontos. Frequentemente sem extensão alguma. Isto é o exame.
- **Um arquivo chamado `DICOMDIR`**. Um índice do resto, escrito para que um visualizador consiga listar os estudos do disco sem abrir cada arquivo. Você não precisa dele.
- **Um visualizador**, como executável do Windows, como entrada de autorun, ou de vez em quando como applet Java. Ele foi compilado para o que era atual quando o disco foi gravado, e é por isso que tantos já não rodam.
- **Uma página HTML ou um PDF** com o logotipo do hospital, explicando como iniciar o visualizador.

Os exames não precisam daquele visualizador. O formato é um padrão publicado e os arquivos são legíveis por si; o executável no disco é um programa que poderia lê-los, não o único.

## Por que os arquivos não têm extensão

Porque o DICOM não precisa de uma. Cada arquivo carrega a sua própria marca: 128 bytes de nada, depois as quatro letras `DICM`, depois um pequeno bloco de campos descrevendo como o resto do arquivo está escrito. Um leitor procura aquelas quatro letras, e não um nome terminado em `.dcm`.

É também por isso que renomear um arquivo para `.dcm` não muda nada, e por que um visualizador que insiste na extensão está sendo desnecessariamente rígido. Arquivos escritos direto de uma rede de hospital nem sequer têm os 128 bytes e a marca — são os dados nus, sem nada na frente, e um leitor precisa deduzir do primeiro campo como estão codificados. Isso é um arquivo normal, não um arquivo quebrado.

## Janela e nível, que é o controle que importa

Esta é a única coisa que torna uma imagem médica diferente de uma fotografia, e a razão pela qual um editor de imagens não serve para olhar uma.

Um corte de tomografia guarda cerca de quatro mil valores distintos. A sua tela mostra duzentos e cinquenta e seis cinzas. Alguma coisa precisa decidir quais quatro mil vão para quais duzentos e cinquenta e seis, e essa decisão é a **janela**: tudo abaixo dela é preto, tudo acima é branco, e a faixa do meio se espalha pelos cinzas.

Mova a janela e o mesmo arquivo parece um exame diferente. Isso não é um artefato de renderização, é justamente o ponto. Pulmão e osso estão os dois no corte e não podem ser vistos ao mesmo tempo: uma janela que mostra a textura de um pulmão insuflado põe todos os ossos em branco puro, e uma que mostra o detalhe trabecular de uma costela põe o pulmão inteiro em preto puro.

Numa tomografia os números são **unidades Hounsfield**, e são definidas em absoluto em vez de por aparelho: a água é 0 e o ar é −1000, por definição, em qualquer tomógrafo do mundo. É por isso que um visualizador pode oferecer janelas com nome — pulmão, osso, cérebro, partes moles — e elas significarem no seu arquivo o mesmo que na estação onde o exame foi laudado. As de sempre:

- **Partes moles** — centro 40, largura 400.
- **Pulmão** — centro −600, largura 1500.
- **Osso** — centro 300, largura 1500.
- **Cérebro** — centro 40, largura 80. Uma janela estreita, porque a substância cinzenta e a branca diferem por poucas unidades.

Numa ressonância não existe escala assim. Os valores dependem da sequência, da bobina e do aparelho, então não há o que batizar de preset e a janela por onde começar é aquela que o próprio arquivo pede. Todo exame carrega uma sugestão.

![O visualizador: um corte em tons de cinza com os controles de janela e nível ao lado, predefinições para faixas de tecido comuns e os dados do exame nos cantos.](https://abox.tools/screens/open-a-dicom-file/viewer.webp)

Janela e nível são os dois controles que importam. Um exame guarda mais tons do que uma tela consegue mostrar, e são eles que decidem quais você está vendo.

## Por que às vezes os cortes correm ao contrário

Um visualizador precisa decidir em que ordem pôr os arquivos, e há duas coisas no arquivo que ele poderia usar.

**Instance Number** é um contador. É a escolha óbvia e é atribuído por seja lá o que tenha escrito os arquivos, que não precisa numerá-los no sentido em que corre o paciente. Um estudo reconstruído dos pés para cima e numerado da cabeça para baixo corre de trás para frente, e uma série montada a partir de duas reconstruções pode repetir os números abertamente.

**Image Position (Patient)** é onde o corte está fisicamente, em milímetros, num sistema de coordenadas preso ao paciente e não ao aparelho. Ordenar por isso está certo faça o que fizer a numeração, e tem um efeito colateral útil: uma vez que os cortes estejam em ordem física, a distância entre eles é mensurável, então um visualizador pode lhe dizer que os cortes estão a 5 mm um do outro — e perceber quando falta um, coisa que o arquivo nunca diz.

## Medir alguma coisa

Um exame é dado medido, então um comprimento nele é um comprimento de verdade — se o arquivo disser a que distância estão os seus pixels. Isso é um campo só, Pixel Spacing, em milímetros, e está presente em essencialmente toda tomografia e toda ressonância.

Ele costuma faltar em imagens de ultrassom, em documentos digitalizados e em capturas de tela salvas como DICOM. Onde falta, não existe resposta honesta em milímetros, e um visualizador que dá uma assim mesmo inventou uma escala. Uma contagem de pixels é a resposta correta a uma pergunta que o arquivo não pode responder.

Fique atento também a pixels que não são quadrados, o que fora da tomografia é normal. Medir em pixels e multiplicar por um único número de espaçamento só está certo onde os dois coincidem; cada eixo precisa ser medido com o seu.

## O que um exame carrega além da imagem

Esta é a parte sobre a qual as pessoas se enganam, e a razão para ter cuidado com estes arquivos.

Um arquivo DICOM não é uma imagem com alguns metadados anexados. É um prontuário com uma imagem dentro. O cabeçalho é uma lista de campos, e num exame clínico típico ele guarda:

- o nome do paciente, o número do prontuário, a data de nascimento e o sexo;
- o número do pedido, que é a chave para a solicitação no sistema do hospital;
- o médico solicitante, o técnico que realizou o exame, o radiologista que o laudou;
- a instituição, o endereço dela e o setor;
- o fabricante do aparelho, o modelo e o número de série;
- a data e a hora do exame ao segundo;
- e um conjunto de identificadores únicos — estudo, série, instância — que são chaves perfeitas de volta ao arquivo de onde ele veio.

Qualquer arquivo que lhe tenham dado carrega tudo isso, e tudo isso viaja com o arquivo para onde quer que o arquivo vá. Apagar o nome não basta: uma data de nascimento, uma instituição do tamanho de um CEP e a hora de um exame identificam uma pessoa mais ou menos tão bem quanto um nome, e o UID do estudo a identifica exatamente para quem tiver acesso ao arquivo.

Alguns aparelhos guardam ainda uma segunda cópia do nome do paciente num campo privado, que é um campo cujo significado não está publicado em lugar nenhum e no qual a maioria dos anonimizadores não mexe, porque não têm como saber o que há nele.

![Um cartão listando o que no arquivo identifica o paciente: o nome, o identificador, a data de nascimento e a descrição do exame.](https://abox.tools/screens/open-a-dicom-file/identity.webp)

O que um exame carrega além da imagem. É o cartão que explica por que não convém mandar um por e-mail.

## Não envie o exame só para olhá-lo

A maneira de sempre pela qual esse problema é resolvido é uma busca por “dicom viewer online” e uma caixa de envio. O que acabou de acontecer é que um estranho tem uma cópia de um prontuário: os pixels, o nome, a data de nascimento, o número do prontuário e a chave de volta ao arquivo.

Não há razão para isso. Ler um arquivo DICOM é analisar um cabeçalho e desempacotar alguns números inteiros, e um navegador faz isso perfeitamente bem, e é por isso que o [visualizador daqui](https://abox.tools/pt/visualizador-dicom/) não tem função de rede alguma: nenhum `fetch`, nenhum `XMLHttpRequest`, nada capaz de enviar um arquivo mesmo que algo tentasse. Carregue a página uma vez, desconecte da internet, e ela continua abrindo exames.

[É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) explica como conferir essa afirmação neste site ou em qualquer outro. Este é o tipo de arquivo em que mais vale a pena conferir.

## O que um navegador não consegue fazer

Duas coisas, e sobre as duas vale a pena ser franco.

**Não é um visualizador diagnóstico.** A sua tela não é calibrada, o navegador não é uma cadeia de renderização validada, e nenhuma página web passou por avaliação regulatória. Ler um exame para tomar uma decisão clínica é trabalho para a estação em que ele foi laudado. Olhar o que há num disco, tirar um corte para uma aula ou um artigo, ler um cabeçalho, ou descobrir por que outro programa recusa o arquivo são todos motivos perfeitamente bons para abrir um num navegador.

**Alguns exames comprimidos não decodificam.** O DICOM permite vários esquemas de compressão e os navegadores implementam um deles. Arquivos simples, arquivos codificados em run-length, JPEG baseline e JPEG Lossless — que é o que a maioria das exportações de hospital usa — abrem todos. JPEG 2000, JPEG-LS e os formatos de vídeo exigem codecs que são megabytes de biblioteca compilada. Onde a imagem não pode ser decodificada, o cabeçalho continua inteiramente legível, e essa costuma ser de qualquer forma a metade pela qual você veio.
