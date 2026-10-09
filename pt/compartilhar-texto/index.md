# Compartilhar texto e arquivos — direto do seu navegador para o deles, sem upload

O compartilhamento vive nesta aba aberta. Os leitores o recebem criptografado, direto do seu navegador, e fechar a aba o encerra - nenhum servidor guarda nada.

> Envie texto ou arquivos de um navegador para outro por uma conexão direta e criptografada. Um nome de link que dá para falar em voz alta, atualização ao vivo enquanto digita, aprovação por leitor - e nada guardado em servidor nenhum, nunca. Grátis, sem cadastro.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/compartilhar-texto/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem textos e arquivos compartilhados. Não existe servidor.

O que você compartilha aqui viaja do seu navegador para o de cada leitor por um canal WebRTC criptografado de ponta a ponta, e para nenhum outro lugar. O único servidor envolvido — nomeado na `Content-Security-Policy` desta página, código no repositório — apresenta os dois navegadores um ao outro e lista os nomes de link locais visíveis na lista. Não guarda texto ou arquivos compartilhados, e o conteúdo nunca passa por ele. Os nomes da descoberta duram só enquanto quem compartilha continua conectado. Não há histórico de conteúdo nem conta. Feche esta aba e o compartilhamento acaba em todo lugar ao mesmo tempo, inclusive nas páginas abertas dos leitores.

- ✗ Nada armazenado
- ✗ Sem conta
- ✓ Criptografado de ponta a ponta
- ✓ Acaba com a sua aba
- ✓ Código aberto

## Como compartilhar texto e arquivos sem fazer upload para lugar nenhum

1. **Escreva o texto, ou anexe os arquivos.** O editor é o compartilhamento: o que estiver nele quando um leitor se conecta é o que ele recebe, e o que você mudar depois chega ao vivo aos leitores conectados, enquanto digita. Os arquivos viajam pelo mesmo canal, até 200 MB cada; os leitores veem a lista e baixam só o que pedirem, então ninguém gasta banda com um arquivo que não queria.
2. **Ligue o Markdown se o texto merecer formatação.** Uma chave só. Títulos, negrito, listas, código e links são renderizados ao vivo ao lado do editor enquanto você digita, e os leitores recebem a visão formatada por padrão, com um alternador para voltar ao texto original. O renderizador viaja com esta página e escapa tudo: texto compartilhado não pode virar script no computador de um leitor, não importa quem o escreveu.
3. **Dê um nome ao link, ou fique com a sugestão.** O nome é o endereço: `brave-otter-42` dá para falar de um lado a outro da sala, ler por telefone ou copiar de um quadro. Compartilhamentos locais visíveis listam seu nome, então mantenha Privado ativado para qualquer conteúdo sensível. Para um compartilhamento disponível só por link, um nome que ninguém adivinharia também ajuda. Um nome sob o qual outra pessoa já compartilha é recusado, e o seu fica livre assim que você para.
4. **Decida quem entra.** Privado é o padrão: cada leitor é convidado a se apresentar — um nome, uma pista, qualquer coisa que você reconheça — e você vê a mensagem com um botão para deixá-lo ler ou dispensá-lo. A apresentação viaja pelo canal direto, então nem o intermediário sabe quem bateu. Desmarque para um compartilhamento aberto, que qualquer um com o nome pode ler.
5. **Comece a compartilhar, e deixe a aba aberta.** A aba é o servidor: o compartilhamento fica acessível enquanto ela estiver aberta e acordada, e nem um instante a mais. Um notebook fechado também o encerra. Copie o link, ou apenas fale o nome: um leitor pode digitá-lo como `#name` no fim do endereço desta página. Para o modo Rede local, copie o link: ele contém `?local=1` antes do nome. Um leitor que usa outro modo precisa escolher antes de tentar de novo com o seu.
6. **Do outro lado: primeiro consentir, depois bater.** Quem abre o link fica sabendo que alguém está compartilhando, é avisado de que uma conexão direta mostra a cada lado o endereço de rede do outro, e só se conecta se decidir. Num compartilhamento privado, se apresenta e espera por você. O que ele recebe se atualiza ao vivo enquanto você edita, e some quando você fecha a aba.

## A versão longa

[Como compartilhar texto e arquivos entre dispositivos sem fazer upload](https://abox.tools/pt/guias/compartilhar-texto-entre-dispositivos/): Levar texto ou arquivos de um navegador para outro por uma conexão direta e criptografada: sem mandar e-mail para si mesmo, sem histórico de chat, sem conta, e sem servidor guardando cópia.

## Também na caixa

- [Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.
- [Leitor de QR Code e código de barras](https://abox.tools/pt/ler-qr-code/): Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.
- [Hash e checksum](https://abox.tools/pt/verificar-checksum/): Confira um download contra o número que quem publicou divulgou, sem mandar o arquivo para ninguém.
- [Gerador de senha e frase secreta](https://abox.tools/pt/gerador-de-senha/): Gerada aqui, pelo seu próprio navegador, e não enviada para lugar nenhum. Nada é guardado e não existe histórico.

## Perguntas

### Alguma coisa é enviada para algum lugar?

Não. O texto e os arquivos vão do seu navegador para o de cada leitor por um canal WebRTC criptografado, diretamente. O único servidor envolvido carrega a apresentação e os nomes de link locais cuja publicação foi escolhida, nunca o conteúdo. Não guarda texto nem bytes de arquivos. Salas e entradas de descoberta acabam com suas conexões abertas; os registros de conexão de sete dias da Cloudflare contêm metadados, nunca o conteúdo.

### Então por que esta ferramenta fala com um servidor, logo neste site?

Porque dois navegadores não conseguem se encontrar sozinhos: algo precisa juntar quem digitou `brave-otter-42` com quem compartilha sob esse nome, e levar a oferta de conexão entre os dois. Esse algo é o intermediário, a única dependência de rede desta página, nomeado na sua `Content-Security-Policy` e publicado no mesmo repositório da página. É o menor servidor capaz de fazer o trabalho. Ele também lista os nomes de link locais cuja publicação foi escolhida, para navegadores que usam o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Não guarda conteúdo nem consegue ler o canal criptografado entre os navegadores.

### O que exatamente esse servidor pode ver?

Que um nome de link está em uso, quando quem compartilha e os leitores se conectam e saem, seus endereços IP e o estabelecimento da conexão criptografada que trocam, e os nomes de link cuja publicação na descoberta foi escolhida. A lista de descoberta agrupa os nomes pelo endereço IPv4 público ou pela sub-rede IPv6 vistos pelo servidor, e pela origem da página. Não o texto, não os arquivos, não seus nomes nem tamanhos, não quem foi admitido a um compartilhamento privado, e não o que alguém escreveu ao se apresentar: tudo isso viaja pelo canal direto, criptografado de ponta a ponta, que não passa pelo servidor. A Cloudflare, que executa o servidor, guarda um registro de cada conexão por sete dias: o nome de link, o endereço e a hora. Nada mais sobrevive ao compartilhamento.

### O que acontece quando fecho a aba?

O compartilhamento acaba em todo lugar ao mesmo tempo. O link para de funcionar em um ou dois segundos, e os leitores que ainda tiverem a página aberta veem a própria cópia sumir, com um aviso de que o compartilhamento terminou. Não é um pedido de exclusão a um servidor: não há cópia em servidor para excluir. A aba era o único lugar onde o compartilhamento existia, e fechá-la é toda a limpeza que existe.

### Um leitor pode ficar com o que compartilhei?

Enquanto o compartilhamento está aberto, sim: compartilhar é isso. Um leitor pode copiar o texto ou baixar um arquivo, e o que ele levou é dele, exatamente como se você tivesse entregado por qualquer outro meio. O que encerrar garante é o futuro: ninguém novo chega, e as páginas abertas param de mostrar. Nenhuma ferramenta consegue des-enviar o que já chegou, e esta página não finge o contrário.

### O que é o modo privado?

O padrão. Cada leitor que chega fica sabendo que o compartilhamento é privado e é convidado a se apresentar; você vê a mensagem — “sou a Alice, da reunião” — com botões para deixá-lo ler ou dispensá-lo, e nada é enviado até você decidir. A apresentação viaja pelo canal direto já criptografado, então o servidor nunca sabe quem bateu nem o que você decidiu. Desmarcado antes de compartilhar, vira um compartilhamento aberto.

### Por que o leitor vai ver o meu endereço IP?

Porque a conexão é direta de verdade, e uma conexão direta corre entre dois endereços: cada ponta necessariamente conhece a da outra, como numa ligação telefônica. O leitor é avisado antes de existir qualquer conexão e só se conecta se decidir; até lá, você nem sabe que ele abriu o link. Se essa troca não servir para um compartilhamento específico, a alternativa é um serviço que passa por um servidor — com a troca contrária.

### Qual o tamanho máximo dos arquivos, e qual a velocidade?

Até 200 MB por arquivo, de qualquer tipo, e tão rápido quanto a mais lenta das duas conexões: não há servidor no meio para frear ou medir. Dois computadores com uma conexão local funcionando transferem em velocidade de rede local; VPNs e roteamento do navegador podem afetar o caminho. Os leitores baixam cada arquivo sob demanda, então anexar algo grande não custa nada até alguém realmente pedir.

### Funciona offline?

Metade, sendo honesto: o editor sim — a página carrega, seu rascunho está lá, o Markdown renderiza, e dá para escrever e salvar sem rede nenhuma. Compartilhar não, e não tem como: alcançar o navegador de outra pessoa é um ato de rede, e a apresentação precisa do intermediário. É a única ferramenta deste site cuja tarefa é impossível offline, e sugerir outra coisa seria desonesto.

### E se a gente não conseguir conectar?

A oferta de retransmissor descrita abaixo vale apenas para o modo de conexão normal. A maioria dos pares de navegadores se alcança diretamente depois de apresentada; uma minoria não, geralmente quando um dos lados está na rede de endereços compartilhados de uma operadora de celular ou atrás de uma rede corporativa rígida. Esta página nunca passa para um retransmissor em silêncio — isso mudaria o que esta ferramenta é sem dizer —: depois de vinte segundos ela diz com clareza que não houve conexão direta e oferece um ao leitor: um retransmissor mantido pela Cloudflare que repassa os bytes criptografados entre os dois navegadores e não consegue lê-los, porque a chave nunca sai das duas pontas. O leitor o escolhe de forma explícita, na própria página, depois de saber o que ele vê — os dois endereços, como a conexão direta veria —, e ali também nada é guardado. O seu lado não muda: seu navegador continua enviando só para aquele leitor, como faria se ele estivesse atrás de uma VPN. O modo Rede local nunca oferece um retransmissor. Confira se os dois dispositivos usam a mesma rede Wi-Fi ou Ethernet e se o isolamento da rede de convidados, um firewall ou uma VPN está bloqueando a conexão.

### Renderizar Markdown é seguro, se qualquer um pode compartilhar qualquer coisa?

Essa pergunta é o motivo de o renderizador ser oitenta linhas no código desta página e não uma biblioteca. Cada caractere é escapado antes de qualquer tag ser emitida, só um conjunto fixo de tags inofensivas pode nascer, e os links aceitam só `http`, `https` e `mailto`: um link `javascript:` fica como texto inerte. Texto compartilhado não pode virar script no seu computador, não importa quem o escreveu, e as oitenta linhas dá para ler.

### Duas pessoas podem compartilhar sob o mesmo nome?

Ao mesmo tempo, não. Um compartilhamento vivo por nome, imposto no intermediário: quem chega em segundo é recusado e convidado a escolher outro nome. Assim que um compartilhamento acaba, o nome fica livre de novo — o que também significa que um link guardado vale o que valer o compartilhamento por trás dele: o mesmo nome, semana que vem, pode ser de outra pessoa. Trate um link como algo de um momento, não de uma pessoa.

### É grátis? Preciso de conta?

Grátis, sem conta, sem cadastro, e sem limite digno de menção: dezesseis leitores simultâneos por compartilhamento. O site carrega publicidade, que é o que o paga; os anúncios não recebem nada sobre o que esta página compartilha, e o intermediário cabe com folga num plano gratuito justamente porque não guarda nada e quase não faz nada.

### Posso compartilhar arquivos pela minha rede local?

Sim. Antes de começar, escolha Rede local — sem retransmissor de internet, conecte os dois dispositivos à mesma rede Wi-Fi ou Ethernet e copie o link para o leitor. O link inclui o modo; um leitor que usa outro modo precisa escolher explicitamente antes de tentar de novo com o modo de quem compartilha. A apresentação dos navegadores ainda precisa de internet. Este modo não usa descoberta pública de endereços e nunca passa a um retransmissor de internet. Uma VPN ou as políticas de rede do navegador podem mudar o caminho ou impedir a conexão; a opção não prova que os bytes ficam dentro de um prédio. A aprovação privada continua ativada por padrão e o limite continua sendo de 200 MB por arquivo. Uma sessão pode incluir até 256 arquivos. Visível na lista vem ativado neste modo: o outro navegador pode abrir a página da ferramenta e escolher seu nome na lista desta conexão. Desmarque para compartilhar só por link; você também pode continuar copiando o link para o leitor.

### Como a lista encontra compartilhamentos locais?

Abrir a página inicial desta ferramenta pede ao intermediário os nomes de link visíveis na lista de navegadores que usam o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Normalmente isso significa o mesmo roteador, mas uma VPN compartilhada ou um provedor que compartilha um endereço pode incluir outras redes. Se alguns dispositivos usam IPv4 e outros IPv6, ou seguem caminhos diferentes, podem não aparecer mesmo estando na mesma rede local. A lista não comprova uma mesma rede local física. É preciso ter internet. Só aparecem compartilhamentos no modo Rede local. Escolha esse modo antes de começar, pois vem desativado por padrão. Compartilhamentos locais são anunciados por padrão; desmarque Visível na lista para compartilhar só por link e mantenha Privado ativado em redes compartilhadas. Escolher um nome abre a página de consentimento do compartilhamento; nunca conecta automaticamente nem dispensa a aprovação privada. O diretório mantém só os nomes de link enquanto quem compartilha continua conectado, nunca o texto, os nomes de arquivo ou os bytes dos arquivos. Se a descoberta estiver indisponível, compartilhar por link continua funcionando.

## Como dá para conferir a promessa de privacidade

- **O conteúdo vai para o seu leitor, e para nenhum outro lugar.** O texto e os arquivos passam por um canal de dados WebRTC: uma conexão direta, criptografada com DTLS, entre seu navegador e o de cada leitor. Não há servidor nesse caminho. O modo Rede local usa os endereços de rede dos próprios navegadores, sem descoberta pública de endereços nem retransmissor de internet. Uma VPN ou as políticas de rede do navegador podem afetar o caminho desses endereços; isso não é uma garantia sobre um prédio físico. No modo normal, um leitor que não pode ser alcançado diretamente pode escolher na própria página um retransmissor criptografado, que encaminha o mesmo conteúdo criptografado sem poder lê-lo.
- **O que é o intermediário, e tudo o que ele vê.** Uma conexão direta precisa de uma apresentação. Esta página inicial abre automaticamente um WebSocket para o nosso intermediário para os nomes de link locais visíveis na lista; começar a compartilhar abre outro para o próprio compartilhamento. Um leitor usa um único socket de apresentação. Ele junta quem digitou um nome de link com quem compartilha sob esse nome, repassa alguns kilobytes de negociação e não retém nada: nunca grava armazenamento, e uma sala deixa de existir assim que quem compartilha se desconecta. Ele pode ver que um nome está em uso, quando cada um chega e sai, e os endereços IP. Não pode ver o texto, os arquivos, quem foi admitido nem o que alguém escreveu: até a batida numa porta privada viaja pelo canal direto criptografado. O código completo dele está no repositório, ao lado do desta ferramenta. O diretório lista só os nomes anunciados por quem continua conectado com o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Isso pode incluir outras redes por trás de uma VPN compartilhada ou de um endereço compartilhado pelo provedor. Se alguns dispositivos usam IPv4 e outros IPv6, ou seguem caminhos diferentes, podem não aparecer mesmo estando na mesma rede local. O que sobrevive a um compartilhamento é uma coisa só: a Cloudflare, que executa o servidor, guarda um registro de cada conexão por sete dias, com o nome de link, o endereço e a hora, nunca o conteúdo.
- **Nada é armazenado: fechar a aba é a exclusão.** O compartilhamento existe só enquanto a sua aba está aberta. Feche-a e leitores novos não encontram mais nada, e quem estava lendo vê a própria cópia sumir — embora o que alguém copiou ou baixou antes seja dele, como seria qualquer coisa que você tivesse entregado em mãos. O rascunho que você digita fica no armazenamento do seu próprio navegador, para estar aqui da próxima vez, e só nele; marcado como descartável, não fica em lugar nenhum.
- **O nome do link é um endereço, e Privado é a tranca.** Qualquer um que conheça ou adivinhe um nome pode abrir o que está por trás. Por isso as sugestões são nomes que dá para falar em voz alta. Compartilhamentos locais visíveis publicam seu nome na lista desta conexão: o nome fica público para navegadores que usam o mesmo endereço IPv4 público ou a mesma sub-rede IPv6. Mantenha Privado ativado para qualquer conteúdo sensível. Ele já vem ativado: cada leitor que chega precisa se apresentar, pelo canal direto, e nada é enviado até você deixá-lo entrar.
- **Uma conexão direta mostra a cada lado o endereço do outro.** É isso que ponto a ponto significa, e o leitor sabe antes de acontecer: abrir um link compartilhado só pergunta ao intermediário se alguém está compartilhando; depois a página diz com clareza que conectar revela a cada lado o endereço IP do outro, e espera um clique. Até esse clique, quem compartilha nem sabe que o leitor existe.
- **O que o Google carrega, e o que ele não recebe.** Os scripts de anúncio e medição vêm do Google, e o botão de doação, do Buy Me a Coffee. Nenhum deles recebe o texto, os arquivos, seus nomes ou tamanhos, nem quem se conectou. A exceção é o próprio endereço desta página: o link de um leitor carrega o nome do link, e o script de anúncio lê o endereço. Um compartilhamento que deva ficar em segredo quer o interruptor de privado. Cada linha que toca o conteúdo é servida desta origem e está no repositório.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/main.js` para as duas metades da troca — a aba de quem compartilha e a do leitor são o mesmo arquivo — e `src/markdown.js` para o renderizador que processa texto vindo do outro lado do fio, e que por isso escapa tudo antes de emitir qualquer coisa. O código completo do servidor é `workers/rendezvous/worker.js`, no mesmo repositório: uma sala por nome de link, mais um diretório de descoberta com os nomes anunciados em conexões abertas, nunca o texto ou os arquivos.
