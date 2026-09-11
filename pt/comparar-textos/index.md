# Comparador de textos — compare dois textos, lado a lado

Dois textos entram, cada diferença sai marcada, linha a linha e palavra por palavra. Nada é colado no servidor de ninguém.

> Compare dois textos e veja cada diferença, linha a linha e palavra por palavra, lado a lado ou numa coluna só. A comparação roda no seu navegador e nada é enviado: código ainda não lançado nunca sai do seu computador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/comparar-textos/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem textos. Não existe servidor.

Uma comparação é aritmética sobre duas strings, feita aqui, nesta página. O algoritmo é o de Myers — o mesmo que o `git diff` usa —, escrito à mão em `src/diff.js`, onde você pode lê-lo. Esta ferramenta não tem função de rede de espécie alguma, nada para buscar e nada para mandar, e isso pesa aqui: o que as pessoas comparam são contratos, arquivos de configuração e código ainda não lançado, sempre aos pares.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como comparar dois textos sem enviá-los

1. **Cole os dois textos, ou solte os dois arquivos.** O original à esquerda, a versão alterada à direita. Dois arquivos soltos juntos no seletor caem um de cada lado, na ordem em que você soltou; troque os lados se ficou ao contrário.
2. **Escolha como ler.** Lado a lado, ou numa coluna só. Um telefone começa numa coluna, porque lado a lado precisa de duas colunas de texto e num telefone cabe mais ou menos uma; o menu está ali do lado de qualquer jeito.
3. **Ignore o que não importa.** Espaços, maiúsculas e minúsculas, linhas em branco — cada um pode ser ignorado, para que um arquivo reformatado não se leia como cem mudanças. Por padrão, o miolo sem alteração é dobrado num contador, com três linhas mantidas de cada lado de cada mudança.
4. **Leia o que mudou.** As linhas removidas ficam marcadas à esquerda, as adicionadas à direita, e dentro de uma linha alterada as palavras que diferem ficam destacadas — assim um diff de dois parágrafos mostra a palavra que se moveu, e não dois parágrafos inteiros.
5. **Leve o patch.** O download é um `.patch` no formato unificado, que é o que uma revisão de código, o `git apply` e qualquer visualizador de diferenças esperam. Copiar põe a mesma coisa na sua área de transferência.

## A versão longa

[Como comparar dois arquivos JSON](https://abox.tools/pt/guias/comparar-dois-arquivos-json/): Formate os dois arquivos do mesmo jeito, ordene as chaves e compare depois. Por que um diff de JSON cru é quase só ruído, como canonizar os dois lados no navegador, e o que sobrevive até o patch.

## Também na caixa

- [Codificador e decodificador Base64](https://abox.tools/pt/codificar-base64/): Base64, codificação percentual, entidades HTML, hexadecimal e escapes com barra invertida, nos dois sentidos. Nada é colado no servidor de ninguém.
- [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/): O compartilhamento vive nesta aba aberta. Os leitores o recebem criptografado, direto do seu navegador, e fechar a aba o encerra - nenhum servidor guarda nada.
- [Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.
- [Leitor de QR Code e código de barras](https://abox.tools/pt/ler-qr-code/): Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.

## Perguntas

### Os meus textos são enviados para algum lugar?

Não. A comparação é uma função que roda no seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. É esse o motivo para usá-la com um contrato, um arquivo de configuração ou código não lançado: colar essas coisas no comparador de outra pessoa é entregar as duas versões de uma vez.

### O que a comparação faz de verdade?

Ela acha o menor conjunto de edições que transforma o texto da esquerda no da direita, usando o algoritmo de Myers, o mesmo que o `git diff` usa. Ser o menor é justamente o que torna um diff legível: uma linha inserida no meio deve aparecer como uma inserção, e não como se todas as linhas seguintes tivessem mudado. Dentro de uma linha alterada, as palavras que diferem também são marcadas, então comparar dois parágrafos mostra a palavra que se moveu em vez de dois parágrafos inteiros.

### Dá para comparar dois arquivos em vez de dois textos colados?

Dá. Solte os dois juntos no seletor e eles caem um de cada lado, na ordem em que você soltou. Quem lê é o seu navegador, para dentro desta página, que é o único lugar aonde eles vão. Troque os lados se você soltou na ordem errada.

### O que sai de uma comparação, e dá para aplicar?

O download é um diff unificado: o formato `@@ -3,5 +3,5 @@` que o `git apply`, o `patch` e qualquer ferramenta de revisão de código leem. Copiar faz a mesma coisa para a área de transferência. O que está na tela é uma visualização disso: lado a lado, ou numa coluna só, com as partes sem mudança recolhidas para uma contagem, a menos que você peça todas.

### Dá para ignorar espaços, maiúsculas ou linhas em branco?

Dá, cada um separadamente. Ignorar espaços faz um arquivo reformatado comparar como sem mudanças; ignorar maiúsculas e minúsculas trata `Error` e `error` como a mesma palavra; ignorar linhas em branco pula as linhas que não carregam nada. Os contadores acima do resultado dizem então que os dois são iguais depois de ignoradas as diferenças que você pediu para ignorar — que não é a mesma afirmação que idênticos, e a página mantém as duas afirmações separadas.

### De que tamanho pode ser a comparação?

Aqui não tem limite definido, porque não existe servidor pagando por um. Dois textos de vinte mil linhas com um punhado de mudanças comparam na hora, porque o começo e o fim em comum são aparados antes de o trabalho de verdade começar. A comparação de dois textos que não têm absolutamente nada em comum para cedo e avisa, em vez de gastar um minuto provando o óbvio; e uma comparação muito longa desenha as primeiras milhares de linhas e deixa o resto para o patch baixado.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de quanto você cola. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu texto.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse os seus textos embora para serem comparados pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **O que você cola não tem para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde um token colado pudesse parar, nem nada no código que o mandasse para lá se existisse.
- **Aqui nada busca nada.** Não existe em lugar nenhum de `src/` um `fetch`, um `XMLHttpRequest` ou um `sendBeacon`. A comparação é uma função desta página que recebe duas strings e devolve o que mudou.
- **O algoritmo é o padrão, legível por inteiro.** O algoritmo do menor roteiro de edição de Myers, o mesmo que o `git diff` usa, escrito à mão em `src/diff.js` com as decisões comentadas. Os testes em `tests/js/text-diff.test.js` provam que as remoções reconstroem o texto da esquerda e as inserções o da direita, que é o que correto quer dizer para um diff.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe um caractere do seu texto. Toda linha que o lê, analisa ou escreve é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy e `src/diff.js` para o algoritmo de Myers, a passada palavra por palavra dentro de cada linha alterada e as três proteções que impedem uma comparação patológica de travar a página.
