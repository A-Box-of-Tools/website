# Codificador e decodificador Base64 — e URL, entidades HTML, hexadecimal e escapes

Base64, codificação percentual, entidades HTML, hexadecimal e escapes com barra invertida, nos dois sentidos. Nada é colado no servidor de ninguém.

> Codifique e decodifique Base64 nos dois alfabetos, codifique URL em porcentagem, escape entidades HTML e leia hexadecimal e escapes com barra invertida. Tudo roda no seu navegador e nada é enviado: um token nunca sai do seu computador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/codificar-base64/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem texto. Não existe servidor.

Cada codificação daqui é aritmética sobre uma string, feita aqui, nesta página. Os codecs são escritos à mão e ficam em `src/encode.js`; e não há mais nada. Esta ferramenta não tem função de rede de espécie alguma, nada para buscar e nada para mandar, e isso pesa aqui mais do que em quase qualquer outro lugar: o que as pessoas colam num decodificador de Base64 online é um token, e colar um token no site de outra pessoa é entregá-lo a ela.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como codificar ou decodificar Base64 sem enviá-lo

1. **Escolha a codificação.** Base64 nos dois alfabetos, codificação percentual para um valor sozinho ou para uma URL inteira, as cinco entidades HTML, bytes em hexadecimal e os escapes com barra invertida de um literal de string. A nota embaixo do menu diz para que serve cada uma.
2. **Escolha o sentido.** *Codificar* pega texto puro e produz a forma codificada; *Decodificar* traz a forma codificada de volta ao texto puro. O resultado acompanha a sua digitação: mudar de sentido é um clique, sem redigitar nada.
3. **Cole, ou solte o arquivo.** Qualquer coisa que você consiga selecionar e copiar serve. Um arquivo solto no seletor é lido pelo seu próprio navegador e vai para a caixa: aqui não existe etapa de envio para pular.
4. **Leia o erro, se houver um.** Um decodificador que falha aqui diz o que encontrou — um caractere que o Base64 não usa, preenchimento no lugar errado, bytes que não são texto — em vez de devolver algo plausível e errado.
5. **Leve o resultado.** Copie, ou baixe como arquivo de texto. Os contadores embaixo da caixa dizem quantos bytes entraram e quantos saíram.

## Também na caixa

- [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/): O compartilhamento vive nesta aba aberta. Os leitores o recebem criptografado, direto do seu navegador, e fechar a aba o encerra - nenhum servidor guarda nada.
- [Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.
- [Leitor de QR Code e código de barras](https://abox.tools/pt/ler-qr-code/): Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.
- [Hash e checksum](https://abox.tools/pt/verificar-checksum/): Confira um download contra o número que quem publicou divulgou, sem mandar o arquivo para ninguém.

## Perguntas

### O meu texto é enviado para algum lugar?

Não. Cada codificador e cada decodificador desta página é uma função que roda no seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. É esse o motivo para usá-la com um token de acesso ou um cookie de sessão: colar uma dessas coisas no decodificador de outra pessoa é entregá-la a ela.

### O Base64 daqui é o mesmo Base64 de todo mundo?

É: ele é conferido contra os vetores de teste do RFC 4648, e não contra ele mesmo. Os dois alfabetos decodificam, então um JWT escrito com `-` e `_` se lê tão fácil quanto um escrito com `+` e `/`, e uma entrada quebrada a cada 64 caracteres é juntada para você. A codificação passa por bytes UTF-8, então uma letra acentuada ou um emoji sobrevive à ida e à volta.

### Base64 é criptografia?

Não, e tratá-lo como criptografia é o erro clássico. Base64 é uma grafia: os mesmos bytes, escritos num alfabeto que sobrevive a uma URL, a um e-mail ou a uma string JSON. Qualquer um pode ler de volta — esta página faz isso em um milissegundo —, então ele não esconde nada e não protege nada. Se o que você tem é segredo, precisa de criptografia de verdade antes de ser codificado, não no lugar dela.

### Por que a decodificação falhou?

Porque o que foi colado não é exatamente o que o codec esperava receber, e o erro diz em que sentido: um caractere fora do alfabeto Base64, preenchimento no lugar errado, um sinal de porcentagem sem dois dígitos hexadecimais atrás, ou bytes que até se decodificam do Base64 mas não são texto UTF-8 — o que geralmente significa que o original era um arquivo, e não uma string. O `atob` do navegador teria devolvido algo plausível no lugar; ser avisado é todo o sentido de colar algo num decodificador.

### Qual é a diferença entre as duas codificações de endereço web?

Um valor sozinho, ou o endereço inteiro. Codificar *um valor* escapa tudo a que uma URL dá significado — as barras, os pontos de interrogação, os e comerciais —, que é o que você quer para um único parâmetro de consulta. Codificar uma *URL inteira* deixa o endereço funcionando: as barras e o `?` ficam, e só os caracteres que uma URL não consegue carregar de jeito nenhum são escapados. Usar o primeiro num endereço inteiro quebra o endereço; usar o segundo num valor perde onde o valor termina.

### De que tamanho pode ser o arquivo?

Aqui não tem limite definido, porque não existe servidor pagando por um. O teto de verdade é o seu próprio computador: alguns megabytes de texto vão bem, e num documento muito longo a página espera uma pausa na sua digitação antes de recodificar, em vez de brigar com você pelo teclado.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem limite de quanto você cola. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu texto.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse o seu texto embora para ser decodificado pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **O que você cola não tem para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde um token colado pudesse parar, nem nada no código que o mandasse para lá se existisse.
- **Aqui nada busca nada.** Não existe em lugar nenhum de `src/` um `fetch`, um `XMLHttpRequest` ou um `sendBeacon`. Cada codificador e cada decodificador são funções desta página que recebem uma string e devolvem uma string.
- **O decodificador avisa quando algo está errado.** O `atob` do navegador aceita entradas que deveria recusar e devolve algo plausível. O Base64 daqui é escrito à mão e conferido contra os vetores de teste da RFC 4648, e quando o que você colou não é Base64 ele diz isso, e diz por quê. Os testes em `tests/js/text-encode.test.js` conferem exatamente isso.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe um caractere do seu texto. Toda linha que o lê, analisa ou escreve é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy e `src/encode.js` para o Base64 conferido contra os vetores de teste da RFC 4648 em vez de contra si mesmo, e que recusa entradas ruins em vez de devolver algo plausível como o `atob` faz.
