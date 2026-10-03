# Privacidade e cookies

A versão curta: seus arquivos nunca são enviados, porque não existe lugar nenhum para enviá-los. Todo o resto desta página trata da publicidade, do contador de visitas e da hospedagem, que são as partes em que outras empresas realmente entram.

Última atualização 3 de setembro de 2026

## Seus arquivos

Toda ferramenta deste site faz o trabalho dela dentro do seu próprio navegador, no seu próprio hardware. Quando você escolhe um arquivo, quem o lê é a página que você já tem aberta. Ele não é enviado para nós, porque não existe servidor nosso para onde ele pudesse ir: este site é um conjunto de arquivos estáticos, sem backend, sem banco de dados e sem armazenamento.

Isso quer dizer que nunca recebemos, vemos, guardamos, registramos nem processamos:

- seus arquivos, inteiros ou em partes
- miniaturas ou pré-visualizações deles
- os nomes, os tamanhos, as dimensões ou os formatos
- quantos você escolheu, ou o que você fez com eles
- nada lido de dentro deles, inclusive dados EXIF e de GPS

Isto não é uma promessa sobre as nossas intenções. Cada página carrega uma `Content-Security-Policy` que lista todos os endereços que a página tem permissão de acessar, e quem faz valer a regra é o navegador. Nenhum desses endereços é nosso. Você pode ler a política no alto do código-fonte de qualquer página, ou abrir a aba “Rede” do seu navegador e observar: nenhuma requisição leva o seu arquivo.

Os arquivos que você produz com uma ferramenta são entregues ao mecanismo de download do próprio navegador e salvos onde você mandar. Nessa etapa também não entramos.

## A única exceção, e onde ela vale

A ferramenta [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/) tem uma função de “adicionar a partir de um endereço da web”. Se você colar um endereço nela, o seu navegador vai buscar aquela imagem no servidor que você indicou, e **esse servidor enxerga o seu endereço IP** e qual arquivo você pediu. Isso é inevitável, e é a natureza inteira da função.

Só acontece com endereços que você mesmo digita, foi construída de modo que imagens possam entrar mas nenhum dado possa sair, e a página daquela ferramenta explica isso com mais detalhes. Nenhuma outra ferramenta deste site consegue fazer uma requisição para fora levando algo seu dentro.

## O que é coletado, e por quem

Este site é gratuito e se paga com publicidade. Isso significa que dois produtos do Google rodam nestas páginas, e um botão de doação roda na maioria delas. A lista completa é esta.

### Google AdSense — os anúncios

O Google exibe os anúncios e decide quais você vê. Para isso ele pode gravar e ler cookies ou identificadores parecidos no seu navegador, e recebe o seu endereço IP, uma localização aproximada derivada dele, o seu agente de usuário e em qual página você estava. Dependendo das suas configurações e de onde você está, os anúncios podem ser personalizados usando um perfil que o Google mantém sobre você, montado em boa parte a partir da sua atividade em outros sites.

Nada disso chega até nós, não conseguimos ver, e nunca mandamos ao Google coisa alguma sobre os seus arquivos. A explicação do próprio Google sobre como ele usa dados de sites que exibem seus anúncios está em [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — o contador de visitas

Usamos o Google Analytics 4 para contar visitas às páginas, para saber em quais ferramentas vale a pena trabalhar. Ele registra a página que você viu, mais ou menos quando, um identificador gerado aleatoriamente e guardado no seu navegador, uma localização aproximada, o tipo do seu aparelho e do seu navegador, e o site que trouxe você até aqui.

Ele está configurado para não fazer mais nada, e a configuração é um arquivo que você pode ler: o `analytics.js` ao lado de cada página monta um contador de visualizações e não contém evento personalizado nenhum. Nada neste site passa a ele um arquivo, um nome de arquivo, uma dimensão ou uma contagem, porque não existe aqui código que pudesse fazer isso.

### Buy Me a Coffee — o botão de doação

A página inicial e as páginas das ferramentas trazem um botão de doação, que é carregado dos servidores do Buy Me a Coffee. Carregá-lo faz com que a CDN deles veja o seu endereço IP e saiba que você estava neste site, e as letras do botão vêm do Google Fonts, que também vê o seu endereço IP. Nada mais é enviado, e nada além disso acontece a menos que você efetivamente clique, e aí você já está no site deles, sob as políticas deles. Esta página e a [página de termos](https://abox.tools/pt/termos/) não desenham o botão.

### Hospedagem

O site é servido pelo GitHub Pages, atrás da Cloudflare. Como qualquer hospedagem, eles processam as requisições que o seu navegador faz, o que inclui o seu endereço IP, a página pedida e o seu agente de usuário, para entregar a página e manter o serviço no ar e seguro. Não temos acesso aos registros por visitante de nenhum dos dois.

### O intermediário da ferramenta de compartilhar

Uma ferramenta, [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/), leva texto e arquivos diretamente de um navegador a outro, e uma conexão direta precisa de uma apresentação. Por isso essa página, a única do site, abre um WebSocket para um pequeno servidor nosso, que junta as duas pontas de um nome de link e repassa entre elas o estabelecimento da conexão. Ele nunca vê o texto nem os arquivos; eles viajam pela conexão criptografada que ele apresentou. Ele vê o nome de link, quando cada lado se conecta e sai, e os endereços IP, e a Cloudflare, que o executa, guarda um registro de cada conexão por sete dias. É o único registro por visitante deste site que podemos ler. A própria página da ferramenta o descreve por completo, e o código inteiro dele está no repositório.

## Cookies

Não gravamos nenhum cookie nosso. Não temos login nem sessão, e existe uma única preferência que este site guarda.

**O idioma que você escolhe.** Se você escolher um idioma no seletor, essa escolha é escrita no armazenamento local do seu navegador, com o nome `abox-lang`, para que a próxima página que você abrir esteja no idioma que você pediu. Não é um cookie: nunca é enviada para nós nem para mais ninguém, fica no aparelho em que você está lendo isto, e limpar os dados de site do seu navegador apaga. Se você nunca escolher um idioma, nada chega a ser escrito, porque uma página exibida no idioma do próprio navegador foi combinada na hora e esquecida em seguida.

Todo cookie ou identificador parecido que você encontrar aqui é do Google e foi gravado pelos scripts de publicidade e de análise descritos acima. Servem para medir visitas e para escolher e limitar a repetição dos anúncios.

### Como desligar

- A personalização de anúncios pode ser desligada, para todos os sites de uma vez, na [Central de Anúncios](https://myadcenter.google.com/).
- O Google Analytics pode ser bloqueado em todo lugar com a [extensão de desativação](https://tools.google.com/dlpage/gaoptout) do próprio Google.
- As configurações do seu navegador podem bloquear ou apagar cookies de terceiros, e qualquer bloqueador de conteúdo impede que esses scripts cheguem a carregar.

Bloquear tudo isso está ótimo para nós. **Toda ferramenta deste site funciona com os scripts bloqueados, e funciona com a rede completamente desconectada.** Nada aqui fica preso atrás de um anúncio.

## Seus direitos sobre os dados

Não guardamos nenhum dado pessoal sobre você, então não há nada que possamos mostrar, corrigir, exportar ou apagar. Um pedido feito a nós voltaria vazio, sinceramente.

Os dados descritos acima ficam com o Google, que é o próprio controlador deles. Pedidos a respeito têm que ir para eles, pela [sua conta Google](https://myaccount.google.com/) ou pelos canais de privacidade deles.

## Crianças

Este site não é dirigido a crianças e não pergunta a idade de ninguém, porque não pergunta nada a ninguém. Não coletamos conscientemente nenhum dado pessoal de ninguém, de idade nenhuma.

## Mudanças, e como falar com a gente

Se esta página mudar, a data no alto muda junto, e a edição fica no histórico público de commits junto com todo o resto.

Dúvidas sobre qualquer coisa daqui podem ir para [hi@abox.tools](mailto:hi@abox.tools), ou virar uma issue [no repositório](https://github.com/A-Box-of-Tools/website), onde a resposta fica visível para todo mundo que estiver na mesma dúvida.
