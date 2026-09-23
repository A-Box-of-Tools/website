# É seguro colar texto numa ferramenta online?

Colar não parece enviar, e essa é a armadilha: os mesmos bytes saem da sua máquina de todo jeito, se a página os despachar. Isto aqui é sobre o que uma config ou um log colados realmente carregam — e sobre como saber se a ferramenta na sua frente tem sequer para onde mandá-los.

Última atualização 26 de agosto de 2026

## A resposta curta

Colar texto numa página web pode ter exatamente as mesmas consequências de enviar um arquivo para ela. Se não parece, é porque o gesto vem de um lugar seguro: entre duas janelas suas, colar move texto de um lugar que você controla para outro lugar que você controla. Numa página web, o segundo lugar é uma caixa de texto que um script pode ler — e o que acontece em seguida depende inteiramente da página, não do gesto.

Muitas ferramentas em formato de colar fazem o trabalho num servidor: a página despacha o seu texto, o servidor formata, valida ou compara, e o resultado volta. Nada na tela diz qual das duas espécies você está usando. A caixa de texto é igual nos dois casos; o botão de “Formatar” também. A diferença é uma requisição de rede, invisível a menos que você a procure.

## O que um colar realmente carrega

O que acaba nas ferramentas online raramente é prosa. É o texto de trabalho do ofício de alguém, e o gênero importa, porque algumas das sequências mais sensíveis da computação são exatamente as que se colam em formatadores à meia-noite:

- **Arquivos de configuração** existem para guardar o que um programa não deve trazer escrito dentro de si, e essas coisas são senhas de banco de dados, chaves de API e segredos de assinatura. Uma config colada inteira carrega todos eles.
- **Logs e stack traces** carregam tokens de sessão em URLs, endereços de e-mail, nomes de máquinas internas e, de vez em quando, o corpo de uma requisição com os dados pessoais de alguém dentro.
- **Respostas de API** são instantâneos de dados de produção — clientes reais, saldos reais — colados em algum lugar cômodo para serem lidos.
- **Qualquer coisa com cara de base64** que vai parar num decodificador foi codificada, em geral, porque importava: um token sendo depurado, um certificado, um cabeçalho de autenticação.

Uma chave que transitou pelo servidor de um estranho tem de ser tratada como exposta no momento em que você percebe: revogada e reemitida, o que num sistema em produção é uma tarde que ninguém planejou. A questão não é que sites de formatação colham credenciais. É que você não tem como saber o que um servidor registra, e um segredo cuja exposição você não consegue descartar é um segredo que você precisa trocar.

## Por que a ferramenta não precisa que o texto saia

Eis o fato técnico que resolve a pergunta: formatar, validar, converter e comparar texto estão entre os trabalhos mais fáceis da computação. Analisar JSON, indentar XML, comparar dois arquivos, codificar base64 — um navegador faz isso em milissegundos, em local, e consegue há anos. Um servidor não acrescenta nada ao trabalho. Quando uma ferramenta de colar envia o seu texto, isso é sobra de arquitetura ou comodidade do operador, nunca necessidade do trabalho.

É disso que as ferramentas de texto deste site são o contraexemplo. O [formatador de JSON](https://abox.tools/pt/formatar-json/) analisa, formata e converte JSON, XML, HTML, CSS e YAML; o [comparador de textos](https://abox.tools/pt/comparar-textos/) marca cada diferença entre dois textos, linha a linha e palavra a palavra; o [codificador e decodificador base64](https://abox.tools/pt/codificar-base64/) vai nas duas direções entre um texto e as suas codificações. Os três rodam na sua máquina, e o que você cola não tem para onde ir: estas páginas não carregam caminho de código nenhum que pudesse despachá-lo.

Dois deles já têm guia próprio: [formatar JSON sem enviá-lo](https://abox.tools/pt/guias/formatar-json/) e [comparar dois arquivos JSON](https://abox.tools/pt/guias/comparar-dois-arquivos-json/).

## Como saber qual das duas espécies você usa

As verificações são as mesmas de uma ferramenta de arquivos, e estão escritas por inteiro no [guia sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/). A versão curta, em chave de colar:

- **Puxe o cabo.** Carregue a página, desconecte, cole, aperte o botão. Uma ferramenta local continua; uma de servidor para. Trinta segundos, nenhuma perícia, impossível de forjar.
- **Olhe a aba de Rede enquanto aperta Formatar.** Uma requisição que sai naquele momento, mais ou menos do tamanho do que você colou, é o que você colou saindo. Sem requisição, sem envio.
- **Desconfie dos extras prestativos.** Um botão de “compartilhar este trecho”, um histórico dos seus colares sincronizado entre aparelhos, um link para mandar a um colega — cada um só é possível se o texto foi guardado num servidor. Funcionalidades são confissões: uma página que consegue mostrar o seu colar a outra pessoa ficou com ele.

E um hábito vale mais que as três verificações: colar menos. Um validador não precisa da senha verdadeira para validar a forma de uma config — `"REDACTED"` é analisado exatamente igual. E para o colar que é ele próprio o segredo, a regra encolhe para algo ainda mais simples: a única página que deveria receber uma senha, algum dia, é a página de login a que ela pertence.
