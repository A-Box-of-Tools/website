# Como cortar áudio sem perder qualidade

Um corte de áudio cai no instante exato que você marcou, em qualquer player, sempre — o que não vale para vídeo. Aqui está o porquê, qual é a única pegadinha de verdade, e o que fazer com ela.

[Abrir Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Cortador de áudio](https://abox.tools/pt/cortar-audio/), solte a gravação lá dentro, aperte `I` e `O` para marcar cada trecho que você quer — quantos quiser — e exporte. Todo corte cai na amostra exata que você marcou, as amostras guardadas saem como entraram, e as emendas ganham uma queda de cinco milissegundos para não conseguirem estalar.

O trabalho é esse. O resto desta página é sobre por que essa exatidão é real e não conversa de propaganda, e sobre a única coisa que de fato dá errado quando você junta dois pedaços de som.

## Por que um corte de áudio pode ser exato quando o de vídeo não pode

Vídeo não é guardado como uma sequência de imagens completas — isso seria enorme. A maioria dos quadros é guardada como uma descrição do quanto eles diferem dos vizinhos, então não dá para decodificá-los sozinhos. Só um **quadro-chave** se sustenta sozinho, e quadros-chave costumam ficar de um a dez segundos de distância. Por isso um cortador que copia quadros não consegue começar onde você quiser: ele tem que começar num quadro-chave, e é daí que vem o vídeo aparado que às vezes começa um ou dois segundos antes da sua marca. [O guia de vídeo](https://abox.tools/pt/guias/aparar-um-video/) é quase todo sobre isso.

O som não tem equivalente. Depois de decodificada, uma gravação é uma fila de números — um por canal, dezenas de milhares de vezes por segundo — e cada um deles se sustenta inteiramente sozinho. A amostra 1.234.567 não precisa da 1.234.566 para significar alguma coisa. Então o corte pode ser feito em qualquer amostra, e “exatamente onde você marcou” quer dizer exatamente isso: a sua marca em segundos, multiplicada pela taxa de amostragem, arredondada para a amostra inteira mais próxima. A 48 kHz esse arredondamento é de no máximo dez microssegundos.

Também não há comportamento que dependa do player. Um vídeo aparado se apoia numa marca de edição que a maioria dos players respeita e alguns ignoram; um WAV aparado são as amostras e nada mais, então não sobra nada para um player discordar.

## A pegadinha: uma emenda é um salto

Aqui está o que realmente dá errado quando se corta áudio, e a razão de um bom cortador ter um ajuste para isso.

Som é uma onda. Quando você corta do meio de uma palavra direto para o meio de outra, a amostra do fim do primeiro pedaço e a do começo do segundo não têm relação nenhuma: a forma de onda pode pular de perto do topo da faixa para perto do fundo numa única amostra. Um cone de alto-falante a quem se pede esse salto faz o som mais seco de que é capaz, e você ouve isso como um **estalo** na emenda.

Isso não tem nada a ver com perda de qualidade nem com o formato. Acontece com um corte perfeitamente sem perdas de uma gravação perfeitamente limpa. É simplesmente como um salto soa. Um cortador que corta na amostra exata e não faz mais nada vai estalar em algumas emendas e em outras não, dependendo só de onde na forma de onda as duas pontas foram cair.

## O que uma queda de cinco milissegundos está realmente fazendo

O conserto é levar o nível ao silêncio pouco antes do corte e trazê-lo de volta logo depois, de modo que não sobre salto para dar. É só isso que uma “queda” é aqui: uma rampa aplicada a algumas centenas de amostras em cada borda.

O interessante é a duração. Cinco milissegundos são cerca de duzentas e quarenta amostras a 48 kHz. É tempo bastante para o cone fazer o caminho — o estalo some por completo — e curto demais para se ouvir como uma queda: cinco milissegundos são mais ou menos um quinto do tempo de dizer uma consoante. Você não vai perceber o nível se mexendo. Vai perceber só que a emenda está limpa.

Quedas mais longas são oferecidas porque certo material pede. Vinte ou cinquenta milissegundos valem a pena quando se emenda música, onde o que está sendo interrompido é uma nota sustentada e não uma sílaba, e a rampa mais curta ainda pode deixar um pop audível. Fala quase nunca precisa de mais de cinco.

Uma queda só cabe numa borda que *de fato* seja um corte. Se um trecho começa bem no início da gravação, nada foi tirado na frente dele — o arquivo já começava ali antes de qualquer corte — então fazê-lo entrar aos poucos seria uma edição que ninguém pediu. A ferramenta aqui põe quedas só onde existe emenda, e é por isso que não cortar nada deixa toda amostra intacta.

![O cartão de exportação: um menu de profundidade em bits, um comprimento de fade em milissegundos e um resumo contando as partes, as emendas e a duração.](https://abox.tools/screens/trim-an-audio-file/export.webp)

O fade só é aplicado numa emenda, e esse é o detalhe que importa: um fade no começo de uma gravação seria uma mudança que ninguém pediu.

## Cortar um MP3, e por que o que sai é um WAV

Você pode abrir um MP3, um M4A, um Ogg ou um arquivo Opus e cortar. O que volta é um WAV, e vale falar claramente da troca que isso representa em vez de apresentar como se fosse um recurso.

Existem duas maneiras de cortar áudio comprimido. Uma é cortar os dados comprimidos direto, movendo blocos codificados inteiros para um arquivo novo sem decodificar. Isso mantém o arquivo pequeno e não custa qualidade — só que um bloco de MP3 dura uns vinte e seis milissegundos, então todo corte é arredondado para a fronteira de bloco mais próxima, que é a versão em áudio do problema do quadro-chave. E é trabalho preso ao formato: um leitor de MP3 não corta nenhum arquivo Opus.

A outra maneira é decodificar, cortar na amostra exata e escrever as amostras de volta. Nada arredonda, todo formato que o navegador toca funciona igual, e as quedas passam a ser possíveis — não dá para fazer rampa num nível que você não decodificou. O custo é que as amostras precisam ser escritas de volta em algum formato, e nenhum navegador traz um codificador de MP3 ou AAC utilizável aqui. Um WAV não precisa de codificador: são as amostras com um cabeçalho curto na frente, então esse passo não tem como perder nada.

As consequências práticas: o que sai é bem maior do que o que entrou — uns dez megabytes por minuto em estéreo — e não é *melhor* que o MP3 de onde veio, porque a compressão que já aconteceu não se desfaz. Tudo abre um WAV, e qualquer coisa que precise de MP3 consegue fazer um a partir dele em um passo.

## Marcar vários trechos de uma vez

A maioria dos cortadores online te dá um par de alças e pergunta qual único pedaço guardar. Para gravações de verdade isso responde à pergunta errada. Uma hora de entrevista não tem um trecho bom; tem seis, espalhados, e você os acha ouvindo tudo uma vez.

Então marque enquanto escuta: `I` onde um trecho começa, `O` onde ele acaba, quantas vezes quiser. Cada par vira uma linha que você pode ajustar ou reordenar, e uma faixa desenhada sobre a forma de onda. O arquivo pronto são essas linhas emendadas em ordem.

A mesma lista de marcas responde também à pergunta contrária. Se o que você quer fora são os “né”, o telefone tocando e as falsas partidas, marque *esses* e mude para “tirar os marcados” — aí é tudo o que você não marcou que se emenda. São as mesmas marcas dos dois jeitos, então dá para alternar e ver a duração final mudar sem marcar nada duas vezes.

Marcar é trabalho cuidadoso, e uma aba fechada não deveria custar isso: as marcas são salvas num arquivo de texto simples e carregam de volta. O formato é o mesmo que o [Aparador de vídeo](https://abox.tools/pt/aparar-video/) escreve, o que quer dizer que marcas feitas num vídeo podem ser soltas no áudio extraído dele, e vice-versa.

## Olhe a forma de onda

Marcar som arrastando a agulha é chute; marcar de olho não é. Silêncio parece silêncio, uma tosse parece uma tosse, e os quatro segundos de ruído de sala antes de alguém começar a falar aparecem na hora em vez de terem que ser procurados.

Isso pesa mais nas marcas que as pessoas erram por pouco: o começo de uma frase geralmente quer ficar no silêncio *antes* da respiração, não depois, e o fim geralmente quer uma batida de ruído de sala em vez de um corte na última consoante. Os dois são óbvios no desenho e quase impossíveis de acertar só de ouvido. Arraste as pontas de um trecho marcado ao longo da forma de onda para acertá-las.

![Uma forma de onda com dois trechos marcados, os silêncios entre as frases bem visíveis, e uma tabela com início, fim e duração de cada trecho.](https://abox.tools/screens/trim-an-audio-file/marks.webp)

Os silêncios são onde alguém parou de falar. É isso que faz uma forma de onda valer o olhar, ao contrário de um cronômetro.

## Cortar não é aplicar fade, e não é editar

Três palavras que viram uma pela outra. Cortar muda quais partes da gravação sobrevivem. Um fade — o musical, de segundos — é um efeito deliberado sobre o nível, e os poucos milissegundos descritos acima não são isso; são remoção de estalo, que por acaso usa a mesma aritmética.

Se o que você quer é a gravação de trás para frente, acelerada, mais devagar sem o tom mudar, ou levantada porque foi gravada baixa demais, isso é o [Editor de áudio](https://abox.tools/pt/editar-audio/). É o mesmo decodificador e o mesmo escritor de WAV; ele só faz outra aritmética no meio.

## Por que isso não precisa de envio

Cortar é aritmética sobre uma lista de números. O navegador já tem o decodificador — é o mesmo que toca o arquivo num elemento `<audio>` — e depois de decodificadas as amostras, ficar com algumas e largar o resto é uma cópia. Não há nessa descrição nenhum passo que um servidor faria melhor, e a ida e volta até ele seria a parte mais lenta do trabalho inteiro.

É também um tipo de arquivo em que enviar custa mais do que as pessoas imaginam. Gravações são vozes: entrevistas, aulas, ligações, áudios de mensagem, sessões de terapia, uma criança dizendo algo que você quer guardar. A ferramenta aqui não tem função de rede de espécie alguma, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso.

Desligue a internet e corte uma gravação assim mesmo, se você prefere conferir a acreditar. [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) reúne mais três checagens como essa.
