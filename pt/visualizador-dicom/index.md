# Visualizador DICOM — abra um exame .dcm no navegador

Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.

> Abra exames de tomografia, ressonância, raio X e ultrassom no navegador. Janela e nível, percorra uma série inteira, meça em milímetros, leia cada tag DICOM e veja exatamente o que no arquivo identifica o paciente. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/visualizador-dicom/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem exames. Não existe servidor.

O exame é aberto e decodificado pelo seu próprio navegador: o cabeçalho, os pixels, a janela, as medidas. Do outro lado desta página não existe servidor algum para receber dados de saúde, nem se algo aqui quisesse mandar, e nada sobre o arquivo — nem o nome do paciente, nem o estudo, nem o nome do arquivo — é contado a ninguém.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu dispositivo

## Como abrir um arquivo DICOM

1. **Escolha os arquivos.** Um arquivo `.dcm`, ou a pasta inteira do disco — uma tomografia ou uma ressonância é um arquivo por corte, e arrastar todos de uma vez é o que remonta a série. Os arquivos são lidos direto do seu disco pelo navegador; nada é enviado a lugar nenhum enquanto você faz isso.
2. **Escolha a série.** Um estudo costuma trazer várias: o escanograma e depois cada aquisição. Cada uma é empilhada na ordem em que o aparelho a registrou, deduzida de onde cada corte está no corpo e não da numeração, que nem sempre corre no mesmo sentido.
3. **Ajuste a janela.** É o controle que deixa um exame legível, e é o que um editor de imagens não tem. Arraste sobre a imagem para alargar a janela e para cima ou para baixo para deslocar o centro, ou escolha uma das janelas com nome — pulmão, osso, cérebro, partes moles — numa tomografia, onde as unidades são as mesmas em qualquer aparelho do mundo.
4. **Percorra a pilha.** O controle deslizante abaixo da imagem anda pelos cortes, e as setas do teclado fazem o mesmo depois que você clica na imagem. Um arquivo com vários quadros — um laço de ultrassom, uma angiografia — toca com o botão ao lado.
5. **Meça alguma coisa.** Passe para Medir e arraste uma linha. Onde o arquivo diz a que distância estão os seus pixels, a resposta vem em milímetros e leva em conta pixels que não são quadrados; onde o arquivo não diz, a resposta vem em pixels e avisa, em vez de inventar uma escala.
6. **Leia o cabeçalho.** Cada elemento do arquivo, com o seu número, o nome que o padrão lhe dá e o que ele guarda, pesquisável. Acima dele, a lista do que neste arquivo em particular identifica o paciente — que é bem mais do que o nome.
7. **Leve o que precisar.** A imagem na tela como PNG, com a janela que você ajustou e sem nada gravado por cima, ou o cabeçalho inteiro em texto simples. Os dois são montados na página a partir do que já está lá.

## A versão longa

[Como abrir um arquivo DICOM, e o que há dentro de um](https://abox.tools/pt/guias/abrir-um-arquivo-dicom/): O que há num disco de hospital, por que os arquivos não têm extensão, como abrir um exame .dcm num navegador, o que janela e nível faz de fato, e o que um exame carrega sobre o paciente além da imagem.

## Também na caixa

- [Imagem para ICO](https://abox.tools/pt/criar-favicon/): Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.
- [Imagem para data URI](https://abox.tools/pt/imagem-para-base64/): A imagem inteira como uma linha de texto. Cole direto no CSS ou no HTML.
- [SVG para imagem](https://abox.tools/pt/svg-para-png/): Diga o tamanho. Um vetor não tem tamanho próprio a perder.
- [Imagem para SVG](https://abox.tools/pt/imagem-para-svg/): Uma forma, um contorno. Aponte para o que não deveria estar ali.

## Perguntas

### O meu exame é enviado para algum lugar?

Não. O arquivo é lido, decodificado e desenhado pelo seu próprio navegador no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar — nenhum deles pertence a este site. Tire o cabo da rede e ele continua abrindo exames. \
\
Isso vale mais aqui do que em qualquer outra página deste site. Um arquivo DICOM carrega no cabeçalho o nome do paciente, a data de nascimento e o número do prontuário, então enviar um para um visualizador significa entregar a um estranho um prontuário, e não uma imagem.

### Quais arquivos DICOM ele consegue abrir?

Arquivos não comprimidos em qualquer uma das três transfer syntaxes básicas — implicit e explicit little endian, e a big endian já retirada — além de deflated, RLE Lossless, JPEG baseline e JPEG Lossless, que é como está comprimida a maioria dos estudos de tomografia e ressonância num disco de hospital. \
\
Ele não decodifica JPEG 2000, JPEG-LS, nem as sintaxes MPEG e HEVC usadas para vídeo. Essas exigem codecs que são megabytes de biblioteca compilada, e uma página que buscasse um deles quando desse na telha não seria uma página que funciona offline. Um arquivo em uma dessas abre do mesmo jeito: o cabeçalho inteiro é lido e mostrado, e no lugar da imagem aparece uma linha nomeando o codec, em vez de um ícone de imagem quebrada que não diz nada.

### O que é “janela e nível”, e por que eu preciso disso?

Um corte de tomografia guarda cerca de quatro mil valores distintos e a sua tela mostra duzentos e cinquenta e seis cinzas. A janela é a escolha de qual fatia dessa faixa fica com todos eles: tudo abaixo é preto, tudo acima é branco, e o que está no meio se espalha pelos cinzas. \
\
É por isso que o mesmo arquivo parece um exame diferente sob dois ajustes, e por que pulmão e osso não podem ser vistos ao mesmo tempo. Numa tomografia os números são unidades Hounsfield, definidas em absoluto — a água é 0 e o ar é −1000 — então as janelas com nome nesta página são os mesmos números que um radiologista usa na estação de trabalho. Numa ressonância ou num ultrassom não existe escala assim, e a janela que abre é aquela que o próprio arquivo pede.

### Por que ele diz que a minha medida está em pixels?

Porque aquele arquivo não diz qual é o tamanho de um pixel. Pixel Spacing (0028,0030) é o campo que carrega isso, em milímetros, e muitíssimas imagens de ultrassom, documentos digitalizados e secondary captures simplesmente não o têm. \
\
Onde ele existe, a medida vem em milímetros e cada eixo é medido com o seu próprio espaçamento, o que importa nas imagens cujos pixels não são quadrados. Onde não existe, a resposta honesta é uma contagem de pixels, e é isso que ele diz, em vez de escolher uma escala e apresentar o resultado como um comprimento.

### Ele abriu a minha pasta como várias séries. Por quê?

Porque é isso que há nela. Um estudo é feito de séries — o escanograma e depois cada aquisição ou reconstrução — e cada arquivo declara a qual pertence em Series Instance UID (0020,000E). O menu é montado a partir disso e não da pasta, que normalmente tem todas misturadas numa única lista de nomes. \
\
Dentro de uma série os cortes são ordenados por onde cada um está no corpo, deduzido de Image Position e Image Orientation. Instance Number é a chave óbvia e é o recurso de reserva, não a primeira escolha: ele é atribuído por seja lá o que tenha escrito os arquivos e não precisa correr no mesmo sentido que o paciente.

### O que significa a lista “o que identifica o paciente”?

É cada campo do seu arquivo que nomeia a pessoa de quem é o exame, ou que estreita quem ela poderia ser, lido deste arquivo na sua máquina. A lista vem da PS3.15 do padrão DICOM — a parte que diz o que precisa sair antes de um conjunto de dados poder ser chamado de desidentificado. \
\
Ela está aí porque o que as pessoas erram não é achar que um exame tem um nome dentro. É quanta coisa mais ele tem: a data de nascimento, o número do pedido, o médico solicitante, a instituição, o número de série do aparelho e os UIDs do estudo, que são chaves perfeitas de volta ao arquivo que o gerou. Um exame de que só se apagou o nome não é anônimo. \
\
Esta ferramenta apenas mostra. Ela não escreve nada e não altera nada, então não consegue tirar nada disso.

### Ele consegue anonimizar um exame?

Não, e de propósito não finge que consegue. Esta página lê; não tem código que escreva um arquivo DICOM. O que ela faz é dizer exatamente o que há no seu, que é a parte difícil de descobrir e a parte sobre a qual as pessoas se enganam. \
\
Uma ferramenta que tira os identificadores é um trabalho à parte, com uma régua bem mais alta — precisa reescrever o arquivo sem tocar nos pixels, substituir os UIDs de forma coerente por um estudo inteiro e acertar nos elementos privados em que alguns aparelhos escondem uma segunda cópia do nome. Está no roteiro deste site, e não pregada num visualizador.

### Ele abre um arquivo sem a extensão .dcm, ou um arquivo danificado?

Sim para os dois. A extensão não é olhada: o que se verifica é o próprio arquivo. Um conjunto de dados escrito sem o preâmbulo habitual de 128 bytes — que é a cara de um exame puxado direto da rede — é lido deduzindo a codificação a partir do primeiro elemento, e a página diz que foi isso que ela fez. \
\
Um arquivo que termina no meio é lido até onde vai. Tudo o que vem antes do dano é mostrado, com uma nota dizendo em que byte ele parou. É justamente o caso em que um visualizador é mais necessário, então jogar o arquivo inteiro fora por causa dos últimos doze bytes seria o comportamento errado.

### Este é um visualizador diagnóstico?

Não. Não é um dispositivo médico, não passou por avaliação regulatória alguma, e nada aqui deve ser usado para tomar uma decisão clínica. A sua tela não é calibrada, o navegador não é uma cadeia de renderização validada, e nenhuma das duas coisas se resolve de dentro de uma página web. \
\
Para o que ele serve muito bem é todo o resto pelo qual se abre um exame: conferir o que há num disco, tirar um corte para uma aula ou um artigo, ler um cabeçalho, descobrir por que outro programa recusa o arquivo, e ver o que um exame carrega sobre a pessoa de quem ele é.

### Ele altera o meu arquivo?

Não. Esta ferramenta apenas lê. Não há arquivo de saída, não há recodificação e não há aqui um botão que escreva um DICOM — o que você pode baixar é um PNG da imagem na tela e uma cópia do cabeçalho em texto simples. O seu original continua intacto no seu disco.

### É grátis, e eu preciso de conta?

É grátis, e não há conta, nem login, nem teste. Não há limite de tamanho de arquivo nem de quantos arquivos você abre, além da memória da sua própria máquina. O site exibe publicidade, e é ela que o paga; os anunciantes não recebem nada sobre o seu arquivo.

### Funciona offline?

Sim. Carregue a página uma vez, depois desconecte da internet e ela continua funcionando. É também a maneira mais simples de provar que nada é enviado: uma ferramenta que mandasse o seu exame para ser desenhado em outro lugar pararia no instante em que você tirasse o cabo.

## Como dá para conferir a promessa de privacidade

- **O seu exame não tem para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles pertence a este site. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o enviasse se existisse. Antes estava escrito `connect-src 'none'`, que era absoluto; acrescentar publicidade custou isso, e dizê-lo faz parte do acordo.
- **Aqui isso pesa mais do que nas outras páginas.** Um arquivo DICOM não é uma imagem com alguns metadados. É um prontuário com uma imagem dentro: o nome do paciente, a data de nascimento, o número do prontuário, o número do pedido, o médico solicitante, a instituição e o número de série do aparelho são todos campos do cabeçalho, e viajam com o arquivo para onde quer que ele vá. Enviar um para um site só para olhá-lo significa entregar tudo isso a quem administra o site. É exatamente o que esta página existe para não fazer.
- **O leitor são catorze arquivos neste repositório.** Nada aqui usa uma biblioteca buscada em outro lugar. `src/dicom.js` percorre o arquivo, `src/dictionary.js` sabe como as tags se chamam, `src/pixels.js` devolve os bytes à condição de medidas, `src/rle.js` e `src/jpeg-lossless.js` expandem as duas formas comprimidas que esta página sabe decodificar, e `src/window.js` mapeia o que foi medido nos cinzas da sua tela.
- **Os identificadores estão listados para você, e para mais ninguém.** A página imprime todos os campos do seu arquivo que nomeiam ou estreitam a pessoa de quem é o exame, porque essa é a pergunta que precisa de resposta para quem está prestes a compartilhar um corte, e nenhum visualizador responde. Fica na tela à sua frente e não vai a lugar nenhum: não existe neste repositório um evento de analytics que carregue qualquer parte disso, e a página não conseguiria enviá-lo mesmo que existisse.
- **Ele lê. Ele não escreve.** Não existe aqui um botão que altere o seu arquivo, nem código que pudesse fazê-lo. O que você pode levar é um PNG da imagem na tela e uma cópia do cabeçalho em texto, ambos montados na página a partir do que já está nela. O seu original continua intacto no seu disco, o que é também a resposta honesta para o que acontece se você fechar a aba.
- **O que o Google carrega, e o que não recebe.** Os scripts de publicidade e medição vêm do Google. Nenhum dos dois recebe nada sobre o seu arquivo: nem os pixels, nem uma miniatura, nem um nome, uma tag, um paciente ou um nome de arquivo. Cada linha que lê, decodifica ou desenha um exame é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não recebe.** O botão “Buy me a coffee” no topo é desenhado por um script de cdnjs.buymeacoffee.com e busca as letras no Google Fonts. É um link e nada mais: não relata visita alguma, e não recebe nada sobre você nem sobre os seus arquivos. Nada acontece a menos que você clique, e para onde você iria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desconecte da rede e todas as partes desta página continuam funcionando. É a prova mais simples de todas: uma ferramenta que mandasse o seu exame para ser desenhado em outro lugar pararia no instante em que você tirasse o cabo.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/dicom.js` para o parser que percorre o arquivo, `src/pixels.js` para a decodificação dos pixels, `src/jpeg-lossless.js` para o codec que a maioria dos hospitais usa ao exportar, e `src/window.js` para a janela e o nível — e em nenhum deles existe uma linha capaz de alcançar a rede.
