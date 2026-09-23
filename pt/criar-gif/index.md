# Criar GIF — imagens viram GIF animado

Transforme um punhado de imagens em uma animação só.

> Transforme imagens JPG, PNG ou WebP em um GIF animado, de graça e inteiramente no navegador. A ordem, a velocidade e o tamanho são você que decide. Nada é enviado, e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/criar-gif/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem imagens. Não existe servidor.

Cada quadro é desenhado, quantizado e comprimido pelo seu próprio navegador, e o GIF pronto é montado na memória deste computador. Do outro lado desta página não existe servidor nenhum para receber uma imagem, mesmo que algo aqui quisesse mandar.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como fazer um GIF com imagens

1. **Escolha as suas imagens.** Arraste uma pasta até o seletor, ou escolha os arquivos na mão. O navegador lê direto do seu disco, e nesse meio-tempo nada sai daqui.
2. **Ponha na ordem em que devem passar.** Arraste pela alça, ou use as setas. “Ordenar por nome” conta do jeito que você espera, então `frame_2` vem antes de `frame_10`.
3. **Diga quanto tempo cada quadro fica.** Meio segundo cada um é apresentação de slides; um vinte avos é animação. Dê o mesmo tempo para todos de uma vez, ou deixe um deles demorar mais.
4. **Escolha um tamanho, e como as cores são escolhidas.** Um GIF cresce com a área e com a quantidade de quadros, e não existe controle de qualidade para trazer isso de volta para baixo, então o tamanho é o ajuste que mais importa. 256 cores por quadro é o padrão e o que fica melhor; uma paleta compartilhada sai menor e mais estável.
5. **Faça o GIF e baixe.** Ele é montado no seu próprio hardware, então o tempo depende do seu computador e não de uma fila. A animação pronta toca na página antes de você salvar.

## A versão longa

[Como fazer um GIF animado com imagens](https://abox.tools/pt/guias/fazer-um-gif-com-imagens/): Transforme um conjunto de fotos num GIF animado: a que velocidade um GIF realmente toca, o que a opção de paleta muda, e as três coisas que de fato deixam o arquivo menor.

## Também na caixa

- [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/): Cada quadro sai no próprio PNG.
- [Analisador de GIF](https://abox.tools/pt/analisar-gif/): Quadros, tempos, paletas e para onde foi cada byte.
- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.
- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.

## Perguntas

### As minhas imagens são enviadas para algum lugar?

Não. As suas imagens são lidas, desenhadas, quantizadas e comprimidas pelo seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar: nenhum é nosso. Tire da tomada e ela continua fazendo GIF.

### Quais formatos de imagem dá para usar?

Qualquer formato de imagem parada que o seu navegador saiba decodificar, o que na prática quer dizer JPG, PNG, WebP, GIF, AVIF e, em aparelhos da Apple, HEIC. Aqui não existe uma lista separada para manter atualizada, porque decodificar é trabalho do navegador e não nosso.

### Por que o meu GIF ficou tão grande?

Porque um GIF guarda cada quadro como pixels inteiros. Não tem compensação de movimento, nada é guardado como “igual da vez passada, só que deslocado”, e não tem botão de qualidade: o tamanho é mais ou menos a área vezes a quantidade de quadros, e só três coisas fazem ele baixar. \
\
Deixe menor: cortar o tamanho pela metade deixa o arquivo em um quarto. Use menos quadros, ou segure cada um por mais tempo. Desça para 64 ou 32 cores e desligue o dithering, que em arte chapada custa menos do que parece e em fotografia custa muito. Se mesmo assim não couber, a resposta honesta é que o que você está fazendo é um vídeo, e um MP4 disso vai ter talvez um décimo do tamanho.

### Quão rápido um GIF pode tocar?

Não tão rápido quanto o número sugere. O formato guarda a duração de cada quadro em centésimos de segundo, e desde os anos 1990 os navegadores empurram qualquer valor abaixo de dois centésimos para um décimo de segundo. Essa regra foi escrita para os globos giratórios da época e nunca foi tirada. Então uma duração de 0,01 s não toca a 100 quadros por segundo; toca a 10. É por isso que esta ferramenta não oferece nada abaixo de 0,02 s, e 0,05 s (20 quadros por segundo) é mais ou menos o mais rápido que vale a pena pedir.

### O que o ajuste de paleta muda?

Um quadro de GIF guarda no máximo 256 cores, e alguém precisa escolher quais. \
\
**As melhores cores para cada quadro** escolhe 256 para cada imagem separadamente, o que fica mais nítido e é a resposta certa para um conjunto de fotografias sem relação entre si. **Uma paleta para o GIF inteiro** monta uma tabela só a partir de todos os quadros de uma vez. Gera um arquivo menor e acaba com aquele piscar que aparece quando a paleta pula de um quadro para outro dentro da mesma cena, então é o que se escolhe quando os quadros são uma sequência e não uma coleção.

### Dá para manter o fundo transparente?

Dá, se as suas imagens tiverem: mude “Transparência” para “Manter as áreas transparentes”. Uma coisa para saber antes. A transparência de um GIF é um bit só, um pixel está invisível ou pintado por completo, sem meio-termo, então bordas suavizadas, sombras macias e tudo o que se esvai ganham uma borda dura no lugar. Se a sua animação vai para um fundo cuja cor você conhece, achatar em cima dessa cor vai ficar melhor.

### Tem limite de quantas imagens dá para usar?

Não tem limite embutido na ferramenta. O teto de verdade é a memória do seu computador e a sua paciência com o arquivo que sai: as imagens são lidas uma de cada vez, então cem quadros vai tranquilo, mas cem quadros a 640 px também é um GIF enorme. Veja acima, “Por que o meu GIF ficou tão grande?”.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. No resultado também não tem marca d'água. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre as suas imagens.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas imagens embora para serem processadas pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **As suas imagens não têm para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde os seus arquivos pudessem parar, nem nada no código que os mandasse para lá se existisse. Isto já disse `connect-src 'none'`, que não abria exceção; a publicidade custou isso, e dizer isso faz parte do acordo.
- **O codificador são quatro arquivos deste repositório.** Um GIF precisa de um quantizador de cores e de um compressor LZW, e o navegador não traz nenhum dos dois, então os dois estão escritos aqui, em `src/quantize.js` e `src/lzw.js`, com o contêiner em `src/gif.js`. Não se busca nada para fazer um, e não existe motor nenhum baixado no primeiro uso.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre as suas imagens: nem arquivo, nem miniatura, nem nome, tamanho ou contagem. Toda linha que lê, decodifica, desenha ou comprime uma imagem é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. Ele não é mais do que um link: não avisa ninguém da sua visita e não recebe nada sobre você nem sobre as suas imagens. Nada acontece enquanto você não clicar, e o que você abriria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas: uma ferramenta que mandasse as suas imagens embora para virarem GIF pararia no instante em que você tirasse da tomada.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/quantize.js` para a paleta a que cada quadro é reduzido, e `src/lzw.js` junto com `src/gif.js` para o compressor e o arquivo em que ele escreve. Em nenhum deles existe uma linha capaz de alcançar a rede.
