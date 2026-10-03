# O que uma foto conta sobre você, e como tirar isso

Uma foto recém-saída de um celular costuma carregar as coordenadas do lugar onde foi tirada, a hora com precisão de segundo e informação suficiente sobre a câmera para ligá-la a todas as outras fotos do mesmo aparelho. Nada disso aparece na tela. Aqui está o que tem lá dentro, e como tirar.

[Abrir Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/), jogue as fotos dentro e clique em “Remover todos os metadados”. Todas as etiquetas, os blocos XMP e IPTC, os comentários e a miniatura embutida vão embora, em todas as fotos da lista de uma vez. A imagem em si não é tocada: não é recomprimida, não é decodificada, não muda um pixel sequer.

Antes de fazer isso, vale olhar o que tinha lá dentro. Costuma ser mais do que as pessoas esperam, e essa lista é o argumento para fazer isso.

## O que existe de fato dentro de uma foto

Um JPEG não é só uma imagem comprimida. É um contêiner, e ao lado da imagem ficam vários blocos de informação que a sua câmera, o seu celular ou o seu editor escreveram ali.

- **EXIF.** O principal. Marca e modelo da câmera, lente, ajustes de exposição, ISO, a data e a hora com precisão de segundo, a orientação em que a imagem deve ser exibida e, num celular com a localização ligada para a câmera, uma posição de GPS com precisão de poucos metros. Muitas vezes, também o número de série do corpo da câmera.
- **GPS.** Tecnicamente parte do EXIF, e vale nomear à parte porque é o que mais importa. Vem escrito em graus, minutos e segundos, um formato que faz um ótimo trabalho de não parecer um endereço.
- **XMP.** Um pacote de XML que os editores escrevem. Pode carregar o seu nome, o seu software, avaliações, palavras-chave, histórico de edição e uma cópia de alguns campos do EXIF, e é por isso que remover só o EXIF não basta.
- **IPTC.** Um bloco mais antigo com campos de legenda, assinatura, crédito e direitos autorais, usado na imprensa e em bancos de imagens.
- **A miniatura embutida.** Uma segunda cópia pequena da imagem. Ela é gerada quando o arquivo é escrito, e nem sempre é gerada de novo quando a imagem é editada. É assim que uma foto cortada pode viajar com uma miniatura do que foi cortado fora.
- **A maker note.** Um bloco não documentado com dados do fabricante. Ninguém fora do fabricante sabe tudo o que tem lá dentro.

![O inspetor: a miniatura de uma foto ao lado de uma lista do que foi encontrado dentro, incluindo marca e modelo da câmera, a data em que foi tirada e coordenadas de GPS.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

O que uma foto de celular carrega de verdade. Quase ninguém nunca olhou, e é por isso que este guia existe.

## Quem de fato vê isso

Esta é a parte em que vale ser preciso, porque tanto a versão alarmada quanto a versão debochada estão erradas.

**A maioria das grandes redes sociais apaga os metadados quando você posta.** Facebook, Instagram e X recodificam as imagens enviadas e descartam as etiquetas no processo. Isso não é gentileza, porque eles ficam com os dados do lado deles, mas significa que uma foto postada nesses serviços não entrega as coordenadas dela a cada pessoa que a vê.

**Quase todo o resto mantém.** Um anexo de e-mail. Um arquivo mandado pela maioria dos aplicativos de mensagem como “documento” em vez de foto. Uma imagem num fórum, num anúncio de classificados, num site pessoal, num drive compartilhado, num relato de bug, num chamado de suporte. Em todos esses o arquivo chega inteiro, e qualquer um que o baixe consegue ler as etiquetas com ferramentas que já vêm no sistema operacional.

Os riscos realistas são banais em vez de dramáticos: um anúncio de classificados fotografado dentro de casa, uma foto de criança tirada na escola dela, uma conta aparentemente anônima postando fotos que compartilham todas um mesmo número de série de câmera, um “tirada semana passada” que foi tirada em março.

## Por que não simplesmente salvar de novo?

Salvar de novo uma foto por um editor ou um compressor realmente remove os metadados, porque a imagem é decodificada em pixels e codificada outra vez, e um canvas cheio de pixels não carrega etiqueta nenhuma. Funciona, e custa qualidade a você, porque essa recodificação é com perdas.

Remover os metadados direito não custa nada. As etiquetas ficam no contêiner *em volta* da imagem comprimida, e não dentro dela, então apagá-las é excluir entradas de uma lista e escrever a lista de volta. Os dados de imagem comprimida são copiados byte por byte e o resultado decodifica exatamente para os mesmos pixels. Esse é o motivo inteiro para usar uma ferramenta de metadados em vez de um conversor.

A exceção é se você fosse recodificar de qualquer jeito. Se já está comprimindo ou redimensionando a foto, as etiquetas vão embora como efeito colateral e você não precisa de uma segunda etapa.

## A única coisa que vale manter: a orientação

Celulares não giram a imagem quando você vira o aparelho. Eles gravam do jeito que o sensor viu e acrescentam uma etiqueta de Orientação dizendo como aquilo deve ser virado para exibição. Apague todas as etiquetas e alguns visualizadores vão mostrar a sua foto deitada.

É por isso que a ferramenta daqui tem uma opção de “manter a etiqueta de orientação”, que já vem ligada. Ela escreve de volta um pequeníssimo bloco EXIF contendo só essa etiqueta e nada mais, e só nas fotos que realmente precisavam. O GPS, os horários, o número de série e o resto continuam fora.

Desligue se você preferir que o arquivo não carregue EXIF nenhum, e então confira o resultado antes de mandar, porque uma foto deitada é o desfecho de sempre.

![O cartão de limpeza: um botão para remover tudo, com chaves para manter a etiqueta de orientação e o perfil de cor.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Tira tudo, menos as duas coisas que vale a pena manter. A orientação é aquela cuja falta deixa metade das fotos deitada de lado.

## Editar em vez de remover

Remover tudo é a resposta certa para a maioria das pessoas. Às vezes não é: um fotógrafo pode querer manter a linha de direitos autorais e os ajustes da câmera e tirar só a localização, e um arquivista pode precisar corrigir uma data que estava errada porque o relógio da câmera estava.

Os dois são possíveis. A localização pode ser apagada sozinha, e etiquetas de texto, datas, ISO, orientação e resolução podem ser editadas ali mesmo.

Uma ressalva que vale para toda ferramenta que faz isso, não só para esta: escrever o arquivo reconstrói o bloco EXIF, e uma maker note contém deslocamentos que apontam para dentro do bloco *original*. Uma maker note reconstruída pode, portanto, deixar de ser legível pelo próprio software do fabricante. Se isso importa para você, apague a maker note ou deixe o arquivo sem editar.

## Formatos, e os que não dão para fazer assim

JPEG, PNG e WebP podem todos ser reescritos de forma limpa, e são esses os três que a ferramenta daqui trata.

HEIC, que é o que um iPhone salva por padrão, e AVIF são formatos de caixas montados a partir de átomos aninhados, e precisam de um interpretador completamente diferente. A ferramenta reconhece os dois e avisa isso, em vez de produzir um arquivo quebrado. Se você tem um HEIC, convertê-lo para JPEG vai remover os metadados como efeito colateral da conversão.

Um TIFF puro também fica de fora, e por um motivo mais interessante: num TIFF os metadados e os dados de pixel são endereçados pelos mesmos deslocamentos, então remover etiquetas significa reescrever o endereçamento da própria imagem. Dá para fazer, e é outro trabalho.

## Um hábito que vale ter

Confira antes de postar, não depois. Ler as etiquetas leva alguns segundos, e a lista de achados nomeia as coisas que vale saber, como a posição, os horários e os números de série, antes da tabela completa com todas as etiquetas, para você não precisar saber o que procurar.

A posição aparece primeiro em graus decimais, de propósito. “51 graus, 30 minutos, 26 segundos” não deixa evidente que a foto está entregando o prédio em que foi tirada. Um par de decimais que você cola num mapa deixa.

## Não mande a foto para descobrir o que tem nela

Há uma ironia específica no jeito como esse problema costuma ser resolvido: alguém preocupado com o que a foto revela envia essa foto a um site para descobrir. O site agora tem a foto, as coordenadas, o horário e o número de série, e uma cópia da imagem num disco que é dele.

Não há motivo para isso. Ler e reescrever o contêiner em volta de um JPEG são algumas centenas de linhas de interpretação que um navegador roda perfeitamente bem, e é por isso que a ferramenta daqui não tem função de rede nenhuma: nenhum `fetch`, nenhum `XMLHttpRequest`, nada que pudesse mandar um arquivo mesmo que alguma coisa tentasse. Carregue uma vez, desligue a internet, e ela continua funcionando.

O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) mostra como conferir essa afirmação neste site ou em qualquer outro, e este é justamente o tipo de arquivo em que mais vale a pena conferir.
