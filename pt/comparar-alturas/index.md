# Comparar alturas — um gráfico lado a lado para baixar

Digite as alturas, leve a imagem. Nada é enviado para desenhá-la.

> Compare alturas lado a lado. Acrescente um homem, uma mulher, um menino, uma menina e objetos — uma porta, uma janela, um quadro branco, uma máquina de vendas — em centímetros ou em pés e polegadas, e baixe o gráfico como PNG ou SVG. Ele é desenhado no seu navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/comparar-alturas/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem nomes, alturas e o gráfico que eles formam. Não existe servidor.

Um gráfico de alturas é aritmética e um desenho: não há arquivo nenhum para enviar nem serviço nenhum para consultar — e o único arquivo que esta página aceita, uma imagem sua para pôr na régua, é lido aqui e não vai a lugar nenhum. O homem, a mulher, o menino e a menina são ilustrações de domínio público que vão junto com esta página, e o menino e a menina são desenhos de crianças de verdade, não adultos encolhidos — que é o que impede um gráfico de família de ficar errado de um jeito que ninguém sabe nomear. Cada passo acontece em umas poucas centenas de linhas de JavaScript desta página que você pode ler. Não existe função de rede de espécie alguma, e aqui isso importa porque o que você digita é uma lista de pessoas e a altura de cada uma.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como fazer um gráfico de comparação de alturas

1. **Acrescente todo mundo primeiro, depois pense na aparência.** Uma linha é uma figura, um nome, uma altura e uma cor. O nome é opcional — um gráfico de duas silhuetas sem nome com as alturas em cima costuma ser exatamente o que a pessoa quer — e as setas de cada linha movem ela para a esquerda ou para a direita se a ordem importar.
2. **Digite a altura do jeito que você escreve.** `173`, `1,73 m`, `5'8"`, `68 in` e `5 ft 8` são todos lidos direito. A linha embaixo da caixa mostra o que foi entendido, nos dois sistemas, então uma leitura errada aparece antes de ser desenhada e não depois de impressa. Um número sozinho é centímetros num gráfico métrico e polegadas num imperial, e um número sozinho abaixo de três é metros — ninguém tem 1,73 cm de altura.
3. **Escolha a figura que combina com a pessoa.** Uma criança tem cerca de seis cabeças de altura e um adulto sete e meia, então uma criança desenhada como um adulto encolhido fica errada de um jeito difícil de nomear e fácil de ver. O menino e a menina são desenhos de crianças de verdade, não adultos diminuídos, e é isso que faz a maior parte de um gráfico de família parecer uma família. Cada linha também já chega com uma altura dentro, então acrescentar alguém desenha alguém — é só digitar por cima.
4. **Ponha algo familiar no gráfico.** Um número é abstrato e uma porta não. Acrescentar um único objeto de um tamanho que todo mundo conhece — uma porta, uma janela, um quadro de sala de aula, uma máquina de vendas — é o que transforma um gráfico que declara duas alturas num que as mostra. O menu tem vinte deles, agrupados, e cada um vira uma linha comum onde você pode digitar os seus próprios números. Objetos têm largura além de altura, então uma porta é 203 por 81 e não uma faixa.
5. **Ou ponha nele um desenho seu.** **Sua própria imagem** pega um arquivo da sua máquina e põe na régua na altura que você der — o recurso a usar quando o gráfico é sobre um produto, um veículo ou um prédio em vez de uma pessoa. Um SVG é desenhado na cor da própria linha, como qualquer outra figura; uma fotografia ou um PNG entra do jeito que é. Os dois mantêm as próprias proporções, e os dois são lidos aqui em vez de mandados para algum lugar.
6. **Ponha a régua nas unidades em que quem lê pensa.** Trocar entre centímetros e pés reescreve o que está nas caixas em vez de reinterpretar, então o gráfico em si não se mexe: só a notação muda. Se o gráfico é para dois públicos, a altura escrita acima de cada figura fica na unidade do gráfico e a linha embaixo de cada caixa traz as duas.
7. **O PNG para colar, o SVG para imprimir.** O PNG é uma imagem na altura em pixels que você definiu, que é o que uma janela de chat, um documento ou um slide quer. O SVG é o gráfico como instruções, então ele imprime nítido em qualquer tamanho e ainda pode ser recolorido depois por qualquer coisa que abra vetores.

## A versão longa

[Como fazer um gráfico de comparação de alturas](https://abox.tools/pt/guias/fazer-um-grafico-de-alturas/): Transforme uma lista de alturas numa imagem lado a lado: como escrever as alturas, que figura escolher para uma criança, por que um objeto familiar faz mais que uma terceira pessoa, e como tirar o gráfico como PNG ou SVG.

## Também na caixa

- [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.
- [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.
- [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.
- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha o país. Ele aplica a regra daquele país, exatamente.

## Perguntas

### Alguma coisa que eu digito é enviada para algum lugar?

Não. O gráfico é desenhado por JavaScript desta página, no seu próprio computador, e esta ferramenta não tem função de rede de espécie alguma — nunca busca nada e nunca envia nada. A `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles é nosso. Vale dizer isso com todas as letras aqui porque a entrada é uma lista de nomes de pessoas e da altura de cada uma, que é mais pessoal do que quase tudo que este site lida.

### Dá para baixar o gráfico?

Dá, como PNG ou como SVG, sem marca d'água e sem conta. O PNG é desenhado na altura em pixels que você definir e é o que se cola num documento, num slide ou num chat. O SVG é o gráfico como instruções em vez de pixels: ele imprime nítido em qualquer tamanho e pode ser aberto e recolorido depois em qualquer editor vetorial. Os dois são feitos a partir da mesma marcação que está na tela, então nenhum deles pode discordar da prévia.

### Como escrevo a altura — em centímetros ou em pés?

Do jeito que quiser, em qualquer linha, como você normalmente escreve. `173`, `173 cm`, `1,73 m`, `5'8"`, `5 ft 8 in` e `68 in` são todos entendidos, e a linha embaixo da caixa mostra o que foi lido nos dois sistemas. Um número sozinho é centímetros quando o gráfico é métrico e polegadas quando é imperial; um número sozinho abaixo de três é tomado como metros, porque 1,73 cm não é uma altura que alguém digite.

### Por que as crianças não parecem adultos pequenos?

Porque uma criança não é isso. As proporções do corpo mudam com a idade: uma criança de dois anos tem mais ou menos quatro cabeças e meia, uma de oito seis, e um adulto sete e meia — então a cabeça é quase um quarto de uma criança pequena e um oitavo de um adulto. O menino e a menina aqui são desenhos de crianças de verdade, não uma única silhueta reduzida, que é por que um gráfico de família parece uma família em vez de quatro adultos de tamanhos diferentes.

### De onde vêm as figuras?

As quatro são ilustrações de outras pessoas, todas em domínio público: o homem por pitr, a mulher por Madeleine Price Ball, a menina por OpenClipart-Vectors, e o menino por Ryan Kissinger para a biblioteca NIH BioArt. Cada arquivo vai junto com esta página em `vendor/` do jeito que foi publicado, então dá para conferir com os originais. Domínio público não pede nada, e é justamente esse o ponto: a ilustração acaba dentro de uma imagem que você baixa, e uma licença que exigisse atribuição grudaria essa exigência no seu gráfico.

### Posso pôr uma imagem minha no gráfico?

Pode — **Sua própria imagem** pega um desenho ou uma fotografia e põe na régua na altura que você digitar: um logotipo, uma planta, uma peça de máquina, um carro, ou uma foto da coisa em si. As proporções são as dela, então não há largura a preencher. \
\
Um **SVG** é desenhado numa única cor chapada, a que aquela linha estiver, porque é isso que o resto do gráfico é — então um desenho feito de contornos finos em vez de formas preenchidas sai como um borrão, e para isso esta é a ferramenta errada. Só as *formas* são mantidas: o arquivo é reconstruído do zero a partir de traçados, retângulos e círculos, e tudo o que pudesse alcançar a rede — uma imagem vinculada, uma folha de estilo, uma fonte, um script — fica para trás. \
\
Uma **foto ou um PNG** entra do jeito que é e mantém as próprias cores, então a cor da linha só dá nome a ela. Ela é redesenhada aqui antes de entrar, o que limita quanto acrescenta ao gráfico e deixa para trás os metadados do arquivo. A transparência é mantida, então um recorte fica limpo em pé na régua — e uma foto traz o fundo junto, que vale a pena cortar antes. \
\
Nenhum dos dois arquivos vai a lugar nenhum. Isso conta em dobro, porque o gráfico que você baixa é um arquivo que você talvez mande para alguém.

### Por que não tem uma criança pequena ou um bebê?

Porque ninguém desenhou um e colocou em domínio público. O Wikimedia Commons tem exatamente uma criança livre utilizável — a menina — e a biblioteca NIH BioArt o menino; abaixo da idade escolar a busca volta vazia, e todo conjunto livre e coerente de pessoas é um pictograma de banheiro com a mesma forma em toda idade, que é o erro que esta ferramenta inteira existe para evitar. Por um tempo houve uma criança pequena desenhada pelo código desta própria página, e era a única figura do gráfico que ninguém tinha desenhado: dava para ver, do lado de quatro que alguém tinha. Para qualquer pessoa menor que o menino ou a menina, ponha um dos dois na altura real — quem carrega a comparação é a régua, e ela vai estar certa.

### Quantas pessoas cabem num gráfico?

Doze. Não é um limite técnico — o desenho faria trinta numa boa — mas passando de uma dúzia as colunas ficam mais estreitas que os nomes escritos em cima e a imagem para de ser legível. Se precisar de mais, desligar os nomes devolve a largura, ou dois gráficos vão dizer melhor do que um.

### Dá para pôr um objeto no gráfico?

Dá — e a maioria já chega desenhada. O menu tem vinte para começar, em quatro grupos: portas e janelas, escola e escritório (um quadro, uma mesa, um arquivo, uma tela de projeção), coisas da cidade (uma máquina de vendas, uma lixeira com rodas, uma cesta de basquete, um contêiner de 20 ft) e coisas de casa. Dezessete deles vêm com desenho — uma porta com maçaneta, uma geladeira com o freezer em cima, um sofá que dá para ver que é um sofá — e o desenho é ajustado à altura e à largura da linha, então os números continuam decidindo o tamanho, e os seus, digitados por cima, continuam valendo. Os outros três são retângulos simples, porque não apareceu nenhum desenho livre deles que fosse ao mesmo tempo certo e bem proporcionado, e um desenho errado é pior do que um bloco honesto num gráfico que trata de escala. \
\
Algumas dessas medidas são normas de verdade e outras são tamanhos típicos, o que a página fala em voz alta. Um objeto familiar faz mais por um gráfico do que qualquer quantidade de gente a mais: é ele que transforma uma comparação numa noção de escala.

### Tem uma figura para cachorro ou gato?

Não, e é uma falta de propósito, não um esquecimento. Os dois foram construídos — de perfil, em pé, com a cabeça na altura do ombro, para que o topo do desenho fosse a altura escrita ao lado, que é onde todo padrão de raça mede um animal. Não ficaram bons o bastante para publicar: um quadrúpede visto de lado ao lado de quatro pessoas vistas de frente parece um erro mesmo quando o desenho é bom. Um retângulo na altura da cernelha do animal é honesto enquanto isso.

### Dá para compartilhar o gráfico com um link?

Daqui não, e é de propósito. As ferramentas que oferecem isso fazem botando a lista inteira no endereço, o que significa que cada nome e cada altura acabam em tudo por onde o link viaja — os logs de um servidor de chat, um scanner de e-mail, o histórico de alguém, um serviço que busca a prévia do link. Baixe a imagem e mande ela: diz a mesma coisa e não leva lista nenhuma junto.

### É grátis, e posso usar o gráfico comercialmente?

É grátis, não tem conta e não tem marca d'água, e você pode pôr o resultado num relatório, numa apresentação, num anúncio ou num produto. O site exibe publicidade, e é ela que paga a conta. Nada de um gráfico que você faz aqui é nosso, e nada fica guardado.

### Por que a régua vai de dez em dez e não de um em um?

Porque o espaçamento é escolhido a partir de quantas linhas a imagem aguenta, e não de um número fixo. Um gráfico de dois adultos ganha uma linha a cada dez centímetros; ponha uma cesta de basquete e as linhas vão para vinte e cinco, porque noventa linhas numa imagem viram uma mancha cinza em vez de uma régua. Em pés e polegadas a escada é de uma, três, seis e doze polegadas, então as linhas caem em polegadas inteiras em vez de perto delas.

### Dá para pôr o gráfico num slide escuro?

Dá. Ponha o fundo na cor em que ele vai ficar e a régua e o texto trocam entre escuro e claro para combinar — calculado pela luminância da cor, não chutado. Depois marque “sem fundo nenhum” se quiser a imagem transparente: a cor que você escolheu continua decidindo a tinta, então um gráfico transparente indo para um slide azul-marinho sai legível em cima dele.

### Funciona offline?

Funciona. Carregue a página uma vez, desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada é enviado: uma ferramenta que mandasse a sua lista embora para desenhar um gráfico pararia no instante em que você desconectasse.

## Como dá para conferir a promessa de privacidade

- **Uma lista de pessoas não é pouca coisa para entregar.** A maioria dos gráficos de altura quer uma conta, e os que não querem ainda têm um servidor que vê cada nome e cada número que você digita. O que você está digitando aqui é quem tem na sua família e a altura de cada um, muitas vezes com a idade de uma criança implícita na figura ao lado do nome. Nada disso é enviado a lugar nenhum, porque aqui não existe para onde ir.
- **Nada aqui busca coisa alguma.** Não há nenhum `fetch`, nenhum `XMLHttpRequest` e nenhum `sendBeacon` em lugar algum de `src/`. A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles é nosso.
- **Também não fica nada guardado de uma visita para outra.** O gráfico vive na página e em nenhum outro lugar. Feche a aba e a lista some: não tem conta segurando, não tem cookie carregando, e nada é escrito no armazenamento deste navegador — que é também por que um gráfico que você quer guardar é um gráfico que você baixa.
- **O link não carrega o gráfico.** Várias ferramentas como esta põem a lista inteira na barra de endereços para poder compartilhar, e isso transforma cada nome e cada altura em algo registrado por tudo por onde o link passa — um servidor de chat, um scanner de e-mail, o histórico de alguém. O endereço desta página nunca muda enquanto você digita.
- **O PNG é feito a partir do SVG que está na tela.** O download não é uma segunda renderização que poderia discordar da prévia. A mesma marcação é entregue ao navegador e pintada num canvas, que é também por que dá para fazer com a rede desligada: não tem fonte para buscar nem imagem para carregar dentro.
- **Uma imagem que você acrescenta é lida aqui, e nunca enviada.** O arquivo nunca sai desta página — ele é lido com o próprio `FileReader` do navegador e analisado num documento inerte que não executa nada. O que é desenhado não é aquele arquivo: `src/import-svg.js` monta um desenho NOVO a partir de uma lista branca de formas e geometria, então um script, uma folha de estilo, uma fonte, uma imagem vinculada ou uma referência a outro documento fica para trás em vez de passar. Isso conta em dobro, porque o gráfico que você baixa é um arquivo que você manda para outras pessoas: qualquer coisa que tivesse sobrevivido seria o navegador delas chamando o servidor de um estranho, dias depois, a partir de algo que esta página escreveu. Uma fotografia ou um PNG não é um programa e não tem nada a reconstruir: o próprio decodificador do navegador lê o arquivo, que é redesenhado aqui num canvas antes de ir para o gráfico. É esse redesenho que deixa para trás os metadados do arquivo — a câmera, o lugar, o perfil, o que quer que houvesse ali —, porque nada disso sobrevive a um canvas. O que acaba no gráfico é uma imagem que esta página codificou, escrita como dados e não como endereço, então o gráfico continua sem apontar para nada.
- **As ilustrações estão aqui, não são buscadas.** As quatro figuras são de domínio público, e são servidas desta origem junto com o resto da página — sem fonte de ícones, sem CDN, sem folha de sprites puxada do servidor de outra pessoa enquanto você digita. É também por isso que o gráfico continua sendo desenhado com a rede desligada.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe um nome ou uma altura. Toda linha que transforma a sua lista numa imagem é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/traced.js` e `vendor/` para as quatro figuras e de onde vieram as ilustrações delas, `src/figures.js` para a lista com que o menu é montado, `src/units.js` para como uma altura digitada vira número e como a régua é rotulada, `src/chart.js` para o arranjo, `src/save.js` para os dois downloads — que são o SVG na tela, e esse mesmo SVG pintado num canvas — e `src/import-svg.js` para a lista branca a partir da qual um SVG enviado é reconstruído, que é o único arquivo daqui em que errar teria peso.
