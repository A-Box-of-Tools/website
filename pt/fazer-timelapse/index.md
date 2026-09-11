# Fazer um timelapse — acelerar um vídeo online

Uma hora de gravação em vinte segundos.

> Transforme um vídeo longo em timelapse: 10x, 60x ou a velocidade que você digitar. Roda no navegador, não envia nada, não põe marca d'água e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/fazer-timelapse/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

Cada quadro é escolhido, decodificado e recodificado pelo seu próprio navegador, no seu próprio hardware. Nada aqui consegue buscar nem mandar coisa alguma, porque não existe função de rede nenhuma nesta ferramenta. E do outro lado desta página não existe servidor nenhum para onde mandar um vídeo, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ A velocidade que você digitar
- ✓ Funciona offline

## Como fazer um timelapse a partir de um vídeo

1. **Escolha um vídeo.** Arraste um MP4, MOV, M4V ou WebM para o seletor, ou procure um à mão. O navegador lê direto do seu disco, e enquanto isso nada sai para lugar nenhum.
2. **Diga quanto mais rápido.** Aperte uma das velocidades, ou digite a sua. Se preferir dizer quanto o resultado deve durar, algo como “que caiba em vinte segundos”, digite isso e a velocidade sai sozinha.
3. **Confira o intervalo.** A linha embaixo da velocidade diz o que vai acontecer de verdade: um quadro a cada tantos segundos do original. É o número que se ajustaria numa câmera, e é o que vale a pena conferir antes de começar.
4. **Faça e baixe.** O trabalho acontece no seu próprio hardware, então o tempo que leva depende do seu computador e não de uma fila. O vídeo pronto vai direto para os downloads do seu navegador.

## A versão longa

[Como transformar um vídeo longo em timelapse](https://abox.tools/pt/guias/transformar-video-longo-em-timelapse/): Uma hora de filmagem num minuto que dá para assistir: como escolher a velocidade, por que dizer a duração final ganha de fazer conta, e quando o resultado deve virar um GIF.

## Também na caixa

- [Extrator de quadro](https://abox.tools/pt/extrair-quadro-de-video/): Uma imagem em qualidade cheia, de qualquer ponto.
- [Vídeo para GIF](https://abox.tools/pt/video-para-gif/): Escolha o trecho, o tamanho e a taxa de quadros.
- [Criador de GIF](https://abox.tools/pt/criar-gif/): Transforme um punhado de imagens em uma animação só.
- [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/): Cada quadro sai no próprio PNG.

## Perguntas

### Meu vídeo é enviado para algum lugar?

Não. É o seu próprio navegador que lê, decodifica, escolhe os quadros e codifica, no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar — nenhum deles é deste site. Se você prefere conferir a acreditar, desligue a internet e faça um timelapse assim mesmo.

### O que a velocidade quer dizer exatamente?

A razão entre o que entra e o que sai. A 60×, uma hora de gravação vira um minuto, seja qual for a taxa de quadros em que você assiste. Por baixo, a ferramenta pega um quadro a cada *velocidade ÷ quadros por segundo*: 60× a 30 quadros por segundo é um a cada dois segundos. A página mostra esse intervalo antes de você começar, porque é o número que diz o que está acontecendo de verdade.

### Quais formatos de vídeo posso acelerar?

MP4, M4V e MOV são lidos direto, tenham dentro o que tiverem: H.264, HEVC, AV1 ou VP9, desde que o seu navegador saiba decodificar aquele codec. Todo o resto que o seu navegador consegue tocar, WebM na frente, é lido levando o player do próprio navegador até cada instante, o que funciona em qualquer formato que ele abra. Um arquivo que o navegador não consegue nem ler nem tocar, na prática AVI, WMV, FLV e a maioria dos MKV, é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho. O que sai é sempre um MP4.

### Por que o timelapse não tem som?

Porque não há nada que valha a pena guardar. Som a trinta vezes a velocidade não é fala nem música, é um chiado; e a alternativa, deixar o áudio na velocidade original embaixo de uma imagem que disparou na frente, seria um clipe diferente do que você pediu. A trilha cai fora, e é boa parte do motivo de uma hora de vídeo sair com poucos megabytes. Se o que você quer é o áudio sozinho, o [Editor de áudio](https://abox.tools/pt/editar-audio/) salva ele.

### É mais rápido do que converter o vídeo inteiro?

Muito mais, e é para isso que o arquivo é lido direto. Um quadro só pode ser decodificado começando pelo quadro-chave que vem antes dele, mas nada obriga a guardar os do meio: um timelapse a 60× de uma hora decodifica alguns milhares de quadros em vez de cem mil. O resumo diz exatamente quantos ele vai ler antes de você apertar o botão.

### Isso custa qualidade?

Os quadros guardados são codificados uma segunda vez, e isso custa um pouco. Não dá para evitar, porque o clipe pronto mostra esses quadros em momentos para os quais nada tinha sido codificado no arquivo original. O que esta ferramenta gasta a mais do que as outras ferramentas de vídeo daqui é o bitrate, e é de propósito: dois quadros separados por dois segundos têm muito menos em comum do que dois separados por um trinta avos de segundo, então o codec tem menos a reaproveitar, e um número pensado para gravação comum sairia quadriculado.

### Existe limite de tamanho ou de duração?

Não há limite embutido na ferramenta, e o arquivo também não vai inteiro para a memória: são lidos só trechos curtos em volta de cada instante. O teto prático é o timelapse pronto, que é montado na memória antes de você baixar, e um timelapse é curto por definição. O resumo mostra mais ou menos o tamanho dele antes de você começar.

### Posso acelerar só um pedaço do clipe?

Aqui não. Esta ferramenta pega o clipe inteiro, do primeiro quadro ao último. Corte antes o trecho que você quer com o [Aparador de vídeo](https://abox.tools/pt/aparar-video/), que faz isso sem recodificar um único quadro, e acelere o que sair de lá.

### É grátis? Preciso de conta?

É grátis, e não tem conta, cadastro, período de teste nem marca d'água. O site é pago por publicidade, e os anúncios não recebem nada sobre o seu vídeo.

## Como dá para conferir a promessa de privacidade

- **Seus vídeos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Esta ferramenta não tem função de rede nenhuma: nenhum endereço para colar, nada para baixar, nenhum motor buscado no primeiro uso. Cada byte que encosta no seu vídeo veio desta origem quando a página carregou.
- **A decodificação e a codificação são locais.** Os quadros passam pelo WebCodecs no seu próprio navegador, ou pelo mesmo motor de reprodução que exibiria o clipe para você de qualquer jeito. O arquivo pronto é montado na memória deste computador e vai direto para um download.
- **A maior parte do arquivo nem chega a ser lida.** Um timelapse precisa de um quadro a cada poucos segundos, então a ferramenta lê o trecho curto de arquivo em volta de cada um desses instantes e pula o resto. É uma decisão de velocidade e não de privacidade, mas vale saber assim mesmo: até aqui, no seu próprio computador, a maior parte do seu vídeo nunca é aberta.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu vídeo: nem um arquivo, nem um quadro, nem um nome, um tamanho ou uma duração. Toda linha que lê, decodifica, escolhe ou codifica é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre o seu vídeo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Não existe prova mais simples que essa.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/plan.js` para a conta que decide de que instante vem cada quadro, e `src/decode.js` para o laço que lê só os pedaços do arquivo de que esses instantes precisam. Nenhum dos dois importa qualquer coisa que consiga fazer uma requisição.
