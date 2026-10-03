# É seguro enviar um extrato bancário?

Em geral, nada de ruim acontece. Isso não significa que o envio seja seguro nem responde à pergunta principal: um extrato concentra muitos dados pessoais, e convertê-lo em planilha pode ser feito sem servidor.

[Abrir PDF para CSV](https://abox.tools/pt/pdf-para-csv/): Encontra as tabelas de um PDF e as transforma em linhas que uma planilha consegue abrir.

Última atualização 29 de setembro de 2026

## O que está em jogo

Em geral, nada de ruim acontece. Muitos conversores de extratos são empresas comuns, com práticas normais de segurança, que processam o arquivo, devolvem o resultado e o apagam. Se essa fosse toda a questão, não haveria muito a discutir.

Mas um extrato não é um arquivo qualquer. Ele lista quem você pagou, por quê, quando, quanto e o que sobrou, com nome, endereço e número da conta no cabeçalho. Poucos documentos revelam tanto em tão poucas páginas. Transformá-lo em planilha pode ser feito sem servidor: são cálculos sobre texto que já está no arquivo. Além de avaliar a confiança na empresa, pergunte por que o envio precisa acontecer.

## O que você está entregando

Não se trata apenas de “alguns dados financeiros”. Um extrato pode conter:

- **Sua renda e sua origem**: salário, empregador, valor e mudanças ao longo do tempo.
- **Todos os destinatários dos pagamentos**: lojas, viagens, locador ou financiador, farmácia, advogado, academia, escola, veterinário e assinaturas esquecidas. Esses nomes podem revelar mais que os valores.
- **Seu saldo**, informação útil para quem avalia se vale a pena tentar uma fraude.
- **Número da conta e código bancário**, como o sort code britânico, normalmente no cabeçalho das páginas.
- **Dados de outras pessoas**, que não concordaram com esse envio. Para quem trabalha com contabilidade, podem ser informações de clientes sujeitas às regras da profissão.

Essa combinação pode valer mais para um criminoso que uma senha: o histórico não expira e não pode ser redefinido.

## O que um serviço cuidadoso faz

É importante reconhecer boas práticas. Um conversor bem administrado pode processar o arquivo, guardá-lo por pouco tempo e apagá-lo automaticamente, cumprindo o prometido. Vários publicam essa política, e alguns passam por auditorias.

O que você não consegue verificar diretamente é se nenhuma cópia foi lida ou guardada. Depois do envio, as informações sobre o tratamento vêm das políticas e dos controles do serviço. Isso não é uma acusação; é uma característica da relação. Alguns riscos vão além da boa intenção:

- **O arquivo pode passar por mais sistemas do que parece.** Balanceadores, registros de requisições, ferramentas de erro, pastas temporárias e backups podem participar do processamento. O prazo de exclusão da cópia principal nem sempre cobre todos eles.
- **A empresa pode mudar.** Aquisições, novos responsáveis e alterações nos termos podem mudar como os dados retidos são tratados. Uma política publicada hoje não descreve necessariamente o serviço de amanhã.
- **Uma falha em outro sistema pode atingir seu extrato.** Você depende das atualizações, dos funcionários, dos fornecedores e dos fornecedores desses fornecedores.
- **O serviço gratuito precisa ser sustentado.** Nem sempre pelos dados: muitos vivem de anúncios ou atraem clientes para produtos pagos. Vale entender o modelo na política de privacidade, não apenas na página inicial.

## Duas perguntas para decidir

O mesmo teste usado nos outros guias deste site é especialmente simples para extratos.

**O trabalho precisa de um servidor?** Para converter texto de extrato em CSV, não. O texto já está no PDF. Encontrar colunas exige calcular posições; conferir linhas exige calcular saldos. Não é necessário um modelo remoto, uma licença no servidor ou um equipamento diferente. O navegador consegue fazer isso, como faz [o conversor deste site](https://abox.tools/pt/pdf-para-csv/).

**Você consegue conferir a diferença?** Abra a página, desligue a internet e converta um extrato. Uma ferramenta que depende de servidor para; uma que processa localmente continua. Você também pode abrir as ferramentas de desenvolvedor do navegador e acompanhar a aba Rede para verificar se o arquivo é enviado.

## A alternativa frequentemente esquecida

Antes de converter, procure no banco. Muitos serviços bancários já exportam o mesmo período em CSV, OFX ou QIF, perto da lista de extratos ou do seletor de datas. Essa opção é mais precisa que reconstruir uma tabela de PDF, porque nada precisa ser deduzido. Também mantém os dados entre as duas partes que já os possuem.

A conversão ainda pode ser necessária se a exportação cobre apenas meses recentes, a conta foi encerrada ou o extrato chegou como anexo de outra pessoa. São bons motivos; vale conferir primeiro.

## Se você decidir enviar

Às vezes, o fluxo disponível exige isso. Um extrato digitalizado precisa de OCR, uma tarefa mais pesada. Se for enviar:

- **Remova o que não é necessário.** Número da conta e endereço raramente são indispensáveis à conversão das transações.
- **Leia o prazo de retenção.** “Levamos sua privacidade a sério” não define um prazo; “os arquivos são apagados após uma hora” define.
- **Considere um serviço pago.** Pagar não garante cuidado, mas esclarece como o negócio é sustentado.
- **Confira o resultado.** Isso vale para qualquer conversor, local ou remoto. Quando há saldo em cada linha, ele deve corresponder ao anterior mais o valor da transação. Um dígito errado pode produzir uma planilha aparentemente perfeita. Confira separadamente valores fora dos saldos comparados e lembre que erros podem se anular. O guia de [conferência de um CSV de extrato bancário](https://abox.tools/pt/guias/conferir-csv-de-extrato-bancario/) mostra as contas, seus limites e como verificar datas e descrições.

## O critério a guardar

“Nada de ruim aconteceu até agora” descreve o passado, não garante o tratamento futuro. Quando uma tarefa precisa de servidor, por cálculo pesado ou recurso exclusivo, o envio é uma escolha que merece ser consciente. Converter texto de extrato em planilha cabe no navegador. Nesse caso, o envio acrescenta uma cópia do seu histórico financeiro no computador de outra pessoa sem ser necessário para a conversão.
