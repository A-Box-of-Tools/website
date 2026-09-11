# Extrair quadro de vídeo — salvar uma imagem do vídeo

Uma imagem em qualidade cheia, de qualquer ponto.

> Salve qualquer quadro de um MP4, MOV ou WebM como PNG ou JPEG em tamanho cheio. Avance quadro a quadro, ou tire um a cada poucos segundos. Roda no navegador: nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/extrair-quadro-de-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

Os quadros são achados, decodificados e desenhados pelo seu próprio navegador, no seu próprio hardware. Aqui nada consegue buscar nem mandar coisa alguma, porque esta ferramenta não tem função de rede nenhuma. E mesmo que tivesse, do outro lado desta página não existe servidor para receber um vídeo.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Resolução cheia
- ✓ Funciona offline

## Como extrair um quadro de um vídeo

1. **Escolha um vídeo.** Arraste um MP4, MOV, M4V ou WebM até o seletor, ou procure na mão. O navegador lê direto do seu disco, e nesse meio-tempo nada sai daqui.
2. **Ache o momento.** Toque o vídeo e pare onde quiser, ou arraste o controle. Num MP4 o controle anda um quadro por passo, então não existe arredondamento entre o que você vê e o que você salva. As setas andam um quadro por vez, e com `Shift` andam dez.
3. **Escolha um formato.** O PNG guarda o quadro exatamente como ele saiu da decodificação, e é isso que “qualidade cheia” quer dizer aqui. JPEG e WebP são menores e são uma segunda compressão em cima da do próprio vídeo, o que serve para uma prévia e não para algo que ainda vai ser editado.
4. **Tire um, ou tire uma série.** Um quadro sozinho vai direto para os seus downloads. “A cada N segundos” percorre o vídeo uma vez e tira uma imagem em cada marca, o que é útil para folhas de contato e miniaturas, e elas saem num único ZIP em vez de cem perguntas de salvar.

## A versão longa

[Como salvar um quadro de um vídeo como imagem](https://abox.tools/pt/guias/extrair-um-quadro-de-um-video/): Tire uma imagem parada de um vídeo na resolução real: por que uma captura de tela do player pausado não é a mesma imagem, em que formato salvar e como cair exatamente no quadro que você queria.

## Também na caixa

- [Vídeo para GIF](https://abox.tools/pt/video-para-gif/): Escolha o trecho, o tamanho e a taxa de quadros.
- [Criador de GIF](https://abox.tools/pt/criar-gif/): Transforme um punhado de imagens em uma animação só.
- [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/): Cada quadro sai no próprio PNG.
- [Analisador de GIF](https://abox.tools/pt/analisar-gif/): Quadros, tempos, paletas e para onde foi cada byte.

## Perguntas

### O meu vídeo é enviado para algum lugar?

Não. Ele é lido e decodificado pelo seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar: nenhum é nosso. Se você prefere conferir a acreditar, desligue a internet e extraia um quadro assim mesmo.

### O que “qualidade cheia” quer dizer de verdade?

Duas coisas. A imagem é salva na resolução do próprio vídeo, não no tamanho da prévia da página: um vídeo em 4K dá uma imagem de ⁦3840 x 2160⁩. E com PNG escolhido, o quadro é guardado exatamente como saiu do decodificador, então o arquivo tem a imagem que o vídeo tem, sem uma segunda rodada de compressão em cima. Uma captura de tela da janela de um player não te dá nenhuma das duas coisas: ela tem o tamanho da janela e é tirada depois que o player redimensionou e aplicou o gerenciamento de cor.

### De quais formatos de vídeo dá para tirar um quadro?

MP4, M4V e MOV são lidos direto, seja lá o que tiver dentro: H.264, HEVC, AV1 ou VP9, desde que o seu navegador saiba decodificar aquele codec. Esse é o caminho exato, em que a ferramenta consegue endereçar quadros individuais. Qualquer outra coisa que o seu navegador toque, WebM à frente, é resolvida movendo o player e desenhando o que ele mostra, o que ainda salva uma imagem em tamanho cheio, mas cai no quadro que o player escolheu e não no que você pediu. Um arquivo que o navegador não consegue nem ler nem tocar, o que na prática quer dizer AVI, WMV, FLV e a maioria dos MKV, é recusado com uma mensagem dizendo isso.

### Dá para andar um quadro por vez?

Num MP4 dá, e com precisão: a ferramenta lê a própria lista de quadros do arquivo, então as setas se movem entre as imagens que realmente estão nele, inclusive num vídeo cuja taxa de quadros varia, onde um passo fixo de um trinta avos de segundo iria se desencontrando. No caminho de reprodução essa lista não existe, então um passo é um empurrãozinho de mais ou menos um quadro, e a página avisa.

### Por que o meu vídeo vertical de celular aparece em pé aqui?

Porque a rotação foi aplicada de propósito. O celular filma deitado e escreve um quarto de volta dentro do arquivo em vez de girar os pixels, então o quadro que um decodificador entrega está de lado e todo player o gira no caminho até a sua tela. Uma ferramenta que pula essa etapa salva uma imagem plausível do momento certo, deitada. Esta lê a rotação da trilha e aplica antes de desenhar qualquer coisa.

### Tem limite de tamanho ou de duração do vídeo?

Não tem limite embutido na ferramenta, e o arquivo não é lido inteiro para a memória de uma vez: ele é percorrido de poucos megabytes por vez, que é por isso que um vídeo longo abre tão rápido quanto um curto. As imagens que você tira ficam na página até você baixar, então o teto de verdade são umas poucas centenas de PNGs em 4K, e não o vídeo.

### Dá para redimensionar ou recortar a imagem depois?

Aqui não, mas do lado sim. Esta ferramenta salva o quadro do jeito que ele é; mudar o tamanho ou o formato é outro trabalho, com decisões próprias, e o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) faz as duas coisas, também sem enviar nada. Para deixar o arquivo menor sem mudar a imagem existe o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/).

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu vídeo.

## Como dá para conferir a promessa de privacidade

- **Os seus vídeos não têm para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde o seu arquivo pudesse parar, nem nada no código que o mandasse para lá se existisse.
- **Aqui nada busca nada.** Esta ferramenta não tem função de rede nenhuma: não tem endereço para colar, não tem nada para baixar, não tem motor nenhum baixado no primeiro uso. Cada byte que encosta no seu vídeo veio desta origem quando a página carregou.
- **A decodificação é local.** Os quadros passam pelo WebCodecs no seu próprio navegador, ou pelo mesmo motor de reprodução que mostraria o vídeo de qualquer jeito. A imagem é desenhada num canvas deste computador e entregue direto para um download.
- **O arquivo é lido de poucos megabytes por vez.** Vídeo é o único tipo de arquivo aqui que não cabe com segurança na memória, então ele nunca é carregado inteiro. O leitor pega uma janela em volta do quadro que você pediu, que é também por que um vídeo de dois gigabytes abre tão rápido quanto um pequeno.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu vídeo: nem arquivo, nem quadro, nem nome, tamanho, duração ou o momento em que você parou. Toda linha que lê, decodifica ou desenha é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. Ele não é mais do que um link: não avisa ninguém da sua visita e não recebe nada sobre você nem sobre o seu vídeo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/mp4-reader.js` para o leitor que acha os quadros dentro de um MP4, e `src/frames.js` para a parte que decodifica o quadro que você pediu. Nenhum dos dois importa nada capaz de fazer uma requisição.
