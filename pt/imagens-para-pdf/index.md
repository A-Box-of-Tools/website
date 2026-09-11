# Imagens para PDF — conversor de JPG para PDF

Coloque suas imagens num documento só.

> Junte imagens JPG, PNG ou WebP num só PDF, de graça e inteiramente no seu navegador. As fotos entram sem serem recodificadas, e nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/imagens-para-pdf/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

O documento é escrito na memória deste computador, uma página por vez, por código servido deste endereço. Nada aqui consegue fazer um envio, e do outro lado desta página não existe servidor nenhum para receber.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu computador

## Como transformar imagens em um PDF

1. **Escolha suas imagens.** Arraste uma pasta até o seletor, ou escolha os arquivos na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Ponha as páginas em ordem e gire as que precisarem.** Uma imagem vira uma página, na ordem mostrada. Arraste um quadradinho pela alça para movê-lo, ou use as setas. Os botões de girar viram uma página um quarto de volta por vez, que é o que uma digitalização deitada normalmente pede.
3. **Escolha um tamanho de página.** O “Ajustar a página a cada imagem” faz cada página ser exatamente a imagem dela, sem nada cortado e sem faixas brancas. Os tamanhos com nome, de A4 a Ofício, colocam cada imagem numa página fixa, com margem se você quiser uma.
4. **Crie o PDF e baixe.** O documento é escrito no seu próprio computador, então o tempo que leva depende do seu hardware e não de uma fila. O arquivo pronto vai direto para os downloads do seu navegador.

## A versão longa

[Como juntar imagens em um único PDF](https://abox.tools/pt/guias/juntar-imagens-em-um-pdf/): Transforme fotos ou digitalizações num só PDF: tamanho de página, ordem e rotação, por que um JPEG não precisa perder qualidade na entrada, e o que um PDF conta para quem o recebe.

## Também na caixa

- [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/): Fotografe a página. Você recebe de volta algo com cara de digitalização.
- [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.
- [Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.
- [Editor de áudio](https://abox.tools/pt/editar-audio/): Toque de trás para a frente, mude a velocidade, levante uma gravação baixa. Tudo aqui, no seu computador.

## Perguntas

### Minhas imagens são enviadas para algum lugar?

Não. Quem lê as suas imagens e escreve o PDF é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. Ao contrário de algumas das outras ferramentas daqui, esta não tem nenhuma função de rede opcional.

### Converter para PDF perde qualidade?

No caso de um JPEG e no ajuste padrão, não. O PDF consegue carregar dados JPEG diretamente, então uma fotografia é copiada para dentro do documento byte por byte: ela nunca é decodificada e nunca é comprimida de novo, e a imagem no PDF é a imagem do arquivo. Outros formatos precisam ser recodificados, porque o PDF não tem filtro para eles. A saída é escolher o ajuste sem perdas, que guarda tudo exatamente ao custo de um arquivo maior.

### Quais formatos de imagem posso usar?

Qualquer imagem parada que o seu navegador consiga decodificar, o que na prática significa JPG, PNG, WebP, GIF, AVIF e, em dispositivos Apple, HEIC. Não existe aqui uma lista separada para manter atualizada, porque decodificar é trabalho do navegador, e não nosso.

### Posso escolher o tamanho da página e a ordem das páginas?

Pode. As páginas podem ser A4, Carta, Ofício, A3, A5, Tabloide, um tamanho que você digita, ou exatamente o tamanho de cada imagem. Arraste os quadradinhos para mudar a ordem, ordene por nome ou por data, gire qualquer um deles um quarto de volta, e defina uma margem em milímetros.

### Quantas imagens posso pôr num PDF?

A ferramenta não tem limite embutido. O teto prático é a memória do seu próprio computador, porque o documento pronto é montado ali antes de você baixar. Algumas centenas de fotos de celular em resolução cheia são a primeira coisa a sentir isso, e diminuir o lado maior, nos ajustes, empurra esse teto para bem longe.

### O PDF contém os nomes dos meus arquivos ou um horário?

Não, a menos que você peça. O bloco de informações do documento fica vazio, tirando o nome desta ferramenta: nenhum nome de arquivo, nenhum nome de máquina, nenhum nome de usuário, e nenhuma data de criação a não ser que você marque a caixa. Isso é de propósito, porque um PDF é uma coisa que as pessoas mandam para outras pessoas.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para virarem um documento pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Esta ferramenta não acrescenta nada àquela lista, porque não tem função de rede própria, nem sequer uma opcional. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **O PDF é escrito aqui.** Um PDF é uma lista de objetos e uma tabela dizendo onde cada um começa, e o `src/shared/pdf-page-writer.js` escreve as duas coisas. Nenhuma biblioteca é buscada, nada é renderizado num servidor, e o arquivo pronto vai da memória direto para um download.
- **Nada sobre você é contado ao documento.** A maioria das ferramentas carimba num PDF um horário e o nome do programa que o fez. Esta escreve um título, um autor e uma data só se você digitar. Os nomes de arquivo das suas imagens nunca aparecem no documento, e nada sobre o seu computador aparece.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre as suas imagens: nem um arquivo, nem uma miniatura, nem um nome, um tamanho ou uma contagem. Toda linha que lê, decodifica ou escreve uma imagem é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre as suas imagens. Nada acontece a menos que você clique, e o lugar para onde ele leva é o site de outra empresa.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas, porque uma ferramenta que mandasse as suas imagens embora para virarem um documento pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/shared/pdf-page-writer.js` e `src/document.js` para a escrita inteira do arquivo, que nunca encosta na rede.
