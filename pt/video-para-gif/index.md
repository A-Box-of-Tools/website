# Vídeo para GIF — converter um vídeo em GIF

Escolha o trecho, o tamanho e a taxa de quadros.

> Transforme um trecho de um MP4, MOV ou WebM num GIF animado. Escolha o trecho, a largura e a taxa de quadros; os quadros são lidos e o GIF é escrito no seu navegador. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/video-para-gif/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

Cada quadro é lido, redimensionado, quantizado e escrito pelo seu próprio navegador, no seu próprio hardware. Nada aqui consegue buscar nem mandar coisa alguma, porque não existe função de rede nenhuma nesta ferramenta. E do outro lado desta página não existe servidor nenhum para onde mandar um vídeo, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Qualquer duração
- ✓ Funciona offline

## Como transformar um vídeo em GIF

1. **Escolha um vídeo.** Arraste um MP4, MOV, M4V ou WebM até o seletor, ou escolha um na mão. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Marque o trecho.** Toque o clipe e aperte `I` onde ele deve começar e `O` onde ele deve terminar, ou arraste as alças na barra. Um GIF tem poucos segundos, e este é o ajuste que decide se o arquivo sai pequeno ou enorme, muito mais do que os outros dois.
3. **Escolha a largura e a taxa de quadros.** 480 pixels de largura e 12 quadros por segundo dão conta da maior parte do que um GIF serve para fazer. Cortar a largura pela metade deixa os pixels em um quarto, e doze quadros por segundo já se leem como movimento sem pagar por quadros que ninguém vê.
4. **Faça, e baixe.** Os quadros são lidos, uma paleta de 256 cores é escolhida para a animação inteira, e cada quadro é escrito como só a parte da imagem que mudou. Ele toca na página quando fica pronto, e é esse mesmo arquivo que o download entrega.

## A versão longa

[Como transformar um vídeo em GIF](https://abox.tools/pt/guias/transformar-um-video-em-gif/): Qual trecho, qual largura e qual taxa de quadros escolher, por que um GIF de um vídeo fica dez vezes maior que o vídeo, e quando vale usar um.

## Também na caixa

- [Criador de GIF](https://abox.tools/pt/criar-gif/): Transforme um punhado de imagens em uma animação só.
- [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/): Cada quadro sai no próprio PNG.
- [Analisador de GIF](https://abox.tools/pt/analisar-gif/): Quadros, tempos, paletas e para onde foi cada byte.
- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.

## Perguntas

### Meu vídeo é enviado para algum lugar?

Não. Quem lê, amostra e converte é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. Se você prefere conferir a acreditar, desligue a internet e faça um GIF assim mesmo.

### Quais formatos de vídeo posso converter?

MP4, M4V e MOV são lidos diretamente, seja lá o que houver dentro deles: H.264, HEVC, AV1 ou VP9, desde que o seu navegador saiba decodificar aquele codec. Qualquer outra coisa que o seu navegador consiga tocar, e aí o caso mais óbvio é o WebM, é lida movendo o reprodutor até cada instante, o que é mais lento e um pouco menos exato sobre qual quadro cai onde. Um arquivo que o navegador não consegue nem ler nem tocar, o que na prática significa AVI, WMV, FLV e a maioria dos MKVs, é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Por que o meu GIF está tão grande?

Porque GIF é um formato de 1987 que guarda imagens inteiras em vez de movimento. Não tem como fazer, de um clipe de cinco segundos, um GIF tão pequeno quanto o MP4 de cinco segundos de onde ele veio. É rotina um GIF ficar dez vezes maior que o vídeo. Os três ajustes que de fato decidem isso são, nesta ordem: quanto dura o trecho, quão larga é a imagem e quantos quadros por segundo. Cortar a largura pela metade deixa os pixels em um quarto, e são os pixels que custam.

### Por que só 256 cores?

É o formato: um GIF carrega uma tabela de no máximo 256 cores e guarda cada pixel como um número apontando para ela. Esta ferramenta escolhe essas 256 contando as cores de todos os quadros do seu trecho e dividindo-as em 256 grupos, pelo corte pela mediana, que é o método padrão. Assim a paleta cai bem no seu clipe, em vez de ser um conjunto fixo de cores. Onde uma cor está faltando, o dithering mistura as duas mais próximas para um gradiente continuar sendo um gradiente, em vez de virar faixas.

### O que o ajuste de dithering faz?

Ele troca um pouco de ruído por muito menos faixamento. Ligado, um céu que de outro jeito viraria quatro faixas chapadas continua um gradiente, ao custo de uma textura tênue e de um arquivo maior. Desligado, a imagem fica mais chapada e o arquivo menor, o que serve para gravações de tela, desenho de traço e qualquer coisa já feita de cor chapada. O dithering usado aqui é ordenado em vez de ser por difusão de erro, então um fundo que não muda fica perfeitamente parado entre os quadros, sem fervilhar.

### Existe limite de duração ou de tamanho?

O limitado é o trecho, e por memória, não por regra: todo quadro dele fica na memória de uma vez enquanto a paleta é escolhida. Por isso a página calcula o que os seus ajustes custariam e avisa antes de você começar. Ela prefere recusar a deixar a aba ficar sem memória e sumir. Um trecho mais curto, uma largura menor ou uma taxa de quadros mais baixa baixam essa conta.

### Ele mantém o som?

Um GIF não consegue carregar som. Não existe versão do formato com áudio, e esse é o motivo principal de a web ter, na maior parte, trocado os GIFs por vídeo mudo em laço. Se o som importa, fique com o vídeo: o [Aparador de vídeo](https://abox.tools/pt/aparar-video/) tira um trecho dele sem recodificar um quadro.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre o seu vídeo.

## Como dá para conferir a promessa de privacidade

- **Seus vídeos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Esta ferramenta não tem função de rede nenhuma: nenhum endereço para colar, nada para baixar, nenhum motor buscado no primeiro uso. Cada byte que encosta no seu vídeo veio desta origem quando a página carregou.
- **A decodificação é local.** Os quadros passam pelo WebCodecs no seu próprio navegador, ou pelo mesmo motor de reprodução que exibiria o clipe para você de qualquer jeito. Qual dos dois foi usado fica escrito no alto da página, porque isso muda como os quadros são escolhidos e você merece ver.
- **O GIF é escrito aqui, em código que você pode ler.** A paleta, o dithering e a compressão LZW são umas seiscentas linhas na pasta desta própria ferramenta. Não existe serviço de codificação, nem biblioteca buscada em tempo de execução, nem lugar nenhum em nada disso para onde uma imagem pudesse ser mandada.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu vídeo: nem um arquivo, nem um quadro, nem um nome, um tamanho, uma duração ou o trecho que você marcou. Toda linha que lê, amostra, quantiza ou codifica é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre o seu vídeo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/frames.js` para as duas maneiras pelas quais os quadros são lidos de um vídeo, `src/quantize.js` para a paleta, e `src/gif.js` para o arquivo em si, LZW e tudo. Nenhum deles importa qualquer coisa que consiga fazer uma requisição.
