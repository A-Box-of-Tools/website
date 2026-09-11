# Como criar uma miniatura de vídeo com o quadro exato

A diferença entre uma miniatura e um print é mais ou menos um quarto de segundo: o quadro em que os olhos estão abertos e a bola ainda está no ar. Chegar a esse quadro, no tamanho da plataforma, abaixo do limite de bytes dela, é uma sequência de três passos que roda inteira no seu navegador.

Última atualização 26 de agosto de 2026

## A resposta curta

1. **Pegue o quadro.** Abra o [Capturador de quadros](https://abox.tools/pt/extrair-quadro-de-video/), solte o vídeo e avance pela lista de quadros do próprio arquivo até o instante exato. Salve como PNG: a cópia sem perda, para nada ficar decidido ainda.
2. **Enquadre o quadro.** Leve o PNG ao [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): recorte no formato da plataforma — 16:9 para o YouTube — e defina o lado maior; 1280 pixels é o número que o YouTube pede de verdade.
3. **Acerte o teto.** Termine no [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) com o limite da plataforma como alvo — 2 MB para miniatura de YouTube — e deixe que ele escolha JPEG ou WebP.

Nada na sequência envia nada — o que importa quando o vídeo não foi publicado, e a miniatura está sendo feita justamente porque o vídeo ainda não é público.

## Por que avançar ganha de pausar

Pausar um player e tirar print perde duas vezes. A pausa cai onde o player conseguiu parar — o lugar mais próximo, não o quadro que você queria — e o print é uma foto do player: a resolução dele, a interface dele, o tratamento de cor dele, não os do arquivo.

O capturador percorre, em vez disso, a lista de quadros do próprio arquivo, um quadro por vez nos dois sentidos, e entrega o quadro decodificado em si, na resolução cheia do vídeo. Um quarto de segundo de busca de cada lado do momento costuma ser onde a miniatura mora: o quadro *entre* os dois óbvios, onde o movimento se lê e nada saiu borrado.

Salve a captura como PNG mesmo que a miniatura final vá ser JPEG ou WebP. O PNG é uma cópia exata do quadro; toda decisão com perda acontece então uma vez só, no final, dentro de um orçamento de bytes, em vez de duas vezes, se somando.

![Uma imagem parada de um vídeo com o código de tempo visível, ao lado dos controles de passo e rolagem e do instante exato de onde foi tirada.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Avançar até o quadro, em vez de pausar e tirar um print. A seção de cima diz qual é a diferença de verdade.

## A aritmética da plataforma

Recorte antes de comprimir, pela mesma razão que o [guia de fotos](https://abox.tools/pt/guias/preparar-fotos-para-a-web/) dá: os pixels são o orçamento. Um recorte 16:9 de um quadro 4K levado a ⁦1280×720⁩ deixa o compressor gastar os 2 MB em qualidade que ninguém vai precisar apertar os olhos para ver. A caixa de recorte do redimensionador trava em 16:9, então o formato é um arrasto e não uma conta; texto e rostos querem ficar nos dois terços do meio, porque os feeds arredondam os cantos e sobrepõem a duração embaixo à direita.

![O redimensionador com uma largura de 1280 e uma altura de 720 digitadas, e um resumo de como a imagem vai sair.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

E depois a aritmética: o que a plataforma pedir, digitado como dois números.

## Uma folha de contatos, quando o momento não aparece

Quando o instante certo está perdido em dez minutos de filmagem, o outro modo do capturador salva um quadro a cada N segundos e entrega o lote num ZIP. Passe os olhos pelas imagens como numa folha de contatos, anote o tempo da mais próxima e avance a partir dali. É mais rápido do que esfregar a barra, e sobra uma pasta de candidatas para o dia em que a plataforma pedir outro formato.

## Se você faz isso toda semana

Os passos morarem aqui em três páginas é de propósito: cada página faz um trabalho, e cada uma consegue provar sozinha que nada sai da sua máquina. Mas cada passo é código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências com READMEs que explicam o decodificador, a reamostragem e a busca do alvo de bytes.

Se miniatura é entrega semanal, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça a versão de uma página: avançar, recortar no padrão da sua plataforma, comprimir no teto dela, um botão. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
