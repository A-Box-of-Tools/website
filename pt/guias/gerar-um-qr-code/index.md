# Como gerar um QR Code que ainda escaneia no celular dos outros

Gerar um QR Code leva um segundo. Gerar um que funcione num cardápio molhado, num ponto de ônibus ou num celular esticado no braço com pouca luz leva quatro decisões, e as quatro são tomadas antes de imprimir qualquer coisa. Aqui está o que cada uma faz.

[Abrir Gerador de QR Code e código de barras](https://abox.tools/pt/gerar-qr-code/): Digite, e vira um código. Nada é enviado para fazer um.

Última atualização 13 de outubro de 2026

## A resposta curta

Abra o [Gerador de QR e códigos de barras](https://abox.tools/pt/gerar-qr-code/), cole o link, deixe nível **M** e margem **4** e baixe SVG. Para um cartão de mão com link curto, comece com dois ou três centímetros, escuro sobre claro, e teste a impressão na distância prevista. Densidade, superfície e celular importam mais que um mínimo universal.

Isso cobre quase todos os casos. O resto desta página é o que fazer quando não é um deles: um código que precisa aguentar ser manuseado, um código com uma logomarca em cima, um código indo para algo pequeno, e a única decisão que é fácil de errar de um jeito que você só descobre um ano depois.

## Acesso de visitantes, contatos e etiquetas de equipamentos

Para visitantes, escolha *Rede Wi-Fi*, informe nome exato, segurança e senha e confira a string. Deixe M e quatro módulos para um cartão interno comum, exporte SVG e teste se a impressão conecta à rede correta. Quem lê o código pode recuperar a senha; mudá-la exige um código novo. Para um cartão de visitas, escolha *Cartão de contato* e confira se o celular salva nome, e-mail e número previstos.

Uma etiqueta útil em impressora ou aparelho compartilhado aponta para seu manual ou configuração. Escolha *Texto ou link*, use um endereço HTTPS curto e estável que controla e imprima o nome do equipamento ao lado. Experimente Q ou H onde pode sujar. Preserve quatro módulos de borda e [teste a etiqueta montada](https://abox.tools/pt/guias/criar-um-codigo-qr-e-provar-que-escaneia/), incluindo abrir as instruções no celular. A página ainda precisa de conexão.

## O que existe de fato dentro de um QR Code

Uma cadeia de texto. É isso tudo. Escanear um QR Code entrega ao celular um pedaço de texto, e todo o resto, seja abrir uma página, entrar numa rede ou oferecer para salvar um contato, é o celular reconhecendo o formato daquele texto e se oferecendo para agir.

Não existe “QR Wi-Fi” como tipo de código. É um QR com `WIFI:T:WPA;S:My Network;P:the password;;` que um celular compatível reconhece como dados de rede. Teste os celulares previstos. O gerador mostra a string final por isso: se não fizer o esperado, confira essa string.

Um QR impresso não muda, não faz por si só requisições de rede e seu texto não expira. A página pode mudar ou desaparecer e a senha mudar; a impressão preserva a string antiga.

![Um código QR pronto com os dados embaixo: a simbologia, a versão, o nível de correção de erros e o número de caracteres que ele guarda.](https://abox.tools/screens/make-a-qr-code/result.webp)

O que há no código, dito nos termos que o resto deste guia usa. A versão cresce com o conteúdo, e é por isso que os dois ajustes de baixo importam.

## Decisão um: o nível de correção de erros

Um QR Code carrega um conjunto de palavras de verificação junto com os dados, calculadas de modo que um leitor consiga reconstruir o que não conseguiu enxergar. É por isso que um código com um canto rasgado ainda escaneia. Quantas dessas palavras existem é o nível, e há quatro:

- **L** — cerca de 7% do total de palavras de código.
- **M:** cerca de 15%.
- **Q:** cerca de 25%.
- **H:** cerca de 30%.

[A DENSO define os percentuais pelo total de palavras de código](https://www.qrcode.com/en/about/error_correction.html), não por módulos arbitrários ou área. Padrões de detecção danificados podem impedir a leitura antes da correção. Mais correção também ocupa espaço: o mesmo conteúdo costuma exigir um símbolo mais denso ou maior.

**L** é para tela: um código num slide, num e-mail, numa página web. Nada vai danificá-lo, e cada módulo a mais o torna mais difícil de ler de longe.

**M** é o padrão e a resposta certa para a maior parte da impressão. Papel que vai ser manuseado um pouco, um panfleto, um cartão de visita.

**Q e H** são para códigos que vão apanhar: um cardápio limpado todo dia, um adesivo numa máquina de oficina, uma etiqueta num engradado, um código numa vitrine que pega sol direto. O H é também o que torna possível uma logomarca no meio, como aparece abaixo.

![As opções do QR: um menu de nível de correção de erros em médio e uma zona de silêncio de quatro módulos.](https://abox.tools/screens/make-a-qr-code/options.webp)

Os dois servem para o código sobreviver ao mundo real, uma dobra, um logotipo, uma impressão ruim, e os dois são definidos antes de ele ser desenhado.

## Decisão dois: a margem, que faz parte do código

O espaço branco em volta de um QR Code não é enchimento, e não é escolha de design. Um leitor usa esse espaço para achar onde o símbolo termina. A especificação pede quatro módulos de espaço em silêncio de cada lado, e um código aparado até a borda é o motivo isolado mais comum de um código impresso falhar.

Vale ser direto sobre isso porque aparar é uma coisa tão natural de fazer. O código parece ter branco demais em volta, então é cortado no layout, ou jogado sobre um painel colorido que encosta nos quadradinhos, ou colocado sobre uma fotografia. Cada uma dessas coisas remove a fronteira que o leitor ia usar.

Se o código parece grande demais com a margem, deixe o código menor. Não tire a margem.

## Decisão três: de que tamanho imprimir

O tamanho depende dos módulos necessários, nitidez da impressão, distância e câmera. Uma URL curta simplifica o símbolo em relação a uma longa com rastreamento. Dois ou três centímetros servem como primeira prova para um cartão de mão, não são garantia nem mínimo do padrão. Uma placa lida de longe precisa de uma prova maior nessa distância.

[O exemplo de tamanho da DENSO](https://www.qrcode.com/en/howto/code.html/index.html) calcula o símbolo pela versão e tamanho do módulo impresso e adiciona quatro módulos livres em cada lado. Preserve essa borda. Se um código denso falhar, encurte o conteúdo ou dê mais espaço, sem cortar a borda.

Imprima a partir de **SVG**: suas bordas escalam com o layout. Se só aceitar PNG, use pixels suficientes para o tamanho final e evite ampliar uma saída pequena. Escaneie a prova real; nenhum formato garante que uma impressora ou celular específico leia.

## Cor, contraste e os dois erros

Um leitor mede a diferença entre os módulos escuros e os claros, então o contraste é tudo. Duas coisas dão errado com regularidade:

**Código claro sobre fundo escuro.** Fica bonito, e um bom número de leitores recusa de cara, porque eles procuram escuro sobre claro e não tentam a inversão. Alguns tentam. Você não vai saber quais os seus clientes têm.

**Diferença insuficiente.** Cinza médio sobre branco, ou duas cores de marca com peso parecido, podem medir bem na tela e falhar no papel quando entram o espalhamento da tinta e a exposição automática de um celular. Se você está colorindo um código, mantenha a parte escura genuinamente escura.

Fosco ganha de brilhante para qualquer coisa que vá ser escaneada sob uma luz, e os dois ganham de imprimir sobre uma fotografia. Fundos transparentes são úteis para colocar um código num painel colorido, mas confira o que de fato acaba atrás dele, porque um código transparente num painel escuro é o primeiro erro acima com etapas a mais.

## Uma logomarca no meio

Um logo pequeno pode funcionar, mas o gerador não o coloca. Se adicionar em um editor, use H e deixe livres os padrões de localização e alinhamento. Não há fração segura garantida: [a DENSO define restauração sobre o total de palavras de código](https://www.qrcode.com/en/about/error_correction.html), não quadrados arbitrários. Posição, densidade e impressão importam. Teste o desenho impresso em vários celulares e reduza ou tire o logo se dificultar a leitura.

## A decisão de que as pessoas se arrependem: estático ou “dinâmico”

Procure por um gerador de QR Code e a maioria dos resultados vai querer que você crie uma conta, porque eles estão vendendo códigos *dinâmicos*. Um código dinâmico não contém o seu link. Contém um link curto para o servidor do próprio gerador, que redireciona para o seu.

O que isso rende a você é real: você pode mudar para onde o código aponta depois de impresso, e recebe uma contagem de cada escaneamento. Para uma campanha com uma tiragem de seis dígitos, isso vale pagar.

O que isso custa também é real, e vale saber antes em vez de depois:

- **O código para de funcionar quando eles pararem.** Se o serviço fechar, o domínio expirar ou o plano gratuito acabar, todo código que você imprimiu morre, e a essa altura eles estão em dez mil cardápios.
- **Cada escaneamento é dado de outra pessoa.** O redirecionamento enxerga o endereço IP, a hora e o aparelho de cada pessoa que escaneia o seu código.
- **O link é deles, não seu.** Quem escaneia vê um domínio desconhecido piscar na tela, que é exatamente aquilo de que as pessoas estão sendo orientadas a desconfiar.

O caminho do meio não custa nada: faça um QR Code estático em volta de uma URL curta *no seu próprio domínio*, e redirecione você mesmo. Você mantém a capacidade de trocar o destino, mantém as estatísticas, e nada sobre o código depende de uma empresa que você nunca viu continuar existindo no ano que vem.

O [gerador daqui](https://abox.tools/pt/gerar-qr-code/) só faz códigos estáticos, e não tem conta para criar. O que você digita é o que o código guarda.

## Antes de imprimir mil deles

Escaneie o código. Não o que está na sua tela, e sim a prova impressa, no lugar em que ele vai ficar, com um celular que não é aquele em que você o fez. Isso leva um minuto e pega a categoria inteira de problemas de que esta página trata: uma margem que o layout comeu, um link sem o `https://`, uma cor que mediu diferente no papel, um código impresso num tamanho que funciona numa mesa e não numa parede.

E confira o que acontece depois do escaneamento. Um código que abre uma página ilegível no celular é um código que falhou, mesmo tendo escaneado.

## Nada disso exige enviar coisa alguma

Um QR Code é aritmética sobre uma cadeia de texto. Não há arquivo para mandar e não há nada que um servidor consiga fazer que um navegador não consiga, e é por isso que a [ferramenta daqui](https://abox.tools/pt/gerar-qr-code/) faz tudo no seu próprio computador e funciona com a rede desligada.

Isso importa mais do que soa, por causa do que as pessoas colocam em QR Codes. O uso mais comum do formato de Wi-Fi é a senha real de uma rede, digitada numa página web. Vale saber se aquela página tinha para onde mandá-la.
