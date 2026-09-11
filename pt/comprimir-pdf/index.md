# Comprimir PDF — deixar um PDF menor

Encolha um documento sem mandá-lo para lugar nenhum.

> Deixe um PDF menor sem enviá-lo. Quem lê, recomprime e reescreve o arquivo é o seu próprio navegador, e a ferramenta mostra onde o tamanho dele realmente está antes de mexer em qualquer coisa.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/comprimir-pdf/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem documentos. Não existe servidor.

O documento é aberto, desmontado e escrito de volta na memória deste computador, por código servido deste endereço. Nada aqui consegue fazer um envio, e do outro lado desta página não existe servidor nenhum para receber.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu computador

## Como deixar um PDF menor

1. **Escolha um PDF.** Arraste até o seletor, ou escolha na mão. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Veja onde está o tamanho.** O detalhamento é a razão de ser do segundo passo. Se a barra for quase toda de imagens, esta ferramenta tem com o que trabalhar. Se for quase toda de fontes e conteúdo de página, ela vai dizer isso, e a economia honesta é de alguns por cento. Melhor saber antes de gastar um minuto nisso.
3. **Diga com que força apertar.** Os ajustes com nome são resoluções, e não notas vagas: 96 DPI para ler na tela, 130 para mandar por e-mail, 220 para algo que ainda precisa ser impresso. Cada um é medido contra o tamanho em que a imagem é de fato desenhada na página, então uma foto colocada como miniatura não é tratada como uma digitalização de página inteira.
4. **Comprima, e leia a linha que diz que foi conferido.** Quando a reescrita termina, o arquivo pronto é aberto de novo pelo mesmo leitor desta página e as páginas dele são contadas. Se aquilo discordar do original, a compressão é dada como falha e nenhum download é oferecido.

## A versão longa

[Como deixar um PDF menor, e por que alguns não encolhem](https://abox.tools/pt/guias/deixar-um-pdf-menor/): Onde o tamanho de um PDF realmente está, por que uma digitalização comprime 80% e um contrato quase não se mexe, o que DPI significa aqui, e o que um compressor jamais deveria fazer com o seu documento.

## Também na caixa

- [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/): As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.
- [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/): Coloque suas imagens num documento só.
- [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/): Fotografe a página. Você recebe de volta algo com cara de digitalização.
- [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.

## Perguntas

### Meu PDF é enviado para algum lugar?

Não. Quem lê, recomprime e escreve o arquivo é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. Esta ferramenta também não tem nenhuma função de rede opcional.

### Quanto menor o meu PDF vai ficar?

Depende inteiramente do que tem dentro dele, e é por isso que a ferramenta mede e mostra para você antes de comprimir qualquer coisa. Um documento digitalizado é quase todo fotografia e costuma sair de 60% a 90% menor. Já um contrato ou uma tese são texto, desenho vetorial e fontes embutidas, tudo isso já comprimido pelo que quer que os tenha produzido; ali a economia costuma ser de alguns por cento, vinda do reempacotamento do arquivo e do descarte do que não é mais referenciado. Qualquer ferramenta que promete uma porcentagem fixa sem olhar o seu arquivo está chutando.

### Comprimir um PDF perde qualidade?

As imagens de dentro dele são recodificadas, então sim, para elas. Nada mais é tocado: o texto continua texto, selecionável e pesquisável, as fontes ficam inteiras, e o desenho vetorial é copiado exatamente. A ferramenta também se recusa a piorar uma imagem à toa, porque, se uma recodificação não sai menor que o original, os bytes originais voltam para o documento intocados.

### O que é DPI aqui, e por que ele pergunta?

Um PDF registra de que tamanho cada imagem é desenhada na página, então a ferramenta consegue calcular a resolução efetiva dela. Uma digitalização de 4000 pixels espalhada ao longo de vinte centímetros de papel está carregando 500 pixels por polegada. Nada numa tela e muito pouco no papel consegue usar isso, então os pixels acima do ajuste que você escolher são os primeiros a ser jogados fora: eles custam qualidade que ninguém consegue ver. É essa medição que faz uma logomarca colocada pequena não ser tratada como uma digitalização de página inteira.

### Ele consegue abrir um PDF protegido por senha?

Não, e isso é de propósito. Um documento criptografado é recusado com uma mensagem dizendo isso, mesmo quando a senha é vazia, que é como muitos scanners e copiadoras salvam. Tirar a proteção de um arquivo é um trabalho diferente de comprimi-lo, e uma ferramenta que fizesse isso em silêncio estaria fazendo algo que você não pediu.

### Existem PDFs que ele não consegue comprimir?

Algumas imagens de dentro deles, sim. Imagens JPEG 2000, JBIG2 e codificadas em fax (CCITT) não têm decodificador em navegador nenhum, então passam intocadas e a página avisa que passaram. As duas últimas, aliás, são codecs de dois níveis e em geral já estão perto do menor tamanho possível. Imagens CMYK também ficam em paz, porque recodificá-las corre o risco de deslocar as cores que uma impressora produziria. Tudo o que a ferramenta pula aparece nos resultados com o motivo do lado.

### O arquivo comprimido vai continuar abrindo em todo lugar?

Vai. A saída é escrita como PDF 1.5, que todo leitor lançado desde 2003 entende, e a ferramenta prova isso no seu próprio computador: ela abre o arquivo pronto de novo e conta as páginas antes de oferecer o download. Formulários, links, marcadores, a estrutura de acessibilidade e quaisquer anexos embutidos são levados adiante. O que fica para trás é o material a que nada no documento se referia mais.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de tamanho de arquivo além do que a memória do seu próprio computador permitir. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre o seu documento.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse o seu documento embora para ser comprimido pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Seu documento não tem para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Esta ferramenta não acrescenta nada àquela lista, porque não tem função de rede própria, nem sequer uma opcional. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o mandaria mesmo que existisse.
- **O formato inteiro está neste repositório.** Um PDF é uma lista de objetos e uma tabela dizendo onde cada um começa. O `src/objects.js` lê essa sintaxe, o `src/reader.js` segue a tabela, o `src/writer.js` escreve uma nova, e nenhum dos três importa nada que consiga fazer uma requisição. Nenhuma biblioteca é buscada e nada é renderizado num servidor.
- **Arquivos criptografados são recusados em vez de abertos.** Um PDF com senha é recusado, inclusive daquele tipo que os scanners produzem com senha vazia e que tecnicamente até abriria. Tirar a proteção de um documento é um trabalho diferente de deixá-lo menor, e fazer isso em silêncio, em nome de outra pessoa, seria uma surpresa desagradável.
- **Ela tira coisas em vez de pôr.** O arquivo pronto não carrega data de criação, nem linha de produtor, nem nome da ferramenta que o fez. Com a caixinha marcada, ele também perde o pacote XMP e os blocos privados que os programas de diagramação deixam para trás. É o mesmo argumento da ferramenta de EXIF, aplicado a outro contêiner.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu documento: nem um arquivo, nem uma página, nem um nome, um tamanho ou uma contagem de páginas. Toda linha que lê, decodifica ou escreve um PDF é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre o seu documento. Nada acontece a menos que você clique, e o lugar para onde ele leva é o site de outra empresa.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas, porque uma ferramenta que mandasse o seu documento embora para ser comprimido pararia na hora.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, e `src/reader.js` e `src/writer.js` para a leitura e a reescrita inteiras, sendo que nenhum dos dois consegue alcançar a rede.
