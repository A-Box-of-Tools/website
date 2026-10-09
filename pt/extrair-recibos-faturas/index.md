# Extrator de recibos e faturas — das fotos a um relatório que você confere

Leia as fotos, confira os campos e os recortes, depois envie as imagens comprimidas por e-mail com cada valor e os totais.

> Leia fotos de recibos e faturas neste dispositivo, confira os recortes e os valores e converta cada documento para uma única moeda no e-mail, com taxas manuais ou consultas históricas online. Envie imagens comprimidas, valores individuais e um total geral por e-mail.

As fotos são lidas neste dispositivo. As consultas opcionais de taxas históricas enviam apenas as moedas e a data escolhida ao Frankfurter. O e-mail e o compartilhamento são transferências explícitas para um aplicativo escolhido pela pessoa.

## Suas fotos são **lidas neste dispositivo**. As taxas online são opcionais. Você escolhe o que enviar por e-mail ou compartilhar.

As fotos são decodificadas e lidas neste dispositivo. O mecanismo de OCR e os dados do idioma inglês vêm com a página, e nenhuma foto ou campo extraído é enviado para fazer o OCR. As taxas de câmbio manuais, a cópia do relatório e os downloads também são locais. Somente apertar Obter taxa histórica faz uma consulta ao [Frankfurter](https://frankfurter.dev/) com os dois códigos de moeda e a data escolhida. Esse serviço vê a requisição e seu endereço IP, mas não recebe imagem, valor, texto do OCR, nome de arquivo ou endereço de e-mail. O e-mail e o compartilhamento são a próxima etapa, escolhida por você: esses botões passam o relatório ou os arquivos que você escolhe compartilhar para um aplicativo no seu dispositivo. Você escolhe o destinatário, confere o conteúdo e os anexos e faz o envio.

- ✗ Sem envio para processamento
- ✗ Sem conta
- ✓ OCR offline
- ✓ Confira cada documento
- ✓ Envie pelo seu próprio aplicativo

## Como extrair dados de recibos e faturas a partir de fotos

1. **Escolha fotos nítidas.** Adicione até 20 imagens JPEG, PNG, WebP ou AVIF, cada uma com no máximo 20 MB. Use um recibo ou uma fatura por imagem. O idioma compatível com o OCR é o inglês impresso. Fotografe o documento inteiro com iluminação uniforme e o texto nítido e na orientação correta.
2. **Leia, recorte e compare.** Execute o OCR e examine cada foto ao lado dos campos sugeridos e do texto extraído sem edição. Se a imagem estiver de lado, gire-a e leia novamente, se necessário. Ajuste o recorte para manter todas as bordas e todo o texto do documento dentro dele e releia esse recorte. Corrija o estabelecimento, a data, o número do recibo ou da fatura, a moeda e o total. O estabelecimento ou o número podem ficar em branco quando não puderem ser lidos com segurança. Em especial, diferencie o total final de um subtotal, desconto, valor entregue em dinheiro, troco, valor de imposto ou saldo restante.
3. **Confirme cada documento.** Confira os campos, o recorte e a conversão. Escolha a moeda impressa no documento e depois uma única moeda final para todos os documentos no e-mail. Informe cada taxa de câmbio manualmente ou escolha a consulta online e aperte Obter taxa histórica depois de conferir a data do recibo. A direção da conversão é apresentada como uma unidade da moeda do documento na moeda final. Documentos na mesma moeda usam uma taxa de um. Somente valores convertidos confirmados entram no total geral. Remova fotos duplicadas para não contar um recibo duas vezes.
4. **Leve o relatório para seu aplicativo.** Confira as prévias e os tamanhos dos JPEGs preparados. Use E-mail com imagens para escolher seu aplicativo de e-mail quando essa opção for compatível ou baixe o arquivo de e-mail com o relatório e os anexos JPEG. Confira a mensagem e faça o envio. Se seu aplicativo não conseguir abrir o arquivo de e-mail, baixe e extraia o ZIP e anexe suas imagens e o CSV em uma nova mensagem.

## A versão longa

[Extraia dados de recibos e faturas a partir de fotos](https://abox.tools/pt/guias/extrair-recibos-e-faturas/): Como conferir o OCR e os recortes de recibos, escolher uma moeda para o e-mail e taxas manuais ou históricas, e enviar imagens comprimidas com cada valor convertido, a contagem de documentos e o total geral.

## Também na caixa

- [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/): Coloque suas imagens num documento só.
- [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/): Fotografe a página. Você recebe de volta algo com cara de digitalização.
- [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.
- [Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.

## Perguntas

### A ferramenta lê todos os recibos e faturas corretamente?

Não. O OCR pode confundir um dígito ou não reconhecer uma impressão apagada, letras pequenas ou um logotipo estilizado. A análise evita rótulos de descontos e de valores entregues para pagamento, mas não consegue usar um rótulo que o OCR não leu. Os campos de estabelecimento e número do recibo ou da fatura podem ficar em branco quando não há uma opção confiável. A falta do nome do estabelecimento ou uma moeda de dólar ou iene não identificada também podem acionar uma leitura mais próxima do cabeçalho do estabelecimento. Essa leitura é mostrada separadamente e fornece apenas o nome do estabelecimento e sugestões de moeda baseadas no endereço. Uma leitura pouco confiável ou a falta de um valor ou de uma data podem acionar uma segunda leitura com ajuste local de contraste para distinguir melhor a impressão do papel. As duas leituras do documento completo ficam disponíveis para comparação. Divergências não resolvidas sobre valores, datas, números de recibo ou fatura ou moedas podem deixar campos em branco para você preencher. A moeda impressa tem prioridade sobre uma dedução pelo endereço, e uma data reconhecida do recibo ou da fatura tem prioridade sobre uma data de um comprovante de pagamento com cartão anexado. Isso pode melhorar uma sugestão, mas não recuperar detalhes perdidos pelo desfoque nem garantir um resultado correto. Compare cada sugestão com a foto e confirme cada documento por conta própria antes de exportá-lo. Esta ferramenta não extrai os itens individualmente nem comprova que os cálculos de uma fatura estão corretos.

### Uma imagem pode conter vários recibos?

Use um recibo ou uma fatura por imagem. A ferramenta trata cada imagem como um documento e não separa uma coleção de recibos nem uma folha com vários modelos. Adicione uma imagem ou um recorte separado para cada documento, com os dados que o identificam e o valor final visíveis. Caso contrário, o texto de recibos diferentes pode se misturar em uma única sugestão.

### Como as datas e os símbolos de moeda são interpretados?

A data do documento permanece como está impressa. Para consultar uma taxa de câmbio online, confira-a e escolha a data no campo separado de data de conversão; uma data como 24/09/2018 não é convertida automaticamente ali. O símbolo de libra sugere GBP. O símbolo de dólar sozinho pode indicar USD, CAD, AUD ou outra moeda chamada dólar. A moeda impressa junto ao total final tem prioridade. Se a moeda ainda não estiver clara, um país reconhecido ou um código postal distintivo junto com sua região no endereço do estabelecimento podem sugeri-la. A linha do endereço impresso aparece junto da sugestão. Uma cidade sozinha ou um endereço de cliente, entrega ou banco não bastam; dados ambíguos ou contraditórios não resolvidos deixam a moeda em branco. Nenhum serviço de localização é consultado. Confira cada código sugerido no documento.

### Quais arquivos e idiomas a ferramenta consegue ler?

Fotos JPEG, PNG, WebP e AVIF, até 20 por lote e 20 MB por arquivo. O modelo de OCR incluído lê texto impresso em inglês. Outros sistemas de escrita, texto manuscrito, PDFs e arquivos HEIC não são entradas compatíveis aqui. Para uma foto HEIC de iPhone, crie primeiro um JPEG com o aplicativo de fotos do dispositivo ou com o conversor de HEIC deste site.

### O que significam a quantidade de documentos e os totais?

Cada foto conta como um documento. Cada documento mostra seu valor original e o valor convertido na mesma moeda final do e-mail. O total geral soma os valores convertidos conferidos, cada um arredondado para duas casas decimais, e o relatório também mantém os totais nas moedas originais. O e-mail e os downloads de anexos exigem que todos os documentos sejam conferidos. Fotos duplicadas contam duas vezes se você não remover uma delas.

### O botão de e-mail envia algo automaticamente?

Não. Quando há suporte, ele oferece o relatório e as cópias JPEG comprimidas pelo menu de compartilhamento do dispositivo; escolha seu aplicativo de e-mail ali. Caso contrário, ele baixa um arquivo de e-mail contendo o relatório e os anexos. O assunto sugerido inclui a quantidade de documentos e, quando todos estiverem conferidos, o total geral na moeda final. Se você editar o assunto, seu texto será mantido. Confira o destinatário, o conteúdo e os anexos e faça o envio. A página não consegue saber se seu aplicativo de e-mail os aceitou nem se você acabou enviando a mensagem.

### As imagens recortadas são anexadas ao arquivo de e-mail?

Sim. O arquivo `.eml` baixado contém o relatório e cada JPEG preparado como anexo. Aplicativos compatíveis o abrem como rascunho; outros podem abri-lo como uma mensagem que precisa ser encaminhada ou reenviada. Suas fotos originais não são alteradas nem anexadas. O download do ZIP contém os mesmos JPEGs e o CSV caso você precise anexá-los manualmente. Nenhum navegador pode garantir que todos os aplicativos de e-mail aceitem um arquivo de rascunho ou a transferência pelo menu de compartilhamento.

### Como a moeda padrão do e-mail é escolhida?

Cada documento com um código de moeda válido tem um voto. O código mais frequente se torna a moeda final do e-mail; em caso de empate, vale a primeira ocorrência na ordem atual dos documentos. Códigos ausentes ou incompletos são ignorados. Ler, corrigir ou remover documentos atualiza a moeda padrão. Escolher uma moeda final manualmente preserva sua escolha. Usar moeda padrão restaura a escolha automática. Alterar a moeda final apaga as taxas de câmbio e as confirmações anteriores.

### Posso escolher uma moeda que não está na lista?

Sim. Escolha Outro / código personalizado e digite um código de três letras para a moeda do documento ou a moeda final do e-mail. Alterar a moeda final atualiza todos os documentos e apaga suas taxas e conferências anteriores. A disponibilidade de taxas online depende do par de moedas e da data. Se não houver uma taxa histórica disponível, informe uma taxa manualmente; a ferramenta não a substitui pela taxa mais recente.

### Minhas fotos são enviadas para fazer o OCR?

Não. O Tesseract as lê no seu navegador usando os dados do idioma inglês que vêm com a página. Copiar e baixar são ações locais. Escolher e-mail ou compartilhamento do dispositivo passa intencionalmente as informações selecionadas para outro aplicativo, que cuida de qualquer entrega posterior.

### Por que uma foto com muitos detalhes ainda pode dar um resultado ruim?

Reflexos, desfoque, dobras e uma página distante podem esconder letras mesmo em uma imagem grande. O OCR amplia recortes pequenos em até três vezes e acrescenta uma borda branca estreita, mantendo a cópia de trabalho com até 2400 pixels no lado mais longo. Isso pode ajudar o mecanismo a ler letras pequenas, mas não recupera detalhes ausentes na foto. Preencha o enquadramento com um documento, mantenha a impressão nítida e iluminada de maneira uniforme e gire uma página de lado antes de ler novamente. O original e o anexo do e-mail não são ampliados para o OCR.

### Funciona offline?

A leitura, a edição, os recortes, a conversão manual, a contagem, o preparo dos JPEGs e os downloads funcionam depois que a página e os arquivos de OCR estiverem em cache. A consulta online de taxas históricas precisa de conexão; uma taxa já consultada permanece disponível na aba aberta. Abrir um rascunho pode funcionar offline, mas a entrega do e-mail normalmente depende da conexão do seu aplicativo.

### Como as taxas históricas usam a data do recibo?

Confira a data impressa no recibo e informe-a no campo de data de conversão. Datas ambíguas não são adivinhadas. Escolha a consulta online e aperte Obter taxa histórica. O resultado informa a data real de observação, que pode ser anterior à data solicitada quando não houve publicação de uma taxa naquele dia. Compare-a antes de confirmar. Você também pode informar uma taxa manual separada para cada documento. O e-mail registra a taxa, a fonte e a data usadas para cada valor convertido.

## Como dá para conferir a promessa de privacidade

- **O OCR acontece no seu dispositivo.** Uma foto contém pixels em vez de texto, então sua leitura precisa de um mecanismo de OCR. Esta página inclui o Tesseract e os dados do idioma inglês, em vez de mandar a foto para um servidor. O navegador lê os arquivos escolhidos na memória. Nem as fotos nem os campos extraídos delas são armazenados por este site. O mecanismo e os dados ocupam cerca de 8 MB antes da compressão para distribuição e ficam em cache com a ferramenta. Suas versões, arquivos de origem e [licenças estão listados junto deles](https://abox.tools/pt/extrair-recibos-faturas/vendor/README.md).
- **Um valor sugerido ainda precisa da sua conferência.** Um dígito apagado, um reflexo ou um subtotal perto do fim podem produzir uma resposta errada que parece convincente. Compare o estabelecimento, a data, o número do recibo ou da fatura, a moeda e o total com a imagem, corrija os campos e confira se o documento inteiro permanece dentro do recorte. Somente documentos confirmados entram nos totais, e todos os documentos restantes precisam ser confirmados antes de liberar o e-mail ou o download dos anexos. Alterar um campo, o recorte ou a rotação exige uma nova conferência. Um relatório copiado ou um CSV pode incluir linhas ainda não concluídas, marcadas como precisando de conferência. A confirmação registra sua conferência; ela não comprova de forma independente que os cálculos do documento estão corretos.
- **Você controla a transferência para o e-mail.** Quando o compartilhamento de arquivos é compatível, E-mail com imagens abre o menu de compartilhamento do dispositivo com as cópias JPEG comprimidas e o relatório. Escolha seu aplicativo de e-mail e confira nele o destinatário, o texto e os anexos. Caso contrário, baixe o arquivo de e-mail que contém o relatório e todos os anexos JPEG. Aplicativos compatíveis o abrem como rascunho; em outros, pode ser preciso usar Encaminhar ou Reenviar. Esta página não envia nada. Seu aplicativo e seu provedor de e-mail fazem a entrega de acordo com suas próprias configurações.
- **As imagens para envio são cópias recortadas e comprimidas.** Ajuste cada recorte para manter o recibo ou a fatura por inteiro. A página sugere um recorte quando encontra bordas claras do documento; caso contrário, mantém a imagem inteira. Confira e ajuste essa sugestão. Em um recibo longo de papel colorido, uma cor de papel correspondente além da borda detectada pode preservar aquela extremidade da imagem, mantendo o cabeçalho ou o texto final com um pouco de fundo extra. Ela cria cópias JPEG com até 1600 pixels no lado mais longo e busca um tamanho de cerca de 350 KB por imagem. Confira as prévias e os tamanhos informados antes de enviar; essa meta de tamanho não é garantida. Suas fotos originais não são alteradas nem anexadas. Se seu aplicativo de e-mail não conseguir usar o arquivo de e-mail, baixe o ZIP, extraia-o e anexe as cópias JPEG e o CSV por conta própria.
- **As taxas de câmbio online são opcionais.** As taxas manuais mantêm todo o preparo offline. Escolher a consulta online não envia uma requisição por si só: aperte Obter taxa histórica para aquele documento. Isso envia apenas a moeda de origem, a moeda final e a data escolhida a api.frankfurter.dev, sem credenciais nem informação de referência da página de origem. O Frankfurter pode ver seu endereço IP e a requisição. A taxa retornada e a data de observação aparecem ao lado do documento e no relatório. São taxas de referência e podem ser diferentes das cobradas por um banco ou cartão. Se o serviço não fornecer uma taxa, use uma taxa manual; a página nunca usa a taxa de hoje sem avisar.
- **O relatório fica nesta aba até você levá-lo para outro lugar.** Não há conta nem histórico de documentos aqui. Mantenha a página aberta durante a conferência e copie o relatório ou salve o CSV antes de sair. Fechar ou recarregar a página apaga o lote que está na memória. Um relatório que você copia, baixa ou passa para outro aplicativo permanece onde você o colocou.
- **O que os outros scripts da página recebem.** Os scripts de publicidade, medição e do botão de doação do site carregam como nas outras ferramentas. Eles não recebem fotos, texto do OCR, nomes de arquivo, nomes de estabelecimentos, valores nem quantidades de documentos. O código que lê as fotos e monta o relatório é servido por este site e está listado no repositório.
- **A leitura funciona offline; a entrega depende do aplicativo.** Espere a linha Offline da página indicar que está pronta, desconecte a internet e leia outra foto. O mecanismo de OCR em cache, o formulário de conferência, os totais, a cópia, o preparo dos JPEGs, a conversão manual e os downloads continuam funcionando. A consulta de taxas online precisa de conexão. Seu aplicativo de e-mail pode salvar um rascunho offline; o envio depende da conexão usada por esse aplicativo.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/ocr.js` para a integração com o OCR local, `src/main.js` para a conferência e as transferências para e-mail e compartilhamento, `src/attachments.js` para as cópias JPEG, `src/email.js` para o arquivo de e-mail, `src/fx.js` para a conversão e as consultas opcionais de taxas históricas, e `vendor/` para o mecanismo e suas licenças. O relatório e os anexos são montados na aba; a pessoa escolhe um aplicativo de e-mail ou baixa um arquivo de e-mail e faz o envio.
