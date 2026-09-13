# Hash e checksum — MD5, SHA-1, SHA-256, SHA-512

Confira um download contra o número que quem publicou divulgou, sem mandar o arquivo para ninguém.

> Calcule o MD5, SHA-1, SHA-256, SHA-384 ou SHA-512 de qualquer arquivo e compare com o checksum divulgado na página de download. O arquivo é lido no navegador e nunca é enviado, de qualquer tamanho.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/verificar-checksum/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem arquivos. Não existe servidor.

Um checksum é aritmética sobre os bytes do seu arquivo, e essa conta é feita aqui, nesta página, no processador do seu computador. O arquivo é lido do disco em pedaços de quatro megabytes e cada pedaço é descartado assim que entra na conta, então em lugar nenhum se monta uma cópia inteira: nem na memória, muito menos em um servidor. Do outro lado desta página não existe servidor nenhum para receber um arquivo, mesmo que algo aqui quisesse enviar.

- ✗ Sem envio
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu computador

## Como conferir um download com o checksum dele

1. **Escolha o arquivo.** Arraste até a caixa ou selecione na mão. Ele é lido em pedaços direto do seu disco; enquanto isso nada sai para lugar nenhum, e não existe um tamanho a partir do qual a página desista.
2. **Deixe ler.** MD5 e SHA-256 são calculados por padrão, em uma passada só. A barra mostra em que ponto está e a que velocidade. Uma imagem de disco grande leva mais ou menos o tempo que levaria para ser copiada, porque é a mesma quantidade de leitura.
3. **Cole o que deveria dar.** O que a página de download te deu, na forma que for: hexadecimal puro, uma linha de saída do `sha256sum`, um arquivo `SHA256SUMS` inteiro, ou o atributo `integrity` tirado de uma tag de script. Qual algoritmo é sai do comprimento, e a caixinha certa se marca sozinha.
4. **Leia a resposta, não a cor.** A página diz em uma frase se este é o arquivo que aquele checksum descreve. Se bate, os bytes são idênticos aos que quem publicou mediu. Se não bate, não são, e vale baixar de novo antes de abrir.
5. **Leve os checksums se precisar.** Copie um, copie todos, ou salve num arquivo de texto pequeno, no formato com o algoritmo na frente que as ferramentas de linha de comando escrevem. Assim o nome do algoritmo viaja junto com o número.

## A versão longa

[Como conferir um download com o checksum dele](https://abox.tools/pt/guias/verificar-o-checksum-de-um-download/): Como comparar um checksum MD5 ou SHA-256 no Windows, no macOS e no Linux ou no navegador, o que uma coincidência realmente prova, e o erro que deixa a operação inteira sem sentido.

## Também na caixa

- [Gerador de senha e frase secreta](https://abox.tools/pt/gerador-de-senha/): Gerada aqui, pelo seu próprio navegador, e não enviada para lugar nenhum. Nada é guardado e não existe histórico.
- [Formatador de JSON](https://abox.tools/pt/formatar-json/): JSON, XML, HTML, CSS e YAML, formatados ou convertidos. Nada é colado no servidor de ninguém.
- [Conversor de YAML para JSON](https://abox.tools/pt/converter-yaml-para-json/): Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.
- [Formatador de XML](https://abox.tools/pt/formatar-xml/): XML organizado para ler ou espremido para publicar, e convertido em JSON nos dois sentidos. Nada disso é colado no servidor de outra pessoa.

## Perguntas

### Meu arquivo é enviado para algum lugar?

Não. Seu próprio navegador lê o arquivo do seu disco e o seu próprio processador faz a conta, em pedaços de quatro megabytes. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista cada endereço que ela pode contatar: nenhum é nosso. Desconecte da rede e continua funcionando.

### Existe limite de tamanho?

Não. O arquivo nunca fica inteiro em lugar nenhum: é lido em pedaços e cada pedaço é contado e descartado, então uma imagem de disco de quarenta gigabytes usa os mesmos poucos megabytes de memória que um arquivo de texto. O que custa é tempo, e a página vai dizendo quanto. \
\
É por isso que os algoritmos estão escritos aqui em vez de serem passados ao `crypto.subtle.digest` do navegador, que seria mais rápido. Essa chamada recebe a mensagem inteira em um único buffer e não há como entregar um arquivo em pedaços para ela, então usá-la teria deixado o maior arquivo conferível à mercê de quanta memória esta aba consegue pegar. Num celular são algumas centenas de megabytes, e o que as pessoas mais querem conferir são imagens de disco.

### O checksum bateu. O que exatamente ficou provado?

Que os bytes no seu disco são os que alguém tinha na frente quando anotou aquele número. Nada além disso, e vale ser preciso sobre os limites. \
\
Ficou provado que o download não foi cortado, não foi estragado por um disco com defeito e não foi trocado no caminho. **Não** ficou provado que o arquivo é inofensivo, porque quem publica consegue medir um malware com a mesma exatidão que qualquer outra coisa. E fica provado muito pouco se o checksum veio da mesma página, pela mesma conexão, que o arquivo: quem conseguiu trocar um conseguiu trocar o outro. Um checksum vale mais quando chega até você por outro caminho: um arquivo `SHA256SUMS` assinado, o anúncio de lançamento de uma distribuição, um segundo espelho, ou um gerenciador de pacotes que já o conhece.

### Não bateu. E agora?

Baixe de novo primeiro, do mesmo lugar. Uma transferência interrompida ou retomada é de longe a causa mais comum, e a segunda cópia costuma resolver. \
\
Se a segunda cópia der a mesma resposta errada, confira se você está comparando com a linha certa: páginas de lançamento listam vários arquivos, e o checksum da versão ARM nunca vai bater com o da x86. Depois confira a versão. Se tudo isso estiver certo e ainda assim não bater, não abra o arquivo. Pegue de outro espelho e compare os dois checksums entre si.

### Qual eu devo usar?

O que quem publicou divulgou. A ideia é comparar com o número deles, e esse você não escolhe. \
\
Se você está gerando um checksum em vez de conferir um, use SHA-256. MD5 e SHA-1 estão quebrados no sentido que importa: dá para construir de propósito dois arquivos diferentes com o mesmo valor, em horas no MD5 e por um custo moderado no SHA-1. Isso não os torna inúteis contra acidentes, já que um download cortado não vai coincidir por acaso com o original, mas significa que nenhum dos dois pode mais dizer que ninguém mexeu. SHA-384 e SHA-512 estão de bom tamanho e na prática não são melhores; estão aqui porque alguns projetos os divulgam.

### Por que o MD5 está aqui se ele está quebrado?

Porque ainda é o que está impresso. Espelhos, downloads de firmware, páginas de software de universidades e uma porção de sites de fabricantes publicaram um MD5 vinte anos atrás e não mexeram mais na página. Uma ferramenta que se recusasse a calcular um estaria se recusando a responder a pergunta com a qual as pessoas realmente chegam. \
\
O que ela pode fazer, em vez disso, é dizer quanto a resposta vale, e é o que faz a observação ao lado da caixinha. Um MD5 que bate continua descartando um download estragado. Não descarta um download adulterado.

### Que formatos posso colar na caixa de comparação?

Todos os usuais, e a página descobre sozinha qual é. \
\
Hexadecimal puro, com ou sem espaços. Uma linha de saída do `md5sum` ou do `sha256sum`, com o nome do arquivo depois. Um arquivo `SHA256SUMS` inteiro com quarenta linhas; nesse caso vale a linha que nomeia o seu arquivo. A forma BSD, `SHA256 (disk.iso) = …`. Um rótulo na frente, como em `SHA-256: …`. E um atributo de subresource integrity, `sha384-…`, que vem em base64 em vez de hexadecimal e é decodificado antes da comparação. \
\
Qual algoritmo é sai do comprimento: 32 caracteres hexadecimais são um MD5, 40 um SHA-1, 64 um SHA-256, 96 um SHA-384 e 128 um SHA-512. Não existem dois do mesmo tamanho, então não há o que escolher nem o que errar.

### Vai dar o mesmo que o sha256sum ou o certutil?

Vai, byte por byte. São especificações exatas com vetores de teste publicados, e cada algoritmo daqui é conferido a cada build contra esses vetores e contra a implementação do sistema operacional. \
\
A única diferença que você vai ver é a apresentação. O `certutil -hashfile` do Windows escreve em maiúsculas e com espaços; esta página escreve em minúsculas, que é o que quase todo mundo usa. A comparação ignora as duas coisas, então um checksum copiado do certutil bate com um em minúsculas colado aqui.

### Dá para comparar dois arquivos entre si?

Dá, com um passo a mais: confira o primeiro, copie o checksum dele, depois escolha o segundo e cole esse checksum na caixa. Se os dois arquivos forem idênticos, a página vai dizer. \
\
Vale saber disso para o caso em que checksums são discretamente imbatíveis: decidir se a cópia no HD de backup é mesmo o arquivo do notebook, quando os dois dizem ter o mesmo tamanho e a mesma data.

### Isso altera o meu arquivo?

Não. Esta ferramenta só lê. Não existe arquivo de saída, nem recodificação, nem nada que seja gravado de volta: a única coisa que dá para baixar é um arquivo de texto pequeno com os checksums. O seu original continua intacto no disco, que é também a resposta honesta para o que acontece se você fechar a aba.

### É de graça? Preciso de conta?

É de graça, e não tem conta, nem cadastro, nem período de teste. Não há limite de tamanho de arquivo nem limite de quantos você confere. O site tem publicidade, que é o que paga a conta; a publicidade não recebe nada sobre o seu arquivo.

### Funciona offline?

Funciona. Carregue a página uma vez, desconecte da internet e ela continua funcionando. É também a forma mais simples de provar que nada é enviado: uma ferramenta que mandasse o seu arquivo para fora para ser calculado pararia no instante em que você tirasse o cabo.

## Como dá para conferir a promessa de privacidade

- **Seu arquivo não tem para onde ir.** Na Content-Security-Policy está cada endereço que esta página pode contatar, e nenhum é nosso. Aqui não existe um ponto de coleta onde o seu arquivo possa parar, e não há nada no código que o mandaria para lá se existisse. Antes isto dizia `connect-src 'none'`, o que era absoluto; a publicidade custou isso, e dizer isso faz parte do acordo.
- **O arquivo nunca fica inteiro em lugar nenhum, de qualquer tamanho.** Ele é lido em pedaços de quatro megabytes, e cada pedaço entra no estado em andamento e é descartado. A memória que esta página usa é a mesma para uma imagem de disco de quarenta gigabytes e para um arquivo de texto, e não existe um tamanho a partir do qual ela desista. É também por isso que o `crypto.subtle.digest` do navegador não é usado: essa função quer o arquivo inteiro na memória de uma vez, que é exatamente o teto que esta ferramenta existe para não ter.
- **Cinco algoritmos, cinco arquivos neste repositório.** Em `src/md5.js`, `src/sha1.js`, `src/sha256.js` e `src/sha512.js` estão as especificações publicadas escritas por extenso, umas sessenta linhas cada uma, com as tabelas de constantes escritas em vez de calculadas para que nada do resultado dependa do seu navegador. Cada uma é conferida a cada build contra os vetores de teste oficiais e contra a implementação do próprio sistema operacional.
- **O checksum que você cola também não vai a lugar nenhum.** Ele é comparado aqui, na página, com o valor calculado aqui. Ninguém fica sabendo dessa comparação: nem o valor, nem se bateu, nem o nome do arquivo. Isso pesa mais do que parece, porque um checksum junto de um nome de arquivo conta para quem recolher exatamente qual versão de qual programa você acabou de baixar.
- **O que o Google carrega e o que ele não recebe.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe nada sobre o seu arquivo: nem o arquivo, nem o nome, nem o tamanho, nem qualquer um dos valores calculados. Cada linha que lê ou processa um byte é servida deste domínio e está no repositório.
- **O que o botão de doação carrega e o que ele não recebe.** O botão “Buy me a coffee” no topo é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. É um link e nada além disso: não avisa da visita e não recebe nada sobre você nem sobre seus arquivos. Nada acontece enquanto você não clicar, e o que você abriria é o site de outra pessoa.
- **Funciona offline.** Desconecte da rede e todas as partes desta página continuam funcionando. É a prova mais simples de todas: uma ferramenta que mandasse o seu arquivo para fora para ser calculado pararia no instante em que você tirasse o cabo.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js` e `src/sha512.js` para as quatro funções de compressão, `src/blocks.js` para o preenchimento que elas compartilham e `src/hash.js` para o laço que lê o arquivo em pedaços. Em nenhum deles existe uma linha capaz de alcançar a rede.
