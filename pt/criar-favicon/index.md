# Imagem para ICO — criador de favicon e de ícone do Windows e do macOS

Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.

> Converta um PNG, JPEG ou SVG num .ico de verdade, com vários tamanhos, ou num .icns do macOS, no seu navegador. Favicon, ícone de aplicativo do Windows, ícone de app do Mac, mais os arquivos da Apple e do Android que um site precisa. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/criar-favicon/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

A escala e os próprios arquivos de ícone são feitos no seu próprio navegador. A imagem é desenhada pelo canvas que o seu navegador já traz, e cada contêiner, tanto o `.ico` do Windows quanto o `.icns` do macOS, é montado a partir daqueles pixels por umas duas centenas de linhas em `src/ico.js` e `src/icns.js` que você pode ler. Esta ferramenta não tem função de rede de espécie alguma: não há o que buscar nem o que mandar. E do outro lado desta página não existe servidor nenhum para onde mandar uma logomarca, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como criar um arquivo .ico sem enviar nada

1. **Escolha a imagem.** Arraste um PNG, JPEG, WebP ou SVG até o seletor, ou escolha várias e converta todas de uma vez. Quadrada é o mais fácil, e qualquer coisa a partir de 256 pixels tem detalhe suficiente para todos os tamanhos. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Escolha os arquivos de que você precisa.** O Windows e um navegador leem `.ico`, e um Mac lê `.icns` e nem olha para o outro. Marque um, ou os dois, se a coisa que você está fazendo sai nas duas plataformas. Um site quer também as imagens extras da Apple, do Android e do ladrilho, e essa é a terceira caixinha.
3. **Diga para que serve o ícone.** Um favicon de site tem 16, 32 e 48 pixels. Um aplicativo do Windows quer 256 também. Um aplicativo que precisa ficar bom num notebook de alta densidade quer os tamanhos intermediários que o Windows pede a 125% e 150% de escala. Escolha o que corresponde ao trabalho, ou marque os tamanhos você mesmo. Cada tamanho da lista diz quem pede por ele. O `.icns` não tem essa escolha: a Apple nomeia exatamente dez vagas e as dez entram.
4. **Resolva o formato e o fundo.** Um ícone é quadrado e a maioria das logomarcas não é. Completar com margem mantém a imagem inteira com espaço acima e abaixo, cortar pega o meio, e esticar achata. A transparência é mantida como transparência, a menos que você escolha uma cor para ficar atrás dela.
5. **Olhe o de 16 pixels antes de baixar.** É nesse tamanho que o ícone vai ser visto na maior parte das vezes, e é ali que traços finos e letras pequenas somem. Cada quadrado da pré-visualização é desenhado no tamanho real a partir do seu próprio arquivo. Se o menor deles for um borrão, o conserto é um desenho mais simples, e não outro ajuste.
6. **Leve os arquivos.** Um .ico com todos os tamanhos dentro, chamado `favicon.ico` quando foi isso que você pediu, porque é esse o endereço que os navegadores procuram. Um .icns ao lado, se você marcou aquilo, pronto para entrar num pacote de aplicativo de Mac. Marque também o conjunto de site e você leva ainda as imagens da Apple, do Android e do ladrilho do Windows, o manifesto, e o bloco de HTML para colar na sua página. Qualquer coisa além de um arquivo só baixa num zip.

## A versão longa

[Como criar um favicon que ainda se lê a dezesseis pixels](https://abox.tools/pt/guias/criar-um-favicon/): De quais tamanhos um favicon.ico realmente precisa, quais arquivos extras o iPhone, o Android e o Mac pedem, e por que uma logomarca que funciona num cartaz desaparece a dezesseis pixels.

## Também na caixa

- [Imagem para data URI](https://abox.tools/pt/imagem-para-base64/): A imagem inteira como uma linha de texto. Cole direto no CSS ou no HTML.
- [SVG para imagem](https://abox.tools/pt/svg-para-png/): Diga o tamanho. Um vetor não tem tamanho próprio a perder.
- [Imagem para SVG](https://abox.tools/pt/imagem-para-svg/): Uma forma, um contorno. Aponte para o que não deveria estar ali.
- [Comparador de alturas](https://abox.tools/pt/comparar-alturas/): Digite as alturas, leve a imagem. Nada é enviado para desenhá-la.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. Quem decodifica e escala a imagem é o seu próprio navegador, no seu próprio hardware, e o .ico é montado a partir daqueles pixels por código servido por esta página. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

### Quais tamanhos um favicon.ico deve conter?

16, 32 e 48. Isso não é preferência: 16 é o que um navegador desenha numa aba, 32 é o que o Windows usa para um atalho de área de trabalho e o que vários navegadores usam para um favorito, e 48 é o tamanho em que o Google lê o ícone de um site. Qualquer coisa maior pertence a um PNG ao lado do .ico em vez de dentro dele, que é justamente o que o conjunto de site daqui produz.

### De quais tamanhos precisa um ícone de aplicativo do Windows?

16, 32, 48 e 256, que é o que o próprio app.ico padrão do Visual Studio guarda. 16 é a barra de título e a visualização pequena do Explorer, 32 é a área de trabalho e a barra de tarefas, 48 são os ícones médios do Explorer, e 256 é o menu Iniciar e a visualização extragrande. Numa tela de alta densidade o Windows também pede 20, 24, 40, 64 e 96, e reamostra a partir do tamanho mais próximo que tiver se eles não estiverem lá. A predefinição de “todas as escalas” já coloca esses.

### Por que o arquivo ficou maior que a imagem de onde eu parti?

Porque um .ico não é uma imagem, são várias, e as pequenas são guardadas sem compressão para que qualquer coisa consiga lê-las. Uma entrada de 32x32 tem exatamente 4.264 bytes, seja lá o que houver nela, e uma entrada de 256x256 sem compressão tem 264 KB. É por isso que tamanhos acima de 64 são guardados como PNG por padrão. Escolher “PNG em todos os tamanhos” gera o menor arquivo possível, e escolher sem compressão em todos os tamanhos gera o mais compatível.

### Qual a diferença entre as entradas em PNG e as sem compressão?

Só como os pixels são guardados dentro do .ico. Uma entrada sem compressão é o arranjo original do Windows, com um cabeçalho de bitmap, os pixels de cabeça para baixo e uma máscara de transparência de um bit, e toda versão do Windows já lançada consegue ler. Uma entrada em PNG é um arquivo PNG inteiro enfiado dentro do ícone, o que é de três a dez vezes menor nos tamanhos grandes, mas só passou a ser entendido a partir do Windows Vista. O padrão usa cada um onde ele ganha: sem compressão até 64 pixels, PNG acima disso.

### Ele consegue fazer um ícone maior que 256 pixels?

Não, e nada consegue. O formato guarda cada lado num único byte, e o 0 já está tomado, porque significa 256. Esse é o teto, então um .ico contendo uma imagem de 512 pixels não é um ícone maior, é um ícone quebrado. Se você precisa de 512, precisa de um PNG, que é o que o conjunto de site inclui para o Android e para a tela de abertura de um aplicativo web.

### Ele mantém a transparência?

Mantém, nos dois tipos de entrada, e ainda escreve a antiga máscara de um bit ao lado do canal alfa, para que software velho demais para ler o alfa ainda recorte o ícone em vez de desenhar uma caixa preta. O único arquivo que é deixado opaco de propósito é o ícone de toque da Apple no conjunto de site, porque o iOS o compõe sobre o próprio ladrilho e transforma transparência em preto. Ele é achatado sobre a sua cor de fundo, branca por padrão.

### Minha logomarca é escrita e larga. O que acontece com ela?

Alguma coisa tem que acontecer, porque um ícone é quadrado. Completar com margem mantém tudo e deixa pequeno: uma logomarca escrita completada dentro de um quadrado de 16 pixels fica com uns três pixels de altura e ilegível. Cortar pelo meio costuma funcionar melhor, então tire o símbolo da composição e use aquilo, como quase toda marca faz no favicon dela. A pré-visualização mostra qual dos dois sobrevive antes de você baixar qualquer coisa.

### O que tem no conjunto de site, e eu preciso de tudo aquilo?

Sete PNGs, um manifesto de aplicativo web, um browserconfig.xml e um bloco de HTML para colar. Você precisa deles porque um .ico cobre navegadores e Windows e nada mais: uma tela inicial de iPhone lê um PNG de 180 pixels com um nome próprio, o Android e todo aviso de instalação leem o manifesto, e um ladrilho fixado no menu Iniciar lê o XML. Nenhum deles vai olhar dentro de um .ico. Tudo é gerado aqui, no seu computador, e o zip vem com uma nota dizendo para que serve cada arquivo.

### Ele também faz um ícone de macOS?

Faz. Marque *ícone do macOS* e você recebe um `.icns` ao lado do `.ico`, ou no lugar dele. É outro contêiner para a mesma ideia, e nenhum dos dois sistemas lê o do outro: o Windows quer .ico e um pacote de aplicativo de Mac quer .icns. Ali os tamanhos não são escolha, porque a Apple publica exatamente dez vagas, de 16, 32, 64, 128, 256, 512 e 1024 pixels, com três delas aparecendo duas vezes como a versão Retina do tamanho de baixo. As dez entram, desenhadas a partir de sete renderizações, e é por isso que um .icns é o arquivo maior.

### Como eu uso o arquivo .icns?

Para um aplicativo, ele vai no pacote em `SeuApp.app/Contents/Resources/` e é nomeado no `Info.plist` sob `CFBundleIconFile`. Toda ferramenta de empacotamento de Mac tem um campo para isso. Para qualquer outra coisa, selecione o arquivo no Finder, aperte Command-C, depois Obter Informações na pasta ou imagem de disco que você quer mudar, clique no ícone pequeno no canto superior esquerdo e aperte Command-V.

### O .icns é igual ao que o iconutil faz?

São as mesmas dez vagas com os mesmos tipos de quatro letras, e PNG em cada uma, que é o que o `iconutil` produz a partir de uma pasta `.iconset`. Existe uma diferença de propósito: a ferramenta da Apple também escreve um elemento `TOC` , um índice dos tipos e tamanhos que vêm depois. É uma otimização e não parte do formato, já que um leitor sem ele percorre os elementos de ponta a ponta e chega à mesma resposta. E um índice errado é pior que índice nenhum, então ele fica de fora.

### Posso converter várias imagens de uma vez?

Pode. Toda imagem da lista vira o próprio .ico com os mesmos ajustes, e o lote inteiro baixa num zip só, com uma pasta por imagem, senão duas delas se chamariam favicon.ico e uma sobrescreveria a outra. Toda saída que você marcou é feita para toda imagem. Clique em qualquer linha para pôr aquela imagem na pré-visualização.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. Também não tem limite para o número nem para o tamanho dos arquivos, porque não existe servidor pagando por eles: o trabalho acontece no seu próprio computador. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse a sua logomarca embora para ser convertida pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Sua logomarca não tem para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. A escala é um `drawImage` num canvas, e cada ícone é um cabeçalho escrito na frente daqueles pixels pelo `src/ico.js` ou pelo `src/icns.js`, nesta página.
- **O arquivo é descrito a partir dos próprios bytes dele.** A lista de tamanhos que aparece ao lado de um ícone pronto não é a lista de tamanhos que você pediu. Ela é lida de volta do arquivo que acabou de ser escrito, pelo `readIcoDirectory` ou pelo `readIcnsElements`. Se um escritor algum dia discordasse dos ajustes, a página diria isso, em vez de você descobrir quando o Windows não desenhasse nada e o macOS desenhasse uma folha de papel em branco.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre a sua imagem. Toda linha que lê, escala ou escreve um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/ico.js` e `src/icns.js` para os dois formatos de ícone, com o diretório, as entradas e a máscara num deles e as dez vagas nomeadas pela Apple no outro, e `src/sizes.js` para de onde vem cada tamanho da página.
