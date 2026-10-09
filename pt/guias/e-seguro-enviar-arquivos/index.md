# É seguro enviar arquivos para conversores online?

Normalmente a resposta honesta é “provavelmente, mas você não tem como conferir”. Aqui está o que enviar realmente faz com o seu arquivo, por que a maioria das ferramentas ainda faz isso, e quatro testes que dizem se a que está na sua frente precisa fazer.

Última atualização 26 de agosto de 2026

## A resposta curta

Para a maioria dos arquivos, na maior parte das vezes, enviar está tudo bem. Conversores sérios apagam o que você manda em algumas horas e não têm interesse nenhum nas suas fotos de viagem.

O problema não é que eles estejam mentindo. É que **você não tem como saber se estão**. Assim que um arquivo sai do seu computador, toda promessa sobre o que acontece depois é uma promessa que você aceita na fé: por quanto tempo ele fica, quem consegue alcançá-lo, se ele foi copiado para um backup que sobrevive ao cronômetro de exclusão, o que acontece com ele se a empresa for vendida ou invadida. Nada disso é visível de fora.

Então a pergunta útil não é “eu confio neste site?”. É **“este trabalho precisa mesmo que o meu arquivo saia daqui?”** Para um número grande e crescente de trabalhos a resposta é não, e quando a resposta é não, a pergunta sobre confiança deixa de ser uma que você precisa responder.

## O que “enviar” de fato faz

Quando um conversor pede que você escolha um arquivo e então mostra uma barra de progresso, o seu navegador está copiando o arquivo inteiro, byte por byte, pela internet, até um computador que pertence a outra pessoa. Esse computador escreve o arquivo num disco, roda a conversão, escreve o resultado no mesmo disco e devolve um link para você.

Nesse momento o seu arquivo existe em pelo menos três lugares que você não escolheu: o disco do servidor, os registros que anotaram a requisição e, muitas vezes, uma rede de distribuição de conteúdo que guardou o resultado em cache para o download ser rápido. Uma política de exclusão precisa alcançar os três. A maioria diz que alcança. Você não consegue conferir nenhum deles.

Vale saber também: o arquivo não é a única coisa que chega. O nome do arquivo vai junto, e junto vai tudo aquilo que está dentro do arquivo e que você não consegue ver. Uma foto recém-saída de um celular normalmente carrega as coordenadas de GPS exatas de onde foi tirada, a hora, o número de série da câmera e às vezes uma miniatura embutida da imagem original, de antes de você cortá-la. Quem tem cuidado com a imagem muitas vezes não tem cuidado com isso, porque nada na tela mostra essas coisas.

## Por que a maioria das ferramentas envia mesmo assim

Não é porque queiram os seus arquivos. É porque, durante a maior parte da vida da web, não havia alternativa. Um navegador não conseguia decodificar um vídeo, recodificar uma imagem numa qualidade escolhida ou interpretar um formato de arquivo, e um servidor com FFmpeg e ImageMagick conseguia. Enviar não era um modelo de negócio, era o único lugar onde o trabalho podia acontecer.

Isso deixou de ser verdade há pouco tempo e sem alarde. Os navegadores hoje trazem WebAssembly, que roda os mesmos codecs compilados perto da velocidade nativa, WebCodecs, que expõe o codificador de vídeo por hardware que já está no seu computador, e uma API de Canvas que decodifica e recodifica imagens diretamente. O trabalho para o qual um servidor era necessário agora roda no aparelho que já tem o arquivo.

Muitas ferramentas ainda enviam, e há motivos honestos: um encanamento existente que ninguém quer reescrever, um formato sem decodificador do lado do navegador, um trabalho genuinamente pesado demais para um celular. Existe também um motivo menos honesto, que é o servidor ser o lugar onde moram as contas, as cotas e os planos pagos. Uma ferramenta que roda inteiramente no seu navegador é difícil de cobrar.

## Quatro verificações que você mesmo pode fazer

Elas funcionam em qualquer ferramenta, esta inclusive. Nenhuma exige acreditar na palavra de ninguém, e a primeira leva uns dez segundos.

### 1. Tire da tomada

Carregue a página, então desligue o wi-fi ou tire o cabo, e tente usar. Uma ferramenta que faz o trabalho no seu navegador continua exatamente como antes. Uma ferramenta que envia para na hora, porque aquilo que faz o trabalho deixou de estar ao alcance.

Este é o teste mais forte que existe, e o mais difícil de fingir, porque não dá para responder com escolha de palavras. Ou a conversão termina sem rede, ou não termina.

### 2. Olhe a aba “Rede”

Abra as ferramentas do desenvolvedor do seu navegador, escolha “Rede” e então use a ferramenta. Toda requisição que a página faz aparece na lista com o tamanho. Se a sua foto de 4 MB foi enviada, existe uma requisição de 4 MB naquela lista. Se a maior coisa saindo da página são alguns kilobytes de publicidade, não foi.

Ordene por tamanho e olhe o topo. Você não precisa entender as requisições, precisa só notar se alguma delas tem o tamanho do seu arquivo.

### 3. Leia a Content-Security-Policy

Veja o código-fonte da página e procure por `Content-Security-Policy`, lá no alto. É uma lista dos endereços que aquela página tem permissão de acessar, e quem a faz valer é o seu navegador, não as boas intenções do site. Uma requisição a qualquer coisa fora da lista é recusada, tente o código o que tentar.

A diretiva que importa é `connect-src`, que rege para onde a página pode mandar dados. Se ela nomeia um endereço pertencente ao site em que você está, a página pode mandar o seu arquivo para lá. Se não nomeia nada, ou nomeia só terceiros como uma rede de anúncios, não pode.

Uma página sem Content-Security-Policy nenhuma não é evidência de nada ruim. Só quer dizer que esta verificação em particular não tem nada a dizer.

### 4. Leia o código

A menos conveniente, e a mais conclusiva. Se uma ferramenta publica o código dela e o serve sem etapa de compilação, os arquivos que o seu navegador buscou são os arquivos que você pode ler. Procure neles por `fetch`, `XMLHttpRequest` e `sendBeacon`, que são os três jeitos que uma página tem de mandar qualquer coisa, e veja o que é passado para eles.

A maioria das pessoas não vai fazer isso. Continua importando que seja possível, porque uma afirmação que ninguém consegue conferir não é bem uma afirmação.

## O que “roda no seu navegador” não quer dizer

Vale ser preciso, porque a expressão é usada de forma frouxa e este site tem que se sujeitar ao mesmo critério que está propondo.

- **Não quer dizer requisição nenhuma.** A própria página chegou pela rede, e a maioria das ferramentas gratuitas carrega publicidade ou análise que conversa com alguém. A afirmação é sobre o seu *arquivo*, não sobre tráfego em geral.
- **Não esconde o seu endereço IP.** Todo site que você visita enxerga o IP, este inclusive. Processamento local é sobre o conteúdo dos seus arquivos, não sobre anonimato.
- **Não sobrevive a uma função que busca alguma coisa.** Uma ferramenta que deixa você colar um endereço da web precisa acessar aquele endereço, e aquele servidor fica sabendo o seu IP e o que você pediu. Isso é inerente à função, não um defeito dela, mas é uma exceção real, e uma ferramenta deve dizer isso com todas as letras em vez de arredondar.
- **Não é a mesma coisa que “nós apagamos seus arquivos”.** A segunda frase é sobre o que uma empresa escolhe fazer. A primeira é sobre o que é tecnicamente possível. Só uma das duas é verificável.

## Quando enviar está genuinamente tudo bem

Isto não é um argumento de que todo envio é um erro. Mande o arquivo quando o conteúdo não for sensível e o trabalho ficar mais fácil assim, quando o trabalho for de fato pesado demais para o seu aparelho, quando o formato não tiver decodificador do lado do navegador, ou quando você estiver usando um serviço com o qual já tem relação e cujos termos leu de verdade.

Tenha mais cuidado quando o arquivo contém algo que você não postaria publicamente: documentos de identidade, exames de imagem, contratos, qualquer coisa com um endereço ou um rosto que você não pretendia compartilhar, ou uma foto cujos dados de localização você não olhou. Para esses, uma ferramenta que você consegue conferir merece preferência sobre uma ferramenta em que você precisa confiar. Não porque a confiável provavelmente vá trair você, e sim porque com a verificável a pergunta nem chega a surgir.

## Como este site responde a essas quatro verificações

Seria um guia estranho o que mandasse você conferir e depois pedisse isenção. Então, na ordem:

- **Tire da tomada.** Abra qualquer ferramenta daqui, desligue a internet, e ela continua funcionando. Cada página de ferramenta tem um indicador ao vivo que diz se você está online neste momento, para você ver a mudança acontecer.
- **Aba “Rede”.** Converta alguma coisa e leia a lista. Nada leva o seu arquivo, uma miniatura dele, o nome, o tamanho ou qualquer coisa lida de dentro dele. Não existe neste site nenhum evento de análise personalizado que tivesse algo disso para mandar.
- **Content-Security-Policy.** Está no alto do código-fonte de toda página. O `connect-src` nomeia os endereços de publicidade e de medição do Google e o botão de doação, e nada mais. **Nenhum endereço daquela lista pertence a este site**, porque este site não tem servidor: são arquivos estáticos. Não há para onde um arquivo pudesse ser mandado, mesmo que alguma coisa tentasse.
- **Código.** Cada linha é [pública](https://github.com/A-Box-of-Tools/website). A compilação remove comentários e espaços em branco e nada mais, e você pode rodá-la você mesmo e comparar o resultado com o que está sendo servido.

As exceções, declaradas em vez de escondidas: este site carrega publicidade do Google e um contador de visitas, os dois conversam com o Google e nenhum dos dois recebe qualquer coisa sobre os seus arquivos; e a ferramenta [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/) consegue buscar uma imagem num endereço que você cola, o que significa que aquele servidor enxerga o seu IP. A [página de privacidade](https://abox.tools/pt/privacidade/) apresenta as duas por inteiro.

Toda ferramenta daqui funciona assim: um [compressor de imagens](https://abox.tools/pt/comprimir-imagem/) que acerta um tamanho que você diz, um [cortador de vídeo](https://abox.tools/pt/cortar-video/), um [visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) para os dados escondidos descritos mais acima nesta página, [imagens para vídeo](https://abox.tools/pt/imagens-para-video/) e [imagens para PDF](https://abox.tools/pt/imagens-para-pdf/). Todas grátis, sem conta, e nenhuma delas tem para onde mandar os seus arquivos.

![O painel de uma página de ferramenta: uma linha dizendo que os arquivos nunca saem do navegador, os fatos que sustentam isso e uma verificação ao vivo relatando que a página não fez nenhuma requisição de rede.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

A última das quatro verificações, respondida na página e não num parágrafo: a contagem é feita pela página sobre ela mesma, e você pode fazer a mesma contagem no seu navegador.
