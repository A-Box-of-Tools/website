# SVG para imagem — rasterizar um vetor em PNG, JPEG ou WebP em qualquer tamanho

Diga o tamanho. Um vetor não tem tamanho próprio a perder.

> Converta um SVG em PNG, JPEG ou WebP em qualquer tamanho, no seu navegador. Diga a largura, um multiplicador ou uma caixa, e leve também as cópias @2x e @3x. A transparência é mantida e nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/svg-para-png/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem arquivos SVG. Não existe servidor.

O desenho é rasterizado pelo mesmo motor que acabou de colocá-lo na sua tela. O seu arquivo é lido do seu disco, a tag raiz dele é reescrita para o tamanho que você pediu por cem linhas em `src/svg.js` que você pode ler, e ele é desenhado num canvas que o seu navegador já traz. Esta ferramenta não tem função de rede de espécie alguma: não há o que buscar nem o que mandar. E do outro lado desta página não existe servidor nenhum para onde mandar uma logomarca, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como converter um SVG em PNG sem enviá-lo

1. **Escolha o SVG.** Arraste um até o seletor, ou escolha uma pasta cheia deles e converta o lote de uma vez. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso. Cada linha diz que tamanho o arquivo acha que tem, e diz de outro jeito quando aquele tamanho veio do `viewBox` ou foi presumido porque o arquivo não declara nenhum.
2. **Diga de que tamanho.** Um multiplicador do tamanho próprio do arquivo é a resposta mais rápida e a certa para um lote, porque cada desenho é escalado a partir do próprio ponto de partida e um conjunto de ícones continua em proporção. Fora isso, diga uma largura, uma altura, o lado maior, ou uma caixa com os dois lados. Aqui não existe penalidade por um número grande, como existiria com uma fotografia: o desenho é redesenhado naquele tamanho, não esticado até ele.
3. **Acrescente as cópias de alta densidade, se precisar delas.** Um celular e um notebook Retina desenham dois ou três pixels de aparelho para cada pixel de CSS, então uma logomarca de 200 pixels precisa de um arquivo de 400 ou 600 pixels por trás. Peça `@2x` e `@3x` e elas saem nomeadas do jeito que o Xcode, as ferramentas do Android e o `image-set()` do CSS esperam, e cada uma é exatamente o dobro ou o triplo da primeira, em vez de arredondada à parte.
4. **Escolha o formato e decida sobre a transparência.** PNG, a menos que você tenha um motivo, porque é sem perdas, mantém a transparência e comprime bem cor chapada. O JPEG não tem transparência nenhuma, então uma cor de fundo é pintada quer você escolha uma ou não, já que sem ela cada pixel transparente sairia preto. O WebP faz as duas coisas e gera um arquivo menor, ao custo de software velho o bastante para não lê-lo.
5. **Olhe a pré-visualização antes de baixar.** Ela é desenhada pelo mesmo código que escreve o arquivo, a partir do seu arquivo, no seu computador. Duas coisas mudam quando um desenho vira pixels, e as duas aparecem aqui: um fio de cabelo que tinha meio pixel de largura fica cinza, e qualquer texto é desenhado com uma fonte que este computador tem, e não com uma buscada na web.
6. **Leve os arquivos.** Um download por arquivo, ou o lote inteiro num zip só. Os nomes seguem o SVG de onde vieram, com `@2x` e `@3x` nas cópias, e dois arquivos que teriam o mesmo nome são numerados em vez de um substituir o outro em silêncio.

## A versão longa

[Como converter um SVG em PNG no tamanho certo](https://abox.tools/pt/guias/converter-svg-para-png/): Um vetor não tem tamanho em pixels próprio, então o número é escolha sua. De onde vem esse número para uma tela, um ícone de aplicativo e uma impressora, e o que muda quando um desenho vira pixels.

## Também na caixa

- [Imagem para SVG](https://abox.tools/pt/imagem-para-svg/): Uma forma, um contorno. Aponte para o que não deveria estar ali.
- [Comparador de alturas](https://abox.tools/pt/comparar-alturas/): Digite as alturas, leve a imagem. Nada é enviado para desenhá-la.
- [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.
- [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.

## Perguntas

### Meu SVG é enviado para algum lugar?

Não. Quem lê o arquivo é o seu próprio navegador, no seu próprio hardware, e quem o desenha num canvas é o mesmo motor que renderiza qualquer outra imagem que você vê. Depois ele volta como download. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

### Em que tamanho eu deveria rasterizar um SVG?

No que a coisa que vai lê-lo pedir, multiplicado pela densidade de pixels da tela em que ele vai ser visto. Uma logomarca que ocupa 200 pixels de CSS precisa de 400 num notebook Retina e de 600 num celular recente, que é o que as cópias `@2x` e `@3x` daqui são. Para um ícone de aplicativo ou uma ficha de loja, a loja nomeia um número exato e é esse o número. Quando ninguém disse nada a você, 1024 no lado maior é um padrão útil: grande o bastante para quase qualquer uso e pequeno o bastante para mandar por e-mail.

### Deixar maior perde qualidade?

Não, e este é o único lugar onde essa resposta é honestamente não. Um vetor é instrução em vez de pixel, então o navegador desenha as curvas de novo no tamanho que for pedido. 4000 pixels a partir de um ícone de 24 pixels é exatamente tão nítido quanto 24 era. O que não dá é ir no sentido contrário: assim que virou PNG, é pixel como qualquer outra coisa. Rasterize no tamanho de que você precisa, em vez de redimensionar o resultado depois.

### Meu SVG não tem width nem height. Que tamanho eu recebo?

O do `viewBox`, se houver um. A largura e a altura dele são unidades de usuário e não pixels, mas são os únicos números do arquivo, e um navegador os trata como o tamanho natural do desenho. Se também não houver viewBox, a página diz *presumido* ao lado da linha e usa ⁦300 × 150⁩, que é o tamanho em que um `<img>` o teria desenhado. De todo jeito, você pode dizer o tamanho que quer e o arquivo é desenhado naquele.

### Por que o texto ficou diferente no PNG?

Porque a fonte não está no SVG. Um SVG que desenha texto nomeia uma fonte e deixa a máquina encontrá-la, e um arquivo que puxa uma do Google Fonts com um `@import` não recebe nada aqui: um SVG desenhado por meio de um `<img>` não tem permissão de buscar coisa alguma, que é a mesma regra que o impede de dar notícia a alguém com o seu arquivo. O conserto é o que todo designer já sabe: converta o texto em traçados no programa de desenho antes de exportar. Aí vira geometria, e fica igual em todo lugar.

### Ele consegue converter vários arquivos de uma vez?

Consegue. Todo SVG da lista é renderizado com os mesmos ajustes e o lote inteiro baixa num zip só. Um multiplicador, do tipo “4× o tamanho que o arquivo pede”, costuma ser o ajuste certo para um lote, porque cada desenho é escalado a partir do próprio tamanho em vez de todos serem forçados ao mesmo número de pixels. Clique em qualquer linha para pôr aquele na pré-visualização.

### Existe limite de tamanho?

O do navegador, não o nosso. Um canvas desiste em algum ponto acima de 16.384 pixels de lado, e o Safari num iPhone ou iPad para em cerca de 16,7 megapixels de área, ou seja, ⁦4096 × 4096⁩. Acima disso a página avisa você em vez de devolver uma imagem em branco, que é o que um navegador faz quando não dá conta: o `toBlob` não devolve nada, sem erro nenhum para se explicar. Passando de 100 megapixels a ferramenta recusa, porque isso dá 400 MB de canvas antes de um byte ser codificado.

### O que acontece com a transparência?

Ela é mantida, em PNG e em WebP. O JPEG não tem canal alfa nenhum, então uma cor é pintada atrás da imagem inteira, você pedindo uma ou não. Sem ela, tudo o que é transparente sairia preto, o que parece defeito em vez de parecer JPEG. Escolher uma cor de fundo com PNG também é uma coisa perfeitamente comum de se querer, porque isso achata o desenho sobre aquela cor em vez de deixar um buraco.

### Ele consegue ler um SVG que contém um script ou uma imagem externa?

Consegue ler um, e vai desenhar exatamente as partes que um navegador se dispõe a desenhar. Um SVG carregado por meio de um `<img>` fica em *modo estático seguro*: scripts não rodam, referências externas não são buscadas e animação não toca, então o que você recebe é o primeiro quadro. Um arquivo com um `<image>` remoto sai com aquela parte faltando. É o navegador recusando em seu nome, e é o motivo de esta página conseguir abrir com segurança um arquivo que nunca viu.

### Qual a diferença entre isto e o Redimensionador de imagens?

A origem. O Redimensionador de imagens parte de pixels, como um JPEG ou um PNG, então deixar maior obriga a inventar detalhe que nunca esteve lá. Este aqui parte de um desenho, então não há o que inventar nem limite superior que valha a preocupação. Se o que você tem é um SVG, é este que entrega um resultado nítido. Se o que você tem é uma fotografia, é aquele.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. Também não tem limite para o número nem para o tamanho dos arquivos, porque não existe servidor pagando por eles: o trabalho acontece no seu próprio computador. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre os seus arquivos.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse a sua arte embora para ser renderizada pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Sua arte não tem para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. O rasterizador inteiro é um `<img>` segurando um blob do seu próprio arquivo, um `drawImage` num canvas e um `canvas.toBlob`.
- **Um SVG é um documento, e este é o modo em que ele não consegue agir.** Um SVG pode carregar um `<script>`, um `<image href="https://…">` remoto, uma folha de estilo e uma fonte da web. Desenhado por meio de um `<img>`, ele fica no que a especificação chama de *modo estático seguro*: o script não roda e nenhum daqueles endereços é buscado. Essa é uma garantia do navegador, não uma promessa nossa, e é o motivo de esta página conseguir abrir um arquivo que nunca viu sem que o arquivo consiga dar notícia a ninguém.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre o seu desenho. Toda linha que lê, dimensiona ou desenha um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/svg.js` para como o tamanho próprio de um arquivo é lido e como a tag raiz dele é reescrita, e `src/render.js` para as oito linhas que fazem a rasterização: um <img>, um `drawImage` e um `toBlob`, sem nada no meio.
