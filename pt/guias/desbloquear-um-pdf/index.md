# Como desbloquear um PDF e identificar o tipo de proteção

A palavra “protegido” pode indicar duas coisas diferentes: uma senha que impede a leitura ou um pedido dentro do arquivo para o leitor bloquear impressão e cópia. Identificar qual delas existe determina o próximo passo.

[Abrir Desbloquear PDF](https://abox.tools/pt/desbloquear-pdf/): Permissões restritas e senhas de abertura são diferentes. A página identifica o que seu PDF usa.

Última atualização 12 de outubro de 2026

## Como começar

Abra [Desbloquear PDF](https://abox.tools/pt/desbloquear-pdf/) e escolha o documento. A página identifica rapidamente qual destas situações se aplica:

- **O documento abre, mas não permite imprimir ou copiar.** Se tiver apenas permissões restritas, aqui não precisa de senha. Use o botão para removê-las.
- **O documento pede senha antes de abrir.** Forneça uma senha válida de usuário ou proprietário. Esta ferramenta não adivinha nem recupera senhas.

Entender essa diferença antes de entregar um documento a um serviço de desbloqueio ajuda a avaliar o que ele realmente pode fazer.

## Senha de abertura e senha de proprietário

Um PDF pode ter duas senhas, apresentadas de forma quase idêntica pelos leitores.

A **senha de usuário**, ou de abertura, serve para decifrar o documento que a exige. Uma senha válida de usuário ou proprietário pode abri-lo aqui. Sem nenhuma, esta ferramenta mantém o arquivo fechado; não procura senhas nem chaves.

A **senha de proprietário** controla as *permissões*: imprimir, copiar, editar e preencher formulários. Com senha de usuário vazia, o arquivo abre sem pedir senha, enquanto o leitor aplica as restrições.

Se ele abre sem pedir nada, *contém o necessário para derivar a própria chave*, como o leitor acabou de fazer. A criptografia usa uma chave que pode ser obtida sem uma credencial secreta. O bloqueio de impressão vem de outro campo, com bits de permissão que os leitores concordam em respeitar. A Adobe documenta isso desde o início. É um pedido, não uma barreira criptográfica.

Remover permissões restritas de um arquivo que já abre não exige procurar senhas. Remover aqui uma senha de abertura exige uma senha válida fornecida. São operações diferentes e a página identifica o caso antes de continuar.

## Como identificar o caso sem ferramenta

Dê um clique duplo no arquivo.

- **O leitor pede senha.** É a senha de usuário; você precisa fornecê-la.
- **O arquivo abre, mas algum controle está desabilitado**, como impressão, cópia ou formulário, e as propriedades indicam proteção. São restrições, que podem ser removidas.

Na maioria dos leitores, as propriedades do documento têm uma aba Segurança que lista cada ação como permitida ou não permitida. O [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) mostra essa lista e acrescenta o método de criptografia e sua força atual.

## O método de criptografia faz diferença

Dois documentos podem aparecer como protegidos por senha e usar tecnologias separadas por trinta anos. O formato passou por cinco gerações:

- **RC4 de 40 bits**, PDF 1.1, de 1994. Foi limitado pelas regras de exportação dos Estados Unidos da época. A chave é curta o suficiente para testar todas as possibilidades em equipamento comum.
- **RC4 de 128 bits**, PDF 1.4, de 2001. Não é viável testar todas as chaves de 128 bits, mas o RC4 tem falhas conhecidas há anos. Foi proibido no TLS em 2015 e retirado dos navegadores no início do ano seguinte.
- **AES-128**, PDF 1.6, de 2005. Combina uma cifra moderna com derivação de chave de 1994. A cifra continua adequada, mas a transformação da senha em chave é barata e facilita tentativas de senha.
- **AES-256, primeira versão**, de 2008. Extensão da Adobe posteriormente retirada: o cálculo da senha podia ser atacado rapidamente com placas gráficas.
- **AES-256 do PDF 2.0**, de 2017. Usa cálculo deliberadamente custoso. É o método atual, cuja segurança depende da senha escolhida.

Quando alguém disser que um documento é seguro porque tem senha, pergunte qual método usa. Um fluxo antigo ainda pode gerar arquivos com a primeira opção da lista.

## Se você perdeu a senha de abertura

Esta ferramenta não recupera senhas de abertura perdidas. Primeiro peça ao remetente a senha ou uma cópia acessível e guarde o original.

Ferramentas de recuperação testam candidatos ou atacam proteção fraca e obsoleta. O sucesso depende da senha e da criptografia: uma senha curta ou previsível difere de uma forte com criptografia moderna. Algumas rodam localmente, outras exigem upload. Este desbloqueador não realiza essas buscas.

O [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) não faz essa busca. O código não contém dicionário nem laço para testar senhas. Mesmo para documentos antigos em que uma busca seria viável, essa função foi deliberadamente excluída.

Antes de qualquer outra coisa, procure quem enviou o documento. A pessoa normalmente ainda tem a senha. Documentos de empresas podem usar uma senha compartilhada pelo setor; bancos e sistemas de folha às vezes usam data de nascimento ou últimos dígitos da conta. As instruções costumam estar no e-mail que acompanhou o arquivo.

## Vale a pena enviar o arquivo?

Extratos que não imprimem, holerites, documentos médicos, contratos que não permitem cópia e documentos fiscais são exemplos comuns. Alguém considerou esse conteúdo digno de proteção.

Um serviço que processa no servidor recebe primeiro o documento completo e, quando necessário, a senha. Você não consegue verificar de fora todos os detalhes de retenção e acesso, mesmo com uma política publicada.

Desbloquear um PDF envolve derivar uma chave, executar a cifra e gravar bytes. O navegador consegue fazer tudo isso localmente. Na [ferramenta deste site](https://abox.tools/pt/desbloquear-pdf/), documento e senha ficam na aba, e ela continua funcionando com a rede desligada. Esse é um teste que você pode fazer.

Veja também [é seguro enviar arquivos?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) e [é seguro enviar um extrato bancário?](https://abox.tools/pt/guias/e-seguro-enviar-um-extrato-bancario/).

## O que muda no arquivo

**A assinatura digital perde a validade.** Ela cobre os bytes exatos do arquivo, e remover a criptografia gera novos bytes. Qualquer programa que fizesse a alteração teria esse efeito. Guarde o original, que continua sendo a cópia assinada.

**O arquivo costuma diminuir um pouco.** A regravação descarta objetos antigos substituídos em edições anteriores. Isso é um efeito secundário, não o objetivo.

**As páginas não mudam.** Instruções de desenho, fontes e imagens são preservadas sem redesenho, recodificação ou reorganização. Texto continua selecionável, digitalizações mantêm a resolução e nada muda de lugar. Se outra ferramenta devolver páginas menos nítidas ou transformar texto em imagem, ela fez mais que remover a proteção.

## É permitido?

Depende dos seus direitos sobre o documento e da legislação aplicável, não apenas da tecnologia.

As restrições são campos que os leitores concordam em respeitar, não uma barreira criptográfica. Os usos comuns incluem seu próprio extrato que não imprime, um relatório adquirido que não permite cópia, páginas digitalizadas que precisam ser reorganizadas ou um formulário que você deve preencher. Remover uma permissão técnica não concede direito de usar um documento que não é seu.

## Depois de desbloquear

O arquivo passa a ser um PDF comum, aceito pelas outras ferramentas. Você pode [juntar ou dividir páginas](https://abox.tools/pt/juntar-pdf/), [reduzir o tamanho](https://abox.tools/pt/comprimir-pdf/) ou [remover de verdade um nome ou dado privado](https://abox.tools/pt/tarjar-pdf/). Se a proteção existia por causa de informações sensíveis, remover o que não deve ser compartilhado pode ser o próximo passo.
