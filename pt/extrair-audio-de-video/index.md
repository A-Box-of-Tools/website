# Extrair o áudio de um vídeo — só o som, em WAV

Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.

> Tire o som de um MP4, MOV ou WebM e salve como WAV. O vídeo não sai do seu computador e a imagem dele nunca é decodificada: o trabalho todo roda no seu próprio navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/extrair-audio-de-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

O decodificador do navegador lê apenas a faixa de áudio. O WAV é escrito localmente como PCM de 16 bits ou float de 32 bits. Esta ferramenta não tem codificador MP3, envio nem função de rede.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como extrair o áudio de um vídeo sem enviar o arquivo

1. **Arraste o vídeo.** Um MP4, MOV, M4V ou WebM, de um celular, de uma câmera, de um gravador de tela ou de um download. Quem lê é o seu próprio navegador; não existe etapa de envio para pular.
2. **Leia o que ele encontrou.** A duração, o número de canais e a taxa de amostragem, tirados direto do arquivo. Se o arquivo não declarou a taxa dele, a página diz isso, em vez de reamostrar caladinha e afirmar que nada foi mexido.
3. **Escolha o formato e os canais.** O PCM de 16 bits é a opção compatível padrão. Escolha float de 32 bits para preservar as amostras decodificadas sem arredondamento nem limitação. Mantenha os canais para as preservar; o mono calcula a média e reduz os dados estéreo para metade.
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

Esta página escreve WAV em vez de MP3. MP3 exige um codificador que esta ferramenta não inclui. Escolha PCM de 16 bits compatível ou float de 32 bits; nenhum exige o envio do arquivo. WAV é maior porque o áudio não é comprimido; outro editor pode comprimi-lo depois.

### A imagem chega a ser olhada?

Não, e aqui não existe nada que pudesse olhar. O decodificador do navegador recebe o arquivo e é perguntado pela faixa de áudio dele; a faixa de vídeo nunca é decodificada, nunca é desenhada e nem chega ao código desta página. Em `src/` não há nenhum decodificador de vídeo para rodar. O arquivo que sai tem som e mais nada.

### Diz que não deu para ler som, mas o vídeo toca normalmente.

Então o vídeo quase certamente não tem faixa de áudio. Uma gravação de tela feita sem microfone selecionado é muda, e um clipe exportado por um editor com o som no mudo também: os dois tocam perfeitamente, porque há imagem para mostrar. A mensagem cita esse caso primeiro porque é o mais provável dos dois; o outro é um formato que este navegador não vai ler. Abra o arquivo num player e procure um controle de volume que não faz nada: é o jeito mais rápido de saber qual dos dois você tem.

### Que formatos de vídeo posso abrir?

O que o seu navegador decodificar, o que na prática quer dizer MP4, M4V, MOV e WebM, e todos os formatos de áudio além desses. O que fica de fora é a mesma lista curta do resto do site: AVI, WMV e a maioria dos MKV. Um arquivo que o seu navegador não vai ler é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Perde qualidade?

O PCM de 16 bits arredonda as amostras decodificadas e limita os valores além da escala completa. Escolha float de 32 bits e mantenha os canais para preservar as amostras do decodificador, incluindo esses valores. O mono calcula a média dos canais. O float não recupera perdas já presentes no vídeo. É usada a frequência de amostragem detectada no arquivo; caso contrário, a página indica a frequência assumida.

### Por que o WAV é tão maior que o vídeo?

O áudio WAV não é comprimido. A 44,1 kHz, estéreo de 16 bits ocupa cerca de dez megabytes por minuto. O float duplica os dados das amostras; o mono reduz os dados estéreo para metade. O tamanho de saída é mostrado antes de o arquivo estar terminado.

### De que duração pode ser o vídeo?

O arquivo é lido e decodificado na memória, onde também é montado o WAV completo. Gravações longas podem exceder a memória disponível; saídas além do limite WAV de 4 GB são recusadas antes de escrever as amostras. Cancelar retira uma leitura pendente ou para a mistura e escrita por blocos. A decodificação do navegador pode continuar até terminar, mas o resultado cancelado é descartado.

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
- **O formato WAV torna a precisão explícita.** O PCM de 16 bits arredonda e limita as amostras decodificadas para favorecer a compatibilidade. O float de 32 bits preserva essas amostras quando os canais não mudam. O mono calcula a média dos canais. Ambos são escritos neste dispositivo sem enviar nada.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre o seu vídeo: nem arquivo, nem amostra, nem nome, tamanho ou duração.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/audio-decode.js` para o único decodificador que existe aqui e para entender por que a imagem nunca é pedida, e `src/shared/samplerate.js` para a leitura de cabeçalho que impede a sua gravação de ser reamostrada em silêncio.
