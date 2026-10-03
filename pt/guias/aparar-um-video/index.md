# Como aparar um vídeo sem recodificá-lo

A cópia pode encurtar um vídeo sem alterar seus quadros codificados. Este guia explica as limitações dos quadros-chave, quando a cópia funciona de forma confiável e quando escolher a recodificação.

[Abrir Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Aparador de vídeo](https://abox.tools/pt/aparar-video/), solte o clipe e pressione `I` e `O` para marcar cada trecho que deseja. Depois, escolha como exportar. Em MP4, MOV ou M4V, “Manter cada byte” transfere os quadros mantidos e o som para o novo arquivo sem alterá-los. Está disponível para um trecho ou para vários, desde que todos os seguintes comecem em um quadro-chave. Outras seleções precisam da opção identificada explicitamente como recodificação.

Copiar não reduz a qualidade e é rápido: recortar um minuto de uma gravação de quatro gigabytes leva aproximadamente o mesmo tempo que gravar esse minuto no disco, porque os quadros são referenciados em vez de carregados. A escolha depende de onde começa cada trecho mantido. É disso que trata o restante desta página.

## Por que aparar não precisa perder qualidade nenhuma

Quando a seleção permite copiar, cada quadro mantido pode ficar exatamente como foi codificado. Transferir esses bytes evita decodificá-los e recodificá-los. Assim, esse método encurta o vídeo sem acrescentar outra etapa de codificação com perdas.

Quando a cópia pode preservar os tempos escolhidos, a ferramenta lê o índice do arquivo, identifica os quadros codificados necessários e grava esses bytes em um novo contêiner, com um novo índice antes deles. Nada é decodificado nesse processo.

Recodificar é útil quando a cópia não consegue preservar os tempos escolhidos de forma confiável. Em geral, demora mais porque o navegador precisa decodificar e codificar cada imagem mantida; na cópia, o principal limite é a velocidade de gravação do arquivo.

## Keyframes, e por que o seu corte pode cair antes

Aqui está a restrição da qual decorre tudo o que se refere a aparar.

Vídeo não é guardado como uma sequência de imagens completas. Isso seria enorme. A maioria dos quadros é guardada como uma descrição de como eles diferem dos vizinhos, o que significa que não dá para decodificar um sozinho, porque você precisa dos quadros em volta. Só um **keyframe** se sustenta sozinho como imagem completa, e os keyframes costumam ficar de um a dez segundos de distância um do outro.

Então, se você marca um corte dois segundos depois do último keyframe, um aparador que copia quadros não consegue começar ali. Os quadros no seu marcador são ilegíveis sem a sequência que leva até eles. Ele tem que carregar o trecho inteiro a partir do keyframe anterior ao seu marcador.

Para o primeiro trecho mantido, o formato pode indicar *comece a reproduzir neste ponto*: os quadros extras continuam no arquivo, com uma marca de edição que pede ao reprodutor para pulá-los. Os reprodutores que respeitam essa instrução começam na marcação. Um que a ignore também pode mostrar os quadros anteriores.

Quadros ocultos em uma emenda posterior podem fazer o navegador mostrar um trecho antes da hora, mesmo com uma lista de edição correta. Por isso, a ferramenta não permite copiar quando algum trecho depois do primeiro começa entre quadros-chave. Ela explica o motivo e deixa você escolher explicitamente o método que recodifica.

## Quando aceitar uma recodificação

“Cortar exatamente aqui” decodifica a partir do quadro-chave anterior, descarta os quadros fora dos trechos marcados e recodifica cada quadro mantido. Não se limita ao trecho inicial. Demora mais do que copiar e pode reduzir a qualidade da imagem em todo o vídeo mantido. O som é copiado quando o formato permite.

Escolha esse método quando a cópia estiver indisponível para sua seleção ou quando precisar que o resultado comece nos quadros mantidos sem depender de uma marca de edição inicial. Copiar continua sendo útil para um trecho ou para vários cujos inícios posteriores coincidam com quadros-chave, desde que o reprodutor de destino interprete corretamente a marca de edição inicial.

Você também pode mover o início de um trecho para um quadro-chave mostrado na linha do tempo. Isso pode liberar a cópia de um trecho posterior sem recodificar. Como muda quais imagens serão mantidas, faça essa escolha de acordo com o conteúdo de que precisa.

![O cartão de exportação: o método, um controle de qualidade, uma chave para o som e um resumo contando os pedaços, a duração e o tamanho.](https://abox.tools/screens/trim-a-video/summary.webp)

É no resumo que se toma a decisão desta seção: quanto a cópia vai custar, e quanto custaria recodificar no lugar dela.

## Tirando um pedaço do meio

Cortar um trecho fora é uma operação diferente de manter um trecho, e vale saber que é suportada, porque muitos aparadores só fazem a segunda. Marque a parte que você não quer, escolha tirá-la, e o que sobra dos dois lados é unido num só clipe com o som carregado junto e em sincronia.

A cópia pode unir os trechos restantes quando todos os posteriores ao primeiro recomeçam em um quadro-chave. Se um trecho posterior precisar de quadros ocultos antes do início, escolha “Cortar exatamente aqui”. A alternativa por gravação descrita abaixo não consegue unir trechos separados, porque grava uma única passagem contínua a partir de um só cursor de reprodução.

![A linha do tempo com dois trechos marcados, e embaixo uma tabela com início, fim e duração de cada um e o total mantido.](https://abox.tools/screens/trim-a-video/marks.webp)

Dois pedaços mantidos de um clipe só. A tabela é editável, então uma marca que caiu um quinto de segundo tarde se digita em vez de ser refeita.

## Formatos e a alternativa por gravação

**MP4, M4V e MOV** são lidos diretamente, seja qual for o codec lá dentro: H.264, HEVC, AV1, VP9. Copiar quadros não envolve decodificá-los, então esse caminho funciona até para um codec para o qual o seu navegador não tem decodificador nenhum, o que é uma consequência agradável de não olhar as imagens.

**Qualquer outra coisa que o seu navegador consiga tocar**, e aí o caso mais óbvio é o WebM, é aparada tocando o arquivo e gravando o resultado. Funciona, e tem dois custos: leva o mesmo tempo que o trecho dura, e a imagem e o som são codificados de novo.

**AVI, WMV, FLV e a maioria dos MKVs** o navegador não consegue nem ler nem tocar, e a ferramenta avisa isso em vez de falhar no meio do caminho. Converta esses para MP4 antes, com algo que dê conta deles.

## Duas coisas que dão errado em silêncio por aí

**Rotação.** Um celular filma deitado e escreve uma instrução de rotação no arquivo em vez de girar os pixels. Um aparador que copia quadros tem que carregar essa instrução adiante, senão o seu clipe em pé sai deitado, que é o jeito clássico de arruinar um vídeo aparado. O caminho exato daqui gira os quadros enquanto os recodifica e escreve um arquivo que não precisa de rotação nenhuma.

**Sincronia do áudio.** Áudio e vídeo são guardados como fluxos separados com temporização própria, e não são picotados nos mesmos pontos. Se os dois não forem alinhados de propósito no corte, o som vai derivando. No caminho de cópia daqui o áudio é copiado amostra por amostra sem ser decodificado, então sai byte a byte igual ao que estava no arquivo, e um marcador de edição o mantém em sincronia com a imagem dentro de um milésimo de segundo.

## Aparar não é cortar o enquadramento

São duas palavras que as pessoas usam uma pela outra. Aparar muda a duração do clipe, e cortar muda o formato da imagem. Se o que você quer é uma versão quadrada de um vídeo deitado, ou as tarjas pretas fora das laterais, isso é o [Cortador de vídeo](https://abox.tools/pt/cortar-video/), que, ao contrário do aparador, precisa recodificar, pelo motivo que [o guia dele](https://abox.tools/pt/guias/cortar-um-video/) explica.

## Por que isso não precisa de envio, e aqui menos ainda

Vídeo é o tipo de arquivo que as pessoas mais esperam ter que enviar, porque os arquivos são grandes e o trabalho soa pesado. Aparar é o caso em que isso é menos verdade: no caminho de cópia o arquivo mal chega a ser lido. A ferramenta percorre o índice, descobre quais faixas de bytes manter e as escreve. Enviar um arquivo de quatro gigabytes a um servidor para que ele faça isso seria a forma mais lenta possível de organizar a coisa.

É também o tipo de arquivo em que enviar custa mais caro para quem preferia não enviar, porque vídeo carrega rostos, vozes, casas e localizações de um jeito que um documento não carrega. A ferramenta daqui não tem função de rede de espécie alguma, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

Se você prefere conferir a acreditar, desligue a internet e apare um clipe assim mesmo. O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações do mesmo tipo.
