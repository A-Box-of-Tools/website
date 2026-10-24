# Compartilhar texto e arquivos

Compartilhe texto e arquivos criptografados a partir do navegador aberto. A conexão direta é o padrão; a retransmissão na nuvem é opcional. Você aprova cada leitor.

> Compartilhe texto e arquivos criptografados a partir do navegador aberto. A conexão direta é o padrão; a retransmissão na nuvem é opcional. Você aprova cada leitor.

Esta é uma ferramenta interativa de navegador em https://abox.tools/pt/compartilhar-texto/. Os arquivos são processados no dispositivo que executa esse navegador. Compartilhamento deliberado e funções opcionais de rede são explicados na página. A seguir está sua explicação escrita; abra o endereço para usá-la.

## Seus textos e arquivos compartilhados são **processados no navegador**. Sem envio para processamento.

Texto e arquivos são criptografados entre seu navegador e cada leitor. A conexão direta é o padrão. Ao escolher retransmissão na nuvem, os pacotes criptografados passam pela Cloudflare, que não consegue ler o conteúdo. O serviço de apresentação transmite a preparação e os nomes de links visíveis, nunca textos ou arquivos. Não guardamos conteúdo compartilhado em servidores. Fechar a aba encerra a origem; os leitores limpam a visualização após o aviso de encerramento ou uma falha detectada. Cópias já salvas continuam com eles.

- ✗ Sem conteúdo armazenado em servidores
- ✗ Sem conta
- ✓ Criptografado de ponta a ponta
- ✓ Acaba com a sua aba
- ✓ Código aberto

## Como compartilhar texto e arquivos entre navegadores

1. **Escreva o texto, ou anexe os arquivos.** O editor é o compartilhamento: o que estiver nele quando um leitor se conecta é o que ele recebe, e o que você mudar depois chega ao vivo aos leitores conectados, enquanto digita. Os arquivos viajam pelo mesmo canal, até 200 MB cada; os leitores veem a lista e baixam só o que pedirem, então ninguém gasta banda com um arquivo que não queria.
2. **Ligue o Markdown se o texto merecer formatação.** Uma chave só. Títulos, negrito, listas, código e links são renderizados ao vivo ao lado do editor enquanto você digita, e os leitores recebem a visão formatada por padrão, com um alternador para voltar ao texto original. O renderizador viaja com esta página e escapa tudo: texto compartilhado não pode virar script no computador de um leitor, não importa quem o escreveu.
3. **Dê um nome ao link, ou fique com a sugestão.** O nome é o endereço: `brave-otter-42` dá para falar de um lado a outro da sala, ler por telefone ou copiar de um quadro. Compartilhamentos locais visíveis listam seu nome, então mantenha Privado ativado para qualquer conteúdo sensível. Para um compartilhamento disponível só por link, um nome que ninguém adivinharia também ajuda. Um nome sob o qual outra pessoa já compartilha é recusado, e o seu fica livre assim que você para.
4. **Decida quem entra.** Privado é o padrão: cada leitor é convidado a se apresentar — um nome, uma pista, qualquer coisa que você reconheça — e você vê a mensagem com um botão para deixá-lo ler ou dispensá-lo. A apresentação viaja pelo canal direto, então nem o intermediário sabe quem bateu. Desmarque para um compartilhamento aberto, que qualquer um com o nome pode ler.
5. **Comece a compartilhar, e deixe a aba aberta.** A aba é o servidor. Mantenha-a aberta e o dispositivo ativo para compartilhar sem interrupções. Uma conexão que funciona continua aberta quando a página fica oculta, mas o telefone ou um notebook em suspensão pode pausar o navegador. Ao voltar, a página tenta restaurar o mesmo compartilhamento. Parar de compartilhar impede a retomada automática. Copie o link ou diga o nome: o leitor pode acrescentar `#name` ao endereço desta página. No modo Rede local, copie o link que contém `?local=1` antes do nome. Uma mudança no modo de conexão exige a escolha do leitor.
6. **Do outro lado: primeiro consentir, depois bater.** Quem abre o link fica sabendo que alguém está compartilhando, é avisado de que uma conexão direta mostra a cada lado o endereço de rede do outro, e só se conecta se decidir. Num compartilhamento privado, se apresenta e espera por você. O que ele recebe se atualiza ao vivo enquanto você edita, e some quando você fecha a aba.

## A versão longa

[Como compartilhar texto e arquivos sem guardar cópia no servidor](https://abox.tools/pt/guias/compartilhar-texto-entre-dispositivos/): Compartilhe texto e arquivos entre navegadores com conexão direta por padrão ou retransmissão criptografada opcional pela Cloudflare. Sem conta nem cópia armazenada no servidor; o destinatário pode guardar o que receber.

## Também na caixa

- [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.
- [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.
- [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.
- [WebP para JPG](https://abox.tools/pt/webp-para-jpg/): As imagens que a web salva, no formato que todos ainda aceitam.

## Perguntas

### Alguma coisa é enviada para algum lugar?

Texto e arquivos são criptografados entre seu navegador e cada leitor. A conexão direta é o padrão. Ao escolher retransmissão na nuvem, os pacotes criptografados passam pela Cloudflare, que não consegue ler o conteúdo. O serviço de apresentação transmite a preparação e os nomes de links visíveis, nunca textos ou arquivos. Não guardamos conteúdo compartilhado em servidores. Fechar a aba encerra a origem; os leitores limpam a visualização após o aviso de encerramento ou uma falha detectada. Cópias já salvas continuam com eles. A Cloudflare mantém os metadados das conexões de apresentação por sete dias; nosso aplicativo não registra conteúdo compartilhado.

### Então por que esta ferramenta fala com um servidor, logo neste site?

Porque dois navegadores não conseguem se encontrar sozinhos: algo precisa juntar quem digitou `brave-otter-42` com quem compartilha sob esse nome, e levar a oferta de conexão entre os dois. Esse algo é o intermediário, a única dependência de rede desta página, nomeado na sua `Content-Security-Policy` e publicado no mesmo repositório da página. É o menor servidor capaz de fazer o trabalho. Ele também lista os nomes de link locais cuja publicação foi escolhida, para navegadores que usam o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Não guarda conteúdo nem consegue ler o canal criptografado entre os navegadores.

### O que exatamente esse servidor pode ver?

Que um nome de link está em uso, quando quem compartilha e os leitores se conectam e saem, seus endereços IP e o estabelecimento da conexão criptografada que trocam, e os nomes de link cuja publicação na descoberta foi escolhida. A lista de descoberta agrupa os nomes pelo endereço IPv4 público ou pela sub-rede IPv6 vistos pelo servidor, e pela origem da página. Não o texto, não os arquivos, não seus nomes nem tamanhos, não quem foi admitido a um compartilhamento privado, e não o que alguém escreveu ao se apresentar: tudo isso viaja pelo canal direto, criptografado de ponta a ponta, que não passa pelo servidor. A Cloudflare, que executa o servidor, guarda um registro de cada conexão por sete dias: o nome de link, o endereço e a hora. Nada mais sobrevive ao compartilhamento.

### O que acontece quando fecho a aba?

O compartilhamento termina quando sua única fonte desaparece. Os leitores limpam a cópia exibida ao detectar o fim ou uma falha na conexão. Parar de compartilhar envia um aviso explícito de encerramento; uma perda temporária de rede pode iniciar um número limitado de tentativas de recuperação. Não existe cópia no servidor para excluir. O que já foi copiado ou baixado permanece com os leitores.

### Um leitor pode ficar com o que compartilhei?

Enquanto o compartilhamento está aberto, sim: compartilhar é isso. Um leitor pode copiar o texto ou baixar um arquivo, e o que ele levou é dele, exatamente como se você tivesse entregado por qualquer outro meio. O que encerrar garante é o futuro: ninguém novo chega, e as páginas abertas param de mostrar. Nenhuma ferramenta consegue des-enviar o que já chegou, e esta página não finge o contrário.

### O que é o modo privado?

O padrão. Cada leitor que chega fica sabendo que o compartilhamento é privado e é convidado a se apresentar; você vê a mensagem — “sou a Alice, da reunião” — com botões para deixá-lo ler ou dispensá-lo, e nada é enviado até você decidir. A apresentação viaja pelo canal direto já criptografado, então o servidor nunca sabe quem bateu nem o que você decidiu. Desmarcado antes de compartilhar, vira um compartilhamento aberto.

### Por que o leitor vai ver o meu endereço IP?

A conexão direta troca os endereços de rede necessários para alcançar os dispositivos. A retransmissão na nuvem usa endereços de retransmissão, e a Cloudflare vê os endereços dos dois dispositivos e os metadados do tráfego. Isso não garante anonimato. Confira o tipo de conexão indicado. Escolha Entrar em um item da lista ou Conectar após abrir um convite comum.

### Qual o tamanho máximo dos arquivos, e qual a velocidade?

Até 200 MB por arquivo. A velocidade depende dos dois dispositivos e do caminho da rede. A conexão direta pode usar a velocidade da rede local; a retransmissão na nuvem também depende da banda de internet e dos limites do serviço. Os leitores buscam arquivos sob demanda.

### Funciona offline?

O editor funciona sem internet depois que a página é salva: você pode escrever, visualizar Markdown e manter um rascunho. Para compartilhar, os dois dispositivos precisam de internet para que o serviço de apresentação conecte os navegadores. Salvar a página não permite parear sem internet. O modo de rede local também precisa dessa apresentação, embora o conteúdo viaje diretamente entre os navegadores.

### E se a gente não conseguir conectar?

Confira a internet nos dois dispositivos. Em Rede local, o Wi-Fi ou Ethernet precisa permitir a comunicação entre eles. Se a conexão direta falhar, o anfitrião pode parar, escolher retransmissão na nuvem, iniciar novamente e enviar o novo convite. O leitor confere a opção antes de conectar. Um compartilhamento direto ativo nunca muda automaticamente. Dispositivos gerenciados e redes restritivas também podem bloquear a retransmissão.

### Renderizar Markdown é seguro, se qualquer um pode compartilhar qualquer coisa?

Essa pergunta é o motivo de o renderizador ser oitenta linhas no código desta página e não uma biblioteca. Cada caractere é escapado antes de qualquer tag ser emitida, só um conjunto fixo de tags inofensivas pode nascer, e os links aceitam só `http`, `https` e `mailto`: um link `javascript:` fica como texto inerte. Texto compartilhado não pode virar script no seu computador, não importa quem o escreveu, e as oitenta linhas dá para ler.

### Duas pessoas podem compartilhar sob o mesmo nome?

Ao mesmo tempo, não. Um compartilhamento vivo por nome, imposto no intermediário: quem chega em segundo é recusado e convidado a escolher outro nome. Assim que um compartilhamento acaba, o nome fica livre de novo — o que também significa que um link guardado vale o que valer o compartilhamento por trás dele: o mesmo nome, semana que vem, pode ser de outra pessoa. Trate um link como algo de um momento, não de uma pessoa.

### É grátis? Preciso de conta?

Grátis, sem conta, sem cadastro, e sem limite digno de menção: dezesseis leitores simultâneos por compartilhamento. O site carrega publicidade, que é o que o paga; os anúncios não recebem nada sobre o que esta página compartilha, e o intermediário cabe com folga num plano gratuito justamente porque não guarda nada e quase não faz nada.

### Posso compartilhar arquivos pela minha rede local?

Sim. Antes de começar, escolha Rede local — sem retransmissor de internet, conecte os dois dispositivos à mesma rede Wi-Fi ou Ethernet e copie o link para o leitor. O link inclui o modo; um leitor que usa outro modo precisa escolher explicitamente antes de tentar de novo com o modo de quem compartilha. A apresentação dos navegadores ainda precisa de internet. Este modo não usa descoberta pública de endereços e nunca passa a um retransmissor de internet. Uma VPN ou as políticas de rede do navegador podem mudar o caminho ou impedir a conexão; a opção não prova que os bytes ficam dentro de um prédio. A aprovação privada continua ativada por padrão e o limite continua sendo de 200 MB por arquivo. Uma sessão pode incluir até 256 arquivos. Visível na lista vem ativado neste modo: o outro navegador pode abrir a página da ferramenta e escolher seu nome na lista desta conexão. Desmarque para compartilhar só por link; você também pode continuar copiando o link para o leitor.

### Como a lista encontra compartilhamentos locais?

A lista agrupa compartilhamentos pelo endereço IPv4 público ou sub-rede IPv6 e pela origem da página, não pela proximidade física. Gateways compartilhados e VPNs podem incluir desconhecidos ou ocultar dispositivos. É preciso internet. Só aparecem compartilhamentos diretos locais ou por retransmissão na nuvem com visibilidade ativada. Descobrível é selecionado por padrão quando disponível; desmarque para usar apenas links e mantenha Privado em redes compartilhadas. Entrar inicia a solicitação com o tipo de conexão indicado em uma nova aba de leitura. Consultar a lista não conecta. Compartilhamentos privados aguardam aprovação; a solicitação aparece em uma caixa de diálogo e fica na lista após Revisar depois.

## Como dá para conferir a promessa de privacidade

- **Você escolhe o caminho da conexão criptografada.** A conexão direta envia conteúdo entre navegadores sem retransmissão. O modo direto comum usa descoberta pública de endereços; Rede local o limita a candidatos de host. A retransmissão na nuvem encaminha pacotes criptografados pelo Cloudflare TURN e pode conectar dispositivos em redes diferentes. O anfitrião escolhe antes de iniciar; o convite inclui a opção, e os leitores a conferem antes de conectar. A conexão direta nunca muda automaticamente. Restrições de rede ou do navegador podem impedir ambos os caminhos.
- **O que é o intermediário, e tudo o que ele vê.** Uma conexão direta precisa de uma apresentação. Esta página inicial abre automaticamente um WebSocket para o nosso intermediário para os nomes de link locais visíveis na lista; começar a compartilhar abre outro para o próprio compartilhamento. Um leitor usa um único socket de apresentação. Ele junta quem digitou um nome de link com quem compartilha sob esse nome, repassa alguns kilobytes de negociação e não retém nada: nunca grava armazenamento, e uma sala deixa de existir assim que quem compartilha se desconecta. Ele pode ver que um nome está em uso, quando cada um chega e sai, e os endereços IP. Não pode ver o texto, os arquivos, quem foi admitido nem o que alguém escreveu: até a batida numa porta privada viaja pelo canal direto criptografado. O código completo dele está no repositório, ao lado do desta ferramenta. O diretório lista só os nomes anunciados por quem continua conectado com o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Isso pode incluir outras redes por trás de uma VPN compartilhada ou de um endereço compartilhado pelo provedor. Se alguns dispositivos usam IPv4 e outros IPv6, ou seguem caminhos diferentes, podem não aparecer mesmo estando na mesma rede local. O que sobrevive a um compartilhamento é uma coisa só: a Cloudflare, que executa o servidor, guarda um registro de cada conexão por sete dias, com o nome de link, o endereço e a hora, nunca o conteúdo.
- **O conteúdo compartilhado não fica em um servidor.** O compartilhamento existe só enquanto a sua aba está aberta. Feche-a e leitores novos não encontram mais nada, e quem estava lendo vê a própria cópia sumir — embora o que alguém copiou ou baixou antes seja dele, como seria qualquer coisa que você tivesse entregado em mãos. O rascunho que você digita fica no armazenamento do seu próprio navegador, para estar aqui da próxima vez, e só nele; marcado como descartável, não fica em lugar nenhum. Separadamente, o navegador do leitor guarda um comprovante aleatório de aprovação para desconectar e voltar a esta sessão sem nova aprovação. Parar o anfitrião redefine a aprovação. Descartável desativa o armazenamento do rascunho, não deste comprovante. Limpar ou bloquear os dados do site pode exigir nova aprovação; os scripts normais deste site podem ler o comprovante.
- **O nome do link é um endereço, e Privado é a tranca.** Qualquer um que conheça ou adivinhe um nome pode abrir o que está por trás. Por isso as sugestões são nomes que dá para falar em voz alta. Compartilhamentos locais visíveis publicam seu nome na lista desta conexão: o nome fica público para navegadores que usam o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Mantenha Privado ativado para qualquer conteúdo sensível. Ele já vem ativado: cada leitor que chega precisa se apresentar, pelo canal direto, e nada é enviado até você deixá-lo entrar.
- **Uma conexão direta mostra a cada lado o endereço do outro.** A conexão direta troca os endereços de rede necessários para alcançar os dispositivos. A retransmissão na nuvem usa endereços de retransmissão, e a Cloudflare vê os endereços dos dois dispositivos e os metadados do tráfego. Isso não garante anonimato. Confira a opção de conexão acima antes de escolher Conectar.
- **O que o Google carrega, e o que ele não recebe.** Os scripts de anúncio e medição vêm do Google, e o botão de doação, do Buy Me a Coffee. Nenhum deles recebe o texto, os arquivos, seus nomes ou tamanhos, nem quem se conectou. A exceção é o próprio endereço desta página: o link de um leitor carrega o nome do link, e o script de anúncio lê o endereço. Um compartilhamento que deva ficar em segredo quer o interruptor de privado. Cada linha que toca o conteúdo é servida desta origem e está no repositório.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/main.js` para as duas metades da troca — a aba de quem compartilha e a do leitor são o mesmo arquivo — e `src/markdown.js` para o renderizador que processa texto vindo do outro lado do fio, e que por isso escapa tudo antes de emitir qualquer coisa. O código completo do servidor é `workers/rendezvous/worker.js`, no mesmo repositório: uma sala por nome de link, mais um diretório de descoberta com os nomes anunciados em conexões abertas, nunca o texto ou os arquivos.
