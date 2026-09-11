# HEIC para JPG — converter fotos de iPhone

As fotos que o iPhone tira, num formato que tudo abre.

> Converta fotos HEIC de iPhone em JPG no seu navegador. O decodificador roda no seu próprio computador, nada é enviado, não pede conta, funciona offline, e a data e os detalhes da câmera podem vir junto.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/heic-para-jpg/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem fotos. Não existe servidor.

A decodificação roda no seu próprio navegador, no seu próprio hardware. O HEIC é o único formato de imagem que um navegador não abre sozinho, então esta página carrega o decodificador junto: cerca de 1,4 MB, servidos deste site e guardados em cache depois da primeira visita. É esse o motivo inteiro de todo outro conversor de HEIC pedir um envio. Eles põem o codec num servidor, e aí as suas fotos têm que ir até lá. Este põe o codec aqui. Não existe função de rede nenhuma nesta página, nem servidor do outro lado dela para onde mandar uma foto.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem limite de tamanho
- ✓ Funciona offline
- ✓ Código aberto

## Como converter fotos HEIC em JPG

1. **Escolha suas fotos HEIC.** Arraste até o seletor, ou escolha na mão, direto de um backup do celular ou de uma pasta na área de trabalho. Quem lê tudo do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso. A lista diz o que cada uma é e o que ela tem dentro.
2. **Confira o que as fotos carregam.** Cada linha nomeia a data em que foi tirada, a câmera e, em verde porque é a parte que vale notar, se o arquivo guarda coordenadas de GPS. Isso é lido do contêiner sem decodificar a imagem, então não custa nada e aparece na hora.
3. **Escolha um formato e decida sobre os detalhes.** JPEG, a menos que você tenha um motivo, porque é o formato que abre em todo lugar, que é o ponto inteiro de converter. O controle de qualidade fica em 92, que é o ajuste em que uma fotografia é difícil de distinguir do original. A caixinha decide se a data, a câmera e a localização vêm junto.
4. **Clique em “Converter”, e baixe.** O decodificador chega na primeira conversão, com cerca de 1,4 MB, uma vez só, e toda foto depois disso é decodificada e escrita no seu próprio computador. Um arquivo rende um botão de download, e vários rendem um zip também.

## A versão longa

[A foto que seu celular salvou, e o formato que nada abre](https://abox.tools/pt/guias/converter-heic-para-jpg/): iPhones salvam fotos em HEIC, e metade da internet não consegue abrir uma. O que é o formato, por que só o Safari decodifica, o que a conversão custa à imagem, e como fazer isso sem entregar as fotos a ninguém.

## Também na caixa

- [Criador de foto de documento](https://abox.tools/pt/foto-3x4/): Escolha o país. Ele aplica a regra daquele país, exatamente.
- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.
- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.
- [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.

## Perguntas

### Minha foto é enviada para algum lugar?

Não. Quem lê, decodifica e escreve o arquivo é o seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site. A única coisa que carrega é o próprio decodificador, e ele vem deste site, uma vez, antes de a sua foto sequer entrar na história.

### Por que esta página baixa 1,4 MB na primeira vez?

Porque o HEIC é o único formato de imagem que um navegador não abre. É um quadro HEVC num contêiner de caixas, e só o Safari, em hardware da Apple, tem um decodificador para ele. Chrome, Firefox e Edge simplesmente recusam o arquivo. Então um conversor de HEIC precisa de um decodificador vindo de algum lugar, e só existem dois lugares possíveis: um servidor, ou a página. Todo outro conversor escolheu o servidor, e é exatamente por isso que todos eles precisam que você envie as suas fotos. Este aqui carrega a `libheif` compilada para WebAssembly. Ela é servida deste site, guardada em cache depois da primeira visita, e é o preço inteiro de as suas fotos não irem a lugar nenhum.

### O JPEG mantém a data, a câmera e a localização?

Se você quiser, e isso é uma caixinha na página. Com ela ligada, o bloco EXIF é copiado do HEIC e escrito no JPEG exatamente como o celular escreveu, então a foto convertida continua se ordenando pelo dia em que foi tirada, e não pelo dia em que foi convertida, que é a reclamação de sempre sobre conversores de HEIC. Uma etiqueta muda, e só uma: a orientação, que é ajustada para “em pé”, porque a rotação já foi aplicada aos pixels e um visualizador que a aplicasse de novo viraria toda foto em pé de lado. Desligue a caixinha e o JPEG sai com a imagem e nada mais.

### Ele apaga as coordenadas de GPS?

Ele avisa que elas estão lá, e depois faz o que você mandar. A linha de cada foto diz se o arquivo carrega coordenadas antes de qualquer coisa ser convertida, o que é mais do que o celular faz. Desmarcar “manter a data, a câmera e os ajustes” deixa as coordenadas fora do JPEG junto com todo o resto, e deixar marcado leva tudo adiante. Se o que você quer é percorrer as etiquetas em detalhe, ou apagá-las de fotos que já são JPEG, a ferramenta certa é o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/), que faz isso sem recomprimir a imagem.

### A imagem é recomprimida?

É, e tem que ser: HEIC e JPEG são codecs diferentes, então não tem como ir de um ao outro sem decodificar a imagem e codificá-la de novo. O que você controla é quanto isso custa. O controle de qualidade vem em 92, ponto em que uma fotografia é muito difícil de distinguir do original, e o PNG está no menu para o caso em que você não quer perda nenhuma e não se importa com o arquivo ficar de cinco a dez vezes maior.

### E se o arquivo se chama .jpg mas na verdade é um HEIC?

Funciona do mesmo jeito. Todo arquivo jogado aqui é identificado pelos primeiros bytes e não pelo nome, porque o nome é só como o último aplicativo a encostar no arquivo resolveu chamá-lo. Aliás, um HEIC que chegou chamado de “.jpg” é um dos jeitos mais comuns de alguém acabar procurando uma ferramenta como esta. Um arquivo que é genuinamente um JPEG ou um PNG é recusado com uma mensagem dizendo isso, em vez de ser convertido numa cópia de si mesmo.

### Ele converte uma Live Photo, ou uma rajada?

As imagens paradas de dentro, sim. Um HEIC pode guardar mais de uma imagem, e cada uma que ele guarda é convertida e nomeada a partir do original com um número no fim. A metade em vídeo de uma Live Photo é um arquivo separado que o celular guarda ao lado do HEIC, então ela não está aqui dentro para ser convertida. Mapas de profundidade e miniaturas estão no contêiner mas não são imagens que alguém pediu, então ficam em paz.

### Por que ele não aceita o meu AVIF?

Porque não haveria o que fazer com ele. AVIF é o mesmo contêiner do HEIC com AV1 dentro no lugar do HEVC, e todo navegador atual decodifica um nativamente. Um conversor estaria entregando um megabyte de motor para resolver um problema que você não tem. Se você precisa de um AVIF como JPEG, o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) e o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) leem AVIF e escrevem JPEG usando o decodificador que o seu navegador já tem.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água. Também não tem limite para o número nem para o tamanho dos arquivos, porque não existe servidor pagando por eles: o trabalho acontece no seu próprio computador. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas fotos.

### Funciona offline?

Funciona, decodificador incluído. Carregue a página uma vez, depois desligue a internet e ela continua trabalhando nas suas fotos exatamente como antes. Essa é também a prova mais forte disponível de que nada está sendo enviado: um conversor que mandasse os seus HEICs embora para serem decodificados pararia no instante em que você tirasse da tomada, e este não para.

## Como dá para conferir a promessa de privacidade

- **Suas fotos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **O decodificador veio daqui, e não vai a lugar nenhum.** HEIC é HEVC dentro de um formato de caixas, e navegador nenhum além do Safari decodifica um. Por isso esta página traz a `libheif` compilada para WebAssembly: cerca de 1,4 MB, commitados neste repositório, servidos desta origem e guardados em cache pelo service worker como qualquer outro arquivo daqui. Ela não é buscada de uma CDN, porque isso colocaria um terceiro no caminho de cada visita e faria a ferramenta parar de funcionar offline. O binário está dentro do script em vez de ao lado dele justamente para que nenhuma busca seja necessária para iniciá-lo.
- **Nada aqui vai buscar coisa alguma.** Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em nenhum arquivo escrito para esta ferramenta. O motor de terceiros, como toda compilação do Emscripten, contém os caminhos de carregamento que buscariam um `.wasm` numa URL. Esses caminhos não são tomados, porque o binário já está em mãos. E se fossem, o `connect-src` lista os pontos de medição do Google e nada mais, então o navegador recusaria. A prova é a política, não a promessa.
- **Os metadados são lidos aqui e mostrados a você.** A lista na página diz o que cada foto carrega, com a data, a câmera e o aviso de que há coordenadas de GPS lá dentro, porque essa é uma coisa que você pode querer saber antes de entregar o JPEG a alguém. Quem lê isso do arquivo é o `src/boxes.js`, neste navegador, e o resultado aparece nesta página. Depois ele é escrito no seu JPEG ou deixado de fora, inteiramente conforme você escolher. Não existe neste repositório nenhum evento de análise personalizado que carregue um nome de arquivo, uma data, uma coordenada ou uma contagem.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre as suas fotos. Toda linha que lê, decodifica ou escreve um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Carregue a página uma vez, desligue a rede, e a ferramenta continua igualzinha, porque o decodificador é guardado em cache junto. Essa é a prova mais simples de todas, e aqui ela é mais forte do que em qualquer outro lugar deste site: um conversor que mandasse as suas fotos embora para serem decodificadas não teria como dar conta.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/heif.js` para como o decodificador é carregado e o que ele tem permissão de fazer, `src/boxes.js` para a interpretação do contêiner que acha os metadados da foto, e `src/exif.js` para o que acontece com esses metadados no caminho para dentro de um JPEG. O motor em si é o `vendor/libheif.js`, sem modificações, com a licença dele ao lado.
