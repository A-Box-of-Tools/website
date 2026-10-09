# Proteger PDF — senha para abrir e restrições opcionais

Proteja um documento sem entregá-lo a um site para fazer isso.

> Adicione senha a um PDF ou restrinja impressão e cópia no navegador. AES-256 por padrão, sem enviar nada. O resultado é aberto novamente para conferir a proteção antes do download.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/proteger-pdf/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem documentos. Não existe servidor.

O documento é aberto, criptografado e gravado na memória deste computador por código servido deste endereço. Nada aqui faz envio, e não há servidor do outro lado para recebê-lo. Nem o arquivo nem a senha digitada saem desta aba.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como colocar senha ou restrições em um PDF

1. **Escolha o PDF.** Um documento por vez, lido diretamente do disco pelo navegador. Se já exigir senha para abrir, a página indica o desbloqueador. Se tiver apenas restrições, será aceito, e suas escolhas abaixo substituirão as anteriores.
2. **Defina a senha de abertura e digite novamente.** Esta é a proteção que impede a leitura. Quem tem a senha abre o documento; quem não tem, não. A ferramenta não recupera uma senha esquecida. Os dois campos precisam coincidir para habilitar o botão. Deixe ambos vazios se quiser apenas restrições em um documento que continue abrindo para qualquer pessoa.
3. **Marque as restrições desejadas.** Impressão, cópia de texto e imagens e alterações no documento. São pedidos que os leitores costumam respeitar, não um bloqueio criptográfico; o aviso aparece ao lado. A senha de proprietário permite removê-los. Se esse campo ficar vazio, a senha de abertura serve para as duas funções. Sem nenhuma senha definida, a ferramenta gera uma aleatória e a descarta, para que a senha vazia não remova as restrições.
4. **Proteja o arquivo e confira a confirmação.** O documento é gravado com uma nova chave de criptografia e aberto novamente para verificação. Quando há senha de abertura, precisa recusar a tentativa sem senha e aceitar a senha escolhida, mantendo a quantidade de páginas. Se a verificação falhar, a página informa o motivo e não oferece download.

## A versão longa

[Como proteger um PDF com senha e entender a proteção](https://abox.tools/pt/guias/proteger-um-pdf/): Senha de abertura bloqueia a leitura; restrições são pedidos. Entenda a diferença, escolha a criptografia e proteja o PDF sem enviar o documento a um servidor.

## Também na caixa

- [Marca d’água em PDF](https://abox.tools/pt/marca-dagua-pdf/): Uma cópia com o destinatário identificado não passa despercebida se aparecer em outro lugar.
- [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/): As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.
- [PDF para CSV](https://abox.tools/pt/pdf-para-csv/): Encontra as tabelas de um PDF e as transforma em linhas que uma planilha consegue abrir.
- [Extrator de recibos e faturas](https://abox.tools/pt/extrair-recibos-faturas/): Leia as fotos, confira os campos e os recortes, depois envie as imagens comprimidas por e-mail com cada valor e os totais.

## Perguntas

### Um PDF protegido por senha é realmente seguro?

Com o padrão desta ferramenta, a segurança depende da força da senha. AES-256 com o cálculo de senha do PDF 2.0 é o método atual, sem um atalho conhecido para ignorar a senha. Nem todo PDF protegido usa esse método. O formato passou por cinco gerações, desde chaves de 40 bits de 1994, que um notebook consegue testar por completo. Os leitores usam a mesma expressão para todas. Esta página usa o método mais forte e identifica claramente a opção antiga.

### Qual é a diferença entre senha e restrições?

Um PDF pode ter duas senhas. A senha de *usuário* é pedida para abrir; sem ela, o documento permanece bloqueado. A de *proprietário* remove as *restrições* de impressão, cópia e edição. Estas são um pedido: um arquivo que abre sem senha precisa conter o necessário para derivar sua própria chave, e o leitor decide se respeita as permissões. O [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) deste site consegue removê-las. Use restrições para expressar sua preferência e senha de abertura para impedir a leitura.

### E se eu esquecer a senha?

Você pode perder o acesso ao documento. É melhor saber disso antes de entregá-lo a um site que promete recuperar senhas. Esta ferramenta não tenta adivinhá-las: o código em `src/shared/pdf-crypt.js` mostra isso. Com o método padrão e uma senha forte, não há recuperação prática garantida. É por isso que a senha é pedida duas vezes. Guarde o original, que permanece inalterado.

### Devo escolher AES-256 ou AES-128?

AES-256, a menos que um leitor anterior a 2010 precise abrir o arquivo. A opção de 256 bits segue o PDF 2.0 e funciona no Acrobat X ou posterior, navegadores, celulares e leitores atuais. AES-128 segue o método de 2005, compatível com leitores mais antigos. Sua fraqueza vem da derivação de chave de 1994, que torna as tentativas de senha muito mais baratas, não da cifra em si. Na dúvida, escolha 256.

### Posso proteger um PDF que já está protegido?

Se ele abre sem senha e tem apenas restrições, sim: as novas escolhas substituem as antigas. Se pedir senha de abertura, use primeiro o [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) no mesmo navegador e traga a cópia desbloqueada. O formato não permite duas camadas de senha; trocar a senha exige remover a anterior e aplicar a nova.

### A aparência do documento muda?

Não. Instruções de desenho, fontes e imagens são copiadas sem redesenho, recodificação ou reorganização, apenas criptografadas. Com a senha, o texto continua selecionável, as digitalizações mantêm a resolução e nada muda de lugar. O arquivo pode diminuir ao descartar objetos antigos substituídos em edições anteriores, ou aumentar com os dezesseis bytes acrescentados pela criptografia a cada fluxo.

### O que acontece com um documento assinado?

A assinatura deixa de ser válida. Ela cobre os bytes exatos do arquivo; qualquer alteração, feita por qualquer programa, inclusive o que assinou, a invalida. A ferramenta cria uma cópia e avisa quando encontra assinatura no original. Para ter proteção e assinatura válidas, proteja primeiro e assine a cópia protegida.

### Meus documentos ou senhas são enviados para algum lugar?

Não. Seu navegador lê, criptografa e grava o arquivo no seu computador; a chave é derivada da senha nesta aba. Não há processamento em servidor. A `Content-Security-Policy` lista os endereços permitidos, e nenhum pertence a este site. Desligue a internet e use a página para conferir. Proteger um documento não deveria exigir entregá-lo antes a terceiros.

### Como sei que a proteção foi aplicada?

A ferramenta verifica o arquivo no seu computador e mostra o resultado. Quando você definiu senha de abertura, ele precisa recusar a tentativa sem senha. Com a senha escolhida, precisa abrir com a mesma quantidade de páginas e as restrições marcadas. Se uma verificação falhar, não há download. Você também pode abrir o resultado em outro leitor, testar a senha e conferir as permissões nas propriedades do documento.

### Há limite de tamanho, e custa alguma coisa?

Não há limite escrito na ferramenta. O limite é o seu próprio computador: o documento fica na memória enquanto se trabalha nele, então um notebook aguenta algumas centenas de megabytes sem reclamar e começa a penar acima disso. É grátis, não há conta, não há login e não há teste. O site exibe publicidade, e é ela que o paga; os anunciantes não recebem nada sobre os seus documentos.

### Funciona offline?

Sim. Abra a página uma vez e desligue a internet: ela continua funcionando. Uma ferramenta que enviasse o documento para criptografar em outro lugar pararia ao perder a conexão.

## Como dá para conferir a promessa de privacidade

- **Enviar o arquivo contrariaria o motivo de protegê-lo.** Um documento que precisa de senha é justamente aquele que você não quer entregar a terceiros. Serviços de proteção on-line costumam pedir primeiro o original desbloqueado e a senha escolhida, enviados a um servidor cuja retenção você não consegue verificar. Esta página não faz isso: o navegador lê o arquivo, deriva a chave nesta aba e grava a cópia criptografada na memória. A `Content-Security-Policy` lista todos os endereços permitidos, e nenhum pertence a este site. Desligue a rede e a ferramenta continua funcionando.
- **A senha bloqueia. A restrição faz um pedido. A página distingue as duas.** A *senha de abertura* criptografa o conteúdo com uma chave derivada dela. A senha não é gravada no arquivo, e o documento não pode ser lido sem ela. As *restrições* de impressão, cópia e edição funcionam de outra forma. Um arquivo que abre sem senha precisa conter o necessário para derivar sua própria chave; impedir a impressão depende de o leitor respeitar o campo de permissões. Qualquer leitor pode ignorá-lo. A Adobe documenta isso desde o início, e o [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) deste site é um programa que remove essas restrições. Elas ainda servem para expressar sua preferência, respeitada pela maioria dos leitores, mas não equivalem a um bloqueio criptográfico.
- **AES-256 por padrão; o método antigo só quando necessário.** A criptografia de PDF passou por cinco gerações, todas descritas pelos leitores como proteção por senha. O padrão aqui é o mais recente: AES-256 com o cálculo de senha do PDF 2.0, deliberadamente custoso e o único da família ainda considerado forte. Sua segurança depende da senha escolhida. A opção AES-128 usa a derivação de chave de 1994 e só é indicada quando um leitor anterior a 2010 precisa abrir o arquivo. A página explica isso ao lado da escolha.
- **A senha é pedida duas vezes porque não há recuperação garantida.** O site não tenta adivinhar senhas. Com um método forte e uma senha que ninguém lembra, o documento não poderá ser recuperado por esta ferramenta. Por isso, a senha de abertura é digitada duas vezes e os campos precisam coincidir. A página avisa que perder a senha pode significar perder acesso ao arquivo. Guarde o original: ele não é alterado.
- **O arquivo pronto é aberto novamente antes de ser oferecido.** Os bytes do download passam pelo mesmo leitor usado pelas outras ferramentas de PDF do site. Quando há senha de abertura, a tentativa sem senha precisa ser recusada. Com a senha definida, o arquivo precisa abrir, ter a mesma quantidade de páginas e apresentar as restrições escolhidas. Se uma dessas verificações falhar, a ferramenta informa a falha e não oferece download.
- **As páginas não são redesenhadas, recodificadas ou reorganizadas.** Muda a criptografia ao redor do documento, não o conteúdo das páginas. Instruções de desenho, fontes incorporadas e imagens são gravadas como chegaram, agora criptografadas. Para quem tem a senha, o texto continua selecionável e pesquisável, as digitalizações mantêm a resolução e nada muda de lugar. Como em qualquer regravação, cópias antigas de objetos substituídos por edições anteriores ficam para trás.
- **A assinatura digital perde a validade, e a página avisa quando encontra uma.** Uma assinatura cobre os bytes exatos do arquivo; regravá-lo invalida essa assinatura. A ferramenta cria um novo arquivo, sem a assinatura válida, e avisa no resultado quando encontra uma no original. O original continua sendo a cópia assinada. Se precisar de proteção e assinatura, proteja primeiro e assine depois.
- **Um documento já bloqueado precisa ser desbloqueado primeiro.** Não é possível acrescentar uma senha sobre outra. Um PDF que pede senha para abrir é recusado com um link para o [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/), que remove a proteção antiga no mesmo navegador. Traga a cópia desbloqueada para definir a nova senha. Um arquivo que abre sem senha e tem apenas restrições é aceito, com aviso de que suas escolhas substituirão as anteriores.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e medição vêm do Google. Eles não recebem arquivo, página, nome, tamanho, quantidade de páginas, senha nem método de proteção. Todo o código que lê, criptografa ou grava o PDF é servido desta origem e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” no topo é desenhado por um script de cdnjs.buymeacoffee.com e busca as letras no Google Fonts. É um link e nada mais: não relata visita alguma, e não recebe nada sobre você nem sobre os seus documentos. Nada acontece a menos que você clique, e para onde você iria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desligue a rede e tudo continua funcionando. Uma ferramenta que enviasse seu documento para criptografá-lo em outro lugar pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/pdf-crypt.js` para ver como a senha gera a chave do documento e o dicionário /Encrypt, e `src/shared/aes.js` para a implementação da cifra. Nenhum deles, nem o leitor ou o gravador usados ao lado, acessa a rede.
