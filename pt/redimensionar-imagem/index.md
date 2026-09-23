# Redimensionar imagem — cortar e converter também

Diga o tamanho. Desenhe a caixa. Escolha o formato.

> Redimensione, corte e converta imagens JPEG, PNG e WebP no seu navegador. Em pixels exatos, em porcentagem ou pelo lado maior, para uma imagem ou uma pasta inteira. Não se envia nada.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/redimensionar-imagem/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

O redimensionamento, o corte e a troca de formato rodam todos no seu próprio navegador, no seu próprio hardware, com os codificadores de imagem que ele já traz de fábrica. Esta ferramenta não tem função de rede de espécie alguma: não há o que buscar nem o que mandar. E do outro lado desta página não existe servidor nenhum para onde mandar uma imagem, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como redimensionar uma imagem sem enviá-la

1. **Escolha suas imagens.** Arraste até o seletor, ou escolha na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Corte, se quiser.** A caixa começa na imagem inteira, então deixá-la em paz não corta nada. Arraste, ou trave numa proporção (1:1 para foto de perfil, 9:16 para um story, 16:9 para uma miniatura) e clique em “Maior” para a maior caixa que couber. Cada imagem guarda a caixa dela: clique em qualquer linha da lista para desenhar naquela. Se todas tiverem que ficar com o mesmo enquadramento, um botão faz isso também.
3. **Diga de que tamanho ela deve sair.** Uma largura, uma altura ou as duas; um lado maior, que deixa as fotos em pé e as deitadas do mesmo tamanho entre si; ou uma porcentagem simples. Deixe uma das duas caixas em branco e a imagem mantém o próprio formato.
4. **Escolha o formato e clique no botão.** Mantenha o formato em que cada arquivo chegou, ou escreva tudo como JPEG, PNG ou WebP. Cada resultado diz no que virou e quanto diminuiu. Clique num deles para abrir em tamanho cheio com todos os números por trás, e o original ao lado para comparar. Um lote inteiro baixa num zip só.

## A versão longa

[Como redimensionar uma imagem sem estragá-la](https://abox.tools/pt/guias/redimensionar-uma-imagem/): O que acontece com uma foto quando você muda as dimensões em pixels: por que diminuir é seguro e aumentar não é, o que fazer quando a caixa tem outro formato, e quando é melhor cortar.

## Também na caixa

- [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.
- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha o país. Ele aplica a regra daquele país, exatamente.
- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.
- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. Quem decodifica, corta, escala e escreve o arquivo é o seu próprio navegador, no seu próprio hardware, com os codificadores de JPEG, PNG e WebP que ele já traz. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

### O que acontece se eu der uma largura e não uma altura?

A altura sai do formato da própria imagem, que é quase sempre o que se queria: “1920 de largura” quer dizer “1920 de largura e a altura que isso der”. Preencha as duas e elas podem discordar do formato da imagem. É a única hora em que aparece a escolha de “se os formatos discordarem”: caber dentro da caixa, preencher e cortar o que sobra, completar com um fundo, ou esticar e aceitar a deformação.

### Redimensionar uma imagem perde qualidade?

Diminuir uma imagem não perde, de nenhum jeito que você consiga ver, porque entram mais pixels do que saem e o detalhe que fica é detalhe de verdade. Aumentar é outra história: não dá para acrescentar o que nunca foi fotografado, e o resultado é uma cópia mais macia da mesma imagem, não uma mais nítida. Por isso “nunca deixar uma imagem maior do que ela começou” já vem ligado. O que custa um pouco é a recodificação depois, se o formato for JPEG ou WebP, e é no controle de qualidade que você paga essa conta.

### Posso cortar cada imagem de um jeito diferente?

Pode, e esse é até o padrão. Toda imagem da lista carrega a caixa dela, nos pixels dela, e clicar numa linha põe aquela imagem na pré-visualização com a caixa dela e a proporção travada dela de volta. Nada do que você faz numa afeta outra. Toda caixa também começa na imagem inteira, então uma imagem em que você nunca desenhou não é cortada.

### Ele consegue cortar um lote inteiro do mesmo jeito de uma vez?

Consegue, com o botão embaixo da pré-visualização. Ele dá a cada uma das outras imagens a mesma área relativa, ou seja, as mesmas frações da largura e da altura dela. Num conjunto de capturas de tela ou exportações todas do mesmo tamanho, isso é exatamente a mesma caixa, e a página avisa quando é o caso. Com uma proporção travada, ele dá a cada uma a maior caixa daquela proporção dentro daquela área, então clicar em 1:1 e depois naquele botão rende quadrados a partir de uma pasta com fotos em pé e deitadas misturadas. Toda caixa continua editável depois.

### Quais formatos ele consegue ler e escrever?

Ele lê tudo o que o seu navegador conseguir decodificar, o que na prática significa JPEG, PNG, WebP, GIF, BMP e, na maioria dos navegadores atuais, AVIF. Ele escreve JPEG, PNG e WebP, porque são esses os codificadores que os navegadores trazem. Em “manter o formato”, um JPEG continua JPEG e um PNG continua PNG. Qualquer coisa que o navegador não saiba escrever, como um GIF ou um BMP, sai como PNG, que é o formato que mantém intactas a transparência e a cor chapada.

### O que acontece com a transparência quando eu salvo como JPEG?

Ela é preenchida com a cor de fundo, porque o JPEG não tem canal alfa onde guardá-la. A cor é você quem escolhe, e ela começa em branco, que é o que a maioria das pessoas quer e o que quase toda outra ferramenta faz sem avisar ninguém. A mesma cor vai atrás de um quadro completado com margem. Salve como PNG ou WebP e a transparência passa intocada.

### Ele remove os dados EXIF e de GPS?

De qualquer coisa que ele de fato processe, sim, como efeito colateral: cortar ou redimensionar significa decodificar a imagem em pixels e codificar esses pixels de novo, e um canvas cheio de pixels não carrega etiqueta nenhuma, então a localização, o modelo da câmera e os horários simplesmente não são escritos no arquivo novo. Um arquivo que você não está alterando é outro caso, porque ele volta byte por byte, com etiquetas e tudo. Se você quer os metadados fora mas a imagem intocada, use o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/), que reescreve o contêiner sem recomprimir nada.

### Qual a diferença entre isto e o compressor de imagens?

Este aqui é sobre dimensões: você diz quantos pixels quer e ele entrega isso. O [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) é sobre tamanho de arquivo: você diz quantos kilobytes pode usar e ele procura a maior qualidade que cabe, redimensionando só se a qualidade sozinha não chegar lá. Se mandaram você entregar “1200 pixels de largura”, você está no lugar certo. Se mandaram “abaixo de 500 KB”, o outro chega mais perto.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. Também não tem limite para o número nem para o tamanho dos arquivos, porque não existe servidor pagando por eles: o trabalho acontece no seu próprio computador. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para serem redimensionadas pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. O redimensionamento é um `drawImage` num canvas e um `canvas.toBlob`, ou seja, o escalador e o codificador que já vêm instalados no seu navegador.
- **Um arquivo que ninguém pediu para mudar não é mudado.** Sem corte, sem redimensionamento e sem troca de formato, o arquivo que você escolheu volta para você byte por byte, em vez de ser salvo de novo. E isso não é só delicadeza. É por isso que esta ferramenta não consegue recodificar uma imagem em silêncio, nem jogar fora em silêncio os metadados de uma que você só queria olhar.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre as suas imagens. Toda linha que lê, corta, escala ou escreve um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/geometry.js` para a aritmética que decide o que fica e de que tamanho sai, e `src/codecs.js` para a única chamada de `drawImage` que faz o corte e o redimensionamento de uma vez só.
