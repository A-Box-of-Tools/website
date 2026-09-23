# Quando colocar uma imagem dentro do seu CSS, e quando não

Uma imagem escrita dentro de uma folha de estilo chega junto com ela, sem segunda requisição e sem espera. Ela também deixa de ser um arquivo, então não pode ser guardada em cache sozinha, e é baixada de novo toda vez que qualquer coisa ao redor muda. Aqui está onde essa troca compensa, e onde ela discretamente não compensa.

[Abrir Imagem para data URI](https://abox.tools/pt/imagem-para-base64/): A imagem inteira como uma linha de texto. Cole direto no CSS ou no HTML.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Imagem para data URI](https://abox.tools/pt/imagem-para-base64/), jogue a imagem dentro, escolha *Uma propriedade personalizada de CSS* e cole a linha no alto da sua folha de estilo. Depois use como `background-image: var(--logo)` onde precisar.

Faça isso quando a imagem for pequena, como um ícone, um marcador de lista, uma setinha ou um padrão, e for necessária em toda página. Não faça com uma fotografia. Tudo o que vem abaixo é o porquê de essas duas frases diferirem, e como saber com qual dos dois casos você está lidando.

## O que uma data URI é de fato

Um endereço que contém a coisa em vez de apontar para ela. Onde uma folha de estilo normalmente diria

```
background-image: url("logo.png");
```

e o navegador vai buscar o `logo.png`, uma data URI diz

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

e não há o que buscar, porque a imagem já está ali, escrita em caracteres. São três partes. `data:` é o esquema. `image/png` é o tipo de mídia, e o navegador acredita nele por completo, com mais sobre isso abaixo. Tudo depois da vírgula é o arquivo.

É essa a ideia inteira. Não é truque nem gambiarra: está nos padrões desde 1998 e funciona em todo navegador lançado desde então.

## O que isso rende a você: uma ida e volta a menos

A economia não é de banda. É da requisição.

Um navegador não consegue pedir o `logo.png` antes de ter lido a folha de estilo que o menciona, e não consegue ler a folha de estilo antes de tê-la buscado. Então uma imagem de fundo comum está pelo menos duas idas e voltas fundo no carregamento da página, e num celular numa rede lenta uma ida e volta pode ser algumas centenas de milissegundos por menor que seja o arquivo. Uma setinha de 600 bytes quase não custa nada para transferir e ainda assim pode custar um quarto de segundo para chegar.

Embutida, ela chega junto com a folha de estilo. Esse é o benefício inteiro, e para um ícone pequeno que aparece na primeira dobra ele é real.

## O que isso custa: um terço, e depois o cache

**O base64 acrescenta cerca de um terço.** Três bytes de arquivo viram quatro caracteres, porque é isso que se leva para escrever bytes arbitrários usando só os caracteres que uma URL permite. Não existe codificador esperto que fuja disso. Um PNG de 9 KB são 12 KB de folha de estilo.

**A compressão não devolve.** Esta é a parte que as pessoas dispensam por suposição. Gzip e Brotli funcionam encontrando redundância, e um PNG, um JPEG e um WebP já foram comprimidos, então sobra pouquíssima redundância neles e o base64 não acrescenta nenhuma. Na prática você recupera algo como um décimo daquele terço, e não o terço inteiro. (Um SVG é o caso oposto, e a próxima seção é sobre isso.)

**Ela deixa de ser um arquivo.** Este é o custo que não aparece em nenhuma medição que você provavelmente vá fazer, e é o que importa em escala:

- **Não pode ser guardada em cache sozinha.** Uma imagem comum é buscada uma vez e reaproveitada por um ano. Uma embutida faz parte da folha de estilo, então vive e morre com a entrada de cache dela.
- **Mudar qualquer coisa rebaixa tudo.** Conserte uma margem, publique uma folha de estilo nova, e todo visitante baixa a imagem embutida de novo junto com ela, uma imagem que não muda há dois anos.
- **Ela está no caminho crítico.** Uma folha de estilo bloqueia a renderização. Uma imagem não. Embutir uma imagem a move da segunda categoria para a primeira: a página não pode pintar até que a coisa inteira, imagem incluída, tenha chegado.
- **Não pode ser buscada em paralelo.** Os navegadores baixam várias coisas ao mesmo tempo. Uma imagem embutida não é uma coisa separada, então não pega nada disso.

Limiares grosseiros, que são onde o conselho muda e não onde algum navegador faz algo diferente: abaixo de uns 2 KB é vitória clara, até uns 10 KB normalmente ainda vale para algo que está em toda página, e passando de 50 KB é um erro sem mensagem de erro. [A ferramenta](https://abox.tools/pt/imagem-para-base64/) diz em qual faixa cada resultado cai, com a contagem de caracteres ao lado.

![O cartão de saída: uma regra CSS com um URI de dados em base64, com o tamanho do arquivo original e o do codificado ao lado.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

A cópia codificada é cerca de um terço maior que o arquivo de onde veio. Esse é o custo de que trata esta seção, e ele vem escrito em vez de ser descoberto.

## Nunca ponha um SVG em base64

Este é de longe o erro mais comum em imagens embutidas, e é cometido por exportadores e plugins de compilação com a mesma frequência que por pessoas.

Um SVG é texto. Uma URL já carrega texto. Só um punhado de caracteres precisa ser escapado, que são `%`, `#`, `<`, `>` e a aspa em que você o envolveu, e todo o resto pode ficar exatamente como está. Codificar assim rende uma URI tipicamente uns 20% mais curta que o base64 do mesmo arquivo, e que depois comprime como texto em vez de comprimir como ruído.

E continua legível:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Você consegue ver o `viewBox`. Você consegue mudar a cor de preenchimento no seu editor sem decodificar nada. Ponha o mesmo arquivo em base64 e ele vira uma parede de letras em que ninguém nunca mais vai encostar. O [Imagem para data URI](https://abox.tools/pt/imagem-para-base64/) faz isso automaticamente com qualquer coisa que se revele um SVG, e tem uma caixinha para a rara cadeia de ferramentas que insiste no `;base64`.

## O erro de aspas que só quebra SVGs

O CSS permite escrever `url()` sem aspas, e para um nome de arquivo comum tudo bem:

```
background-image: url(logo.png);
```

Faça o mesmo com um SVG codificado em porcentagem e quebra. Um token `url()` sem aspas termina no primeiro espaço, parêntese, aspa ou caractere de controle, e um SVG é cheio de espaços, entre cada atributo e cada número de um traçado. A declaração fica inválida, o CSS descarta declarações inválidas em silêncio, e você fica sem fundo e sem erro.

O conserto é aspas, sempre:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

É também por isso que um codificador não precisa escapar espaços: eles são perfeitamente legais dentro de uma URL com aspas, e escapar cada um como `%20` custaria três caracteres por espaço do arquivo. As duas decisões andam juntas, porque, pondo a URI entre aspas, você pode deixar os espaços em paz. Todo formato que a ferramenta produz vem com aspas exatamente por isso.

## O tipo de mídia precisa estar certo

Uma data URI declara o próprio tipo, e o navegador acredita na palavra dela. Não existe farejamento de recuo como existe para um arquivo buscado: diga `image/png` sobre algo que na verdade é um JPEG e a imagem não é desenhada, sem mensagem em lugar nenhum útil.

O que importa porque extensões de arquivo mentem. Uma foto exportada como JPEG e renomeada para `logo.png` é uma coisa comum de se achar num disco. Os primeiros bytes de um arquivo de imagem, por outro lado, dizem o que ele é sem ambiguidade, porque todo formato tem uma assinatura. Uma ferramenta deveria ler o arquivo em vez do nome dele. A daqui lê, e avisa quando os dois discordam.

Dois formatos valem menção porque falham de um jeito confuso. **HEIC**, que é como um iPhone fotografa, e **TIFF**, que é o que os scanners produzem, geram data URIs perfeitamente válidas que navegador nenhum, exceto o Safari, vai desenhar. A URI não está quebrada: o formato simplesmente não é um que a web suporte. Converta antes.

## Os metadados que você não pretendia publicar

Uma data URI é uma cópia do arquivo, byte por byte. Nada é decodificado e recodificado, o que normalmente é a graça, porque nenhuma qualidade se perde, mas também significa que todo o resto do arquivo vem junto.

Uma fotografia recém-saída de um celular carrega EXIF: as coordenadas de GPS de onde foi tirada, a hora, o modelo da câmera e muitas vezes o número de série dela. Isso pode ser 30 KB do arquivo. Embutido, vira 40 KB de base64 na sua folha de estilo, no caminho crítico de toda página, e um endereço residencial comprometido num repositório, numa forma em que ninguém jamais vai pensar em olhar.

Limpe antes com o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/), que reescreve o contêiner sem encostar na imagem, e há [um guia sobre isso](https://abox.tools/pt/guias/remover-dados-exif-e-gps/) também. O Imagem para data URI lê quanto metadado existe num JPEG, PNG ou WebP e diz isso antes de você copiar qualquer coisa.

## Onde colocar, depois de ter a linha

Se a imagem aparece numa regra, ponha a URI naquela regra. Se aparece em mais de uma, e ícones em geral aparecem quando você conta o estado de hover e o tema escuro, declare uma vez como propriedade personalizada:

```
:root {
  --icon-search: url("data:image/svg+xml,%3Csvg ... %3E");
}

.search-field { background-image: var(--icon-search); }
.search-button::before { content: var(--icon-search); }
```

Uma URI de 3 KB colada em quatro regras são 12 KB de folha de estilo e quatro lugares para editar quando o ícone mudar. A propriedade personalizada é um de cada. É também o formato que faz a troca de tema funcionar: redefina `--icon-search` dentro de uma media query e todo uso dela acompanha.

Para uma tag `<img>` em vez de CSS, inclua `width` e `height`. Uma imagem embutida carrega instantaneamente, então um tamanho faltando é um deslocamento de layout que acontece rápido demais para ser visto e continua contando contra você. A exceção é o SVG: um que carrega só um `viewBox` não tem tamanho em pixels próprio, e escrever na tag o padrão de ⁦300×150⁩ do navegador prende uma imagem escalável num tamanho que ninguém escolheu.

Deixe o `alt` vazio a menos que você tenha algo verdadeiro para pôr nele. Só você sabe se a imagem carrega significado ou é decoração, e uma descrição chutada a partir de um nome de arquivo é pior para quem usa leitor de tela do que descrição nenhuma.

![O cartão de forma: botões escolhendo o que deve sair, uma regra de fundo CSS, uma tag img ou o URI puro, e uma chave entre base64 e SVG aberto.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Para onde vai decide o que sai, então a pergunta vem primeiro em vez de virar exercício de copiar e colar.

## Quando a resposta é “não faça”

Se a imagem passa de uns 50 KB codificada, embutir é a ferramenta errada e nenhum cuidado com a codificação conserta. As alternativas, na ordem em que vale tentar:

- **Deixe menor.** A maioria das imagens grandes demais para embutir é grande demais em geral. O [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) leva uma fotografia a um tamanho que você diz, e o [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/) corta as dimensões em pixels até o que o layout de fato usa, o que muitíssimas vezes é o problema real.
- **Redesenhe como SVG.** Um ícone exportado como PNG de 40 KB frequentemente é um SVG de 900 bytes. Isso não é diferença de compressão, é diferença de formato, e também resolve o problema das telas retina.
- **Deixe como arquivo e faça preload.** `<link rel="preload" as="image">` começa a busca na hora sem mover os bytes para o caminho crítico. Rende quase todo o benefício de embutir e nenhum dos custos de cache.

## Nada disso precisa de envio

Codificar um arquivo em base64 é aritmética. São duas funções que o navegador tem desde o começo, o `btoa` e o `encodeURIComponent`, e não existe motivo técnico nenhum para uma imagem viajar até um servidor e voltar só para ser escrita de outro jeito. Qualquer conversor que envia o seu arquivo para fazer isso está enviando pelos motivos dele, não pelos seus.

[A ferramenta daqui](https://abox.tools/pt/imagem-para-base64/) não manda a imagem para lugar nenhum: a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, e nenhum deles é deste site. Se você prefere conferir a acreditar, carregue a página, desligue a internet e codifique alguma coisa assim mesmo. O [É seguro enviar arquivos para conversores online?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) traz mais três verificações que você pode fazer em qualquer ferramenta.
