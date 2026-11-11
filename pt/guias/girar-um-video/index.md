# Como girar um vídeo sem perder qualidade

Um vídeo de lado pode ter os quadros intactos: o celular escreveu uma orientação no cabeçalho e algum programa está ignorando. Veja como corrigir isso em segundos sem perder qualidade e quando vale a pena girar os próprios pixels.

[Abrir Rotacionar vídeo](https://abox.tools/pt/girar-video/): Um quarto de volta, meia volta ou para o outro lado. Na rotação pelo cabeçalho, os quadros da imagem ficam intactos.

Última atualização 13 de outubro de 2026

## A resposta curta

Abra a ferramenta para [girar vídeos](https://abox.tools/pt/girar-video/), arraste o arquivo, escolha o giro que deixe a prévia correta e aperte o botão. A orientação é gravada no cabeçalho e todos os quadros são copiados intactos: leva segundos e não perde qualidade. O resultado é aberto de novo para conferir a orientação e aparece na posição certa abaixo do download. Nada é enviado.

O restante desto guia explica por que isso basta. Muitas ferramentas e muitos tutoriais tratam um giro como uma recodificação, embora não precise ser assim.

## Corrija a cópia que falha na tela de destino

Se um vídeo de celular aparece certo localmente mas de lado em documento ou apresentação, experimente primeiro o giro de cabeçalho e salve uma cópia. Abra no aplicativo ou computador de destino. Se ignorar o giro, volte ao original e escolha Aplicar aos pixels: grava a imagem orientada com uma recodificação.

Uma câmera montada de cabeça para baixo precisa de meia volta. Confira um rosto ou placa na prévia e ouça se o som importar: AAC é copiado; outra faixa decodificável pode ser codificada em AAC ou omitida se não for compatível. Girar muda orientação, não formato. Um recorte vertical de vídeo horizontal está no [guia de enquadramento](https://abox.tools/pt/guias/cortar-um-video/).

## Por que o vídeo aparece de lado

O sensor da câmera do celular é horizontal. Quando você grava com o aparelho em pé, ele continua capturando uma imagem horizontal deitada, e cada quadro é salvo assim. O celular acrescenta uma instrução ao cabeçalho: uma matriz de exibição de nove números, dizendo por exemplo “mostre com um quarto de volta à direita”. Celulares, navegadores, editores e reprodutores modernos leem essa instrução e giram a imagem na tela. Por isso ela aparece certa no celular.

Se o vídeo aparece de lado em outro lugar, a instrução foi ignorada ou está errada. A câmera pode ter entendido mal a posição, um conversor pode ter descartado o cabeçalho ou um reprodutor antigo pode não lê-lo. O problema é a orientação registrada, não os quadros.

## A correção pode ser só mudar nove números

Girar significa gravar outra indicação. Os quadros ficam intactos, sem decodificar nem recodificar; o arquivo fica quase do mesmo tamanho e leva o tempo de lê-lo. O [Rotacionador de vídeo](https://abox.tools/pt/girar-video/) combina por padrão o giro escolhido com o existente, grava a matriz e copia imagens byte por byte. AAC também é copiado; outro codec decodificável vira AAC e o som incompatível é identificado e omitido. Leia a decisão de áudio separada antes de exportar.

Muitas ferramentas on-line decodificam o vídeo, giram os pixels e codificam tudo de novo. Isso perde uma geração de qualidade, demora o tempo de uma codificação e altera cada quadro para uma tarefa que só precisava de nove números. Programar um caminho que sempre recodifica é mais simples do que manter dois; isso não significa que o arquivo precise dele.

## Quando vale aplicar o giro aos pixels

Alguns reprodutores antigos ignoram a matriz de exibição e mostram os quadros como foram salvos. Se o vídeo vai para um deles ou para um destino que você não pode testar, só mudar o cabeçalho não basta. A ferramenta oferece uma caixa para “aplicar o giro à imagem”. Ela desenha cada quadro girado e codifica como H.264, com uma taxa um pouco maior que a original para acomodar a nova geração. Há perda de qualidade e o tempo de uma codificação; por isso é uma opção adicional, explicada na página.

Um WebM ou MKV cuja imagem não seja H.264 precisa desse processo mesmo sem marcar a caixa, porque a ferramenta só monta o cabeçalho MP4 em torno de quadros H.264. A página informa quando encontra esse caso.

## Qual é o sentido certo?

Um quarto de volta à direita segue o sentido horário: a parte superior se move como ao virar o celular para a direita. A ferramenta mostra o primeiro quadro com o giro escolhido e o mesmo cálculo que será usado no cabeçalho. Escolha o botão que deixe a prévia correta. Um vídeo de cabeça para baixo precisa de meia volta; quando a câmera interpretou mal a orientação, pode ser necessário um quarto de volta para o lado contrário ao esperado.

## O estranho é precisar enviar o arquivo

Ferramentas on-line costumam pedir o original primeiro. Um gigabyte de férias, de uma aula ou de uma partida sobe pela conexão para que uma cópia girada volte. O envio demora mais que a tarefa inteira, antes mesmo de perguntar quem guarda o arquivo. Ler um cabeçalho e escrever outro requer poucos kilobytes de trabalho, sem servidor. Até a opção de girar os pixels usa codecs já presentes no navegador.

A ferramenta para [girar vídeos](https://abox.tools/pt/girar-video/) trabalha no navegador. Lê o arquivo do disco em partes, grava um novo cabeçalho e coloca o resultado na memória. A política de segurança da página lista os endereços que ela pode acessar, e nenhum pertence a este site. Ela continua funcionando sem rede, a comprovação mais simples.

## Confira antes de enviar

A ferramenta abre o resultado com o mesmo leitor usado no original e confere três coisas: a duração, o giro pedido com as dimensões correspondentes e o som anunciado. Depois reproduz da memória abaixo do download. Olhe por um momento —a orientação se confere de relance— e salve. Guarde também o original: o giro comum não perde nada, mas o original continua sendo a única versão que não é uma cópia.
