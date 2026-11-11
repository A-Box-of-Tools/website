# Transforme uma gravação de tela em um relato de erro útil

Um relato de erro útil mostra a ação que falhou, mantém o resultado legível e explica o que deveria ter acontecido. Prepare uma gravação curta e instruções escritas para reproduzir a mesma tentativa.

Última atualização 22 de outubro de 2026

## Comece reproduzindo o problema uma vez de forma controlada

Imagine uma página fictícia de estoque em que mudar uma quantidade de 3 para 4 e salvar faz o valor voltar a 3. Outra pessoa precisa ver o valor inicial, a mudança, a ação de salvar e o resultado inesperado. Um close apenas do valor final não explica a falha.

Grave um item de teste, feche janelas sem relação com o problema e silencie notificações. Capture apenas o som necessário para o relato. Se aparecer um nome de cliente, uma senha ou uma conversa privada, faça uma nova gravação com dados de exemplo seguros sempre que possível. Preparar a cena é mais fácil do que descobrir material sensível depois de editar.

A sequência é [Aparar vídeo](https://abox.tools/pt/aparar-video/), opcionalmente [Cortar vídeo](https://abox.tools/pt/cortar-video/) e depois [Comprimir vídeo](https://abox.tools/pt/comprimir-video/). Baixe cada resultado e carregue esse arquivo na próxima ferramenta, usando um link para continuar quando houver um. Guarde o original separadamente. A preparação dos arquivos acontece no navegador; enviar o relato pronto é uma etapa posterior e deliberada.

## Mantenha o que acontece antes da falha

Abra a gravação na [ferramenta para aparar](https://abox.tools/pt/aparar-video/) e encontre uma tentativa completa. Comece antes da mudança de quantidade, com o valor original visível. Termine depois que o resultado da tentativa de salvar se estabilizar. Preserve a espera quando ela fizer parte do problema: cortar diretamente de Salvar para o resultado pode esconder um indicador de carregamento, uma mensagem ou um problema de tempo.

Remova o tempo de preparação e as tentativas repetidas que não acrescentam informação. Um clipe menor é mais fácil de acompanhar e costuma exigir menos compressão. Neste exemplo, mantenha uma tentativa contínua em vez de juntar momentos separados como se fossem uma única reprodução do problema.

Salve `01-reproduction.mp4` e reproduza do começo ao fim. Confira o início e o fim realmente exportados: um corte sem perdas pode cair em um quadro-chave próximo, em vez do ponto exato marcado. O [guia para aparar vídeo](https://abox.tools/pt/guias/aparar-um-video/) explica a escolha entre esse limite e um corte preciso com recodificação. Inclua quaisquer quadros extras na revisão de privacidade.

![A linha do tempo de Aparar vídeo e os controles para marcar as partes que serão mantidas.](https://abox.tools/screens/prepare-a-screen-recording-for-support/marks.webp)

A ferramenta para aparar com uma filmagem de exemplo. Preserve a ação anterior à falha e confira os limites reais do clipe baixado.

## Recorte apenas quando a área ao redor for desnecessária

Se uma área de trabalho vazia cercar o aplicativo, carregue o arquivo aparado na [ferramenta de recorte](https://abox.tools/pt/cortar-video/). Mantenha a linha editada, o controle Salvar e a resposta do aplicativo. Recortar apenas o campo de quantidade removeria a ação que torna este exemplo reproduzível.

Salve `02-framed.mp4` e assista ao resultado inteiro. Uma mensagem pode aparecer brevemente perto da borda, ou o ponteiro pode sair da área que você inicialmente considerou importante. Recortar recodifica a imagem; pule essa etapa quando o enquadramento original já funcionar. O [guia de recorte](https://abox.tools/pt/guias/cortar-um-video/) explica os controles.

O recorte remove as bordas do quadro. Ele não mascara informações privadas na área mantida, não remove áudio e não substitui a revisão de todos os momentos.

## Comprima pensando na legibilidade e no tamanho

Carregue a versão mais recente já conferida na [ferramenta de compressão](https://abox.tools/pt/comprimir-video/). Consulte os requisitos de anexos do sistema de suporte usado; não suponha que toda caixa de entrada aceite o mesmo tamanho ou formato. Deixe alguma margem abaixo do limite.

Salve `stock-save-failure.mp4` e inspecione o resultado baixado no tamanho em que provavelmente será visto. Você consegue distinguir 3 de 4 e ler a mensagem após salvar? Um clipe que cabe no limite, mas deixa as evidências borradas, não cumpre sua finalidade.

Se comprimir mais destruir esse detalhe, volte à versão intermediária mais nítida e use um método de transferência aceito pelo destinatário. Remova tempo redundante antes de sacrificar pixels legíveis. Veja as escolhas no [guia de compressão](https://abox.tools/pt/guias/comprimir-um-video/). Não comprima repetidamente um resultado já degradado.

Se a próxima ferramenta não conseguir abrir a origem, o [Conversor para MP4](https://abox.tools/pt/converter-para-mp4/) é uma etapa de compatibilidade antes da edição. Pule-a quando o arquivo já funcionar. Confira cada arquivo resultante, em vez de supor que a extensão MP4 garante a reprodução.

## Acrescente uma imagem estática quando ela responder a outra pergunta

Uma captura pode facilitar a inspeção de uma mensagem de erro pequena. Abra o original ou a versão intermediária mais nítida em [Extrair quadro](https://abox.tools/pt/extrair-quadro-de-video/), escolha o momento e salve um PNG. O [guia de quadros](https://abox.tools/pt/guias/extrair-um-quadro-de-um-video/) explica como extrair a imagem decodificada sem fotografar os controles de um reprodutor.

Se a imagem contiver um identificador irrelevante, use [Tarjar imagem](https://abox.tools/pt/tarjar-imagem/) e inspecione a imagem exportada. Salve como `stock-save-result.png`. **Tarjar a imagem muda apenas essa imagem.** O mesmo identificador continua no vídeo se aparecer nele. Siga o [guia para tarjar uma imagem](https://abox.tools/pt/guias/tarjar-uma-imagem/) na captura; grave o vídeo novamente com segurança quando ainda houver material privado nele.

## Escreva o que o vídeo não explica sozinho

Inclua um relato curto que o destinatário possa pesquisar e seguir sem transcrever a gravação:

- **Passos:** Abra a página de estoque do item de teste, mude 3 para 4 e salve.
- **Esperado:** A quantidade salva continua sendo 4.
- **Real:** A quantidade volta a 3 depois de salvar.
- **Contexto:** Navegador e dispositivo relevantes, frequência e preparação necessária para reproduzir.

Separe observações de suposições sobre a causa. Informe os nomes exatos do clipe e da imagem opcional anexados, para que outra exportação de nome parecido não seja confundida com a evidência do relato.

## Revise os anexos exatos antes de enviar

Reproduza novamente o vídeo final baixado, incluindo o som. Procure nomes, notificações, abas, dados de contas e material privado entre os momentos em que sua atenção estava concentrada. Inspecione a captura opcional separadamente. Confira legibilidade, reprodução e tamanho do arquivo.

Essas ferramentas não oferecem mascaramento nem remoção de dados por tarjas em vídeo. Editar e comprimir não comprova que uma gravação é segura para compartilhar. Se restar conteúdo sensível na imagem ou no som mantidos, grave o exemplo novamente antes de enviar. O relato pronto reúne um clipe legível, passos reproduzíveis e somente a imagem adicional que ajude a explicar a falha.
