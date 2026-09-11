# Aparar vídeo — cortar trechos de um vídeo online

Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.

> Assista a um vídeo e marque cada trecho que vale a pena enquanto ele toca, depois salve esses trechos como um arquivo só. Roda no navegador, não envia nada, não recodifica nada e funciona offline.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/aparar-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

Seu vídeo é lido, marcado, cortado e escrito pelo seu próprio navegador, no seu próprio hardware. Nada aqui consegue buscar nem mandar coisa alguma, porque não existe função de rede nenhuma nesta ferramenta. E do outro lado desta página não existe servidor nenhum para onde mandar um vídeo, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Quantos trechos você quiser
- ✓ Sem perda de qualidade
- ✓ Funciona offline

## Como aparar um vídeo

1. **Escolha um vídeo.** Arraste um MP4, MOV, M4V ou WebM até o seletor. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso. Arraste vários e eles são emendados, na ordem em que você colocou.
2. **Toque, e marque os trechos que você quer.** Aperte `I` onde um trecho deve começar e `O` onde ele deve terminar. Faça isso quantas vezes quiser: cada par vira uma linha na tabela de baixo e uma faixa na linha do tempo. O `U` desfaz o último, o `Espaço` toca e pausa, e as setas pulam cinco segundos por vez. Diminua a velocidade de reprodução se o momento for difícil de pegar.
3. **Acerte as marcações.** Cada linha pode ser reproduzida sozinha, retemporizada com um tempo exato digitado nela, movida para cima ou para baixo na ordem, ou apagada. As duas pontas do trecho selecionado também podem ser arrastadas ao longo da linha do tempo. O total lá em cima é o que o vídeo pronto vai durar.
4. **Fique com eles, ou tire-os fora.** Ficar é o sentido de sempre: o vídeo pronto são os trechos que você marcou, emendados em ordem. Tirar fora é o outro trabalho que as pessoas querem e raramente acham. Marque os comerciais, os silêncios ou as tentativas falhas, e o que sobra é emendado sem eles.
5. **Apare, e baixe.** O “Manter cada byte” move os quadros intocados. É rápido, e não tem como custar qualidade, mas cada trecho começa no keyframe anterior à sua marcação. Já o “Cortar exatamente aqui” decodifica e escreve a imagem de novo, para que cada trecho comece no quadro que você escolheu. A página diz qual dos dois você está prestes a receber, e o que isso custa, antes de você clicar no botão.

## A versão longa

[Como aparar um vídeo sem recodificá-lo](https://abox.tools/pt/guias/aparar-um-video/): Cortar um clipe não precisa perder um único byte de qualidade. Por que um corte às vezes cai antes de onde você marcou, o que um keyframe tem a ver com isso, e quando aceitar uma recodificação.

## Também na caixa

- [Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.
- [Inversor de vídeo](https://abox.tools/pt/inverter-video/): O último quadro primeiro, com som e tudo.
- [Criador de timelapse](https://abox.tools/pt/fazer-timelapse/): Uma hora de gravação em vinte segundos.
- [Extrator de quadro](https://abox.tools/pt/extrair-quadro-de-video/): Uma imagem em qualidade cheia, de qualquer ponto.

## Perguntas

### Meu vídeo é enviado para algum lugar?

Não. Quem lê, marca, corta e escreve é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. Se você prefere conferir a acreditar, desligue a internet e apare um vídeo assim mesmo.

### Posso ficar com vários trechos do mesmo vídeo?

É exatamente para isso que isto serve. Aperte `I` e `O` quantas vezes quiser enquanto ele toca; cada par vira uma linha, e o vídeo pronto é cada linha emendada em ordem, com todo o resto fora. A maioria dos aparadores online entrega um par de alças e pergunta qual trecho único você quer manter, o que serve para aparar a ponta de um clipe e não serve de nada para assistir a uma hora de gravação uma vez só e ficar com os seis momentos que prestam.

### Aparar perde qualidade?

No caminho normal não, e não do jeito que importa. Aparar não muda a aparência de quadro nenhum, então os quadros são movidos para o arquivo novo exatamente como estavam: os mesmos bytes, os mesmos ajustes de codificador, tudo igual. O único caminho daqui que recodifica alguma coisa é o corte exato, e ele avisa isso no próprio botão.

### Por que um trecho começa antes de onde eu marquei?

Por causa de como o vídeo é guardado, e só em reprodutores que ignoram uma parte padronizada do formato. A maioria dos quadros é guardada como uma descrição de como eles diferem dos vizinhos, então não dá para decodificar um sem os outros. Só um keyframe se sustenta sozinho, e os keyframes costumam ficar de um a dez segundos de distância. Um corte que copia quadros precisa, portanto, carregar a sequência a partir do keyframe anterior à sua marcação, e o arquivo diz *comece a tocar na sua marcação*, o que todo reprodutor mais usado respeita. Se você precisa que seja exato em todo reprodutor, escolha “Cortar exatamente aqui”, que recodifica. A página avisa em qual caso você está, e por quanto, antes de exportar.

### Posso tirar os comerciais em vez disso?

Pode. Marque-os e escolha “Tirar fora”: tudo o que você *não* marcou é emendado, em ordem. A mesma lista de marcações responde às duas perguntas, então dá para alternar entre elas e ver a duração mudar sem marcar nada duas vezes.

### Posso salvar minhas marcações e voltar a elas depois?

Pode. O “Salvar marcações” escreve um arquivo de texto puro, com uma linha por trecho e um início e um fim separados por vírgula, e o “Carregar marcações” lê um de volta. São oferecidos dois formatos, segundos simples e `HH:MM:SS.mmm`, e os dois seguem o mesmo desenho que outras ferramentas do gênero já usam. Um arquivo escrito aqui pode ser entregue a uma delas, e um arquivo escrito lá pode ser jogado nesta página. Marcar é trabalho cuidadoso e ninguém deveria ter que fazer duas vezes.

### Quais formatos de vídeo posso aparar?

MP4, M4V e MOV são lidos diretamente, seja lá o que houver dentro deles: H.264, HEVC, AV1 ou VP9. Copiar quadros não envolve decodificá-los, então esse caminho funciona até para um codec para o qual o seu navegador não tem decodificador nenhum. Qualquer outra coisa que o seu navegador consiga tocar, e aí o caso mais óbvio é o WebM, é aparada tocando o arquivo e gravando o resultado, o que funciona, leva o mesmo tempo que o resultado dura e só consegue manter um trecho. Um arquivo que o navegador não consegue nem ler nem tocar, o que na prática significa AVI, WMV, FLV e a maioria dos MKVs, é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Existe limite de tamanho ou de duração do vídeo?

A ferramenta não tem limite embutido, e no caminho de cópia o arquivo mal chega a ser lido: os quadros que você mantém são apontados em vez de carregados, então ficar com quatro minutos de uma gravação de quatro gigabytes custa mais ou menos o que custa escrever esses quatro minutos no disco. O corte exato percorre o arquivo em fatias de alguns megabytes. De todo jeito, o teto prático é o arquivo pronto, que é montado na memória antes de você baixar.

### O som sobrevive?

Nos dois caminhos de MP4 ele é copiado amostra por amostra sem nunca ser decodificado, então sai byte a byte igual ao que estava no arquivo, e um marcador de edição mantém cada trecho alinhado com a imagem dele dentro de um milésimo de segundo. A única exceção é emendar vídeos separados cujo som é descrito de formas diferentes, com taxas de amostragem diferentes, por exemplo. Aí não tem como pôr os dois numa trilha só sem decodificá-los, e a página avisa antes de fazer. No caminho da gravação, ele é capturado da reprodução e codificado de novo. De qualquer jeito, existe uma caixinha para deixá-lo de fora por completo.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre o seu vídeo.

## Como dá para conferir a promessa de privacidade

- **Seus vídeos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Esta ferramenta não tem função de rede nenhuma: nenhum endereço para colar, nada para baixar, nenhum motor buscado no primeiro uso. Cada byte que encosta no seu vídeo veio desta origem quando a página carregou.
- **No caminho normal, nada chega sequer a ser decodificado.** Aparar não muda a aparência de quadro nenhum, então os quadros codificados dos trechos que você marcou são movidos para o arquivo novo exatamente como foram encontrados. Cada um fica guardado como uma fatia do arquivo no seu disco, ou seja, uma anotação dizendo quais bytes, e não os bytes em si. O seu navegador só os lê pela primeira vez na hora de escrever o download. Nada aqui transforma o seu vídeo de volta em imagem.
- **O arquivo de marcações é feito na página.** Salvar as suas marcações escreve um arquivo de texto a partir dos números que já estão na tela, direto para os seus downloads. Carregar um lê o arquivo aqui mesmo. Nenhum dos dois chega perto de uma rede, e nenhum dos dois carrega nada além de tempos.
- **O som é copiado, não escutado.** Nos dois caminhos de MP4, as amostras de áudio são movidas sem serem decodificadas. Nada aqui as transforma de volta em som, e nada conseguiria passá-las a lugar nenhum se transformasse.
- **Onde quadros são decodificados, isso acontece aqui.** O corte exato, e a pré-visualização de um arquivo que este navegador não toca, passam pelo WebCodecs no seu próprio computador. É o mesmo decodificador que exibiria o vídeo para você de qualquer jeito, rodando no mesmo lugar.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu vídeo: nem um arquivo, nem um quadro, nem um nome, um tamanho, uma duração ou onde você cortou. Toda linha que lê, corta e escreve é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre o seu vídeo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/segments.js` para as marcações e o arquivo em que elas são salvas, `src/shared/mp4-reader.js` para o leitor que acha os quadros num MP4, `src/ranges.js` para a aritmética que transforma uma marcação numa sequência de amostras, e `src/copy.js` para o laço que move essas amostras para o arquivo novo. Nenhum deles importa qualquer coisa que consiga fazer uma requisição.
