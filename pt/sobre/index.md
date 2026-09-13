# Sobre o abox.tools

Uma pessoa só, em Ontário, construindo as ferramentas de que vivia precisando e nas quais não confiava. Tudo aqui roda no seu próprio computador, o código é público, e esta página reúne os motivos das duas coisas.

Última atualização 27 de agosto de 2026

## O que é isto

O abox.tools é um conjunto de ferramentas pequenas que fazem uma coisa cada uma: redimensionar uma foto, cortar um vídeo, juntar dois PDFs, ler o que um código QR realmente contém. São 44 no momento, e junto delas há uma [coleção de guias](https://abox.tools/pt/guias/) sobre as tarefas para as quais elas servem.

O incomum não é o que elas fazem, e sim onde fazem. Todas rodam inteiramente dentro do navegador, no computador de quem está usando, com os decodificadores e codificadores que o navegador já traz. Nada do que você abre é transmitido para lugar nenhum. Também não existe servidor atrás destas páginas para receber: o site inteiro são arquivos estáticos, e as ferramentas são módulos JavaScript comuns servidos ao lado deles.

Esse é o produto. Todo o resto desta página explica por que vale a pena construir assim, e quem está construindo.

## Quem faz

Uma pessoa, sozinha, em Ontário, no Canadá. Isto não é uma empresa. Não há equipe, não há investidor, não há uma matriz por trás e não há plano de ser comprado por ninguém. A correspondência chega em [hi@abox.tools](mailto:hi@abox.tools) e é lida por quem escreveu o código; a [página de contato](https://abox.tools/pt/contato/) explica para o que esse endereço serve e para o que não serve.

O site é publicado de propósito sem assinatura pessoal. É um projeto pequeno, não uma marca pessoal, e o que merece confiança aqui não é um nome no rodapé de uma página, e sim [o código](https://github.com/A-Box-of-Tools/website), que qualquer um pode ler, e o comportamento das próprias páginas, que qualquer um confere em uns trinta segundos com as ferramentas de desenvolvedor abertas. Essas duas coisas se verificam. Uma assinatura, não.

## Por que é feito assim

O jeito comum de construir estas ferramentas é enviar o arquivo, fazer o trabalho num servidor e devolver o resultado. É mais fácil, funciona em qualquer aparelho, e é o que faz quase todo “conversor online grátis”.

Também significa entregar seu arquivo a um estranho. Para um meme, tanto faz. Para o escaneamento de um passaporte, uma imagem médica, um contrato assinado ou uma foto com o seu endereço nos metadados, não. Depois que o arquivo está no computador de outra pessoa, o que acontece com ele depende das políticas e do cuidado dela, e você não tem como auditar nem uma coisa nem outra. A política de privacidade de um site desses é uma promessa, não uma trava.

Os navegadores ficaram bons o bastante para tornar essa promessa desnecessária. Eles leem e escrevem JPEG, PNG e WebP; abrem e decodificam vídeo; calculam o hash de um arquivo, leem um código QR e escrevem um PDF. Se o trabalho pode acontecer no seu próprio computador, então “será que eles ficam com o meu arquivo?” deixa de ser uma pergunta sobre a intenção de alguém e passa a ser uma pergunta sobre o que o código consegue fazer fisicamente. E essa você mesmo responde.

É esse o argumento inteiro, e há um guia que o desenvolve direito: [é seguro enviar arquivos para um site?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/)

## Conferir, em vez de confiar

Tudo o que está acima existe para ser testado. Quatro maneiras, da menos para a mais trabalhosa:

- **Desligue a internet.** Carregue a página de qualquer ferramenta, desconecte e use assim mesmo. Ela continua funcionando, porque nunca houve etapa de rede ali dentro. Uma ferramenta que mandasse o seu arquivo para fora para processar iria parar.
- **Observe a rede.** Abra as ferramentas de desenvolvedor, vá até a aba Rede e processe um arquivo. Nenhuma requisição carrega o seu arquivo, uma miniatura dele, o nome dele nem um byte do conteúdo. O que aparece é a página, os scripts dela, os anúncios e o contador de visitas.
- **Leia a regra que a página impõe a si mesma.** Cada página traz uma `Content-Security-Policy` que nomeia todos os endereços com os quais ela pode falar, e nenhum deles pertence a este site. Nem mesmo um erro no código conseguiria mandar um arquivo para algum lugar, porque o navegador recusaria a conexão.
- **Leia o código.** Ele é [todo público](https://github.com/A-Box-of-Tools/website), sem etapa de compilação e sem empacotador: o que está no repositório é byte a byte o que o seu navegador executa. Cada ferramenta tem um README explicando como funciona, e cada página indica quais arquivos vale a pena ler primeiro.

Existe exatamente uma exceção proposital ao “sem rede”, e ela está explicada com calma na própria página: [Compartilhar texto](https://abox.tools/pt/compartilhar-texto/) leva texto de um aparelho seu para outro, e isso não dá para fazer sem rede. Ele abre uma única conexão com um intermediário que não guarda nada e ao qual só se diz que dois navegadores querem ser apresentados.

## Como as ferramentas são feitas e conferidas

Uma ferramenta entra no ar quando funciona com arquivos de verdade, não quando funciona com o arquivo contra o qual foi escrita. Na prática, isso quer dizer usá-la na mão, num navegador, com entradas difíceis: o vídeo sem quadro-chave exatamente onde você quer cortar, o HEIC de um celular que escreve o contêiner meio errado, o PDF com uma fonte embutida pela metade. É isso que as pessoas têm de verdade, e é justamente o que um teste escrito pela mesma pessoa que escreveu o defeito não encontra.

Abaixo disso há um conjunto de testes automáticos cobrindo as duas metades: o gerador que constrói o site e os módulos que o navegador executa. Ele roda a cada mudança, e nada é publicado depois de uma falha. Onde o mesmo trabalho aparece em mais de uma ferramenta, e várias delas leem arquivos MP4, um teste confere se as cópias ainda combinam, de modo que consertar uma não deixe as outras erradas em silêncio.

Os guias seguem o mesmo critério. As capturas de tela deles são tiradas do site já construído por um script, em vez de desenhadas ou simuladas, então uma imagem em um guia é uma imagem da página como ela realmente está hoje.

## Como isto se paga

Com publicidade e com doações de quem acha as ferramentas úteis. É esse o modelo de negócio inteiro, e vale ser preciso sobre o que ele envolve e o que não envolve.

**Não há nada para comprar.** Sem conta, sem cadastro, sem plano gratuito com um pago em cima, sem marca d’água para remover, sem limite de tamanho, sem limite diário e sem função guardada. O que está no site é tudo.

**Seus arquivos não fazem parte do acordo.** A publicidade é do Google e a contagem de visitas é o Google Analytics, e nenhum dos dois fica sabendo o que você abre, o que você produz, como se chamava ou o tamanho que tinha, porque nenhum dos dois scripts recebe isso, e a política de segurança da página recusaria o envio se um deles tentasse. O que esses dois de fato coletam, e como desligar cada um, está na [página de privacidade](https://abox.tools/pt/privacidade/). Todas as ferramentas continuam funcionando com os dois bloqueados.

**As ferramentas não são escritas para a publicidade.** Nenhuma ferramenta aqui existe porque uma palavra-chave valia dinheiro, e nenhuma foi deixada mais lenta, mais trabalhosa ou mais dividida em páginas para vender mais exibições. O que se constrói em seguida é discutido à vista de todos, em [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), um parágrafo por ideia, incluídos os motivos pelos quais várias sugestões aparentemente óbvias foram recusadas.

## Idiomas

O site é publicado em quinze idiomas. Cada um é uma tradução de verdade, e não uma passada de máquina deixada onde caiu: os nomes das ferramentas, as explicações, os guias e os próprios endereços estão traduzidos, e uma página só aparece listada em um idioma depois que esse idioma foi realmente escrito. Um idioma ainda em andamento continua legível, mas fica fora do sitemap e do seletor de idiomas, para que ninguém seja convidado a uma página meio em inglês.

A correspondência é respondida em inglês, que é a única coisa honesta a dizer sobre um projeto deste tamanho.

## O que este site não vai fazer

- Pedir que você crie uma conta, nem pedir seu e-mail.
- Enviar, guardar, inspecionar ou reter um arquivo que você abrir aqui.
- Colocar marca d’água em um resultado, nem guardar uma função para um plano pago.
- Acrescentar uma etapa de rede a uma ferramenta que não precisa dela.
- Afirmar na página de uma ferramenta algo que o código do repositório não faz.

Se você vir qualquer uma dessas coisas acontecendo, é ao mesmo tempo um defeito e uma promessa quebrada, e vale avisar. A [página de contato](https://abox.tools/pt/contato/) é o caminho mais rápido.
