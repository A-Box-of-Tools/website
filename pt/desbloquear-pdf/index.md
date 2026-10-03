# Desbloquear PDF — remova a senha e as restrições

Muitos PDFs protegidos não exigem senha. Descubra qual tipo você tem antes de alterar o arquivo.

> Remova a senha e as restrições de impressão, cópia e edição de um PDF no navegador. A ferramenta identifica o tipo de proteção, não adivinha senhas e não envia nada.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/desbloquear-pdf/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem documentos. Não existe servidor.

O documento é aberto, descriptografado e gravado na memória deste computador por código servido deste endereço. Nada aqui faz envio, e não há servidor do outro lado para recebê-lo. Nem o arquivo nem a senha digitada saem desta aba.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como remover a senha ou as restrições de um PDF

1. **Escolha o PDF.** Um documento por vez, lido diretamente do disco pelo navegador. Primeiro, a ferramenta tenta abri-lo com senha vazia, o que funciona para muitos arquivos protegidos porque eles têm apenas restrições.
2. **Leia o que a página encontrou.** Ela informa o tipo de proteção, o método usado e sua força atual. Também lista as restrições pedidas ao leitor: impressão, cópia, edição, comentários, preenchimento de formulários, reordenação de páginas e até leitura em voz alta para pessoas com deficiência visual.
3. **Digite a senha somente se ela for pedida.** O campo aparece apenas quando a senha vazia não abre o documento. São aceitas tanto a senha de abertura quanto a de proprietário. A ferramenta não tenta adivinhar nenhuma delas, e o que você digita fica nesta aba.
4. **Remova a proteção e confira a confirmação.** O documento é descriptografado com sua própria chave e gravado sem dicionário de criptografia. Depois, é reaberto sem senha por um leitor que recusa arquivos criptografados. Se não abrir ou apresentar outra quantidade de páginas, a ferramenta informa a falha e não oferece download.

## A versão longa

[Como desbloquear um PDF e identificar o tipo de proteção](https://abox.tools/pt/guias/desbloquear-um-pdf/): Um PDF que não imprime e outro que não abre têm problemas diferentes. Saiba qual proteção existe, quando um clique resolve e quando é indispensável ter a senha.

## Também na caixa

- [Proteger PDF](https://abox.tools/pt/proteger-pdf/): Proteja um documento sem entregá-lo a um site para fazer isso.
- [Marca d’água em PDF](https://abox.tools/pt/marca-dagua-pdf/): Uma cópia com o destinatário identificado não passa despercebida se aparecer em outro lugar.
- [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/): As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.
- [PDF para CSV](https://abox.tools/pt/pdf-para-csv/): Encontra as tabelas de um PDF e as transforma em linhas que uma planilha consegue abrir.

## Perguntas

### Preciso da senha?

Muitas vezes, não. A página informa isso logo após a escolha do arquivo. Muitos PDFs protegidos, como extratos, holerites e relatórios com edição restrita, abrem para qualquer pessoa e só contêm uma lista de ações que o leitor deve impedir. Essas restrições saem com um clique, sem senha. Se o documento realmente pede senha para abrir, você precisa fornecê-la.

### A ferramenta abre um PDF cuja senha eu não tenho?

Não, e não tenta. Não há dicionário, lista de palavras nem busca por força bruta; isso pode ser conferido em `src/shared/pdf-crypt.js`. Mesmo os documentos antigos com chaves de 40 bits, que permitiriam uma busca viável, não são atacados. A recusa é explícita. Se você perdeu a senha, esta ferramenta não a recupera.

### Qual é a diferença entre as duas senhas?

A senha de *usuário* é pedida para abrir o PDF. A de *proprietário* remove as restrições de impressão, cópia e edição. Um documento pode ter senha de proprietário sem senha de usuário; por isso, abre para qualquer pessoa, mas impede impressão em leitores que respeitam as restrições. A ferramenta aceita ambas e informa qual delas foi usada para abrir.

### É legal remover as restrições?

Depende do documento e da legislação aplicável: a questão é seu direito de usar o arquivo. Tecnicamente, as restrições são um campo que os leitores concordam em respeitar, não uma barreira criptográfica; a Adobe as documenta assim desde sua criação. Use a ferramenta em documentos que você tem direito de utilizar, como seu extrato que não imprime, um relatório adquirido que não permite cópia ou uma digitalização que precisa ser reorganizada. A ferramenta não concede direitos que você não tenha.

### Quais métodos de criptografia são aceitos?

Todos os métodos publicados: RC4 de 40 e 128 bits, revisões 2 e 3; AES-128, revisão 4; e AES-256 nas revisões 5 e 6, tanto a variante de 2008 retirada de uso quanto a atual do PDF 2.0. Não aceita criptografia por certificado, que depende de chave privada, nem uma variante não publicada da Adobe. Os dois casos são identificados com uma mensagem específica.

### A aparência do documento muda?

Não. Instruções de desenho, fontes e imagens são copiadas sem redesenho, recodificação ou reorganização. O texto continua selecionável, as digitalizações mantêm a resolução e nada muda de lugar. O arquivo pode ficar um pouco menor porque a regravação descarta objetos antigos substituídos por edições anteriores.

### O que acontece com um documento assinado?

A assinatura perde a validade. Ela cobre os bytes exatos do arquivo, portanto qualquer alteração, por qualquer programa, a invalida. A ferramenta cria uma cópia e avisa quando encontra assinatura no original. Guarde o original, que continua sendo a cópia assinada.

### Meus documentos ou senhas são enviados para algum lugar?

Não. Seu navegador lê, descriptografa e grava o arquivo no seu computador. A chave é derivada da senha nesta aba. Não há processamento em servidor, e nenhum endereço listado na `Content-Security-Policy` pertence a este site. Desligue a internet e use a página para conferir.

### Como sei que a proteção foi removida?

A ferramenta verifica o resultado no seu computador. O mesmo leitor usado pelas outras ferramentas de PDF, que recusa arquivos criptografados, precisa abri-lo sem senha e encontrar a mesma quantidade de páginas. Se falhar, não há download. Você também pode abrir o arquivo em outro leitor e verificar as propriedades: todas as permissões devem aparecer como permitidas.

### Há limite de tamanho, e custa alguma coisa?

Não há limite escrito na ferramenta. O limite é o seu próprio computador: o documento fica na memória enquanto se trabalha nele, então um notebook aguenta algumas centenas de megabytes sem reclamar e começa a penar acima disso. É grátis, não há conta, não há login e não há teste. O site exibe publicidade, e é ela que o paga; os anunciantes não recebem nada sobre os seus documentos.

### Funciona offline?

Sim. Abra a página uma vez e desligue a internet: ela continua funcionando. Uma ferramenta que enviasse o documento para desbloquear em outro lugar pararia ao perder a conexão.

## Como dá para conferir a promessa de privacidade

- **Muitos PDFs protegidos já abrem sem senha; a página informa isso antes de agir.** Um PDF pode ter duas proteções diferentes. A *senha de abertura* impede a leitura, e esta ferramenta não a descobre. As *restrições* de impressão, cópia e edição são outra coisa. Um arquivo com apenas restrições abre para qualquer pessoa, portanto contém o necessário para derivar sua própria chave, como o leitor já fez. Impedir a impressão depende de um campo de permissões que os programas concordam em respeitar. A Adobe documenta isso desde o início. Remover esse pedido não quebra a criptografia. A página identifica o tipo de proteção e só pede senha quando ela é realmente necessária.
- **A ferramenta não tenta adivinhar senhas.** Se o documento exige senha para abrir, você precisa fornecê-la. Não há dicionário, lista de palavras ou busca exaustiva, nem para chaves de 40 bits dos anos 1990 que poderiam ser testadas por completo. É uma escolha explícita: tentar milhões de senhas seria outra ferramenta, com outra finalidade. São aceitas a senha de abertura e a senha de proprietário que remove as restrições; ambas são credenciais que você recebeu.
- **A senha é digitada e usada aqui.** A chave é derivada nesta aba. A senha não é armazenada, lembrada entre arquivos nem colocada na barra de endereço. A `Content-Security-Policy` lista todos os endereços permitidos, e nenhum pertence a este site. Pedir a senha de um documento e depois enviá-la pela rede contrariaria a finalidade desta ferramenta.
- **O arquivo pronto é aberto novamente antes de ser oferecido.** Os bytes do download são entregues ao mesmo leitor usado pelo [compressor](https://abox.tools/pt/comprimir-pdf/), pelo [combinador](https://abox.tools/pt/juntar-pdf/) e pela ferramenta de [tarjar PDF](https://abox.tools/pt/tarjar-pdf/). Esse leitor recusa documentos criptografados. O resultado precisa abrir sem senha e ter a mesma quantidade de páginas. Se ainda houver criptografia, ele não passa nessa verificação. Em caso de falha, a ferramenta informa o problema e não oferece download.
- **As páginas não são redesenhadas, recodificadas ou reorganizadas.** Muda a criptografia ao redor do documento, não o conteúdo das páginas. Instruções de desenho, fontes incorporadas e imagens são gravadas como chegaram. O texto continua selecionável e pesquisável, as digitalizações mantêm a resolução e nada muda de lugar. A regravação deixa para trás cópias antigas de objetos substituídos por edições anteriores, o que costuma reduzir um pouco o arquivo.
- **A assinatura digital perde a validade, e a página avisa quando encontra uma.** Uma assinatura cobre os bytes exatos do arquivo; qualquer regravação a invalida. A ferramenta cria um novo arquivo, sem assinatura válida, e avisa no resultado quando encontra uma no original. Guarde o original, que continua sendo a cópia assinada. Nenhuma ferramenta pode alterar esses bytes e preservar a validade da assinatura sobre eles.
- **A página explica a força real da proteção.** Um PDF com RC4 de 40 bits de 1998 e outro com AES-256 recente podem aparecer no leitor com a mesma indicação de proteção por senha. A diferença é de décadas. Esta página informa o método, o tamanho da chave e a revisão, distinguindo os já quebrados, os superados e o atual. São informações úteis para avaliar um arquivo apresentado como seguro, mas raramente mostradas pelo leitor.
- **Arquivos protegidos por certificado são recusados com uma explicação.** Alguns documentos corporativos usam certificado em vez de senha, com a chave em um cartão inteligente ou repositório de chaves. A página identifica e recusa esses arquivos. Nenhum texto digitado no campo de senha substitui uma chave privada.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e medição vêm do Google. Eles não recebem arquivo, página, nome, tamanho, quantidade de páginas, senha nem método de proteção. Todo o código que lê, descriptografa ou grava o PDF é servido desta origem e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” no topo é desenhado por um script de cdnjs.buymeacoffee.com e busca as letras no Google Fonts. É um link e nada mais: não relata visita alguma, e não recebe nada sobre você nem sobre os seus documentos. Nada acontece a menos que você clique, e para onde você iria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desligue a rede e tudo continua funcionando. Uma ferramenta que enviasse seu documento para desbloquear em outro lugar pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/pdf-crypt.js` para ver como a senha gera a chave do documento e confirmar que não há busca por senhas, e `src/shared/aes.js` e `src/shared/rc4.js` para as duas cifras. Nenhum deles, nem o leitor ou o gravador usados ao lado, acessa a rede.
