# Cortar vídeo — mudar o enquadramento online

Reduza um clipe à parte que importa.

> Corte um MP4, MOV ou WebM para qualquer formato: quadrado, 9:16, ou uma caixa exata em pixels. Roda no navegador, não envia nada, mantém o som e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/cortar-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

Cada quadro é decodificado, cortado e codificado pelo seu próprio navegador, no seu próprio hardware. Nada aqui consegue buscar nem mandar coisa alguma, porque não existe função de rede nenhuma nesta ferramenta. E do outro lado desta página não existe servidor nenhum para onde mandar um vídeo, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Mantém o som
- ✓ Funciona offline

## Como cortar um vídeo

1. **Escolha um vídeo.** Arraste um MP4, MOV, M4V ou WebM até o seletor, ou escolha um na mão. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Arraste a caixa sobre a parte que você quer manter.** Arraste dentro dela para movê-la e qualquer canto para redimensionar. Trave numa proporção antes (1:1 para um post quadrado, 9:16 para celular, 16:9 para um quadro deitado) ou digite uma caixa exata em pixels nos quatro campos abaixo. Toque o vídeo, ou arraste o controle deslizante abaixo dele, para escolher o quadro sobre o qual você alinha a caixa.
3. **Escolha quanta qualidade gastar.** A imagem precisa ser codificada de novo, porque um quadro cortado é outra imagem. A “Equilibrada” mantém a imagem perto do que o arquivo já gastava naquela área, e a “Melhor qualidade” gasta mais. O som é mantido, a menos que você desligue.
4. **Corte e baixe.** O trabalho acontece no seu próprio hardware, então o tempo que leva depende do seu computador e não de uma fila. O vídeo pronto vai direto para os downloads do seu navegador.

## A versão longa

[Como cortar um vídeo para outro formato de tela](https://abox.tools/pt/guias/cortar-um-video/): Reduza um clipe a um quadrado, a um retrato 9:16 ou a uma caixa exata em pixels. Qual proporção cada plataforma quer, por que cortar obriga a recodificar e aparar não, e o que isso custa.

## Também na caixa

- [Inversor de vídeo](https://abox.tools/pt/inverter-video/): O último quadro primeiro, com som e tudo.
- [Criador de timelapse](https://abox.tools/pt/fazer-timelapse/): Uma hora de gravação em vinte segundos.
- [Extrator de quadro](https://abox.tools/pt/extrair-quadro-de-video/): Uma imagem em qualidade cheia, de qualquer ponto.
- [Vídeo para GIF](https://abox.tools/pt/video-para-gif/): Escolha o trecho, o tamanho e a taxa de quadros.

## Perguntas

### Meu vídeo é enviado para algum lugar?

Não. Quem lê, decodifica, corta e codifica é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. Se você prefere conferir a acreditar, desligue a internet e corte um clipe assim mesmo.

### Quais formatos de vídeo posso cortar?

MP4, M4V e MOV são lidos diretamente, seja lá o que houver dentro deles: H.264, HEVC, AV1 ou VP9, desde que o seu navegador saiba decodificar aquele codec. Qualquer outra coisa que o seu navegador consiga tocar, e aí o caso mais óbvio é o WebM, é cortada tocando o arquivo e gravando o resultado, o que funciona mas leva o mesmo tempo que o clipe dura. Um arquivo que o navegador não consegue nem ler nem tocar, o que na prática significa AVI, WMV, FLV e a maioria dos MKVs, é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Existe limite de tamanho ou de duração do vídeo?

A ferramenta não tem limite embutido, e o arquivo não é lido para a memória de uma vez só: ele é percorrido em fatias de alguns megabytes. O teto prático é o vídeo pronto, que é montado na memória antes de você baixar, e o tempo que o seu computador leva para codificá-lo.

### O som sobrevive?

No caminho do MP4, exatamente: o áudio é copiado amostra por amostra sem nunca ser decodificado, então sai byte a byte igual ao que estava no arquivo. No caminho da gravação, ele é capturado da reprodução e codificado de novo, o que custa um pouco de qualidade. De qualquer jeito, existe uma caixinha para deixá-lo de fora por completo.

### Cortar perde qualidade?

A imagem é codificada de novo, porque um quadro cortado é outra imagem e não tem como guardá-la sem escrever os pixels de novo. O que a ferramenta não faz é gastar mais do que o original gastava naquela mesma área, já que recodificar acima disso só deixa o arquivo maior sem deixá-lo mais bonito.

### Posso encurtar a duração também?

Aqui não, mas na ferramenta ao lado sim. Esta muda o formato da imagem e mais nada: o clipe que sai tem exatamente a mesma duração do que entrou, com a temporização e o som intactos. Aparar é outro trabalho e é outra ferramenta. O [Aparador de vídeo](https://abox.tools/pt/aparar-video/) marca os trechos de um clipe que valem a pena e os salva como um arquivo só, sem recodificar um quadro.

### Por que a largura e a altura andam de dois em dois?

O H.264, o codec dentro de um MP4, guarda a imagem em blocos e não tem como descrever um quadro com um número ímpar de pixels num lado. Em vez de arredondar o seu corte em silêncio depois que você o define, a caixa já oferece só números pares desde o começo.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre o seu vídeo.

## Como dá para conferir a promessa de privacidade

- **Seus vídeos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Esta ferramenta não tem função de rede nenhuma: nenhum endereço para colar, nada para baixar, nenhum motor buscado no primeiro uso. Cada byte que encosta no seu vídeo veio desta origem quando a página carregou.
- **A decodificação e a codificação são locais.** Os quadros passam pelo WebCodecs no seu próprio navegador, ou pelo mesmo motor de reprodução que exibiria o clipe para você de qualquer jeito. O arquivo pronto é montado na memória deste computador e vai direto para um download.
- **O som é copiado, não escutado.** No caminho do MP4, as amostras de áudio são movidas sem serem decodificadas. Nada aqui as transforma de volta em som, e nada conseguiria passá-las a lugar nenhum se transformasse.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu vídeo: nem um arquivo, nem um quadro, nem um nome, um tamanho, uma duração ou o formato para o qual você cortou. Toda linha que lê, decodifica, corta ou codifica é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre o seu vídeo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/mp4-reader.js` para o leitor que acha os quadros num MP4, e `src/transcode.js` para o laço que decodifica, corta e codifica. Nenhum dos dois importa qualquer coisa que consiga fazer uma requisição.
