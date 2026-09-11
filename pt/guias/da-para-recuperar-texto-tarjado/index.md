# Dá para recuperar um texto coberto de preto?

Desconfortavelmente muitas vezes, sim — com a ferramenta de selecionar texto, não com um laboratório. A maioria dos retângulos pretos é desenhada *por cima* das palavras e salva ao lado delas, e as palavras viajam por baixo. Esta página é o catálogo das maneiras de isso acontecer, e do que remover precisa significar no lugar disso.

Última atualização 26 de agosto de 2026

## A resposta curta

Desconfortavelmente muitas vezes, sim. Não com perícia forense: selecionando a área coberta e apertando copiar. A maioria das ferramentas a que as pessoas recorrem quando algo precisa ser escondido desenha um retângulo *por cima* do conteúdo e o salva *ao lado* dele, e tudo o que está embaixo viaja no arquivo, pacientemente, até alguém olhar.

Não é um erro raro de gente desleixada. Ele já publicou nomes de autos judiciais, números sem tarja de relatórios oficiais — e, numa liberação em massa de documentos de um caso em dezembro de 2025, nomes cobertos de preto que estavam legíveis em questão de horas. As pessoas por trás desses erros tinham advogados e processos. O que não tinham é a distinção de que esta página trata: a diferença entre cobrir e remover.

## O retângulo que é um objeto

Num leitor de PDF, num editor de texto, num programa de slides ou num editor de imagens com camadas, uma caixa preta desenhada não é tinta. É um *objeto*: uma forma com posição, tamanho e cor, guardada no arquivo como coisa própria, na frente de um texto que continua inteiramente presente. O documento não diz “esta palavra se foi”; diz “esta palavra está aqui, e há um retângulo na frente dela”.

Tudo decorre daí. Selecione a área e copie, e a área de transferência recebe o texto, porque copiar lê a camada de texto e ignora a decoração na frente. Abra o arquivo num editor e o retângulo simplesmente sai do lugar. Exporte para outro formato e as camadas podem ser achatadas em outra ordem. Na tela, a caixa é idêntica a uma tarja de verdade, e é exatamente por isso que o erro sobrevive à revisão: o olho confere a página, e a página parece certa.

O PDF acrescenta uma variante mais silenciosa. Um PDF pode declarar que uma sequência de glifos “soletra” algo diferente do que está desenhado — um recurso de acessibilidade chamado `/ActualText` — e copiar lê a declaração em vez da tinta. Um documento pode, portanto, vazar uma palavra que nem sequer está visível na página.

## O borrão que é aritmética

Pixelizar parece mais seguro do que é. Um mosaico é uma grade de médias, e uma média é uma *medição* do que estava embaixo: pequena e com perdas, mas medição mesmo assim. Para texto numa fonte conhecida, num tamanho previsível, isso já bastou para lê-lo de volta: pegar cada sequência plausível, desenhá-la, pixelizá-la do mesmo jeito, e ficar com a candidata cujo mosaico bate. Nada disso exige laboratório; é um laço e uma comparação.

O desfoque é pior em princípio. Um desfoque é uma convolução — cada pixel de saída, uma média ponderada dos vizinhos — e convoluções se desfazem bem o bastante, com frequência suficiente, para a deconvolução ser ferramenta comum da fotografia, não um ataque exótico. Os dois efeitos ainda compartilham uma falha que não tem nada de matemática: eles anunciam que algo está escondido e aproximadamente o comprimento desse algo — o que, para uma senha de seis caracteres, já é uma pista.

Um preenchimento chapado não tem nenhuma dessas propriedades. Uma cor só, de borda a borda, não carrega medição de coisa alguma. Por isso ele é o padrão da ferramenta de [tarjar imagem](https://abox.tools/pt/tarjar-imagem/) daqui, por isso as opções de pixelizar e desfocar dizem no próprio rótulo o que não prometem, e por isso o controle de intensidade informa um número em vez de um adjetivo.

## As cópias que um arquivo guarda do próprio passado

A terceira família de falhas não tem nada que ver com a cobertura. Arquivos lembram, de jeitos que nada na tela mostra:

- **Os metadados de uma foto costumam incluir uma miniatura** da imagem como ela era antes da edição. Recorte seu endereço para fora de uma foto, e o bloco EXIF ainda pode guardar o original inteiro em miniatura. O [visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) mostra esse bloco e o tira; há [um guia](https://abox.tools/pt/guias/remover-dados-exif-e-gps/).
- **Alguns editores salvam no lugar, sem truncar.** Um famoso par de defeitos de 2023 — na ferramenta de marcação de capturas de um telefone e na de recorte de um sistema de desktop — deixava os bytes da imagem original dentro do arquivo depois do corte, de modo que a parte “cortada fora” podia ser reconstruída das sobras.
- **PDFs podem carregar a própria história.** Um PDF editado com salvamentos incrementais anexa as mudanças ao fim do arquivo e deixa a versão anterior intacta lá dentro, exclusões incluídas.

O fio comum: o que um visualizador mostra e o que um arquivo contém são perguntas diferentes, e uma tarja conferida só no olho respondeu apenas à primeira.

## O que remover exige de verdade

Uma tarja de verdade muda os dados, não a exibição, e se confere pelo mesmo caminho por onde pode falhar: perguntando ao arquivo, não à tela.

Para uma imagem, isso significa que os pixels sob a caixa deixam de existir antes de qualquer arquivo ser escrito. É exatamente o que a ferramenta de [tarjar imagem](https://abox.tools/pt/tarjar-imagem/) faz: os valores cobertos são sobrescritos na memória e só então entregues ao codificador, de modo que a saída contém pixels pretos onde o conteúdo estava, não tinta preta na frente. A versão passo a passo está no [guia de tarjar uma imagem](https://abox.tools/pt/guias/tarjar-uma-imagem/).

Para um PDF, significa que os glifos são apagados das instruções que desenham a página, junto com os portadores escondidos: declarações `/ActualText`, marcadores, comentários, campos de formulário. É o que a ferramenta de [tarjar PDF](https://abox.tools/pt/tarjar-pdf/) faz, e depois ela faz o que mais importa: reabre a própria saída e procura nela as palavras removidas, e **se alguma coisa sobreviveu, não há download**. O passo a passo está no [guia de tarjar um PDF](https://abox.tools/pt/guias/tarjar-um-pdf/).

E seja qual for a ferramenta, onde for, o teste de aceitação é seu: selecione por cima da área tarjada e copie; procure no arquivo a palavra removida; abra-o em outro visualizador. Se o conteúdo foi removido, nada consegue achá-lo — e se uma ferramenta faz isso no seu navegador, sem o arquivo sair da máquina, essa também é uma afirmação que você pode conferir em vez de acreditar: [o guia sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) mostra como. Tarjar é o único trabalho em que o arquivo é sensível por definição, o que faz dele o último que deveria passar pelo servidor de um estranho.
