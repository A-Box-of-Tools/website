# Formatador de XML — organize, esprema ou converta em JSON

XML organizado para ler ou espremido para publicar, e convertido em JSON nos dois sentidos. Nada disso é colado no servidor de outra pessoa.

> Formate, indente e comprima XML, e converta XML para JSON ou JSON para XML. O analisador roda no seu navegador e nada é enviado, então um feed, uma nota fiscal ou um arquivo de configuração nunca sai do seu computador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/formatar-xml/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem arquivos XML e JSON. Não existe servidor.

Formatar e converter são aritmética sobre um texto, feita aqui, nesta página. O analisador é escrito à mão e está em `src/shared/parse-xml.js`, e não há mais nada. Esta ferramenta não tem função de rede de espécie alguma — nada para buscar, nada para enviar — e isso pesa aqui mais do que a palavra “XML” sugere: o que chega neste formato costuma ser uma nota fiscal, um extrato bancário, um prontuário, ou uma requisição SOAP com as credenciais de alguém no cabeçalho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como formatar XML sem enviar o arquivo

1. **Escolha o trabalho.** Duas abas, uma caixa: *Formatar* organiza o XML ou esprema; *Converter* transforma em JSON, ou o JSON de volta em XML. O XML que você acabou de organizar é o XML que você converte, sem colar duas vezes.
2. **Cole, ou arraste o arquivo.** Qualquer coisa que você consiga selecionar e copiar serve, e um arquivo `.xml`, `.svg`, `.rss` ou `.xsd` arrastado para o seletor é lido pelo seu próprio navegador e colocado na caixa — não existe etapa de envio para pular.
3. **Escolha a indentação, ou esprema.** Dois espaços, quatro, ou uma tabulação. Espremer é o mesmo documento sem nenhum dos espaços que só estavam ali para leitura, e o resultado diz quantos bytes isso economizou.
4. **Leia o erro onde o erro está.** Um analisador que falha aqui diz *qual tag* nunca foi fechada e em que linha e coluna, em vez de “erro na linha 1”, que é o que um navegador diz de um documento que leu de uma vez só.
5. **Leve o resultado.** Copie, ou baixe como arquivo, com o nome do formato em que ele saiu.

## Também na caixa

- [Comparador de textos](https://abox.tools/pt/comparar-textos/): Dois textos entram, cada diferença sai marcada, linha a linha e palavra por palavra. Nada é colado no servidor de ninguém.
- [Codificador e decodificador Base64](https://abox.tools/pt/codificar-base64/): Base64, codificação percentual, entidades HTML, hexadecimal e escapes com barra invertida, nos dois sentidos. Nada é colado no servidor de ninguém.
- [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/): O compartilhamento vive nesta aba aberta. Os leitores o recebem criptografado, direto do seu navegador, e fechar a aba o encerra - nenhum servidor guarda nada.
- [Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.

## Perguntas

### Meu XML é enviado para algum lugar?

Não. O analisador e o impressor desta página são funções que rodam no seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles é nosso. Isso importa mais para XML do que a fama do formato sugere: o que chega nele costuma ser uma nota fiscal, um extrato bancário, um prontuário, ou uma requisição SOAP com credenciais no cabeçalho.

### Ele resolve entidades externas?

Não, e não há nada para desligar. Resolver entidades externas é o jeito de convencer um analisador de XML a ler arquivos da máquina que o executa — o ataque que costuma ser escrito XXE — e `src/shared/parse-xml.js` é um leitor escrito à mão sem resolução de entidades nenhuma. O seu texto também nunca é entregue ao `DOMParser` do próprio navegador. Um `DOCTYPE` passa adiante sem nunca ser executado.

### O que se perde ao converter XML para JSON?

A ordem do conteúdo misto, os comentários, e a diferença entre um atributo e um elemento filho — essa última suavizada em vez de apagada, porque um atributo vira um membro cujo nome começa com `@`. O texto próprio de um elemento vira `#text` quando precisa ficar ao lado de outra coisa, e filhos repetidos viram um array. Todo valor continua sendo texto: XML não tem tipos, e decidir que `8080` era um número seria inventar informação.

### O que se perde ao converter JSON para XML?

A diferença entre um objeto vazio, um array vazio e um texto vazio, que viram todos os três um elemento vazio, e o tipo de cada valor, porque XML não tem tipos. Um array vira um elemento repetido, que é a única forma que se lê de volta, e uma chave que um nome de elemento não aguenta tem os caracteres complicados substituídos em vez de sair um documento que nenhum analisador vai ler.

### Ele formata um SVG, um feed RSS ou um arquivo POM?

Formata. Os três são XML, e isto lê XML em vez de algum dialeto específico. Um SVG organizado assim fica mais fácil de editar à mão; um feed RSS ou Atom normalmente é publicado espremido e fica ilegível até alguma coisa abrir. O jeito como fica disposto não muda nada do que o documento significa.

### Reindentar o XML muda o que ele significa?

Para um documento cujos elementos contêm outros elementos, não. Onde pode importar é no texto: o espaço em branco dentro de um elemento que contém palavras faz parte desse texto, então um elemento que só contém texto é deixado numa linha em vez de ser aberto. As seções `CDATA` são copiadas exatamente como estavam.

### Por que não usar o analisador de XML do próprio navegador?

Por causa do que ele diz quando o documento está quebrado. O `DOMParser` devolve um documento de erro cuja redação é diferente em cada navegador e muitas vezes se resume a “erro na linha 1”. Um leitor escrito à mão consegue dizer qual tag nunca foi fechada, e onde ela foi aberta, que é justamente o que você precisava saber. Não resolver entidades externas é o outro motivo.

### De que tamanho pode ser o arquivo?

Não há limite nenhum posto aqui, porque não há servidor pagando por um. O teto de verdade é o seu próprio computador: alguns megabytes de XML vão bem, e num documento muito longo a página espera uma pausa na sua digitação antes de reformatar, em vez de disputar o teclado com você.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de quanto você cola. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu texto.

### Funciona offline?

Funciona. Carregue a página uma vez, desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada é enviado: uma ferramenta que mandasse o seu XML embora para formatar pararia no instante em que você desconectasse.

## Como dá para conferir a promessa de privacidade

- **O que você cola não tem para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles é nosso. Não existe aqui nenhum ponto final onde uma nota fiscal colada pudesse ser recolhida, nem nada no código que a enviaria se existisse.
- **Nada aqui busca coisa alguma.** Não há nenhum `fetch`, nenhum `XMLHttpRequest` e nenhum `sendBeacon` em lugar algum de `src/`. O analisador e o impressor são funções desta página que recebem um texto e devolvem um texto.
- **Nenhuma entidade externa é resolvida, nunca.** Um `DOCTYPE` com uma entidade externa dentro é o jeito de convencer um analisador de XML a ler um arquivo da máquina que está analisando, e é o buraco mais antigo do formato. `src/shared/parse-xml.js` é um leitor escrito à mão que não tem resolução de entidades nenhuma — não desligada, ausente — e esta página nunca entrega o seu texto ao `DOMParser` do próprio navegador.
- **Todo valor que sai do XML é texto.** `<port>8080</port>` não diz nada sobre aquilo ser um número, então o JSON diz `"8080"`. Decidir por você seria inventar uma informação que depois viaja como se estivesse no arquivo.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe um caractere do seu texto. Toda linha que lê, analisa ou escreve é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/parse-xml.js` para o analisador que diz qual tag nunca foi fechada, e `src/convert.js` para entender por que todo valor sai do XML como texto em vez de ser adivinhado.
