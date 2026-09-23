# Analisador de GIF — o que tem de verdade dentro de um GIF

Quadros, tempos, paletas e para onde foi cada byte.

> Desmonte um GIF no navegador: cada quadro com o tempo e o descarte dele, as tabelas de cor, as repetições e um detalhamento byte a byte de para onde foi o tamanho do arquivo. Nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/analisar-gif/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem GIFs. Não existe servidor.

O arquivo é aberto e desmontado pelo seu próprio navegador: a estrutura de blocos, a descompactação LZW e cada quadro desenhado nesta página acontecem neste computador. Do outro lado desta página não existe servidor nenhum para receber um arquivo, mesmo que algo aqui quisesse mandar.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como analisar um GIF

1. **Escolha um GIF.** Arraste até o seletor ou procure na mão. O navegador lê direto do seu disco, e nesse meio-tempo nada sai daqui.
2. **Leia primeiro o resumo.** O tamanho da tela, a quantidade de quadros, quanto tempo a animação diz que dura e quanto ela toca de verdade. Esses dois últimos divergem mais do que as pessoas esperam, e o motivo está na seção seguinte.
3. **Veja o que chama atenção.** Cada linha ali é medida no seu arquivo: tempos que navegador nenhum vai respeitar, um bloco de repetição faltando, tabelas de cor que ninguém referencia, metadados maiores do que alguns quadros. Nada é um chute sobre o que você pretendia fazer.
4. **Veja para onde foram os bytes.** Cada byte do arquivo está em exatamente uma linha, e as linhas somam o arquivo. Se a maior parte não estiver em “pixels compactados”, o resto da tabela diz onde ela está.
5. **Passe pelos quadros.** Cada um mostra o tempo, o retângulo, o método de descarte e o tamanho dele. Alterne entre “a tela depois de cada quadro” e “só o que cada quadro guarda”: é no segundo que você vê se o arquivo está otimizado, porque um GIF bem feito guarda retângulos minúsculos e um mal feito guarda a imagem inteira toda vez.
6. **Leve o relatório se precisar.** A análise inteira em texto puro, para colar numa mensagem ou guardar ao lado do arquivo. Ele é montado na própria página a partir do que já está na sua tela.

## A versão longa

[O que tem de verdade dentro de um GIF](https://abox.tools/pt/guias/o-que-tem-dentro-de-um-gif/): Quadros, atrasos, métodos de descarte e tabelas de cor explicados, por que os navegadores recusam os atrasos mais rápidos, e como descobrir para onde foi mesmo o tamanho de um GIF.

## Também na caixa

- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.
- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.
- [Cortador de vídeo](https://abox.tools/pt/cortar-video/): Reduza um clipe à parte que importa.
- [Inversor de vídeo](https://abox.tools/pt/inverter-video/): O último quadro primeiro, com som e tudo.

## Perguntas

### O meu GIF é enviado para algum lugar?

Não. O arquivo é lido, descompactado e desenhado pelo seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todo endereço que ela pode contatar: nenhum é nosso. Tire da tomada e ela continua analisando GIFs.

### Por que meu GIF toca mais devagar do que os tempos dizem?

Porque todo navegador se recusa a respeitar um tempo abaixo de dois centésimos de segundo e segura o quadro por um décimo no lugar. A regra foi escrita dentro do Netscape em 1996, para os globos giratórios e as placas de “em construção” da época, e foi copiada para todo navegador desde então; ninguém nunca tirou. \
\
Então um GIF cujos quadros dizem todos 0,01 s não toca a 100 quadros por segundo. Toca a 10, de cinco a dez vezes mais devagar do que o programa que o fez pretendia. Esta página mostra os dois números, o que o arquivo diz e o que ele vai fazer de verdade, e marca os quadros afetados. O conserto, no programa que escreveu o arquivo, é escrever 0,02 em vez de 0,01.

### O que quer dizer “descarte”?

O que deixar na tela quando o tempo de um quadro acaba, e é o campo que decide se uma animação fica certa ou borra. \
\
**Deixar como está** quer dizer que o próximo quadro pinta por cima deste, que é o que você quer quando os quadros são opacos e se cobrem. **Voltar ao fundo** limpa antes o retângulo do quadro, que é do que a transparência precisa: sem isso, as partes vazadas do próximo quadro mostram o anterior por baixo. **Restaurar o que estava embaixo** devolve o que havia ali antes deste quadro desenhar, que é como se guarda um objeto pequeno se mexendo sobre um fundo parado. E **não especificado** quer dizer que o arquivo não falou nada, e todo visualizador trata isso como “deixar como está”.

### Por que o meu GIF é tão grande?

A tabela “Para onde foram os bytes” responde isso para o seu arquivo específico em vez de responder em geral, e só existem algumas respostas possíveis. \
\
Se quase tudo estiver em **pixels compactados**, o arquivo é simplesmente muita imagem: o GIF guarda cada quadro como pixels inteiros, sem compensação de movimento e sem botão de qualidade, então o tamanho é aproximadamente a área vezes a quantidade de quadros. Menos quadros, um tamanho menor ou menos cores são as únicas alavancas. \
\
Se uma fatia grande estiver em **tabelas de cor**, o arquivo está escrevendo uma paleta por quadro, a 768 bytes cada. Se uma fatia grande estiver em **metadados**, algum editor deixou um pacote XMP para trás, e ele pode sair sem encostar na imagem. E se todos os quadros cobrem a tela inteira, o codificador nunca descobriu qual parte mudou de verdade, e em qualquer coisa filmada ou gravada isso é quase o arquivo todo.

### Qual é a diferença entre as duas visões de quadro?

**A tela depois de cada quadro** é o que um visualizador mostra naquele momento: este quadro desenhado por cima do que os anteriores deixaram. **Só o que cada quadro guarda** é o retângulo que o arquivo realmente tem para aquele quadro, sozinho, sem nada embaixo. \
\
A segunda é a interessante. Um GIF pode guardar de um quadro só a parte da imagem que mudou, e é por isso que a gravação de tela de uma janela quase parada pode ser pequena. Se todo quadro do seu arquivo é a tela inteira, ninguém fez esse trabalho, e olhando a animação você não descobre: só olhando o que está guardado.

### Diz que o meu arquivo tem um comentário ou XMP. O que é isso?

Texto que viaja junto com a imagem e que visualizador nenhum desenha. Um bloco de comentário costuma ser o nome do programa que escreveu o arquivo. Um pacote XMP é o XML que um editor de imagens escreve para registrar o que fez, e pode levar o histórico de edições, a versão do programa e às vezes o nome do autor. \
\
Esta página imprime os dois por inteiro, porque a pergunta interessante sobre metadados é o que eles dizem, não o fato de existirem. São mostrados a você e a mais ninguém: nada neste repositório lê nada disso para alguém.

### Ele abre um GIF quebrado?

Ele tenta, e avisa onde desistiu. Um arquivo que termina no meio de um bloco, que tem um byte onde deveria haver um marcador, ou que carrega um quadro cujos dados compactados acabam cedo demais ainda vai mostrar tudo o que dava para ler até ali, com o problema nomeado no topo. Esse é justamente o caso em que mais se quer um analisador, então jogar o arquivo inteiro fora por causa de um byte ruim seria o comportamento errado.

### Ele altera o meu arquivo?

Não. Esta ferramenta só lê. Não existe arquivo de saída, nem recodificação, nem botão aqui que escreva um GIF: a única coisa que dá para baixar é uma cópia da análise em texto puro. O seu original continua intocado no seu disco, que é também a resposta honesta para o que acontece se você fechar a aba.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. Não tem limite de tamanho de arquivo além da memória do seu próprio computador. O site exibe publicidade, e é ela que paga a conta; os anúncios não recebem nada sobre o seu arquivo.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse o seu GIF embora para ser analisado pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **O seu GIF não tem para onde ir.** A Content-Security-Policy lista todo endereço que esta página pode contatar, e nenhum deles é nosso. Aqui não existe um ponto de coleta onde o seu arquivo pudesse parar, nem nada no código que o mandasse para lá se existisse. Isto já disse `connect-src 'none'`, que não abria exceção; a publicidade custou isso, e dizer isso faz parte do acordo.
- **O leitor são quatro arquivos deste repositório.** Nada aqui usa o decodificador de GIF do navegador para descobrir o que tem no arquivo, porque esse decodificador não diz para onde foi um byte. Então o formato é lido na mão: `src/gif.js` percorre os blocos, `src/lzw.js` expande os pixels, `src/frames.js` empilha tudo e `src/budget.js` soma as partes de volta e confere se elas dão o tamanho do arquivo.
- **Comentários e metadados são mostrados a você, e a mais ninguém.** Um GIF pode carregar um bloco de comentário, um pacote XMP descrevendo uma edição ou um perfil de cor, e esta página imprime todos eles. Eles vão parar na tela na sua frente e em lugar nenhum além disso: não existe neste repositório um evento de medição que leve nada disso, e a página não conseguiria enviar um nem se existisse.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre o seu arquivo: nem o arquivo, nem uma miniatura, nem um nome, um tamanho, uma contagem de quadros ou um comentário. Toda linha que lê, descompacta ou desenha um GIF é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e pega as letras no Google Fonts. Ele não é mais do que um link: não avisa ninguém da sua visita e não recebe nada sobre você nem sobre os seus arquivos. Nada acontece enquanto você não clicar, e o que você abriria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desligue a rede e tudo nesta página continua funcionando. Essa é a prova mais simples de todas: uma ferramenta que mandasse o seu GIF embora para ser analisado pararia no instante em que você tirasse da tomada.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/gif.js` para o leitor de blocos que percorre o arquivo, `src/lzw.js` para o descompactador e `src/budget.js` para a contabilidade dos bytes. Em nenhum deles existe uma linha capaz de alcançar a rede.
