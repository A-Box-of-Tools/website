# O que um PDF lembra

Mais do que as próprias páginas. Um PDF rotineiramente carrega o nome do autor, o programa que o produziu, o arquivo que ele era antes de virar PDF — e, se foi editado de um certo jeito muito comum, cada versão anterior de si mesmo, exclusões incluídas. Nada disso aparece na tela.

Última atualização 26 de agosto de 2026

## A resposta curta

Um PDF não é uma imagem das suas páginas. É um contêiner, e as páginas são só a parte da carga que aparece. Em volta delas, o formato tem lugar para um bloco de informações do documento, uma segunda cópia XML do mesmo bloco, comentários, dados de formulário, arquivos anexados — e, por um jeito muito comum de salvar edições, versões anteriores completas do documento, empilhadas debaixo da atual.

Nada disso é defeito. Cada peça foi desenhada para um trabalho razoável, e dentro de uma organização quase tudo é inofensivo ou útil. O problema é a travessia de fronteira: no momento em que um PDF sai — para a outra parte de um contrato, uma lista de distribuição, um processo público — tudo de que ele se lembra vai junto, e o que ele lembra não aparece em página nenhuma. As pessoas conferem o que o documento diz e enviam o que o arquivo contém, e são coisas diferentes.

## O crachá: /Info e o pacote XMP

Todo PDF pode carregar um dicionário de informações do documento: autor, título, datas de criação e modificação, e os nomes dos programas que o criaram e produziram. A maioria carrega uma segunda cópia, mais rica, dos mesmos fatos como XML embutido, chamada XMP. Nenhuma das duas aparece com as páginas; ambas estão a um painel de propriedades de distância.

Os valores se preenchem sozinhos, e é isso que os faz vazar. *Autor* costuma ser o nome de conta com que o sistema operacional foi instalado: um nome real e completo, em documentos que seus autores acreditavam anônimos: candidaturas, pareceres, reclamações, propostas. *Título* é rotineiramente o nome do arquivo de onde o PDF foi exportado, então `Rascunho-v7-ressalvas-juridicas.docx` sobrevive dentro do PDF polido que veio substituí-lo. A linha do produtor data o software; as datas desmentem versões oficiais. Já se escreveram estudos inteiros sobre o que os PDFs institucionais confessam nesse bloco.

## O desfazer involuntário: salvamentos incrementais

A peça mais afiada do contêiner é a de que o formato mais se orgulha. O PDF aceita *atualizações incrementais*: em vez de reescrever o arquivo, um editor pode anexar as mudanças ao final e deixar intacto tudo o que veio antes. O visualizador lê o arquivo de trás para a frente e mostra a versão mais nova; as antigas continuam lá, byte por byte, no mesmo arquivo.

Salvar anexando é rápido e à prova de travamento — e significa que um documento editado assim contém a própria história. O texto “apagado” não se foi: foi superado, e recuperá-lo é questão de ler o arquivo como ele era antes do último acréscimo. Um retângulo preto puxado sobre um nome, num editor que salva incrementalmente, produz um arquivo que contém o nome *duas vezes* — uma debaixo do retângulo, outra na história —, o que dobra a falha descrita no [guia das tarjas](https://abox.tools/pt/guias/da-para-recuperar-texto-tarjado/).

O remédio é uma reescrita completa: abrir o arquivo, ficar com o que a versão atual usa de verdade, escrever um arquivo novo sem passado. É o que o [compressor de PDF](https://abox.tools/pt/comprimir-pdf/) daqui faz por construção: uma reescrita não tem como não abandonar a história, e a ferramenta conta o material superado que deixou para trás no seu detalhamento de tamanhos — que é também o jeito mais fácil de descobrir que o seu arquivo tinha uma história.

## O porão: comentários, campos, anexos, camadas

O resto da memória é mais comum, e vaza do mesmo jeito:

- **Comentários e anotações**: a conversa da revisão, viajando com o documento revisado, visível para quem souber olhar.
- **Campos de formulário** guardam os valores preenchidos como dados mesmo onde uma página achatada já não os mostra.
- **Anexos**: um PDF pode embutir arquivos inteiros, de qualquer tipo, e os visualizadores os mostram num painel lateral que a maioria das pessoas nunca abriu. A planilha por trás do gráfico às vezes vai anexada ao gráfico.
- **Camadas de conteúdo opcional** podem guardar conteúdo de página desligado em vez de removido: presente por inteiro, exibido nunca.

Cada um desses itens é dado que as páginas não mostram, num arquivo que as pessoas julgam pelas páginas.

## Enviando um PDF sem a memória dele

O padrão em tudo isso: o que sobrevive é decidido por como o arquivo foi escrito, então o conserto é passá-lo por algo que escreva com esquecimento, na sua própria máquina — a história de um documento é exatamente o que não se deve subir para o servidor de um estranho, argumento que [o guia sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) desenvolve por inteiro. Três ferramentas deste site escrevem PDF, e as três foram construídas para deixar a memória de fora:

- A ferramenta de [juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/) escreve a saída **sem dicionário de informações nenhum**: sem autor, sem datas, sem linha nomeando o software. O que ela copia dos seus originais é o que as páginas deles usam, não a bagagem. Há [um guia](https://abox.tools/pt/guias/juntar-e-dividir-arquivos-pdf/).
- O [compressor de PDF](https://abox.tools/pt/comprimir-pdf/) reescreve o arquivo por completo — história superada abandonada, pacote XMP e dados privados de aplicativos não conservados — e detalha o que removeu. Também [com guia](https://abox.tools/pt/guias/deixar-um-pdf-menor/).
- A ferramenta de [tarjar PDF](https://abox.tools/pt/tarjar-pdf/), para quando a memória é justamente o assunto: a cada passada ela limpa o bloco de informações, o pacote XMP, os marcadores, os comentários, os valores de campos e os anexos, além da tarja em si — [o guia dela](https://abox.tools/pt/guias/tarjar-um-pdf/) percorre tudo.

E o teste de aceitação espelha o vazamento: julgue o arquivo, não as páginas. Abra o painel de propriedades e leia o que restou; procure no arquivo bruto uma palavra removida; olhe o detalhamento do compressor sobre o que o seu documento carregava. Um PDF sem memória não tem nada a confessar, leia-o quem for.
