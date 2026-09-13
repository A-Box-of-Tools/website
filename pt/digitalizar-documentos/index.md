# Digitalizador de documentos — a foto de uma página, endireitada

Fotografe a página. Você recebe de volta algo com cara de digitalização.

> Transforme a foto de uma página feita no celular num PDF endireitado e com luz uniforme. Os cantos são encontrados para você, a perspectiva é desfeita, a sombra é dividida para fora. Roda inteiramente no seu navegador: nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/digitalizar-documentos/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem documentos. Não existe servidor.

A foto é decodificada, endireitada, limpa e escrita num PDF pelo seu próprio navegador, usando apenas aritmética e os codecs que ele já traz. Esta ferramenta não tem função de rede alguma — nada a buscar, nada a enviar — e o motivo pelo qual isso importa aqui é do que as pessoas fotografam páginas: um passaporte, um holerite, um contrato de aluguel, um formulário que uma repartição pediu para “digitalizar e devolver”.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca-d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como digitalizar um documento com a câmera do celular

1. **Fotografe a página.** De cima, com a página inteira no enquadramento e os quatro cantos visíveis ou quase. Não precisa ser de frente e não precisa ter luz uniforme: a inclinação e a sombra são o motivo pelo qual esta ferramenta existe. O que importa é preencher o enquadramento — uma página fotografada do outro lado da sala não tem detalhe algum a recuperar.
2. **Confira os quatro cantos.** Eles são encontrados para você quando a foto é lida, e a página avisa quando não tem certeza — uma página sobre uma mesa da mesma cor do papel tem mesmo uma borda difícil de enxergar. Toque em qualquer ponto da foto e o canto mais próximo vem até o seu dedo, ou alcance um com `Tab` e mova-o com as setas.
3. **Escolha o que fazer com a luz.** “Cor, uniformizada” mede o papel ao longo da página e o divide para fora, de modo que a sombra some e um carimbo ou uma assinatura guardam a sua cor. “Preto e branco” vai além e é o que deixa uma digitalização pequena o bastante para caber num e-mail. O que você vê na tela é o resultado verdadeiro, produzido pelo mesmo código que escreve o arquivo.
4. **Acrescente as outras páginas.** Cada foto que você acrescenta vira mais uma página do mesmo documento, na ordem em que estão listadas, e cada uma guarda os seus próprios cantos. As setas numa página da tira a movem para antes ou para depois.
5. **Salve o PDF, e abra antes de mandar.** O documento é montado aqui, na memória desta página. Nada foi enviado para fazê-lo, e nada sobre ele foi relatado em lugar nenhum.

## A versão longa

[Como digitalizar um documento com o celular](https://abox.tools/pt/guias/digitalizar-um-documento-com-o-celular/): O que separa a fotografia de uma página de uma digitalização dela: a inclinação, a luz irregular e o tamanho do arquivo. Como tirar a foto, o que corrigir depois, e por que nada disso precisa de servidor.

## Também na caixa

- [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.
- [Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.
- [Editor de áudio](https://abox.tools/pt/editar-audio/): Toque de trás para a frente, mude a velocidade, levante uma gravação baixa. Tudo aqui, no seu computador.
- [Juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/): Páginas trocadas de lugar sem ida e volta a um servidor.

## Perguntas

### O meu documento é enviado para algum lugar?

Não. A foto é decodificada, endireitada, limpa e escrita num PDF pelo seu próprio navegador no seu próprio hardware. Esta ferramenta não tem função de rede alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles pertence a este site. Carregue a página uma vez, tire o cabo da internet, e ela continua funcionando.

### Como ele encontra os cantos da página sem modelo?

Procurando as quatro bordas retas e longas de que um retângulo é feito. A foto é reduzida, tira-se o gradiente — onde a imagem muda, e em que direção — e cada pixel que está sobre uma borda vota na linha reta em que estaria. As linhas fortes são emparelhadas em retângulos candidatos, e cada candidato recebe uma nota percorrendo os seus quatro lados e perguntando quanto de cada um tem mesmo uma borda embaixo, e se os quatro juntos são o contorno de uma coisa só: uma página é mais clara do que o que está em volta, ou mais escura, mas do mesmo jeito nos quatro lados, e é isso que impede que uma linha de texto seja confundida com o pé da página. Não há pesos, nada é baixado, e a aritmética é a mesma aritmética para qualquer documento que passe por ela.

### Os cantos que ele encontrou estão errados. E agora?

Arraste-os. Os cantos são uma posição de partida e nunca uma decisão: a digitalização é tirada de onde os quatro terminarem. Toque em qualquer ponto da foto e o canto mais próximo salta para o seu dedo, o que é mais fácil do que acertar uma alça pequena, e as setas movem o canto em foco um pixel por vez. A página também avisa quando os cantos são um palpite e não um achado, e marca aquela página na tira — uma página apoiada numa mesa mais ou menos da mesma cor é o motivo de sempre, porque ali realmente quase não há borda a encontrar.

### Por que a página endireitada sai na forma certa, e não achatada?

Porque a forma é recuperada da perspectiva em vez de medida nas bordas. Uma página fotografada de viés tem a borda distante encurtada, então o método óbvio — pegar o par de bordas opostas mais longo e chamar aquilo de proporção — produz um A4 visivelmente atarracado, que é o que a maioria dos digitalizadores da web entrega. A fotografia de um retângulo carrega, na verdade, informação suficiente para recuperar tanto a proporção do retângulo quanto a distância focal da câmera, bastando que a câmera seja uma comum; isso é um resultado de Zhang e He de 2003, e é o que `src/geometry.js` faz. Onde a foto foi tirada de frente não há perspectiva de onde partir e nem é preciso, porque então as bordas são exatas — então ele recorre a elas, e a página diz qual das duas respondeu.

### O que a “limpeza” faz de fato com a imagem?

Ela divide a luz para fora. O brilho próprio do papel é medido ao longo da página — uma grade de quadradinhos, e em cada quadradinho um percentil alto do brilho, que o texto é escuro e esparso demais para deslocar — e cada pixel é dividido pelo papel estimado naquele ponto. O que sobra é a tinta, com luz uniforme, sem a sombra e sem a queda de luz. Isso não é a mesma coisa que aumentar o contraste: aumentar o contraste de uma página fotografada deixa a parte clara branca, a parte escura preta e o que está escrito na parte escura ilegível, e é por isso que os “níveis automáticos” pioram essas imagens em vez de melhorá-las.

### Por que o modo preto e branco é tão menor?

Porque uma imagem com duas cores é mesmo uma fração dos dados de uma imagem com dezesseis milhões, e aqui ela é guardada assim: um bit por pixel, empacotados oito por byte e comprimidos de forma exata, e não como o JPEG de uma imagem em preto e branco. Nas mesmas páginas ele sai cerca de dezoito vezes menor do que o modo em cores, então um contrato de vinte páginas fica abaixo de um megabyte em vez de chegar a uns quinze. O limiar é o de Sauvola, que decide cada pixel contra a média e a dispersão da sua própria vizinhança em vez de contra um número único para a página inteira — e é isso que mantém legível o que está escrito dentro de uma sombra. Ele não tem meios-tons, então uma página com uma fotografia deve usar um dos outros modos.

### Posso pôr várias páginas num só PDF?

Sim. Cada foto que você acrescenta vira mais uma página, na ordem em que estão listadas, e cada página guarda os seus próprios cantos — então uma pilha de páginas fotografadas uma depois da outra vira um documento só. As setas em cada página da tira a movem para antes ou para depois. O ajuste de limpeza é compartilhado por todas de propósito: páginas de um mesmo documento limpas de formas diferentes parecem dois documentos.

### Ele lê o texto, para eu poder pesquisar dentro do PDF?

Não. Não há camada de texto e não há reconhecimento de caracteres: o que sai é a imagem da página numa página. Fazer isso direito significaria um motor de OCR, que são dezenas de megabytes de modelo para baixar — e um digitalizador de documentos que buscasse um modelo antes de conseguir ler o seu holerite seria um digitalizador de documentos com um motivo para telefonar para casa a respeito de holerites. Se você precisa do texto, o modo preto e branco produz exatamente o tipo de arquivo com que os programas de OCR na sua própria máquina trabalham melhor.

### Saiu borrada. Por quê?

Quase sempre porque a página estava pequena na foto. O painel abaixo da prévia diz quanto do enquadramento a página preencheu e mais ou menos a quantos pontos por polegada isso corresponde numa folha daquele tamanho — abaixo de uns 150 DPI uma digitalização impressa fica mole, e não há ferramenta que dê jeito num detalhe que nunca esteve no arquivo. Chegue mais perto em vez de dar zoom, fique parado, e deixe a câmera focar a página antes de apertar o botão. O tremido é a outra causa, e também não se recupera.

### É grátis, e eu preciso de conta?

É grátis, e não há conta, nem login, nem teste, nem limite de páginas, nem marca-d'água. Também não há limite para o tamanho das fotos, porque não há um servidor pagando por isso — o trabalho acontece na sua própria máquina. O site exibe publicidade, e é ela que o paga; os anunciantes não recebem nada sobre os seus documentos.

## Como dá para conferir a promessa de privacidade

- **Os seus documentos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles pertence a este site. Não existe aqui um endpoint onde as suas fotos pudessem ser recolhidas, e não existe no código nada que as enviasse se existisse.
- **Não há modelo algum, então não há o que baixar nem o que perguntar.** Encontrar os quatro cantos de uma página é feito com aritmética: o gradiente da imagem, um voto para as linhas retas nela, e uma conferência do que está de fato embaixo de cada lado do retângulo vencedor. Sem pesos, sem runtime de inferência, sem nada buscado no primeiro uso, e sem nada que se comporte de um jeito no documento de outra pessoa e de outro no seu — veja `src/detect.js`.
- **O documento não carrega data, nem autor, nem nome de máquina.** Uma digitalização é algo que as pessoas mandam para outras pessoas, geralmente porque uma repartição pediu. A única coisa escrita no PDF além das próprias páginas é o nome desta ferramenta, e um título se você digitar um. Não há data de criação, não há autor, não há número de série e não há nada derivado do seu relógio, dos seus nomes de arquivo ou do seu computador — veja `src/document.js`.
- **Aqui nada busca nada.** Não há `fetch`, não há `XMLHttpRequest` e não há `sendBeacon` em lugar algum de `src/`. O trabalho é `getImageData`, alguns laços sobre os bytes e o codificador JPEG do próprio navegador — tudo já instalado na sua máquina.
- **Funciona offline.** Desconecte da rede e a ferramenta continua a mesma, porque nunca houve um passo de rede nela. É a prova mais simples de todas — e a que vale a pena fazer antes de digitalizar um passaporte.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/detect.js` para como os cantos são encontrados sem modelo algum, `src/warp.js` para o endireitamento, e `src/clean.js` para como a luz irregular é dividida para fora.
