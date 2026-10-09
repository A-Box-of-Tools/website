# PNG para WebP — menor, com a transparência intacta

A mesma imagem, muitas vezes um terço menor, com as áreas transparentes intactas.

> Converta imagens PNG e AVIF em WebP no navegador, sem perdas ou com tamanho ainda menor. A transparência é preservada nos dois modos. Sem upload nem conta, e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/png-para-webp/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

A conversão acontece no seu navegador, no seu próprio computador. Todos os navegadores gravam WebP desde 2020, então o codificador já estava no seu computador antes de você chegar — não há nada para baixar nem espera. É por isso que podemos fazer essa promessa: a ferramenta não tem nenhum recurso de rede, nem servidor para receber uma imagem.

- ✗ Sem upload
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como converter PNG em WebP

1. **Escolha seus arquivos PNG e AVIF.** Arraste-os para a área de seleção ou escolha-os manualmente. Cada arquivo é identificado pelos primeiros bytes, e não pelo nome. Um arquivo que realmente é JPEG é recusado com uma mensagem explicando o formato, em vez de ser convertido em uma cópia de si mesmo. A lista identifica as áreas transparentes, porque é o que as pessoas mais receiam perder.
2. **Escolha sem perdas ou menor.** Sem perdas preserva cada pixel opaco do PNG e ainda gera um arquivo menor — ideal para capturas de tela, diagramas, logotipos e imagens com texto. Menor ativa o controle de qualidade e é a escolha para fotografias, em que a diferença costuma ser imperceptível e a economia é enorme.
3. **Clique em “Converter” e confira o resultado.** Cada resultado informa o novo tamanho e a comparação com o original, além da codificação realmente gravada pelo navegador — sem perdas, ou com perdas na qualidade escolhida. Essa informação é lida do arquivo pronto, em vez de apenas repetir a configuração.
4. **Baixe um arquivo por vez ou todos juntos.** Um arquivo oferece um botão para baixar; com dois ou mais, também é possível baixar tudo em ZIP. Arquivos com o mesmo nome recebem um número antes da extensão, para que nenhum substitua outro silenciosamente no arquivo ZIP.

## A versão longa

[A mesma imagem, um terço menor e com a transparência intacta](https://abox.tools/pt/guias/converter-png-para-webp/): WebP é menor que PNG mesmo sem descartar informação, e muito menor com uma pequena perda. Qual modo escolher para cada imagem, quanto ele economiza e como converter sem enviar arquivos.

## Também na caixa

- [AVIF para JPG](https://abox.tools/pt/avif-para-jpg/): O formato que os sites salvam hoje, no formato que todos sempre aceitaram.
- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha o país. Ele aplica a regra daquele país, exatamente.
- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.
- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. O arquivo é lido, decodificado e gravado pelo seu navegador, no seu computador. Esta ferramenta não tem nenhum recurso de rede — não busca nem envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, nenhum deles pertencente a este site.

### A transparência é preservada?

Sim, nos dois modos. Esse é o principal motivo para converter PNG em WebP em vez de JPEG. WebP tem um canal alfa de verdade, então um logotipo com fundo transparente continua com fundo transparente — sem escolher cor nem preencher o fundo. Antes da conversão, a lista informa se cada arquivo tem transparência; depois, o resultado confirma que ela foi preservada.

### Qual é a diferença entre sem perdas e menor?

Sem perdas significa que cada pixel opaco do WebP é igual ao do PNG, e o arquivo ainda fica menor — normalmente de um quinto a um terço menor, porque a codificação sem perdas do WebP é mais eficiente que a do PNG. A ressalva envolve pixels parcialmente transparentes e tem uma pergunta própria abaixo. Menor usa a codificação com perdas do WebP, que descarta detalhes pouco perceptíveis e pode reduzir uma fotografia a um décimo do tamanho. A regra prática: texto, cores uniformes e bordas nítidas pedem sem perdas; fotografias pedem o outro modo.

### Vocês dizem “cada pixel opaco”. E os parcialmente transparentes?

Eles podem mudar muito pouco, por causa do canvas, e não do WebP. O navegador armazena uma imagem no canvas com as cores já multiplicadas pela transparência, e essa multiplicação não pode ser desfeita com exatidão — quanto menos visível o pixel, menos da cor original sobrevive ao cálculo. Todo conversor no navegador tem essa característica, inclusive este, porque o canvas faz a passagem entre os formatos. \
\
Na prática, um pixel totalmente opaco é preservado bit a bit, assim como um totalmente invisível. Entre os dois extremos, a cor armazenada pode mudar — aqui medimos diferenças de até 63 em 255 para pixels com menos de um quarto de opacidade, e de no máximo 4 nos demais. Isso não é visível, porque os pixels cuja cor mais muda são os que menos contribuem para a imagem: um pixel quase invisível mostra uma cor quase invisível, qualquer que seja o valor armazenado. Essa diferença só ocorre, por exemplo, nas bordas suavizadas de um logotipo, que continuam com a mesma aparência. \
\
Se precisar de uma cópia exata para arquivamento, mantenha o PNG. Se precisar da mesma aparência com um arquivo um terço menor, é isso que esta ferramenta faz.

### Como vocês sabem que o arquivo realmente é sem perdas?

Porque o arquivo pronto é lido e verificado, em vez de apenas repetir a configuração. WebP armazena os pixels em um de dois blocos — `VP8L` para codificação sem perdas e `VP8` para codificação com perdas. A página verifica o bloco gravado e informa na linha do resultado. Isso é necessário porque o canvas não tem uma opção explícita de sem perdas: pedir esse modo significa solicitar a qualidade máxima e confiar que o navegador escolha a codificação correta. Todos os navegadores atuais fazem isso. A página verifica mesmo assim.

### Um WebP abre em qualquer lugar?

Na web, sim — Chrome, Edge, Firefox e Safari exibem WebP desde 2020, então um site já não precisa oferecer outro formato como alternativa. Fora do navegador, a compatibilidade varia: Windows e macOS já exibem prévias, mas alguns programas antigos, formulários de upload e muitos leitores de livros digitais ainda recusam WebP. Se o destino não aceitar o formato, use o conversor de [WebP para JPG](https://abox.tools/pt/webp-para-jpg/), que faz a conversão no sentido contrário.

### Por que meu PNG é tão grande?

Porque PNG é sem perdas, e fotografias não comprimem bem desse modo. PNG é excelente para capturas de tela e logotipos, com grandes áreas repetidas, mas inadequado para fotografias, em que quase nada se repete — uma foto de celular salva como PNG costuma ser dez vezes maior que o JPEG da mesma imagem. É justamente nesse caso que o modo com perdas faz sentido. Se o arquivo precisa ficar abaixo de um tamanho específico, o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) permite definir um tamanho-alvo em vez da qualidade.

### A data, a câmera e a localização são preservadas?

Não. A imagem é desenhada em um canvas, que contém apenas pixels, e os metadados ficam para trás. Em PNG isso normalmente tem pouca importância — a maioria nem contém dados de câmera. [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) lê e edita metadados JPEG, PNG e WebP sem recodificar suas imagens. Para AVIF, mostra o EXIF disponível como somente leitura e limpa convertendo a primeira imagem decodificada para um PNG novo; as cores ou o HDR podem mudar.

### Posso converter uma pasta inteira de uma vez?

Sim. Adicione quantos arquivos quiser — não há limite de quantidade ou tamanho, porque não existe servidor pagando pelo processamento. Cada arquivo tem sua própria linha e botão para baixar; com dois ou mais, você também pode baixar tudo em um ZIP, com a economia total indicada no topo.

### É grátis? Preciso de uma conta?

É grátis, sem conta, login, período de teste ou marca-d'água. Os anúncios sustentam o site e não recebem informações sobre suas imagens.

### Funciona offline?

Sim. Carregue a página uma vez e desconecte a internet: ela continua funcionando exatamente como antes. Essa também é a prova mais forte de que nada é enviado: um conversor que enviasse seus arquivos para processamento pararia assim que você se desconectasse, e este não para.

### Também posso converter imagens AVIF?

AVIF também é aceito se seu navegador conseguir decodificá-lo. A saída continua sendo WebP. Sequências AVIF produzem apenas a primeira imagem decodificada. O canvas do navegador cria uma cópia SDR de 8 bits: a cor ou o HDR podem mudar, os metadados são omitidos e o arquivo pode ficar maior. O original permanece intacto.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum pertence a este site. Não existe aqui um endereço capaz de coletar seus arquivos, nem código que os enviaria se existisse.
- **A transparência é preservada, como a maioria das pessoas precisa.** WebP tem canal alfa, assim como PNG. Um logotipo com fundo transparente continua com fundo transparente: não é preciso escolher cor nem preencher nada. Essa é a diferença em relação ao conversor de [WebP para JPG](https://abox.tools/pt/webp-para-jpg/), que precisa perguntar, porque JPEG não tem canal alfa.
- **A codificação sem perdas é verificada.** Um canvas não tem uma opção explícita de WebP sem perdas — o navegador escolhe a codificação conforme a qualidade solicitada, e os navegadores atuais usam a codificação sem perdas no máximo do controle. Esse comportamento vem do mecanismo do navegador, não de uma garantia da especificação. Por isso verificamos: cada arquivo gravado é lido novamente, e a linha informa se os bytes realmente usam a codificação sem perdas. Se um navegador deixar de respeitar isso, você será avisado na hora, em vez de descobrir depois.
- **O que um canvas não preserva.** A imagem é decodificada e desenhada em um canvas, que contém apenas pixels. Portanto, blocos de texto, perfil de cor ICC e blocos XMP do PNG não são preservados. Os pixels são — é esse o sentido de sem perdas aqui — mas os metadados ao redor deles não. [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) lê e edita metadados JPEG, PNG e WebP sem recodificar suas imagens. Para AVIF, mostra o EXIF disponível como somente leitura e limpa convertendo a primeira imagem decodificada para um PNG novo; as cores ou o HDR podem mudar.
- **O que o Google carrega e o que não recebe.** Os scripts de anúncios e medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum recebe informações sobre suas imagens. Todo o código que lê, decodifica ou grava um arquivo é servido por este site e está no repositório.
- **Funciona offline.** Carregue a página uma vez e desconecte a rede: a ferramenta continua igual. Essa é a prova mais simples: um conversor que enviasse suas imagens para processamento não conseguiria fazer isso.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/shared/image-convert.js` para a conversão — especialmente `encodeWebp`, que grava o arquivo e lê os próprios blocos RIFF para verificar se o navegador realmente usou a codificação sem perdas solicitada.
