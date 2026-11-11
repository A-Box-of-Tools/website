# Base64 é criptografia?

Não. Base64 é uma troca de figurino, não um cadeado: qualquer um que o reconheça o desfaz em milissegundos, sem chave nenhuma. Mas a pergunta merece resposta de verdade, porque codificação, criptografia e hash se parecem na tela e não poderiam prometer coisas mais diferentes.

[Abrir Codificador e decodificador Base64](https://abox.tools/pt/codificar-base64/): Base64, codificação percentual, entidades HTML, hexadecimal e escapes com barra invertida, nos dois sentidos. Nada é colado no servidor de ninguém.

Última atualização 13 de outubro de 2026

## A resposta curta

Não. Base64 é uma *codificação*: um jeito de escrever qualquer dado usando só sessenta e quatro caracteres inofensivos, para que ele sobreviva à passagem por sistemas feitos para texto puro. Não tem chave, não tem segredo e não tem propriedade de segurança de espécie alguma. Decodificar exige reconhecê-lo, e nada mais — uma pessoa gasta um olhar, um computador um milissegundo.

Mesmo assim a pergunta vale, porque a confusão é universal e às vezes cara. Uma sequência base64 *parece* embaralhada — `cGFzc3dvcmQ=` não diz nada ao olho — e o que parece embaralhado vai parar na gaveta do “seguro”. Produtos de verdade já saíram com senhas “protegidas” assim. A cura é uma distinção aprendida uma vez: **codificação é para máquinas, criptografia é para segredos, hash é para impressões digitais.** Três trabalhos, três ferramentas, e só uma protege alguma coisa.

## Decodificações úteis que não precisam de uma chave secreta

**Inspecionar o texto de uma API.** Escolha decodificar Base64 no [codificador e decodificador](https://abox.tools/pt/codificar-base64/) e compare o UTF-8 resultante com o que a API deveria enviar. Escolha Base64 seguro para URL se usar `-` e `_`. A verificação canônica opcional confere as regras de escrita desta ferramenta; um protocolo pode usar outro preenchimento ou quebra de linhas deliberadamente.

**Encontrar uma codificação incorreta.** Decodifique um parâmetro percentual ou string com escapes para conferir acentos, espaços e pontuação. Escolha o codec dessa camada e codifique novamente para revisar a ida e volta. Não decodifique repetidamente uma URL inteira quando só um parâmetro foi codificado.

A caixa trabalha com texto; não converte arquivos binários arbitrários, não criptografa nem verifica assinaturas JWT. Uma credencial decodificada continua uma credencial. Para incorporar imagens em vez de texto, use [o guia de URI de dados de imagens](https://abox.tools/pt/guias/colocar-uma-imagem-no-css/).

## Codificação: reversível por qualquer um

Uma codificação muda como os dados são *escritos*, nunca o que eles dizem. Anexos de e-mail, imagens embutidas em folhas de estilo, tokens em endereços — em todos esses lugares, bytes arbitrários precisam atravessar canais que só carregam texto com confiança, e base64 é o figurino padrão: entram três bytes, saem quatro caracteres feitos de letras, algarismos e dois sinais, com `=` completando o final. Esse `=` é a marca registrada, e uma vez conhecida você vê base64 em toda parte.

A propriedade que define tudo: a receita é pública e roda igual de trás para frente. Não há nada a saber, então não há nada a não saber. O percent-encoding das URLs (`%20` para um espaço), as entidades HTML (`&amp;`), o hexadecimal e os escapes de barra invertida são a mesma ideia com outra roupa, e o [codificador e decodificador base64](https://abox.tools/pt/codificar-base64/) daqui fala todos eles, nos dois sentidos, no seu próprio computador. Decodificar uma sequência que você achou é exatamente tão legítimo quanto lê-la, porque codificação nunca foi cadeado.

## Criptografia: reversível para quem tem a chave

A criptografia é a que protege conteúdo de verdade. Ela transforma os dados com uma *chave*, e a matemática é arranjada para que desfazer a transformação sem a chave não seja apenas difícil, e sim computacionalmente fora de alcance — enquanto com a chave é instantâneo. O segredo mora inteiro na chave, não no método: os algoritmos são publicados, padronizados, e mais fortes por isso mesmo.

A aparência confunde aqui: bytes criptografados costumam ser codificados em base64 para transporte. Primeiro uma chave os transforma; depois são adaptados ao transporte. São duas camadas distintas. Um JSON Web Token assinado comum tem três partes base64url separadas por pontos; cabeçalho e conteúdo decodificam em JSON legível. Decodificar não valida a assinatura. JWTs também podem ser criptografados ou não protegidos, como explica a [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519). Não deduza confidencialidade ou autenticidade pela aparência nem cole credenciais ativas em um decodificador desconhecido.

## Hash: reversível para ninguém

Um hash roda numa direção só. Passe qualquer quantidade de dados pelo SHA-256 e sai um número de tamanho fixo — o mesmo número toda vez para os mesmos dados, um número completamente diferente para dados que diferem em um bit, e nenhum caminho de volta do número para os dados, para ninguém, com chave ou sem. Não é figurino nem cadeado; é uma *impressão digital*.

É isso que faz dele a ferramenta certa para os dois trabalhos que pertencem a você. Conferir que um arquivo baixado é exatamente o que o editor publicou — comparar impressões, que é o que a ferramenta de [verificar checksum](https://abox.tools/pt/verificar-checksum/) faz no seu computador, com [guia próprio](https://abox.tools/pt/guias/verificar-o-checksum-de-um-download/). E guardar senhas: um serviço bem cuidado guarda só o hash da sua, de modo que nem o banco de dados roubado dele contém a senha. Quando um site consegue mandar por e-mail a senha que você esqueceu, ele te contou que nunca a hasheou — e quando uma config “protege” a sua como `cGFzc3dvcmQ=`, ela te contou que só a codificou.

## Distinguindo os três na prática

Um atalho que funciona para a sequência na sua frente:

- **Decodifica em algo legível?** Era codificação. Letras, algarismos, talvez `+` e `/`, muitas vezes `=` no final — passe por um decodificador e veja.
- **Decodifica em ruído binário?** Então o base64 era só o figurino, e o que está por baixo é criptografado, comprimido, ou nunca foi texto — a codificação não diz nada em nenhum dos casos.
- **Comprimento fixo, caracteres hexadecimais, nunca decodifica?** 64 caracteres hexadecimais é a silhueta do SHA-256; 32 é a do MD5. Hash não decodifica; só bate ou deixa de bater.

E a moral operacional de cada um: nunca confie segredo a codificação; nunca construa criptografia própria quando a sua plataforma já traz; nunca guarde senha como outra coisa que não um hash. A sequência que você decodifica para conferir pode ser, ela mesma, a parte sensível — um token em depuração geralmente é —, e é por isso que o [decodificador daqui](https://abox.tools/pt/codificar-base64/) roda onde o segredo já está, no seu computador, e por isso [o que colar numa ferramenta web realmente faz](https://abox.tools/pt/guias/e-seguro-colar-texto-em-ferramenta-online/) tem página própria.
