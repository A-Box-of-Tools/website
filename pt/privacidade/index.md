# Privacidade e cookies

Os arquivos são processados localmente. Compartilhamento e funções opcionais de rede têm limites próprios. A página explica esses limites, anúncios, feedback, armazenamento e hospedagem.

Última atualização 12 de outubro de 2026

## Seus arquivos

Os arquivos escolhidos são lidos, editados e escritos no navegador do seu dispositivo. abox.tools não tem endpoint de envio para processar arquivos nem banco de dados deles. Downloads são montados localmente. Compartilhar, ver uma câmera remota e entregar relatórios a outro app são transferências deliberadas, explicadas abaixo.

O processamento local não nos entrega:

- seus arquivos ou prévias
- nomes, tamanhos, dimensões ou formatos
- conteúdo, incluindo EXIF, GPS e texto reconhecido

Cada página tem uma `Content-Security-Policy` que limita recursos e destinos. Algumas ferramentas acrescentam o servidor de encontro ou a API opcional de câmbio. A política não inspeciona dados enviados a hosts permitidos e `connect-src` não descreve o tráfego WebRTC entre navegadores. Leia junto ao código e observe a função usada, sem tratar a lista de hosts como prova de todo conteúdo.

Os arquivos que você produz com uma ferramenta são entregues ao mecanismo de download do próprio navegador e salvos onde você mandar. Nessa etapa também não entramos.

## Funções que usam conexão deliberadamente

[Imagens para vídeo](https://abox.tools/pt/imagens-para-video/) pode buscar uma imagem no endereço informado. O servidor recebe seu IP e a URL solicitada, incluindo parâmetros. A imagem fica na memória local e é recodificada para processamento. A solicitação não envia arquivos escolhidos no dispositivo.

O [Extrator de recibos e faturas](https://abox.tools/pt/extrair-recibos-faturas/) lê fotos e reconhece texto localmente. O botão opcional de câmbio histórico solicita par de moedas e data escolhida ao [Frankfurter](https://frankfurter.dev/). A data pode ser a impressa no recibo. O provedor vê seu IP e a solicitação; ela omite credenciais e referência de origem e não contém foto, nome, estabelecimento, valor ou email. Taxas manuais não precisam de solicitação.

Os botões de email e compartilhamento preparam relatórios e JPEGs localmente e depois baixam um arquivo de email ou os entregam ao app escolhido. Esta página não envia email. O app, provedor e destinatário que você escolhe cuidam do próximo passo pelas próprias políticas. [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/) e [Câmera remota](https://abox.tools/pt/remote-camera/) enviam conteúdo a outro navegador deliberadamente; os metadados são descritos abaixo.

## O que é coletado, e por quem

Este site é gratuito e se paga com publicidade. Isso significa que dois produtos do Google rodam nestas páginas, e um botão de doação roda na maioria delas. A lista completa é esta.

### Google AdSense — os anúncios

O Google exibe os anúncios e decide quais você vê. Para isso ele pode gravar e ler cookies ou identificadores parecidos no seu navegador, e recebe o seu endereço IP, uma localização aproximada derivada dele, o seu agente de usuário e em qual página você estava. Dependendo das suas configurações e de onde você está, os anúncios podem ser personalizados usando um perfil que o Google mantém sobre você, montado em boa parte a partir da sua atividade em outros sites.

Nada disso chega até nós, não conseguimos ver, e nunca mandamos ao Google coisa alguma sobre os seus arquivos. A explicação do próprio Google sobre como ele usa dados de sites que exibem seus anúncios está em [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — o contador de visitas

Usamos o Google Analytics 4 para contar visitas às páginas, para saber em quais ferramentas vale a pena trabalhar. Ele registra a página que você viu, mais ou menos quando, um identificador gerado aleatoriamente e guardado no seu navegador, uma localização aproximada, o tipo do seu aparelho e do seu navegador, e o site que trouxe você até aqui.

`analytics.js` configura visualizações. Depois da resposta opcional, `feedback.js` também envia um evento `tool_feedback`: identificador da ferramenta, voto fixo positivo ou negativo e motivo fixo. Não há texto livre nem arquivo, nome, tamanho, dimensão, quantidade, formato ou conteúdo nesse evento. Podemos ver relatórios agregados do Analytics. Bloquear mantém o processamento local disponível.

### Buy Me a Coffee — o botão de doação

A página inicial e as páginas das ferramentas trazem um botão de doação, que é carregado dos servidores do Buy Me a Coffee. Carregá-lo faz com que a CDN deles veja o seu endereço IP e saiba que você estava neste site, e as letras do botão vêm do Google Fonts, que também vê o seu endereço IP. Nada mais é enviado, e nada além disso acontece a menos que você efetivamente clique, e aí você já está no site deles, sob as políticas deles. Esta página e a [página de termos](https://abox.tools/pt/termos/) não desenham o botão.

### Hospedagem

O site é servido pelo GitHub Pages, atrás da Cloudflare. Como qualquer hospedagem, eles processam as requisições que o seu navegador faz, o que inclui o seu endereço IP, a página pedida e o seu agente de usuário, para entregar a página e manter o serviço no ar e seguro. Não temos acesso aos registros por visitante de nenhum dos dois.

### Câmera remota e apresentação entre navegadores

[Câmera remota](https://abox.tools/pt/remote-camera/) abre uma conexão WebSocket de descoberta quando sua página é carregada. Iniciar câmera, Conectar ou escolher uma câmera online adiciona uma conexão de sala ao nosso serviço de intermediação. Escolher um nome da lista solicita uma conexão imediatamente e troca endereços de rede. Ao abrir um link para assistir à câmera, a página continua aguardando um clique em Conectar. A aprovação dos espectadores pelo anfitrião vem ativada por padrão e controla a transmissão de vídeo, não a troca de endereços de rede. O servidor vê códigos, endereços, horários e mensagens de configuração, nunca vídeo nem notas. O vídeo usa conexão direta criptografada, sem STUN ou TURN configurados, microfone ou gravação. Internet continua necessária para a apresentação. VPNs e políticas do sistema podem afetar a rota; o modo local não prova uma fronteira física de rede. A página explica os limites e como scripts podem ler o endereço completo do link.

### Compartilhar texto e arquivos e o servidor de encontro

[Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/) abre uma conexão de descoberta na página inicial e outra ao compartilhar. Agrupa nomes por IPv4 público ou sub-rede IPv6 e origem da página; é uma pista, não prova da mesma rede física. O servidor vê nomes, IPs, horários e mensagens de negociação, nunca textos ou arquivos compartilhados. Nomes anunciados ficam em conexões abertas sem armazenamento durável. O modo normal usa STUN públicos do Google e Cloudflare. Um leitor pode escolher tentar por TURN da Cloudflare, que encaminha tráfego criptografado sem suas chaves. O modo local omite STUN e TURN, mas ainda precisa do servidor público. Cloudflare guarda metadados de conexão de câmera e compartilhamento por sete dias; são registros por visitante que podemos ler. Conteúdo copiado ou baixado pelo destinatário continua com ele ao fechar a aba de origem.

## Cookies

Não definimos cookies de login ou sessão. Scripts do Google podem definir os cookies e identificadores descritos. O site também usa armazenamento local para preferências e trabalho temporário.

**O idioma que você escolhe.** Se você escolher um idioma no seletor, essa escolha é escrita no armazenamento local do seu navegador, com o nome `abox-lang`, para que a próxima página que você abrir esteja no idioma que você pediu. Não é um cookie: nunca é enviada para nós nem para mais ninguém, fica no aparelho em que você está lendo isto, e limpar os dados de site do seu navegador apaga. Se você nunca escolher um idioma, nada chega a ser escrito, porque uma página exibida no idioma do próprio navegador foi combinada na hora e esquecida em seguida.

**Outros dados locais.** Feedback guarda a data da resposta ou fechamento para não perguntar de novo. Ferramentas podem manter configurações ou um rascunho opcional de compartilhamento. Trocar idioma ou continuar explicitamente em outra ferramenta pode guardar arquivos e configurações temporariamente no IndexedDB. Não são cookies nem são enviados a nós; limpar os dados do site remove esses registros. A ferramenta correspondente explica rascunhos persistentes.

Cookies e identificadores do Google medem visitas e selecionam e limitam anúncios. São distintos dos registros locais do site descritos acima.

### Como desligar

- A personalização de anúncios pode ser desligada, para todos os sites de uma vez, na [Central de Anúncios](https://myadcenter.google.com/).
- O Google Analytics pode ser bloqueado em todo lugar com a [extensão de desativação](https://tools.google.com/dlpage/gaoptout) do próprio Google.
- As configurações do seu navegador podem bloquear ou apagar cookies de terceiros, e qualquer bloqueador de conteúdo impede que esses scripts cheguem a carregar.

Bloquear anúncios, Analytics e doação mantém o processamento local disponível. Com o cache offline pronto, ele funciona desconectado. Imagens da web, câmbio online, apresentação entre navegadores e entrega por outro app precisam das respectivas conexões. Nenhuma função de processamento fica presa atrás de anúncio.

## Seus direitos sobre os dados

Não mantemos os arquivos que você processa. Relatórios do Analytics e metadados de conexão são dados distintos. Perguntas ou solicitações sobre o tratamento pelo site podem ir para [hi@abox.tools](mailto:hi@abox.tools); identifique a página e data aproximada, sem anexar arquivo privado.

Para dados da sua conta Google, use [os controles da conta](https://myaccount.google.com/) ou os contatos de privacidade. Provedores opcionais de câmbio, doação e email cuidam dos próprios serviços e pedidos.

## Crianças

O site não é direcionado a crianças e não pede idade nem conta de usuário. As informações automáticas de páginas e conexões descritas aplicam-se a visitantes de qualquer idade.

## Mudanças, e como falar com a gente

Se esta página mudar, a data no alto muda junto, e a edição fica no histórico público de commits junto com todo o resto.

Dúvidas sobre qualquer coisa daqui podem ir para [hi@abox.tools](mailto:hi@abox.tools), ou virar uma issue [no repositório](https://github.com/A-Box-of-Tools/website), onde a resposta fica visível para todo mundo que estiver na mesma dúvida.
