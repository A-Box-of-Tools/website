# Conversor de YAML para JSON

Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.

> Converta um subconjunto compatível de YAML 1.2 para JSON e de JSON para YAML no navegador. Âncoras, aliases, tags e vários documentos são recusados; JSON perde comentários. Sem upload.

Esta é uma ferramenta interativa de navegador em https://abox.tools/pt/converter-yaml-para-json/. Os arquivos são processados no dispositivo que executa esse navegador. Compartilhamento deliberado e funções opcionais de rede são explicados na página. A seguir está sua explicação escrita; abra o endereço para usá-la.

## Seus arquivos YAML e JSON são **processados no navegador**. Sem envio para processamento.

Converter é aritmética sobre um texto, feita aqui, nesta página. Os dois analisadores são escritos à mão e estão em `src/` — `shared/parse-yaml.js` e `shared/parse-json.js` — e não há mais nada. Esta ferramenta não tem função de rede de espécie alguma — nada para buscar, nada para enviar — e aqui isso importa mais do que em quase qualquer outro canto deste site: um arquivo YAML costuma ser uma configuração de deploy, e uma configuração de deploy costuma estar cheia de nomes de host, nomes de bucket e segredos.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como converter YAML para JSON sem enviar o arquivo

1. **Escolha o sentido.** *YAML para JSON* ou *JSON para YAML*. A observação embaixo do menu diz o que aquele sentido perde antes de você colar qualquer coisa, e não depois.
2. **Cole, ou arraste o arquivo.** Qualquer coisa que você consiga selecionar e copiar serve. Um arquivo arrastado para o seletor é lido pelo seu próprio navegador e colocado na caixa — não existe etapa de envio para pular — e uma extensão `.json` ou `.yaml` já escolhe o sentido para você.
3. **Escolha a indentação.** Dois espaços, quatro, ou uma tabulação. A tabulação só é oferecida para JSON: YAML é definido em termos de espaços, e uma tabulação não é indentação válida nele.
4. **Leia o erro onde o erro está.** Um analisador que falha aqui diz o que encontrou e em que linha e coluna, em vez de “token inesperado na posição 4193”. Isso normalmente basta para consertar um arquivo de configuração sem abrir mais nada.
5. **Leve o resultado.** Copie, ou baixe como arquivo, com o nome do formato em que ele saiu.

## A versão longa

[Como converter entre YAML e JSON](https://abox.tools/pt/guides/convert-yaml-and-json/): Converta um subconjunto de YAML para JSON ou o contrário no navegador. Confira comentários perdidos, construções recusadas e texto numérico antes de reutilizar.

## Também na caixa

- [Formatador de XML](https://abox.tools/pt/formatar-xml/): XML organizado para ler ou espremido para publicar, e convertido em JSON nos dois sentidos. Nada disso é colado no servidor de outra pessoa.
- [Comparador de textos](https://abox.tools/pt/comparar-textos/): Dois textos entram, cada diferença sai marcada, linha a linha e palavra por palavra. Nada é colado no servidor de ninguém.
- [Codificador e decodificador Base64](https://abox.tools/pt/codificar-base64/): Base64, codificação percentual, entidades HTML, hexadecimal e escapes com barra invertida, nos dois sentidos. Nada é colado no servidor de ninguém.
- [Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.

## Perguntas

### Meu YAML é enviado para algum lugar?

Não. Os dois analisadores e os dois impressores desta página são funções que rodam no seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles é nosso. É justamente por isso que se usa isto para uma configuração de deploy: elas vivem cheias de nomes de host, nomes de bucket e de vez em quando um segredo que alguém queria mover, e colar uma no conversor de outra pessoa é entregá-la.

### O que se perde ao converter YAML para JSON?

JSON perde os comentários. Este parser aceita deliberadamente um subconjunto de YAML 1.2 e recusa âncoras, aliases e tags em vez de escolher a expansão ou conversão de tipo. JSON representa uma árvore de valores; YAML também representa nós compartilhados e valores tipados. Fluxos de vários documentos são recusados em vez de criar um array inventado. JSON para YAML mantém os valores representados. [A especificação YAML](https://yaml.org/spec/1.2.2/) define o formato completo.

### Meu YAML diz no e o JSON saiu como texto. Por quê?

YAML 1.1 lia `yes`, `no`, `on` e `off` como booleanos, transformando o código da Noruega em `false`. Este subconjunto usa YAML 1.2: essas palavras ficam como strings, `true` e `false` são booleanos, `null` e `~` são null e escalares numéricos são números. A escrita YAML coloca palavras ambíguas entre aspas para leitores com regras antigas.

### Ele mantém a ordem das minhas chaves?

Mantém, nos dois sentidos, e isso é mais difícil do que parece. Um conversor construído em cima do `JSON.parse` caladinho joga para a frente as chaves que parecem inteiros, então `{"10":a,"2":b}` volta como `{"2":b,"10":a}`. Os números mantêm os dígitos que você digitou, então um id de conta de vinte dígitos não perde os três últimos para um double. Se você *quiser* ordenar, tem uma caixinha, e ela ordena pelo jeito como as chaves se leem, não pelos pontos de código.

### Ele converte vários documentos YAML de uma vez?

Não, e ele diz isso em vez de escolher um. Um arquivo com separadores `---` contém mais de um documento, e JSON não tem nenhuma forma que signifique “vários documentos” — um array seria uma afirmação que o arquivo nunca fez. Converta um de cada vez.

### Por que não tem um formatador de YAML aqui?

Porque YAML não tem uma forma espremida que valha a pena escrever — a curta é o estilo de fluxo, que é ilegível, e ilegível é o oposto do motivo de manter um arquivo em YAML. Organizar JSON, XML, HTML e CSS é o trabalho do [formatador de JSON](https://abox.tools/pt/formatar-json/), e ele organiza YAML também.

### De que tamanho pode ser o arquivo?

Não há limite nenhum posto aqui, porque não há servidor pagando por um. O teto de verdade é o seu próprio computador: alguns megabytes de YAML vão bem, e num documento muito longo a página espera uma pausa na sua digitação antes de converter, em vez de disputar o teclado com você.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de quanto você cola. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu texto.

### Funciona offline?

Funciona. Carregue a página uma vez, desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada é enviado: uma ferramenta que mandasse a sua configuração embora para converter pararia no instante em que você desconectasse.

## Como dá para conferir a promessa de privacidade

- **O processamento acontece neste navegador.** A ferramenta processa entradas e resultados no navegador. Seu código não os envia para processamento. Content-Security-Policy limita recursos e destinos, mas hosts permitidos podem receber solicitações: ela não inspeciona o conteúdo nem prova sozinha que nada é enviado. Compare código e solicitações da operação ou conclua a operação local desconectado.
- **Nada aqui busca coisa alguma.** Não há nenhum `fetch`, nenhum `XMLHttpRequest` e nenhum `sendBeacon` em lugar algum de `src/`. Os dois analisadores e os dois impressores são funções desta página que recebem um texto e devolvem um texto.
- **O subconjunto aceito usa as regras escalares de YAML 1.2.** No YAML 1.1, `no` era um booleano, que é o bug famoso que transforma o código de país da Noruega em `false`. Aqui se lê 1.2, onde ele é o texto que parece ser. No outro sentido essas palavras são escritas de volta *entre aspas*, porque o que abrir o arquivo depois ainda pode ser um leitor 1.1. `tests/js/text-convert.test.js` confere as duas metades.
- **Uma conversão que não pode ser honesta para em vez disso.** JSON perde os comentários. Este parser aceita deliberadamente um subconjunto de YAML 1.2 e recusa âncoras, aliases e tags em vez de escolher a expansão ou conversão de tipo. JSON representa uma árvore de valores; YAML também representa nós compartilhados e valores tipados. Fluxos de vários documentos são recusados em vez de criar um array inventado. JSON para YAML mantém os valores representados.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe um caractere do seu texto. Toda linha que lê, analisa ou escreve é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/parse-yaml.js` para o leitor que recusa uma âncora em vez de adivinhar o que ela queria dizer, e `src/convert.js` para entender por que uma conversão é um analisador e um impressor, sem nada no meio que conheça os dois formatos ao mesmo tempo.
