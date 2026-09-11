# Imagem para SVG — vetorizar um logotipo, um estêncil ou uma silhueta em curvas

Uma forma, um contorno. Aponte para o que não deveria estar ali.

> Vetorize uma imagem em preto e branco num contorno SVG de verdade, no seu navegador. Logotipos, estênceis, assinaturas, desenhos a traço e silhuetas viram curvas que você pode ampliar a qualquer tamanho. Um clique tira o que o traçado pegou por engano. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/imagem-para-svg/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

O seu próprio navegador lê a imagem do disco, `src/mask.js` a reduz a um bit por pixel, `src/contour.js` percorre a borda da forma e `src/fit.js` ajusta curvas a ela — umas seiscentas linhas que você pode ler, sem motor nenhum por trás e sem nada para baixar para rodá-las. Esta ferramenta não tem função de rede de espécie alguma: nada para buscar, nada para enviar, e nenhum servidor do outro lado desta página para o qual mandar um desenho, mesmo que houvesse.

- ✗ Sem upload
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como vetorizar uma imagem em SVG sem enviá-la

1. **Escolha a imagem.** Um logotipo, um estêncil, uma assinatura, um carimbo, um desenho escaneado, uma silhueta. Qualquer coisa com uma forma clara vetoriza bem; a foto de um cômodo, não, e mais abaixo há um aviso claro em vez de uma surpresa no fim. O arquivo é lido direto do seu disco e nada é enviado a lugar nenhum enquanto isso.
2. **Diga o que é a forma.** Um desenho no papel se separa por **claro e escuro**, e o nível é calculado para você. A foto de um objeto, não — uma figura vermelho-escura sobre pedra cinza-escura é escuro sobre escuro, e nenhum brilho separa os dois. Essa quer **o assunto**, que aprende o que é o fundo numa faixa em volta da borda da imagem e guarda tudo o que não for ele.
3. **Olhe a linha vermelha, não as configurações.** O contorno é desenhado por cima dos pixels de onde ele veio, porque esse é o único lugar em que a questão pode ser resolvida: um contorno está certo ou errado em relação a esses pixels e a mais nada. Arraste qualquer uma das imagens para mover as duas, e role a rodinha para aproximar o bastante para ver o que a linha está fazendo de verdade.
4. **Tire com um clique o que não deveria estar ali.** Um cisco, um grampo, um carimbo, uma legenda, uma sombra. Um clique pega a mancha inteira daquela cor, e não um pixel, então você está apontando para uma forma; clique de novo para devolvê-la. Clicar num pedaço de fundo cercado o preenche, e é assim que um buraco que não deveria ser buraco se fecha.
5. **Ajuste a suavização só se precisar.** *Detalhe* é quanto a linha pode se afastar dos pixels ao ser simplificada, e é calculado por forma, a menos que você diga o contrário. *Nitidez dos cantos* decide quanto o contorno precisa virar para que essa curva fique como canto em vez de ser arredondada. A maioria das imagens não precisa mexer em nenhum dos dois.
6. **Pegue o SVG.** Um arquivo, um único `<path>`, sem regra de preenchimento para se preocupar: os contornos giram num sentido e os buracos no outro, e é isso que faz de uma forma com quarenta buracos um único elemento. Ele abre no Illustrator, no Inkscape, no Figma, num navegador e numa máquina de corte.

## A versão longa

[Como vetorizar uma imagem em SVG](https://abox.tools/pt/guias/converter-imagem-para-svg/): Transforme um logotipo, um estêncil, uma assinatura ou uma silhueta num contorno vetorial de verdade no seu navegador. Quais imagens vetorizam bem, quais nunca vão vetorizar, e como consertar as partes que o traçador erra.

## Também na caixa

- [Comparador de alturas](https://abox.tools/pt/comparar-alturas/): Digite as alturas, leve a imagem. Nada é enviado para desenhá-la.
- [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.
- [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.
- [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. O arquivo é lido pelo seu próprio navegador no seu próprio hardware, vetorizado por algumas centenas de linhas de JavaScript servidas desta origem, e devolvido como download. Esta ferramenta não tem função de rede de espécie alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página nomeia cada endereço que ela pode contatar, e nenhum deles pertence a este site.

### Isso vai transformar minha foto em SVG?

Não de um jeito útil, e a página vai dizer isso em vez de deixar você descobrir depois do download. Vetorizar transforma cada mancha de cor parecida numa forma própria, então uma foto volta como milhares de borrões sobrepostos e um arquivo muitas vezes maior que o JPEG, que abre devagar e não parece a foto. O que vetoriza bem é uma imagem com uma *forma* dentro: um logotipo, um estêncil, uma assinatura, um desenho a traço, uma silhueta. Para a foto de um único objeto, a configuração *o assunto* vai recortá-lo como uma silhueta única e sólida, o que é outra coisa, e genuinamente útil.

### Qual é a diferença entre os dois jeitos de achar a forma?

A pergunta que eles fazem. **Claro e escuro** pergunta se cada pixel é mais escuro que um nível, o que é exatamente certo para tinta no papel e inútil quando o assunto e o fundo são igualmente escuros. **O assunto** pergunta o que é o fundo — aprende isso numa faixa em volta da borda da imagem, mede cada pixel em relação a ele e guarda a maior coisa que não for ele. Isso funciona na foto de um objeto sobre um fundo mais ou menos liso, e falha numa imagem cortada tão rente que o assunto sai por três lados, porque as bordas de que ele aprende passam a ser o próprio assunto. Quando isso acontecer, você mesmo pode apontar o fundo.

### Por que a forma vetorizada tem buracos, ou perde as partes finas?

Porque a imagem já os tinha assim que virou um bit por pixel. Ligue *o que o traçador recebeu* para ver: abaixo de uns doze pixels o olho de uma letra já fechou e as hastes já se fundiram, e nenhuma vetorização recupera um buraco que não está lá. As soluções estão antes — mova o limiar, ou parta de um escaneamento maior. No modo *o assunto*, *fechar vãos de até* sela os buracos pequenos e *preencher sólido* fecha todo buraco que o fundo não alcança a partir da borda da imagem.

### Dá para consertar as partes que ele errou?

Dá, e é para isso que serve quase todo o terceiro passo. Clique em qualquer coisa que não deveria estar no desenho e ela some; clique de novo e ela volta. Um clique pega a mancha inteira daquela cor, então um clique tira um cisco inteiro ou um carimbo inteiro, e não um pixel. Clicar num pedaço de fundo cercado o preenche. As correções ficam guardadas separadas do limiar, então mover o controle depois não as joga fora.

### De que tamanho vai ficar o SVG?

Para uma forma, menor que a imagem: uma silhueta vetorizada costuma ter de um a cinco kilobytes, e um logotipo alguns a mais. A página diz exatamente, ao lado do download. Para uma foto ele será enorme, o que é o sinal mais claro de que esta é a ferramenta errada para aquele arquivo — e a página para de desenhar e avisa depois de umas mil formas separadas.

### Ele vetoriza em cores?

Não. Isto faz uma forma numa cor só, que é o caso que sai parecendo um desenho, e não uma fotocópia ruim. Vetorizar em cores significa reduzir a poucas cores e vetorizar cada uma como uma camada própria, e o resultado decepciona a maioria de quem pede. Se você precisa de cor, vetorize a forma aqui e preencha no seu programa de desenho.

### O que posso fazer com o SVG depois?

Ampliar a qualquer tamanho sem ele ficar borrado, recolori-lo com um único atributo, animá-lo, imprimi-lo, ou mandá-lo para uma máquina de corte ou um laser. É um único `<path>` sem regra de preenchimento para errar, então o Illustrator, o Inkscape, o Figma, um navegador e a maioria dos softwares de CNC leem todos do mesmo jeito.

### Existe limite para o tamanho da imagem?

O da sua máquina, não o nosso. Uma página A4 escaneada a 300 dpi — uns nove megapixels — vetoriza numa fração de segundo. Imagens maiores funcionam; só demoram mais, e o trabalho acontece no seu próprio processador, não numa fila em algum lugar.

### É de graça, e preciso de conta?

É de graça, e não há conta, login, período de teste nem marca d'água. Também não há limite de quantidade nem de tamanho dos arquivos, porque não existe servidor pagando por eles — o trabalho acontece na sua própria máquina. O site tem publicidade, que é o que o paga; os anúncios não recebem nada sobre os seus arquivos.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet, e ela continua funcionando. Esse também é o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse sua imagem embora para ser vetorizada pararia no instante em que você tirasse o cabo.

## Como dá para conferir a promessa de privacidade

- **Sua imagem não tem para onde ir.** A Content-Security-Policy nomeia cada endereço que esta página pode contatar, e nenhum deles pertence a este site. Não existe aqui um ponto onde seus arquivos pudessem ser recolhidos, nem nada no código que os mandaria para lá se existisse.
- **Nada aqui busca coisa alguma.** Não há `fetch`, `XMLHttpRequest` nem `sendBeacon` em lugar nenhum de `src/`. A ferramenta inteira é aritmética sobre os pixels de uma única imagem: um limiar, um percurso pela borda do que ela encontrou e um pouco de ajuste de curvas.
- **Não há motor nenhum para baixar.** Vetorizar costuma ser o programa de outra pessoa, e na web isso significa vários megabytes de código compilado chegando antes do primeiro clique. Aqui não há nada disso. A coisa toda são algumas centenas de linhas de JavaScript comum servidas desta origem, o que também é o motivo de a página funcionar no instante em que abre, e não depois de uma espera.
- **O que o Google carrega, e o que não recebe.** Os scripts de anúncio e medição vêm do Google, e o botão de doação do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre a sua imagem. Cada linha que a lê, aplica o limiar ou a vetoriza é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. É a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/mask.js` para ver como uma imagem vira um bit por pixel, `src/contour.js` para o percurso pela borda da forma, `src/fit.js` para ver como uma escada vira curvas, e `src/subject.js` para ver como o fundo é descoberto quando não há claro e escuro para separar.
