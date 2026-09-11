# Separador de GIF — cada quadro em um PNG

Cada quadro sai no próprio PNG.

> Separe um GIF animado nos quadros dele e salve cada um como PNG, de graça e inteiramente no navegador. A transparência e os tempos ficam preservados. Nada é enviado, e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/separar-gif-em-quadros/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem GIFs. Não existe servidor.

O GIF é lido, descompactado e desenhado pelo seu próprio navegador, e cada PNG é gerado na memória deste computador. Do outro lado desta página não existe servidor nenhum para receber uma animação, mesmo que algo aqui quisesse mandar.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como separar um GIF em quadros

1. **Escolha o GIF.** Arraste até o seletor ou procure na mão. O navegador lê direto do seu disco, e a página conta o que encontrou: o tamanho, quantos quadros tem, quanto tempo dura e quantas vezes se repete.
2. **Decida o que vai dentro de cada PNG.** **O quadro como ele aparece** é o que quase todo mundo quer: a imagem inteira naquele momento da animação. **Só os pixels que aquele quadro guarda** é o remendo que o arquivo carrega de verdade, no tamanho dele e no lugar dele, que é como um GIF continua pequeno e não é a cara da animação.
3. **Decida o que acontece com a transparência.** O PNG mantém, e essa é a escolha honesta. Preencha com uma cor se os quadros vão parar em algum lugar que ignora transparência e a deixaria preta.
4. **Escolha os quadros que você quer.** Todos, por padrão. “Ficar com um quadro a cada dois” enxuga uma gravação longa, e as caixinhas da grade passam por cima disso. A numeração nunca muda, então o quadro 42 continua se chamando quadro 42 por menos vizinhos dele que você tenha guardado.
5. **Baixe.** Um quadro por vez pela grade, ou todos de uma vez em um único ZIP, para dar uma pergunta de salvar em vez de centenas. O ZIP pode levar junto um `frames.txt` dizendo quanto tempo cada quadro ficou na tela, que é a única coisa que uma pasta de PNGs não sabe contar sozinha.

## A versão longa

[Como separar um GIF em quadros](https://abox.tools/pt/guias/separar-um-gif-em-quadros/): Tire cada quadro de um GIF animado em PNG: por que alguns quadros são só um pedacinho da imagem, o que acontece com a transparência, e como guardar os tempos para montar tudo de novo.

## Também na caixa

- [Analisador de GIF](https://abox.tools/pt/analisar-gif/): Quadros, tempos, paletas e para onde foi cada byte.
- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.
- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.
- [Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.

## Perguntas

### O meu GIF é enviado para algum lugar?

Não. O arquivo é lido, descompactado e desenhado pelo seu próprio navegador, no seu próprio hardware, e cada PNG é gerado aqui na memória. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar: nenhum é nosso. Tire da tomada e ela continua separando GIFs.

### Por que um quadro parece um pedacinho da imagem?

Porque é isso que o arquivo guarda. Um GIF é uma primeira imagem seguida de remendos: cada quadro seguinte guarda só o retângulo que mudou, e todo o resto da tela é o que os quadros anteriores deixaram ali. Uma cabeça falando na frente de uma parede parada guarda, portanto, um rosto por quadro em vez de uma imagem por quadro, e é justamente por isso que o formato não é enorme. \
\
Você está vendo isso porque está marcado “Só os pixels que aquele quadro guarda”. Mude para “O quadro como ele aparece” e cada PNG vira a imagem inteira, do jeito que a animação está naquele instante.

### A transparência é preservada?

É. A transparência de um GIF é um bit só, ou seja, um pixel está pintado ou está invisível, sem meio-termo, e o PNG guarda exatamente isso. Os quadros saem com as áreas transparentes intactas. Se você preferir um fundo sólido, ponha “Áreas transparentes” para preencher com uma cor. Ela é escrita no PNG e depois não sai mais.

### Por que os tempos dos quadros não são os números que eu esperava?

Um GIF guarda cada tempo em centésimos de segundo, e desde os anos 1990 os navegadores empurram qualquer valor abaixo de dois centésimos para um décimo de segundo. Essa regra foi escrita para os globos giratórios da época e nunca foi tirada. Um quadro cujo arquivo diz 0,01 s toca a 0,10 s em todo lugar. Esta ferramenta mostra o tempo do jeito que ele é tocado de verdade, e escreve ao lado o que o arquivo guarda quando os dois não batem.

### Dá para juntar os quadros de novo?

Dá, com o [Criador de GIF](https://abox.tools/pt/criar-gif/) deste site ou com qualquer outra coisa que aceite uma pasta de imagens. É para isso que serve o `frames.txt` do ZIP: separar uma animação joga fora os tempos, porque um PNG não tem onde anotar quanto tempo ficou na tela, e então a lista leva embora a duração e a posição de cada quadro.

### Em que formatos os quadros podem ser salvos?

Em PNG, e de propósito só em PNG. Um quadro de GIF tem no máximo 256 cores e um bit de transparência; o PNG guarda isso exatamente e sem perda, enquanto o JPEG jogaria a transparência fora, inventaria cores que o quadro nunca teve e, em arte chapada, normalmente geraria um arquivo *maior*. Se você precisa de JPEG, converta os PNGs depois com o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/).

### Tem limite de quantos quadros ele lê?

Limite fixo não tem. O teto de verdade é a memória do seu computador: um GIF se expande para mais ou menos um byte por pixel por quadro enquanto está sendo lido, então um arquivo pequeno pode virar muita memória, e esta página prefere parar de ler a deixar a aba morrer. Se isso acontecer, ela avisa e devolve os quadros que conseguiu.

### Ele abre um GIF estragado?

Quase sempre. Download cortado no meio, marca de fim ausente e um último quadro que para no meio do fluxo são coisas comuns, e um leitor que recusa tudo isso não serve justamente para os arquivos que as pessoas mais querem desmontar. Voltam todos os quadros que estiverem completos, com um aviso do que estava errado. Só é recusado de cara um arquivo que não é um GIF de jeito nenhum.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. Nos quadros também não tem marca d'água. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre os seus arquivos.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse a sua animação embora para ser processada pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **O seu GIF não tem para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde os seus arquivos pudessem parar, nem nada no código que os mandasse para lá se existisse. Isto já disse `connect-src 'none'`, que não abria exceção; a publicidade custou isso, e dizer isso faz parte do acordo.
- **O leitor de GIF são dois arquivos deste repositório.** O navegador toca um GIF, mas não entrega as partes dele, então o formato é lido aqui mesmo: `src/gif.js` é o contêiner e o descompactador LZW, e `src/compose.js` são as regras de descarte que decidem com o que cada quadro se parece depois que os anteriores ficam embaixo. Nada é buscado para abrir um arquivo, e não existe motor nenhum baixado no primeiro uso.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre a sua animação: nem o arquivo, nem um quadro, nem um nome, um tamanho ou uma contagem. Toda linha que lê, descompacta, desenha ou escreve uma imagem é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. Ele não é mais do que um link: não avisa ninguém da sua visita e não recebe nada sobre você nem sobre os seus arquivos. Nada acontece enquanto você não clicar, e o que você abriria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas: uma ferramenta que mandasse a sua animação embora para ser desmontada pararia no instante em que você tirasse da tomada.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/gif.js` para o leitor que descompacta os quadros e `src/compose.js` para as regras que deitam um quadro em cima do outro. Em nenhum dos dois existe uma linha capaz de alcançar a rede.
