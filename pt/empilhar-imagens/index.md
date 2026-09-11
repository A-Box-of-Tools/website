# Empilhar imagens — junte uma sequência, arquivos RAW inclusive

Vinte quadros em um, sem vinte envios e sem um conversor RAW.

> Junte uma sequência de fotografias numa só: tire a média para matar o ruído, use a mediana para tirar as pessoas de uma cena, clareie para rastros de estrelas, ou faça focus stacking de uma macro. Lê CR2, NEF, ARW, DNG, RAF e CR3 puxando a prévia da própria câmera. Roda inteiramente no seu navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/empilhar-imagens/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem fotografias. Não existe servidor.

Cada quadro é aberto, decodificado, alinhado, combinado e escrito pelo seu próprio navegador, na sua própria máquina. Uma pilha de vinte arquivos RAW de 60 MB é cerca de um gigabyte de fotografias, e nenhum byte disso se move: a ferramenta não tem função de rede alguma, e os arquivos são lidos direto do seu disco por um worker que não tem para onde mandar nada.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca-d'água
- ✓ Lê RAW
- ✓ Funciona offline
- ✓ Código aberto

## Como empilhar um conjunto de fotografias no navegador

1. **Escolha os quadros.** Uma sequência, um conjunto em bracketing, uma série de intervalômetro ou uma pasta de arquivos RAW. Cada um é aberto conforme chega e a linha diz o que saiu dele — para um arquivo RAW, a câmera, o tamanho da prévia encontrada dentro, e quão pouco do arquivo precisou ser lido para encontrá-la.
2. **Escolha o método que combina com o que você quer perder.** Ruído: média, ou sigma clipping se alguma coisa se mexeu. Pessoas, carros ou um avião passando: mediana. Um céu escuro que você quer como rastros de estrelas: clarear. Uma macro feita ao longo do anel de foco: focus stacking. A nota abaixo do menu diz o que cada um faz com o seu número de quadros.
3. **Decida se os quadros precisam de alinhamento.** Na mão: sim, só deslocamento. Na mão e você também girava: deslocamento, rotação e escala. Tripé travado ou intervalômetro: não, e vai ser mais rápido. Cada quadro é medido contra o que estiver marcado como referência, que é o primeiro enquanto você não disser outra coisa: “Usar como referência” muda a marca e deixa a lista na ordem em que você a pôs.
4. **Leia os quatro números, e então aperte o botão.** Antes de qualquer coisa rodar, a página diz que tamanho terá o resultado, mais ou menos quanta memória vai levar, quantas vezes os quadros serão decodificados e quanto dos seus arquivos foi lido. Se o conjunto não couber na memória de uma vez, ela diz, e diz qual resolução de trabalho resolveria.

## A versão longa

[Como empilhar fotografias para reduzir o ruído, ou tirar pessoas](https://abox.tools/pt/guias/empilhar-fotos-para-reduzir-ruido/): Empilhar junta uma sequência de quadros numa imagem só. Qual método usar depende do que você quer perder: ruído, transeuntes, ou a profundidade de campo rasa de uma macro. Como cada um funciona, quanto custa, e onde os arquivos RAW entram.

## Também na caixa

- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.
- [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.
- [Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/): Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.
- [Imagem para ICO](https://abox.tools/pt/criar-favicon/): Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.

## Perguntas

### As minhas fotografias são enviadas para algum lugar?

Não. Cada quadro é aberto, decodificado, alinhado, empilhado e escrito pelo seu próprio navegador no seu próprio hardware. Esta ferramenta não tem função de rede alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles pertence a este site. Carregue a página uma vez, tire o cabo da internet, e ela continua funcionando. Isso importa mais aqui do que na maioria das ferramentas simplesmente pelo volume: uma pilha de vinte quadros RAW é cerca de um gigabyte, e enviar um gigabyte de fotografias para que se tire uma média delas é justamente o que esta ferramenta existe para evitar.

### Quais formatos RAW ele consegue ler, e como?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL e mais alguns — que é quase tudo o que as câmeras escrevem. O que ele lê deles é a prévia JPEG em tamanho cheio que a própria câmera renderizou no momento do disparo: a imagem na traseira da câmera, e a que o seu sistema operacional desenha como miniatura. Ela é encontrada percorrendo a estrutura de diretórios do arquivo, o que custa algumas leituras de poucos kilobytes cada, e depois pegando uma única fatia. **Não é um demosaicing dos dados do sensor.** O resultado carrega o balanço de branco e o estilo de imagem da câmera a oito bits por canal, em vez dos doze ou catorze bits de dados lineares do sensor que um conversor RAW lhe daria.

### Então por que não decodificar os dados do sensor direito?

Porque significaria embutir a LibRaw ou o dcraw — um segundo motor de dezenas de megabytes, para uma única família de formatos, cuja maior parte são esquemas de compressão de cada fabricante. Essa troca é discutida em `docs/what-can-be-built-here.md` no código-fonte deste site, onde o RAW de câmera está na lista dos descartados desde antes de esta ferramenta existir. O que mudou não foi a resposta àquela pergunta, mas a descoberta de que empilhar não precisa disso: as prévias são em resolução cheia, são o que a câmera teria lhe dado como JPEG de qualquer jeito, e lê-las é cerca de cem vezes mais rápido do que o demosaicing seria. Se você quer os dados do sensor, revele os quadros num conversor RAW antes e empilhe os TIFFs ou JPEGs que ele produzir — esta ferramenta aceita esses também.

### Quantos quadros ele aguenta, e de que tamanho?

Seis dos sete métodos trabalham em fluxo: mantêm um acumulador e leem cada quadro exatamente uma vez, então cem quadros custam a mesma memória que dois e a única coisa que cresce é o tempo. A mediana é a exceção, porque o valor do meio de um conjunto não se sabe até que se tenha o conjunto inteiro, então ela segura todos os quadros ao mesmo tempo — vinte quadros de 24 megapixels são cerca de 1,4 GB, que navegador nenhum lhe dá. Quando isso acontece, a imagem é cortada em faixas horizontais e empilhada uma faixa por vez, o que custa reler os quadros para cada faixa. A página calcula tudo isso antes de você apertar o botão e mostra o número, para que uma execução lenta nunca seja surpresa.

### O que o alinhamento dos quadros faz de fato?

Ele descobre quanto cada quadro se deslocou em relação ao quadro de referência e o desloca de volta, com precisão de fração de pixel. O método é a correlação de fase: o deslocamento entre duas imagens aparece como uma diferença de fase entre os seus espectros, então uma transformada de Fourier em cada uma acha um desvio de duzentos pixels tão barato quanto um de dois. O segundo ajuste recupera também rotação e escala, pelo mesmo truque aplicado ao espectro em coordenadas log-polares. Tudo isso é global — um deslocamento, um ângulo, uma escala para o quadro inteiro — então corrige uma câmera que se moveu e não corrige um assunto que se moveu, nem uma fotografia tirada um passo à esquerda. Uma consequência visível: um quadro deslocado vinte pixels para a esquerda já não alcança a borda direita, então o resultado é aparado até a parte que todos os quadros cobrem. É por isso que uma pilha alinhada volta um tantinho menor do que os quadros que entraram nela, e é a única alternativa a uma borda escura feita dos quadros que ali não estavam.

### Qual método eu devo usar?

**Média** para ruído, num conjunto em que nada se mexeu: ela corta o ruído aleatório em cerca da raiz quadrada do número de quadros. **Mediana** para tirar coisas que só estavam ali parte do tempo — o uso clássico é fotografar uma praça movimentada umas doze vezes e recebê-la vazia. **Sigma clipping** quando você quer as duas coisas: ele aprende o que cada pixel costuma ser e tira a média só dos valores que concordam com isso, então tem a imunidade da mediana a um carro passando e a redução de ruído da média. **Clarear** para rastros de estrelas, fogos de artifício e light painting. **Escurecer** para tirar qualquer coisa clara que tenha se mexido. **Somar** para simular uma única exposição longa. **Focus stacking** para uma macro feita ao longo do anel de foco.

### Por que o meu resultado tem oito bits se os meus arquivos RAW têm catorze?

Porque o que está sendo empilhado é a prévia da própria câmera, que é um JPEG. Vale dizer que empilhar recupera parte do que isso custa: tirar a média de dezesseis quadros de oito bits dá um resultado com gradações realmente mais finas do que qualquer um deles tinha, porque é justamente o ruído que fazia o arredondamento de cada quadro ser diferente que permite à média cair entre os níveis. Aqui a aritmética é feita em ponto flutuante e arredondada uma única vez no fim, então nada disso é jogado fora no meio do caminho. Continua não sendo a mesma coisa que empilhar dados lineares de sensor, e esta ferramenta não finge o contrário.

### Posso empilhar quadros de tamanhos diferentes, ou de câmeras diferentes?

Pode, embora costume ser um engano e valha a pena conferir se era o que você queria. O resultado fica do tamanho do maior quadro, e cada outro quadro é redimensionado para caber e centralizado nele. Misturar câmeras mistura também a interpretação de cor, então uma média das duas é uma média de duas leituras diferentes da mesma luz. Onde ajuda de verdade é num conjunto feito em duas resoluções, ou num arquivo RAW e um JPEG do mesmo quadro.

### Ele diz que a execução vai ser em faixas. O que isso quer dizer?

Que a memória de trabalho de que o método precisa é mais do que a ferramenta está disposta a reservar de uma vez, então a imagem vai ser cortada em tiras horizontais e empilhada uma tira por vez. Ela ainda produz exatamente o mesmo resultado; só relê os quadros para cada tira, então demora mais, e a página lhe diz quantas decodificações serão. Baixar um passo a resolução de trabalho divide a memória por quatro, o que quase sempre transforma uma execução em faixas numa passagem única — a nota diz qual ajuste faria isso.

### Por que esta ferramenta usa um Worker e nenhuma das outras usa?

Porque é a única cujo trabalho se mede em minutos. Toda outra ferramenta aqui faz algo que leva um segundo ou dois, onde tirar o trabalho da linha principal seria cerimônia. Empilhar vinte quadros grandes é aritmética densa sobre centenas de megabytes, e na linha principal isso significa uma página congelada: nenhuma barra de progresso andando, um botão Cancelar que não responde, e no fim um navegador se oferecendo para fechar a aba. O Worker é uma segunda linha de execução neste mesmo navegador, rodando um arquivo desta mesma pasta, sob esta mesma política. Não é um servidor e não é uma função de rede.

### É grátis, e eu preciso de conta?

É grátis, e não há conta, nem login, nem teste, nem marca-d'água. Também não há limite de quantos quadros você empilha ou de que tamanho eles são, porque não há um servidor pagando por isso — o trabalho acontece na sua própria máquina e o único teto é a sua memória. O site exibe publicidade, e é ela que o paga; os anunciantes não recebem nada sobre as suas fotografias.

## Como dá para conferir a promessa de privacidade

- **As suas fotografias não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles pertence a este site. Não existe aqui um endpoint onde os seus arquivos pudessem ser recolhidos, e não existe no código nada que os enviasse se existisse — nenhum `fetch`, nenhum `XMLHttpRequest`, nenhum `sendBeacon`, nem em `src/` nem no worker.
- **Os arquivos RAW são lidos, não enviados — e mal lidos.** Um arquivo RAW de câmera já contém um JPEG em tamanho cheio que a câmera renderizou no momento do disparo. Esta ferramenta o encontra percorrendo algumas entradas de diretório e depois pedindo uma única fatia, o que num arquivo de 60 MB costuma ficar abaixo de cem kilobytes. A página mostra esse número ao lado do tamanho dos seus arquivos enquanto você trabalha. Os dados do sensor não são lidos nunca.
- **O trabalho acontece num Worker nesta máquina, não num servidor.** Esta é a única ferramenta aqui que usa um, porque empilhar são minutos de aritmética em vez de segundos, e uma página congelada não consegue mostrar progresso nem ser cancelada. Um Worker é uma segunda linha de execução neste mesmo navegador — veja `src/worker.js`. Ele recebe os próprios arquivos, o que sai de graça, porque a referência a um arquivo não são os bytes; e ele tem exatamente a mesma Content-Security-Policy da página, ou seja, lugar nenhum para onde mandá-los.
- **Sobre o conjunto não se relata nada em lugar nenhum.** Quantos quadros você empilhou, que câmera os escreveu, quanto cada um tinha se deslocado, que método você escolheu e quanto tempo levou ficam na memória desta página até você fechá-la. Não existe neste repositório um evento de analytics próprio que carregue qualquer parte disso, e a única pergunta que este site faz depois de um download manda um polegar para cima ou para baixo e o nome da ferramenta, mais nada.
- **Funciona offline.** Desconecte da rede e a ferramenta continua a mesma, porque nunca houve um passo de rede nela. O worker e cada módulo que ele carrega ficam em cache pelo service worker desta página, então uma cópia instalada empilha arquivos RAW com a rede desligada.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/raw.js` para como um arquivo RAW é aberto lendo kilobytes em vez de megabytes, `src/stack.js` para a aritmética de cada método, e `src/plan.js` para de onde vêm os números de memória e de decodificação mostrados na página — são as respostas daquele arquivo, não estimativas.
