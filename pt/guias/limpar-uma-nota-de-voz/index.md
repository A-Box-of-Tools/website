# Como limpar uma nota de voz antes de enviar

Uma nota de voz chega com trinta segundos de barulho de bolso, dois falsos começos e um nível definido pela distância do telefone. Deixá-la pronta para enviar são dois passos — cortar, depois subir — e os dois rodam no seu navegador, que é onde deve ficar uma gravação da sua própria voz dizendo coisas privadas.

[Abrir Editor de áudio](https://abox.tools/pt/editar-audio/): Toque de trás para a frente, mude a velocidade, levante uma gravação baixa. Tudo aqui, no seu computador.

Última atualização 26 de agosto de 2026

## A resposta curta

1. **Corte.** Abra o [Cortador de áudio](https://abox.tools/pt/cortar-audio/), solte a nota e marque as partes que valem com `I` e `O` enquanto toca. A forma de onda mostra os silêncios e os falsos começos como trechos chapados, então a maior parte do corte é feita no olho. Exporte um arquivo só.
2. **Suba.** Leve esse arquivo ao [Editor de áudio](https://abox.tools/pt/editar-audio/) e normalize: o nível sobe até logo abaixo do fundo de escala, o máximo que uma gravação pode ser sem estourar. Exporte, e envie isso.

A viagem entre os dois dispensa download: assim que o cortador exporta, uma linha sob o botão de download oferece levar o resultado direto para o editor, e a nota chega lá já carregada.

Os dois passos rodam na sua própria máquina. Nota de voz é mais ou menos o mais pessoal que um arquivo consegue ser, e os sites de sempre de "melhorar áudio online" ficam com uma cópia como preço do controle.

![O editor de áudio com uma gravação carregada: a duração, o formato, a taxa de amostragem e um pico de cerca de menos seis decibéis.](https://abox.tools/screens/clean-up-a-voice-memo/source.webp)

O que a ferramenta descobre antes de você mexer em qualquer coisa. O nível de pico é o número que decide se dá para aumentar o volume com segurança.

## Por que cortar antes de subir

Porque normalizar lê o arquivo inteiro para achar o momento mais alto dele, e numa nota crua o momento mais alto costuma ser justamente o que você está prestes a apagar: o baque do telefone largado, a tosse antes da segunda tentativa. Normalize primeiro e esse pico define o teto, e a voz sai tão baixa quanto entrou. Corte o entulho e o mais alto que sobra é a própria voz, que é onde a folga deve ser gasta.

O cortador corta na amostra exata e esmaece cada emenda por alguns milissegundos, então um corte no meio do ruído da sala não consegue estalar. Só as emendas: o áudio intocado entre elas é copiado, não recodificado.

## O que o editor conserta, e o que não

Normalizar conserta o *baixo*. Não conserta o barulhento: o nível do ar-condicionado sobe com o da voz, porque é uma gravação só e os dois estão dentro juntos. O que mantém uma nota inteligível é principalmente o corte — ar morto é onde o ruído se ouve sozinho — mais o controle de velocidade por consideração ao ouvinte: 1,25× mantendo o tom é o truque dos podcasts, e funciona igualmente bem numa nota que se espalha.

O editor escreve WAV — amostras exatas, nenhum codificador no caminho — então o arquivo pesa mais que o original comprimido. Para uma nota medida em minutos é um preço justo por nunca empilhar uma segunda codificação com perda sobre a primeira que o telefone fez; o mensageiro que a enviar vai comprimi-la mais uma vez de qualquer jeito, e essa deveria ser a única.

![O editor: um controle de velocidade em 1,25, um controle de volume em mais quatro decibéis e um resumo da duração, da velocidade e do pico resultantes.](https://abox.tools/screens/clean-up-a-voice-memo/edit.webp)

Velocidade e volume, com o resumo embaixo dizendo o que eles vão fazer. Nada é aplicado até a exportação, então dá para mexer nos dois e voltar atrás.

## A mesma sequência, gravações mais longas

Uma entrevista, uma aula, uma reunião: a sequência é a mesma, o corte só rende mais. Marque as perguntas que importam, deixe o resto cair, e as próprias marcas se salvam como arquivo de texto simples e se recarregam, o que transforma uma limpeza longa em algo que se pode largar e retomar. Para áudio que mora dentro de um vídeo, o editor também tira a trilha de um MP4 ou MOV sem tocar na imagem: o primeiro passo para transformar uma chamada gravada em algo escutável no caminho do trabalho.

## Se você faz isso toda semana

Cortar e subir moram em duas páginas de propósito: cada uma faz um trabalho, e cada uma consegue provar sozinha que a gravação nunca saiu da sua máquina. Mas as duas são código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências cujos READMEs explicam os cortes na amostra exata e o escritor de WAV.

Se chovem notas em você todo dia, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça a versão de uma página: forma de onda, marcas, normalizar ao exportar. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
