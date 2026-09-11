# Editor de áudio — inverter, mudar a velocidade ou aumentar o volume

Toque de trás para a frente, mude a velocidade, levante uma gravação baixa. Tudo aqui, no seu computador.

> Toque uma faixa de trás para a frente, acelere ou desacelere, e deixe uma gravação baixa mais alta. Também tira o som de dentro de um vídeo. Roda no navegador e não envia nada.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/editar-audio/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem gravações. Não existe servidor.

Seu arquivo é lido, editado e escrito pelo seu próprio navegador, no seu próprio hardware. Nada aqui consegue buscar nem mandar coisa alguma, porque não existe função de rede nenhuma nesta ferramenta. E do outro lado desta página não existe servidor nenhum para onde mandar uma gravação, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Vídeo entra, áudio sai
- ✓ Funciona offline

## Como editar um arquivo de áudio

1. **Escolha um arquivo.** Arraste um MP3, WAV, FLAC, M4A, Ogg ou Opus até o seletor, ou um vídeo, se o que você quer é o som de dentro dele. Quem lê o arquivo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Vire de trás para a frente, se foi para isso que você veio.** Uma caixinha. As amostras são escritas da última para a primeira, o que é exatamente reversível: faça duas vezes e você tem o arquivo de onde partiu, amostra por amostra.
3. **Ajuste a velocidade.** Arraste o controle, digite um multiplicador, ou clique numa das predefinições. Depois escolha o que acontece com o tom: segurá-lo onde está, que é o que você quer numa aula a 1,5×, ou deixá-lo mover junto com a velocidade, que é o que uma fita faz e o que faz uma voz subir ou descer.
4. **Ajuste o nível.** Ou diga uma mudança em decibéis, ou peça que a gravação seja levantada até o momento mais alto dela ficar logo abaixo do teto. A página diz onde aquele momento vai cair antes de você clicar em qualquer coisa, e avisa se o ajuste escolhido o empurraria além da escala cheia.
5. **Salve.** O trabalho acontece no seu próprio hardware, então o tempo que leva depende do seu computador e não de uma fila. O que sai é um WAV, ou seja, as próprias amostras com um cabeçalho na frente. Ele toca na página primeiro e depois vai direto para os downloads do seu navegador.

## A versão longa

[Como limpar uma nota de voz antes de enviar](https://abox.tools/pt/guias/limpar-uma-nota-de-voz/): Corte o ar morto e os falsos começos, depois suba o nível até quase o fundo de escala. Duas ferramentas do navegador em sequência, na ordem que preserva a qualidade, e a gravação nunca sai da sua máquina.

## Também na caixa

- [Juntar e dividir PDF](https://abox.tools/pt/juntar-pdf/): Páginas trocadas de lugar sem ida e volta a um servidor.
- [Compressor de PDF](https://abox.tools/pt/comprimir-pdf/): Encolha um documento sem mandá-lo para lugar nenhum.
- [Tarjador de PDF](https://abox.tools/pt/tarjar-pdf/): As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.
- [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/): Coloque suas imagens num documento só.

## Perguntas

### Meu áudio é enviado para algum lugar?

Não. Quem lê, edita e escreve é o seu próprio navegador, no seu próprio hardware. Não existe lado de servidor nesta ferramenta, e a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum deles deste site. Se você prefere conferir a acreditar, desligue a internet e inverta uma faixa assim mesmo.

### Consigo tirar o áudio de dentro de um vídeo?

Consegue, e aqui é o mesmo trabalho que abrir um MP3. Jogue um MP4, MOV ou WebM aqui e só a trilha de áudio dele é decodificada: a imagem nunca é lida, e o que sai é um arquivo de som sem vídeo nenhum. Se é só isso que você quer — o som, sem mudar nada —, então [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/) faz o mesmo trabalho numa página que não tem mais nada. Volte aqui quando o som também precisar de mudança.

### Mudar a velocidade muda o tom?

Só se você pedir. O “Manter o tom” corta a gravação em janelas sobrepostas de uns cinquenta milissegundos e as reassenta mais perto ou mais longe umas das outras, escolhendo cada posição de modo que as ondas se alinhem onde se cruzam, então uma voz continua a mesma voz a 1,5×. Já o “Deixar mover” reamostra, que é o que tocar uma fita mais rápido faz: o dobro da velocidade é exatamente uma oitava acima.

### Por que ele salva um WAV em vez de um MP3?

Porque navegador nenhum traz um codificador de MP3, e esta ferramenta se recusa a mandar a sua gravação para um servidor que tenha um. Um WAV não precisa de codificador nenhum, já que são as amostras com um cabeçalho de quarenta e quatro bytes na frente, então é ao mesmo tempo a opção honesta e a única que não tem como custar qualidade. Ele é maior, com cerca de dez megabytes por minuto em estéreo. Todo reprodutor, celular e editor abre um, e qualquer coisa que queira um MP3 consegue fazer um a partir dele.

### Quais formatos posso abrir?

O que o seu navegador decodificar, o que na prática significa MP3, WAV, FLAC, M4A e AAC, Ogg Vorbis e Opus, além do áudio dentro de vídeos MP4, M4V, MOV e WebM. O que fica de fora é a mesma lista curta de sempre: AVI, WMA e a maioria dos MKVs. Um arquivo que este navegador não lê é recusado com uma mensagem dizendo isso, em vez de falhar no meio do caminho.

### Deixar mais alto vai distorcer?

Só se você passar da escala cheia, e a página avisa antes de você passar. O áudio digital tem um teto rígido: uma amostra não pode ser mais alta que a escala cheia, então qualquer coisa acima disso é achatada contra o teto, e é assim que a distorção soa. O “O mais alto que der” é o ajuste que não consegue fazer isso, porque ele calcula quanto espaço sobrou na gravação e usa exatamente aquilo. Tudo abaixo do teto é multiplicação e mais nada: suba 6 dB e desça 6 dB e as amostras estão onde começaram.

### Inverter ou retemporizar perde qualidade?

Inverter não perde: as mesmas amostras saem na outra ordem, o que é exato. Mudar a velocidade move cada amostra, então é aritmética e não cópia. O reamostrador filtra direito no caminho, então acelerar não dobra as notas altas de volta para baixo como um zumbido metálico, e as janelas do esticador são colocadas onde as ondas se alinham, e não onde a conta calhou de cair. Nenhum dos dois caminhos recodifica nada, porque não existe aqui codificador com que recodificar.

### Existe limite de duração do arquivo?

A ferramenta não tem limite embutido. O teto prático é a memória: a gravação inteira é decodificada nesta página de uma vez, e um WAV é montado na memória antes de você baixar, então uma hora de estéreo precisa de algo abaixo de um gigabyte para trabalhar. Um WAV de quatro gigabytes é recusado de cara, porque o próprio campo de tamanho do formato não consegue descrever um.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre a sua gravação.

## Como dá para conferir a promessa de privacidade

- **Suas gravações não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde o seu arquivo pudesse ser recolhido, e não existe no código nada que o mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Esta ferramenta não tem função de rede nenhuma: nenhum endereço para colar, nada para baixar, nenhum motor buscado no primeiro uso. Cada byte que encosta no seu áudio veio desta origem quando a página carregou.
- **O decodificador é o que já está no seu navegador.** O arquivo é entregue ao `decodeAudioData`, o mesmo código que toca uma faixa num elemento `<audio>`. Nada é embarcado aqui para ler o seu formato, e nada é pedido a coisa alguma fora desta página para lê-lo tampouco.
- **A imagem de um vídeo nunca chega a ser decodificada.** Quando você joga um vídeo aqui, só a trilha de áudio dele é pedida. Os quadros não são lidos, não são decodificados, não são desenhados e não são olhados, porque não existe nesta página código que pudesse fazer isso. O arquivo que sai carrega som e nada mais.
- **As amostras são anotadas, não codificadas de novo.** Um WAV são as amostras que esta página calculou com um cabeçalho na frente delas. Não há um codificador no meio tomando decisões sobre a sua gravação, e não há nada que pudesse ser chamado de envio para isso acontecer.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre a sua gravação: nem um arquivo, nem uma amostra, nem um nome, um tamanho, uma duração ou o quão alta ela estava. Toda linha que lê, edita e escreve é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre o seu arquivo.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/audio-decode.js` para as vinte linhas que entregam o seu arquivo ao decodificador do próprio navegador, `src/stretch.js` para o esticador de tempo, `src/speed.js` para o reamostrador, e `src/shared/wav.js` para o cabeçalho que vai na frente das amostras. Nenhum deles importa qualquer coisa que consiga fazer uma requisição.
