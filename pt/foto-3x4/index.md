# Foto de documento — passaporte e visto na medida certa

Escolha o país. Ele aplica a regra daquele país, exatamente.

> Faça uma foto de passaporte ou visto conforme a regra publicada do seu país: milímetros e DPI exatos, uma marcação ao vivo de altura da cabeça e linha dos olhos, checagem do fundo, uma folha 10x15 pronta para imprimir e um arquivo espremido dentro do limite em KB do portal. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/foto-3x4/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem fotos. Não existe servidor.

O corte, as medições, a leitura do fundo e a impressão rodam todos no seu próprio navegador, no seu próprio hardware, com o codificador JPEG que ele já traz. Esta ferramenta não tem função de rede de espécie alguma, nada para buscar e nada para mandar. E mesmo que tivesse, do outro lado desta página não existe servidor para receber uma fotografia do seu rosto.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como fazer uma foto de documento que não volta

1. **Escolha a fotografia.** Uma foto de celular contra uma parede lisa, de dia, tirada de mais ou menos um metro e meio. O navegador lê direto do seu disco, e nesse meio-tempo nada sai daqui.
2. **Escolha o país e o documento.** O painel mostra então o tamanho de impressão, a faixa de altura da cabeça, a linha dos olhos, a cor do fundo e os limites de envio daquela regra, junto com a autoridade de onde cada número veio e a data em que foi lido. Nada nessa lista é chute, e qualquer coisa que tenham mandado para você e que não esteja nela entra em “Qualquer outro lugar”.
3. **Confira os quatro pontinhos no seu rosto.** Topo da cabeça, queixo e cada pupila — esses quatro pontos são tudo o que a regra mede. Eles são colocados medindo a própria foto, e a linha abaixo diz quais deram certo e quais tiveram de ser deduzidos. Arraste o que caiu errado, ou mude para *Eu mesmo coloco* e faça os quatro à mão. Depois aperte *Ajustar o quadro* e o corte cai onde aquele país quer.
4. **Leia as quatro checagens, e o fundo.** Altura da cabeça, linha dos olhos, centralização e inclinação, cada uma medida no quadro do jeito que ele está e cada uma dizendo para que lado arrastar se estiver fora. O fundo é lido do topo e das laterais do corte e comparado com a cor que a regra pede; a irregularidade, que é o que de fato faz uma foto ser recusada, é medida separadamente da cor.
5. **Leve os três arquivos.** A impressão, nos milímetros exatos, com a resolução escrita dentro do arquivo para que uma loja imprima no tamanho certo. A folha, com quantas cópias couberem num ⁦10 × 15⁩ e marcas de corte nos vãos. E o envio, no tamanho em pixels que o portal exige e dentro da faixa em KB que ele cobra dos dois lados.

## A versão longa

[Como fazer uma foto de passaporte que não volta recusada](https://abox.tools/pt/guias/fazer-foto-3x4-em-casa/): O que realmente é medido numa foto de passaporte — altura da cabeça, linha dos olhos, fundo —, quais números cada país quer, e como bater os limites de pixels e de KB que um formulário online cobra.

## Também na caixa

- [Empilhador de imagens](https://abox.tools/pt/empilhar-imagens/): Vinte quadros em um, sem vinte envios e sem um conversor RAW.
- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.
- [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.
- [Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/): Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.

## Perguntas

### A minha foto é enviada para algum lugar?

Não. A imagem é decodificada, cortada, medida e escrita pelo seu próprio navegador, no seu próprio hardware, com o codificador JPEG que o navegador já traz. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar, e nenhum deles é nosso. Isso vale mais aqui do que na maioria das ferramentas: o arquivo é uma fotografia do seu rosto.

### Quais países estão cobertos?

As especificações transcritas até agora são o próprio padrão da OACI, os Estados Unidos (passaporte e a inscrição na loteria de vistos, que têm regras de envio diferentes), o Reino Unido, o visto Schengen, a Alemanha, o Canadá, a Austrália, a Índia (passaporte, a cópia de ⁦35 × 45⁩ mm e a foto e a assinatura dos formulários SSC e UPSC), a China e o Japão. Cada entrada nomeia a autoridade de onde veio e a data em que foi lida. Qualquer outra coisa entra em “Qualquer outro lugar”, onde cada número é você que digita; e como a maior parte do mundo emite seguindo a geometria da OACI, essa entrada já começa nela.

### Como ele acha o topo da cabeça, o queixo e os olhos sem um modelo de rostos?

Assumindo uma coisa que um detector de rostos genérico não pode assumir e esta ferramenta pode: todas essas normas exigem a mesma cena — uma pessoa, de frente para a câmera, contra uma parede lisa e iluminada por igual. Então a cor da parede é lida na borda da foto, tudo o que não é essa cor é a pessoa, e o ponto mais alto dela é o topo da cabeça, cabelo incluído. As pupilas são procuradas como o melhor par de manchas mais escuras do que aquilo que as cerca, na mesma altura e uma de cada lado do meio da cabeça — uma comparação local, então nada nela depende da cor que um rosto tenha. O queixo é o único que não se acha assim, porque uma mandíbula contra um pescoço é uma borda suave sem mudança de cor; ele é deduzido das pupilas, que ficam um pouco abaixo do meio de uma cabeça, uma vez contado o cabelo que fica em cima, e depois conferido contra o contorno. Tudo isso é conta, em `src/detect.js`: sem pesos, sem motor de inferência, sem baixar nada, e a mesma conta para qualquer rosto. Essa última parte é a que importa, porque um detector embutido erra de forma desigual — pior em uns rostos do que em outros — e quem já tem foto recusada com mais frequência é justamente quem ele deixaria na mão.

### Quanto devo confiar nos pontinhos que ele coloca?

O bastante para partir dali, não o bastante para não olhar. Cada um dos quatro tem uma foto em que erra: uma parede estampada ou uma estante não deixa contorno contra o qual recortar uma cabeça, uma cabeça cortada em cima não tem topo nenhum na foto, e óculos, uma franja pesada ou olhos fechados podem pôr as pupilas no traço errado. Por isso a ferramenta diz em voz alta quais dos quatro mediu e quais teve de deduzir, recusa de vez uma foto sem fundo liso em vez de inventar uma resposta, e deixa todo pontinho arrastável. O corte sai de onde os pontinhos acabarem ficando, nunca de onde começaram. Se você preferir colocar os quatro, a chave acima da foto diz *Eu mesmo coloco*, e mover qualquer pontinho à mão já muda para lá sozinho: a partir daí eles são seus e nada vai movê-los.

### O que é a regra da altura da cabeça, e por que a minha nunca passa?

Cada uma dessas especificações diz quanto do enquadramento a cabeça precisa preencher, medida da base do queixo até o topo da cabeça, cabelo incluído; em geral de 70 a 80 por cento, o que para uma foto de 45 mm dá de 31,5 a 36 mm. O motivo mais comum de não passar é a selfie: um braço tem uns 60 cm, o que distorce o rosto e deixa a cabeça grande demais no enquadramento. O segundo motivo mais comum é o topo da cabeça: é o alto do cabelo, não a linha do cabelo, e marcar a linha do cabelo faz toda cabeça sair pequena demais.

### Por que o arquivo precisa ter pelo menos 20 KB, e como dá para preenchê-lo?

Os portais de concurso indianos, o formulário de visto chinês e o envio do passaporte britânico indicam um tamanho mínimo além de um máximo, porque um arquivo abaixo disso costuma ser uma miniatura que alguém subiu por engano. Uma fotografia de ⁦200 × 230⁩ tem 46.000 pixels, e na melhor qualidade que um navegador vai escrever ainda pode parar em 15 KB, sem jeito de deixá-la maior comprimindo menos. Então a ferramenta acrescenta um segmento de comentário JPEG cheio de espaços. Isso faz parte do padrão JPEG, todo decodificador pula, e a imagem é bit a bit a mesma imagem: só o arquivo ficou maior. O preenchimento diz exatamente isso, em inglês, dentro do arquivo.

### Ele confere o fundo, e consegue trocar um?

Ele confere e não troca. A cor é lida de uma faixa no topo do corte e descendo pelas laterais, acima dos ombros, e comparada com a cor da regra em CIE Lab em vez de RGB: dois cinzas separados por quarenta unidades RGB são indistinguíveis, e quarenta unidades de azul são outra cor. A irregularidade é medida à parte, porque uma sombra numa parede branca é o que de fato faz fotografias serem recusadas, e isso não é um problema de cor. Trocar um fundo significa recortar uma pessoa de uma imagem, o que é um modelo de segmentação, e um ruim come o cabelo. Ficar meio metro mais longe da parede resolve mais desses casos do que qualquer filtro.

### Para que serve a folha ⁦10 x 15⁩?

Uma cabine cobra alguns reais por seis fotografias. Um balcão de fotos imprime um ⁦10 × 15⁩ por centavos, e qualquer um faz. Então a ferramenta distribui na folha quantas cópias da sua foto couberem — oito, para um ⁦35 × 45⁩ num ⁦10 × 15⁩ — com marcas de corte nos vãos e nada impresso por cima de uma imagem. Nada é redimensionado para caber: cada cópia tem exatamente o tamanho que a regra pede, porque uma folha que encolhesse todas em dois por cento para caber mais uma seriam oito fotografias no tamanho errado. Imprima a 100 por cento; “ajustar à página” é o que faz uma folha sair errada.

### Por que o DPI importa se os pixels são os mesmos?

Porque um JPEG pode dizer que tamanho ele tem, e se não disser, quem imprimir adivinha. A resolução mora no cabeçalho JFIF, e um canvas de navegador escreve esse cabeçalho com o campo de unidades em “isto é uma proporção, não uma resolução”. Esta ferramenta reescreve esses poucos bytes para que o arquivo diga 300 dpi, que é o que transforma ⁦413 × 531⁩ pixels numa fotografia de ⁦35 × 45⁩ mm em vez de uma imagem de tamanho nenhum. Nada é decodificado para isso e nenhuma qualidade é gasta.

### Ele também faz o arquivo da assinatura?

Faz — os formulários SSC e UPSC querem uma de ⁦140 × 60⁩ pixels e entre 10 e 20 KB, e ela está na lista como especificação própria. A marcação de rosto é desligada para ela, já que uma assinatura não tem linha dos olhos, e o que se confere no lugar é que o papel esteja claro, que haja tinta nele e que o corte não tenha pegado uma linha pautada ou a borda da página. Chegar aos 10 KB é a parte difícil dessa regra, e não ficar abaixo de 20.

### Isso garante que o meu pedido vai ser aceito?

Não, e nenhuma ferramenta honestamente consegue. O que ela faz é aplicar os números publicados exatamente e mostrar cada medida que fez, para que as coisas que um formulário mede sozinho — tamanho em pixels, tamanho do arquivo, formato — estejam certas, e as coisas que uma pessoa avalia — altura da cabeça, linha dos olhos, o fundo — estejam na sua frente com números. As regras também mudam: cada especificação aqui diz de qual autoridade veio e quando foi lida, para você conferir com o formulário que está na sua frente em vez de confiar numa tabela.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste, nem marca d'água atravessada no seu rosto. Também não tem limite de quantas fotografias você faz, porque não existe servidor pagando por elas. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre a sua fotografia.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando — o compêndio de regras é um arquivo servido com a página, não uma consulta. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse a sua fotografia embora para ser cortada pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Uma fotografia do seu rosto nunca sai deste computador.** Aqui isso pesa mais do que na maioria das ferramentas: o arquivo que esta página manuseia é uma imagem do seu rosto, e o que você está prestes a fazer com ela ainda por cima nomeia o país cujo documento você está pedindo. A `Content-Security-Policy` lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde a sua fotografia pudesse parar.
- **Aqui nada busca nada.** Não existe em lugar nenhum de `src/` um `fetch`, um `XMLHttpRequest` ou um `sendBeacon`. O compêndio de regras é uma tabela em `src/specs.js`, servida com a página e guardada em cache junto com ela: não tem lista de países para consultar nem nada com que comparar a sua foto remotamente.
- **O rosto é achado sem nenhum modelo de rostos.** Não há pesos para baixar, nem um motor de inferência para rodá-los, nem nada que seja buscado na rede: o topo da cabeça vem do contorno dela contra a parede atrás, e as pupilas vêm das áreas do rosto que são mais escuras do que o que está em volta. Nada disso lê cor de pele, e é exatamente por isso que está escrito assim — um modelo que erra erra de forma desigual, pior em uns rostos do que em outros. É uma posição de partida e não um veredito: a página diz qual dos quatro pontos ela não conseguiu medir, cada pontinho continua arrastável, e com *Eu mesmo coloco* fica desligado por completo.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google, e o botão de doação vem do Buy Me a Coffee. Nenhum deles recebe coisa alguma sobre a sua fotografia, o seu rosto ou a regra de qual país você escolheu. Toda linha que lê, corta, mede ou escreve um arquivo é servida desta origem e está listada no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/specs.js` para o compêndio de regras, ou seja, os números publicados de cada país, com a autoridade e a data em que cada um foi lido, `src/detect.js` para como os quatro pontos são achados — um contorno e duas manchas escuras, sem modelo nenhum —, `src/geometry.js` para a conta que transforma quatro pontos marcados num corte, e `src/jpeg.js` para as duas edições de cabeçalho que colocam a resolução de impressão no arquivo e levantam um envio pequeno demais até o tamanho que o formulário exige.
