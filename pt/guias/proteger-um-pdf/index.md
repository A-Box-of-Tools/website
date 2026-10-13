# Como proteger um PDF com senha e entender a proteção

Uma senha de abertura impede a leitura por quem não a tem. Uma restrição de impressão ou cópia pede ao leitor que impeça essas ações. Ambas têm utilidade, mas a diferença determina o que você pode prometer ao enviar o arquivo.

[Abrir Proteger PDF](https://abox.tools/pt/proteger-pdf/): Proteja um documento sem entregá-lo a um site para fazer isso.

Última atualização 12 de setembro de 2026

## Como começar

Abra [Proteger PDF](https://abox.tools/pt/proteger-pdf/), escolha o documento, digite a senha duas vezes e aperte o botão. O arquivo é criptografado no navegador com AES-256. Antes de oferecer o download, a página tenta abrir o resultado sem senha, o que deve falhar, e depois com a senha escolhida. Nada é enviado; funciona da mesma forma com a internet desligada.

O restante do guia explica o que essa ação faz. Senha e restrição não são equivalentes, e a diferença determina quais garantias você pode dar sobre o arquivo.

## As duas proteções de um PDF

Um PDF pode ter duas senhas, embora os leitores as apresentem de forma tão parecida que a diferença costuma passar despercebida.

A **senha de abertura**, ou de *usuário*, bloqueia a leitura. O conteúdo é criptografado com uma chave derivada dela, e a senha não fica gravada no documento. Sem a credencial necessária, nem o destinatário, nem um site, nem o programa que criou o PDF consegue ler seu conteúdo.

As **restrições** de impressão, cópia e edição, controladas pela senha de *proprietário*, são pedidos. Um documento que abre sem pedir senha *precisa conter o necessário para derivar sua própria chave*, pois o leitor acabou de fazer isso. O bloqueio de impressão depende de um campo separado de permissões que os programas concordam em respeitar. A Adobe documenta esse funcionamento desde o início. Qualquer leitor pode ignorar o pedido; o [desbloqueador deste site](https://abox.tools/pt/guias/desbloquear-um-pdf/) é um deles.

Isso não torna as restrições inúteis. Muitos leitores as respeitam, e marcar “não permitir impressão” comunica sua preferência. Mas não confie nelas como garantia. Para impedir que a pessoa errada leia o arquivo, defina uma senha de abertura. Para pedir que ele não seja impresso, marque a restrição sabendo que ela é um pedido.

## Qual criptografia escolher

A ferramenta oferece duas opções. Mantenha a padrão, a menos que exista uma necessidade específica.

- **AES-256**, método do PDF 2.0 de 2017, é o padrão. A senha passa por um cálculo deliberadamente custoso, com número de rodadas dependente dos dados, o que dificulta acelerar tentativas com equipamento dedicado. Leitores desde o Acrobat X, de 2010, navegadores, celulares e leitores atuais conseguem abri-lo. A segurança depende da senha escolhida.
- **AES-128**, método de 2005, serve para um leitor anterior a 2010 que precise abrir o arquivo. A cifra é adequada; o ponto mais fraco é a etapa de 1994 que transforma a senha em chave, barata o bastante para facilitar tentativas. Se não souber qual leitor será usado, escolha 256.

Ambas diferem muito da primeira geração de criptografia PDF, com chave de 40 bits de 1994 que um computador comum consegue testar por completo. Os leitores chamam todas de “protegido por senha”. Se alguém disser que o documento é seguro por ter senha, pergunte qual método foi usado. O [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) identifica isso.

## Por que a senha continua sendo decisiva

No AES-256 atual, não há um atalho conhecido para ignorar a criptografia; tentar senhas é o caminho de ataque, e o cálculo torna cada tentativa lenta. Lento não significa impossível. Uma palavra curta oferece muito menos possibilidades que uma frase longa. A página conta os caracteres e avisa quando a senha é curta. A regra prática é simples: a segurança do documento depende da senha, e usar uma longa não custa nada.

Digite-a duas vezes, como a página exige: um erro de digitação pode impedir o acesso ao resultado. E guarde o original. A proteção cria outro arquivo e deixa o primeiro intacto; ele será útil se você perder a senha.

## Se você esquecer a senha

Você pode perder o acesso ao documento. É melhor entender isso antes de entregar o arquivo a um serviço que promete recuperar senhas. Esses serviços fazem tentativas com dicionários, padrões e combinações. Uma senha forte no método atual pode tornar essa busca impraticável. Muitos enviam o arquivo a um servidor e alguns cobram antes de informar se houve resultado.

Este site não tenta adivinhar senhas. O desbloqueador não faz esse tipo de busca, e a proteção pede confirmação justamente porque não oferece recuperação. É uma escolha deliberada, não uma função esquecida.

## Por que evitar o envio para proteger

Pense no conteúdo: extrato, contrato, documento médico, declaração de imposto ou cópia de passaporte para alugar um imóvel. Um arquivo que merece senha costuma ser justamente aquele que você não quer deixar com terceiros.

Um serviço que processa no servidor precisa receber primeiro o original desbloqueado e, depois, a senha escolhida. Mesmo com boas intenções, ele passa a ter o conteúdo privado e a credencial, e você não consegue verificar de fora todos os detalhes de retenção.

Isso não é necessário para a tarefa. Derivar uma chave, executar a cifra e gravar os bytes são operações que o navegador faz localmente. É o que [esta ferramenta](https://abox.tools/pt/proteger-pdf/) faz: documento e senha ficam na aba. A política da página lista os endereços permitidos, e nenhum pertence a este site. Desligue a rede e use a ferramenta para conferir.

Os guias [é seguro enviar arquivos?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) e [é seguro enviar um extrato bancário?](https://abox.tools/pt/guias/e-seguro-enviar-um-extrato-bancario/) discutem essa escolha em mais detalhes.

## O que muda no arquivo

**Uma assinatura digital perde a validade.** Ela cobre os bytes exatos do arquivo, e a proteção gera novos bytes. Qualquer programa que fizesse essa alteração teria o mesmo efeito. Se precisar de proteção e assinatura, proteja primeiro e assine a cópia protegida.

**O tamanho muda um pouco.** A criptografia acrescenta bytes a fluxos e strings, enquanto a regravação descarta cópias antigas de objetos substituídos em edições anteriores. O resultado pode aumentar ou diminuir; essa não é a finalidade da operação.

**As páginas permanecem iguais.** Nada é redesenhado, recodificado ou reorganizado. Instruções, fontes e imagens são criptografadas como chegaram. Para quem tem a senha, o texto continua selecionável, as digitalizações mantêm a resolução e nada muda de lugar.

## Trocar uma senha existente

O formato não permite colocar uma segunda camada de senha sobre a primeira. Um arquivo que já exige senha é encaminhado ao [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/). Remova a proteção antiga no mesmo navegador e traga a cópia para aplicar a nova. Um documento com apenas restrições, que abre para qualquer pessoa, é aceito diretamente; a página avisa que as novas escolhas substituirão as anteriores.

## Faça as outras alterações antes

Depois de protegido com senha, o documento precisa passar pelo desbloqueador antes de ser usado nas outras ferramentas. Portanto, primeiro [junte ou divida as páginas](https://abox.tools/pt/juntar-pdf/), [reduza o tamanho](https://abox.tools/pt/comprimir-pdf/) e, principalmente, [remova os dados que não devem aparecer](https://abox.tools/pt/tarjar-pdf/). A senha impede o acesso de quem não a tem; não esconde informações da pessoa que receberá a senha.
