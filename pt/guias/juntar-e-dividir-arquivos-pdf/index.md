# Como juntar, dividir e reordenar páginas de PDF

Juntar dois documentos é a coisa mais banal que se faz com um PDF, e a que mais vezes é feita entregando os dois arquivos ao servidor de um desconhecido. Não precisa de nenhum. Aqui está como fazer, e o que some caladinho quando uma ferramenta rearranja páginas.

[Abrir Juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/): Páginas trocadas de lugar sem ida e volta a um servidor.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/), solte lá dentro todos os arquivos que quiser usar, e arraste as páginas para a ordem que você quer. Depois diga se sai como um documento só ou como vários, e aperte o botão. Nada é enviado: os arquivos são abertos, desmontados e escritos de volta pelo seu próprio navegador.

Os três trabalhos que as pessoas procuram separados — juntar, dividir, reordenar — são uma tela só, porque são uma operação só com uma resposta diferente no fim: escolher páginas, pôr numa ordem, e decidir em quantos arquivos elas saem.

## Juntar dois ou mais documentos

Escolha o primeiro arquivo, depois o segundo; as páginas de cada um vão para o fim da ordem que está montada, então dá para ir acrescentando arquivos de pastas diferentes sem recomeçar. Se entraram na ordem errada, arraste uma página pela alça, ou use as setas de cada peça.

Juntar não recodifica nada. O conteúdo de cada página e cada fonte, imagem e desenho vetorial a que ela se refere são copiados iguaizinhos, então o texto continua selecionável e pesquisável e uma digitalização é a mesma digitalização. O arquivo juntado costuma ficar um pouco menor que os dois de entrada somados, e isso não é compressão: é a estrutura em volta das páginas sendo escrita uma vez em vez de duas.

As páginas mantêm o próprio tamanho. Junte um relatório em A4 com um anexo em Carta e você recebe um documento com os dois dentro, que é o que os arquivos dizem. Redimensionar as páginas de alguém para um único tamanho de papel é outra operação, e não é das que um juntador deva fazer calado.

## Dividir um documento em vários

Há quatro jeitos de cortar, e qual você quer depende do porquê de estar cortando:

- **A cada tantas páginas.** Para uma digitalização comprida do que na origem era uma pilha de documentos separados — doze contracheques de duas páginas cada.
- **Nos números de página que você indicar.** Para um relatório com capítulos que começam em páginas que você consegue ver. Cada número digitado começa um arquivo novo.
- **Um arquivo por página.** Para tirar uma única folha de assinaturas ou um certificado de um lote.
- **De volta para os arquivos de onde vieram.** Só aparece quando você juntou mais de um arquivo, e é útil depois de editar: tirar as páginas em branco de três digitalizações de uma vez, e receber três arquivos de volta.

Se você só quer algumas páginas de um documento comprido, não precisa dividir nada. Digite as páginas que quer na caixa de intervalos — `1-3, 8, 12-` —, aperte “Ficar só com estas” e monte um documento.

Mais de um arquivo de saída é entregue num ZIP só. Cinquenta downloads são cinquenta janelas de salvar, que é mais ou menos onde qualquer um desiste.

![O cartão de saída: opções para um documento ou vários, dividir por tamanho, numa página, ou de volta nos arquivos de que foi feito.](https://abox.tools/screens/merge-and-split-pdf-files/output.webp)

Dividir é a mesma operação de juntar, feita ao contrário, e é por isso que é um ajuste aqui e não uma ferramenta separada.

## Reordenar, girar e tirar páginas

Arraste uma peça pela alça para movê-la. As setas de cada peça a empurram uma posição, ou a giram um quarto de volta por vez — que é o conserto para a página que saiu deitada do scanner. O × a remove.

Para qualquer coisa que envolva mais que duas ou três páginas, use a caixa de intervalos. Ela aceita o que você escreveria no papel: `1-3, 8, 12-`, e também `ímpares`, `pares`, `todas` e `última`. Fique com essas, tire essas, ou gire essas. Um caso comum: uma digitalização frente e verso em que toda segunda página está de cabeça para baixo é `pares` e duas voltas.

Os números nas peças se renumeram conforme você trabalha, então eles sempre querem dizer “posição no documento pronto” e não “página no arquivo de onde ela veio”. Nada é escrito até você apertar o botão, então não há o que desfazer — e “voltar como estavam” devolve a ordem original de tudo.

![A grade de páginas: cada página de dois documentos em miniatura, na ordem em que vão sair, com controles para girar, inverter e remover.](https://abox.tools/screens/merge-and-split-pdf-files/pages.webp)

Os dois documentos, página por página. Reordenar é arrastar; a caixa de intervalos em cima é para os documentos em que arrastar levaria a tarde inteira.

## O que sobrevive a uma remexida e o que não

Esta é a parte que ferramenta nenhuma conta, e é a razão de um documento juntado às vezes parecer sutilmente quebrado.

Um PDF não é uma pilha de páginas. É um grafo, e boa parte dele é sobre o documento e não sobre alguma página: o painel de marcadores, os links, o formulário, a ordem de leitura que um leitor de tela segue, a numeração que chama as quatro primeiras páginas de “i, ii, iii, iv”. Mexa nas páginas e cada uma dessas coisas tem que ser reconstruída ou largada.

- **Os marcadores são reconstruídos.** Uma entrada cuja página continua ali aponta para onde ela foi parar. Uma entrada cuja página você tirou some — a não ser que sobrem entradas abaixo dela, e aí ela fica como título, porque o título de um capítulo continua onde o capítulo está. Juntar vários arquivos aninha os marcadores de cada um sob um título com o nome do arquivo, e é isso que torna um relatório juntado navegável.
- **Os links são seguidos.** Um link da página 2 para a página 40 sabe para onde a 40 foi, incluindo os destinos nomeados que o Word e o LaTeX escrevem para cada título. Um link cujo alvo não veio junto fica sem nada atrás, em vez de apontar para a página que agora calha de estar naquela posição.
- **Formulários preenchidos sobrevivem**, e o documento novo é registrado como formulário para os leitores tratarem como tal. Uma manha que vale saber: dois campos com o mesmo nome são *um* campo para qualquer leitor, então juntar duas cópias do mesmo formulário liga os dois — digitar num preenche o outro.
- **A ordem de leitura marcada não.** Ela descreve uma sequência que não existe mais, e uma ordem errada é pior para um leitor de tela do que ordem nenhuma. Se a marcação de acessibilidade de um documento importa, guarde o original ao lado.
- **Os rótulos de página também não.** A numeração “iii, iv, 1, 2” é uma afirmação sobre uma ordem que você acabou de mudar.
- **Anexos e scripts do documento também não.** Arquivos anexados pertencem ao documento, não a alguma página. Ações que rodam JavaScript, mandam um formulário para algum lugar ou abrem um programa não são levadas para o seu arquivo novo, que é o padrão certo para páginas que vieram de outra pessoa.

Assinatura digital é caso à parte, e não é limitação de ferramenta nenhuma: uma assinatura certifica um documento como ele estava. Mova uma página e ela quebra, porque é exatamente isso que ela está ali para te dizer.

## Arquivos protegidos por senha

Um PDF criptografado é recusado, inclusive os de senha vazia que muita copiadora de escritório produz. Tirar a proteção de um documento é um trabalho diferente de mexer nas páginas dele, e uma ferramenta que fizesse isso calada estaria fazendo algo que você não pediu. Abra num leitor com a senha e salve antes uma cópia sem proteção.

## Conferir o resultado

Abra e confira três coisas: a contagem de páginas, a ordem e — se o documento tinha — o painel de marcadores e um link ou dois.

A primeira a ferramenta aqui faz por você antes de oferecer o arquivo. Cada documento pronto é reaberto pelo mesmo código que leu os seus originais, e as páginas são contadas caminhando pela árvore de páginas em vez de acreditar no número escrito no arquivo. Se isso discordar do que você pediu, download nenhum é oferecido.

## Por que isso não precisa de servidor

Juntar soa como trabalho de servidor, e durante quase toda a vida da web foi. O que isso envolve de verdade é analisar a estrutura do arquivo, copiar para um arquivo novo os objetos de que cada página depende, e escrever uma tabela de referências cruzadas nova. Nenhum pixel é decodificado e nada é desenhado. Um navegador consegue fazer tudo isso há anos.

E aqui isso pesa mais do que em quase qualquer outro lugar, por causa *do que* as pessoas juntam. Os documentos que acabam combinados são os que vieram de algum lugar: um contrato e a página de assinatura, um passaporte digitalizado e um extrato bancário, uma carta médica e um formulário de pedido. Um juntador online recebe todos de uma vez, já organizados, de uma pessoa só. É o envio mais revelador que a maioria das pessoas faz na vida.

A ferramenta aqui não tem função de rede nenhuma, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. Carregue, desligue da tomada, e junte alguma coisa assim mesmo.

[É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) reúne mais três checagens como essa.
