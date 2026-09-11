# Como digitalizar várias páginas em um PDF pequeno

A tarefa raramente é uma página. É um contrato com a folha de assinaturas, ou um ano de recibos, e no fim uma caixa de e-mail que recusa qualquer coisa acima de uns poucos megabytes. Três ferramentas cobrem o caminho inteiro, e a papelada fica na sua própria máquina do começo ao fim.

Última atualização 26 de agosto de 2026

## A resposta curta

Fotografe cada página e depois solte todas as fotos de uma vez no [Scanner de documentos](https://abox.tools/pt/digitalizar-documentos/). Ele acha os cantos de cada página, endireita cada foto e escreve *um PDF com uma página por foto*: não existe passo separado de juntar, e as páginas ficam na ordem em que você as adicionou.

Duas ferramentas continuam de onde o scanner para. Se parte do documento já *é* um PDF — o contrato que mandaram por e-mail, em volta da sua folha de assinaturas digitalizada — entrelace os dois com o [Juntador de PDF](https://abox.tools/pt/juntar-pdf/). E se o arquivo pronto ainda pesa mais do que a caixa aceita, o [Compressor de PDF](https://abox.tools/pt/comprimir-pdf/) o deixa abaixo do limite.

Os dois revezamentos estão a um clique: quando o escâner escreve seu PDF, uma linha sob o botão de download oferece levar o resultado direto para o combinador ou o compressor, já carregado — e o combinador passa o próprio resultado ao compressor do mesmo jeito.

Nada na sequência envia nada. Isso importa aqui mais do que em quase qualquer outro lugar: o que se digitaliza são contratos, documentos de identidade e papéis médicos, e os aplicativos de sempre passam cada página pelos servidores deles.

## Acertando as fotos

O scanner recupera muita coisa — fotos de viés, luz de abajur desigual, uma sombra atravessada na página — mas não recupera o que a câmera nunca capturou. Três hábitos cobrem quase tudo:

- **Preencha o quadro**, com uma margem de mesa visível em volta de cada borda. Os cantos são achados procurando a página contra o fundo; uma página que vaza da foto não tem canto para achar.
- **Fotografe de cima**, mais ou menos no prumo. A perspectiva se corrige, mas a borda distante de uma foto rasante tem menos pixels, e a correção não pode inventá-los.
- **Uma página por foto**, na ordem de leitura. Reordenar depois funciona, mas a ordem em que você fotografa é a ordem que recebe, e fotografar em ordem é de graça.

O [guia de digitalização](https://abox.tools/pt/guias/digitalizar-um-documento-com-o-celular/) cobre o resto: como os cantos são achados, quando arrastá-los você mesmo, e o que o modo preto e branco faz com o tamanho do arquivo.

![O digitalizador com três páginas fotografadas numa tira, a primeira aberta e com os cantos marcados.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/pages.webp)

Três páginas, fotografadas e endireitadas juntas. Cada uma guarda os próprios cantos, então uma foto ruim não estraga o conjunto.

## Quando o juntador ganha o lugar dele

O scanner combina *fotos*. O juntador combina *PDFs*, e o meio de uma tarefa de verdade costuma ser os dois: uma folha assinada fotografada agora, dentro de um documento que chegou como arquivo. Digitalize primeiro as suas páginas, depois solte a digitalização e o PDF original juntos no juntador, arraste as páginas para o lugar e exporte um documento só. Os marcadores e os links internos do original são reconstruídos sobre as páginas que ficam, e os campos de formulário preenchidos vêm junto.

O mesmo vale para digitalizações de dias diferentes: o PDF de cada sessão cai como um bloco de páginas, e o juntador é onde os blocos viram um arquivo.

![O construtor de PDF com as três páginas limpas na lista, acima dos ajustes de tamanho de página, orientação e margem.](https://abox.tools/screens/scan-multiple-pages-into-one-pdf/document.webp)

E então essas mesmas três páginas como um documento só, o passo em que o juntador ganha o lugar dele.

## Ficando abaixo do limite de tamanho

Tente primeiro a alavanca barata, e ela fica dentro do scanner: para páginas que são tinta sobre papel — texto, formulários, recibos — o modo preto e branco guarda cada página a um bit por pixel, e o PDF costuma ficar bem abaixo de um megabyte por página sem comprimir nada. Cor só vale o custo onde a cor significa alguma coisa.

Quando o arquivo mesmo assim não quer ir — páginas coloridas, ou uma junção que trouxe a digitalização de outra pessoa — o compressor começa mostrando onde o tamanho mora de verdade, e depois recodifica as imagens de página contra a resolução em que aparecem. Ele também confere que o resultado abre antes de oferecê-lo, o que se agradece quando o arquivo é um contrato com prazo.

## Se você faz isso toda semana

Os passos morarem aqui em três páginas é de propósito: cada página faz um trabalho, e cada uma prova sozinha que a papelada nunca saiu da sua máquina. Mas é tudo código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências, com READMEs que explicam o achador de cantos, a cópia de páginas do juntador e o orçamento do compressor.

Se a mesma tarefa cai na sua mesa toda semana, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para compor esses módulos numa página feita para ela: digitalizar direto para um documento juntado e comprimido, com a sua folha de rosto já no lugar. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
