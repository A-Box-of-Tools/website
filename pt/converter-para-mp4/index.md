# Converter para MP4 — WebM, MKV e MOV em um arquivo compatível

Da gravação de tela, do arquivo extraído ou da câmera para um MP4 com H.264 e AAC. Copia o que pode e só recodifica o necessário.

> Converta WebM, MKV, MOV ou MP4 para um MP4 com H.264 e AAC, compatível com celulares, navegadores e formulários de envio. H.264 e AAC são copiados intactos; as outras faixas são recodificadas no seu computador. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/converter-para-mp4/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

O vídeo escolhido é lido, separado em faixas e regravado como MP4 na memória deste computador, pelos codecs do navegador e por código servido por este site. Nada aqui pode fazer um upload, e não há servidor para recebê-lo. Um gigabyte não precisa ser enviado para voltar como outro gigabyte.

- ✗ Sem upload
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como converter um vídeo para MP4

1. **Escolha o vídeo.** Um arquivo por vez: WebM, MKV, MOV, M4V ou MP4. O navegador lê diretamente do disco e mostra a duração, o tamanho, a resolução e o contêiner.
2. **Leia as duas frases.** Uma explica a imagem; a outra, o som. Cada uma indica se a faixa já é compatível com este MP4 e será copiada intacta ou qual formato tem e para qual será recodificada. O próprio arquivo determina o processo. Se o navegador não conseguir ler o áudio, ou se você preferir um vídeo mudo, marque a opção de omiti-lo.
3. **Converta e leia a linha de verificação.** As faixas compatíveis são copiadas. As demais são recodificadas quadro a quadro, com uma barra de progresso. Depois, o resultado é aberto de novo para conferir duração, H.264 e o áudio anunciado. Ele toca da memória abaixo do download para você revisar.

## A versão longa

[Como converter um vídeo para um MP4 que o destino aceite](https://abox.tools/pt/guias/converter-video-para-mp4/): O que torna um MP4 compatível, por que WebM, MKV ou MOV de iPhone são recusados, quando a conversão não perde nada e quando recodifica, e como fazer tudo no navegador sem enviar o arquivo.

## Também na caixa

- [Rotacionar vídeo](https://abox.tools/pt/girar-video/): Um quarto de volta, meia volta ou para o outro lado. Na rotação pelo cabeçalho, os quadros da imagem ficam intactos.
- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.
- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.
- [Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.

## Perguntas

### A qualidade vai piorar?

Nas faixas copiadas, não. A página informa quais foram copiadas. Quadros H.264 e pacotes AAC passam byte por byte, então um MKV com H.264 vira um MP4 com a mesma imagem. Faixas recodificadas — vídeo VP9, VP8, AV1 ou HEVC; áudio Opus, Vorbis, MP3 ou FLAC — passam por mais uma geração de compressão, com taxa de bits ajustada ao original. A perda é pequena, não inexistente. Guarde o original em qualquer caso.

### Por que não manter HEVC ou VP9 no MP4 se eles ocupam menos?

Porque o resultado poderia abrir em menos lugares que o original, e o objetivo é melhorar a compatibilidade. HEVC em MP4 pode exigir uma licença ausente no computador. VP9 ou AV1 em MP4 são recusados por muitos formulários e clientes de e-mail. H.264 e AAC são a combinação mais amplamente aceita. A página usa essa combinação e explica o custo antes de começar.

### Meu WebM é uma gravação de tela. O som será preservado?

Sim. O navegador costuma gravar áudio Opus, incompatível com este MP4, então ele é decodificado e recodificado como AAC a 160 kbit/s, mais que suficiente para um microfone. A imagem VP8 ou VP9 vira H.264. Tudo acontece no seu computador, e o resultado é reaberto para conferir a duração e a presença do som.

### Por que meu MOV precisa ser convertido? Ele já não é MP4?

Quase. MOV e MP4 compartilham o mesmo projeto. Um MOV com H.264 e AAC é copiado em segundos, sem recodificar quadros: só muda o contêiner que o formulário estava recusando pela extensão. Um MOV de iPhone com HEVC é outro caso. A imagem precisa virar H.264, desde que o navegador consiga decodificar HEVC, o que acontece na maioria dos computadores, mas não em todos.

### Quais arquivos são aceitos?

WebM e MKV com vídeo VP8, VP9, AV1, H.264 ou HEVC e áudio Opus, Vorbis, AAC, MP3 ou FLAC; MP4, MOV e M4V com vídeo H.264, HEVC, VP9 ou AV1 e áudio AAC. Se o navegador não decodificar a imagem, a conversão para e informa o formato. Se não decodificar o áudio, ele é omitido e a imagem ainda é convertida. AVI, WMV, FLV e MPEG-2 não são lidos.

### Quanto tempo leva?

Copiar leva aproximadamente o tempo de ler o arquivo duas vezes: segundos para a maioria dos vídeos. Recodificar depende do computador. Com codificação por hardware, presente em muitos notebooks e celulares recentes, costuma levar menos que a duração do vídeo; sem ela, demora mais. Um vídeo longo em 4K pode exigir bastante tempo. A barra mostra o quadro atual, e cancelar interrompe imediatamente sem gravar um resultado.

### Meus vídeos são enviados para algum lugar?

Não. O navegador lê, decodifica quando necessário, codifica e grava no seu próprio computador. A `Content-Security-Policy` lista os endereços que a página pode acessar, e nenhum pertence a este site. Para conferir, desconecte a rede e continue usando a ferramenta. Com arquivos desse tamanho, evitar o envio também costuma poupar mais tempo que a própria conversão.

### Funciona no celular?

Sim, se o navegador conseguir decodificar e codificar vídeo. O codificador por hardware do celular costuma ser rápido. A limitação é a memória: o resultado fica nela até ser salvo, e um vídeo muito longo pode não caber. Corte antes com o [Cortador de vídeo](https://abox.tools/pt/aparar-video/) ou converta em um notebook.

### Há limite de tamanho ou algum custo?

O original é lido do disco em partes e pode ser maior que a memória. O resultado fica na memória até o download e, neste gravador MP4, não pode ultrapassar 4 GB. A ferramenta é gratuita, sem conta, login ou período de teste. A publicidade mantém o site, mas não recebe dados dos seus vídeos.

### Funciona offline?

Sim. Carregue a página uma vez, desconecte a internet e ela continua funcionando. É também a forma mais simples de conferir que o arquivo não é enviado: uma ferramenta que dependesse de um servidor para converter pararia sem conexão.

## Como dá para conferir a promessa de privacidade

- **O envio é a parte demorada, e aqui ele não acontece.** Vídeo costuma ser o maior arquivo que as pessoas precisam transferir. Conversores on-line pedem o original inteiro: um gigabyte sobe pela conexão para que outro volte. O envio costuma demorar mais que a conversão, antes mesmo de perguntar quem guarda o arquivo. Esta página lê o arquivo com código servido por este site e grava o resultado com os codecs já presentes no navegador. Os bytes só vão do disco para a memória e de volta. A `Content-Security-Policy` lista todos os endereços que a página pode acessar, e nenhum pertence a este site. A ferramenta funciona sem conexão à rede.
- **O que “MP4” significa aqui e por que o resultado usa essa combinação.** O arquivo aceito de forma mais ampla é um MP4 comum com vídeo H.264 e áudio AAC. Celulares, navegadores, aplicativos de mensagem, clientes de e-mail e formulários aceitam essa combinação. WebM, MKV e MP4 com HEVC, VP9 ou AV1 ainda são recusados em muitos lugares. Por isso esta página grava somente H.264 e AAC. Não copia outro codec de vídeo para o resultado, mesmo que seja eficiente: abrir em menos lugares que o original não resolveria o problema.
- **Copia o que pode, recodifica só o necessário e informa a diferença.** Converter nem sempre significa recodificar. Os quadros H.264 de um MKV já são os bytes que o MP4 precisa, então são copiados intactos; o mesmo vale para AAC. VP9 ou VP8 de WebM, HEVC de MOV de iPhone e áudio Opus ou Vorbis precisam ser decodificados e codificados de novo. O resultado fica uma geração mais distante da câmera. Antes de começar, a página explica o que acontecerá com cada faixa em duas frases. Assim, a palavra “converter” não esconde uma recodificação.
- **O resultado é aberto de novo e conferido.** Um conversor que perdesse o último segundo ou criasse uma faixa de áudio vazia ainda produziria um MP4. Por isso o resultado é reaberto pelo mesmo leitor usado no original. Ele precisa conservar a duração, usar H.264 e conter o som anunciado. O vídeo toca da memória abaixo do download para você conferir antes de salvar.
- **Quanto trabalho isso exige do seu computador.** Copiar é rápido: o arquivo é lido uma vez para entender a estrutura e outra durante a gravação. Recodificar depende do computador. Com codificação por hardware, presente em muitos notebooks e celulares recentes, costuma levar menos que a duração do vídeo; sem ela, pode levar mais, principalmente em vídeos longos em 4K. O original é lido em partes e pode ser maior que a memória. Já o resultado fica na memória até o download, o que limita o tamanho possível. Você pode cancelar a qualquer momento.
- **Quais arquivos são lidos e quais não são.** WebM e MKV, duas variantes do mesmo formato, com vídeo VP8, VP9, AV1, H.264 ou HEVC e áudio Opus, Vorbis, AAC, MP3 ou FLAC; e MP4, MOV e M4V com vídeo H.264, HEVC, VP9 ou AV1 e áudio AAC. Se o navegador não decodificar a imagem, geralmente HEVC sem suporte ou licença, o formato é identificado e a conversão é recusada. Se não decodificar o áudio, ele é identificado e omitido; a imagem ainda pode ser convertida. AVI, WMV, FLV e MPEG-2 não são lidos, e a página explica isso.
- **O que o Google carrega e o que não recebe.** Os scripts de publicidade e medição vêm do Google. Nenhum recebe dados do vídeo: arquivo, quadro, nome, tamanho, duração ou formato original. Toda linha que lê, codifica ou grava o vídeo é servida por este site e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e usa letras do Google Fonts. É apenas um link: não informa visitas nem recebe dados seus ou dos vídeos. Nada acontece sem um clique, que abre o site de outra pessoa.
- **Funciona offline.** Desconecte a rede e tudo continua funcionando. É a comprovação mais simples: uma ferramenta que enviasse o vídeo para convertê-lo em outro lugar pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/plan.js` mostra quais faixas são copiadas e quais são recodificadas; `src/convert.js` faz a cópia e a gravação; e `src/shared/mkv-reader.js` lê WebM e MKV. Nenhum deles acessa a rede, nem os outros leitores e o gravador que os acompanham.
