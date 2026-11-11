# Como compartilhar uma aba do navegador ao vivo sem extensão

Mostre a alguém o site que você está usando enquanto mantém o controle. O navegador captura uma aba escolhida e envia sua imagem em movimento ao espectador. Direct usa uma rede local acessível; Cloud relay é uma opção explícita que encaminha vídeo criptografado pela Cloudflare. Convide por link ou descoberta próxima e aprove o espectador antes de enviar vídeo.

[Abrir Share a Browser Tab](https://abox.tools/pt/share-tab/): Choose a tab on your computer and let one approved viewer watch it using Direct or Cloud relay. Invite by link, network discovery or a private group. No extension, sound or remote control.

Última atualização 3 de novembro de 2026

## Conecte os dispositivos e escolha a aba

Abra o site em uma aba e [Share a Browser Tab](https://abox.tools/pt/share-tab/) em outra no computador. Os dois dispositivos precisam de internet para pareamento. A opção padrão Direct também precisa de uma rede que permita que eles se alcancem. Wi-Fi doméstico ou Ethernet é um bom ponto de partida. Escolha Cloud relay antes de começar se Direct não alcançar o outro dispositivo; o convite inclui essa escolha. Depois clique em *Choose a tab to share* e selecione a aba do site no seletor do próprio navegador. Escolha uma aba do navegador, não uma janela nem a tela inteira: a ferramenta recusa essas origens mais amplas. Confira a prévia local antes de enviar o link.

Escolha *Copy viewer link* e envie para a outra pessoa. Ela abre, lê o aviso de conexão, acrescenta uma apresentação curta se quiser e escolhe *Request to watch*. Volte à página de compartilhamento para aprovar o pedido esperado. A conexão primeiro transporta apenas mensagens de controle criptografadas; o vídeo começa depois da sua aprovação e da confirmação do espectador. Uma pessoa pode assistir por vez, com até quatro pedidos em espera.

Trabalhe na aba do site selecionada, mantendo a página de compartilhamento aberta. O anfitrião previsto usa uma versão atual do Chrome ou Edge para desktop. O espectador precisa de um navegador que reproduza vídeo WebRTC, sem extensão nem conta no site mostrado. O pareamento precisa de internet para a apresentação. O vídeo Direct usa endereços de host sem STUN público nem TURN. Cloud relay encaminha o vídeo criptografado pela Cloudflare e precisa de internet durante toda a sessão.

## Encontre uma aba próxima sem copiar o link

O anfitrião pode marcar *Show in Available connections* antes de escolher uma aba para compartilhar. A opção vem desativada e não pode ser alterada durante uma sessão. A lista mostra o código aleatório do convite e a opção de conexão, nunca o título, endereço ou imagem da aba capturada.

No dispositivo do espectador, escolha *Find connections*, confira o ícone de rota e selecione *Join* ao lado do código do anfitrião para solicitar acesso. O anfitrião ainda aprova o pedido, e o navegador confirma essa aprovação antes de qualquer vídeo chegar. Stop sharing remove o anfitrião da lista.

A descoberta próxima precisa de internet. O serviço agrupa as páginas dessa ferramenta pelo endereço IPv4 público ou sub-rede IPv6 /64 e pela origem do site. Não varre o Wi-Fi nem comprova que alguém esteja fisicamente próximo. Um gateway compartilhado da operadora ou uma VPN pode incluir desconhecidos, enquanto rotas diferentes podem esconder um dispositivo ao seu lado. Confirme o código com o anfitrião e use o link copiado para o espectador se ele não aparecer.

## Mantenha internet disponível para o pareamento

Os dois dispositivos precisam do serviço de apresentação para estabelecer uma nova sessão. Uma cópia salva da página não substitui esse serviço. Uma visualização estabelecida pode continuar durante uma breve interrupção da internet enquanto a conexão direta sobreviver, mas isso não é garantido. Novos espectadores e reconexão precisam de internet novamente.

Use uma rede que permita a comunicação direta entre dispositivos. Um ponto de acesso do celular é uma rota opcional sem garantia: precisa de internet para parear e deve permitir tráfego entre os dispositivos. Alguns pontos de acesso e redes de convidados os isolam. Esta página não pode ativar um ponto de acesso nem criar uma conexão Wi-Fi Direct ou Bluetooth.

## O que o espectador pode ver e fazer

O espectador vê uma imagem de vídeo ao vivo. Sua rolagem, navegação entre páginas, menus e conteúdo visível de contas naquela aba passam a fazer parte da imagem. Apenas ativar outra aba do navegador não seleciona uma nova origem de captura, mas tudo o que você revelar dentro da aba selecionada será compartilhado. Confira o indicador de captura do navegador e pare antes de abrir informações privadas ali.

Os cliques e a digitação do espectador não operam seu navegador. Ele não recebe seus cookies de login nem uma cópia funcional do site. Texto em vídeo não é selecionável, então esta versão não permite copiar a página da web. Use [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/) junto quando a outra pessoa precisar de um link, nota ou arquivo que possa copiar. Alguns conteúdos protegidos podem aparecer pretos ou indisponíveis na captura.

Nenhum áudio é solicitado ou enviado, incluindo o som da aba. A ferramenta não pede acesso à câmera nem ao microfone e não faz gravação. O espectador ainda pode gravar o que vê ou tirar capturas de tela. Encerrar o link interrompe o vídeo futuro; não apaga o que já foi guardado.

## O convite permite um pedido; sua aprovação permite o vídeo

As sessões têm novos links aleatórios. O anfitrião pode optar por publicar o código do convite na lista próxima; isso vem desativado. Qualquer pessoa que obtenha um convite pode tentar conectar, incluindo a troca de endereços de rede. Ela ainda precisa da sua aprovação para o vídeo. O nome ou a nota digitados não são uma identidade verificada; reconheça a pessoa pela conversa já estabelecida e aprove somente o pedido esperado.

Um fragmento de URL não esconde o código do link de scripts executados na mesma página, e o navegador pode guardar seu histórico. A página da ferramenta contém os scripts habituais de publicidade e medição do site. A ferramenta não envia deliberadamente vídeo ou notas a eles, mas scripts na mesma página podem ler o endereço e o estado dela. A aprovação obrigatória continua sendo a etapa de admissão.

## Como o vídeo chega ao outro navegador

Um pequeno serviço de apresentação na internet associa os navegadores pelo código aleatório e encaminha mensagens de configuração do WebRTC. Ele vê código, endereços, horários de conexão, descrições e candidatos de conexão. A configuração não fica oculta desse serviço. A descoberta próxima opcional também publica o código da sala no grupo de rede do serviço, sem título, endereço ou imagem da aba. O vídeo, a nota do espectador e as decisões de aprovação não passam por ele. A Cloudflare mantém metadados de solicitações de conexão por sete dias. O serviço não grava conteúdo das salas no armazenamento.

O vídeo Direct usa uma conexão WebRTC criptografada sem servidor STUN nem retransmissor TURN. A configuração aceita somente os endereços de conexão de host dos navegadores, e cada navegador conhece endereços do outro antes da aprovação do vídeo. Endereços de host podem incluir interfaces públicas ou seguir uma rota VPN; essa política não comprova que o tráfego permanece dentro de um prédio.

Isolamento de rede de convidados ou de ponto de acesso, firewalls, rotas VPN e permissões de rede local do navegador podem bloquear a conexão. Compartilhar um nome de Wi-Fi não estabelece, por si só, que os dispositivos se alcancem. Teste a rede real antes de uma demonstração ou chamada de suporte. Direct nunca muda automaticamente para uma alternativa. Para usar Cloud relay, pare e inicie uma nova sessão com essa escolha. A Cloudflare encaminha vídeo e mensagens de controle criptografados sem suas chaves de descriptografia, mas vê endereços, tempos e volume de tráfego. Pareamento não promete continuidade quando sua conexão de internet desaparece.

Se o serviço de apresentação não conseguir conectar, confira o acesso à internet nos dois dispositivos e tente novamente. Se a sessão terminou, comece outra vez, escolha a aba e envie o novo link do espectador. Uma captura nova sempre exige sua ação e o seletor do navegador.

## Mantenha as duas abas do anfitrião abertas e depois pare deliberadamente

Ocultar a página de compartilhamento mantém uma captura saudável quando o navegador permite, para que você use normalmente a aba do site selecionada. Mantenha as duas abas abertas e o dispositivo acordado. Repouso, fechar o notebook ou suspensão do navegador pode interromper ou encerrar a transmissão; esta página não pode ignorar essas políticas.

Escolha *Stop sharing* na ferramenta ou use o controle de captura do navegador ao terminar. Fechar a página de compartilhamento ou encerrar a aba capturada também encerra a origem. Se a captura terminar, voltar à página nunca captura novamente em silêncio. Comece outra vez, escolha uma aba novamente e envie o novo convite. Um novo espectador sempre precisa de nova aprovação.
