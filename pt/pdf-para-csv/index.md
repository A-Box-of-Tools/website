# PDF para CSV — todas as tabelas, inclusive extratos bancários

Encontra as tabelas de um PDF e as transforma em linhas que uma planilha consegue abrir.

> Converta tabelas de PDF em CSV: extratos bancários e de cartão, faturas, listas de preços e relatórios. Localiza o texto de cada tabela e compara saldos quando possível. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/pdf-para-csv/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem documentos. Não existe servidor.

O PDF é aberto e lido na memória deste computador por código servido deste endereço. O CSV é gerado da mesma forma. Nada aqui faz envio, e não há servidor do outro lado para recebê-lo. O conteúdo das tabelas, seja número de conta, saldo, beneficiários ou preços de um cliente, fica nesta aba.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como transformar as tabelas de um PDF em CSV

1. **Escolha o PDF.** Um por vez. O navegador lê todas as páginas diretamente do disco antes de decidir a interpretação dos dados. Escrever 1.240,00 ou 1,240.00 e a ordem dos componentes das datas são características do documento inteiro, não de uma página isolada.
2. **Confira as tabelas encontradas.** Cada tabela mantém suas colunas e os cabeçalhos impressos, quando existem. Uma tabela que continua em outra seção ou página com os mesmos cabeçalhos é reunida, sem repetir o cabeçalho no meio. Uma célula que ocupa duas linhas volta a ser uma só. Totais, subtotais e rótulos são preservados como as linhas em que aparecem.
3. **Escolha uma tabela ou leve todas.** Quando há várias, o seletor acima delas define o conteúdo do CSV: todas em sequência ou apenas a desejada. Se houver saldo acumulado, a página mostra as comparações que conferem e as linhas que não puderam ser verificadas. Datas com ano saem como AAAA-MM-DD; valores, como números com sinal. Uma data sem ano fica como foi impressa, pois acrescentar um ano seria adivinhar.
4. **Baixe o CSV.** O arquivo segue a RFC 4180, com aspas corretas e quebras de linha CRLF. Usa UTF-8 com marca de ordem de bytes para o Excel preservar símbolos de moedas. Ao reunir várias tabelas, cada uma mantém seu cabeçalho e uma linha em branco as separa. Nada foi enviado para produzi-lo.

## A versão longa

[É seguro enviar um extrato bancário?](https://abox.tools/pt/guias/e-seguro-enviar-um-extrato-bancario/): Um extrato reúne destinatários, valores, saldo e conta. Veja o que um conversor recebe, o que serviços cuidadosos fazem com os dados e se o envio é necessário.

## Também na caixa

- [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/): Coloque suas imagens num documento só.
- [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/): Fotografe a página. Você recebe de volta algo com cara de digitalização.
- [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.
- [Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.

## Perguntas

### Como a ferramenta encontra tabelas se o PDF não as identifica como tabelas?

Pela posição do texto. Primeiro, separa colunas de letras pequenas que ficam ao lado do conteúdo principal. Elas diferem das colunas da tabela porque as células compartilham exatamente a mesma linha de base; o texto lateral só se alinha por acaso. Depois, percorre cada região de cima para baixo, dividindo-a em blocos nos títulos e espaços. As colunas são os pontos em que várias linhas concordam sobre o início ou o fim das células. Blocos com as mesmas colunas são reunidos. Não depende de modelos de banco ou formulário.

### Só funciona com extratos bancários?

Não. Começou como conversor de extratos, mas foi refeito para encontrar todas as tabelas. O primeiro extrato real tinha duas transações e cinco outras tabelas; procurar apenas transações não encontrava nada. Faturas, listas de preços, horários, resultados e relatórios também contêm tabelas. O extrato acrescenta o saldo acumulado, usado para comparar as variações líquidas entre saldos legíveis.

### O que acontece com uma descrição longa demais para a coluna?

Ela é reunida à sua linha, evitando um erro que torna muitos CSVs extraídos de PDF inutilizáveis. Um trecho com uma única célula de texto perto de uma linha é interpretado como continuação dessa célula. Ele é unido à linha de baixo, em vez da de cima, quando está mais perto dela, como ocorre com um rótulo longo acima do valor. Um trecho com várias células ou com um número é tratado como uma linha própria.

### O que a conferência do saldo comprova?

Compara a soma dos valores entre dois saldos legíveis com a variação do saldo e informa quantas comparações conferem. A mesma conta identifica possíveis colunas de valores e saldos sem depender dos títulos. A página lista linhas que ficaram sem verificação: valores antes do primeiro saldo, depois do último e intervalos com valores ausentes ou ilegíveis. Uma célula vazia de débito ou crédito não utilizado conta como zero; um valor ilegível, não. Saldos coincidentes não descartam erros que se anulam nem verificam descrições e datas. Confira o CSV com o PDF antes de confiar nele.

### As datas ficaram invertidas: 03/04 deveria ser 4 de março, não 3 de abril.

Mude o seletor acima das tabelas; tudo é recalculado na hora. A interpretação vem do documento, não da sua localização. Se alguma data tiver dia maior que doze, ela define a ordem para o documento inteiro, e a página informa isso. Se todas tiverem dia até doze, não há como distingui-las só pelo arquivo: a ferramenta *avisa* e começa com dia primeiro, até você mudar. Datas impressas sem ano, comuns em extratos de cartão, permanecem como estão.

### Funciona com PDF digitalizado?

Não. A página explica isso em vez de entregar um arquivo vazio. Uma digitalização é uma imagem, sem texto para alinhar. As alternativas aparecem na página. Para extratos, quase todo banco on-line oferece CSV, OFX ou QIF diretamente: dispensa conversão e é mais preciso que interpretar uma imagem.

### Ele abre um PDF protegido por senha?

Não, de propósito. Bancos costumam proteger extratos com data de nascimento ou últimos dígitos da conta. Remover essa proteção é outra tarefa. O [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) deste site remove a senha no navegador sem alterar as páginas, preservando a posição do texto. Também é possível imprimir novamente em PDF no Chrome ou Edge, ou exportar pelo Pré-Visualização no Mac. Não use outro site de desbloqueio: isso enviaria justamente o documento que esta página procura manter fora da internet.

### Meu PDF é enviado para algum lugar?

Não. O navegador lê o arquivo e gera o CSV no seu próprio computador. Não há processamento em servidor. A `Content-Security-Policy` lista os endereços que a página pode contatar; nenhum pertence a este site. Desligue a internet e converta um PDF para conferir.

### Por que há um caractere estranho no início do CSV?

É a marca de ordem de bytes, incluída de propósito. Sem ela, o Excel no Windows pode usar a codificação antiga do sistema e trocar símbolos como libra e euro por letras. A marca informa que o arquivo é UTF-8. Os leitores mais comuns a ignoram; um analisador estrito pode devolvê-la como caractere invisível antes do primeiro cabeçalho. Esse é o custo da compatibilidade.

### Há limite de tamanho, e custa alguma coisa?

A ferramenta não impõe limite. O limite é a memória do seu computador: o documento fica nela durante a leitura, e um notebook costuma lidar com centenas de páginas. É grátis, sem conta, cadastro ou período de teste. A publicidade sustenta o site, mas não recebe dados dos seus documentos.

### Funciona offline?

Sim. Abra a página uma vez e depois desligue a internet: ela continua funcionando. Uma ferramenta que enviasse o documento para conversão pararia assim que a conexão fosse desligada.

## Como dá para conferir a promessa de privacidade

- **Os PDFs que precisam de conversão costumam conter dados sensíveis.** Uma tabela pequena pode ser redigitada. Os documentos que precisam desta ferramenta são extratos, faturas, holerites e relatórios: quem recebeu cada pagamento, quanto sobrou, preços de clientes e números de empresas. Entregá-los a um servidor desconhecido para obter uma planilha dá a terceiros uma cópia valiosa, que pode ser guardada e se tornar alvo de ataque. Esta página não tem um servidor de processamento: não há para onde enviar o arquivo.
- **O saldo permite conferir variações líquidas, com limites explícitos.** Encontrar tabelas em PDF exige inferências: os limites das colunas ou a união de linhas podem estar errados. A ferramenta compara a soma dos valores entre dois saldos legíveis com a variação do saldo. Informa quantas comparações conferem e quais linhas ficaram sem conferência, inclusive antes do primeiro saldo, depois do último ou em intervalos ilegíveis. Uma coincidência é um indício útil, não prova de que tudo está certo: erros que se anulam podem passar. Tabelas sem saldo reconhecido não recebem essa verificação.
- **As tabelas são encontradas na página, sem um modelo para cada banco.** Não há lista de bancos nem de formatos aceitos. Uma coluna de letras pequenas ao lado do conteúdo principal é separada, e cada região é examinada em busca de células alinhadas. Isso permite ler extratos de bancos desconhecidos e relatórios nunca vistos antes. Também explica por que a leitura pode falhar quando as colunas realmente se sobrepõem.
- **A senha não é removida aqui; a página indica como fazer isso.** Um PDF protegido é recusado. Remover a proteção é uma tarefa diferente de ler tabelas; fazer isso sem avisar seria inesperado. A página indica caminhos que mantêm o arquivo no computador: o [desbloqueador de PDF](https://abox.tools/pt/desbloquear-pdf/) deste site, que remove a senha no navegador sem alterar as páginas, ou imprimir novamente em PDF no navegador ou no Pré-Visualização. Não entregue o documento a outro site que ofereça desbloqueá-lo: esse é justamente o envio que esta ferramenta evita.
- **Uma fotografia da página não tem texto para extrair.** Uma digitalização é uma imagem: as linhas são pixels, sem texto que possa ser organizado em colunas. A ferramenta informa isso e apresenta alternativas sem envio. Para extratos, a primeira costuma ser a mais simples: o banco provavelmente oferece o mesmo documento diretamente em CSV. Reconhecer letras em uma imagem é OCR, uma tarefa diferente desta conversão.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e medição vêm do Google. Eles não recebem nada do documento: arquivo, tabela, linha, número, nome ou quantidade de páginas. Todo o código que lê o PDF ou escreve o CSV é servido desta origem e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” no topo é desenhado por um script de cdnjs.buymeacoffee.com e busca as letras no Google Fonts. É um link e nada mais: não relata visita alguma, e não recebe nada sobre você nem sobre os seus documentos. Nada acontece a menos que você clique, e para onde você iria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desligue a rede e a página continua funcionando. É uma verificação simples: uma ferramenta que enviasse o documento para converter em outro lugar pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/layout.js` para a divisão da página em regiões mesmo sem linhas de grade, `src/tables.js` para a identificação das tabelas e colunas, `src/rows.js` para reunir o texto em linhas, e `src/check.js` para as contas que comparam os saldos do extrato. Nenhum deles, nem o leitor usado por eles, acessa a rede.
