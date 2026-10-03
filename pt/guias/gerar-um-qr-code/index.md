# Como gerar um QR Code que ainda escaneia no celular dos outros

Gerar um QR Code leva um segundo. Gerar um que funcione num cardápio molhado, num ponto de ônibus ou num celular esticado no braço com pouca luz leva quatro decisões, e as quatro são tomadas antes de imprimir qualquer coisa. Aqui está o que cada uma faz.

[Abrir Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/), cole o seu link, deixe o nível em **M** e a margem em **4**, e baixe o SVG. Imprima com pelo menos dois centímetros de largura, em algo fosco, escuro sobre claro. Depois escaneie o impresso com um celular que não é o seu, antes de mandar imprimir mil.

Isso cobre quase todos os casos. O resto desta página é o que fazer quando não é um deles: um código que precisa aguentar ser manuseado, um código com uma logomarca em cima, um código indo para algo pequeno, e a única decisão que é fácil de errar de um jeito que você só descobre um ano depois.

## O que existe de fato dentro de um QR Code

Uma cadeia de texto. É isso tudo. Escanear um QR Code entrega ao celular um pedaço de texto, e todo o resto, seja abrir uma página, entrar numa rede ou oferecer para salvar um contato, é o celular reconhecendo o formato daquele texto e se oferecendo para agir.

Então não existe “QR Code de Wi-Fi” como categoria de código. Existe um QR Code guardando `WIFI:T:WPA;S:Minha Rede;P:a senha;;`, que todo celular feito na última década sabe ler. O gerador mostra a cadeia final exatamente por isso: quando um código não faz o que você esperava, a cadeia é a única coisa que vale olhar.

Também significa que um QR Code não pode ser mudado depois de impresso, não pode dar notícia a ninguém e não pode expirar, a não ser que alguém tenha colocado dentro dele um link para o próprio servidor, que é o assunto da última seção daqui.

![Um código QR pronto com os dados embaixo: a simbologia, a versão, o nível de correção de erros e o número de caracteres que ele guarda.](https://abox.tools/screens/make-a-qr-code/result.webp)

O que há no código, dito nos termos que o resto deste guia usa. A versão cresce com o conteúdo, e é por isso que os dois ajustes de baixo importam.

## Decisão um: o nível de correção de erros

Um QR Code carrega um conjunto de palavras de verificação junto com os dados, calculadas de modo que um leitor consiga reconstruir o que não conseguiu enxergar. É por isso que um código com um canto rasgado ainda escaneia. Quantas dessas palavras existem é o nível, e há quatro:

- **L:** cerca de 7% do código pode se perder.
- **M:** cerca de 15%.
- **Q:** cerca de 25%.
- **H:** cerca de 30%.

Mais correção não é de graça: os dados de verificação entram no mesmo quadrado, então o mesmo texto no nível H precisa de um código maior e mais denso que no L. Grosso modo, ir de L para H dobra o número de módulos para a mesma cadeia, e módulos mais densos são mais difíceis de uma câmera resolver. Há uma troca real aqui, e a resposta depende de para onde o código vai.

**L** é para tela: um código num slide, num e-mail, numa página web. Nada vai danificá-lo, e cada módulo a mais o torna mais difícil de ler de longe.

**M** é o padrão e a resposta certa para a maior parte da impressão. Papel que vai ser manuseado um pouco, um panfleto, um cartão de visita.

**Q e H** são para códigos que vão apanhar: um cardápio limpado todo dia, um adesivo numa máquina de oficina, uma etiqueta num engradado, um código numa vitrine que pega sol direto. O H é também o que torna possível uma logomarca no meio, como aparece abaixo.

![As opções do QR: um menu de nível de correção de erros em médio e uma zona de silêncio de quatro módulos.](https://abox.tools/screens/make-a-qr-code/options.webp)

Os dois servem para o código sobreviver ao mundo real, uma dobra, um logotipo, uma impressão ruim, e os dois são definidos antes de ele ser desenhado.

## Decisão dois: a margem, que faz parte do código

O espaço branco em volta de um QR Code não é enchimento, e não é escolha de design. Um leitor usa esse espaço para achar onde o símbolo termina. A especificação pede quatro módulos de espaço em silêncio de cada lado, e um código aparado até a borda é o motivo isolado mais comum de um código impresso falhar.

Vale ser direto sobre isso porque aparar é uma coisa tão natural de fazer. O código parece ter branco demais em volta, então é cortado no layout, ou jogado sobre um painel colorido que encosta nos quadradinhos, ou colocado sobre uma fotografia. Cada uma dessas coisas remove a fronteira que o leitor ia usar.

Se o código parece grande demais com a margem, deixe o código menor. Não tire a margem.

## Decisão três: de que tamanho imprimir

A regra de bolso que sobreviveu ao contato com a realidade é **um para dez**: um código precisa ter cerca de um décimo da distância de onde vai ser escaneado.

- Um cartão de visita ou um cardápio, lido a 30 cm: uns 2 cm de largura.
- Um cartaz lido a dois metros: uns 20 cm.
- Um ponto de ônibus ou uma vitrine lidos a cinco metros: uns 50 cm.

Dois centímetros é um piso, não um alvo. Abaixo de uns 1,5 cm um celular comum começa a penar, por melhor que seja a impressão, porque os módulos individuais chegam perto do tamanho de um pixel na câmera dele.

Menos texto significa menos módulos, o que significa um código que se lê de longe para um dado tamanho impresso. É um bom motivo para apontar um código para `exemplo.com.br/x` em vez de para uma URL com cem caracteres de parâmetros de rastreamento no fim.

E imprima a partir do **SVG**. Um QR Code é feito de bordas, e um PNG tem um número fixo de pixels com que formá-las. Amplie um e toda borda amolece, que é exatamente o que dá trabalho a um leitor. Um SVG são os quadradinhos como instruções, então sai nítido num cartão de visita ou num outdoor.

## Cor, contraste e os dois erros

Um leitor mede a diferença entre os módulos escuros e os claros, então o contraste é tudo. Duas coisas dão errado com regularidade:

**Código claro sobre fundo escuro.** Fica bonito, e um bom número de leitores recusa de cara, porque eles procuram escuro sobre claro e não tentam a inversão. Alguns tentam. Você não vai saber quais os seus clientes têm.

**Diferença insuficiente.** Cinza médio sobre branco, ou duas cores de marca com peso parecido, podem medir bem na tela e falhar no papel quando entram o espalhamento da tinta e a exposição automática de um celular. Se você está colorindo um código, mantenha a parte escura genuinamente escura.

Fosco ganha de brilhante para qualquer coisa que vá ser escaneada sob uma luz, e os dois ganham de imprimir sobre uma fotografia. Fundos transparentes são úteis para colocar um código num painel colorido, mas confira o que de fato acaba atrás dele, porque um código transparente num painel escuro é o primeiro erro acima com etapas a mais.

## Uma logomarca no meio

Isso funciona, e funciona por causa da correção de erros, e não apesar dela. No nível H, cerca de 30% dos módulos podem ser destruídos e o código ainda é lido, então uma logomarca cobrindo bem menos que isso, no centro, onde não fica nenhum padrão de localização, é dano que o leitor conserta.

Três coisas a respeitar. Use o nível H. Mantenha a logomarca abaixo de uns 20% da área, bem longe do limite teórico, porque a impressão não é a única coisa comendo a sua margem. E nunca cubra os três quadrados grandes dos cantos nem os menores perto deles: é assim que um leitor encontra e orienta o símbolo em primeiro lugar, e correção de erros nenhuma reconstrói isso.

Depois teste em celulares de verdade. Uma logomarca leva um código de “sempre funciona” para “funciona com esta margem”, e o único jeito de saber quanta margem sobrou é tentar.

## A decisão de que as pessoas se arrependem: estático ou “dinâmico”

Procure por um gerador de QR Code e a maioria dos resultados vai querer que você crie uma conta, porque eles estão vendendo códigos *dinâmicos*. Um código dinâmico não contém o seu link. Contém um link curto para o servidor do próprio gerador, que redireciona para o seu.

O que isso rende a você é real: você pode mudar para onde o código aponta depois de impresso, e recebe uma contagem de cada escaneamento. Para uma campanha com uma tiragem de seis dígitos, isso vale pagar.

O que isso custa também é real, e vale saber antes em vez de depois:

- **O código para de funcionar quando eles pararem.** Se o serviço fechar, o domínio expirar ou o plano gratuito acabar, todo código que você imprimiu morre, e a essa altura eles estão em dez mil cardápios.
- **Cada escaneamento é dado de outra pessoa.** O redirecionamento enxerga o endereço IP, a hora e o aparelho de cada pessoa que escaneia o seu código.
- **O link é deles, não seu.** Quem escaneia vê um domínio desconhecido piscar na tela, que é exatamente aquilo de que as pessoas estão sendo orientadas a desconfiar.

O caminho do meio não custa nada: faça um QR Code estático em volta de uma URL curta *no seu próprio domínio*, e redirecione você mesmo. Você mantém a capacidade de trocar o destino, mantém as estatísticas, e nada sobre o código depende de uma empresa que você nunca viu continuar existindo no ano que vem.

O [gerador daqui](https://abox.tools/pt/gerar-qr-code/) só faz códigos estáticos, e não tem conta para criar. O que você digita é o que o código guarda.

## Antes de imprimir mil deles

Escaneie o código. Não o que está na sua tela, e sim a prova impressa, no lugar em que ele vai ficar, com um celular que não é aquele em que você o fez. Isso leva um minuto e pega a categoria inteira de problemas de que esta página trata: uma margem que o layout comeu, um link sem o `https://`, uma cor que mediu diferente no papel, um código impresso num tamanho que funciona numa mesa e não numa parede.

E confira o que acontece depois do escaneamento. Um código que abre uma página ilegível no celular é um código que falhou, mesmo tendo escaneado.

## Nada disso exige enviar coisa alguma

Um QR Code é aritmética sobre uma cadeia de texto. Não há arquivo para mandar e não há nada que um servidor consiga fazer que um navegador não consiga, e é por isso que a [ferramenta daqui](https://abox.tools/pt/gerar-qr-code/) faz tudo no seu próprio computador e funciona com a rede desligada.

Isso importa mais do que soa, por causa do que as pessoas colocam em QR Codes. O uso mais comum do formato de Wi-Fi é a senha real de uma rede, digitada numa página web. Vale saber se aquela página tinha para onde mandá-la.
