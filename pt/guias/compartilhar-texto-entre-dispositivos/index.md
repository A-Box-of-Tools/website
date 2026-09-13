# Como compartilhar texto e arquivos entre dispositivos sem fazer upload

Os jeitos comuns de levar uma nota ou um arquivo para outra máquina deixam todos uma cópia para trás: na pasta de enviados, no histórico de um chat, ou no servidor de um site de compartilhamento, atrás de um botão de excluir em que é preciso confiar. Existe um jeito que não deixa nada em lugar nenhum, porque nada é guardado nunca - e é também o único com um nome que dá para falar de um lado a outro da sala.

[Abrir Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/): O compartilhamento vive nesta aba aberta. Os leitores o recebem criptografado, direto do seu navegador, e fechar a aba o encerra - nenhum servidor guarda nada.

Última atualização 27 de agosto de 2026

## A resposta curta

Abra [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/) na máquina que tem a coisa, escreva ou anexe, e aperte *Começar a compartilhar*. A página dá ao compartilhamento um nome como `brave-otter-42`; no outro dispositivo, abra a mesma página e acrescente `#brave-otter-42` ao fim do endereço — ou apenas siga o link copiado. O outro dispositivo pergunta antes de conectar, você deixa entrar, e o texto ou o arquivo atravessa criptografado, direto de um navegador ao outro. Feche a aba que compartilha e acabou, em todo lugar.

Em nenhum momento houve upload de coisa alguma. Não é uma política: é o formato da coisa. O resto desta página explica por que isso importa, e quais são os limites honestos.

![O primeiro cartão da ferramenta de compartilhar: uma caixa de texto com algumas linhas de anotações de reunião, e acima um interruptor de Markdown e um botão para anexar um arquivo.](https://abox.tools/screens/share-text-between-devices/write.webp)

O que está sendo entregue. Na mesma caixa cabe uma lista de compras ou um documento, e Markdown é um interruptor, não um modo separado.

## Onde os caminhos comuns deixam cópia

Mande uma nota por e-mail para você mesmo e ela agora existe numa pasta de enviados e numa caixa de entrada, ambas sincronizadas, ambas com backup, ambas pesquisáveis daqui a anos. Cole uma senha num app de mensagens e ela fica no histórico daquela conversa — e no backup em nuvem do app — enquanto a conversa existir. Use um pastebin ou um site de hospedar arquivos e o conteúdo fica no servidor deles, atrás de uma configuração de validade e um botão de excluir dos quais você só consegue verificar a cor. Cada um desses caminhos é um serviço de armazenamento com o compartilhar como função.

Às vezes é exatamente o que você quer: uma cópia que espera até a outra pessoa estar pronta. Mas a maioria dos compartilhamentos rápidos é o contrário: o outro dispositivo está ali do lado, o conteúdo é momentâneo, e cada cópia guardada é puro passivo. A senha do Wi-Fi para uma visita, um endereço lido por telefone, uma mensagem de erro que precisa de um segundo par de olhos, um trecho de configuração a caminho da máquina a que pertence. Nada disso quer um arquivo morto.

## O que “direto” significa de verdade

A ferramenta usa WebRTC, a mesma maquinaria das chamadas de vídeo no navegador: dois navegadores abrem um canal criptografado entre si e mandam os dados por ele, sem servidor no caminho. Na mesma rede, os bytes viajam só pela rede local: dois notebooks no mesmo Wi-Fi passam o arquivo pela sala, não pela internet.

Um asterisco honesto, que também está na página da ferramenta: dois navegadores não conseguem se encontrar sozinhos. Um servidor pequeno — o intermediário — junta quem digitou o nome com quem compartilha sob ele, e leva alguns kilobytes de estabelecimento de conexão entre os dois. Não guarda nada, e o conteúdo nunca passa por ele; o código completo está publicado ao lado do da ferramenta. É a apresentação, não a conversa — e é o único servidor com que qualquer coisa fala neste site, razão pela qual a página da ferramenta detalha exatamente o que ele pode e o que não pode ver.

Direto também significa mútuo: cada navegador fica sabendo o endereço de rede do outro, como numa ligação. O lado que lê sabe disso antes de existir qualquer conexão, e só se conecta se decidir.

## O nome é o endereço, e o único segredo

Um link de compartilhamento se distingue de qualquer outro numa coisa prática: ele sobrevive a ser falado. `brave-otter-42` dá para gritar de um lado a outro da sala, ler por telefone ou copiar de um quadro, e digitar do outro lado sem ninguém perder os polegares. É exatamente para isso que os nomes têm essa cara.

E corta dos dois lados: qualquer um que conheça ou adivinhe um nome vivo pode abrir o que está por trás. Para o delicado, dê ao compartilhamento um nome que ninguém adivinharia, ou apoie-se no padrão: os compartilhamentos são *privados* a menos que você desmarque, o que significa que cada leitor que chega precisa se apresentar e você decide, mensagem por mensagem, quem entra. A apresentação viaja pelo canal direto criptografado, então nem o intermediário sabe quem bateu.

![O segundo cartão: um nome de link escrito thursday-notes, uma nota dizendo que o nome é o endereço e o único segredo, e chaves para privado e para uso único.](https://abox.tools/screens/share-text-between-devices/name.webp)

O nome é todo o endereço. Privado quer dizer que cada leitor precisa pedir e você deixa entrar; uso único quer dizer que o rascunho também não fica neste aparelho.

## O que fechar a aba encerra de verdade

O compartilhamento vive na aba que compartilha e em nenhum outro lugar, então fechar essa aba é a exclusão — não um pedido de exclusão. O link morre em um ou dois segundos, e os leitores que ainda estiverem olhando veem a página deles esvaziar. Não há cópia em servidor com ciclo de vida próprio, nem lixeira, nem retenção de trinta dias. O rascunho que você digitou fica no seu próprio navegador para a próxima vez, e até isso se desliga com a opção de descartável.

O que não se encerra é a posse. Um leitor que copiou o texto ou baixou o arquivo enquanto o compartilhamento estava aberto, tem: exatamente como se você tivesse entregado por qualquer outro meio. Nenhuma ferramenta consegue des-enviar, e uma que afirmasse isso estaria mentindo para você sobre o computador de outra pessoa. Encerrar governa o futuro — ninguém novo, nada mais —, e essa é a parte que um serviço com cópia guardada não pode dar.

## A entrevista on-line é o caso ideal

Uma ferramenta de mão em mão quer as duas pontas presentes, e a entrevista é o único compromisso em que a presença está garantida: vocês já estão se olhando. É também o momento em que os caminhos com cópia guardada custam mais. O que cruza o chat da reunião cai na transcrição da plataforma, presa à gravação e a quem a receber depois; e abrir a caixa de e-mail ou um app de mensagens para buscar um link com a tela compartilhada põe a sua correspondência na gravação de outra pessoa. A página de compartilhar mostra a coisa compartilhada e nada mais.

Na prática: o link do portfólio, o repositório, o PDF do desafio, o trecho de código que não sobreviveria às aspas tipográficas do chat — comece o compartilhamento antes da chamada e, na hora certa, diga o nome em voz alta. `brave-otter-42` atravessa uma chamada de voz intacto, que é exatamente a forma para a qual os nomes foram feitos, e o outro lado tem o arquivo antes de a frase acabar. Deixado privado, o compartilhamento ainda faz da chegada do entrevistador algo que você aprova no meio da chamada, não uma porta aberta; e quando a chamada termina, fechar a aba encerra o compartilhamento junto — nada fica esperando numa transcrição para ser relido fora de contexto depois.

Uma preparação honesta: entrevistadores estão em redes corporativas rígidas com mais frequência que a maioria dos leitores, e é lá que vive o raro par sem caminho direto. A rede deles não dá para testar de casa — mas a ferramenta anuncia a falha em vinte segundos em vez de ficar pendurada, e o plano B custa instantes, não a entrevista.

## Quando esta é a ferramenta errada

As duas pontas precisam estar presentes: isto é uma entrega em mãos, não uma caixa de correio. Se a outra pessoa está dormindo, use algo que guarde — sabendo disso. A aba que compartilha precisa ficar aberta e acordada, o que na prática significa que um desktop ou notebook compartilha; celulares suspendem abas em segundo plano em segundos, embora leiam um compartilhamento perfeitamente. Não tem como funcionar offline, caso único neste site, porque alcançar outra máquina é um ato de rede — a metade do editor, porém, funciona sem conexão nenhuma. E uma pequena minoria de pares de rede — tipicamente uma ponta na rede de endereços compartilhados de uma operadora de celular ou atrás de uma rede corporativa rígida — não consegue se unir diretamente; a ferramenta diz isso com clareza depois de vinte segundos e oferece ao leitor um retransmissor criptografado que repassa os bytes sem conseguir lê-los, em vez de passar para um em silêncio.

Para todo o resto — a nota, a senha, o arquivo de configuração, o vídeo de 100 MB a um pulo de Wi-Fi — a versão direta é mais rápida, mais simples, e deixa o mundo exatamente como o encontrou.
