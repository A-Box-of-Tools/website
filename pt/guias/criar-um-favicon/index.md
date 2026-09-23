# Como criar um favicon que ainda se lê a dezesseis pixels

Um favicon não é uma foto pequena da sua logomarca. É um conjunto de imagens em tamanhos fixos, dentro de um contêiner que quase ninguém abre, e a menor delas é a que todo mundo de fato vê. Aqui estão os tamanhos de que você precisa, os arquivos que vão ao lado deles, e o que fazer quando a sua logomarca não sobrevive à descida.

[Abrir Imagem para ICO](https://abox.tools/pt/criar-favicon/): Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Imagem para ICO](https://abox.tools/pt/criar-favicon/), jogue dentro uma imagem quadrada de pelo menos 256 pixels, deixe a predefinição em *Favicon de site* e baixe o `favicon.ico`. Coloque na raiz do seu site, de modo que ele responda em `https://seusite.com/favicon.ico`. Esse endereço é pedido por todo navegador, mencione o seu HTML ou não, então a rigor não há mais nada que você precise fazer.

Tudo o que vem abaixo é a parte que faz a diferença entre um ícone que está tecnicamente presente e um que é legível: quais tamanhos entram, o que o iPhone e o Android pedem no lugar disso, e o que fazer quando a sua logomarca não sobrevive a ter dezesseis pixels de largura.

## Por que é um conjunto de tamanhos e não uma imagem só

Um arquivo `.ico` é um contêiner. Dentro dele há várias imagens completas da mesma coisa em tamanhos diferentes, e quem estiver lendo o arquivo escolhe a mais próxima do tamanho de que precisa.

Isso soa como redundância e não é. Um navegador desenhando o seu ícone a dezesseis pixels tem duas opções: ler uma versão de dezesseis pixels que você desenhou, ou diminuir uma maior na hora. A segunda é pior, e visivelmente, porque uma redução automática de uma logomarca detalhada vira mingau, ao passo que uma versão de dezesseis pixels que você olhou é algo que você teve chance de simplificar. O motivo inteiro de o formato guardar vários tamanhos é dar essa chance a você.

Três tamanhos é a convenção para um site, e cada um tem seu motivo:

- **⁦16×16⁩:** a aba do navegador, a barra de endereços, o menu de favoritos. É este que as pessoas veem. Se você só acertar um, acerte este.
- **⁦32×32⁩:** a barra de favoritos, um atalho de área de trabalho do Windows para o seu site, e a maioria dos navegadores numa tela de alta densidade, que desenham o ícone da aba a partir do 32 e o reduzem.
- **⁦48×48⁩:** o tamanho em que o Google lê o ícone de um site para os resultados de busca, e a visualização de ícones médios do Windows.

Qualquer coisa maior pertence a um PNG ao lado do `.ico`, e não dentro dele, por motivos que aparecem abaixo, nos arquivos para celular.

![A lista de predefinições com os tamanhos que cada uma inclui: dezesseis, trinta e dois e quarenta e oito pixels para um ícone de site, e um resumo do que vai dentro do arquivo.](https://abox.tools/screens/make-a-favicon/preset.webp)

Um .ico é um recipiente, e essa é a lista do que entra nele. A predefinição é um atalho para o conjunto que um navegador realmente pede.

## O problema dos dezesseis pixels

Esta é a parte sobre a qual ninguém avisa você. Dezesseis pixels são cerca de quatro milímetros numa tela normal: uma grade de 256 pontos ao todo, menos que as letras desta frase. Quase nada que foi desenhado para funcionar numa placa, num cartão de visita ou no cabeçalho de um site sobrevive a ser reduzido a isso.

O que some, na ordem:

- **Texto.** Uma logomarca escrita, encolhida dentro de um quadrado, fica com uns três pixels de altura. Ela não vira texto pequeno, vira uma barra cinza. É por isso que quase toda empresa que tem um símbolo além do nome usa só o símbolo como favicon, e por isso que as que não têm símbolo usam uma letra só.
- **Linhas finas.** Uma borda de um pixel numa logomarca de 512 pixels é um trinta e dois avos de pixel a dezesseis. Ela sai como uma névoa cinza tênue ao longo da borda, ou some.
- **Gradientes e sombras.** Não há espaço para uma transição. Uma sombra suave vira uma franja suja.
- **Detalhe dentro de detalhe.** Um ícone de um documento com escrita nele vira um retângulo com um borrão.

O conserto não é um ajuste, é outro desenho: uma marca simplificada com uma ou duas formas, contraste alto e nada de texto além de um único caractere. Desenhe essa versão a 32 ou 48 pixels de propósito, e use como origem.

O que uma ferramenta pode fazer é mostrar o problema antes de você publicar. A pré-visualização do [Imagem para ICO](https://abox.tools/pt/criar-favicon/) desenha cada tamanho no tamanho real na tela, que é o único jeito de julgar isso. Um ícone de dezesseis pixels exibido a sessenta e quatro fica ótimo e não diz nada a você.

![Uma tira de prévia com a mesma marca desenhada em dezesseis, trinta e dois, quarenta e oito, sessenta e quatro e cento e vinte e oito pixels.](https://abox.tools/screens/make-a-favicon/sizes.webp)

A versão de dezesseis pixels, ao lado da que você desenhou. É essa imagem que decide se a marca precisava ser simplificada.

## Sua logomarca não é quadrada. Completar ou cortar?

Um ícone é sempre quadrado, e a maioria das logomarcas não é, então alguma coisa tem que acontecer. Há três respostas, e elas não são igualmente boas.

**Completar com margem** mantém a imagem inteira e põe espaço acima e abaixo dela. É o padrão seguro e a escolha errada para uma logomarca escrita e larga: encaixar num quadrado algo três vezes mais largo que alto deixa a marca ocupando um terço da altura, o que a dezesseis pixels são cinco pixels de logomarca e onze de nada.

**Cortar pelo meio** pega o maior quadrado do centro. Numa composição, com um símbolo e o nome da empresa ao lado, isso muitas vezes corta os dois ao meio. Melhor cortar a origem você mesmo antes, até ficar só o símbolo, e então converter aquilo.

**Esticar** achata a imagem para caber. Quase não existe situação em que isso esteja certo, e a opção é oferecida principalmente para que a ferramenta não esteja fazendo isso em silêncio.

A resposta geral para uma logomarca larga: não converta a logomarca. Converta a parte dela que funciona sozinha.

## Transparente ou fundo sólido?

Transparente costuma ser o certo para um site. Abas de navegador são cinzas, brancas ou quase pretas, dependendo do navegador e do tema, e um ícone transparente assenta em todas. Um ícone com um fundo branco pintado é um retângulo branco numa barra de abas escura.

Duas exceções que vale conhecer:

- **Uma logomarca que é escura e mais nada** some no modo escuro. Se a sua marca é preta sobre branco por natureza, dê a ela um fundo colorido em vez de transparente, ou um contorno claro.
- **O ícone de toque da Apple tem que ser opaco.** O iOS desenha esse ícone sobre o próprio ladrilho arredondado e renderiza transparência como preto. Toda ferramenta que produz aquele arquivo deveria estar achatando por você, e a daqui achata, sobre branco por padrão.

## Os arquivos de que um site precisa e que não são o .ico

O `favicon.ico` cobre navegadores e Windows. Ele não cobre celulares, e é aqui que a maioria dos conjuntos de ícones caseiros para cedo demais. Outras três plataformas pedem os arquivos delas, com os nomes delas, e nenhuma vai olhar dentro de um `.ico`:

- **O iOS** lê `apple-touch-icon.png` a ⁦180×180⁩ quando alguém adiciona o seu site à tela inicial. Sem ele, o iOS usa uma captura de tela da página, que parece um erro.
- **O Android e todo aviso de instalação** leem um manifesto de aplicativo web, o `site.webmanifest`, que aponta para PNGs de 192 e 512 pixels. O de 512 também é o que um aplicativo web mostra na tela de abertura.
- **Um ladrilho do menu Iniciar do Windows** lê `browserconfig.xml`, que aponta para um PNG de ⁦150×150⁩. O menos importante dos três, e quatro linhas de XML.

Há mais um que é fácil errar: os lançadores do Android cortam um ícone adaptativo no formato que o celular preferir, seja círculo, quadrado arredondado ou aquele quase quadrado, e só os 80% centrais da imagem têm sobrevivência garantida. Um ícone desenhado de borda a borda perde os cantos. É isso que um ícone *maskable* é: a mesma imagem desenhada de propósito pequena dentro do quadrado, declarada à parte no manifesto.

Marcar o conjunto de site no [Imagem para ICO](https://abox.tools/pt/criar-favicon/) produz todos esses, o manifesto e o bloco de HTML que aponta para eles. Uma coisa que aquele bloco deixa de fora de propósito é um `<link>` para o `favicon.ico`: os navegadores pedem aquele endereço por conta própria, e nomeá-lo também faz o mesmo arquivo ser buscado duas vezes.

## Um ícone de aplicativo do Windows é outro conjunto

Se o ícone é para um programa e não para um site, os tamanhos mudam. O que o próprio `app.ico` padrão do Visual Studio contém é 16, 32, 48 e 256: os três tamanhos do shell mais o grande, de onde o menu Iniciar e a visualização de ícones extragrandes do Explorer desenham.

Numa tela de alta densidade o Windows também pede 20, 24, 40, 64 e 96, e os reamostra a partir do tamanho mais próximo que tiver quando estiverem faltando. Se isso importa depende do seu ícone: uma forma chapada sobrevive à reamostragem, uma detalhada não. Acrescentá-los mais ou menos dobra o arquivo, o que para um aplicativo não é nada, porque a conta é completamente diferente da de um favicon, em que o arquivo é buscado por cada visitante.

Mais uma coisa sobre tamanho: a entrada de 256 é onde estão os bytes. Guardada sem compressão ela sozinha tem 264 KB; guardada como PNG dentro do ícone costuma ficar abaixo de 30. Entradas em PNG são legíveis desde o Windows Vista, então o único motivo para evitá-las é software genuinamente mais velho que isso, ou um instalador ou ferramenta embarcada que interpreta ícones por conta própria.

## Um Mac lê um arquivo completamente diferente

Se o ícone é para um aplicativo de Mac e não para um de Windows, nada do que está acima se aplica: o macOS não lê `.ico` de jeito nenhum. Ele lê `.icns`, que é a mesma ideia noutra embalagem, com vários tamanhos num contêiner, e com três diferenças que vale conhecer.

- **Os tamanhos são fixos.** A Apple publica dez vagas e não há o que escolher: 16, 32, 64, 128, 256, 512 e 1024 pixels, com 32, 256 e 512 aparecendo duas vezes porque cada um é ao mesmo tempo um tamanho próprio e a versão Retina do tamanho de baixo.
- **Vai até 1024.** Um `.ico` para em 256, e é por isso que um arquivo de ícone de Mac tem várias centenas de kilobytes e um favicon tem quinze. Para um aplicativo entregue uma vez isso não é nada, porque só um favicon é buscado por cada visitante.
- **1024 pixels é o que a sua arte tem que aguentar.** Os dois problemas são pontas opostas da mesma imagem: um favicon tem que funcionar quando é minúsculo, e um ícone de Mac tem que se sustentar quando é enorme. Uma logomarca exportada a 512 e ampliada para 1024 fica macia numa tela Retina, e a App Store não aceita.

Para usar um: um pacote de aplicativo guarda o arquivo em `SeuApp.app/Contents/Resources/` e o nomeia no `Info.plist`. Para uma pasta ou uma imagem de disco, selecione o `.icns` no Finder, aperte Command-C, depois Obter Informações na coisa que você quer mudar, clique no ícone pequeno no canto superior esquerdo e aperte Command-V.

Marcar *ícone do macOS* no [Imagem para ICO](https://abox.tools/pt/criar-favicon/) escreve um, com ou sem o arquivo do Windows ao lado. Qualquer coisa entregue nas duas plataformas quer os dois, e os dois são desenhados a partir da mesma imagem na mesma passada.

## Conferindo que deu certo

Os navegadores guardam favicons em cache com mais teimosia do que quase qualquer outra coisa, então “subi e não mudou nada” costuma ser cache, e não erro. Duas coisas para tentar antes de voltar a editar arquivos:

- Abra `https://seusite.com/favicon.ico` diretamente. Se o arquivo baixar, ele está lá e você está olhando para um cache. Se der 404, ele não está na raiz.
- Carregue o site numa janela anônima, que em geral tem o próprio cache de ícones.

No Windows, um `.ico` pode ser conferido colocando-o numa pasta e alternando o Explorer entre os tamanhos de visualização: pequeno, médio, grande e extragrande desenham entradas diferentes do mesmo arquivo, então você consegue ver cada uma como o sistema vai ver.

Num Mac, um `.icns` abre no Preview, que lista cada vaga na lateral. O mesmo truque funciona no Finder: jogue o arquivo numa pasta e arraste o controle de tamanho nas opções de visualização para ver a troca entre as imagens de dentro.

## Nada disso precisa de envio

Escalar uma imagem é coisa que todo navegador faz há anos, e um `.ico` é um cabeçalho de seis bytes, dezesseis bytes por imagem, e então as imagens. Não há etapa nenhuma na criação de um que exija um servidor, e a ferramenta daqui não usa um: a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, e nenhum deles é deste site.

Isso vale mais aqui do que de costume. Uma logomarca entregue a um gerador gratuito de favicon é, com bastante frequência, uma marca ainda não lançada, já que o ícone é uma das primeiras coisas feitas e uma das últimas anunciadas. Se você prefere conferir a acreditar, carregue a página, desligue a internet e faça um assim mesmo. O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações que você pode fazer em qualquer ferramenta.
