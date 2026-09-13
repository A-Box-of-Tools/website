# Imagens para vídeo — fazer uma apresentação em MP4

Transforme uma pasta de imagens em um vídeo.

> Transforme imagens JPG, PNG ou WebP num vídeo MP4 de apresentação, de graça e inteiramente no seu navegador. Nada é enviado, não pede cadastro e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/imagens-para-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

Cada quadro é codificado pelo seu próprio navegador, e o vídeo é montado na memória deste computador. O codificador nunca encosta na rede, e do outro lado desta página não existe servidor nenhum para onde mandar uma imagem, mesmo que ele encostasse.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu computador

## Como transformar imagens em um vídeo

1. **Escolha suas imagens.** Arraste uma pasta até o seletor, ou escolha os arquivos na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Ponha em ordem e defina quanto tempo cada uma fica.** Arraste para reordenar. O tempo de permanência pode ser dado em quadros ou em segundos, para todas as imagens de uma vez ou uma imagem por vez.
3. **Escolha uma resolução e uma taxa de quadros.** O “Acompanhar a maior resolução” segue a sua maior imagem. As predefinições cobrem 4K, 1080p, 720p, quadrado e vertical, e ainda tem um tamanho personalizado se nenhum deles servir.
4. **Crie o vídeo e baixe.** A codificação roda no seu próprio hardware, então o tempo que leva depende do seu computador e não de uma fila. O MP4 pronto vai direto para os downloads do seu navegador.

## A versão longa

[Como transformar uma pasta de imagens em um vídeo](https://abox.tools/pt/guias/transformar-imagens-em-video/): Faça uma apresentação em MP4 a partir de fotos: o que a taxa de quadros e a duração de fato controlam, o que fazer com imagens de formato diferente, e por que o resultado sai sem trilha sonora.

## Também na caixa

- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.
- [Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.
- [Inversor de vídeo](https://abox.tools/pt/inverter-video/): O último quadro primeiro, com som e tudo.
- [Criador de timelapse](https://abox.tools/pt/fazer-timelapse/): Uma hora de gravação em vinte segundos.

## Perguntas

### Minhas imagens são enviadas para algum lugar?

Não. Quem lê, compõe e codifica as suas imagens é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. A única exceção é a função opcional de “adicionar a partir de um endereço da web”, que busca uma imagem que você cola, e aí aquele servidor enxerga o seu endereço IP.

### Quais formatos de imagem posso usar?

Qualquer formato de imagem parada que o seu navegador consiga decodificar, o que na prática significa JPG, PNG, WebP, GIF, AVIF e, em dispositivos Apple, HEIC. Não existe aqui uma lista separada para manter atualizada, porque decodificar é trabalho do navegador, e não nosso.

### Que formato de vídeo ele produz?

MP4 com vídeo H.264, que toca em basicamente qualquer coisa. Num navegador sem WebCodecs a ferramenta recua para gravar WebM, que são as mesmas imagens num contêiner que menos editores aceitam.

### Posso usar isto para uma sequência renderizada do Blender ou do After Effects?

Pode, e é justamente para isso que uma sequência renderizada numerada serve aqui. Acrescente os quadros que o seu renderizador escreveu, deixe o tempo de permanência em um quadro cada, e ajuste a taxa de quadros para bater com a renderização. O “Ordenar por nome” conta do jeito que você espera, então `frame_2` cai antes de `frame_10`, e não depois. \
\
Uma coisa que vale saber antes de começar: o H.264 não tem canal alfa, então a transparência é achatada sobre a cor de fundo em vez de ser levada adiante. Se você precisa manter o alfa, componha os quadros no seu editor.

### Posso fazer um timelapse com fotos?

Pode, e é o mesmo trabalho de uma sequência renderizada: mantenha cada foto por um único quadro e escolha uma taxa de quadros. A 30 fps, cada trinta fotos viram um segundo de vídeo; a 12 fps, essas mesmas fotos duram dois segundos e meio. \
\
O “Ordenar por data” devolve um rolo de câmera à ordem em que foi fotografado, o que importa quando os nomes de arquivo recomeçaram em 0001. Fotos de tamanhos diferentes não são problema, porque o “Acompanhar a maior resolução” dimensiona o vídeo de modo que nenhuma delas seja reduzida.

### Existe limite de quantas imagens, ou de quanto o vídeo pode durar?

A ferramenta não tem limite embutido. O teto prático é a memória do seu próprio computador, porque o vídeo pronto é montado ali antes de você baixar. Apresentações muito grandes em 4K são a primeira coisa a sentir isso.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para serem processadas pararia no instante em que você tirasse da tomada.

### Posso acrescentar música ou uma trilha sonora?

Ainda não. A ferramenta produz só vídeo: o MP4 que ela escreve tem uma única trilha de vídeo e nenhuma trilha de áudio. Se você precisa de trilha sonora, acrescente depois, num editor de vídeo.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse. Isto já foi `connect-src 'none'`, que era absoluto. Acrescentar publicidade custou isso, e contar essa parte faz parte do acordo.
- **A codificação é local.** O WebCodecs roda no seu navegador e o arquivo pronto vai direto para um download. Não existe lado de servidor neste aplicativo.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre as suas imagens: nem um arquivo, nem uma miniatura, nem um nome, um tamanho ou uma contagem. Toda linha que lê, decodifica, compõe ou codifica uma imagem é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre as suas imagens. Nada acontece a menos que você clique, e o lugar para onde ele leva é o site de outra empresa.
- **Uma exceção de propósito.** Se você usar “Adicionar a partir de um endereço da web”, aquele servidor é acessado para buscar a imagem e vai enxergar o seu endereço IP. Só são buscadas as imagens que você cola, e só para dentro: o `img-src` é aberto, o `connect-src` não. O contador abaixo lista todas as origens externas acessadas.
- **Funciona offline.** Desligue a rede e tudo continua funcionando, menos o carregamento por endereço da web. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/encoder.js` para o laço de codificação, que nunca encosta na rede.
