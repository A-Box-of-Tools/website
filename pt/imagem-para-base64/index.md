# Imagem para data URI — codificar uma imagem em base64 para CSS ou HTML

A imagem inteira como uma linha de texto. Cole direto no CSS ou no HTML.

> Transforme um PNG, JPEG, SVG ou WebP numa data URI que você cola no CSS ou no HTML. SVGs são codificados em porcentagem em vez de base64, então ficam legíveis e mais curtos. Roda no seu navegador e não envia nada.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/imagem-para-base64/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

A codificação roda no seu próprio navegador, no seu próprio hardware. É aritmética sobre bytes que a página já tem: sem codificador, sem servidor e sem etapa de rede para deixar de fora. Esta ferramenta não tem função de rede de espécie alguma, não há o que buscar nem o que mandar, e do outro lado desta página não existe servidor nenhum para onde mandar uma imagem, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem recodificação
- ✓ Funciona offline
- ✓ Código aberto

## Como transformar uma imagem em uma data URI

1. **Escolha suas imagens.** Arraste até o seletor, ou escolha na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Diga para onde o resultado vai.** A URI sozinha, uma regra de CSS, uma propriedade personalizada, uma tag `<img>` ou Markdown. Todas elas põem a URI entre aspas, que é o detalhe que decide se um SVG embutido funciona ou deixa de funcionar em silêncio.
3. **Leia o que custou.** Cada resultado diz em quantos caracteres ele virou, quanto isso é maior que o arquivo, e se embutir algo desse tamanho é boa ideia. O base64 acrescenta um terço, e se esse terço vale uma requisição poupada depende inteiramente do tamanho, então a página diz de que lado da linha você está.
4. **Confira os avisos.** Se a imagem carrega EXIF, um perfil de cor ou XMP, isso é nomeado junto com quantos bytes do seu resultado são aquilo. Se a extensão discorda do formato real, a página usa o formato e avisa você. E se o seu navegador não conseguir desenhar o resultado, ela também diz.
5. **Copie, ou baixe.** Um botão por resultado, e um para todos de uma vez. As propriedades personalizadas saem embrulhadas num bloco `:root`, prontas para colar no alto de uma folha de estilo.

## A versão longa

[Quando colocar uma imagem dentro do seu CSS, e quando não](https://abox.tools/pt/guias/colocar-uma-imagem-no-css/): O que uma data URI custa, por que o base64 acrescenta um terço e o gzip não devolve, por que um SVG nunca deveria ir em base64, e o erro de aspas que quebra SVGs embutidos em silêncio.

## Também na caixa

- [SVG para imagem](https://abox.tools/pt/svg-para-png/): Diga o tamanho. Um vetor não tem tamanho próprio a perder.
- [Imagem para SVG](https://abox.tools/pt/imagem-para-svg/): Uma forma, um contorno. Aponte para o que não deveria estar ali.
- [Comparador de alturas](https://abox.tools/pt/comparar-alturas/): Digite as alturas, leve a imagem. Nada é enviado para desenhá-la.
- [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.

## Perguntas

### Minha imagem é enviada para algum lugar?

Não. Quem lê e codifica o arquivo é o seu próprio navegador, no seu próprio hardware, com duas funções que ele já tem. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

### O que é uma data URI?

Um jeito de escrever um arquivo inteiro onde normalmente iria um endereço da web. Em vez de `url("logo.png")`, que manda o navegador ir buscar alguma coisa, você escreve `url("data:image/png;base64,iVBORw0...")`, que contém a própria imagem. O navegador decodifica ali mesmo. O efeito prático é uma requisição a menos: a imagem chega junto com a folha de estilo ou com a página, em vez de chegar depois.

### Por que o meu SVG não está em base64?

Porque base64 é a codificação errada para ele. Um SVG é texto, e uma URL já carrega texto, então só um punhado de caracteres precisa ser escapado. Codificar esses em porcentagem e deixar o resto em paz produz uma URI que costuma ser uns 20% mais curta que o base64 do mesmo arquivo, e que você ainda consegue ler na sua folha de estilo: os nomes dos elementos, as cores e o `viewBox` continuam todos lá para editar. Existe uma caixinha para forçar base64, para a rara cadeia de ferramentas que insiste nisso.

### Quanto o base64 deixa a minha imagem maior?

Cerca de um terço. Três bytes de arquivo viram quatro caracteres de base64, o que dá 33% antes do `data:image/png;base64,` na frente. Esse é o piso, e é inevitável, porque é o que custa escrever bytes arbitrários usando só os caracteres que uma URL permite. É também por isso que a página mostra a contagem de caracteres ao lado do tamanho do arquivo, em vez de deixar você descobrir quando a folha de estilo já estiver no ar.

### Quando embutir uma imagem é realmente boa ideia?

Quando ela é pequena e é necessária de imediato. Um ícone de 2 KB numa folha de estilo que toda página carrega é vitória clara: uma ida e volta a menos, e a imagem já está lá no momento em que o CSS está. Passando de uns 10 KB a troca vira. Uma imagem embutida deixa de ser um arquivo separado, então não pode ser guardada em cache sozinha, não pode ser buscada em paralelo com outra coisa, e é baixada de novo por inteiro toda vez que o arquivo em volta dela muda. Uma fotografia de 200 KB numa folha de estilo são 200 KB acrescentados ao caminho crítico de toda página do site. A página avisa de que lado dessa linha cada resultado cai.

### O gzip desfaz o custo do base64?

Menos do que as pessoas esperam. O base64 de um arquivo já comprimido, que é o que um PNG, um JPEG e um WebP são, comprime mal, porque quase não sobrou redundância para o compressor achar. Você normalmente recupera algo como um décimo daquele terço que o base64 acrescentou, e não o terço inteiro. Um SVG codificado em porcentagem é o caso oposto: ele continua sendo texto, então comprime mais ou menos tão bem quanto antes, o que é mais um motivo para não pôr um em base64.

### Isto muda a minha imagem em alguma coisa?

Não, e essa é uma diferença de propósito em relação à maioria das ferramentas daqui. Nada é decodificado em pixels e codificado de novo: os bytes que saíram do seu disco são os bytes que entram na URI. Um JPEG continua exatamente o JPEG que era, na mesma qualidade, com as mesmas dimensões. É por isso que o resultado pode ser descrito como o mesmo arquivo, e não como uma cópia dele.

### Então os meus dados EXIF e de GPS vão para dentro da folha de estilo também?

Vão, e essa é a parte que vale pensar antes de colar. Como nada é recodificado, tudo o que a câmera escreveu viaja junto com a imagem: a localização, o horário, o número de série da câmera. Numa foto de celular isso pode ser 30 KB do arquivo, que viram 40 KB de base64 no caminho crítico da sua página, e um endereço residencial dentro de algo que vai para um repositório. A página lê quanto metadado existe num JPEG, PNG ou WebP e diz isso. Para tirar antes, use o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/).

### Por que ele usou um tipo diferente da extensão do meu arquivo?

Porque a extensão pode estar errada e os bytes não podem. Um arquivo chamado `logo.png` que na verdade foi exportado como JPEG é comum o bastante para toda ferramenta de imagem ter que lidar com isso, e uma data URI que declara o tipo errado simplesmente não é desenhada, sem recuo e sem mensagem de erro que valha a leitura. Então o tipo é lido dos primeiros bytes do arquivo, que dizem o que ele é sem ambiguidade em todos os formatos daqui, e a página avisa você quando os dois discordam.

### A pré-visualização está em branco. O que deu errado?

Provavelmente nada na URI. HEIC e TIFF geram data URIs perfeitamente válidas que navegador nenhum, exceto o Safari, vai desenhar, então a imagem também vai faltar onde quer que você a cole. Converta para PNG, JPEG ou WebP antes, com o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) ou o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/). Se o formato for um comum, é provável que o arquivo em si esteja danificado: a pré-visualização é desenhada a partir da URI que esta página montou, então uma em branco significa que a imagem não decodificou.

### Existe limite de tamanho para uma data URI?

Nenhum que você vá encontrar em CSS ou numa tag `<img>`, porque os navegadores modernos não impõem teto prático ali. O que eles limitam é digitar uma data URI na barra de endereços, coisa que a maioria hoje recusa para qualquer coisa não trivial, por motivos de segurança que nada têm a ver com este uso. O limite real é o de cima: muito antes de algo técnico quebrar, a página em que ela está já ficou mais lenta do que ficaria com um arquivo de imagem comum.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. Também não tem limite para o número nem para o tamanho dos arquivos, porque não existe servidor pagando por eles: o trabalho acontece no seu próprio computador. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para serem codificadas pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Suas imagens não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. A codificação é `btoa` e `encodeURIComponent`, duas funções que o navegador tem desde o começo, e as duas pegam bytes e devolvem texto sem ir a lugar nenhum.
- **A pré-visualização é a prova.** A imagem ao lado de cada resultado é desenhada a partir da data URI que esta página acabou de montar, e não do seu arquivo. Ela aparece porque a URI está correta, no seu computador, sem servidor nenhum envolvido. E se não aparecer, a página avisa em vez de entregar algo quebrado.
- **O aviso de metadados está do seu lado.** Uma data URI copia o arquivo exatamente, então a posição de GPS de uma fotografia viaja junto para dentro da sua folha de estilo. Esta página lê quanto disso existe e conta para você, porque a alternativa é descobrir depois de já ter feito o commit.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre as suas imagens. Toda linha que lê ou codifica um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/encode.js` para as duas codificações e o raciocínio por trás de cada uma, `src/sniff.js` para como o tipo de mídia é lido do arquivo em vez do nome dele, e `src/metadata.js` para a verificação que diz quanto daquilo que você está prestes a colar não é a imagem.
