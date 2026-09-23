# Como transformar um vídeo longo em timelapse

Uma hora de pôr do sol, um dia de obra, o trajeto diário pelo para-brisa: filmagem que vale a pena, numa velocidade que ninguém vai assistir. O trabalho é uma decisão sobre o tempo e outra sobre o destino, e tudo roda no seu navegador, sobre um arquivo que nunca sai da sua máquina.

[Abrir Criador de timelapse](https://abox.tools/pt/fazer-timelapse/): Uma hora de gravação em vinte segundos.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Criador de timelapse](https://abox.tools/pt/fazer-timelapse/), solte a gravação, e defina ou uma velocidade — qualquer coisa de 1,1× a 1000× — ou, sem fazer conta, quanto o resultado deve durar. Sessenta segundos é um bom padrão para qualquer coisa que vá para um feed. Escolha os quadros por segundo, reduza o tamanho se o original for 4K, e exporte.

Se o destino só anima GIF, passe depois o clipe exportado pelo conversor de [Vídeo para GIF](https://abox.tools/pt/video-para-gif/); mas leia antes a última seção, porque um timelapse é a coisa mais cara que se pode pedir a um GIF para carregar.

Essa viagem já vem pronta: depois da exportação, uma linha sob o botão de download oferece levar o resultado direto para o conversor, e o clipe chega lá já carregado.

## Diga a duração, não a velocidade

"Quão rápido" é a pergunta errada, porque a resposta honesta é uma divisão que você não deveria ter que fazer: noventa minutos de filmagem num minuto de resultado dá 90×; um dia de obra em trinta segundos fica mais perto de 3000× do que de qualquer coisa que um controle sugira. A ferramenta aceita a duração final direto e calcula o fator sozinha, e assim a resposta sobrevive ao dia em que você trocar por uma gravação mais longa.

Para o que um fator de velocidade ainda serve são os números pequenos. Entre 1,1× e 2× um vídeo continua *assistível como vídeo* — uma aula, uma demonstração — e acima de mais ou menos 8× ele deixa de ser reprodução rápida e vira timelapse, onde cada quadro de saída é uma amostra colhida do fluxo do tempo e tudo entre as amostras simplesmente se foi.

Essa amostragem também é o que torna o trabalho rápido. A ferramenta lê só os instantes de que a saída precisa — a 100×, cerca de um centésimo do arquivo — em vez de decodificar uma hora para ficar com um minuto.

![O cartão de velocidade: uma velocidade de vinte vezes, a duração resultante, o intervalo entre os quadros mantidos e uma taxa de quadros.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Diga a duração que você quer e a velocidade vem junto, ou o contrário. O intervalo é o número que diz quanto do original está sendo pulado.

## Quadros e tamanho, em resumo

- **Quadros por segundo.** 30 se lê como movimento fluido para quase tudo; 60 só merece o tamanho dobrado quando o movimento é o assunto, e 24 dá a nuvens e multidões um tique agradável de cinema.
- **Tamanho.** Timelapse quase sempre se assiste pequeno. Reduzir 4K para 1080p deixa em um quarto os pixels que o codificador precisa descrever, e na tela de um telefone ninguém jamais vai saber.

![O resumo do cartão de exportação: o número de quadros, o intervalo, a duração final, o tamanho estimado e quanto do arquivo precisa ser lido.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

A última linha é a que vale notar: um timelapse lê uma fração do arquivo, e é por isso que isso é rápido num clipe que levaria uma hora para recodificar.

## Quando o timelapse quer ser um GIF

Quase nunca. Um timelapse é mudança constante do quadro inteiro — exatamente aquilo em que a compressão GIF é pior — então até um curto cai nas dezenas de megabytes enquanto o MP4 pesa um décimo disso, mais nítido. Poste o vídeo em qualquer lugar onde vídeo toca.

Quando o destino realmente só anima GIF, corte a sequência para uns poucos segundos com loop na [linha do tempo do conversor](https://abox.tools/pt/video-para-gif/), mantenha a largura modesta e deixe os quadros caírem para ⁦10–12⁩. O [guia do GIF parcial](https://abox.tools/pt/guias/gif-de-um-trecho-de-video/) é a versão longa desse orçamento.

## Se você faz isso toda semana

Os dois passos morarem aqui em duas páginas é de propósito: cada página faz um trabalho, e cada uma consegue provar sozinha que nada sai da sua máquina. Mas tudo que as duas executam é código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências com um README que nomeia cada um.

Se uma câmera no tripé faz parte da sua rotina, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para compor o amostrador e o codificador de GIF numa página com a sua velocidade e o seu tamanho já definidos. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
