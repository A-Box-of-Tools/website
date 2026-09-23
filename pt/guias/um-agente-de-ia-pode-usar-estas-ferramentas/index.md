# Um agente de IA pode usar estas ferramentas?

Sim. São páginas web comuns, sem contas, sem captchas e com todos os controles rotulados, e um agente as opera como opera todo o resto. A pergunta que merece uma página é a de trás: quando você entrega uma tarefa com arquivos a um agente, para onde vai o arquivo? A resposta depende inteiramente de onde roda o navegador do agente.

Última atualização 6 de setembro de 2026

## A resposta curta

Sim. Cada ferramenta daqui é uma página web comum: um seletor de arquivos, alguns controles rotulados, um botão de download. Não há conta para entrar, nem captcha para resolver, nem passo algum que exija um humano em particular. Um agente de IA com um navegador opera estas páginas do jeito que opera qualquer outra — e várias coisas que este site já faz pelas pessoas acabam servindo aos agentes de graça; a última seção faz a lista.

Mas “ele consegue apertar os botões?” é a pergunta pequena. A que merece uma página é o que acontece com a promessa deste site — *seu arquivo nunca sai da sua máquina* — quando a máquina apertando os botões não é você. A resposta é que a promessa sobrevive à delegação por completo, ou não sobrevive nada, dependendo de uma única coisa: **onde roda o navegador do agente.**

## Dois tipos de agente, uma distinção

Agentes que usam ferramentas vêm em duas formas, e a diferença entre elas pesa mais do que todo o resto desta página.

**Um agente local** roda na sua máquina: um assistente instalado no seu computador, ou um que dirige o navegador que você tem diante dos olhos. Quando um agente assim abre aqui uma ferramenta e entrega a ela o seu arquivo, o trabalho acontece onde sempre acontece com estas páginas — num navegador, sobre o seu hardware. O arquivo é lido do seu disco, processado na memória do seu navegador e gravado de volta no seu disco. A delegação não mudou nada no caminho dos bytes. Uma IA escolheu os ajustes; o arquivo continuou sem sair.

**Um agente na nuvem** roda um navegador no computador do fornecedor dele. Você anexa um arquivo a um chat, o agente trabalha numa máquina virtual em outro lugar, e o que quer que ele faça com estas ferramentas acontece lá. As ferramentas continuam cumprindo exatamente o prometido — o arquivo não vai além do navegador em que está —, mas aquele navegador não é o seu, e o envio já aconteceu no momento em que você anexou o arquivo, antes de qualquer ferramenta ser aberta. Nenhuma página consegue desfazer um envio que veio antes dela.

Então a pergunta que este site não para de fazer — este trabalho precisa que o meu arquivo saia? — não desaparece quando quem faz o trabalho é um agente. Ela só recua um passo, para a escolha do agente. Um agente local dirigindo uma ferramenta que vive inteira no navegador é o arranjo raro em que delegar não custa privacidade nenhuma: a IA faz o trabalho, e o arquivo fica em casa.

## Como entregar uma tarefa a um agente

Agentes rendem melhor com o mesmo briefing que um colega pediria: a ferramenta, o arquivo e a cara que o trabalho pronto tem. Alguns padrões que funcionam:

- **Nomeie o resultado, não só a ferramenta.** “Abra abox.tools/comprimir-imagem/ e deixe esta foto abaixo de 200 KB” dá ao agente o número que a página vai pedir. O [compressor de imagens](https://abox.tools/pt/comprimir-imagem/) aceita um tamanho-alvo pelo nome — exatamente o tipo de instrução que um agente carrega com fidelidade.
- **Mostre o mapa a ele.** Este site publica o [llms.txt](https://abox.tools/llms.txt): cada ferramenta e cada guia, com uma linha de descrição cada, em texto puro e numa única busca. Um agente que o lê sabe o que existe aqui sem vasculhar nada. E cada página tem um gêmeo no seu próprio endereço com `index.md` no fim: a página em Markdown, sem a interface em volta, para um agente que quer o que a página de uma ferramenta diz, e não a aparência dela.
- **Deixe-o ler a página em que está.** Cada ferramenta carrega suas perguntas e respostas na própria página, e cada ferramenta tem um guia a um link de distância. A um agente que pareça em dúvida com um ajuste dá para dizer que leia o guia primeiro — o mesmo conselho que uma pessoa receberia.
- **Correntes funcionam.** Os trabalhos que os guias de encadeamento deste site descrevem para pessoas — escanear e depois juntar num [PDF](https://abox.tools/pt/imagens-para-pdf/); tirar os dados [EXIF](https://abox.tools/pt/remover-dados-exif/) e depois redimensionar — são os trabalhos em que agentes se saem melhor, porque a saída de cada passo é a entrada do seguinte e nada no meio pede julgamento.

## O que não delegar

Um agente pode operar todas as ferramentas daqui. Há dois lugares em que operar não é o trabalho inteiro, e o resto deveria ficar com você.

**Decidir o que não pode ser visto.** As ferramentas de tarja apagam o que você cobre — mas escolher o que cobrir *é* o trabalho, e um agente que deixa passar uma linha produziu um arquivo que parece pronto e não está. Deixe um agente operar a tarja se quiser; olhe você mesmo o resultado antes de ele ir a qualquer lugar, a mesma regra que os guias dessas ferramentas dão a um operador humano.

**Abrir o que foi lido.** O leitor de QR code deste site se recusa a abrir o que decodifica, porque ler e seguir são atos diferentes. A mesma separação vale a pena impor a um agente: um agente que lê um código, um link ou um endereço num arquivo deve relatá-lo, não visitá-lo. E um agente que dirige o seu próprio navegador está com as mãos em tudo aquilo em que esse navegador está logado — uma razão para olhá-lo com o mesmo olhar crítico que qualquer ferramenta, que é o assunto da próxima seção.

## Um agente também pode conferir a promessa

As quatro verificações que o guia sobre [enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) ensina — puxar o cabo, olhar a aba Rede, ler a Content-Security-Policy, ler o código — um agente consegue executar todas, e elas são até mais fáceis para ele do que para uma pessoa: ler um cabeçalho CSP ou procurar chamadas a `fetch` no código servido é trabalho mecânico. Se você usa um agente para examinar ferramentas antes de confiar nelas, este site espera ser examinado do mesmo jeito — e o comportamento offline em que essas verificações se apoiam tem [uma página própria](https://abox.tools/pt/guias/como-uma-pagina-web-funciona-offline/).

O que este site faz por um agente, faz de propósito e para todo mundo: cada controle tem rótulo, porque leitores de tela precisam de nomes e um agente lê esses mesmos nomes; as páginas não têm contas, nem janelas saltando, nem muros de consentimento para contornar; o código-fonte é público e servido sem etapa de build, então o código que um agente audita é o código que roda; e o [llms.txt](https://abox.tools/llms.txt) é a caixa inteira numa única busca. Nada disso foi acrescentado para máquinas. Uma página legível para uma pessoa com leitor de tela se revela legível para todo o resto também.

Um limite honesto: esta página é sobre agentes usando estas ferramentas, não sobre os agentes em si. O que o fornecedor de um agente vê — suas instruções, suas capturas de tela, às vezes seus arquivos — é uma pergunta à parte, e o hábito a que este grupo de guias sempre chega é a lente certa para ela também: pergunte-se o que realmente precisa sair da sua máquina, e em que estado.
