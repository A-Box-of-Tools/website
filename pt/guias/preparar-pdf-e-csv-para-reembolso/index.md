# Prepare um PDF e um CSV de reembolso a partir de fotos de recibos

Uma solicitação de reembolso costuma precisar de recibos legíveis e de uma lista de despesas. Comece com um único conjunto de fotos revisadas para que o PDF e o CSV descrevam os mesmos documentos na mesma ordem.

Última atualização 22 de outubro de 2026

## Gere os comprovantes e as linhas a partir dos mesmos registros

Um PDF oferece ao destinatário recibos para ler. Um CSV oferece campos para conferir ou abrir em uma planilha. Comece no [Extrator de recibos e faturas](https://abox.tools/pt/extrair-recibos-faturas/), revise os registros e use os anexos JPEG preparados em [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/). Comprima o PDF apenas se ele precisar atender a um limite menor de anexos.

Este exemplo usa três recibos fictícios em dólares canadenses:

| Recibo, na ordem dos registros | Total confirmado |
| --- | --- |
| 1. North Street Print | CAD 12,40 |
| 2. Market Car Park | CAD 8,00 |
| 3. Harbour Stationery | CAD 17,60 |

O total esperado é CAD 38,00. Confira primeiro os campos e formatos de anexos exigidos pelo destinatário. Este artigo monta um par de arquivos correspondentes; ele não decide se uma despesa se qualifica para pagamento.

## Comece com uma foto por documento

Guarde os originais e selecione cópias no [extrator](https://abox.tools/pt/extrair-recibos-faturas/). Ele aceita JPEG, PNG, WebP e AVIF compatíveis com o navegador, até 20 imagens por lote e 20 MB por imagem. O reconhecimento usa um modelo local de texto impresso em inglês. Converta primeiro as imagens incompatíveis e obtenha uma foto mais nítida quando uma data ou um valor estiver borrado a ponto de não poder ser lido.

Uma imagem vira um registro de documento. Três páginas de uma fatura não são agrupadas automaticamente em uma despesa. Totais repetidos nessas páginas podem criar vários registros para a mesma cobrança; este processo simples pressupõe um recibo completo em cada foto. O [guia de extração](https://abox.tools/pt/guias/extrair-recibos-e-faturas/) descreve o alcance da ferramenta e as etapas de revisão.

## Revise os campos e os recortes juntos

O reconhecimento sugere valores; compare com a imagem. Confira estabelecimento, data, referência, total e moeda. Um subtotal, imposto, dinheiro entregue ou troco pode parecer plausível sem ser o valor final do recibo. Não invente um valor ausente para fazer uma linha parecer completa.

Mantenha o documento inteiro dentro do recorte do anexo, incluindo número do recibo, valor final e detalhamento relevante dos impostos. Confirme campos e recorte somente depois de lê-los. Uma alteração posterior no recorte ou em um campo pode desfazer a confirmação; por isso, revise o status novamente antes de exportar.

Neste exemplo, escolha CAD como moeda final e confira se as três moedas originais são CAD. Registros na mesma moeda usam uma taxa de um; não é necessário consultar câmbio online. Com moedas diferentes, siga a revisão de taxas do guia de extração em vez de somar valores em moedas distintas.

Somente registros confirmados entram nos totais. Uma soma aparentemente correta ainda pode omitir um recibo inacabado. Confira juntos os três registros confirmados e CAD 38,00. Os avisos de duplicidade comparam apenas nome e tamanho do arquivo: inspecione as imagens, pois duplicatas renomeadas podem escapar de um aviso e imagens diferentes podem gerar um.

## Exporte linhas e imagens correspondentes

Baixe o CSV revisado e os anexos JPEG preparados, ou o ZIP que contém ambos. Extraia o ZIP antes de selecionar as imagens para a próxima ferramenta. Os nomes dos anexos incluem números de registro estáveis, enquanto a coluna de nome de arquivo do CSV contém o nome da foto original. Salve também uma cópia do relatório de texto: ele lista juntos os nomes originais e os dos anexos preparados. Use essa correspondência e o estabelecimento, a data e o valor para associar linhas e imagens, principalmente quando os nomes de arquivos da câmera se repetirem.

É possível exportar um CSV com a revisão inacabada. Abra o arquivo realmente baixado e confira o status e os campos de cada registro; exportar não significa que tudo foi confirmado. Neste exemplo, deve haver três registros de despesas pretendidas, cada um com uma imagem correspondente e o valor em CAD conferido na tabela acima. O CSV também termina com linhas de contagem de documentos, contagem de conferidos e total geral; elas são resumos, não recibos extras. Exclua essas linhas ao somar as despesas por conta própria.

Salve o conjunto como `workshop-expenses.csv` e uma pasta de trabalho com imagens numeradas dos recibos. Mantenha as fotos originais separadas. Abrir o CSV em uma planilha pode aplicar a interpretação de datas ou números desse programa; compare a exibição com o texto exportado e o recibo antes de confiar em um valor importado.

## Monte o PDF na ordem dos registros

Escolha os JPEGs preparados em [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/). A passagem entre ferramentas consiste em baixar e selecionar; escolher novamente as fotos originais da câmera descartaria os recortes revisados e quebraria a correspondência com aqueles anexos.

Organize as imagens na ordem das linhas de despesas do CSV: impressão, estacionamento e papelaria. Confira a correspondência de nomes no relatório em vez de confiar na ordenação do seletor de arquivos. Escolha uma disposição de página que mantenha cada recibo inteiro e legível e salve `workshop-receipts.pdf`. O [guia de imagens para PDF](https://abox.tools/pt/guias/juntar-imagens-em-um-pdf/) explica tamanhos de página e qualidade de imagem.

![Controles de disposição de página de Imagens para PDF para escolher o tamanho do papel e como a imagem se ajusta à página.](https://abox.tools/screens/prepare-a-reimbursement-pdf-and-csv/layout.webp)

Controles de disposição de página. Mantenha recibos longos inteiros e confira as letras pequenas no PDF exportado, não apenas na prévia.

Abra o PDF baixado e leia todas as páginas. Confira orientação, bordas completas, datas e números pequenos dos impostos. Esse PDF de imagens não ganha uma camada de texto pesquisável só porque foi usado OCR para criar o CSV.

## Comprima apenas se o limite do destinatário exigir

Se o PDF couber, mantenha-o. O extrator já prepara anexos JPEG comprimidos, então outra passagem pode oferecer pouco benefício e dificultar a leitura das letras pequenas. Caso contrário, teste uma cópia em [Comprimir PDF](https://abox.tools/pt/comprimir-pdf/), compare os tamanhos e releia todos os recibos. A compressão não garante uma redução específica. O [guia de compressão de PDF](https://abox.tools/pt/guias/deixar-um-pdf-menor/) explica as escolhas.

## Confira o par que você vai apresentar

- O CSV contém as três despesas pretendidas e confirmadas, com as moedas corretas.
- Cada recibo corresponde a um registro e aparece na ordem correspondente no PDF.
- Cada página final do PDF preserva os detalhes que sustentam seu valor.
- Os valores confirmados em CAD somam CAD 38,00.
- Os anexos exatos atendem aos requisitos de formato e tamanho do destinatário.

O OCR e a revisão manual deste exemplo acontecem localmente. Uma consulta opcional de câmbio histórico é uma ação de rede separada; enviar os arquivos resultantes por e-mail ou outro serviço é outra. Guarde os originais para dúvidas futuras. Um PDF e um CSV correspondentes facilitam a revisão, mas não comprovam que o reconhecimento estava correto nem garantem aceitação.
