# Tarjar uma imagem — tarja preta, pixelar ou desfocar

O que você cobre é apagado do arquivo, não escondido dentro dele.

> Cubra um nome, um endereço ou um número de conta em uma foto ou print e salve a imagem de novo, de modo que os pixels ocultos somem do arquivo em vez de ficarem embaixo de um retângulo. Tudo acontece no navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/tarjar-imagem/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

O seu próprio navegador decodifica a imagem, pinta por cima e codifica de novo, com os codecs que ele já traz. Esta ferramenta não tem nenhuma função de rede, nem para buscar nem para enviar, e aqui isso pesa mais do que em quase qualquer outra página do site: as imagens que chegam a um censor são justamente aquelas em que ainda dá para ler um nome, um endereço ou um número de conta.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca-d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como tarjar uma imagem para que o que foi coberto suma de verdade

1. **Escolha a imagem.** Um print, um documento escaneado ou uma foto: qualquer coisa que o seu navegador consiga abrir. Ela é lida direto do seu disco e nada sai para lugar nenhum enquanto isso.
2. **Arraste uma caixa sobre o que ninguém deve ver.** E depois outra para a próxima coisa. Uma caixa se move arrastando, muda de tamanho pelas alças, ou pode ser alcançada com Tab e movida com as setas. O que aparece embaixo da caixa é o resultado de verdade, desenhado pelo mesmo código que vai escrever o arquivo.
3. **Escolha tarja, pixelar ou desfocar — e prefira a tarja.** A tarja preta não deixa absolutamente nada. Pixelar e desfocar trocam os pixels por médias deles mesmos, o que basta para um rosto ao fundo e não basta para nada que se leia como texto.
4. **Clique em “Tarjar e salvar” e confira o arquivo.** A imagem que aparece depois é o arquivo pronto, decodificado outra vez. Abra em um editor e procure uma camada, ou tente selecionar o texto coberto: existe uma única imagem achatada, e o que você cobriu foi sobrescrito antes de ela ser escrita.

## A versão longa

[Como tarjar uma imagem para que o que foi coberto suma de verdade](https://abox.tools/pt/guias/tarjar-uma-imagem/): As tarjas pretas desenhadas na maioria dos programas ficam por cima da imagem e podem ser arrastadas. O que separa uma tarja de verdade de uma simples cobertura, por que texto pixelado pode ser lido de volta e como conferir um arquivo antes de enviar.

## Também na caixa

- [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.
- [Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/): Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.
- [Imagem para ICO](https://abox.tools/pt/criar-favicon/): Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.
- [Imagem para data URI](https://abox.tools/pt/imagem-para-base64/): A imagem inteira como uma linha de texto. Cole direto no CSS ou no HTML.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. O arquivo é decodificado, tarjado e codificado pelo seu próprio navegador, no seu próprio equipamento. Esta ferramenta não tem nenhuma função de rede, nunca busca nada e nunca envia nada, e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, nenhum dos quais é nosso. Carregue a página uma vez, desconecte da internet e ela continua funcionando.

### O que foi coberto sumiu mesmo do arquivo?

Sim, e é para isso que esta ferramenta existe. A imagem é decodificada em um buffer de pixels; as caixas sobrescrevem os pixels que estão dentro delas; depois o buffer é codificado como um arquivo novo. Os valores originais já saíram da memória antes de o codificador receber qualquer coisa, então não há camada para esconder, anotação para remover nem histórico para desfazer. Dá para conferir do jeito que você conferiria a afirmação de qualquer outra pessoa: abra o resultado em um editor de imagens e procure uma segunda camada, ou tente selecionar o texto que você cobriu.

### Dá para recuperar uma área pixelada ou desfocada?

Às vezes, e essa é a única coisa que vale a pena ler antes de escolher. A tarja preta troca tudo o que está embaixo por uma cor chapada, então não sobrevive nada: nem uma borda, nem uma média, nem a quantidade de caracteres. Pixelar troca cada bloco pela média daquele bloco, e uma grade de médias ainda é uma medida do que estava embaixo: para texto em uma fonte comum e de tamanho previsível, trabalhos publicados já reconstruíram o original renderizando candidatos e comparando as médias. Desfocar é uma convolução, e convoluções em princípio podem ser invertidas. Então pixele um rosto ao fundo se quiser, e cubra com tarja tudo o que se lê como texto.

### Por que um retângulo preto desenhado num editor de documentos não é a mesma coisa?

Porque a maioria dos programas salva o retângulo ao lado da imagem e não dentro dela. Uma forma desenhada num leitor de PDF, numa apresentação, num editor de texto ou num editor de imagens com camadas é um objeto com posição, apoiado sobre a página: movê-lo, apagá-lo ou abrir o arquivo em outro programa devolve exatamente o que ele estava cobrindo. Jornais, tribunais e ministérios já publicaram documentos censurados assim. Aqui o retângulo não é salvo em lugar nenhum: são valores de pixel escritos por cima dos que estavam ali.

### Ele também remove os dados EXIF e GPS?

Sim, como efeito colateral. Salvar aqui significa codificar uma tela cheia de pixels, e uma tela não carrega etiquetas: a localização, o modelo da câmera, as datas e a miniatura embutida simplesmente não são escritas no arquivo novo. A miniatura importa: é uma segunda cópia pequena da imagem, nem sempre é refeita quando a foto é editada, e uma foto tarjada que viaja com uma miniatura sem tarja desfaz todo o trabalho. Se você quer os metadados fora sem que a imagem seja recodificada, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) reescreve o contêiner em vez da imagem.

### Quais formatos ele lê e escreve?

Ele lê tudo o que o seu navegador souber decodificar, na prática JPEG, PNG, WebP, GIF, BMP e, na maioria dos navegadores atuais, AVIF. Escreve JPEG, PNG e WebP, porque são os codificadores que os navegadores trazem. No modo automático um JPEG volta como JPEG e todo o resto volta como PNG, o que mantém uma foto com tamanho de foto e deixa nítido o texto que ficou à vista num print. A escolha não muda nada da tarja: os pixels já foram embora quando o codificador os vê.

### Dá para fazer isso sem mouse?

Dá. “Adicionar uma caixa no meio” coloca uma sobre a imagem, Tab passa de uma caixa para outra, as setas movem a que está em foco e Alt com as setas muda o tamanho; com Shift cada passo é de dez pixels e Delete remove. Cada caixa também tem, abaixo da imagem, uma linha com o tamanho, a posição, o que ela faz e um botão para removê-la, de modo que a ferramenta inteira funciona pelo teclado e é lida por um leitor de tela.

### Funciona no celular?

Funciona. Desenhar, mover e redimensionar usam eventos de ponteiro e não de mouse, então o dedo funciona igual, e as alças são desenhadas maiores numa tela sensível ao toque. A imagem na tela é redesenhada no tamanho da tela enquanto você trabalha; o arquivo em si é sempre tarjado na resolução original quando você aperta o botão.

### É gratuito, e preciso de conta?

É gratuito, e não há conta, cadastro, período de teste nem marca-d'água. Também não há limite de tamanho para a imagem, porque não há servidor pagando por isso: o trabalho acontece no seu próprio dispositivo. O site tem publicidade, que é o que o sustenta; os anúncios não recebem nada sobre as suas imagens.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles é nosso. Não existe aqui um ponto de coleta onde os seus arquivos possam parar, nem nada no código que os enviaria se existisse.
- **Os pixels cobertos somem aqui, não no caminho de saída.** A imagem é decodificada em um buffer de pixels, as caixas são escritas nesse buffer e o buffer vai para o codificador. Não existe nesta página nenhuma versão da imagem com as caixas como camada separada, porque essa versão nunca chega a ser criada. Veja `src/redact.js`.
- **Aqui nada busca nada.** Não há `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. O trabalho é `getImageData`, três laços sobre os bytes e `canvas.toBlob`, tudo isso já instalado no seu navegador.
- **As caixas não são relatadas a lugar nenhum.** Onde você desenhou, quantas são, de que tamanho e qual estilo escolheu ficam na memória desta página até você fechá-la. Neste repositório não há nenhum evento de analytics que leve qualquer coisa disso, e a única pergunta que o site faz depois de um download envia um joinha para cima ou para baixo e o nome da ferramenta, nada além.
- **Funciona offline.** Desconecte da rede e a ferramenta continua a mesma, porque nunca houve um passo de rede dentro dela. É a prova mais simples de todas, e é a que vale a pena fazer antes de tarjar um passaporte.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/redact.js` para as três funções que sobrescrevem os pixels e `src/preview.js` para entender por que o que aparece na tela é desenhado por essas mesmas três funções.
