# Como transformar um vídeo em GIF

GIF é um formato de 1987 que guarda imagens inteiras em vez de movimento, então um GIF feito de vídeo é sempre grande. Aqui está qual dos três ajustes mexer quando ele ficar grande demais, e quanto cada um rende.

[Abrir Vídeo para GIF](https://abox.tools/pt/video-para-gif/): Escolha o trecho, o tamanho e a taxa de quadros.

Última atualização 13 de outubro de 2026

## A resposta curta

Abra o [conversor de Vídeo para GIF](https://abox.tools/pt/video-para-gif/), adicione o clipe, marque segundos e comece com largura moderada e 12 quadros por segundo. No desktop prefere 480 pixels; no celular pode começar em 240 para limitar a memória estimada. Se ficar grande, reduza primeiro a largura: economiza em dobro.

O resto desta página é o porquê, porque “meu GIF está com 14 MB” é o problema que todo mundo de fato tem, e qual botão girar não é óbvio.

## Uma instrução breve ou um erro reproduzível

Três segundos de tela explicam melhor um menu, arraste ou erro que um parágrafo. Comece antes da ação e termine após mostrar o resultado. Use 12 quadros por segundo, largura para ler o rótulo importante e pontilhamento desativado para cores planas. Veja a exportação no problema, documento ou página previstos, não só sua prévia grande.

Para uma reação ou movimento artesanal, funciona com menos texto e muitas vezes menor largura. No celular pode começar em 240 para controlar memória. Se superar o orçamento, encurte ou use a largura menor oferecida; o decodificador também precisa de memória. GIF não leva áudio: preserve vídeo se a fala importar.

## Por que um GIF de um vídeo é tão enorme

Um codec de vídeo guarda *movimento*. Ele escreve uma imagem inteira a cada par de segundos e então, para cada quadro no meio, uma descrição de como aquela imagem se mexeu: este bloco de pixels deslizou quatro para a esquerda, esta área ficou um pouco mais escura. Um clipe de cinco segundos pode ter algumas centenas de kilobytes porque a maior parte dele são instruções sobre uma imagem que você já tem.

O GIF não tem nada disso. Ele foi finalizado em 1989, antes de qualquer uma dessas coisas existir. Todo quadro é uma imagem, comprimida sozinha com um esquema desenhado para capturas de tela de uma planilha. Não existe estimativa de movimento em lugar nenhum do formato e não tem como acrescentar uma.

Então o número a esperar é **dez vezes o tamanho do vídeo**, e conversor nenhum vai convencer você do contrário. O que um bom conversor pode fazer é não desperdiçar nada além disso, e entregar os três ajustes que de fato decidem a coisa.

![O cartão da seção: um quadro de vídeo com código de tempo e uma barra mostrando um pedaço de quatro segundos marcado dentro de um clipe de vinte.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

A seção primeiro, porque todo ajuste abaixo é multiplicado pelos segundos que você manteve.

## Os três ajustes, e o que cada um custa

Tudo sobre o tamanho de um GIF se resume a quantos pixels ele contém, que é a duração vezes a taxa vezes a área de um quadro.

- **O trecho, que é linear.** O dobro da duração é o dobro de quadros e mais ou menos o dobro do arquivo. Este é o que a maioria já entende, e vale ser implacável: um GIF que faz o ponto dele em três segundos é um GIF melhor além de menor.
- **A largura, que é quadrática.** Cortar a largura pela metade corta a altura junto, então dá um *quarto* dos pixels. Ir de 640 para 320 não economiza pouco menos da metade, economiza uns três quartos. Este é o ajuste que ninguém procura primeiro e o que mais rende.
- **A taxa de quadros, que é linear.** Dez quadros por segundo dão dois terços do tamanho de quinze. É também o ajuste em que a perda mais aparece, porque movimento lento demais se lê como quebrado em vez de como pequeno.

Um exemplo feito. Seis segundos de um clipe de celular na resolução própria dele, ⁦1080×1920⁩, a 30 fps são 180 quadros de dois milhões de pixels: cerca de 350 milhões de pixels, o que não é um GIF, é um sequestro com reféns. Os mesmos seis segundos a 480 de largura e 12 fps são 72 quadros de 400.000 pixels, ou seja, 30 milhões, cerca de um doze avos, e ficam parecidos com aquilo que as pessoas querem dizer com GIF.

![O cartão de exportação: uma largura de 480, uma taxa de quadros, uma escolha de pontilhado e um resumo estimando os quadros e o tamanho.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Três ajustes e uma estimativa que se mexe com eles. Qual gastar primeiro é o assunto desta seção.

## Qual taxa de quadros escolher

Doze é o padrão daqui e a resposta certa com uma frequência surpreendente. É a taxa que a animação desenhada à mão usa há um século: rápida o bastante para o olho ler como movimento contínuo, lenta o bastante para você não estar pagando por quadros que ninguém consegue ver.

- **De 5 a 8:** jeitão de apresentação de slides. Serve para um travelling lento ou uma gravação de tela em que nada se mexe depressa.
- **De 10 a 15:** normal. Lê-se como movimento. Quase todo GIF que vale a pena fazer está aqui.
- **De 20 a 25:** suave, e mais ou menos o dobro do tamanho de 12 por uma diferença que a maioria de quem assiste não vai saber nomear. Vale para movimento rápido, um clipe de esporte, qualquer coisa com uma panorâmica veloz.

Há um teto rígido que vale conhecer: o GIF guarda quanto tempo cada quadro fica na tela em centésimos de segundo, e todo navegador trata um atraso abaixo de dois centésimos como dez. Então 50 quadros por segundo é o máximo real, e um arquivo pedindo 100 vai tocar em silêncio a 10. Um conversor que oferece 60 fps ou está ignorando isso, ou está prestes a surpreender você.

## 256 cores, e para que serve o dithering

A outra metade da idade do formato: um GIF carrega uma tabela de no máximo 256 cores, e cada pixel é um número que aponta para dentro dela. Um quadro de vídeo tem até dezesseis milhões. Quase tudo isso é jogado fora, e o jeito como é jogado fora é a maior parte da aparência de um GIF.

Um bom conversor conta as cores do *seu* clipe e escolhe 256 que caiam bem nele, em vez de usar um conjunto fixo. Uma tomada de floresta ganha 256 verdes, e uma tomada de pôr do sol ganha 256 laranjas. É isso que a ferramenta daqui faz, olhando todos os quadros do trecho em vez de só o primeiro, para que uma cor que só aparece no fim ainda ganhe uma vaga.

**Dithering** é o que acontece onde a cor de que você precisa continua faltando. Em vez de arredondar uma área inteira para a cor disponível mais próxima, o que transforma um céu suave em quatro faixas chapadas com degraus visíveis entre elas, ele alterna as duas cores mais próximas num padrão fino, e de uma distância normal de visualização o seu olho as mistura naquela que não existe.

- **Deixe ligado** para qualquer coisa fotográfica: céus, pele, gradientes, sombras, cinema.
- **Desligue** para cor chapada: gravações de tela, desenho de traço, logomarcas, desenhos animados, qualquer coisa com grandes áreas de um tom só. Não há gradiente a proteger, e o arquivo fica menor e mais limpo sem ele.

Um detalhe que vale conhecer se você comparar conversores. O jeito óbvio de fazer dithering é a difusão de erro, que a maioria dos editores de imagem usa, e nele o resultado de cada pixel depende dos pixels em volta. Numa animação isso significa que um fundo que não está se mexendo ainda assim recebe dithering diferente em cada quadro, então ele fervilha visivelmente, e todo quadro tem que ser guardado por inteiro porque tecnicamente todo pixel mudou. A alternativa, um dithering ordenado, depende só de onde o pixel está, então um fundo parado fica perfeitamente parado. É isso que esta ferramenta usa, e é por isso que os arquivos dela são menores além de mais calmos.

## Quando não fazer um GIF

Vale perguntar, porque a resposta honesta muitas vezes é “não faça”. Um MP4 ou WebM mudo e em laço tem cerca de um décimo do tamanho da mesma animação como GIF, toca do mesmo jeito, e é no que toda plataforma social converte o seu GIF depois que você o envia, de qualquer forma.

Fique com o GIF onde o destino genuinamente precisa de um:

- algum lugar que só aceita imagem, como muitos softwares de chat, de fórum, de wiki e de e-mail;
- um README ou uma página de documentação, onde um GIF toca embutido e um vídeo precisa de um reprodutor;
- uma apresentação de slides ou um documento que tem que continuar se mexendo offline;
- um emoji, uma figurinha, uma reação, todos pequenos o bastante para nenhuma daquelas contas de tamanho importar.

Se o som importar, GIF nunca teve áudio. Corte o vídeo: o [Cortador de vídeo](https://abox.tools/pt/aparar-video/) copia seções adequadas ou usa o método exato indicado se necessário.

## Ficando abaixo de um limite de tamanho

A maior parte do motivo de alguém ajustar um GIF é um limite na outra ponta. Em ordem grosseira de quanto eles mordem:

- **E-mail:** confira limites do remetente e receptor para mensagem e anexos juntos. Deixe espaço para o restante; a meta GIF não é um limite universal de e-mail.
- **Chats e fóruns:** confira limites atuais de anexos e prévia integrada para a conta e aplicativo específicos. Podem ser diferentes.
- **README ou documentação:** hospedagem de imagens e envio do editor têm limites diferentes. Use um GIF leve para celular e teste a página renderizada.
- **Vagas de figurinha e de emoji:** muitas vezes algumas centenas de kilobytes, o que significa largura pequena e trecho curto, e não taxa de quadros menor.

A ordem para tentar, quando você estiver acima: encurte o trecho, depois corte a largura pela metade, depois baixe a taxa, depois desligue o dithering. As duas primeiras valem mais que as duas últimas juntas.

## Nada disso precisa de envio

Converter um vídeo em GIF é decodificar, redimensionar, contar cores e comprimir, quatro coisas que um navegador sabe fazer sozinho há anos. A ferramenta ligada lá em cima faz tudo isso no seu computador: o arquivo é lido do seu disco, os quadros são decodificados pelo seu navegador, e o GIF é montado na memória e entregue aos seus downloads.

Isso vale mais aqui do que de costume. Os clipes que as pessoas transformam em GIF são pessoais: um momento de um vídeo de família, uma gravação de tela de algo do trabalho, alguns segundos de uma chamada. Um conversor que quer isso enviado está pedindo uma cópia daquilo, e não sobrou motivo técnico para dizer sim.
