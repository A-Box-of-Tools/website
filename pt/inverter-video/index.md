# Inverter vídeo — tocar de trás para frente

O último quadro primeiro, com som e tudo.

> Toque um MP4, MOV ou WebM de trás para frente, com o som invertido também. Roda no navegador: nada é enviado, não tem marca d'água e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/inverter-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

Cada quadro é decodificado, virado e codificado de novo pelo seu próprio navegador, no seu próprio hardware. Aqui nada consegue buscar nem mandar coisa alguma, porque esta ferramenta não tem função de rede nenhuma. E mesmo que tivesse, do outro lado desta página não existe servidor para receber um vídeo.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Inverte o som
- ✓ Funciona offline

## Como inverter um vídeo

1. **Escolha um vídeo.** Arraste um MP4, MOV, M4V ou WebM até o seletor, ou procure na mão. O navegador lê direto do seu disco, e nesse meio-tempo nada sai daqui.
2. **Decida o que fazer com o som.** “Inverter o som também” vira a trilha amostra por amostra, que é o que faz a fala sair como fala tocada ao contrário em vez de sair como silêncio. Desligue para um vídeo mudo, que ainda por cima é mais rápido.
3. **Decida quanta qualidade gastar.** A imagem precisa ser codificada de novo, porque os quadros saem numa ordem para a qual nada no arquivo foi codificado. “Equilibrado” fica perto do que o original gastou; “Melhor qualidade” gasta mais.
4. **Inverta e baixe.** O trabalho acontece no seu próprio hardware, então o tempo depende do seu computador e não de uma fila. O vídeo pronto vai direto para os downloads do seu navegador.

## A versão longa

[Como inverter um vídeo](https://abox.tools/pt/guias/inverter-um-video/): Tocar um vídeo de trás para frente: o que a inversão faz com a imagem e com o som, por que não dá para fazer sem recodificar, por que demora mais do que cortar, e o que fazer antes.

## Também na caixa

- [Criador de timelapse](https://abox.tools/pt/fazer-timelapse/): Uma hora de gravação em vinte segundos.
- [Extrator de quadro](https://abox.tools/pt/extrair-quadro-de-video/): Uma imagem em qualidade cheia, de qualquer ponto.
- [Vídeo para GIF](https://abox.tools/pt/video-para-gif/): Escolha o trecho, o tamanho e a taxa de quadros.
- [Criador de GIF](https://abox.tools/pt/criar-gif/): Transforme um punhado de imagens em uma animação só.

## Perguntas

### O meu vídeo é enviado para algum lugar?

Não. Ele é lido, decodificado, invertido e codificado pelo seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar: nenhum é nosso. Se você prefere conferir a acreditar, desligue a internet e inverta um vídeo assim mesmo.

### Quais formatos de vídeo dá para inverter?

MP4, M4V e MOV são lidos direto, seja lá o que tiver dentro: H.264, HEVC, AV1 ou VP9, desde que o seu navegador saiba decodificar aquele codec. Qualquer outra coisa que o seu navegador toque, WebM à frente, é invertida fazendo o player do próprio navegador andar para trás pelo vídeo, o que funciona mas é mais devagar. Um arquivo que o navegador não consegue nem ler nem tocar, o que na prática quer dizer AVI, WMV, FLV e a maioria dos MKV, é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho. O que sai é sempre um MP4.

### O som também é invertido?

É, a não ser que você desligue. A trilha inteira é decodificada, as amostras são postas na ordem contrária e ela é codificada de novo em AAC. Não tem como evitar essa segunda codificação: um pacote de áudio são algumas dezenas de milissegundos de som codificados em cima do pacote anterior, então escrever os pacotes de trás para frente tocaria pedacinhos para a frente na ordem errada, o que soa como defeito e não como inversão.

### Inverter perde qualidade?

A imagem é codificada uma segunda vez, e isso custa um pouco. Aqui não dá para evitar como dá ao aparar: um vídeo invertido mostra os quadros numa ordem para a qual nada no arquivo original foi codificado, então cada quadro tem que ser escrito de novo. O que a ferramenta não faz é gastar mais do que o original gastou, já que codificar acima disso só deixa o arquivo maior sem deixar ele melhor.

### Tem limite de tamanho ou de duração do vídeo?

Não tem limite embutido na ferramenta, e o arquivo não é lido inteiro para a memória de uma vez: ele é percorrido grupo de quadros por grupo de quadros, de trás para frente. Os tetos de verdade são o vídeo pronto, que é montado na memória antes de você baixar, e o som, que precisa ser mantido inteiro porque inverter exige a última amostra antes de poder escrever a primeira.

### Por que em alguns arquivos demora mais?

Porque existem dois caminhos de entrada. Um MP4 ou MOV é lido direto por esta ferramenta e decodificado um grupo de quadros por vez, e isso anda tão rápido quanto o seu computador. Todo o resto é invertido pedindo ao player do próprio navegador um instante do vídeo depois do outro, e cada um desses saltos obriga o navegador a decodificar a partir do quadro-chave anterior. A página avisa qual dos dois está usando, e por quê, antes de você começar.

### Dá para inverter só um pedaço do vídeo?

Aqui não. Esta ferramenta inverte tudo: o vídeo que sai tem exatamente a mesma duração do que entrou, com o último quadro primeiro. Corte antes o pedaço que você quer com o [Cortador de vídeo](https://abox.tools/pt/aparar-video/), que faz isso sem recodificar um quadro sequer, e inverta o que sair dali.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu vídeo.

## Como dá para conferir a promessa de privacidade

- **Os seus vídeos não têm para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde o seu arquivo pudesse parar, nem nada no código que o mandasse para lá se existisse.
- **Aqui nada busca nada.** Esta ferramenta não tem função de rede nenhuma: não tem endereço para colar, não tem nada para baixar, não tem motor nenhum baixado no primeiro uso. Cada byte que encosta no seu vídeo veio desta origem quando a página carregou.
- **A decodificação e a codificação são locais.** Os quadros passam pelo WebCodecs no seu próprio navegador, ou pelo mesmo motor de reprodução que mostraria o vídeo de qualquer jeito. O arquivo pronto é montado na memória deste computador e entregue direto para um download.
- **O som também é virado aqui.** Inverter uma trilha quer dizer decodificar ela, e essa decodificação é a do próprio navegador, rodando neste computador. Nada escuta, nada guarda e nada conseguiria repassar: aqui não existe caminho no código que mande um byte.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu vídeo: nem arquivo, nem quadro, nem nome, tamanho ou duração. Toda linha que lê, decodifica, inverte ou codifica é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. Ele não é mais do que um link: não avisa ninguém da sua visita e não recebe nada sobre você nem sobre o seu vídeo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/timeline.js` para a conta que decide qual quadro sai em que momento, e `src/reverse.js` para o laço que percorre o arquivo de trás para frente, um grupo de quadros por vez. Nenhum deles importa nada capaz de fazer uma requisição.
