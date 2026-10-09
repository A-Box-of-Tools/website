# Extraia dados de recibos e faturas a partir de fotos

Uma pilha de recibos fica útil quando cada documento tem um valor legível e o relatório mostra quantos foram contados. O OCR pode poupar digitação, mas é sua conferência da imagem que deixa o resultado pronto para enviar. Veja o que conferir, como manter o documento inteiro em um anexo menor, o que os totais significam e como levar as imagens e o relatório para seu aplicativo de e-mail.

[Abrir Extrator de recibos e faturas](https://abox.tools/pt/extrair-recibos-faturas/): Leia as fotos, confira os campos e os recortes, depois envie as imagens comprimidas por e-mail com cada valor e os totais.

Última atualização 4 de outubro de 2026

## Comece com um documento por foto

Fotografe o recibo ou a fatura por inteiro, com o texto na orientação correta e em foco. Preencha o enquadramento, use iluminação uniforme e não deixe sua sombra sobre a página. Confira se o nome do estabelecimento e o total final estão visíveis. A impressão térmica desbotada e os reflexos podem esconder um dígito que nenhum programa consegue recuperar da foto.

Adicione arquivos JPEG, PNG, WebP ou AVIF, até 20 por lote e 20 MB por arquivo. Cada imagem vira um documento. Uma fatura de duas páginas exige cuidado: esta ferramenta não reúne páginas em uma só fatura, então adicionar as duas como documentos separados pode contar o mesmo valor duas vezes. Use a página com os dados de identificação e o valor final e anexe a outra página por conta própria ao enviar.

Uma foto com vários recibos ou uma coleção de modelos de recibos não é separada automaticamente. Use uma foto ou um recorte individual de cada documento. O texto de vários recibos em uma imagem pode gerar uma sugestão misturada que não corresponde a nenhum deles.

O modelo de OCR incluído lê texto impresso em inglês. Texto escrito à mão e outros sistemas de escrita não são compatíveis com esse modelo. Se o celular produz arquivos HEIC, exporte cópias JPEG ou converta-os com [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/) antes de adicioná-los.

## Compare as sugestões com a imagem

Execute o OCR e confira a foto, os campos sugeridos e o texto reconhecido de cada documento. Gire uma foto de lado e leia novamente. Ajuste o recorte para conter um documento inteiro e faça uma nova leitura quando necessário. Para o OCR, a ferramenta amplia recortes pequenos em até três vezes e adiciona uma borda branca estreita, mantendo essa cópia de trabalho com no máximo 2.400 pixels no lado mais longo. Uma cópia maior pode ajudar o mecanismo, mas não recupera detalhes já perdidos por falta de foco. A imagem original e o anexo enviado não são ampliados para o OCR.

Uma primeira leitura pouco confiável ou a falta de um valor ou de uma data pode acionar uma segunda leitura com ajuste local de contraste, para ajudar a separar a impressão do papel. Abra Texto lido desta imagem para comparar as duas leituras com a foto. Divergências não resolvidas sobre valores, datas, referências ou moedas podem deixar campos em branco para você conferir. A moeda impressa tem prioridade sobre uma suposição baseada no endereço; uma data reconhecida do recibo ou da fatura tem prioridade sobre a data de um comprovante de pagamento com cartão acrescentado ao final. Corrija o texto editável antes de usá-lo para preencher os campos ou preencha os campos diretamente. A segunda leitura aparece separadamente para comparação, e nenhuma das duas garante que um dígito borrado ou desbotado esteja correto.

A falta do nome do estabelecimento ou uma moeda em dólar ou iene não identificada também pode acionar uma leitura mais próxima do cabeçalho da loja. O texto aparece abaixo das leituras do corpo para comparação e fornece apenas sugestões de nome do estabelecimento e de moeda com base no endereço. Confira essas sugestões com a imagem também.

Confira estes cinco campos antes de confirmar um documento:

- **Estabelecimento.** A empresa ou o fornecedor indicado no documento. Um logotipo estilizado pode não ser legível para o modelo de texto em inglês; digite o nome se o campo ficar em branco.
- **Data.** A data como está impressa. Uma fatura pode apresentar uma data de emissão e outra de vencimento; uma data numérica como 03/04 pode ser ambígua. Você precisa conferir e escolher a data no campo separado de conversão.
- **Referência.** O número do recibo ou da fatura, se houver. Um número de cartão ou telefone não é uma referência de documento. O campo pode ficar em branco quando não há uma opção confiável.
- **Moeda.** Escolha um código de moeda comum, como USD, CAD ou EUR, ou escolha Outro / código personalizado e digite outro código de três letras. Uma moeda impressa associada ao total final tem prioridade. O símbolo de libra sugere GBP; o símbolo de dólar sozinho não distingue USD, CAD, AUD ou outra moeda em dólar. Um país claramente identificado ou um código postal e uma região distintivos no endereço do próprio estabelecimento podem fornecer uma sugestão alternativa, com a linha do endereço impresso exibida para comparação. Uma cidade sozinha ou um endereço de cliente, entrega ou banco não basta. Confira qualquer sugestão com o recibo; a moeda é obrigatória antes de confirmar.
- **Total.** O valor final do documento. O analisador evita os rótulos de desconto e de valor entregue, mas o OCR pode não lê-los. Confira se a sugestão não selecionou um subtotal, desconto, imposto, dinheiro entregue, troco ou saldo pendente.

Corrija diretamente um campo quando estiver errado. O OCR evita digitação, mas ainda pode confundir um 3 com um 8 ou perder um separador decimal. Confirmar registra que você conferiu o documento. Isso não comprova os cálculos da fatura, e a ferramenta não extrai os itens individuais. Os valores aceitam até duas casas decimais.

## Mantenha o documento inteiro dentro do recorte

A ferramenta sugere um recorte quando encontra bordas confiáveis do documento. Um recibo longo que preenche a imagem pode ter o fundo lateral removido mantendo toda a altura, para que uma data abaixo do código de barras continue visível. Em um recibo longo de papel colorido, a mesma cor de papel além de uma borda detectada pode preservar essa extremidade inteira, protegendo um cabeçalho ou a última linha com um pouco de fundo extra. Se as bordas forem incertas, a imagem inteira é mantida. Compare o recorte com a foto original e ajuste-o para remover o fundo sem perder nenhuma borda ou parte do texto. Um recorte sugerido pode estar errado, especialmente em um recibo escuro, uma superfície estampada ou uma foto com várias folhas.

O anexo de saída é uma nova cópia JPEG, com no máximo 1.600 pixels no lado mais longo, sem ampliar um recorte menor. A compressão busca cerca de 350 KB por imagem; o tamanho real é mostrado porque essa meta não é garantida. Confira a prévia preparada e veja se as letras pequenas e o total continuam legíveis. Sua foto original permanece intacta e não é anexada ao e-mail.

Confirme o documento somente depois de conferir os campos e o recorte. Alterar um campo, o recorte ou a rotação apaga a confirmação para que uma imagem alterada não seja enviada com uma conferência anterior.

## Escolha a moeda do e-mail e a taxa de cada documento

A moeda final do e-mail usa por padrão a moeda mais frequente entre os documentos. Em caso de empate, vale a primeira que aparece. Uma moeda final escolhida manualmente permanece selecionada; Usar moeda padrão restaura a escolha automática.

Mantenha a moeda impressa no documento como moeda original. Escolha uma única moeda final do e-mail usando um código comum ou Outro / código personalizado. A mesma moeda final aparece em todos os documentos; alterá-la atualiza o lote e apaga as taxas e as conferências feitas para a moeda anterior.

Informe uma taxa manual para cada documento no sentido mostrado, como “1 CAD = 0.70 USD”. Documentos que já usam a moeda final recebem taxa 1. A data é opcional para uma taxa manual. Para uma taxa online, confira a data do recibo no campo de data de conversão, escolha Consultar taxa histórica de referência e aperte Obter taxa histórica. Uma data impressa como 03/04 é ambígua, então a consulta usa a data explícita que você selecionou. Mesmo uma data impressa sem ambiguidade, como 24/09/2018, continua no formato original; selecione 24 de setembro de 2018 no campo de data de conversão.

A consulta opcional usa as [taxas de referência do Frankfurter](https://frankfurter.dev/). Somente o par de moedas e a data selecionada vão para api.frankfurter.dev; imagens, valores, nomes de arquivo, texto do OCR e endereços de e-mail não vão. O serviço pode ver sua consulta e seu endereço IP. Confira a data de observação retornada, que pode ser anterior à data do recibo quando nenhuma taxa foi publicada. Taxas de referência podem diferir da cobrança do banco ou cartão. Se o par ou a data não estiver disponível, informe uma taxa manual. Nenhuma taxa atual substitui silenciosamente uma taxa histórica ausente.

Confira o valor original, a taxa e o valor convertido antes de confirmar. O e-mail e o CSV mantêm esses detalhes para que seja possível relacionar o total a cada documento. Alterar uma moeda ou uma data exige uma nova taxa e outra conferência.

## O que a contagem de documentos e os totais mostram

O relatório lista os dados e o valor de cada documento, com o número de documentos e quantos foram conferidos ou ainda precisam de revisão. Somente os valores conferidos entram nos totais das moedas originais e no total geral convertido. Escolha uma moeda final do e-mail para todo o lote; cada documento mostra essa mesma moeda. O valor convertido de cada documento é arredondado para duas casas decimais antes da soma, para que o total geral corresponda aos valores individuais mostrados no e-mail.

Compare a contagem com sua pilha de originais. Uma foto ausente deixa uma despesa de fora, e uma duplicata a conta duas vezes. Não há detector automático de duplicatas. Remova o que não deve ser contado e salve ou copie o relatório antes de fechar a aba: o lote fica na memória, sem histórico de documentos salvo. Durante a conferência, relatórios copiados e arquivos CSV podem conter linhas incompletas, marcadas como precisando de revisão. Os downloads de e-mail e anexos só ficam disponíveis quando todos os documentos restantes foram conferidos e suas cópias JPEG estão prontas.

## Envie o relatório por e-mail com suas imagens comprimidas

O assunto sugerido inclui a contagem de documentos e depois acrescenta o total geral na moeda final quando todos os documentos forem conferidos. Edite o assunto com suas próprias palavras; suas alterações são mantidas quando o lote muda.

Use E-mail com imagens depois de conferir todos os documentos. Quando o navegador aceita compartilhar arquivos, ele abre o menu de compartilhamento do dispositivo com as cópias JPEG preparadas e o relatório. Escolha seu aplicativo de e-mail ali. O relatório inclui o valor de cada documento, a contagem e os totais das moedas originais, além de um total geral convertido. Confira o assunto, o destinatário, o corpo da mensagem e cada anexo no aplicativo de e-mail e envie a mensagem você mesmo.

Os menus de compartilhamento e aplicativos de e-mail variam. Um aplicativo pode aceitar as imagens sem o relatório, e a página não pode escolher o destinatário ali. Copie o relatório para a mensagem se necessário. A página não pode enviar a mensagem nem saber se o aplicativo acabou entregando o e-mail.

## Baixe um arquivo de e-mail ou anexe as cópias por conta própria

Baixar arquivo de e-mail cria uma mensagem `.eml` com o relatório completo e todos os anexos JPEG preparados. O destinatário opcional informado na página é usado nesse arquivo. Quando o compartilhamento de arquivos do navegador não está disponível, o botão de e-mail baixa o mesmo arquivo. Abra-o no aplicativo de e-mail e confira se todos os anexos estão presentes antes de enviar.

Alguns aplicativos abrem o arquivo como rascunho; outros o exibem como uma mensagem recebida que precisa ser encaminhada ou reenviada. Nenhum recurso do navegador garante uma janela de composição com anexos em todos os aplicativos de e-mail. Se seu aplicativo não consegue usar o arquivo, baixe o pacote ZIP, extraia-o e anexe as cópias JPEG e o CSV em uma nova mensagem. Copie o relatório para o corpo da mensagem. Guarde as fotos originais separadamente se o destinatário puder precisar dos documentos em resolução completa depois.

## Para onde vão as informações

A leitura e a edição acontecem neste navegador. O mecanismo de OCR e os dados de inglês vêm com a página, e nenhuma foto ou campo extraído é enviado para o OCR. A conversão manual permanece local. As taxas históricas online são a etapa de rede opcional descrita acima. Espere até a linha Offline da página indicar que está pronta antes de se desconectar; a ferramenta em cache pode então ler fotos, criar o relatório, preparar cópias JPEG e salvar CSV, arquivo de e-mail ou ZIP sem conexão.

O e-mail e o compartilhamento são uma etapa seguinte intencional. Esses botões entregam o relatório ou os arquivos ao aplicativo que você escolher, e esse aplicativo controla o envio posterior. Um aplicativo de e-mail pode manter um rascunho sem conexão e enviá-lo quando estiver conectado. Confira o destinatário e os anexos como em qualquer outra mensagem com recibos ou faturas.
