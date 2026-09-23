# Comprimir imagem — para um tamanho exato

Diga o tamanho. Ele resolve o resto.

> Comprima um JPEG, PNG ou WebP para um tamanho exato: 100 KB, 2 MB, o que for. Roda inteiro no navegador, não envia nada, não pede conta e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/comprimir-imagem/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

A compressão roda no seu próprio navegador, no seu próprio hardware, com os codificadores que ele já traz de fábrica. Esta ferramenta não tem função de rede de espécie alguma: não há o que buscar nem o que mandar. E do outro lado desta página não existe servidor nenhum para onde mandar uma imagem, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como comprimir uma imagem para um tamanho específico

1. **Escolha suas imagens.** Arraste até o seletor, ou escolha na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Digite o tamanho que mandaram você cumprir.** 100 KB para o formulário que insiste em recusar a sua foto, 500 KB para o sistema de inscrição, 2 MB para uma página que precisa carregar rápido. Os quatro mais comuns já estão como botões.
3. **Clique em “Comprimir até o alvo”.** Cada imagem é codificada várias vezes enquanto a ferramenta vai fechando o cerco na maior qualidade que cabe. Qualquer coisa que já esteja abaixo do alvo fica exatamente como está.
4. **Veja o que custou e baixe.** Cada resultado diz em que formato foi escrito, com qual qualidade, se as dimensões mudaram e o quanto ele bate com o original quando medido. O “Comparar” põe as duas imagens lado a lado.

## A versão longa

[Como comprimir uma imagem para um tamanho de arquivo exato](https://abox.tools/pt/guias/comprimir-uma-imagem-para-um-tamanho-exato/): O formulário quer 500 KB e sua foto tem 4 MB. O que um limite de tamanho custa de verdade, qual ajuste mexer primeiro, e por que um PNG não encolhe como um JPEG.

## Também na caixa

- [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.
- [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.
- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha o país. Ele aplica a regra daquele país, exatamente.
- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. Quem decodifica, comprime e mede o arquivo é o seu próprio navegador, no seu próprio hardware, com os codificadores de JPEG, PNG e WebP que ele já traz. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

### Como ele acerta um tamanho exato?

Tentando. Não existe fórmula que transforme um ajuste de qualidade numa contagem de bytes, porque isso depende inteiramente da imagem. Então a ferramenta codifica a imagem várias vezes até achar a resposta. Ela começa no topo da faixa de qualidade e vai cortando o intervalo pela metade, o que encontra a maior qualidade que cabe em umas oito codificações. Todo tamanho que você vê na página é um arquivo codificado de verdade, não uma estimativa.

### O que “perda mínima” quer dizer aqui, exatamente?

Três coisas específicas. A primeira: uma imagem que já está abaixo do seu alvo passa direto, byte por byte, em vez de ser recodificada. A segunda: a qualidade é gasta antes da resolução, e só até um piso em que os artefatos de compressão começam a aparecer. Passando desse ponto, a ferramenta diminui a imagem e devolve a qualidade para cima, porque menos pixels bons ficam melhores do que mais pixels arruinados. A terceira: assim que aparece um resultado que cabe, a busca volta a subir até o orçamento acabar, então você não recebe um arquivo de 300 KB tendo pedido 500 KB.

### O que são os números de SSIM e PSNR em cada resultado?

São uma medição do que a compressão custou, feita decodificando o resultado e comparando com a imagem original. O SSIM compara brilho, contraste e estrutura locais, o que chega bem mais perto daquilo que incomoda o olho do que simplesmente contar pixels alterados; acima de mais ou menos 0,98 os dois são difíceis de distinguir lado a lado. O PSNR é a tradicional medida em decibéis. Os dois são calculados no seu computador, e os dois aparecem para que a afirmação de perda baixa possa ser conferida em vez de só alegada.

### Quais formatos ele consegue ler e escrever?

Ele lê tudo o que o seu navegador conseguir decodificar, o que na prática significa JPEG, PNG, WebP, GIF, BMP e, na maioria dos navegadores atuais, AVIF. Ele escreve JPEG, PNG e WebP, porque são esses os codificadores que os navegadores trazem. No “automático” ele mantém o formato em que o seu arquivo chegou, e só troca para WebP quando manter teria significado um redimensionamento ou uma queda visível de qualidade.

### Por que ele não consegue comprimir muito um PNG?

Porque o PNG é sem perdas: não tem botão de qualidade para girar. O único jeito de deixar um PNG menor é dar a ele menos pixels ou menos cores, então, com PNG selecionado, a ferramenta chega a um alvo só redimensionando. Se a imagem é uma fotografia, JPEG ou WebP chegam muito mais perto do seu alvo num tamanho em que dá para ver que está tudo bem. E se for uma logomarca ou uma captura de tela com transparência, o WebP mantém a transparência que o JPEG preencheria com branco.

### Comprimir uma imagem remove os dados EXIF e de GPS dela?

Remove, como efeito colateral. Comprimir significa decodificar a imagem em pixels e codificar esses pixels de novo, e um canvas cheio de pixels não carrega etiqueta nenhuma, então a localização, o modelo da câmera, os horários e todo o resto simplesmente não são escritos no arquivo novo. Se você quer os metadados fora mas a imagem intocada, use o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/), que reescreve o contêiner sem recomprimir nada.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. Também não tem limite para o número nem para o tamanho dos arquivos, porque não existe servidor pagando por eles: o trabalho acontece no seu próprio computador. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para serem comprimidas pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. A compressão é um `canvas.toBlob`, ou seja, o codificador que já vem instalado no seu navegador.
- **Os números são medidos aqui, não informados a ninguém.** Os tamanhos, o número de qualidade e a comparação SSIM saem todos de contas feitas nesta página e aparecem para você. Não existe neste repositório nenhum evento de análise personalizado que carregue um nome de arquivo, um tamanho, uma contagem ou um resultado.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre as suas imagens. Toda linha que lê, comprime ou mede um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/compress.js` para a busca que decide quanta qualidade gastar, e `src/measure.js` para a comparação por trás do número de “semelhança visual”.
