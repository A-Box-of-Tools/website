# Cortar áudio — aparar gravações online

Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.

> Toque uma gravação e marque cada trecho que vale a pena enquanto ele passa, depois salve esses trechos num arquivo só. Cortes exatos na amostra, sem estalo nas emendas, nada enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/cortar-audio/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem gravações. Não existe servidor.

A sua gravação é lida, marcada, cortada e escrita pelo seu próprio navegador, no seu próprio hardware. Aqui nada consegue buscar nem mandar coisa alguma, porque esta ferramenta não tem função de rede nenhuma. E mesmo que tivesse, do outro lado desta página não existe servidor para receber uma gravação.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Quantos trechos você quiser
- ✓ Corta exatamente onde você marcou
- ✓ Funciona offline

## Como cortar um arquivo de áudio

1. **Escolha uma gravação.** Arraste um arquivo MP3, WAV, FLAC, M4A, Ogg ou Opus até o seletor, ou um vídeo, se o que você quer é um pedaço do som dele. O navegador lê direto do seu disco e desenha como forma de onda; nesse meio-tempo nada sai daqui.
2. **Toque e marque os trechos que você quer.** Aperte `I` onde um trecho deve começar e `O` onde ele deve terminar. Faça isso quantas vezes quiser: cada par vira uma linha na tabela de baixo e uma faixa na forma de onda. `U` desfaz a última, `Espaço` toca e pausa, as setas pulam cinco segundos, e com `Shift` andam dez milissegundos. Diminua a velocidade se o momento for difícil de pegar.
3. **Ajeite as marcas.** Cada linha pode ser tocada sozinha, ajustada digitando um tempo exato nela, movida para cima ou para baixo na ordem, ou apagada. As duas pontas do trecho selecionado também podem ser arrastadas pela forma de onda, que é o jeito mais rápido de pôr uma marca no silêncio em vez de pôr na respiração antes dele. O total lá em cima é o que a gravação pronta vai durar.
4. **Fique com eles, ou tire eles fora.** Ficar é o jeito de sempre: a gravação pronta são os trechos que você marcou, emendados na ordem. Tirar fora é o outro trabalho que as pessoas querem e raramente encontram: marque os “éééé”, o telefone tocando ou as saídas em falso, e o que sobra é emendado sem eles.
5. **Corte e baixe.** Todo corte cai na amostra que você marcou; aqui não existe arredondamento para quadro-chave nenhum, porque som não tem. A única coisa que vale escolher é quanto fade pôr em cada emenda: cinco milissegundos bastam para evitar um estalo e são curtos demais para se ouvir como fade. O que sai é um WAV, tocado primeiro na página e depois entregue direto para os downloads do seu navegador.

## A versão longa

[Como cortar áudio sem perder qualidade](https://abox.tools/pt/guias/cortar-um-arquivo-de-audio/): Onde um corte de áudio cai de verdade, por que ele pode ser exato quando o de vídeo não pode, por que uma emenda às vezes estala, e o que uma queda de cinco milissegundos está realmente fazendo.

## Também na caixa

- [Editor de áudio](https://abox.tools/pt/editar-audio/): Toque de trás para a frente, mude a velocidade, levante uma gravação baixa. Tudo aqui, no seu computador.
- [Juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/): Páginas trocadas de lugar sem ida e volta a um servidor.
- [Compressor de PDF](https://abox.tools/pt/comprimir-pdf/): Encolha um documento sem mandá-lo para lugar nenhum.
- [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/): As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.

## Perguntas

### O meu áudio é enviado para algum lugar?

Não. Ele é lido, marcado, cortado e escrito pelo seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar: nenhum é nosso. Se você prefere conferir a acreditar, desligue a internet e corte uma gravação assim mesmo.

### Dá para ficar com vários trechos da mesma gravação?

É exatamente para isso que serve. Aperte `I` e `O` quantas vezes quiser enquanto toca; cada par vira uma linha, e o arquivo pronto são todas as linhas emendadas na ordem, com todo o resto fora. A maioria dos cortadores online te dá um par de alças e pergunta qual único pedaço você quer manter, o que serve para aparar a ponta de uma vinheta e não serve para nada quando você quer ouvir uma hora de entrevista uma vez só e ficar com as seis respostas que prestam.

### O corte cai exatamente onde eu marquei?

Cai, em todo trecho e em qualquer player. Este é o único lugar em que áudio é mais simples do que vídeo: uma gravação decodificada é uma sequência de números e cada um se vira sozinho, então não existe equivalente de quadro-chave para arredondar, nem motivo para um corte começar adiantado. A página mostra o número da amostra em que o resultado começa, que é a marca que você fez multiplicada pela taxa de amostragem e arredondada para a amostra inteira mais próxima.

### Por que uma emenda estalaria, e para que serve o fade?

Porque cortar do meio de uma palavra para o meio de outra põe duas formas de onda sem relação uma do lado da outra, e um alto-falante obrigado a pular entre elas dá um estalo. Não é defeito do corte: é assim que uma descontinuidade soa. O jeito é um fade de poucos milissegundos dos dois lados de cada emenda: longo o bastante para o cone chegar lá, curto demais para se ouvir como fade. Cinco milissegundos é o padrão e dá para desligar. O fade só é posto numa borda que seja mesmo um corte, então uma borda bem no começo ou no fim da gravação fica exatamente como estava.

### Dá para tirar os pedaços ruins em vez de ficar com eles?

Dá. Marque eles e escolha “Tirar fora”: tudo o que você *não* marcou é emendado no lugar, na ordem. A mesma lista de marcas responde às duas perguntas, então você pode alternar e ver a duração mudar sem marcar nada duas vezes.

### Dá para salvar as minhas marcas e voltar a elas depois?

Dá. “Salvar marcas” escreve um arquivo de texto simples, uma linha por trecho, com começo e fim separados por vírgula, e “Carregar marcas” lê um de volta. São oferecidos dois formatos, segundos puros e `HH:MM:SS.mmm`, e os dois são o mesmo layout que o cortador de vídeo deste site escreve, então um arquivo feito em cima do vídeo pode ser solto no áudio dele e vice-versa. Marcar é trabalho caprichado e ninguém deveria ter que fazer duas vezes.

### Quais formatos dá para abrir?

O que o seu navegador decodificar, o que na prática quer dizer MP3, WAV, FLAC, M4A e AAC, Ogg Vorbis e Opus, e o áudio dentro de vídeos MP4, M4V, MOV e WebM. O que fica de fora é a mesma listinha de sempre: AVI, WMA e a maioria dos MKV. Um arquivo que este navegador não lê é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Por que ele salva WAV e não MP3?

Porque nenhum navegador traz um codificador de MP3, e esta ferramenta se recusa a mandar a sua gravação para um servidor que tenha um. Um WAV não precisa de codificador nenhum, são as amostras com um cabeçalho curto na frente, então ele é ao mesmo tempo a opção honesta e a única que não pode custar qualidade na saída. É maior: uns dez megabytes por minuto em estéreo. Todo player, celular e editor abre um, e o que precisar de MP3 consegue fazer um a partir dele. Cortar um MP3 copiando os quadros dele manteria o arquivo pequeno, mas também moveria cada corte para a fronteira de quadro mais próxima, que é justamente o arredondamento que esta ferramenta existe para não fazer.

### Tem limite de duração da gravação?

Não tem limite embutido na ferramenta. O teto de verdade é a memória: a gravação inteira é decodificada nesta página de uma vez, e o WAV é montado na memória antes de você baixar, então uma hora em estéreo precisa de pouco menos de um gigabyte para trabalhar. Um WAV de quatro gigabytes é recusado de cara, porque o próprio campo de tamanho do formato não consegue descrever um.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre a sua gravação.

## Como dá para conferir a promessa de privacidade

- **As suas gravações não têm para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde o seu arquivo pudesse parar, nem nada no código que o mandasse para lá se existisse.
- **Aqui nada busca nada.** Esta ferramenta não tem função de rede nenhuma: não tem endereço para colar, não tem nada para baixar, não tem motor nenhum baixado no primeiro uso. Cada byte que encosta no seu áudio veio desta origem quando a página carregou.
- **O decodificador é o que já vem no seu navegador.** O arquivo é entregue ao `decodeAudioData`, o mesmo código que toca uma faixa num elemento `<audio>`. Nada é entregue aqui para ler o seu formato, e nada fora desta página é consultado para ler também.
- **A imagem de um vídeo nunca chega a ser decodificada.** Quando você solta um vídeo aqui, só a trilha de áudio dele é pedida. Os quadros não são lidos, nem decodificados, nem desenhados, nem olhados: não existe código nesta página que pudesse, e o arquivo que sai tem som e mais nada.
- **O corte é uma cópia, na memória, neste computador.** Cortar é um `set` por trecho e por canal: as amostras que você guardou são movidas para um novo vetor, na ordem em que você as pôs. As únicas amostras multiplicadas por alguma coisa são as poucas centenas dentro de cada fade, e a página diz quantas são antes de você apertar o botão.
- **As amostras são escritas, não codificadas de novo.** Um WAV são as amostras que esta página tem em mãos com um cabeçalho na frente. Não existe codificador nenhum no meio do caminho tomando decisões sobre a sua gravação, nem nada que se pudesse chamar de envio para isso acontecer.
- **O arquivo de marcas é feito na própria página.** Salvar as suas marcas escreve um arquivo de texto a partir dos números que já estão na tela, direto para os seus downloads. Carregar um lê ele aqui. Nem um nem outro chega perto de uma rede, e nenhum dos dois leva nada além de tempos.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre a sua gravação: nem arquivo, nem amostra, nem nome, tamanho, duração, nem onde você cortou. Toda linha que lê, corta e escreve é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. Ele não é mais do que um link: não avisa ninguém da sua visita e não recebe nada sobre você nem sobre a sua gravação.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/segments.js` para as marcas e o arquivo em que elas são salvas, `src/shared/audio-decode.js` para as vinte linhas que entregam o seu arquivo ao decodificador do próprio navegador, `src/trim.js` para a conta que transforma uma marca numa sequência de amostras e para o laço que as copia, e `src/shared/wav.js` para o cabeçalho que vai na frente delas. Nenhum deles importa nada capaz de fazer uma requisição.
