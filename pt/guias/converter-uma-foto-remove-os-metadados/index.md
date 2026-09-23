# Converter uma foto remove os metadados dela?

Às vezes, e as duas respostas já queimaram gente. Reencodar por um canvas arranca tudo; um conversor caprichado carrega tudo junto; a imagem fica igual nos dois casos. A única jogada confiável é parar de prever e olhar o arquivo.

Última atualização 26 de agosto de 2026

## A resposta curta

Às vezes. Converter, redimensionar ou comprimir uma foto remove os metadados quando a ferramenta reconstrói a imagem a partir de pixels, e os mantém quando a ferramenta os copia de propósito — e nada na tela diz qual das duas coisas aconteceu. A imagem fica igual nos dois casos, porque os metadados nunca fizeram parte da imagem.

Os dois desfechos surpreendem, em direções opostas. Alguém conta que “só redimensionar” apague a localização, e ela sobrevive. Outro conta que a data da captura sobreviva a uma troca de formato, e ela se foi. Os dois erros têm a mesma cura: parar de prever o que a ferramenta provavelmente fez, e olhar o que o arquivo realmente contém.

## O que viaja ao lado, e por que vai separado

Um arquivo de foto é duas coisas num contêiner só: a imagem codificada, e um bloco de etiquetas sobre ela — EXIF, muitas vezes com XMP e um perfil de cor. As etiquetas costumam dizer quando a foto foi tirada, a câmera e a lente, a exposição, as coordenadas GPS de onde você estava, e com frequência uma miniatura embutida — às vezes da imagem como ela era *antes* de uma edição, que é como um corte pode deixar de remover o que cortou. O passeio completo por esse bloco está no [guia de EXIF](https://abox.tools/pt/guias/remover-dados-exif-e-gps/).

O ponto que decide tudo: as etiquetas ficam *ao lado* dos pixels, não dentro deles. Uma ferramenta que decodifica a imagem recebe pixels e nenhuma etiqueta; o que ela escrever de saída contém só o que ela escolher devolver. Uma ferramenta que edita o arquivo sem reencodar pode deixar as etiquetas intactas — ou remover exatamente elas e nada mais.

## Por que reencodar arranca, e copiar mantém

Quase todo trabalho de imagem num navegador passa por um canvas: decodificar o arquivo em pixels crus, transformá-los, codificar um arquivo novo. Um canvas não carrega etiquetas, então o arquivo novo não tem nenhuma — não por política, e sim por construção. Por isso o [compressor de imagens](https://abox.tools/pt/comprimir-imagem/) e a ferramenta de [redimensionar imagens](https://abox.tools/pt/redimensionar-imagem/) daqui produzem saídas sem EXIF, sem GPS e sem XMP, e as páginas deles dizem isso: é inevitável — e vale saber quando você queria manter a data.

Um conversor, ao contrário, pode se esforçar para preservar. O [conversor de HEIC para JPG](https://abox.tools/pt/heic-para-jpg/) deste site faz exatamente isso: levanta o bloco de metadados do contêiner HEIC e o instala no JPEG, datas, GPS e tudo, porque uma conversão deve ser a mesma foto com outro casaco. (Uma etiqueta é reescrita de propósito: a orientação, para a imagem não tombar; e o bloco só cabe na saída JPEG — o menu de formatos avisa.) Duas ferramentas honestas, comportamentos opostos, cada uma certa para o seu trabalho — e é exatamente por isso que adivinhar pelo tipo de ferramenta não funciona.

Fora do navegador o quadro é igualmente misto, com a mesma lógica por baixo. Capturas de tela e exportações são codificações novas: sem metadados de câmera. Apps de mensagem recomprimem forte, então fotos mandadas como fotos costumam perder as etiquetas — mas o mesmo arquivo mandado “como documento” viaja byte a byte, etiquetas incluídas. Anexos de e-mail e nuvens movem arquivos sem mudanças. O padrão se sustenta: reconstruído quer dizer arrancado, copiado quer dizer mantido.

## Conferir em vez de supor

A conferência leva menos de um minuto: abra o arquivo de saída — não o original — no [visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) e leia o que está lá. Ele analisa o arquivo na sua própria máquina e mostra cada etiqueta, miniatura embutida incluída. Nada lá, nada vazou. Ainda lá, e você vê exatamente o quê.

De tudo isso saem três hábitos:

- **Quando a meta é privacidade, remova de propósito.** Arranque as etiquetas com a ferramenta de EXIF — ela edita o arquivo sem reencodar, então a imagem não perde nada — e depois confira o resultado. Não conte com um redimensionamento que arranca por acaso.
- **Quando a meta é manter o registro, converta com uma ferramenta que declare preservar** — e confira isso também, porque “deve ter mantido” falha na outra direção: um acervo de fotos com as datas evaporadas também é uma perda.
- **Confira o arquivo que você de fato envia**, depois do último passo da sua cadeia. Cada ferramenta decide por conta própria, e só o conteúdo do arquivo final conta.

E se a ferramenta de conferir for ela mesma uma página web, a pergunta de sempre vale para ela também: um visualizador de metadados recebe a sua foto, GPS incluído. O daqui roda inteiro no seu navegador, sem mandar nada a lugar nenhum, e [o guia sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) mostra como verificar essa afirmação em vez de acreditar nela.
