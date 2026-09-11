# Formatador de JSON — deixe arrumado, comprima ou converta

JSON, XML, HTML, CSS e YAML, formatados ou convertidos. Nada é colado no servidor de ninguém.

> Formate e minifique JSON, XML, HTML, CSS e YAML, e converta JSON para YAML ou XML e de volta. Os analisadores rodam no seu navegador e nada é enviado: um token ou um arquivo de configuração nunca sai do seu computador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/formatar-json/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem texto e código. Não existe servidor.

Formatar e converter são aritmética sobre uma string, feita aqui, nesta página. Os analisadores são escritos à mão e ficam em `src/`: `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js`; e não há mais nada. Esta ferramenta não tem função de rede de espécie alguma, nada para buscar e nada para mandar, e isso pesa aqui mais do que em quase qualquer outro lugar deste site: o que as pessoas colam num formatador são tokens de acesso, cookies de sessão, cadastros de clientes e código ainda não lançado.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como formatar ou converter JSON sem enviá-lo

1. **Escolha o trabalho.** Duas abas, uma caixa só: *Formatar* arruma ou comprime JSON, XML, HTML, CSS e YAML; *Converter* transforma JSON em YAML ou XML e de volta. O texto que você acabou de formatar é o texto que você converte, sem colar duas vezes.
2. **Cole, ou solte o arquivo.** Qualquer coisa que você consiga selecionar e copiar serve. Um arquivo solto no seletor é lido pelo seu próprio navegador e vai para a caixa: aqui não existe etapa de envio para pular.
3. **Deixe que ele descubra a linguagem, ou diga qual é.** O menu diz como ele leu o texto, e corrigir é um clique. Um palpite é só um ponto de partida, e é por isso que ele aparece em vez de ser aplicado caladinho.
4. **Escolha a indentação, ou esprema tudo.** Dois espaços, quatro, ou uma tabulação. Espremer é o mesmo documento com todo espaço que só estava lá para leitura retirado, e o resultado diz quantos bytes isso economizou.
5. **Leia o erro onde o erro está.** Um analisador que falha aqui diz o que encontrou e em que linha e coluna, em vez de “token inesperado na posição 4193”. Em geral isso basta para consertar um arquivo de configuração sem abrir mais nada.
6. **Leve o resultado.** Copie, ou baixe como arquivo, com o nome da linguagem em que ele saiu.

## A versão longa

[Como formatar JSON sem entregar para ninguém](https://abox.tools/pt/guias/formatar-json/): Como identar, conferir e minificar JSON no seu próprio navegador: o que um formatador nunca deve mudar no seu arquivo, como ler a mensagem de erro, e por que importa a caixa em que você cola.

## Também na caixa

- [Conversor de YAML para JSON](https://abox.tools/pt/converter-yaml-para-json/): Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.
- [Formatador de XML](https://abox.tools/pt/formatar-xml/): XML organizado para ler ou espremido para publicar, e convertido em JSON nos dois sentidos. Nada disso é colado no servidor de outra pessoa.
- [Comparador de textos](https://abox.tools/pt/comparar-textos/): Dois textos entram, cada diferença sai marcada, linha a linha e palavra por palavra. Nada é colado no servidor de ninguém.
- [Codificador e decodificador Base64](https://abox.tools/pt/codificar-base64/): Base64, codificação percentual, entidades HTML, hexadecimal e escapes com barra invertida, nos dois sentidos. Nada é colado no servidor de ninguém.

## Perguntas

### O meu texto é enviado para algum lugar?

Não. Cada analisador e cada escritor desta página é uma função que roda no seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. É esse o motivo para usá-la com um token de acesso, um cookie de sessão ou um cadastro de cliente: colar uma dessas coisas no formatador de outra pessoa é entregá-la a ela.

### Formatar JSON muda alguma coisa além do layout?

Não, e isso é mais difícil do que parece. As chaves mantêm a ordem em que você escreveu: um formatador construído em cima do `JSON.parse` move caladinho para a frente as chaves parecidas com inteiros, então `{"10":a,"2":b}` volta como `{"2":b,"10":a}`. Os números mantêm os dígitos que você digitou, então um id de vinte dígitos não perde os três últimos para um double e `1e999` não vira `null`. Chaves repetidas ficam as duas, porque o padrão não diz qual vence e descartar uma seria escolher no seu lugar.

### Quais linguagens ele formata?

JSON, XML, HTML, CSS e YAML. JSON, XML, HTML e CSS também podem ser espremidos; YAML não, porque a forma curta dele é o estilo de fluxo, que é ilegível, e ilegível é o oposto do motivo pelo qual se mantém um arquivo em YAML. JavaScript ficou de fora de propósito: veja a pergunta sobre isso mais abaixo.

### Por que ele não formata JavaScript, Python ou SQL?

Porque arrumar uma linguagem de programação significa analisá-la direito, e um formatador que acerta quase tudo é pior do que nenhum: ele produz código que parece certo e faz outra coisa. JSON, XML, CSS e YAML têm gramáticas pequenas o bastante para serem lidas à mão e conferidas com testes que você pode rodar. Um formatador de JavaScript é o Prettier, que é um megabyte de analisador, e o lugar dele é no seu editor, não numa página web.

### Meu YAML diz no e o JSON saiu como string. Por quê?

Porque é uma string, e aqui se lê YAML 1.2 e não 1.1. No YAML 1.1, `yes`, `no`, `on` e `off` eram booleanos, que é o famoso bug que transforma o código de país da Noruega em `false`. O YAML 1.2 tirou isso, e esta ferramenta também: só `true`, `false`, `null` e `~` são lidos como outra coisa que não texto. No sentido inverso, essas palavras são escritas de volta *entre aspas*, mesmo que aqui elas fossem lidas como texto sem as aspas, porque o que abrir o arquivo depois talvez não leia. O PyYAML ainda usa 1.1 por padrão. Ler com rigor e escrever com prudência é a única combinação que dá certo nos dois sentidos.

### O que se perde ao converter YAML para JSON?

Os comentários, porque JSON não tem onde colocar um. Âncoras, aliases e tags são recusados de cara em vez de adivinhados: cada um deles diz algo que o JSON não sabe dizer, e um conversor que escolhesse caladinho uma interpretação te entregaria um documento que não é o que o arquivo dizia. No outro sentido não se perde nada: todo documento JSON já é um documento YAML.

### O que se perde ao converter JSON para XML?

A diferença entre um objeto vazio, um array vazio e uma string vazia, que viram todos um elemento vazio, e o tipo de cada valor, porque XML não tem tipos, que é por isso que a conversão inversa deixa tudo como string em vez de decidir que `8080` era um número. Um array vira um elemento repetido, que é o único formato que se lê de volta, e uma chave que um nome de elemento não comporta tem os caracteres inconvenientes substituídos, em vez de sair um documento que analisador nenhum vai ler.

### Reindentar HTML muda a aparência da página?

Pode mudar, e aqui isso é dito com honestidade. O espaço entre dois elementos inline é um espaço entre duas palavras, então mexer nele não sai de graça. Duas coisas seguram isso: `<pre>` e `<textarea>` são copiados exatamente como estavam, e um elemento que só contém texto fica numa linha só. Todo o resto é arrumado.

### De que tamanho pode ser o arquivo?

Aqui não tem limite definido, porque não existe servidor pagando por um. O teto de verdade é o seu próprio computador: alguns megabytes de JSON vão bem, e num documento muito longo a página espera uma pausa na sua digitação antes de reformatar, em vez de brigar com você pelo teclado.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de quanto você cola. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu texto.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse o seu texto embora para ser formatado pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **O que você cola não tem para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde um token colado pudesse parar, nem nada no código que o mandasse para lá se existisse.
- **Aqui nada busca nada.** Não existe em lugar nenhum de `src/` um `fetch`, um `XMLHttpRequest` ou um `sendBeacon`. Cada analisador e cada escritor são funções desta página que recebem uma string e devolvem uma string.
- **Os formatadores mantêm o que receberam.** Um objeto JSON volta com as chaves na ordem em que você escreveu e com os números grafados do jeito que você grafou, porque `src/shared/parse-json.js` é um analisador e não uma chamada de `JSON.parse`, que reordena as chaves parecidas com inteiros e transforma um id de vinte dígitos no double mais próximo. Os testes em `tests/js/text-format.test.js` conferem exatamente isso.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe um caractere do seu texto. Toda linha que o lê, analisa ou escreve é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/parse-json.js` para o analisador que mantém as suas chaves na ordem em que você escreveu, e `src/convert.js` para entender por que uma conversão é um analisador e um escritor, sem nada no meio que conheça os dois formatos ao mesmo tempo.
