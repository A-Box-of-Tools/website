# Proteja, transfira e verifique um PDF

Prepare o documento primeiro, proteja o conteúdo final e confira depois o arquivo exato que chega. A senha controla a abertura do PDF; a soma de verificação confere se os bytes recebidos correspondem à cópia enviada.

Última atualização 22 de outubro de 2026

## Termine o documento antes de protegê-lo

Você precisa enviar um documento fictício, `committee-papers.pdf`, para outra pessoa. Quer exigir uma senha antes da abertura e conferir se a cópia baixada corresponde ao arquivo final enviado. São trabalhos separados: a proteção controla a abertura, uma soma de verificação compara bytes e a transferência leva esses bytes ao destinatário.

1. Termine e inspecione o documento.
2. Gere uma senha única e proteja uma cópia do PDF.
3. Calcule SHA-256 para essa cópia protegida exata.
4. Transfira e peça ao destinatário para comparar a soma de verificação.

Conclua primeiro a edição, a seleção de páginas, a remoção de dados e a compressão. Proteger com senha não remove um detalhe que você esqueceu de apagar; uma soma de verificação não informa se as páginas certas estão no pacote. Guarde o original com segurança. Qualquer alteração posterior no arquivo protegido exige uma nova soma de verificação.

## Exija uma senha para abrir o PDF

Use o [Gerador de senhas e frases-senha](https://abox.tools/pt/gerador-de-senha/) para criar uma senha aleatória longa e única. Guarde onde possa recuperá-la com segurança, como no gerenciador de senhas. Não reutilize uma senha de conta nem uma publicada em um guia. O [guia do gerador](https://abox.tools/pt/guias/geradores-de-senha-online-sao-seguros/) explica a geração local.

Carregue o documento pronto em [Proteger PDF](https://abox.tools/pt/proteger-pdf/) e defina a senha de abertura. Restrições de impressão ou cópia são outro recurso: um documento que abre sem senha não atende ao objetivo deste processo. Mantenha a configuração padrão AES-256, a menos que uma exigência de compatibilidade revisada peça outra abordagem. Veja configurações e limitações no [guia de proteção](https://abox.tools/pt/guias/proteger-um-pdf/).

Baixe `committee-papers-protected.pdf`. Use um nome que não revele informações privadas por si só: criptografar um documento não esconde o nome do anexo.

## Teste o download protegido

Abra o arquivo baixado em um leitor de PDF e confira se ele exige a senha de abertura. Use a senha guardada e leia as páginas. Se o leitor lembrar senhas, use uma nova sessão do leitor; uma prévia já desbloqueada não demonstra o que alguém verá ao abrir pela primeira vez.

Confirme que o destinatário pode usar PDFs protegidos por senha e que o arquivo atende ao limite da ferramenta de transferência. Compartilhar texto e arquivos atualmente limita cada arquivo a 200 MB. Se o documento precisar diminuir, volte ao original, comprima e inspecione, depois proteja a versão resultante. Faça isso antes de calcular o hash.

Guarde o original e a senha com segurança. Perder a senha pode deixar a cópia protegida ilegível. A cópia criptografada é o anexo das próximas etapas; não selecione o original por engano.

## Calcule o hash dos bytes criptografados finais

Selecione `committee-papers-protected.pdf` em [Hash e soma de verificação](https://abox.tools/pt/verificar-checksum/) e use o resultado SHA-256. Copie o hash completo: SHA-256 tem 64 caracteres hexadecimais. Comparar apenas o começo ou o fim é uma verificação mais fraca. O [guia de somas de verificação](https://abox.tools/pt/guias/verificar-o-checksum-de-um-download/) explica como comparar um hash esperado.

Dois PDFs podem parecer idênticos e ainda ter hashes diferentes. Até criptografar o mesmo original separadamente pode produzir bytes diferentes. Calcule o hash do download protegido real, não de uma versão anterior ou de uma cópia sem criptografia salva por um leitor.

| Item de trabalho | Uso |
| --- | --- |
| PDF original | Guardar com segurança para futuras edições |
| PDF protegido | Calcular o hash, transferir e verificar este arquivo exato |
| Senha de abertura | Entregar somente ao destinatário pretendido |
| SHA-256 esperado | Comunicar por um canal confiável para comparação |

## Transfira a cópia protegida

Abra [Compartilhar texto e arquivos](https://abox.tools/pt/compartilhar-texto/), selecione o download protegido e convide o destinatário. Mantenha o acesso privado e aprove o dispositivo receptor pretendido. Deixe a aba de envio aberta até o destinatário terminar o download. Siga o [guia de compartilhamento](https://abox.tools/pt/guias/compartilhar-texto-entre-dispositivos/) para opções de conexão e solução de problemas.

Esta etapa usa uma rede de propósito. No fluxo normal entre dispositivos, um serviço público de encontro apresenta os navegadores; até o modo de rede local precisa dessa apresentação. Direto envia o arquivo entre os pares. Escolher retransmissão na nuvem envia o tráfego WebRTC criptografado pelo retransmissor. O serviço de apresentação não transporta o conteúdo do arquivo. A proteção por senha também permanece no PDF baixado.

Entregue a senha por um canal confiável separado. Entregue também o hash esperado por um canal autenticado, como a conversa já estabelecida com o destinatário. Substituir um arquivo e seu hash ao mesmo tempo poderia fazer os dois coincidirem; por isso, um hash fornecido apenas junto de um download não confiável não comprova sua origem.

## Compare o arquivo recebido antes de alterá-lo

No dispositivo receptor, baixe o arquivo e abra [Hash e soma de verificação](https://abox.tools/pt/verificar-checksum/). Selecione o PDF recebido, use SHA-256 e compare o hash inteiro com o valor esperado confiável. O campo de comparação da ferramenta evita tentar encontrar visualmente um caractere errado.

Um SHA-256 correspondente fornece forte evidência de que os bytes recebidos são iguais aos da cópia cujo hash o remetente calculou. Por si só, ele não identifica o autor, não comprova que o conteúdo está correto nem torna o arquivo seguro para abrir. Este processo pressupõe um documento esperado de um remetente conhecido.

Se os hashes diferirem, confirme primeiro se as duas pessoas escolheram o mesmo algoritmo e a cópia protegida. Um original com nome parecido, uma nova exportação criptografada ou uma versão salva depois pode explicar a diferença. Resolva isso antes de considerar a cópia recebida verificada. Não descriptografe e salve novamente antes de comparar: isso mudaria os bytes.

Depois que a comparação der certo, abra o mesmo arquivo com a senha e confirme que as páginas pretendidas estão legíveis. Calcular o hash e ler respondem a perguntas diferentes; essa última conferência continua importante.

## Encerre a transferência depois de confirmar o recebimento

Feche a aba de envio depois que o destinatário baixar, verificar e abrir o documento. Isso interrompe a disponibilização ao vivo. Não apaga uma cópia já baixada, e a senha do PDF não oferece expiração nem revogação remota. Quem tiver o arquivo e a senha poderá manter o acesso.

A entrega concluída é específica: o PDF pede uma senha de abertura, o arquivo criptografado recebido corresponde ao SHA-256 esperado e o destinatário pretendido consegue ler as páginas pretendidas. Limite o convite de transferência e o compartilhamento da senha a essa pessoa.
