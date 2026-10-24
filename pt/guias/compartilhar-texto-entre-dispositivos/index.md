# Como compartilhar texto e arquivos sem guardar cópia no servidor

Mova uma nota ou um arquivo sem deixar cópia no e-mail, no histórico de conversa ou em um servidor de compartilhamento. Por padrão, os navegadores se conectam diretamente. Se não conseguirem, o anfitrião pode iniciar um novo compartilhamento com retransmissão na nuvem: a Cloudflare encaminha o conteúdo criptografado. Os destinatários ainda podem guardar suas próprias cópias.

[Abrir Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/): Compartilhe texto e arquivos criptografados a partir do navegador aberto. A conexão direta é o padrão; a retransmissão na nuvem é opcional. Você aprova cada leitor.

Última atualização 13 de outubro de 2026

## A resposta curta

Direct é a opção padrão. As orientações de alcance direto abaixo se referem a esse modo. Para usar Cloud relay, o anfitrião escolhe essa opção antes de iniciar e compartilha o novo convite. A outra pessoa vê a escolha e confirma antes de conectar. Direct nunca muda automaticamente. A Cloudflare encaminha conteúdo criptografado e vê endereços, horários e volume de tráfego. Ambos os dispositivos precisam de internet durante toda a sessão. Aprovação, senha e controles do microfone continuam valendo.

Abra [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/) no computador que tem a coisa, escreva ou anexe, e aperte *Começar a compartilhar*. A página dá ao compartilhamento um nome como `brave-otter-42`; no outro dispositivo, abra a mesma página e acrescente `#brave-otter-42` ao fim do endereço — ou apenas siga o link copiado. O outro dispositivo pergunta antes de conectar, você deixa entrar, e o texto ou o arquivo atravessa criptografado, direto de um navegador ao outro. Feche a aba que compartilha e acabou, em todo lugar.

Nenhum texto ou arquivo compartilhado foi enviado a um servidor. É assim que a ferramenta funciona. O restante explica por que importa e quais são seus limites.

![O primeiro cartão da ferramenta de compartilhar: uma caixa de texto com algumas linhas de anotações de reunião, e acima um interruptor de Markdown e um botão para anexar um arquivo.](https://abox.tools/screens/share-text-between-devices/write.webp)

O que está sendo entregue. Na mesma caixa cabe uma lista de compras ou um documento, e Markdown é um interruptor, não um modo separado.

## Passe uma nota ao celular ou um arquivo para uma oficina

**Do notebook ao celular.** Coloque um endereço longo, instruções ou arquivo na página do notebook. Mantenha Privado, abra o link copiado no celular, aprove o leitor esperado e copie ou baixe. Mantenha a aba visível e ativa até chegar e encerre. A cópia salva no celular permanece mesmo depois que o link termina.

**Uma oficina ou chamada de suporte ao vivo.** Compartilhe exercício, configuração de exemplo ou trecho diagnóstico enquanto ambos estão presentes. Use dados fictícios se possível e aprove leitores individualmente. A lista do modo Rede local visível não prova que estão na sua sala. Cada arquivo precisa respeitar o limite de 200 MB.

Teste a conexão na rede real antes do encontro. Combine uma alternativa se bloquear o caminho direto. É uma entrega ao vivo: deixar algo durante a noite exige um serviço que armazene deliberadamente.

## Onde os caminhos comuns deixam cópia

Mande uma nota por e-mail para você mesmo e ela agora existe numa pasta de enviados e numa caixa de entrada, ambas sincronizadas, ambas com backup, ambas pesquisáveis daqui a anos. Cole uma senha num app de mensagens e ela fica no histórico daquela conversa — e no backup em nuvem do app — enquanto a conversa existir. Use um pastebin ou um site de hospedar arquivos e o conteúdo fica no servidor deles, atrás de uma configuração de validade e um botão de excluir dos quais você só consegue verificar a cor. Cada um desses caminhos é um serviço de armazenamento com o compartilhar como função.

Às vezes é exatamente o que você quer: uma cópia que espera até a outra pessoa estar pronta. Mas a maioria dos compartilhamentos rápidos é o contrário: o outro dispositivo está ali do lado, o conteúdo é momentâneo, e cada cópia guardada é puro passivo. A senha do Wi-Fi para uma visita, um endereço lido por telefone, uma mensagem de erro que precisa de um segundo par de olhos, um trecho de configuração a caminho do computador a que pertence. Nada disso quer um arquivo morto.

## O que “direto” significa de verdade

A ferramenta usa WebRTC, como chamadas de vídeo do navegador: dois navegadores abrem um canal criptografado e enviam dados sem servidor no caminho. Com uma conexão local funcional, transferem na velocidade dessa rede; a rota também depende de VPN, políticas do navegador e configurações dos aparelhos.

Há uma ressalva: os navegadores precisam de ajuda para se encontrar. Um pequeno servidor de encontro liga quem digita o nome a quem compartilha e transmite alguns kilobytes de preparação. Não guarda conteúdo compartilhado nem o transporta; seu código está publicado. Apresenta as partes, não leva a conversa. Também lista nomes locais que aceitaram aparecer para encontrá-los na página inicial. É o serviço usado aqui e na Câmera remota. Obter imagens opcionais, consultar câmbio e scripts de plataforma têm limites próprios na [página de privacidade](https://abox.tools/pt/privacidade/). A página de compartilhamento explica o que o servidor vê.

Direto também significa mútuo: cada navegador fica sabendo o endereço de rede do outro, como numa ligação. O lado que lê sabe disso antes de existir qualquer conexão, e só se conecta se decidir.

## Compartilhar no mesmo Wi-Fi ou Ethernet

Rede local vem desativada. Antes de começar, escolha *Rede local — sem retransmissor de internet*. Anexe o arquivo, mantenha Privado para aprovar leitores e comece. Visível vem marcado: no segundo aparelho, confira o tipo de conexão em *Conexões disponíveis* e escolha Entrar ao lado do nome. Uma aba de leitura é aberta e a solicitação é iniciada. Compartilhamentos privados aguardam sua aprovação. Desmarque Visível antes de começar para compartilhar só por link. Ambos os aparelhos precisam do mesmo Wi-Fi ou Ethernet. Os arquivos mantêm o limite de 200 MB e cada leitor escolhe o que baixar.

A lista agrupa navegadores por IPv4 público ou sub-rede IPv6 vista pelo servidor. Costuma ser um roteador, mas VPN compartilhada ou provedor que compartilha endereço podem incluir outras redes. Rotas diferentes ou IPv4 e IPv6 podem esconder um aparelho vizinho. Mantenha Privado em redes compartilhadas: o nome aparece ao grupo e a lista não prova estar na mesma sala ou prédio. Precisa de internet. Se a descoberta falhar, o link copiado ainda funciona.

O link leva a configuração `?local=1#brave-otter-42`. Se disser o nome, informe também Rede local: `#brave-otter-42` sozinho pede modo normal. Se o leitor usar outro modo, a página explica e pede escolher antes de tentar o do remetente.

O modo local não usa servidor público de descoberta de endereços nem oferece retransmissor de internet. Ainda precisa de internet para apresentar navegadores. Wi-Fi de visitantes pode isolar aparelhos; firewalls, VPNs e políticas do navegador também bloqueiam ou mudam a rota. Controla como encontra um caminho direto, sem provar que permaneça em um prédio físico.

## O nome é o endereço; Privado decide quem entra

Um link de compartilhamento se distingue de qualquer outro numa coisa prática: ele sobrevive a ser falado. `brave-otter-42` dá para gritar de um lado a outro da sala, ler por telefone ou copiar de um quadro, e digitar do outro lado sem ninguém perder os polegares. É exatamente para isso que os nomes têm essa cara.

Quem conhece ou adivinha um nome ativo pode abrir. Compartilhar localmente com visibilidade lista o nome a navegadores com o mesmo IPv4 público ou sub-rede IPv6: é público dentro do grupo. Para dados sensíveis, preserve a opção: compartilha em *privado* salvo se desmarcar. Cada leitor se apresenta e você decide quem entra. A apresentação cruza o canal direto criptografado: nem o servidor de encontro sabe quem perguntou.

![O cartão do nome mostra thursday-notes e opções de compartilhamento privado e uso único.](https://abox.tools/screens/share-text-between-devices/name.webp)

O nome é todo o endereço. Privado quer dizer que cada leitor precisa pedir e você deixa entrar; uso único quer dizer que o rascunho também não fica neste aparelho.

## O que fechar a aba encerra de verdade

O compartilhamento vive na aba que compartilha e em nenhum outro lugar, então fechar essa aba é a exclusão — não um pedido de exclusão. O link morre em um ou dois segundos, e os leitores que ainda estiverem olhando veem a página deles esvaziar. Não há cópia em servidor com ciclo de vida próprio, nem lixeira, nem retenção de trinta dias. O rascunho que você digitou fica no seu próprio navegador para a próxima vez, e até isso se desliga com a opção de descartável.

O que não se encerra é a posse. Um leitor que copiou o texto ou baixou o arquivo enquanto o compartilhamento estava aberto, tem: exatamente como se você tivesse entregado por qualquer outro meio. Nenhuma ferramenta consegue des-enviar, e uma que afirmasse isso estaria mentindo para você sobre o computador de outra pessoa. Encerrar governa o futuro — ninguém novo, nada mais —, e essa é a parte que um serviço com cópia guardada não pode dar.

## A entrevista on-line é o caso ideal

Uma ferramenta de mão em mão quer as duas pontas presentes, e a entrevista é o único compromisso em que a presença está garantida: vocês já estão se olhando. É também o momento em que os caminhos com cópia guardada custam mais. O que cruza o chat da reunião cai na transcrição da plataforma, presa à gravação e a quem a receber depois; e abrir a caixa de e-mail ou um app de mensagens para buscar um link com a tela compartilhada põe a sua correspondência na gravação de outra pessoa. A página de compartilhar mostra a coisa compartilhada e nada mais.

Na prática: o link do portfólio, o repositório, o PDF do desafio, o trecho de código que não sobreviveria às aspas tipográficas do chat — comece o compartilhamento antes da chamada e, na hora certa, diga o nome em voz alta. `brave-otter-42` atravessa uma chamada de voz intacto, que é exatamente a forma para a qual os nomes foram feitos, e o outro lado tem o arquivo antes de a frase acabar. Deixado privado, o compartilhamento ainda faz da chegada do entrevistador algo que você aprova no meio da chamada, não uma porta aberta; e quando a chamada termina, fechar a aba encerra o compartilhamento junto — nada fica esperando numa transcrição para ser relido fora de contexto depois.

Uma preparação honesta: entrevistadores estão em redes corporativas rígidas com mais frequência que a maioria dos leitores, e é lá que vive o raro par sem caminho direto. A rede deles não dá para testar de casa — mas a ferramenta anuncia a falha em vinte segundos em vez de ficar pendurada, e o plano B custa instantes, não a entrevista.

## Quando esta é a ferramenta errada

Ambos precisam estar presentes ao mesmo tempo, e a aba que compartilha precisa continuar aberta. Compartilhar exige conexão; só o editor funciona offline. Se Direct falhar em uma rede móvel ou empresarial, o anfitrião pode parar o compartilhamento e criar outro com Cloud relay. Depois envia o novo convite, cuja opção de conexão o leitor aceita antes de conectar. Direct local não usa retransmissor. A suspensão do navegador e políticas empresariais também podem interromper uma conexão com retransmissor.

Para todo o resto — a nota, a senha, o arquivo de configuração, o vídeo de 100 MB a um pulo de Wi-Fi — a versão direta é mais rápida, mais simples, e deixa o mundo exatamente como o encontrou.
