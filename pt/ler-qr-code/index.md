# Leitor de QR Code e código de barras — ler um QR Code de uma imagem ou pela câmera

Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.

> Leia um QR Code de uma foto, de um print ou pela câmera, e veja exatamente para onde o link leva antes de abrir. EAN, UPC, Code 128, Code 39 e ITF também. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/ler-qr-code/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem as imagens e os códigos que estão nelas. Não existe servidor.

Ler um código é aritmética sobre pixels, e os pixels já estão aqui. Achar o símbolo, corrigir o ângulo, desfazer a máscara, reparar o dano com Reed-Solomon e ler os bits de volta acontece tudo em cerca de duas mil linhas de JavaScript nesta página, que você pode ler. **A câmera é a mesma promessa, não uma exceção a ela:** um quadro chega como pixels nesta aba, é examinado e some. Nada é gravado, nada fica guardado, e esta página não tem função de rede de espécie alguma para mandar coisa nenhuma.

- ✗ Nada é enviado
- ✗ Sem conta
- ✗ Nada é gravado
- ✓ Funciona offline
- ✓ Código aberto

## Como ler um QR Code sem enviar a imagem

1. **Dê a imagem para ela.** Solte uma foto ou um print na caixa, cole uma direto, ou aperte o botão da câmera. Várias de uma vez pode: cada uma é lida por conta própria e cada uma tem a sua resposta. Um print de um código que já está na sua tela é o caminho mais rápido e o mais confiável, porque ali não entra lente, nem ângulo, nem luz.
2. **Ponha o símbolo inteiro no quadro, margem incluída.** O branco em volta de um código faz parte do código: é assim que um leitor sabe onde o símbolo termina. Uma foto cortada rente à borda dos quadradinhos é de longe o motivo mais comum de um código não ser lido. Encher mais ou menos metade do quadro com o código está bom; mais perto do que isso e os cantos ficam de fora.
3. **Leia o endereço antes de decidir qualquer coisa.** O motivo de ler um código num cartaz, num parquímetro ou numa carta é descobrir para onde ele leva, e é justamente isso que a câmera do celular não deixa você fazer de verdade. Aqui o host fica numa linha só dele. Se não for um nome que você esperava, você já conseguiu o que veio buscar e não sobra nada para abrir.
4. **Leve os avisos a sério, principalmente os discretos.** Um endereço `http://` puro, um nome num alfabeto que não é o que parece, um encurtador de link, ou qualquer coisa antes de um `@` no endereço: cada um é apontado onde aparece. Nenhum deles prova nada sozinho. Todos valem dez segundos antes de você ir.
5. **Se não ler, mude a luz antes de mudar qualquer outra coisa.** Quase toda falha é problema de limiar: um reflexo atravessando o meio, uma sombra sobre um canto, ou uma tela fotografada num ângulo que pega a luz de fundo. Mude de posição para o brilho não cair no código, ou acenda a luz da câmera. Se ainda assim não der, tire uma foto reta e de frente e solte essa — uma imagem parada recebe uma busca muito mais minuciosa do que um quadro ao vivo consegue receber.
6. **Se a resposta parecer estranha, olhe a imagem amostrada.** Abra “como este foi lido” e olhe a gradezinha. É o que esta página achou que o código era, redesenhado a partir dos módulos que ela amostrou. Um leitor que leu um símbolo errado e o reparou até virar algo plausível mostra isso ali, e em nenhum outro lugar.

## A versão longa

[Como criar um código QR e provar que ele escaneia](https://abox.tools/pt/guias/criar-um-codigo-qr-e-provar-que-escaneia/): Gere o código e depois verifique com o leitor do mesmo site: a carga exata, o link real, no tamanho de impressão e a partir de uma foto, antes da tiragem. Tudo no navegador, nada enviado.

## Também na caixa

- [Hash e checksum](https://abox.tools/pt/verificar-checksum/): Confira um download contra o número que quem publicou divulgou, sem mandar o arquivo para ninguém.
- [Gerador de senha e frase secreta](https://abox.tools/pt/gerador-de-senha/): Gerada aqui, pelo seu próprio navegador, e não enviada para lugar nenhum. Nada é guardado e não existe histórico.
- [Formatador de JSON](https://abox.tools/pt/formatar-json/): JSON, XML, HTML, CSS e YAML, formatados ou convertidos. Nada é colado no servidor de ninguém.
- [Conversor de YAML para JSON](https://abox.tools/pt/converter-yaml-para-json/): Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.

## Perguntas

### A imagem é enviada para algum lugar?

Não, e nem o que é lido dela. A imagem é decodificada num canvas desta página e lida ali, por JavaScript servido deste site. Esta ferramenta não tem função de rede de espécie alguma — nunca busca nada e nunca manda nada — e a `Content-Security-Policy` da página nomeia todo endereço que ela pode contatar, e nenhum deles é nosso. A prova mais simples é desligar a internet: ela continua funcionando.

### A câmera grava alguma coisa?

Não. Um quadro da câmera chega como pixels nesta aba, é desenhado num canvas, é examinado e é sobrescrito pelo próximo cerca de um décimo de segundo depois. Nada é escrito em disco e nada fica guardado. O fluxo para assim que você aperta parar, quando a aba vai para segundo plano e quando você sai da página — e a luz da sua câmera é o indicador em que confiar, porque nenhuma página consegue apagá-la.

### Por que ela me mostra o link em vez de abrir?

Porque essa é a parte útil. Um QR Code é um endereço que você não consegue ler, e é justamente por isso que um adesivo sobre o código de um parquímetro funciona: quando você descobre para onde ele ia, já está lá. Aqui o texto é mostrado inteiro, o host sai numa linha só dele, e abrir é um botão separado que você aperta depois de ler. É um clique a mais, e é o clique de que esse formato sempre precisou.

### O que ela consegue ler?

QR Codes em todas as versões, da 1 à 40, nos quatro níveis de correção de erro, em modo numérico, alfanumérico, byte e kanji, informando os conjuntos de caracteres ECI e os símbolos de um conjunto encadeado em vez de descartar em silêncio. Do lado das barras: EAN-13, EAN-8, UPC-A, UPC-E, ITF-14, Interleaved 2 of 5, Code 128 e Code 39. Não lê Data Matrix, PDF417, Aztec nem MaxiCode.

### Ela não lê o meu código. O que está errado?

Nove em cada dez vezes é uma de três coisas. A margem branca foi cortada, e um leitor usa ela para saber onde o símbolo acaba. Tem um reflexo ou uma sombra sobre parte do código, então nenhum limiar separa os quadradinhos escuros dos claros. Ou o código está tão pequeno no quadro que os módulos dele não passam de um ou dois pixels. Mude a luz, encha mais ou menos metade do quadro, e tire a foto de frente em vez de enviesada.

### Ela lê um código danificado ou coberto em parte?

Muitas vezes sim, e isso é o formato funcionando como foi projetado, não nenhuma esperteza daqui. Todo QR Code carrega dados de verificação Reed-Solomon, e um símbolo feito no nível H pode perder cerca de 30% dos módulos e ainda assim ser reconstruído exato. A página diz quantas palavras de código teve de reparar em “como este foi lido”, para você ver o quanto foi apertado. O que ela não faz é chutar: um símbolo danificado além do que a verificação aguenta é informado como ilegível, e não respondido errado.

### Por que ela diz que não sabe para onde um link do bit.ly leva?

Porque descobrir seria perguntar ao bit.ly, e isso é uma requisição de rede. Todo o resto do que esta página afirma se apoia em não existir aqui nenhum código que contate coisa alguma, e abrir uma exceção caladinho valeria menos do que a resposta. Então o encurtador é apontado e o que ele esconde fica honestamente desconhecido. Se você quiser resolver, cole num lugar que aceite perguntar.

### É seguro ler um QR Code?

Ler é seguro. Obedecer é o risco, e é um risco real: código colado por cima do verdadeiro em parquímetro, em mesa de restaurante e em aviso de entrega já é comum o bastante para ter nome. O que faz isso funcionar é que ninguém consegue ler um código olhando para ele. Ler sem abrir — que é o que esta página faz — tira essa vantagem inteira, e os dez segundos que custa olhar o host são a defesa toda.

### O que é a gradezinha embaixo de cada resultado?

Os módulos que esta página amostrou de verdade da sua imagem, redesenhados a um quadradinho por módulo. Ela está aí para a leitura poder ser conferida no olho em vez de acreditada: se aquela grade parece o código que você fotografou, a resposta acima saiu dos pixels certos. Quase nenhum leitor te mostra isso, e é a diferença entre uma ferramenta que dá para conferir e uma em que você tem que acreditar.

### Ela lê vários códigos numa imagem só?

Um por imagem, por enquanto. Solte várias imagens de uma vez e cada uma é lida por conta própria, e a câmera vai lendo código atrás de código enquanto você move, guardando cada um novo que ainda não viu. Uma única foto com uma folha cheia de códigos é caso de recortar, ou de apontar a câmera para um de cada vez.

### Por que ela chama o meu código de barras de outro nome?

Porque um código de barras não carrega o próprio nome. UPC-A é um EAN-13 cujo primeiro dígito é zero, ITF-14 é Interleaved 2 of 5 com catorze dígitos e um dígito verificador válido, e o Code 128 no modo numérico não se parece com mais nada. O que esta página informa é o que as barras dizem mais o que o dígito verificador confirma, que é tudo o que o próprio símbolo sabe.

### Funciona offline?

Sim. Carregue a página uma vez, depois desligue a internet e ela continua funcionando, câmera inclusive. É também o jeito mais simples de provar que nada é enviado: um leitor que mandasse a sua imagem para fora para ser decodificada pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **A imagem nunca é enviada, e a câmera não é exceção.** Uma foto que você solta aqui é decodificada num canvas desta página e lida ali. Um quadro da câmera é a mesma coisa chegando trinta vezes por segundo: é desenhado nesse canvas, examinado e sobrescrito pelo seguinte. Nenhum é gravado, nenhum fica guardado, e a luz da câmera apagando quando você aperta parar é tudo o que existe.
- **Aqui não tem nada que busque nada.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`, e a `Content-Security-Policy` da página não deixa nenhum endereço para onde esta origem pudesse mandar alguma coisa, mesmo que houvesse. É por isso que esta página não consegue dizer onde um link encurtado vai parar: descobrir seria perguntar, e ela não pergunta.
- **Ela mostra o endereço. Nunca abre.** Um QR Code impresso é um endereço que ninguém consegue ler, e é exatamente isso que faz valer a pena para alguém colar um adesivo por cima. Aqui nada é aberto. O texto inteiro é mostrado para você olhar, o host onde você realmente cairia sai numa linha só dele, e os truques que fazem um endereço parecer outro — um nome de usuário antes de um `@`, um nome escrito num alfabeto cujas letras têm a forma das nossas, um redirecionamento — são apontados onde aparecem.
- **Ela também mostra o que amostrou.** Embaixo de cada resultado de QR Code tem uma imagem dos módulos que esta página leu de verdade da sua fotografia. Se aquilo parece o código que você leu, a resposta acima está de pé; se parece chuvisco, não está. Um leitor que te dá um texto e mais nada não pode ser conferido assim.
- **O que o Google carrega, e o que não recebe.** Os scripts de anúncio e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe uma imagem, um quadro, nem nada lido dali. Cada linha que transforma pixels em texto é servida desta mesma origem e está no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua a mesma, câmera inclusive, porque nunca houve um passo de rede nela. É a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/binarize.js` e `src/detect.js` para achar um símbolo dentro de uma fotografia — o limiar, os padrões de localização e a correção de perspectiva —, `src/qr-decode.js` para ler de volta, `src/reed-solomon.js` para reparar o que foi lido errado, `src/linear.js` para os de barra e `src/camera.js`, que é cada linha desta página que encosta numa câmera.
