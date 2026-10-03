# WebP para JPG — converta sem enviar arquivos

As imagens que a web salva, no formato que todos ainda aceitam.

> Converta imagens WebP em JPG no seu navegador. O navegador já decodifica WebP: nenhum arquivo é enviado, não há conta e funciona offline. A transparência é preenchida com a cor que você escolher.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/webp-para-jpg/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

A conversão acontece no seu navegador, no seu próprio computador. Não há decodificador para baixar nem mecanismo de conversão para carregar — seu navegador lê WebP desde 2020 e grava JPEG desde que existe, então tudo de que esta página precisa já estava no seu computador antes de você chegar. É por isso que podemos fazer essa promessa: a ferramenta não tem nenhum recurso de rede, nem servidor para receber uma imagem.

- ✗ Sem upload
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como converter WebP em JPG

1. **Escolha seus arquivos WebP.** Arraste-os para a área de seleção ou escolha-os manualmente. Cada arquivo é identificado pelos primeiros bytes, e não pelo nome. Assim, um WebP chamado “.jpg” continua funcionando — e um arquivo que realmente é PNG é recusado com uma mensagem informando seu formato, em vez de ser convertido em uma cópia de si mesmo.
2. **Leia as informações de cada arquivo.** A lista mostra o tamanho e as dimensões, além de três informações úteis antes da conversão: se o WebP é sem perdas, se contém áreas transparentes e se é animado. Cada aviso só aparece quando se aplica àquele arquivo.
3. **Defina a qualidade e a cor de fundo da transparência.** O controle começa em 92, valor em que é difícil distinguir uma fotografia do original. O campo de cor só aparece se houver transparência na lista, porque o JPEG precisa preencher essas áreas.
4. **Clique em “Converter” e baixe.** Cada resultado informa o arquivo de origem, o novo tamanho e a comparação com o anterior. Também avisa se a transparência foi preenchida ou se apenas o primeiro quadro de uma animação foi gravado. Um arquivo oferece um botão para baixar; vários também oferecem um ZIP.

## A versão longa

[A imagem que a web salva e o formato que quase tudo aceita](https://abox.tools/pt/guias/converter-webp-para-jpg/): Salvou uma imagem e recebeu um .webp que outros programas não abrem? O que é WebP, por que converter costuma aumentar o tamanho, o que acontece com a transparência e como fazer sem enviar nada.

## Também na caixa

- [PNG para WebP](https://abox.tools/pt/png-para-webp/): A mesma imagem, muitas vezes um terço menor, com as áreas transparentes intactas.
- [AVIF para JPG](https://abox.tools/pt/avif-para-jpg/): O formato que os sites salvam hoje, no formato que todos sempre aceitaram.
- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha o país. Ele aplica a regra daquele país, exatamente.
- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. O arquivo é lido, decodificado e gravado pelo seu navegador, no seu computador. Esta ferramenta não tem nenhum recurso de rede — não busca nem envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, nenhum deles pertencente a este site. Diferentemente do conversor de HEIC, nem sequer há um decodificador para carregar primeiro: seu navegador já tem um.

### Por que converter WebP em JPG?

Porque o programa que vai receber a imagem ainda não aceita WebP. Esse é o formato que um navegador salva ao clicar com o botão direito em muitas imagens da web, e produz arquivos muito pequenos — mas muita coisa ainda não o aceita: versões antigas do Office e do Photoshop, algumas gráficas, vários formulários que verificam a extensão, a maioria dos leitores de livros digitais e muitos programas que acompanham câmeras ou impressoras. JPG é o formato tradicionalmente aceito por todos.

### O que acontece com as áreas transparentes?

Elas são preenchidas com a cor que você escolher, e a página avisa antes de você iniciar. JPEG não tem canal alfa, então a transparência não pode ser preservada — a decisão é qual cor colocar no fundo, e essa escolha cabe a você. O padrão é branco porque costuma funcionar para um logotipo em um documento. Se precisar preservar a transparência, mantenha o WebP ou converta-o em PNG com o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que grava PNG e WebP, além de JPEG.

### É possível converter um WebP animado?

A ferramenta converte o primeiro quadro e avisa tanto na lista, antes de você iniciar, quanto no resultado. Um JPEG contém uma única imagem, então não pode guardar os demais quadros. Para obter cada quadro em um arquivo separado ou transformar a animação em vídeo, use [Dividir um GIF](https://abox.tools/pt/separar-gif-em-quadros/) ou [GIF para MP4](https://abox.tools/pt/gif-para-mp4/), depois de ter a animação em formato GIF.

### A imagem é recomprimida?

Sim, necessariamente: WebP e JPEG usam codecs diferentes, então é preciso decodificar a imagem e codificá-la novamente. Isso vale para todo conversor de WebP para JPG, inclusive os que pedem upload. Você controla o impacto dessa etapa — o padrão é qualidade 92, em que é muito difícil distinguir uma fotografia do original. Vale observar o caso de um WebP sem perdas: o JPEG será a primeira cópia com perdas dessa imagem. A lista identifica esses arquivos para evitar surpresas.

### O JPG será maior que o WebP?

Muitas vezes, sim, e o resultado informa quanto. WebP comprime melhor que JPEG na mesma qualidade visual — por isso a web passou a usá-lo — e converter de volta costuma aumentar o tamanho. Você troca alguns bytes por compatibilidade, uma escolha válida quando o destino não aceita WebP. Se o tamanho ainda importar, o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) reduz o JPEG até o tamanho que você definir.

### A data, a câmera e a localização são preservadas?

Não. A imagem é desenhada em um canvas, que contém apenas pixels. EXIF, GPS, perfis de cor e XMP ficam para trás. Na prática, a maioria dos WebPs da web já teve esses dados removidos, e normalmente é esse o resultado desejado ao enviar uma imagem. Para ver ou editar os dados de um arquivo, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) faz isso sem recomprimir a imagem.

### Posso converter uma pasta inteira de uma vez?

Sim. Adicione quantos arquivos quiser — não há limite de quantidade ou tamanho, porque não existe servidor pagando pelo processamento. Cada arquivo tem sua própria linha e botão para baixar; com dois ou mais, você também pode baixar tudo em um ZIP. Arquivos com o mesmo nome recebem um número antes da extensão, para que nenhum substitua outro silenciosamente no arquivo ZIP.

### É grátis? Preciso de uma conta?

É grátis, sem conta, login, período de teste ou marca-d'água. Os anúncios sustentam o site e não recebem informações sobre suas imagens.

### Funciona offline?

Sim. Carregue a página uma vez e desconecte a internet: ela continua funcionando exatamente como antes. Essa também é a prova mais forte de que nada é enviado: um conversor que enviasse seus arquivos para processamento pararia assim que você se desconectasse, e este não para.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum pertence a este site. Não existe aqui um endereço capaz de coletar seus arquivos, nem código que os enviaria se existisse.
- **Não há decodificador para distribuir, por isso não há servidor.** Todo navegador lançado desde 2020 decodifica WebP, e todos já gravavam JPEG muito antes disso. Portanto, esta ferramenta não inclui um mecanismo de conversão, não baixa nada no primeiro uso e não precisa funcionar em um servidor — justamente o que os conversores que pedem upload não explicam. A ferramenta daqui que inclui um codec é o [conversor de HEIC](https://abox.tools/pt/heic-para-jpg/), porque, entre os navegadores, só o Safari abre HEIC, e isso está explicado na página dele.
- **As áreas transparentes e o que fica atrás delas.** Um WebP pode ter transparência; um JPEG não — o formato não possui canal alfa, então algo precisa ocupar o fundo. Esta página pergunta qual cor usar e sugere branco. A pergunta só aparece quando um arquivo da lista realmente tem transparência, detectada nos pixels decodificados, em vez de deduzida pelo formato. Um conversor que não pergunta não está preservando sua transparência: está escolhendo preto por você. É daí que vem o logotipo com fundo preto.
- **O que um canvas não preserva.** A imagem é decodificada e desenhada em um canvas, que contém apenas pixels. EXIF, perfis de cor ICC, XMP e blocos de direitos autorais não são preservados. Para muita gente isso é uma vantagem; para outras pessoas, uma perda. Por isso explicamos aqui, para evitar surpresas. Se você precisa dos metadados, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) os lê e grava sem recomprimir a imagem.
- **O que o Google carrega e o que não recebe.** Os scripts de anúncios e medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum recebe informações sobre suas imagens. Todo o código que lê, decodifica ou grava um arquivo é servido por este site e está no repositório.
- **Funciona offline.** Carregue a página uma vez e desconecte a rede: a ferramenta continua igual. Essa é a prova mais simples: um conversor que enviasse suas imagens para processamento não conseguiria fazer isso.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/shared/image-convert.js` para a conversão em si — a identificação do formato real do arquivo, a decodificação e o canvas de onde o JPEG é gravado. Os outros dois conversores de formato usam o mesmo arquivo, com cerca de trezentas linhas e nenhum codec incluído.
