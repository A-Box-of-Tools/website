# Imagens para vídeo

Crie um MP4 a partir de uma sequência renderizada, fotos de timelapse ou uma apresentação.

> Converta uma sequência de imagens para MP4 no navegador. Use um quadro por imagem para renderizações e timelapses, ou segundos por foto para uma apresentação. Sem upload nem conta.

Esta é uma ferramenta interativa de navegador em https://abox.tools/pt/imagens-para-video/. Os arquivos são processados no dispositivo que executa esse navegador. Compartilhamento deliberado e funções opcionais de rede são explicados na página. A seguir está sua explicação escrita; abra o endereço para usá-la.

## Seus imagens são **processados no navegador**. Sem envio para processamento.

Cada quadro é codificado pelo seu próprio navegador, e o vídeo é montado na memória deste computador. O codificador nunca encosta na rede, e do outro lado desta página não existe servidor nenhum para onde mandar uma imagem, mesmo que ele encostasse.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu computador

## Como converter uma sequência de imagens ou uma apresentação para MP4

1. **Escolha suas imagens.** Arraste uma pasta até o seletor, ou escolha os arquivos na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Escolha quadros para uma sequência ou segundos para uma apresentação.** Use “Ordenar por nome” para quadros numerados de renderização e confira a primeira e a última miniatura. Mantenha um quadro por imagem para uma sequência renderizada ou um timelapse de fotos, e ajuste a taxa de quadros à sua fonte. Para uma apresentação, mude para segundos, digite um tempo como três e clique em “Aplicar a todas”. Arraste para reordenar ou altere o tempo de uma imagem específica.
3. **Escolha uma resolução e uma taxa de quadros.** Escolha 1080p para uma primeira exportação, ou use o formato quadrado ou vertical do destino. “Acompanhar a maior resolução” usa a maior largura e a maior altura entre as imagens. “Caber dentro” mantém a imagem inteira; “Preencher o quadro” corta as bordas. Confira o resumo de duração e tamanho de saída antes de codificar.
4. **Crie o vídeo e baixe.** A codificação roda no seu próprio hardware, então o tempo que leva depende do seu computador e não de uma fila. O MP4 pronto vai direto para os downloads do seu navegador.

## A versão longa

[Transforme uma sequência de imagens ou apresentação de fotos em MP4](https://abox.tools/pt/guias/transformar-imagens-em-video/): Transforme quadros renderizados numerados ou fotos de time-lapse em MP4, ou crie uma apresentação. Escolha a duração em quadros ou segundos, confira a ordem e evite cortes ou tempos incorretos.

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

O formato preferido é MP4 com vídeo H.264. A alternativa grava em tempo real, geralmente como WebM, que menos editores aceitam. Mantenha a aba visível durante essa gravação; os tempos são aproximados e imagens podem ser puladas se a decodificação atrasar. Use o codificador MP4 para sequências numeradas exatas quando o navegador oferecer suporte.

### Posso usar isto para uma sequência renderizada do Blender ou do After Effects?

Pode, e é justamente para isso que uma sequência renderizada numerada serve aqui. Acrescente os quadros que o seu renderizador escreveu, deixe o tempo de permanência em um quadro cada, e ajuste a taxa de quadros para bater com a renderização. O “Ordenar por nome” conta do jeito que você espera, então `frame_2` cai antes de `frame_10`, e não depois. \
\
Uma coisa que vale saber antes de começar: o H.264 não tem canal alfa, então a transparência é achatada sobre a cor de fundo em vez de ser levada adiante. Se você precisa manter o alfa, componha os quadros no seu editor.

### Posso fazer um timelapse com fotos?

Pode, e é o mesmo trabalho de uma sequência renderizada: mantenha cada foto por um único quadro e escolha uma taxa de quadros. A 30 fps, cada trinta fotos viram um segundo de vídeo; a 12 fps, essas mesmas fotos duram dois segundos e meio. \
\
“Ordenar por data” usa as datas de modificação dos arquivos, que podem mudar quando as fotos são copiadas ou editadas. Confira a ordem quando os nomes dos arquivos tiverem recomeçado em 0001. Fotos de tamanhos diferentes não são problema, porque “Acompanhar a maior resolução” começa com a maior largura e a maior altura, depois limita a borda mais longa a 7680 pixels e arredonda para dimensões pares. Confira o resumo do tamanho de saída; originais muito grandes ainda podem ser reduzidos.

### Existe limite de quantas imagens, ou de quanto o vídeo pode durar?

Não há limite fixo de imagens, mas as exportações MP4 precisam ficar abaixo de 4 GiB (cerca de 4,3 GB). O vídeo pronto é montado na memória antes do download, então seu dispositivo pode ficar sem memória bem antes desse limite. O codificador do navegador também limita as dimensões de saída. Se uma exportação grande falhar, reduza a resolução, encurte a sequência ou divida-a em partes.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para serem processadas pararia no instante em que você tirasse da tomada.

### Posso acrescentar música ou uma trilha sonora?

Ainda não. A ferramenta produz só vídeo: o MP4 que ela escreve tem uma única trilha de vídeo e nenhuma trilha de áudio. Se você precisa de trilha sonora, acrescente depois, num editor de vídeo.

## Como dá para conferir a promessa de privacidade

- **O processamento acontece neste navegador.** A ferramenta processa entradas e resultados no navegador. Seu código não os envia para processamento. Content-Security-Policy limita recursos e destinos, mas hosts permitidos podem receber solicitações: ela não inspeciona o conteúdo nem prova sozinha que nada é enviado. Compare código e solicitações da operação ou conclua a operação local desconectado.
- **A codificação é local.** O WebCodecs roda no seu navegador e o arquivo pronto vai direto para um download. Não existe lado de servidor neste aplicativo.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre as suas imagens: nem um arquivo, nem uma miniatura, nem um nome, um tamanho ou uma contagem. Toda linha que lê, decodifica, compõe ou codifica uma imagem é servida desta origem e está listada no repositório.
- **O botão de doação não carrega nada e não recebe nada.** O botão “Buy me a coffee” do cabeçalho é desenhado pela própria página e não carrega nada de lugar nenhum. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre as suas imagens. Nada acontece a menos que você clique, e o lugar para onde ele leva é o site de outra empresa.
- **Uma exceção de propósito.** Se você usar “Adicionar a partir de um endereço da web”, aquele servidor é acessado para buscar a imagem e vai enxergar o seu endereço IP. Só são buscadas as imagens que você cola, e só para dentro: o `img-src` é aberto, o `connect-src` não. O contador abaixo lista todas as origens externas acessadas.
- **Funciona offline.** Desligue a rede e tudo continua funcionando, menos o carregamento por endereço da web. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/encoder.js` para o laço de codificação, que nunca encosta na rede.
