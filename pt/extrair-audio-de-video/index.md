# Extrair o áudio de um vídeo — só o som, em WAV

Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.

> Tire o som de um MP4, MOV ou WebM e salve como WAV. O vídeo não sai do seu computador e a imagem dele nunca é decodificada: o trabalho todo roda no seu próprio navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/extrair-audio-de-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

O decodificador é o que o seu navegador já tem, o mesmo caminho de código que toca um arquivo num elemento `<video>`, e o que se pede a ele é a faixa de áudio e mais nada. Escrever um WAV é colocar um cabeçalho de quarenta e quatro bytes na frente das amostras, em `src/shared/wav.js`. Não há nenhum codificador no caminho, não há etapa de envio, e esta página não tem função de rede de espécie alguma.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como extrair o áudio de um vídeo sem enviar o arquivo

1. **Arraste o vídeo.** Um MP4, MOV, M4V ou WebM, de um celular, de uma câmera, de um gravador de tela ou de um download. Quem lê é o seu próprio navegador; não existe etapa de envio para pular.
2. **Leia o que ele encontrou.** A duração, o número de canais e a taxa de amostragem, tirados direto do arquivo. Se o arquivo não declarou a taxa dele, a página diz isso, em vez de reamostrar caladinha e afirmar que nada foi mexido.
3. **Escolha mono, se quiser menor.** Deixar os canais em paz mantém a gravação exatamente como era. Misturar para mono corta o arquivo pela metade e é o que uma transcrição ou uma gravação de voz quer; ele tira a média dos canais em vez de jogar um fora.
4. **Escute antes de salvar.** O player toca o arquivo que está prestes a ser baixado, não o vídeo: se soa certo, o download está certo.
5. **Leve embora, ou passe adiante.** Baixe o WAV, ou mande direto para o cortador ou para o editor sem salvar antes.

## Também na caixa

- [Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.
- [Editor de áudio](https://abox.tools/pt/editar-audio/): Toque de trás para a frente, mude a velocidade, levante uma gravação baixa. Tudo aqui, no seu computador.
- [Juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/): Páginas trocadas de lugar sem ida e volta a um servidor.
- [Compressor de PDF](https://abox.tools/pt/comprimir-pdf/): Encolha um documento sem mandá-lo para lugar nenhum.

## Perguntas

### Meu vídeo é enviado para algum lugar?

Não. A decodificação e a escrita acontecem as duas no seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles é nosso. Se você prefere conferir a ouvir, desconecte da internet e tire o som mesmo assim.

### Ela pode me dar um MP3?

Não, e não vai fingir que dá. Nenhum navegador vem com um codificador de MP3, e o único jeito de chegar a um é mandar o seu vídeo para um servidor que tenha um — que é justamente a única coisa que este site existe para não fazer. O que você recebe é um WAV: as amostras com um cabeçalho de quarenta e quatro bytes na frente, que não precisa de codificador nenhum e não pode custar qualidade. É maior, uns dez megabytes por minuto em estéreo, e qualquer player, celular ou editor abre. O que quiser um MP3 faz um a partir dele em um segundo.

### A imagem chega a ser olhada?

Não, e aqui não existe nada que pudesse olhar. O decodificador do navegador recebe o arquivo e é perguntado pela faixa de áudio dele; a faixa de vídeo nunca é decodificada, nunca é desenhada e nem chega ao código desta página. Em `src/` não há nenhum decodificador de vídeo para rodar. O arquivo que sai tem som e mais nada.

### Diz que não deu para ler som, mas o vídeo toca normalmente.

Então o vídeo quase certamente não tem faixa de áudio. Uma gravação de tela feita sem microfone selecionado é muda, e um clipe exportado por um editor com o som no mudo também: os dois tocam perfeitamente, porque há imagem para mostrar. A mensagem cita esse caso primeiro porque é o mais provável dos dois; o outro é um formato que este navegador não vai ler. Abra o arquivo num player e procure um controle de volume que não faz nada: é o jeito mais rápido de saber qual dos dois você tem.

### Que formatos de vídeo posso abrir?

O que o seu navegador decodificar, o que na prática quer dizer MP4, M4V, MOV e WebM, e todos os formatos de áudio além desses. O que fica de fora é a mesma lista curta do resto do site: AVI, WMV e a maioria dos MKV. Um arquivo que o seu navegador não vai ler é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Perde qualidade?

Nada além do que o vídeo já fez com o próprio áudio quando foi criado. As amostras que o decodificador devolve são escritas como são: não há uma segunda codificação, então não há uma segunda geração de perda. A única coisa a saber é a taxa de amostragem: a taxa do próprio arquivo é lida primeiro no cabeçalho e a decodificação é feita nessa taxa, então a sua gravação não é reamostrada em silêncio. Se um arquivo não declara nenhuma, a página diz qual taxa ela assumiu.

### Por que o WAV é tão maior que o vídeo?

Porque um WAV não é comprimido e a faixa de áudio do vídeo era. Som com qualidade de CD ocupa uns dez megabytes por minuto em estéreo, seja lá o que ele tenha; a faixa AAC dentro de um MP4 talvez um décimo disso. Misturar para mono corta pela metade. É o preço de não recodificar, e ele se paga uma vez só: o que você abrir com o arquivo depois já pode comprimir.

### De que duração pode ser o vídeo?

Não há limite nenhum posto aqui, porque não há servidor pagando por um. O teto de verdade é a memória do seu próprio computador: o arquivo é lido inteiro e a faixa de áudio toda fica guardada como amostras, então uma gravação muito longa num aparelho pequeno pode ficar sem espaço. Umas poucas horas de vídeo normalmente vão bem, e um celular aguenta menos que um notebook.

### Dá para encurtar ou aumentar o volume?

Dá, mas não aqui: esta página faz um trabalho só. Quando existe um resultado, aparece uma fileira de links ao lado do download que o leva direto para o [cortador de áudio](https://abox.tools/pt/cortar-audio/) ou para o [editor de áudio](https://abox.tools/pt/editar-audio/) sem salvar antes, e sem que nenhum dos dois envie nada também.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de quantos vídeos você abre. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu arquivo.

### Funciona offline?

Funciona. Carregue a página uma vez, desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada é enviado: uma ferramenta que mandasse o seu vídeo embora para processar pararia no instante em que você desconectasse.

## Como dá para conferir a promessa de privacidade

- **O seu vídeo não tem para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles é nosso. Não existe aqui nenhum ponto final onde um arquivo pudesse ser recolhido, nem nada no código que o enviaria se existisse.
- **A imagem não é decodificada de jeito nenhum.** Só a faixa de áudio é pedida. Os quadros não são lidos, nem decodificados, nem desenhados, nem olhados — não há nesta página código capaz disso — e o arquivo que sai tem som e mais nada. Isso não é uma promessa de contenção: o `decodeAudioData` recebe os bytes e devolve som, e em `src/` não há nenhum decodificador de vídeo para rodar.
- **O decodificador é o que o seu navegador já tem.** Nada é entregue aqui para ler o seu formato, e nada fora desta página é acionado para lê-lo também. Quais arquivos funcionam é, portanto, exatamente o que o seu navegador já toca.
- **As amostras são escritas como são, não recodificadas.** Um WAV são as amostras que o decodificador devolveu, com um cabeçalho na frente. Não há nenhum codificador no caminho tomando decisões sobre a sua gravação, e não há nada que se possa chamar de envio para isso acontecer.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre o seu vídeo: nem arquivo, nem amostra, nem nome, tamanho ou duração.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/audio-decode.js` para o único decodificador que existe aqui e para entender por que a imagem nunca é pedida, e `src/shared/samplerate.js` para a leitura de cabeçalho que impede a sua gravação de ser reamostrada em silêncio.
