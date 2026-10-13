# AVIF para JPG — abra a imagem que não abre

O formato que os sites salvam hoje, no formato que todos sempre aceitaram.

> Converta imagens AVIF em JPG no seu navegador. O navegador já decodifica AVIF: nenhum arquivo é enviado, não há conta e funciona offline. A transparência é preenchida com a cor que você escolher.

Esta é uma ferramenta interativa de navegador em https://abox.tools/pt/avif-para-jpg/. Os arquivos são processados no dispositivo que executa esse navegador. Compartilhamento deliberado e funções opcionais de rede são explicados na página. A seguir está sua explicação escrita; abra o endereço para usá-la.

## Seus imagens são **processados no navegador**. Sem envio para processamento.

A conversão acontece no seu navegador, no seu próprio computador. Não há decodificador para baixar nem espera — seu navegador lê AVIF desde 2021. É justamente por isso que a imagem que nenhum outro programa abre aparece normalmente em uma aba do navegador. Esta página usa esse decodificador, desenha a imagem e grava um JPEG. A ferramenta não tem nenhum recurso de rede nem servidor para receber uma foto.

- ✗ Sem upload
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como converter AVIF em JPG

1. **Escolha seus arquivos AVIF.** Arraste-os para a área de seleção ou escolha-os manualmente. Cada arquivo é identificado pelos primeiros bytes, e não pelo nome. Assim, um AVIF renomeado durante o download continua funcionando, enquanto um arquivo que realmente é PNG é recusado com uma mensagem informando seu formato.
2. **Defina a qualidade e a cor de fundo para qualquer transparência.** O controle começa em 92, valor em que é difícil distinguir uma fotografia do original. O campo de cor só aparece se houver transparência na lista, porque o JPEG precisa preencher essas áreas.
3. **Clique em “Converter” e baixe.** Cada resultado informa o arquivo de origem, o novo tamanho e a comparação com o anterior — normalmente bem maior, porque AVIF comprime muito melhor e você está trocando tamanho por compatibilidade. Um arquivo oferece um botão para baixar; vários também oferecem um ZIP.

## A versão longa

[O arquivo que quase nada abre, exceto o navegador onde você lê isto](https://abox.tools/pt/guias/converter-avif-para-jpg/): Salvou uma imagem e recebeu um .avif que nenhum programa abre? O navegador consegue ler. O que é AVIF, o que JPEG não preserva, por que o resultado fica maior e como converter sem enviar o arquivo.

## Também na caixa

- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha um país e documento disponíveis. Requisitos e orientações são identificados.
- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.
- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.
- [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. O arquivo é lido, decodificado e gravado pelo seu navegador, no seu computador. Esta ferramenta não tem nenhum recurso de rede — não busca nem envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, nenhum deles pertencente a este site. Nem sequer há um decodificador para carregar primeiro: seu navegador já tem um.

### Por que nenhum programa no meu computador abre este arquivo?

Porque AVIF ainda é recente para muitos programas. Os sites passaram a usá-lo por ser muito menor que JPEG na mesma qualidade. Por isso, salvar uma imagem hoje pode gerar um `.avif` — e o programa usado para abri-lo muitas vezes é anterior ao formato. O Windows precisa de uma extensão, muitos editores ainda o recusam, e a maioria dos leitores de livros digitais, impressoras e formulários de upload não o reconhece. Seu navegador, por outro lado, lê AVIF perfeitamente. É por isso que esta página pode ajudar e também por isso que você recebeu esse formato.

### O JPG será maior que o AVIF?

Quase certamente, muitas vezes várias vezes maior, e o resultado informa quanto. AVIF é um dos codecs de imagem mais eficientes, enquanto JPEG é um dos mais antigos. Uma imagem de 40 KB em AVIF pode facilmente ocupar 200 KB em JPEG com a mesma qualidade visual. É a troca de tamanho por compatibilidade. Se o tamanho ainda importar, o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) reduz o JPEG até o tamanho que você definir.

### O que acontece com a transparência?

Ela é preenchida com a cor que você escolher, e a página avisa antes de você iniciar. AVIF tem canal alfa; JPEG não, então a transparência não pode ser preservada — a decisão é qual cor colocar no fundo, e essa escolha cabe a você. Na prática, a maioria dos AVIFs são fotografias sem transparência, e o campo nem aparece. Se precisar preservá-la, converta em PNG ou WebP com o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que lê AVIF e grava ambos os formatos.

### E o HDR e as cores de 10 bits?

Esta ferramenta grava um JPEG SDR comum de 8 bits a partir do canvas do navegador. A profundidade adicional e as informações HDR do AVIF não são preservadas; cores ou realces podem mudar. Guarde o original para arquivar. Existem formatos HDR baseados em JPEG: [a especificação Ultra HDR do Android](https://developer.android.com/media/platform/hdr-image-format) descreve um mapa de ganho que esta ferramenta não cria.

### A imagem é recomprimida?

Sim, necessariamente: AVIF e JPEG usam codecs diferentes, então é preciso decodificar a imagem e codificá-la novamente. Isso vale para todo conversor de AVIF, inclusive os que pedem upload. Você controla o impacto dessa etapa: o padrão é qualidade 92, em que é muito difícil distinguir uma fotografia do original.

### É possível converter no sentido contrário, de JPG para AVIF?

Aqui não. Esta ferramenta usa o codificador de canvas do navegador e não inclui um codificador AVIF. Um tipo de saída não aceito volta para PNG; mudar a extensão não cria um AVIF. Outras ferramentas podem codificar AVIF localmente com um codificador separado, sem upload. [As regras de saída do canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) explicam esse retorno.

### A data, a câmera e a localização são preservadas?

Não. A imagem é desenhada em um canvas, que contém apenas pixels. EXIF, GPS, perfis de cor e XMP ficam para trás. Uma imagem salva de uma página da web normalmente já não contém esses dados. Para ver ou editar os dados de um arquivo, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) faz isso sem recomprimir a imagem.

### Posso converter uma pasta inteira de uma vez?

Sim. Adicione quantos arquivos quiser — não há limite de quantidade ou tamanho, porque não existe servidor pagando pelo processamento. Cada arquivo tem sua própria linha e botão para baixar; com dois ou mais, você também pode baixar tudo em um ZIP.

### É grátis e funciona offline?

É grátis, sem conta, login, período de teste ou marca-d'água. Os anúncios sustentam o site e não recebem informações sobre suas imagens. E funciona offline: carregue a página uma vez e desconecte a internet. Ela continua funcionando exatamente como antes, o que também é a prova mais forte de que nada é enviado.

## Como dá para conferir a promessa de privacidade

- **O processamento acontece neste navegador.** A ferramenta processa entradas e resultados no navegador. Seu código não os envia para processamento. Content-Security-Policy limita recursos e destinos, mas hosts permitidos podem receber solicitações: ela não inspeciona o conteúdo nem prova sozinha que nada é enviado. Compare código e solicitações da operação ou conclua a operação local desconectado.
- **O decodificador já está no navegador: esse é o segredo.** Um AVIF que não abre no visualizador de fotos abre normalmente em uma aba do navegador, porque Chrome e Firefox decodificam AVIF desde 2021, e Safari desde 2023. Esta página oferece esse decodificador com um botão para salvar: abre o arquivo como o navegador já sabe fazer, desenha a imagem e grava um JPEG. Não é preciso baixar um mecanismo de conversão, esperar na primeira conversão ou envolver um servidor — justamente o que os conversores que pedem upload não explicam.
- **As áreas transparentes e o que fica atrás delas.** AVIF pode ter um canal alfa; JPEG não. Por isso é necessário preencher o fundo. Esta página pergunta qual cor usar e sugere branco, mas só quando um arquivo da lista realmente tem transparência — detectada nos pixels decodificados, em vez de deduzida. A maioria dos AVIFs salvos de sites são fotografias sem áreas transparentes, então esse campo normalmente fica oculto.
- **O que esta conversão não preserva.** Esta ferramenta grava um JPEG SDR comum de 8 bits a partir do canvas do navegador. A profundidade adicional e as informações HDR do AVIF não são preservadas; cores ou realces podem mudar. Guarde o original para arquivar.
- **O que o Google carrega e o que não recebe.** Os scripts de anúncios e medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum recebe informações sobre suas imagens. Todo o código que lê, decodifica ou grava um arquivo é servido por este site e está no repositório.
- **Funciona offline.** Carregue a página uma vez e desconecte a rede: a ferramenta continua igual. Essa é a prova mais simples: um conversor que enviasse suas imagens para processamento não conseguiria fazer isso.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/shared/image-convert.js` para a conversão — a identificação do formato que confirma se o arquivo é AVIF, a decodificação e o canvas de onde o JPEG é gravado. Os outros dois conversores de formato usam o mesmo arquivo, que não inclui nenhum codec.
