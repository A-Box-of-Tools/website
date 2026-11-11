# Como criar uma miniatura de vídeo com o quadro exato

A diferença entre uma miniatura e um print é mais ou menos um quarto de segundo: o quadro em que os olhos estão abertos e a bola ainda está no ar. Chegar a esse quadro, no tamanho da plataforma, abaixo do limite de bytes dela, é uma sequência de três passos que roda inteira no seu navegador.

Última atualização 13 de outubro de 2026

## A resposta curta

1. **Pegue o quadro.** Abra o [Capturador de quadros](https://abox.tools/pt/extrair-quadro-de-video/), solte o vídeo e avance pela lista de quadros do próprio arquivo até o instante exato. Salve como PNG: a cópia sem perda, para nada ficar decidido ainda.
2. **Enquadre o quadro.** Leve o PNG ao [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/), recorte no formato da plataforma e escolha dimensões adequadas à fonte e ao destino. O YouTube recomenda atualmente 16:9 para vídeos e 9:16 para Shorts; abaixo há os detalhes de cada caso.
3. **Cumpra o limite.** Termine no [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) com o limite atual da plataforma como meta e alguma margem. Escolha JPEG para uma miniatura fotográfica do YouTube; não deixe Auto se exigir JPG ou PNG.

Nada na sequência envia nada — o que importa quando o vídeo não foi publicado, e a miniatura está sendo feita justamente porque o vídeo ainda não é público.

## Uma capa legível no tamanho real

Ao publicar vídeo, escolha um quadro que explique o que será visto: o objeto pronto, a pessoa falando olhando para cima ou o instante antes da ação. O texto de origem deve ser legível na prévia pequena. Estas ferramentas capturam, recortam e comprimem; adicionar título ou outro desenho exige um editor de imagem entre a captura PNG e a compressão final.

Em um site, a mesma imagem serve de pôster antes de reproduzir. Combine formato e tamanho exibido do reprodutor e confira se explica o clipe no celular. Também serve para capa de apresentação: teste no slide real, sem supor que o público vê o PNG inteiro.

## Por que avançar ganha de pausar

Pausar um player e tirar print perde duas vezes. A pausa cai onde o player conseguiu parar — o lugar mais próximo, não o quadro que você queria — e o print é uma foto do player: a resolução dele, a interface dele, o tratamento de cor dele, não os do arquivo.

O capturador percorre, em vez disso, a lista de quadros do próprio arquivo, um quadro por vez nos dois sentidos, e entrega o quadro decodificado em si, na resolução cheia do vídeo. Um quarto de segundo de busca de cada lado do momento costuma ser onde a miniatura mora: o quadro *entre* os dois óbvios, onde o movimento se lê e nada saiu borrado.

Salve a captura em PNG mesmo que a miniatura final seja JPEG. Preserva a imagem desenhada sem outra codificação com perdas; cada decisão posterior de compressão ocorre uma vez no final, dentro de um limite de bytes, sem acumular duas perdas.

![Uma imagem parada de um vídeo com o código de tempo visível, ao lado dos controles de passo e rolagem e do instante exato de onde foi tirada.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Avançar até o quadro, em vez de pausar e tirar um print. A seção de cima diz qual é a diferença de verdade.

## A aritmética da plataforma

Recorte antes de comprimir, como explica o [guia de fotos](https://abox.tools/pt/guias/preparar-fotos-para-a-web/): pixels são o orçamento. ⁦1280×720⁩ em 16:9 é uma saída pequena útil, não a recomendação atual do YouTube. Suas [instruções de miniaturas](https://support.google.com/youtube/answer/72431?hl=en) recomendam agora ⁦3840×2160⁩ para vídeos e ⁦2160×3840⁩ para Shorts; JPG e PNG são exemplos aceitos. No desktop, até 50 MB; no celular, miniaturas de vídeo devem ter menos de 2 MB. Confira sua modalidade de envio e não amplie uma imagem pequena só para alcançar um valor. É necessária conta verificada; Shorts personalizados são enviados atualmente pelo YouTube Studio em um computador.

O quadro trava em 16:9 ou 9:16: você ajusta arrastando, sem calcular. Mantenha texto e rostos nos dois terços centrais: feeds arredondam cantos e sobrepõem a duração embaixo à direita.

![O redimensionador com uma largura de 1280 e uma altura de 720 digitadas, e um resumo de como a imagem vai sair.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

Uma exportação de exemplo de 1280 por 720. Escolha dimensões conforme o destino atual e os detalhes reais da fonte.

## Uma folha de contatos, quando o momento não aparece

Quando o instante certo está perdido em dez minutos de filmagem, o outro modo do capturador salva um quadro a cada N segundos e entrega o lote num ZIP. Passe os olhos pelas imagens como numa folha de contatos, anote o tempo da mais próxima e avance a partir dali. É mais rápido do que esfregar a barra, e sobra uma pasta de candidatas para o dia em que a plataforma pedir outro formato.

## Se você faz isso toda semana

Os passos morarem aqui em três páginas é de propósito: cada página faz um trabalho, e cada uma consegue provar sozinha que nada sai da seu computador. Mas cada passo é código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências com READMEs que explicam o decodificador, a reamostragem e a busca do alvo de bytes.

Se miniatura é entrega semanal, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça a versão de uma página: avançar, recortar no padrão da sua plataforma, comprimir no teto dela, um botão. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
