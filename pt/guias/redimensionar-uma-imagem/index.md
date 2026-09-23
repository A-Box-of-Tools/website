# Como redimensionar uma imagem sem estragá-la

Redimensionar é o único trabalho de imagem em que o estrago já fica decidido antes de você clicar no botão, pelo número que você digita e pelo formato que você pede. Aqui está o que cada escolha faz com a foto, e quais delas dá para desfazer.

[Abrir Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/), jogue a sua imagem dentro, digite um número, normalmente a largura, e deixe o outro em branco. A altura sai do formato da imagem, que é quase sempre o que se queria: “1920 de largura” quer dizer “1920 de largura e a altura que isso der”.

Tudo o que vem abaixo é o que fazer quando um número não basta: quando mandaram você caber numa caixa de dois lados, quando a imagem precisa ficar maior, ou quando uma pasta inteira de arquivos tem que sair igual.

![O passo 3 do redimensionador: uma largura de 1920, uma altura em branco dizendo automática, e embaixo uma linha dizendo que photo.jpg tem 2400 por 1600 e sai em 1920 por 1280.](https://abox.tools/screens/resize-an-image/one-number.webp)

Um número preenchido. A ferramenta calcula o outro e diz antes de redimensionar qualquer coisa.

## Diminuir é seguro. Aumentar não é.

Não são duas direções da mesma operação, e vale deixar claro por quê.

**Diminuir uma imagem** joga informação fora, e no único sentido benigno: entram mais pixels do que saem, então cada pixel do resultado é a média de detalhe que foi medido de verdade. Uma cópia menor bem redimensionada costuma ficar *melhor* do que o original visto naquele tamanho, porque a média remove ruído. Nada é inventado.

**Aumentar uma imagem** obriga a inventar. O detalhe não está faltando no arquivo, ele nunca foi fotografado. Tudo o que qualquer ampliador pode fazer é chutar os pixels intermediários a partir dos vizinhos, e um chute entre dois valores conhecidos é uma rampa suave. Por isso uma foto ampliada fica macia em vez de nítida. Você recebe uma cópia maior da mesma imagem, não uma cópia mais detalhada.

É por isso que “nunca deixar uma imagem maior do que ela começou” já vem ligado na ferramenta daqui. Desligue se você realmente precisar da contagem de pixels, porque uma gráfica pediu um tamanho mínimo ou um sistema recusa qualquer coisa abaixo de certa largura, mas desligue sabendo que está comprando pixels, e não detalhe.

Os ampliadores com aprendizado de máquina que parecem mesmo acrescentar detalhe são outra coisa completamente diferente: eles inventam textura plausível a partir de um modelo de como as imagens costumam ser. Para um papel de parede, tudo bem. Para a fotografia de uma pessoa, de um documento, ou de qualquer coisa da qual alguém vá tirar conclusões, entenda que o detalhe extra é ficção.

## Três maneiras de dizer o tamanho que você quer

A maioria das ferramentas, esta inclusive, aceita as mesmas três, e cada uma serve a um trabalho.

- **Pixels exatos.** Use quando alguém especificou o número: um avatar que tem que ter ⁦400×400⁩, um banner que tem que ter 1500 de largura. Preencha um lado e deixe o outro seguir, a menos que tenham passado os dois para você.
- **Uma porcentagem.** Use quando você quer tudo proporcionalmente menor e não se importa com o número exato, do tipo “metade do tamanho” para um conjunto de fotos que vai entrar num documento.
- **O lado maior.** A mais útil das três para um lote misturado. “Lado maior 1600” faz cada imagem caber dentro de um quadrado de 1600 pixels, seja ela em pé ou deitada, que é o que “deixa todas num tamanho razoável” costuma significar na prática.

## Quando a caixa tem formato diferente do da imagem

É aqui que o redimensionamento de fato se decide. Se você der uma largura e uma altura que não batem com as proporções da sua imagem, alguma coisa tem que ceder, e existem exatamente quatro coisas que podem ceder:

- **Caber dentro da caixa.** A imagem inteira é mantida e sai menor que a caixa num dos eixos. Nada se perde e nada se deforma, e você só não fica com as dimensões exatas que pediu. É o padrão certo para quase tudo.
- **Preencher a caixa e cortar o que sobra.** Você fica com exatamente as dimensões que pediu, e as partes da imagem que passam das bordas somem. Certo para miniaturas, avatares e capas, onde o formato é fixo e o assunto está no meio. Errado quando o que importa está perto de uma borda.
- **Completar com margem.** A imagem inteira é mantida, centralizada, com o espaço que sobra preenchido por uma cor que você escolhe. Certo quando um sistema exige dimensões exatas e você não pode perder nada da imagem, que é como costumam funcionar os anúncios de produto.
- **Esticar.** A imagem é achatada ou puxada para caber. Isso nunca é o que você quer, a não ser que esteja fazendo de propósito, e é a opção que todo mundo reconhece na hora como errada.

Se você se pegar indo atrás do esticar, o que provavelmente quer é cortar.

![Os mesmos campos com 1200 nos dois, e embaixo um menu dizendo: se os formatos não batem, caber dentro, a foto inteira e um lado saindo mais curto.](https://abox.tools/screens/resize-an-image/fit.webp)

Preencha os dois lados e o menu aparece. É o único ajuste desta página que pode perder parte da foto, e por isso as quatro respostas abaixo valem uma leitura antes de mexer.

## Cortar é outro trabalho, e muitas vezes é o certo

Redimensionar muda quantos pixels descrevem a imagem inteira. Cortar muda com que parte da imagem você fica. As pessoas vão atrás do primeiro querendo o segundo com uma frequência surpreendente, porque “isto precisa ser quadrado” é um problema de corte, não de redimensionamento.

Faça nessa ordem: corte primeiro para o enquadramento que quer, depois redimensione o resultado para o tamanho de que precisa. Ao contrário, significa escolher o corte dentro de uma imagem que já perdeu pixels.

A ferramenta daqui faz os dois numa passada só justamente por isso. Arraste uma caixa, trave numa proporção se precisar de uma específica, e então diga em que tamanho o resultado deve sair. Fazer numa passada só também significa que a imagem é codificada uma vez só, o que importa pelo motivo da próxima seção.

### Cortando um lote inteiro

Uma caixa desenhada numa imagem é aplicada às demais como a mesma área *relativa*: as mesmas frações da largura e da altura de cada arquivo. Numa pasta de capturas de tela ou de exportações que têm todas o mesmo tamanho, isso é exatamente o mesmo retângulo. Num lote misturado é o mesmo enquadramento em vez do mesmo retângulo, o que em geral é o que se queria, mas vale saber antes de confiar cinquenta arquivos a ele.

## O que a recodificação custa, e como manter em uma só

Redimensionar um JPEG ou um WebP significa decodificá-lo, escalar os pixels e codificá-los de novo, e essa última etapa é com perdas. Quem custa qualidade a você não é a escala em si, é a recodificação.

Daí decorrem duas coisas. A primeira: o ajuste de qualidade na saída importa, e algo entre 80 e 85 é invisível numa fotografia e consideravelmente menor que 100. A segunda: faça uma vez só. Redimensionar uma imagem que já foi redimensionada duas vezes dá três gerações de codificação com perdas, e isso aparece.

Um PNG não tem esse custo, porque é sem perdas, e um PNG redimensionado é exatamente os pixels escalados. Se você está trabalhando em várias etapas e o formato final ainda não foi decidido, trabalhar em PNG no meio do caminho evita empilhar gerações.

Um detalhe que vale saber sobre a ferramenta daqui: um arquivo que você não está de fato alterando volta byte por byte em vez de ser recodificado. Peça “lado maior 1600” num lote e os que já estão abaixo de 1600 saem intocados, com etiquetas e tudo. Uma ferramenta que recodificasse esses em silêncio estaria custando qualidade a você em arquivos que ninguém pediu para mudar.

## Transparência, e o que acontece com ela

PNG e WebP conseguem guardar transparência. JPEG não, porque não existe canal alfa nenhum no formato. Então salvar uma imagem transparente como JPEG obriga a pôr alguma coisa atrás dela, e essa alguma coisa é uma cor chapada.

A maioria das ferramentas usa branco e não avisa, o que está tudo bem até a sua logomarca cair numa página escura com uma caixa branca em volta. Escolha a cor de propósito, ou salve como PNG ou WebP e mantenha a transparência. A mesma cor é usada atrás de um quadro com margem preenchida, que é o outro lugar onde as pessoas encontram isso de surpresa.

## Qual ferramenta, quando passaram um número para você

Dois números diferentes costumam ser passados, e cada um pede uma ferramenta diferente.

**“1200 pixels de largura”** é um problema de dimensões. O [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) é o caminho: você diz quantos pixels quer e ele entrega isso.

**“Abaixo de 500 KB”** é um problema de tamanho de arquivo, e redimensionar é só uma das formas de resolver. O [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) procura a maior qualidade que cabe no seu alvo e só redimensiona se a qualidade sozinha não chegar lá, e [o guia dele](https://abox.tools/pt/guias/comprimir-uma-imagem-para-um-tamanho-exato/) trata do que isso custa.

## Nada disso precisa de envio

Decodificar uma imagem, escalá-la e codificá-la de novo são coisas que todo navegador sabe fazer há anos, com o mesmo maquinário que uma página web usa para desenhar uma imagem em outro tamanho. Não existe motivo técnico para a sua foto viajar até um servidor e voltar para sair menor, e a ferramenta daqui não manda a foto para lugar nenhum: a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, e nenhum deles é deste site.

Se você prefere conferir a acreditar, carregue a página, desligue a internet e redimensione alguma coisa assim mesmo. O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações que você pode fazer em qualquer ferramenta.
