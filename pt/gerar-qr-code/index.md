# QR Code e barras — gerar um QR Code ou um código de barras, offline

Digite, e vira um código. Nada é enviado para fazer um.

> Gere um QR Code para um link, uma rede Wi-Fi ou um cartão de contato, ou um código de barras EAN-13, UPC-A, Code 128 ou Code 39. Baixe em SVG ou PNG. Tudo acontece no seu navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/gerar-qr-code/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem códigos e o texto dentro deles. Não existe servidor.

Um QR Code é aritmética sobre uma cadeia de texto. Não há arquivo para mandar e não há serviço a quem pedir. Cada etapa acontece em cerca de mil linhas de JavaScript nesta página, que você pode ler: escolher o modo, escolher a versão, a correção de erros Reed-Solomon, a máscara, as barras de um código de barras e o dígito verificador embaixo. Esta ferramenta não tem função de rede de espécie alguma, o que importa mais aqui do que na maioria das páginas, porque o que está sendo codificado é muitas vezes uma senha de Wi-Fi.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem validade
- ✓ Funciona offline
- ✓ Código aberto

## Como gerar um QR Code sem enviar nada

1. **Escolha o tipo de código.** Um QR Code guarda qualquer coisa e é o que a câmera de um celular procura, então é a resposta a menos que alguém tenha mandado outra coisa. Um código de barras guarda um número, e qual deles você precisa é decidido por quem vai escanear: uma loja quer um EAN-13 ou um UPC-A, uma caixa de transporte quer um ITF-14, e qualquer coisa interna costuma ser Code 128.
2. **Diga o que vai dentro.** Um link é o caso comum, e as caixas acima dele montam os outros formatos que os celulares conhecem: uma rede Wi-Fi que se oferece para conectar, um cartão de contato que se oferece para ser salvo, um e-mail, uma mensagem de texto, um telefone, um lugar no mapa. Seja qual for a sua escolha, a cadeia de texto final aparece na página, porque é só isso que um QR Code guarda.
3. **Escolha quanto dano ele pode aguentar.** Os quatro níveis põem mais ou menos correção de erros, e mais correção significa um código maior e mais denso. O L basta para uma tela, o M para papel comum, e o H para algo que vai ser manuseado, impresso pequeno ou colado numa vitrine ao sol. Um código num cardápio que é limpado todo dia merece Q ou H.
4. **Defina o tamanho, a margem e as cores.** A margem faz parte do código: quatro módulos de espaço em silêncio em volta é o que a especificação pede, e aparar isso é o motivo isolado mais comum de um código impresso não escanear. Escuro sobre claro, com contraste de verdade, porque um leitor lê a diferença entre os dois. Cinza pálido sobre branco não serve, e claro sobre escuro falha de cara num bom número de leitores.
5. **Confira com o celular que você tem.** Antes de imprimir mil deles, escaneie o que está na sua tela. Isso leva dez segundos e pega a categoria inteira de erros que uma pré-visualização não pega: uma senha de Wi-Fi com um caractere que precisava ser escapado, um link sem o `https://`, um número de código de barras com um dígito a menos.
6. **Leve o SVG.** Ele é o código como instruções em vez de pixels, então imprime em qualquer tamanho sem amolecer, e uma borda mole é exatamente o que um leitor não consegue resolver. Leve o PNG também se aquilo em que você vai colar não aceitar um SVG. Ele é desenhado num número inteiro de pixels por módulo, então também não tem bordas borradas.

## A versão longa

[Como gerar um QR Code que ainda escaneia no celular dos outros](https://abox.tools/pt/guias/gerar-um-qr-code/): Qual nível de correção de erros escolher, por que a margem branca em volta do QR Code faz parte do código, de que tamanho imprimir, e quanto o código "dinâmico" de um gerador gratuito custa a você depois.

## Também na caixa

- [Leitor de QR Code e código de barras](https://abox.tools/pt/ler-qr-code/): Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.
- [Hash e checksum](https://abox.tools/pt/verificar-checksum/): Confira um download contra o número que quem publicou divulgou, sem mandar o arquivo para ninguém.
- [Gerador de senha e frase secreta](https://abox.tools/pt/gerador-de-senha/): Gerada aqui, pelo seu próprio navegador, e não enviada para lugar nenhum. Nada é guardado e não existe histórico.
- [Formatador de JSON](https://abox.tools/pt/formatar-json/): JSON, XML, HTML, CSS e YAML, formatados ou convertidos. Nada é colado no servidor de ninguém.

## Perguntas

### Alguma coisa que eu digito é mandada para algum lugar?

Não. Um QR Code é aritmética sobre uma cadeia de texto, e essa aritmética roda no seu próprio navegador, no seu próprio computador. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site. Isso vale mais aqui do que na maioria das páginas, porque a coisa que as pessoas mais põem num QR Code é a senha do Wi-Fi delas.

### Estes códigos expiram, ou param de funcionar depois?

Não, e não teriam como. O que você digita é o que o código guarda, então escaneá-lo devolve exatamente aquela cadeia de texto para sempre. Os códigos que expiram são os que têm o endereço de outra gente lá dentro: um QR Code “dinâmico” guarda um link para o servidor do gerador, que redireciona para o seu, o que significa que eles podem contar cada escaneamento, mudar para onde ele leva, ou desligá-lo quando um teste acabar. Nada aqui redireciona por lugar nenhum.

### É grátis, e posso usar comercialmente?

É grátis, não tem conta, não tem marca d'água, não tem limite de quantos você gera, e você pode pôr o resultado num produto, num cartaz ou numa fachada. QR Code é marca registrada da Denso Wave, que declarou que não vai exercê-la contra quem usa os códigos. A especificação é publicada como ISO/IEC 18004 e é livre para implementar, que é o que esta página faz. O site exibe publicidade, e é ela que paga a conta.

### Qual nível de correção de erros eu devo escolher?

M, a menos que você tenha um motivo. O L gera o código menor e serve numa tela, o M sobrevive ao manuseio comum, e o Q e o H são para um código que vai ser impresso pequeno, plastificado, colado numa vitrine ou parcialmente coberto por uma logomarca. Cada degrau a mais põe mais dados de verificação, o que exige um símbolo maior para a mesma quantidade de texto: ir de L para H mais ou menos dobra o número de módulos para a mesma cadeia.

### Quanto cabe num QR Code?

No tamanho maior, com 177 módulos de lado, cabem até 7.089 dígitos, 4.296 letras maiúsculas e dígitos, ou 2.953 bytes de qualquer outra coisa. E isso na correção de erros mais fraca, porque na mais forte é cerca de um terço disso. Na prática, o limite não é o formato e sim o leitor: passando de algumas centenas de caracteres, os módulos ficam tão pequenos que a câmera de um celular comum não consegue resolvê-los a um braço de distância. Um código longo costuma ser sinal de que ali cabia um link curto.

### Por que o meu código fica maior quando escrevo o link em minúsculas?

Porque um QR Code tem um modo para maiúsculas e dígitos que empacota dois caracteres em onze bits, e não tem modo equivalente para minúsculas, que custam oito bits cada. Uma URL escrita `HTTPS://EXEMPLO.COM.BR/PAGINA` pode ficar um terço menor que a mesma URL em minúsculas. O esquema e o host não diferenciam maiúsculas, então gritá-los não muda nada além do tamanho. Já o caminho depois do host diferencia, então deixe esse em paz.

### Ele também lê um QR Code, além de gerar?

Esta página não, mas a do lado sim: [o leitor](https://abox.tools/pt/ler-qr-code/) pega uma foto, um print ou a sua câmera e devolve o texto. É um trabalho bem maior do que desenhar um — achar o símbolo dentro de uma imagem, corrigir o ângulo em que ela foi tirada e reparar o dano são três problemas que esta página não tem —, e por isso virou ferramenta própria e não um botão aqui. Funciona nos mesmos termos que todo o resto: nada sobe, e nenhum quadro da câmera fica guardado.

### Para que serve a margem, e posso deixá-la menor?

O espaço branco em volta de um QR Code faz parte do código. Um leitor usa esse espaço para achar onde o símbolo termina, e a especificação pede quatro módulos de cada lado; um código de barras quer uns dez. Dá para zerar isso aqui, e a imagem vai ficar mais arrumada, mas aí um bom número de leitores vai deixar de enxergá-la, especialmente sobre um fundo carregado. Se o problema é espaço, deixe o código menor em vez de aparar a margem dele.

### De qual código de barras eu preciso?

Do que a pessoa que vai escanear pedir. EAN-13 é o código de barras do varejo fora da América do Norte e UPC-A é o norte-americano, e os dois precisam de um número emitido para você pela GS1, porque o número identifica a sua empresa e não só o produto. EAN-8 é a versão curta para embalagens pequenas. ITF-14 vai na caixa de transporte. Code 128 e Code 39 guardam texto além de dígitos e não precisam de registro nenhum, o que faz deles a resposta certa para qualquer coisa interna: patrimônio, prateleiras, ordens de serviço.

### O que é um dígito verificador, e por que a ferramenta acrescentou um?

É o último dígito de um código de barras de varejo, calculado a partir dos anteriores, para que um leitor consiga distinguir uma leitura errada de uma certa. O EAN-13 quer doze dígitos e calcula o décimo terceiro, e o UPC-A quer onze e calcula o décimo segundo. Digite o número curto e esta página acrescenta o dígito. Digite o número completo e ela confere o que você deu, e recusa em vez de corrigir em silêncio, porque um dígito errado consertado caladinho é uma etiqueta que escaneia como produto de outra pessoa.

### Posso pôr uma logomarca no meio de um QR Code?

Aqui não, mas vale saber por que funciona em outros lugares: quem torna isso possível é a correção de erros. No nível H, cerca de 30% dos módulos podem ser destruídos e o código ainda é lido, então uma logomarca cobrindo bem menos que isso no centro, onde não fica nenhum padrão de localização, é dano reparável. Passe o código pelo seu editor de imagem no nível H, mantenha a logomarca abaixo de uns 20% da área, e teste com um celular de verdade em vez de confiar.

### Por que o SVG é melhor que o PNG?

Porque um código é feito de bordas, e um PNG tem um número fixo de pixels com que formá-las. Amplie um e toda borda amolece, e uma borda mole é precisamente o que dá trabalho a um leitor. Uma impressora a 1200 dpi recebendo um PNG de 512 pixels está sendo convidada a inventar a diferença. Um SVG são os quadradinhos como instruções, então imprime nítido num cartão de visita ou num outdoor. O PNG daqui é desenhado num número inteiro de pixels por módulo, que é o melhor que um PNG consegue fazer.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse o seu texto embora para ter um código desenhado pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Não existe para onde o que você digita possa ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde uma senha de Wi-Fi pudesse ser recolhida, e não existe no código nada que a mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`. O código é montado a partir da cadeia de texto por aritmética e desenhado como um SVG, nesta página, no seu computador.
- **O código não aponta para a gente.** O que você digita é o que o código guarda. Vários geradores gratuitos devolvem um código contendo um link para o site deles, que só então redireciona para o seu. Assim cada escaneamento é contado por eles, e o código para de funcionar no dia em que eles pararem de pagar o domínio ou decidirem que o plano gratuito acabou. Nada aqui encurta, redireciona ou rastreia: a cadeia de texto que aparece na página é a cadeia de texto que está na imagem.
- **O PNG é feito a partir do SVG que está na tela.** O download não é uma segunda renderização que pudesse discordar da pré-visualização. A mesma marcação é entregue ao navegador e pintada num canvas, o que também é o motivo de isso ser possível sem acessar nada: não há fonte para buscar nem imagem para carregar lá dentro.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe nada do que você digita. Toda linha que transforma uma cadeia de texto num código é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/qr-encode.js` e `src/qr.js` para o QR Code em si, com os modos, a versão e os blocos num deles e os padrões, a máscara e os bits de formato no outro, `src/gf256.js` para a correção de erros, e `src/barcode.js` para os listrados.
