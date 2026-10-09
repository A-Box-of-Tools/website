# GIF para MP4 — a mesma animação com um décimo do tamanho

Cada quadro, com a duração definida no GIF, em H.264 dentro de um MP4. Conversão no seu computador; o arquivo não é enviado.

> Transforme um GIF animado em MP4 no navegador, com uma fração do tamanho. Cada quadro mantém a duração original do GIF, sem reamostragem. H.264 em MP4, o arquivo aceito por todas as plataformas. Sem upload.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/gif-para-mp4/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem GIFs. Não existe servidor.

O GIF escolhido é decodificado, desenhado quadro a quadro, codificado e gravado em MP4 na memória deste computador, com o codificador do seu navegador e código servido por este site. Nada aqui pode enviar um arquivo, e não há servidor para recebê-lo.

- ✗ Sem upload
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como converter GIF em MP4

1. **Escolha o GIF.** Um por vez. O navegador o lê diretamente do disco, e a página informa tamanho do arquivo, quantidade de quadros, duração e dimensões em pixels.
2. **Confira o que será gravado.** Uma linha informa as dimensões, os quadros e sua temporização, a duração e a taxa de bits. Não há configuração a fazer, a menos que o GIF tenha áreas transparentes. Nesse caso, aparece um campo para escolher a cor de fundo.
3. **Converta e confira a mensagem de verificação.** Cada quadro é desenhado e codificado, com uma barra de progresso. Depois, o arquivo pronto é reaberto e precisa ter a mesma duração do GIF e todos os quadros presentes. A prévia abaixo do botão para baixar reproduz o arquivo da memória em repetição, para você conferir a passagem entre o fim e o início.

## A versão longa

[Como converter um GIF para MP4 e por que ele fica tão menor](https://abox.tools/pt/guias/converter-gif-para-mp4/): Por que o MP4 da mesma animação costuma ocupar um décimo do GIF, o que muda na conversão, por que o tempo de cada quadro importa e como converter no navegador sem enviar o arquivo.

## Também na caixa

- [Vídeo para GIF](https://abox.tools/pt/video-para-gif/): Escolha o trecho, o tamanho e a taxa de quadros.
- [Criador de GIF](https://abox.tools/pt/criar-gif/): Transforme um punhado de imagens em uma animação só.
- [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/): Cada quadro sai no próprio PNG.
- [Analisador de GIF](https://abox.tools/pt/analisar-gif/): Quadros, tempos, paletas e para onde foi cada byte.

## Perguntas

### Por que o MP4 é muito menor?

Porque GIF guarda cada quadro como uma imagem de até 256 cores, sem considerar o quadro anterior, enquanto um codec de vídeo guarda apenas o que mudou. H.264 tem trinta anos de experiência nisso. A mesma animação normalmente fica com um décimo do tamanho, ou menos, e com aparência melhor, porque já não se limita a 256 cores. Um GIF muito pequeno ou quase estático pode gerar um arquivo maior; a página avisa quando isso acontece.

### A temporização será igual?

Sim, quadro a quadro. GIF não tem taxa fixa de quadros, apenas uma duração para cada um. O vídeo preserva essas durações: cada quadro do GIF vira um quadro de vídeo que permanece pelo mesmo tempo. Nada é reamostrado, duplicado ou descartado. A única adaptação é a mesma dos navegadores: uma duração inferior a dois centésimos de segundo vira dez centésimos. Assim, o vídeo tem a duração do GIF reproduzido no navegador. O arquivo pronto é reaberto para conferir duração e quadros.

### O vídeo vai repetir?

Isso depende do player. GIF guarda uma instrução de repetição; MP4 não, e o player decide. A maioria dos feeds e aplicativos de mensagens repete vídeos curtos. A prévia desta página repete para você conferir a passagem entre o fim e o início. Um player no computador normalmente reproduz uma vez.

### O que acontece com as áreas transparentes?

Elas recebem uma cor, porque um vídeo é um retângulo opaco. Se o GIF tiver áreas transparentes, a página mostra o campo de cor, com branco como padrão porque a maioria das páginas usa esse fundo. Se não tiver, o campo fica oculto. A cor é desenhada atrás dos quadros antes da codificação e passa a fazer parte da imagem.

### As dimensões da imagem mudam?

H.264 exige dimensões pares: uma largura ou altura ímpar recebe uma linha de fundo sem reamostragem. Se o maior lado passar de 3840 pixels, o GIF é reduzido até esse limite. A página informa o tamanho real antes de começar. Reduzir a saída não reduz os buffers de composição da origem.

### Quanto tempo leva?

Um GIF comum costuma levar segundos com codificação por hardware, mais sem ela. A barra mostra o quadro atual. Cancelar descarta o codificador e sua saída; uma consulta nativa de compatibilidade, leitura ou desenho síncrono ainda podem terminar. Um trabalho tardio não substitui uma origem ou resultado mais recente.

### Meus GIFs são enviados para algum lugar?

Não. O GIF é lido, decodificado, codificado e gravado pelo seu navegador, no seu computador. A `Content-Security-Policy` lista todos os endereços que a página pode contatar — nenhum pertence a este site. A forma mais simples de conferir é desconectar a rede e usar a página mesmo assim.

### Funciona no celular?

Sim, se o navegador do celular conseguir codificar vídeo. O codificador por hardware do próprio celular é rápido. O limite é a memória: os quadros do GIF são decodificados na memória primeiro, então um GIF muito longo pode exceder a capacidade do aparelho.

### Há limite de tamanho, e custa alguma coisa?

O leitor retém no máximo 512 milhões de pixels de regiões decodificadas, e a conversão recusa uma estimativa de buffers conhecidos acima de 512 MiB. Isso não garante um limite para a memória interna do codec nem todas as alocações do navegador. A página explica as recusas. É grátis, sem conta, login ou período de teste. Os anúncios sustentam o site e não recebem informações sobre seus GIFs.

### Funciona offline?

Sim. Carregue a página uma vez e desconecte a internet: ela continua funcionando. Essa também é a forma mais simples de provar que nada é enviado. Uma ferramenta que enviasse seu GIF para conversão pararia assim que você se desconectasse.

## Como dá para conferir a promessa de privacidade

- **Por que um MP4 tem um décimo do tamanho e as plataformas o preferem.** Um GIF guarda cada quadro como uma imagem, com no máximo 256 cores e sem considerar o quadro anterior. Um codec de vídeo guarda o que mudou, com todas as cores, e H.264 tem trinta anos de experiência nisso. A mesma animação costuma ficar com um décimo do tamanho, ou menos, e com aparência melhor. É por isso que redes sociais, aplicativos de mensagens e sistemas de conteúdo recusam GIFs grandes ou os transformam silenciosamente em MP4 durante o upload — e por que, quando aparece “GIF muito grande”, MP4 geralmente era o formato desejado.
- **O upload é a parte demorada, e aqui ele não acontece.** Todo conversor online pede o arquivo primeiro: 30 MB passam pela sua conexão para que 3 MB voltem, antes mesmo de perguntar quem guarda o arquivo. Esta página lê o GIF com código servido por este site e grava o MP4 com o codificador já disponível no navegador. Os bytes só vão do disco à memória e de volta. A `Content-Security-Policy` lista todos os endereços que a página pode contatar — nenhum pertence a este site — e a ferramenta funciona sem conexão à rede.
- **A duração é preservada quadro a quadro, algo que muitos conversores fazem errado.** Um GIF não tem taxa fixa de quadros. Cada quadro define quanto tempo permanece, e essa duração varia: uma apresentação pode mostrar uma imagem por dois segundos e depois passar rapidamente por dez. Um conversor que escolhe uma taxa fixa e reamostra duplica alguns quadros e descarta outros, deixando a apresentação truncada ou mais curta. Aqui, cada quadro do GIF vira um quadro de vídeo com exatamente sua duração original — a única adaptação é a mesma dos navegadores: uma duração inferior a dois centésimos de segundo é reproduzida como dez centésimos. O arquivo pronto é reaberto para conferir que todos os quadros estão presentes e que a duração corresponde à do GIF.
- **Duas coisas que um GIF faz e um vídeo não, explicadas antes.** Um GIF pode deixar o conteúdo atrás dele aparecer; um vídeo é um retângulo opaco. Onde o GIF é transparente, é preciso colocar uma cor, e a página pergunta qual — apenas quando há transparência, com branco como padrão porque a maioria das páginas usa esse fundo. Além disso, um GIF guarda a instrução de repetir; um MP4 não. A repetição depende do player. A maioria dos feeds e aplicativos de mensagens repete vídeos curtos. A prévia aqui repete para você conferir a passagem entre o fim e o início.
- **O custo no seu computador, explicado com clareza.** A codificação por hardware costuma levar segundos para um GIF comum; por software pode levar mais tempo. O leitor retém no máximo 512 milhões de pixels de regiões decodificadas. A conversão também recusa uma estimativa acima de 512 MiB para os buffers conhecidos: entrada retida, tela inteira, cópias de restauração e vídeo coletado. A memória interna do codec pode acrescentar mais. Cancelar descarta a execução; uma leitura nativa ou um desenho síncrono ainda podem terminar.
- **O que o Google carrega e o que não recebe.** Os scripts de anúncios e medição vêm do Google. Nenhum recebe informações sobre seu GIF: arquivo, quadro, nome, tamanho ou duração. Todo o código que lê, codifica ou grava o arquivo é servido por este site e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão "Buy me a coffee" no cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e usa letras do Google Fonts. É apenas um link: não registra visitas e não recebe informações sobre você ou seus GIFs. Nada acontece até você clicar, e o destino é um site de outra pessoa.
- **Funciona offline.** Desconecte a rede e tudo nesta página continua funcionando. Essa é a prova mais simples: uma ferramenta que enviasse seu GIF para conversão pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/plan.js` para ver como a duração de cada quadro do GIF vira a temporização do vídeo, `src/encode.js` para o desenho e a codificação, e `src/shared/gif-decode.js` para o leitor. Nenhum pode acessar a rede, nem o gravador que os acompanha.
