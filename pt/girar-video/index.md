# Girar vídeo — para a gravação que ficou de lado

Um quarto de volta, meia volta ou para o outro lado. A rotação fica no cabeçalho do arquivo: nenhum quadro é decodificado e nada se perde.

> Gire um vídeo de lado ou de cabeça para baixo em um quarto ou meia volta no navegador. A rotação é gravada no cabeçalho: nenhum quadro é recodificado e nada se perde. Ou aplique-a aos pixels para players antigos. Aceita MP4, MOV, WebM e MKV; gera MP4. Sem upload.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/girar-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

O vídeo escolhido é lido, recebe um novo cabeçalho e é gravado na memória deste computador por código servido por este site. Se você pedir para aplicar a rotação aos pixels, os codecs do seu navegador desenham os quadros. Nada aqui pode enviar um arquivo, e não há servidor para recebê-lo. Um gigabyte não precisa ir e voltar para ser girado.

- ✗ Sem upload
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como girar um vídeo

1. **Escolha o vídeo.** Um arquivo por vez: MP4, MOV, M4V, WebM ou MKV. O navegador o lê diretamente do disco, e a página informa o formato e a orientação em que ele aparece atualmente.
2. **Escolha a rotação e observe a prévia.** Um quarto de volta à direita, um quarto à esquerda ou de cabeça para baixo. O primeiro quadro é desenhado com a mesma transformação que o arquivo terá: a prévia mostra o que o player fará. Marque “aplicar aos pixels” apenas se um player tiver mostrado o vídeo de lado. Você também pode omitir o áudio para gerar um vídeo sem som.
3. **Gire e confira a mensagem de verificação.** O cabeçalho é gravado e cada quadro é copiado, o que leva segundos. Aplicar aos pixels leva o tempo de uma codificação, com uma barra de progresso. Depois, o arquivo pronto é reaberto e precisa manter a duração, a orientação pedida e o áudio. Ele é reproduzido da memória abaixo do botão para baixar, para você conferir a orientação.

## A versão longa

[Como girar um vídeo sem perder qualidade](https://abox.tools/pt/guias/girar-um-video/): Por que o vídeo do celular aparece de lado, o que fazem os nove números do cabeçalho, quando basta mudá-los e quando girar os pixels, tudo no navegador sem enviar o arquivo.

## Também na caixa

- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.
- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.
- [Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.
- [Inversor de vídeo](https://abox.tools/pt/inverter-video/): O último quadro primeiro, com som e tudo.

## Perguntas

### Girar o vídeo reduz a qualidade?

Não, no modo padrão. A rotação é gravada no cabeçalho e cada quadro é copiado byte a byte: a imagem permanece igual e o tamanho quase não muda. Apenas “aplicar aos pixels” recodifica, e a página avisa antes de você marcar. Um serviço que recodifica por padrão — como a maioria dos online — faz uma recodificação para uma tarefa que precisava alterar nove números.

### Por que o arquivo ainda aparece de lado em um player?

Porque esse player ignora a matriz de exibição. Celulares, navegadores, players modernos e editores a respeitam; alguns players antigos mostram os quadros como foram armazenados. Marque “Aplicar a rotação aos pixels”: os próprios quadros serão girados e recodificados em H.264, para todos os players mostrarem a mesma orientação, com a perda de uma geração de qualidade.

### Qual é o sentido de um quarto de volta à direita?

Horário: o topo da imagem se move como ao girar o celular para a direita. A prévia mostra o primeiro quadro girado conforme a escolha. Selecione o botão que deixa a imagem correta e inicie a rotação.

### Quais arquivos são aceitos?

MP4, MOV e M4V com qualquer codec de vídeo, porque a rotação no cabeçalho independe dos quadros. WebM e MKV com H.264 têm os quadros copiados; para outros codecs, a rotação é aplicada aos pixels, porque este gravador só pode criar um cabeçalho MP4 com H.264 nesses casos. Áudio AAC é copiado; Opus, Vorbis, MP3 e FLAC são recodificados em AAC. Áudio que o navegador não decodifica é identificado e omitido. O resultado é sempre MP4.

### Quanto tempo leva?

Segundos no modo padrão: o arquivo é lido uma vez para identificar sua estrutura e mais uma vez ao gravar o resultado. Um gigabyte passa à velocidade do disco. Aplicar aos pixels leva o tempo de o computador codificar o vídeo — com codificação por hardware, disponível na maioria dos notebooks e celulares recentes, costuma ser mais rápido que a duração do vídeo; sem ela, mais lento.

### Meus vídeos são enviados para algum lugar?

Não. O arquivo é lido, recebe um novo cabeçalho e é gravado pelo seu navegador, no seu computador. A `Content-Security-Policy` da página lista todos os endereços que ela pode contatar — nenhum pertence a este site. A forma mais simples de conferir é desconectar a rede e usar a ferramenta mesmo assim. Para arquivos desse tamanho, também é a forma mais rápida: o upload levaria mais que a tarefa inteira.

### Funciona no celular?

Sim. O modo padrão não decodifica nada, então um celular faz a rotação tão rapidamente quanto um notebook. O arquivo pronto fica na memória até você salvá-lo, que é o único limite; um celular costuma guardar algumas centenas de megabytes de resultado sem problemas. Aplicar aos pixels exige codificação, e o codificador por hardware do próprio celular é rápido nessa tarefa.

### Há limite de tamanho, e custa alguma coisa?

A entrada é lida do disco em partes, então pode ser maior que a memória disponível. O arquivo pronto fica na memória até você baixá-lo, e um MP4 gravado aqui não pode ultrapassar 4 GB. É grátis, sem conta, login ou período de teste. Os anúncios sustentam o site e não recebem informações sobre seus vídeos.

### Funciona offline?

Sim. Carregue a página uma vez e desconecte a internet: ela continua funcionando. Essa também é a forma mais simples de provar que nada é enviado. Uma ferramenta que enviasse seu vídeo para ser girado pararia assim que você se desconectasse.

## Como dá para conferir a promessa de privacidade

- **Uma rotação são nove números no cabeçalho, e a página altera apenas eles.** Um celular que filma de lado não gira os pixels. Ele guarda os quadros como o sensor os captou e grava um quarto de volta no cabeçalho da faixa — uma matriz de exibição de nove números — que o player aplica ao mostrar o vídeo. Um vídeo que aparece de lado precisa de outra matriz, não de outra imagem. Esta página grava a matriz da rotação escolhida e copia cada quadro e pacote exatamente como estava, sem decodificar nenhum. Por isso um gigabyte leva segundos, a imagem permanece idêntica bit a bit e o arquivo sai com quase o mesmo tamanho.
- **O upload é a parte demorada, e aqui ele não acontece.** Todo serviço online de rotação pede o arquivo inteiro primeiro: o gigabyte passa pela sua conexão para voltar girado. O upload costuma demorar mais que o processamento, antes mesmo de perguntar quem guarda o arquivo. A maioria desses serviços ainda recodifica, perdendo uma geração de qualidade para uma tarefa que precisava alterar nove números. Esta página lê o arquivo com código servido por este site e grava o novo na memória: os bytes só vão do seu disco à memória e de volta. A `Content-Security-Policy` lista todos os endereços que a página pode contatar — nenhum pertence a este site — e a ferramenta funciona sem conexão à rede.
- **Quem respeita o cabeçalho e o que fazer quando um player não respeita.** Celulares, navegadores, players modernos e editores aplicam a matriz de exibição; é assim que vídeos de celular aparecem na orientação correta desde 2010. Alguns players antigos ignoram a matriz e mostram os quadros armazenados de lado. Para eles, ou quando você não puder verificar o destino, a página oferece aplicar a rotação aos pixels: cada quadro é desenhado girado em um canvas e recodificado em H.264. Isso perde uma geração de qualidade e leva o tempo de uma codificação, por isso é a alternativa secundária, identificada como tal.
- **O resultado é reaberto e verificado.** Uma matriz errada, ou correta com dimensões erradas, ainda poderia gerar um arquivo que abre. Por isso o arquivo pronto é reaberto pelo mesmo leitor usado na entrada. Ele precisa manter a duração, aparecer na orientação e nas dimensões pedidas e conter o áudio esperado. A prévia abaixo do botão para baixar reproduz o arquivo da memória, para você conferir a orientação antes de salvá-lo.
- **Quais arquivos são lidos e o que é gravado.** MP4, MOV e M4V com qualquer codec de vídeo — H.264, HEVC, VP9 ou AV1 — porque uma rotação no cabeçalho independe dos quadros. Também WebM e MKV: quadros H.264 são copiados; para outros codecs, a rotação é aplicada aos pixels, porque este gravador só pode criar um cabeçalho MP4 com H.264 nesses casos. Áudio AAC é copiado; Opus, Vorbis, MP3 ou FLAC é recodificado em AAC. Um áudio que o navegador não consegue decodificar é identificado e omitido. O resultado é sempre MP4, o contêiner aceito por todos.
- **O que o Google carrega e o que não recebe.** Os scripts de anúncios e medição vêm do Google. Nenhum recebe informações sobre seu vídeo: arquivo, quadro, nome, tamanho, duração ou direção da rotação. Todo o código que lê, gira ou grava um vídeo é servido por este site e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão "Buy me a coffee" no cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e usa letras do Google Fonts. É apenas um link: não registra visitas e não recebe informações sobre você ou seus vídeos. Nada acontece até você clicar, e o destino é um site de outra pessoa.
- **Funciona offline.** Desconecte a rede e tudo nesta página continua funcionando. Essa é a prova mais simples: uma ferramenta que enviasse seu vídeo para ser girado pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/plan.js` para os nove números que representam a rotação, `src/rotate.js` para a cópia e a gravação, e `src/shared/copy-tracks.js` para ver como cada quadro é transferido sem ser decodificado. Nenhum pode acessar a rede, nem os leitores e o gravador que os acompanham.
