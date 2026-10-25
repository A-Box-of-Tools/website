# Privacidade e cookies

Os arquivos são processados localmente. Compartilhamento e funções opcionais de rede têm limites próprios. A página explica esses limites, anúncios, medição de uso, feedback opcional, armazenamento e hospedagem.

Última atualização 25 de outubro de 2026

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

Os botões de email e compartilhamento preparam relatórios e JPEGs localmente e depois baixam um arquivo de email ou os entregam ao app escolhido. Esta página não envia email. O app, provedor e destinatário que você escolhe cuidam do próximo passo pelas próprias políticas. [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/), [Compartilhar uma aba do navegador](https://abox.tools/pt/share-tab/) e [Câmera remota](https://abox.tools/pt/remote-camera/) enviam conteúdo a outro navegador deliberadamente; os metadados são descritos abaixo.

### Catálogo público de ferramentas para agentes (MCP e A2A)

Os clientes MCP e A2A enviam palavras-chave públicas sobre a tarefa ou o formato, o idioma do catálogo e um limite de resultados a um Cloudflare Worker em `mcp.abox.tools`. Os serviços de catálogo retornam descrições e links públicos das ferramentas. Não aceitam arquivos, não oferecem endpoint de envio e não exigem conta. Não envie palavras-chave privadas, nomes de arquivos, conteúdo de arquivos nem senhas.

A filtragem no catálogo interativo já carregado acontece localmente, sem outra solicitação ao catálogo. Abrir um resultado pede ao ambiente que abra o site da ferramenta, onde a seleção e o processamento dos arquivos acontecem no navegador. O provedor do ambiente do agente ou do app trata suas solicitações e o histórico de conversa segundo a própria política. O serviço recebe o que o ambiente envia na solicitação ao catálogo. Ele não solicita nem recupera o histórico de conversa desse ambiente.

A aplicação não registra consultas nem corpos de solicitações e não tem banco de dados ou tarefas persistentes. A observabilidade do Worker está desativada. A Cloudflare ainda trata endereços IP, horários e metadados das solicitações para hospedagem, segurança e controle da frequência de solicitações. A retenção desses metadados gerenciados pelo provedor segue as regras da Cloudflare. Não verificamos um prazo fixo de retenção para este serviço. Sem usar o catálogo remoto, o site habitual e o processamento local continuam disponíveis.

## O que é coletado, e por quem

Este site é gratuito e se paga com publicidade. Isso significa que dois produtos do Google rodam nestas páginas, e um botão de doação roda na maioria delas. A lista completa é esta.

### Google AdSense — os anúncios

O Google exibe os anúncios e decide quais você vê. Para isso ele pode gravar e ler cookies ou identificadores parecidos no seu navegador, e recebe o seu endereço IP, uma localização aproximada derivada dele, o seu agente de usuário e em qual página você estava. Dependendo das suas configurações e de onde você está, os anúncios podem ser personalizados usando um perfil que o Google mantém sobre você, montado em boa parte a partir da sua atividade em outros sites.

Nada disso chega até nós, não conseguimos ver, e nunca mandamos ao Google coisa alguma sobre os seus arquivos. A explicação do próprio Google sobre como ele usa dados de sites que exibem seus anúncios está em [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — visitas e usos concluídos

Usamos o Google Analytics 4 para contar visitas às páginas e usos concluídos, para saber em quais ferramentas vale a pena trabalhar. Ele registra a página que você viu, o momento aproximado, um identificador aleatório guardado no navegador, uma localização aproximada, o tipo do seu aparelho e navegador e as etiquetas habituais de atribuição de campanhas.

O endereço enviado ao Analytics usa a URL canônica da página e apenas as etiquetas habituais de campanha. Outros parâmetros de consulta e fragmentos do endereço são omitidos. O título da página é fixo e o site de referência é reduzido à origem, sem caminho nem consulta.

Contamos o primeiro uso concluído a cada carregamento da página, por exemplo, solicitar um download já preparado, concluir uma cópia ou mostrar uma análise ou visualização utilizável em uma ferramenta de inspeção. O único detalhe específico da ferramenta acrescentado a esse evento é seu identificador fixo. Isso não confirma que seu sistema operacional salvou um download.

Também contamos a abertura das páginas de ferramentas. Em Images to Video, Image Stacker, GIF Analyzer e GIF Splitter, eventos fixos registram a entrada, o início do processamento, um resultado pronto, um problema ou um cancelamento, no máximo uma vez por etapa e carregamento da página. Os exemplos integrados ficam fora dessas etapas. Alguns links de continuação informam apenas identificadores fixos das páginas de origem e destino, nunca o endereço ou o texto do link. Essas contagens ajudam a localizar onde uma visita termina; não identificam trabalhos individuais nem confirmam a chegada à próxima página.

O feedback opcional registra o identificador fixo da ferramenta, uma resposta fixa positiva ou negativa e um motivo fixo depois que você escolhe uma resposta. Não há campo de texto livre. As ferramentas não anexam arquivos, nomes, conteúdos, texto digitado, quantidades, tamanhos, dimensões, formatos, configurações, mensagens de erro ou outros detalhes da entrada ou saída a nenhum dos registros. Podemos ver relatórios agregados do Analytics. Bloquear o Analytics mantém o processamento local disponível, inclusive sem conexão quando o cache da ferramenta estiver pronto.

### Buy Me a Coffee — o botão de doação

A página inicial e as páginas das ferramentas trazem um botão de doação, que é carregado dos servidores do Buy Me a Coffee. Carregá-lo faz com que a CDN deles veja o seu endereço IP e saiba que você estava neste site, e as letras do botão vêm do Google Fonts, que também vê o seu endereço IP. Nada mais é enviado, e nada além disso acontece a menos que você efetivamente clique, e aí você já está no site deles, sob as políticas deles. Esta página e a [página de termos](https://abox.tools/pt/termos/) não desenham o botão.

### Hospedagem

O site é servido pelo GitHub Pages, atrás da Cloudflare. Como qualquer hospedagem, eles processam as requisições que o seu navegador faz, o que inclui o seu endereço IP, a página pedida e o seu agente de usuário, para entregar a página e manter o serviço no ar e seguro. Não temos acesso aos registros por visitante de nenhum dos dois.

### Opções de conexão das ferramentas pareadas

As cinco ferramentas de pareamento começam em Direct. O anfitrião pode escolher Cloud relay antes de começar; o convite leva essa escolha e a outra pessoa a vê antes de conectar. Direct nunca muda automaticamente para um retransmissor. O Cloudflare TURN encaminha textos, arquivos, vídeo, áudio e mensagens de controle criptografados sem suas chaves de descriptografia, mas vê endereços, horários e volume de tráfego. Ambos os dispositivos precisam de internet durante toda a sessão. Credenciais temporárias ficam na memória do navegador e são renovadas pelo serviço de encontro, sem publicação em links ou listas. A lista pode mostrar o modo escolhido. Aprovação, senha e controles do microfone continuam em vigor.

As cinco ferramentas oferecem conexões disponíveis na rede local ou em um grupo privado. O mesmo código de grupo gerado aleatoriamente permite encontrar sessões em redes diferentes. Cada ferramenta tem sua própria lista, e as sessões do grupo não são publicadas também na lista da rede local. O código permite descobrir, não acessar: senhas, aprovação do anfitrião e o caminho de conexão escolhido continuam valendo. O serviço recebe o código em uma conexão criptografada para verificar a participação no grupo e depois mantém apenas um identificador derivado e o resultado em conexões abertas. Os endereços das solicitações e seus registros de metadados de sete dias contêm esse identificador, nunca o código. A página guarda o código apenas na memória, não o inclui em convites ou relatórios de conexão e o esquece ao recarregar. Os scripts normais da página podem ler seus campos; um grupo privado não os isola. Qualquer pessoa com o código pode encontrar as sessões oferecidas ao grupo, portanto compartilhe apenas com as pessoas desejadas.

### Compartilhar uma aba do navegador

[Compartilhar uma aba do navegador](https://abox.tools/pt/share-tab/) usa o seletor de um navegador de computador para capturar uma aba e enviar vídeo ao vivo a um espectador aprovado. O espectador solicita acesso, o anfitrião aprova e o espectador confirma antes do envio de vídeo. Não há captura de áudio, câmera ou microfone. As informações visíveis na aba escolhida são compartilhadas; o espectador pode gravar o que recebe.

A descoberta próxima online fica desativada por padrão. O anfitrião pode ativar Show in nearby shared tabs antes de iniciar; o espectador escolhe explicitamente Find nearby tabs para abrir a lista. A conexão de descoberta lista apenas o código aleatório do convite, nunca o título, endereço ou imagem da aba capturada nem a nota do espectador. Join ao lado de um resultado envia a solicitação pela rota indicada. Sem um comprovante válido, a aprovação continua necessária. Um link copiado ainda aguarda Request to watch. O serviço agrupa as páginas desta ferramenta por endereço IPv4 público ou sub-rede IPv6 /64 e origem do site, não por localização física. Gateways compartilhados ou VPNs podem incluir desconhecidos ou ocultar dispositivos próximos. As entradas existem nas conexões abertas sem histórico armazenado, e parar retira a entrada do anfitrião.

Em Direct, o vídeo usa uma conexão direta criptografada em uma rede local alcançável, sem STUN público nem TURN. Os dois dispositivos precisam de internet para a descoberta e o pareamento. O servidor de encontro vê códigos de sala, endereços IP, horários, descrições WebRTC e candidatos de conexão, mas não vídeo, notas do espectador nem decisões de aprovação. A Cloudflare mantém registros de metadados de conexão por sete dias.

Os scripts habituais da página podem ler seu endereço e estado, incluindo um código de convite; um link sozinho nunca dá acesso ao vídeo. O espectador não pode controlar o anfitrião nem selecionar texto da página. A ferramenta não grava, mas o conteúdo visível de uma sessão conectada faz parte da imagem e o espectador pode capturá-lo ou gravá-lo por conta própria. A página explica os limites de rede; usar endereços locais não comprova um limite físico de rede.

### Câmera remota e apresentação entre navegadores

[Câmera remota](https://abox.tools/pt/remote-camera/) abre uma conexão WebSocket de descoberta quando sua página é carregada. Iniciar câmera ou Conectar adiciona uma conexão de sala ao nosso serviço de intermediação. Join ao lado de uma câmera solicita a conexão e troca os endereços de rede pela rota indicada. Ao abrir um link para assistir à câmera, a página continua aguardando um clique em Conectar. A aprovação dos espectadores pelo anfitrião vem ativada por padrão e controla a transmissão de vídeo e áudio, não a troca de endereços de rede. O servidor vê códigos, endereços, horários e mensagens de configuração, nunca vídeo, áudio nem notas. Em Direct, o vídeo e o áudio ativado usam conexão direta criptografada, sem STUN ou TURN configurados e sem gravação. O áudio vem desativado por padrão; o anfitrião só solicita acesso ao microfone depois de escolher compartilhar áudio. Internet continua necessária para a apresentação. VPNs e políticas do sistema podem afetar a rota; o modo local não prova uma fronteira física de rede. A página explica os limites e como scripts podem ler o endereço completo do link.

Os alertas opcionais analisam pequenos quadros e áudio recebido no dispositivo do espectador, sem gravações nem uploads. Ativá-los solicita permissão para notificações do navegador. O navegador e o sistema exibem avisos genéricos sem imagem, áudio, nome do link ou nota do espectador. Desconectar interrompe a análise e fecha as notificações desta sessão. A página deve ficar aberta; o navegador pode pausar a análise em segundo plano ou durante a suspensão.

### Compartilhar texto e arquivos e o servidor de encontro

[Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/) abre uma conexão de descoberta na página inicial e outra ao compartilhar. Agrupa nomes por IPv4 público ou sub-rede IPv6 e origem da página; é uma pista, não prova da mesma rede física. O servidor vê nomes, IPs, horários e mensagens de negociação, nunca textos ou arquivos compartilhados. Nomes anunciados ficam em conexões abertas sem armazenamento durável. Direct normal usa STUN públicos do Google e da Cloudflare, que veem o endereço da solicitação. Rede local limita Direct a endereços de host sem STUN ou TURN. Cloud relay é uma opção separada, escolhida pelo anfitrião antes de compartilhar e aceita pelo leitor antes de conectar. Todas as opções precisam do servidor público para estabelecer a conexão. Cloudflare guarda metadados de conexão de câmera e compartilhamento por sete dias; são registros por visitante que podemos ler. Conteúdo copiado ou baixado pelo destinatário continua com ele ao fechar a aba de origem.

## Cookies

Não definimos cookies de login ou sessão. Scripts do Google podem definir os cookies e identificadores descritos. O site também usa armazenamento local para preferências e trabalho temporário.

**Aprovações de conexão.** As cinco ferramentas guardam credenciais aleatórias de reconexão no armazenamento local para um número limitado de combinações recentes de ferramenta, sala e rota. Elas não contêm conteúdo compartilhado, nomes nem endereços IP. Compartilhar texto, Compartilhar uma aba e Câmera remota apresentam comprovantes de aprovação somente pela conexão criptografada entre navegadores; as ferramentas de voz enviam sua chave pessoal ao serviço de apresentação ao entrar. A aprovação vale para a sessão atual do anfitrião: desconectar a mantém, a remoção a revoga e encerrar ou iniciar outra sessão a redefine. Limpar ou bloquear o armazenamento pode exigir nova aprovação. Scripts de qualquer página desta origem web, inclusive de terceiros, podem acessar essas credenciais. Elas não ficam isoladas dos scripts nem aparecem em convites ou listas de descoberta.

**O idioma que você escolhe.** Se você escolher um idioma no seletor, essa escolha é escrita no armazenamento local do seu navegador, com o nome `abox-lang`, para que a próxima página que você abrir esteja no idioma que você pediu. Não é um cookie: nunca é enviada para nós nem para mais ninguém, fica no aparelho em que você está lendo isto, e limpar os dados de site do seu navegador apaga. Se você nunca escolher um idioma, nada chega a ser escrito, porque uma página exibida no idioma do próprio navegador foi combinada na hora e esquecida em seguida.

**Outros dados locais.** Feedback guarda a data da resposta ou fechamento para não perguntar de novo. Ferramentas podem manter configurações ou um rascunho opcional de compartilhamento. Trocar idioma ou continuar explicitamente em outra ferramenta pode guardar arquivos e configurações temporariamente no IndexedDB. Não são cookies nem são enviados a nós; limpar os dados do site remove esses registros. A ferramenta correspondente explica rascunhos persistentes.

Cookies e identificadores do Google medem visitas e o uso das ferramentas e selecionam e limitam anúncios. São distintos dos registros locais do site descritos acima.

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
