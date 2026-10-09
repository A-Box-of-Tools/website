# Como conferir um CSV de extrato bancário antes de confiar nele

Uma planilha pode parecer perfeita e ainda conter um valor errado ou uma transação ausente. Compare-a com o extrato: use os saldos impressos para conferir os valores e as linhas originais para verificar o restante.

Última atualização 29 de setembro de 2026

## O que conferir

Um CSV que abre perfeitamente em uma planilha ainda pode ter um valor errado, uma transação ausente ou uma data invertida. Compare-o com o extrato original: confira linhas, datas e descrições e use os saldos impressos para testar os valores.

Mantenha o PDF ao lado do arquivo convertido. Um download bem-sucedido só mostra que o conversor gerou um arquivo. As verificações abaixo ajudam a saber se ele reproduz o extrato corretamente.

## Antes de converter, procure uma exportação

Se o banco oferece CSV para o período desejado, comece por ele. A exportação direta dispensa reconstruir a tabela a partir de palavras posicionadas no PDF. Confira conta, período e significado das colunas, mas há uma etapa a menos em que algo pode dar errado.

Às vezes, só existe o PDF: um extrato antigo, uma conta encerrada ou um documento recebido de outra pessoa. É nesses casos que a conversão faz sentido.

## Confira um pequeno extrato de exemplo

Este extrato fictício de conta corrente começa com **1.250,00**. Valores positivos aumentam o saldo; negativos o reduzem. A última coluna vem impressa no extrato, não de uma fórmula acrescentada à planilha.

Quatro transações fictícias, com saldo inicial de 1.250,00

| Data | Descrição | Valor | Saldo impresso |
| --- | --- | --- | --- |
| 2026-08-03 | Pagamento de salário | +800,00 | 2.050,00 |
| 2026-08-04 | Supermercado | -43,20 | 2.006,80 |
| 2026-08-05 | Café | -6,80 | 2.000,00 |
| 2026-08-06 | Transferência | -125,00 | 1.875,00 |

Cada linha permite uma conta: **saldo anterior + valor com sinal = novo saldo**. Para o supermercado, `2050,00 + (-43,20) = 2006,80`. Para o café, `2006,80 + (-6,80) = 2000,00`.

Suponha que o CSV leia o supermercado como **-48,20**. Todas as células estão preenchidas, mas `2050,00 + (-48,20) = 2001,80`. A diferença de **5,00** em relação ao saldo impresso aponta uma linha específica para conferir no PDF.

Preserve os saldos impressos durante a conferência. Substituí-los por fórmulas calculadas com os valores convertidos faz a planilha concordar consigo mesma, inclusive com os erros.

Entenda o significado do saldo antes de aplicar os sinais. Uma fatura de cartão pode mostrar a dívida: compras a aumentam e pagamentos a reduzem. Não presuma que os sinais tenham o mesmo significado deste exemplo de conta corrente.

## Por que o saldo final não basta

Comparar saldo inicial mais movimentações com o saldo final é útil, mas erros podem se anular. Se um pagamento for lido 5,00 acima e outro 5,00 abaixo, o total ainda confere.

Use todos os saldos acumulados disponíveis. Se só houver saldo ao fim do dia, compare-o com o saldo impresso anterior mais todos os valores entre eles.

Ainda há limites. Duas transações ausentes de **-20,00 e +20,00** deixam o saldo igual, e a conferência desse intervalo pode passar. Compare também a sequência das linhas com o original.

Um saldo coincidente não comprova que data ou destinatário foram copiados corretamente nem autentica o extrato. Ele só testa a relação entre os valores e saldos disponíveis.

## Confira as datas antes de ordenar as linhas

`03/04/2026` pode significar 3 de abril ou 4 de março. Uma data como `18/04/2026` esclarece a convenção, mas um extrato curto pode não conter essa pista. Confira o período e o formato usado pelo banco.

Confira novamente depois de abrir o CSV: a planilha pode interpretar as datas de outro jeito. Preserve a ordem original até terminar. Ordenar datas parcialmente invertidas dificulta a comparação e altera a sequência usada na conferência dos saldos.

Datas sem ano também exigem conferir o período, principalmente entre dezembro e janeiro. Observe os números: `1,240.00` e `1.240,00` podem representar o mesmo valor, que precisa ser preservado nas células importadas.

## Leia as descrições e separe os totais

Uma descrição em duas linhas ainda pertence a uma única transação. Confira se a continuação ficou junto dela. Preste atenção às quebras de página: cabeçalhos repetidos e saldos transportados podem parecer transações adicionais.

O PDF também pode ter resumos da conta, subtotais e dados de pagamento. Eles pertencem à extração do documento, mas não devem virar novas transações na importação. Identifique a tabela de movimentações e separe as linhas de resumo.

Dois pagamentos com a mesma data, destinatário e valor podem ser reais. Compare posição e referência no extrato antes de remover um deles. Uma extração duplicada e um pagamento repetido exigem correções diferentes.

## O que este conversor verifica

[PDF para CSV](https://abox.tools/pt/pdf-para-csv/) encontra tabelas pelo alinhamento do texto, reúne células quebradas e preserva totais e rótulos de seção. Se houver várias tabelas, escolha a desejada. Há um seletor para datas ambíguas; datas sem ano permanecem como impressas.

Quando reconhece uma sequência de saldos, informa se as comparações disponíveis conferem. Confira por conta própria os valores até o primeiro saldo impresso usando o saldo inicial, assim como os valores após o último saldo. A confirmação cobre apenas as comparações que foram possíveis.

Se nenhuma sequência utilizável for reconhecida, não haverá resultado de conferência. **Ausência de aviso não é confirmação.** Nem silêncio nem saldos coincidentes garantem que tudo esteja correto. A prévia mostra no máximo 25 linhas por tabela; confira o restante no arquivo baixado.

Páginas digitalizadas precisam de reconhecimento de texto, que esta ferramenta não oferece. A conversão acontece no navegador; o guia sobre [enviar extratos bancários a conversores](https://abox.tools/pt/guias/e-seguro-enviar-um-extrato-bancario/) trata da privacidade.

## Antes de importar o CSV em outro programa

Confira a prévia de importação com o mesmo cuidado. Escolha a conta bancária ou o cartão correto, confirme o formato de data e associe as colunas de data, descrição e valor. Essas decisões são separadas da extração do PDF. As [orientações de importação CSV da Intuit](https://quickbooks.intuit.com/learn-support/en-uk/help-article/bank-transactions/prepare-csv-file-bank-upload-quickbooks/L4BjLWckq_GB_en_GB) mostram os requisitos de um produto.

- Confirme a conta e o período do extrato.
- Confira datas, sinais e formatos numéricos após abrir o arquivo.
- Compare as transações com o original, inclusive nas quebras de página.
- Confira saldos inicial, intermediários e final quando disponíveis.
- Investigue diferenças e linhas repetidas antes de alterá-las.
- Guarde o extrato original e uma cópia do CSV conferido.
