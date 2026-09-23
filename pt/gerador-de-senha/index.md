# Senha e frase secreta — forte e aleatória, gerada no seu navegador

Gerada aqui, pelo seu próprio navegador, e não enviada para lugar nenhum. Nada é guardado e não existe histórico.

> Gere uma senha aleatória forte, ou uma frase secreta diceware a partir de uma lista de 7.776 palavras que vem junto com a página. Sorteada pelo gerador criptográfico do seu navegador, não vai para lugar nenhum e não fica guardada. De graça, sem cadastro.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/gerador-de-senha/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem senhas e frases secretas. Não existe servidor.

Cada caractere vem de `crypto.getRandomValues`, o gerador criptográfico do próprio navegador, e cada palavra vem de uma lista que fica nesta pasta como `src/wordlist.js`. Não existe um `fetch`, um `XMLHttpRequest` nem um `sendBeacon` em lugar nenhum de `src/`, então não há caminho pelo qual uma senha gerada aqui possa chegar até nós nem até ninguém. Também não se guarda nada, e por isso recarregar esta página destrói todas as senhas que ela já mostrou para você.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Nada é guardado
- ✓ Funciona offline
- ✓ Código aberto

## Como gerar uma senha forte sem que nenhum site veja ela

1. **Escolha senha ou frase secreta.** Uma senha é uma sequência de caracteres aleatórios: curta de guardar, chata de digitar, e exatamente o que serve para as centenas de contas que o seu gerenciador de senhas preenche por você. Uma frase secreta são palavras sorteadas de uma lista: mais longa, mas possível de lembrar e de falar em voz alta, que é do que você precisa para os poucos segredos que tem que digitar de cabeça, como o do próprio gerenciador, o do notebook e o código de recuperação do celular.
2. **Ajuste o comprimento, ou o número de palavras.** Este é o ajuste que importa, e os outros em geral não. Vinte caracteres, ou seis palavras, é um piso razoável para qualquer coisa que valha a pena proteger; suba dali para a conta que permitiria redefinir todas as outras. A leitura de baixo se mexe enquanto você arrasta, então dá para ver o que cada caractere a mais rende.
3. **Ligue as regras em que o formulário vai insistir.** “Pelo menos um de cada conjunto”, um dígito no fim, um símbolo da lista curta que todo site aceita. Nada disso deixa nada mais forte, e o primeiro deixa um pouco mais fraco, o que a página já subtraiu. Mas é assim que se passa por um formulário de cadastro sem gerar seis senhas seguidas.
4. **Leia o número, não a cor.** Os bits são contados a partir dos ajustes que produziram a cadeia: o tamanho do alfabeto, o número de sorteios, e mais nada. Isso é uma medida de verdade, ao contrário do medidor de uma página de cadastro, que só consegue dar nota aos caracteres que tem na frente e não tem como saber se foi você ou um gerador que escolheu.
5. **Copie e guarde em algum lugar antes de sair.** Aqui não existe histórico nem jeito de pedir de volta; recarregar a página destrói a senha. Cole primeiro no gerenciador de senhas e só depois no formulário de cadastro, para que quem precisa lembrar dela já esteja com ela antes que algo dê errado.
6. **Leve um lote, se precisar.** O controle lá embaixo gera até cem de uma vez e salva como arquivo de texto simples, escrito por esta página a partir do que já está na sua tela. Serve para abrir contas em série ou distribuir acessos iniciais, e vale apagar o arquivo assim que elas estiverem em um lugar melhor: um arquivo cheio de senhas no disco continua sendo um arquivo cheio de senhas.

## Também na caixa

- [Formatador de JSON](https://abox.tools/pt/formatar-json/): JSON, XML, HTML, CSS e YAML, formatados ou convertidos. Nada é colado no servidor de ninguém.
- [Conversor de YAML para JSON](https://abox.tools/pt/converter-yaml-para-json/): Os dois sentidos, e ele diz o que cada um custa. Nada disso é colado no servidor de outra pessoa.
- [Formatador de XML](https://abox.tools/pt/formatar-xml/): XML organizado para ler ou espremido para publicar, e convertido em JSON nos dois sentidos. Nada disso é colado no servidor de outra pessoa.
- [Comparador de textos](https://abox.tools/pt/comparar-textos/): Dois textos entram, cada diferença sai marcada, linha a linha e palavra por palavra. Nada é colado no servidor de ninguém.

## Perguntas

### As senhas são enviadas para algum lugar ou ficam guardadas?

Nem uma coisa nem outra. Elas nascem no seu navegador, no seu próprio equipamento, e esta ferramenta não tem nenhuma função de rede: nunca busca nada e nunca envia nada. Também não se escreve nada no armazenamento: nada de localStorage, nada de cookie, nada de histórico. Recarregue a página e todas as senhas que ela mostrou somem, da tela e da memória dela. A `Content-Security-Policy` da página lista cada endereço que ela pode contatar e nenhum é nosso, então não existe onde uma senha pudesse ser coletada nem se algo tentasse.

### De onde vem o acaso?

De `crypto.getRandomValues`, o gerador que os navegadores oferecem para uso criptográfico, alimentado e realimentado pela reserva de entropia do seu sistema operacional. É a mesma fonte de onde o navegador tira o material de chaves do TLS. `Math.random` não é usado em lugar nenhum desta ferramenta, e essa distinção não é implicância: `Math.random` é um gerador aritmético rápido cujo estado interno inteiro se reconstrói a partir de umas poucas saídas seguidas, de modo que um gerador de senhas construído em cima dele produz senhas que parecem aleatórias e que qualquer um que tenha visto uma delas consegue enumerar.

### Uma senha gerada em um navegador é tão boa quanto uma de um programa instalado?

Quanto ao acaso, é: é a mesma fonte do sistema operacional nos dois casos, alcançada por uma porta diferente. O que muda é o que mais existe na sala. Uma aba do navegador convive com as suas extensões, e uma extensão com permissão para ler páginas consegue ler esta também. Isso vale para qualquer gerador na web, inclusive este, e é a razão honesta para usar o gerador embutido do seu gerenciador de senhas quando você tem um: é a mesma aritmética, em um processo com menos coisa em volta. Esta página é para quando você não tem um à mão.

### Senha ou frase secreta, qual usar?

Uma senha para tudo o que um gerenciador digita por você, porque você nunca vai olhar para ela e comprimento ali não custa nada. Uma frase secreta para as poucas coisas que você precisa digitar de cabeça ou ditar em voz alta: a senha mestra do gerenciador, a chave de criptografia do disco, um aparelho que você configura de longe. Seis palavras da lista longa são 77 bits, mais forte do que uma senha aleatória de doze caracteres e muito mais fácil de acertar às quatro da manhã.

### Qual deve ser o comprimento de uma senha?

Vinte caracteres do alfabeto inteiro dão cerca de 130 bits, bem além do ponto em que o comprimento deixa de ser o problema. Dezesseis já está ótimo. Doze é o piso para qualquer coisa cuja perda incomodaria, e é o piso, não a meta. Abaixo disso você está apostando que o site guardou a senha direito, aposta que vinte anos de avisos de vazamento desaconselham. O comprimento ganha de qualquer outro ajuste desta página: um caractere a mais rende mais do que qualquer regra sobre quais caracteres precisam aparecer.

### De quantas palavras deve ser uma frase secreta?

Seis da lista longa, e sete se ela protege outras senhas. A famosa imagem de quatro palavras é de 2011, vale 51 bits e hoje está ao alcance de um ataque offline sério. Cinco dão 64. Seis dão 77, além do que um atacante vai gastar em uma conta comum. Cada palavra a mais da lista longa soma 12,9 bits, e as palavras são a única coisa que soma: os hifens e as maiúsculas não.

### O que é um “bit”, e por que esta página conta os bits?

Um bit é uma duplicação. Sessenta bits quer dizer que havia 2^60 resultados igualmente prováveis que esta página poderia ter produzido, então quem sabe exatamente como ela funciona ainda tem essa quantidade para testar. É uma propriedade do *processo*, não da cadeia de caracteres: a página consegue dar o número exato porque foi ela quem escolheu e sabe quantas escolhas fez. É essa a diferença para a barrinha colorida de um formulário de cadastro, que lê os caracteres e chuta. Naquela barra, `correct horse battery staple` tira nota baixa e vale 44 bits, e `P@ssw0rd!` tira nota alta e não vale quase nada.

### Por que “precisa conter um símbolo” enfraquece a senha?

Porque uma regra só consegue tirar possibilidades. Exigir pelo menos um caractere de cada conjunto descarta todas as senhas em que não caiu nenhum, e um conjunto menor de senhas possíveis é um conjunto menor para percorrer. O efeito é pequeno, cerca de meio bit num comprimento comum, e é real, e esta página subtrai ele em vez de citar o número que a favorece. Ele é calculado exato, contando as senhas que a regra de fato permite, e não as que ela descarta.

### Que lista de palavras é essa, e faz diferença um atacante poder baixar ela?

São as listas diceware da Electronic Frontier Foundation, incluídas sem alteração: 7.776 palavras na longa e 1.296 na curta. Elas foram montadas exatamente para isso: nada ofensivo, sem homófonos, sem pares que grudados formem uma terceira palavra, e na lista curta nenhuma palavra que seja o começo de outra. E não, não faz diferença a lista ser pública: a força indicada aqui já assume que o atacante tem a lista, está lendo o código desta página e conhece todos os ajustes que você usou. A única coisa que ele não sabe é qual das 7.776 saiu de cada vez. É justamente essa suposição que torna o número confiável.

### Uma frase secreta não é um ataque de dicionário esperando para acontecer?

Não quando as palavras são escolhidas assim. Um ataque de dicionário funciona contra frases que uma *pessoa* inventa, porque pessoas escolhem palavras que combinam, numa ordem que faz sentido, entre as poucas milhares que usam todo dia. Esta página escolhe cada palavra de forma independente e uniforme a partir de uma lista fixa, sem se importar se o resultado soa bem, que é justamente por que ele quase nunca soa bem. Um atacante que conheça a lista e o número de palavras continua tendo pela frente 7.776 elevado a esse número.

### Consigo recuperar uma senha depois de sair da página?

Não, e é de propósito. Nada é anotado em lugar nenhum, então não há o que recuperar: nenhum painel de histórico, nenhuma lista de “geradas recentemente”, nenhum cache. Um gerador capaz de mostrar a senha da terça passada seria um gerador que a guardou, e guardada onde você alcança é guardada onde outra coisa alcança. Copie para um gerenciador de senhas antes de sair.

### É seguro copiar para a área de transferência?

É o risco de sempre, e vale mais conhecer do que se preocupar. A área de transferência é compartilhada com tudo que roda no seu usuário, costuma durar até a próxima cópia, e em algumas configurações é sincronizada entre aparelhos. Isso é um bom motivo para colar logo onde a senha vai e copiar outra coisa depois, e não é motivo para digitar à mão uma senha mais fraca. Esta página não consegue ler a sua área de transferência: ela só consegue escrever nela, e só quando você aperta o botão.

### Posso usar a mesma senha em mais de um lugar?

Não, e este é o único conselho desta página que vale mais do que todos os outros. Quase toda conta invadida é invadida com uma senha que antes estava certa em outro lugar: um site vaza, a lista é publicada, e o mesmo e-mail com a mesma senha é testado em tudo. Uma senha diferente por site transforma um vazamento em uma conta em vez de todas, e é esse o motivo para manter um gerenciador de senhas, não a força de nenhuma senha específica guardada nele.

### É de graça, e preciso de uma conta?

É de graça, não tem conta, não tem login, não tem período de teste e não tem limite de quantas você gera. O site tem publicidade, que é o que paga por ele; aos anúncios não é entregue absolutamente nada sobre o que esta página gera, nem o comprimento nem a força.

### Funciona offline?

Funciona. Carregue a página uma vez, desconecte da internet e ela continua gerando senhas. O acaso vem do seu próprio equipamento e a lista de palavras já está na página. Essa é também a forma mais simples de provar que nada é buscado nem enviado: um gerador que pedisse os números a um servidor pararia no instante em que você tirasse o cabo.

## Como dá para conferir a promessa de privacidade

- **A senha nasce onde você está lendo isto.** Ela é sorteada nesta página, por esta página, a partir do acaso que o seu próprio sistema operacional entrega ao navegador. Nada é pedido para produzi-la e nada é informado depois que ela existe. A `Content-Security-Policy` lista todos os endereços que esta página pode contatar e nenhum deles é nosso: não existe aqui um ponto de coleta onde uma senha gerada pudesse parar, nem nada no código que a mandaria para lá se existisse.
- **Nada aqui busca nada.** Não existe um `fetch`, um `XMLHttpRequest` nem um `sendBeacon` em lugar nenhum de `src/`. A lista de palavras não é baixada: ela é `src/wordlist.js`, servida desta mesma origem junto com o resto da página, e você pode ler.
- **O acaso é o do navegador, e é o tipo certo.** `crypto.getRandomValues` é o gerador que os navegadores oferecem para chaves e tokens, alimentado e realimentado pelo sistema operacional. `Math.random` não aparece em lugar nenhum desta pasta, e seria um defeito de verdade se aparecesse: o estado interno dele se reconstrói a partir de um punhado de saídas, o que torna calculável cada senha que ele vai produzir para qualquer um que tenha visto uma delas.
- **Nada é guardado, então não há histórico para apagar.** Nada de localStorage, nada de sessionStorage, nenhum cookie, nenhum parâmetro na URL e nenhum `<input>` que o navegador se ofereça para lembrar. O que está na tela vive em um único array na memória desta página, e fechar a aba já é toda a limpeza. As únicas cópias do que nasce aqui são as que você leva.
- **O que o Google carrega, e o que não é entregue a ele.** Os scripts de anúncio e de medição são do Google, e o botão de doação é do Buy Me a Coffee. Nenhum deles recebe um caractere do que esta página gera, nem o comprimento, nem a força, nem com quais ajustes ela saiu. Toda linha que sorteia um caractere ou uma palavra é servida desta origem e está no repositório.
- **Funciona offline.** Desconecte da rede e a ferramenta continua a mesma, porque nunca houve uma etapa de rede dentro dela. É a prova mais simples de todas: um gerador que pedisse o acaso a um servidor pararia no instante em que você tirasse o cabo.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/random.js` para as quarenta linhas que ficam entre esta página e cada senha que ela gera, que têm uma única entrada e essa entrada é o gerador do navegador; `src/generate.js` para ver como os ajustes viram uma cadeia de caracteres; e `src/strength.js` para a aritmética por trás do número, que conta em vez de chutar.
