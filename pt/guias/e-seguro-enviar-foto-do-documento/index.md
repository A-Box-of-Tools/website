# É seguro enviar uma foto do seu documento de identidade?

Para o formulário oficial a que ele se destina: sim — o documento existe para isso. O risco mora um passo antes: no conversor ou compressor que você visita porque o formulário exigiu “menos de 300 KB, JPEG” — e esse passo é o que nunca precisa acontecer.

Última atualização 26 de agosto de 2026

## A resposta curta

Enviar o documento ao órgão que o pediu é normal e quase sempre inevitável: um pedido de visto, a verificação de identidade de um banco, a inscrição num concurso. Esse envio é a razão de ser do documento, viaja para uma parte que você sabe nomear, e normalmente não existe outro jeito de fazer o pedido.

O envio que merece preocupação é outro, e acontece um passo antes. O formulário diz que a foto precisa medir 35 por 45 milímetros, ou pesar menos de 300 KB, ou ter exatamente 200 por 230 pixels — e o seu escaneamento não é nada disso. Então, cinco minutos antes de um prazo, segurando o arquivo mais sensível que você possui, você procura “reduzir foto online” e entrega seu passaporte ao primeiro resultado: um site que você não conhecia dez segundos atrás e que nunca mais vai visitar. É desse passo que esta página trata — e é o passo que nunca precisa acontecer.

## Por que um documento não é como os outros arquivos

A maioria dos arquivos, se vaza, é constrangedora. Um documento de identidade, se vaza, é *útil* — o que é outra coisa, e pior. Uma única imagem carrega, num único retângulo, mais ou menos tudo o que um estranho precisa para abrir uma conta no seu nome: nome completo, data e lugar de nascimento, número do documento, validade, uma foto do seu rosto e, em muitos documentos, uma faixa legível por máquina que repete tudo num formato feito para ser lido por programas.

É também um vazamento raramente reversível. Uma senha vazada se troca num minuto; um cartão vazado se substitui numa semana. A data de nascimento é sua para a vida toda, e trocar o número de um passaporte é trocar o passaporte. Essa assimetria é o argumento inteiro do cuidado: o custo de um vazamento é alto e permanente, e o custo de evitá-lo, descobre-se, é zero.

E uma coisa a mais viaja sem convite. Uma foto tirada com o telefone carrega metadados EXIF — tipicamente as coordenadas GPS exatas de onde foi tirada, que para um documento fotografado na mesa da cozinha são o endereço da sua casa, grampeadas ao único arquivo que já contém seu nome e seu aniversário. O caso geral desse problema tem [um guia próprio](https://abox.tools/pt/guias/remover-dados-exif-e-gps/).

## A armadilha é o requisito, não o formulário

Repare na mecânica do momento arriscado. O formulário do pedido costuma ser a parte mais responsável da história toda — um portal público ou um banco regulado, com endereço e auditores. O que empurra as pessoas para lugares piores são os *requisitos* do formulário: uma medida em milímetros, uma contagem de pixels, um teto de kilobytes, às vezes um piso. O documento precisa ser transformado, o formulário não faz isso, e as ferramentas do sistema operacional não falam nem milímetros nem kilobytes.

Então o desvio acontece nas piores condições possíveis: com pressa, sem tempo de avaliar nada, carregando o arquivo em que mais está em jogo. Um conversor que seria uma escolha perfeitamente razoável para uma foto de férias herda o seu passaporte no lugar dela. Ninguém escolhe isso de propósito; o prazo escolhe por ele.

A pergunta geral — o que enviar algo a qualquer conversor realmente faz, e como saber se uma ferramenta envia alguma coisa — tem [uma página própria](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/). A versão curta: uma ferramenta conferível vale mais que uma confiável, porque com a conferível a pergunta da confiança nem chega a existir. Com um documento de identidade, essa preferência deixa de ser um requinte e vira o ponto inteiro.

## O trabalho todo sem o documento sair

Tudo o que o requisito pede, o seu próprio navegador faz, na sua própria máquina, sem mandar nada a lugar nenhum. Este site tem uma ferramenta para cada forma que o requisito toma:

- **“⁦35 × 45⁩ mm, cabeça entre 70 e 80% do quadro”** — a [foto de documento](https://abox.tools/pt/foto-3x4/) guarda a regra publicada de cada país: tamanho de impressão, faixa de altura da cabeça, linha dos olhos, fundo, e os limites de pixels e kilobytes que os formulários web impõem, pisos incluídos. Escolha o país e o documento; a regra é aplicada exata.
- **“um escaneamento, não uma fotografia”** — o [digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/) encontra os cantos da página numa foto de telefone, endireita a perspectiva e nivela a luz, de modo que um documento fotografado sobre a mesa sai com cara de escaneado.
- **“menos de 300 KB”** — o [compressor de imagens](https://abox.tools/pt/comprimir-imagem/) toma o limite como um número e encontra a menor compressão que cabe embaixo dele, em vez de fazer você adivinhar com um controle de qualidade.
- **Compartilhar uma cópia com menos do que tudo** — quando um hotel ou um locador quer prova de identidade mas não tem nada que ver com o número do seu documento, a ferramenta de [tarjar imagem](https://abox.tools/pt/tarjar-imagem/) sobrescreve os próprios pixels em vez de desenhar uma caixa por cima, e o [visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) tira os metadados, localização incluída.

Cada uma dessas ferramentas continua funcionando com o Wi-Fi desligado, e isso é menos um recurso do que a prova: uma página que não alcança a rede não consegue mandar um passaporte a lugar nenhum. Esse teste — e mais três da mesma família — estão escritos no [guia sobre enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/), e funcionam em qualquer site, este incluído.

## Para o envio de que você não escapa

O pedido em si ainda termina num envio, então gaste o cuidado onde ele rende:

- Digite você mesmo o endereço do portal, ou siga o link do papel oficial, em vez de procurá-lo. Portais de serviços são muito imitados, e uma imitação convence mais quem está com pressa.
- Mande documentos pelo formulário, não por e-mail. E-mail fica guardado em mais lugares do que remetente e destinatário saberiam listar, por tempo indeterminado.
- Se uma empresa pede cópia integral, é justo perguntar para quê. Em muitos países você pode riscar o que uma parte privada não precisa — vários governos recomendam expressamente anotar na cópia o propósito e a data. Com a ferramenta de tarjar lá de cima, isso é coisa de dois minutos.
- Mantenha as cópias de trabalho fora de máquinas compartilhadas, e apague as sobras: o original enorme na pasta de downloads sobrevive ao pedido por anos, e é a cópia de que ninguém lembra.

Nada disso é motivo para não pedir o passaporte. É motivo para fazer do único envio que importa o único que acontece.
