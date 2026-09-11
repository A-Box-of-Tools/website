# Tarjar PDF — as palavras saem, não é uma tarja por cima

As letras são apagadas do arquivo, e depois o arquivo é pesquisado para provar.

> Tire palavras de um PDF em vez de desenhar um retângulo preto por cima. As letras são apagadas das próprias instruções de desenho da página, o arquivo pronto é reaberto e pesquisado para provar que sumiram, e nada é enviado.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/tarjar-pdf/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem documentos. Não existe servidor.

O documento que você escolhe é aberto, lido, editado e reescrito na memória desta máquina, por código servido deste endereço. Não há aqui nada capaz de fazer um envio, e do outro lado desta página não existe servidor algum para receber um. Nem o arquivo nem as palavras que você pesquisou saem da aba.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu dispositivo

## Como tarjar um PDF para que as palavras sumam de verdade

1. **Escolha o PDF.** Um documento por vez, de propósito: tarjar é um trabalho que precisa ser olhado página por página, e uma ferramenta que deixasse você marcar palavras num arquivo e as aplicasse em silêncio a outro é exatamente como a coisa errada acaba sendo enviada. Ele é lido direto do seu disco pelo navegador.
2. **Diga o que precisa sair.** Digite as palavras — um nome, um endereço, um número de processo — e cada lugar em que aparecerem é listado com a linha em que está e uma caixinha para marcar. Os localizadores ao lado da caixinha procuram endereços de e-mail, números de cartão, IBANs, CPFs e números de seguridade social, e telefones. Eles são oferecidos, nunca marcados por você: um padrão não sabe distinguir um telefone de um número de processo.
3. **Leia a página e escolha palavras nela.** O painel mostra o texto do documento como ele está de fato guardado, na ordem em que um leitor o copiaria. Clique em qualquer palavra para tirá-la e clique de novo para mantê-la. Tudo o que está riscado é o que vai sumir — o que faz disto tanto a revisão quanto a seleção, e vale a pena fazer isso em cada página antes de apertar o botão.
4. **Tire-as, e leia a linha que diz que foi conferido.** As letras são apagadas, a lacuna que deixaram é mantida aberta, uma tarja preta é desenhada por cima se você pediu, e as mesmas palavras são tiradas dos marcadores, dos comentários, dos campos de formulário e das propriedades do documento. Depois o arquivo pronto é reaberto aqui e pesquisado. Se uma palavra que você tirou ainda puder ser encontrada nele, você não recebe download algum e recebe uma mensagem dizendo isso.

## A versão longa

[Como tarjar um PDF para que o texto suma de verdade](https://abox.tools/pt/guias/tarjar-um-pdf/): Uma tarja preta desenhada num leitor de PDF normalmente deixa as palavras embaixo dela, e copiar e colar as traz de volta na hora. O que uma tarjagem de verdade retira, os quatro lugares em que uma palavra se esconde fora da página, e como conferir um arquivo antes de mandá-lo.

## Também na caixa

- [Imagens para PDF](https://abox.tools/pt/imagens-para-pdf/): Coloque suas imagens num documento só.
- [Digitalizador de documentos](https://abox.tools/pt/digitalizar-documentos/): Fotografe a página. Você recebe de volta algo com cara de digitalização.
- [Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.
- [Cortador de áudio](https://abox.tools/pt/cortar-audio/): Marque os trechos que valem enquanto toca. Eles voltam num arquivo só, cortado onde você disse.

## Perguntas

### Qual a diferença entre isto e desenhar uma tarja preta num leitor de PDF?

Um retângulo desenhado num leitor é uma anotação: um objeto com uma posição, salvo ao lado da página. O texto embaixo está intacto. Qualquer um que selecione aquela área e aperte copiar, ou abra o arquivo em outro programa, ou passe nele qualquer extrator de texto, recebe as palavras de volta. Alguns leitores oferecem um comando “redact” que aplica a remoção direito — e vários oferecem só o desenho. Esta ferramenta não tem retângulo para tirar do caminho: as letras são recortadas das instruções de desenho da página, e a tarja preta, se você a deixar ligada, é desenhada depois sobre uma lacuna que já está vazia.

### Como eu sei que as palavras sumiram mesmo?

Porque a ferramenta confere, na sua máquina, e mostra a contagem. Quando o arquivo é escrito, ele é reaberto pelo mesmo leitor desta página, cada página é lida, cada marcador, comentário, campo de formulário e propriedade é recolhido, e cada palavra que você tirou é pesquisada. A linha de resultados diz quantas havia e quantas restam. Se a resposta não for a que deveria ser, a execução falha e nada é oferecido para download. Você também pode conferir depois, em qualquer leitor: aperte Ctrl+F e procure a palavra.

### O resto da página se desloca quando uma palavra é retirada?

Não. O texto é desenhado avançando uma caneta pela página, então apagar cinco letras normalmente puxaria o resto da linha cinco letras para a esquerda. A largura exata do que foi retirado é medida a partir das próprias métricas da fonte e reposta como uma instrução de espaçamento, que move a caneta sem desenhar nada. As colunas continuam alinhadas e os totais continuam sob os seus títulos.

### Ele consegue tarjar um documento digitalizado?

A imagem não, e ele diz isso em vez de fingir. Uma digitalização é a fotografia de uma página: as palavras são pixels e não há texto a retirar. O que uma digitalização muitas vezes carrega é uma camada de texto invisível que o OCR do digitalizador escreveu sobre a imagem para que a página possa ser pesquisada — esta ferramenta encontra essa camada, tira dela o que você escolher, e diz na página que a imagem continua inalterada. Assim uma pesquisa e uma cópia param de achar a palavra, e uma pessoa olhando a página continua lendo. Para uma imagem, o [tarjador de imagens](https://abox.tools/pt/tarjar-imagem/) sobrescreve os próprios pixels.

### E as partes de um documento que não estão numa página?

Elas são tratadas, porque é por ali que uma tarja costuma vazar. As mesmas palavras são tiradas dos marcadores, dos comentários e das notas adesivas, do que foi digitado em campos de formulário, do texto que um leitor de tela recebe, e do texto de substituição que um leitor copia *no lugar* das letras da página — esse último existe para que ligaduras e palavras partidas por hífen sejam copiadas direito, e pode guardar uma frase inteira. As propriedades do documento e o pacote XMP são removidos por completo. Anexos e tudo o que roda quando o arquivo abre são descartados, porque em nenhum dos dois é possível pesquisar as palavras que você está tirando.

### Os meus documentos são enviados para algum lugar?

Não. O arquivo é lido, editado e escrito pelo seu próprio navegador no seu próprio hardware. Esta ferramenta não tem lado servidor, e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar — nenhum deles pertence a este site. O que você digita na caixa de pesquisa é comparado com texto na memória desta aba e também não vai a lugar nenhum.

### Por que não posso arrastar uma caixa sobre a página como em outras ferramentas?

Porque desenhar uma página significa um renderizador de PDF completo — fontes, degradês, transparência, modos de mesclagem — que é um megabyte ou mais de motor para buscar e rodar, e este site não entrega nenhum. Acontece que isso combina com o trabalho: arrastar um retângulo seleciona uma *área de papel*, e uma área de papel não é a mesma coisa que o texto embaixo dela, e é assim que a falha da tarja preta começa. O que você recebe no lugar é o texto do documento, na ordem de leitura, com cada palavra clicável. É também a única visão capaz de lhe dizer o que uma imagem da página não pode: se as palavras à sua frente são texto.

### O arquivo pronto vai abrir em qualquer lugar?

Sim. A saída é escrita como PDF 1.5, ou a versão mais alta de que o arquivo que você deu precisou, e a 1.5 é entendida por todo leitor lançado desde 2003. Nada na página é recodificado: as fontes, as imagens e o desenho vetorial passam byte a byte, então o que sobra do texto continua selecionável e pesquisável exatamente como era.

### Ele abre um PDF protegido por senha?

Não, e isso é de propósito. Um documento criptografado é recusado com uma mensagem dizendo isso, mesmo quando a senha é vazia — que é como muitos digitalizadores e copiadoras salvam. Tirar a proteção de um arquivo é um trabalho diferente de tirar palavras dele, e uma ferramenta que fizesse isso em silêncio estaria fazendo algo que você não pediu.

### Há limite de tamanho, e custa alguma coisa?

Não há limite escrito na ferramenta. O limite é a sua própria máquina: o documento fica na memória enquanto se trabalha nele, então um notebook aguenta algumas centenas de megabytes sem reclamar e começa a penar acima disso. É grátis, não há conta, não há login e não há teste. O site exibe publicidade, e é ela que o paga; os anunciantes não recebem nada sobre os seus documentos.

### Funciona offline?

Sim. Carregue a página uma vez, depois desconecte da internet e ela continua funcionando. É também a maneira mais simples de provar que nada é enviado: uma ferramenta que mandasse o seu documento para ser tarjado em outro lugar pararia no instante em que você tirasse o cabo.

## Como dá para conferir a promessa de privacidade

- **Um retângulo preto não é uma tarja, e aqui não se desenha um por cima de nada.** Em quase todo programa que se oferece para tarjar uma página — um leitor de PDF, um editor de texto, um programa de design — o retângulo é um objeto salvo ao lado do texto e não dentro dele. O texto continua lá, no mesmo arquivo, no mesmo lugar, e selecionar a área e apertar copiar o devolve. Essa falha publicou peças judiciais, relatórios de inteligência e, em dezembro de 2025, nomes enegrecidos numa divulgação em massa de documentos do Departamento de Justiça dos Estados Unidos que estavam legíveis em poucas horas. Esta ferramenta apaga as letras das instruções que desenham a página. Não há um retângulo com algo embaixo, porque embaixo não há nada.
- **O arquivo pronto é reaberto e pesquisado, aqui, antes de ser oferecido a você.** Até isso acontecer, toda afirmação acima é esta ferramenta corrigindo a própria prova. Então os bytes que estão prestes a virar o seu download são devolvidos ao mesmo leitor como se um estranho os tivesse mandado, cada página é lida de novo, cada marcador, comentário, campo de formulário e propriedade do documento é recolhido, e as palavras que você tirou são pesquisadas. A contagem fica nos resultados. Se alguma coisa sobreviveu, a execução é relatada como falha e não há download.
- **As palavras nunca saem da aba, e a pesquisa também não.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles pertence a este site. Esta ferramenta não acrescenta nada a essa lista: ela não tem função de rede própria, nem opcional. O que você digita na caixa de pesquisa é uma sequência de caracteres comparada com texto na memória desta aba, e não há para onde nenhum dos dois ir.
- **Tarjar é o trabalho que menos sobrevive a um envio.** O que as pessoas tarjam é o motivo pelo qual aquilo não deve ser enviado. Um depoimento de testemunha, uma carta médica, um extrato bancário indo para um locador, um contrato com o nome de um cliente indo para outro. Entregar isso ao servidor de um estranho para que a parte privada seja tirada significa que a parte privada chega primeiro, intacta, e é essa a versão que eles guardam. Esta página não tem outra metade.
- **O que sobra é copiado intacto.** Os únicos bytes que mudam numa página são as instruções de escrita de texto de que as letras removidas faziam parte. Todas as outras instruções, e cada fonte, imagem e linha a que a página se refere, são copiadas exatamente como chegaram — nada é redesenhado, recodificado ou refluído. A largura do que foi tirado é medida e reposta como uma instrução de espaçamento, de modo que o resto da linha continua onde o documento o pôs.
- **Ele não consegue tirar palavras de uma fotografia, e diz quais páginas são essas.** Uma página digitalizada é uma imagem. As palavras nela são pixels, não texto, e nada aqui consegue tocá-las. Se a digitalização carrega a camada invisível e pesquisável que o OCR de um digitalizador produz, esta ferramenta remove essa camada — que é o que uma pesquisa e uma cópia teriam encontrado — e diz com todas as letras na página que a imagem continua mostrando as palavras. Cobrir essa imagem é outro trabalho; o [tarjador de imagens](https://abox.tools/pt/tarjar-imagem/) é a ferramenta que sobrescreve pixels.
- **O documento para de dizer de onde veio.** As propriedades e o pacote XMP saem a cada execução: sem linha de produtor, sem data de criação, sem autor, sem título, e sem nenhum dos blocos privados que um programa de diagramação deixa para trás. Um arquivo cujas páginas tiveram um nome retirado e cujas propriedades ainda dizem `acordo Silva versao 3.docx` não foi tarjado, e isso não é coisa para se deixar a cargo de uma caixinha marcada.
- **Arquivos criptografados são recusados em vez de abertos.** Um PDF com senha é recusado, inclusive do tipo que os digitalizadores produzem com senha vazia e que tecnicamente abriria. Tirar a proteção de um documento é um trabalho diferente de tirar palavras dele, e fazê-lo em silêncio seria uma coisa surpreendente para uma ferramenta fazer em seu nome.
- **O que o Google carrega, e o que não recebe.** Os scripts de publicidade e medição vêm do Google. Nenhum dos dois recebe nada sobre o seu documento: nem um arquivo, nem uma página, nem um nome, um tamanho, uma contagem de páginas ou uma palavra que você pesquisou. Cada linha que lê, edita ou escreve um PDF é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não recebe.** O botão “Buy me a coffee” no topo é desenhado por um script de cdnjs.buymeacoffee.com e busca as letras no Google Fonts. É um link e nada mais: não relata visita alguma, e não recebe nada sobre você nem sobre os seus documentos. Nada acontece a menos que você clique, e para onde você iria ao clicar é o site de outra pessoa.
- **Funciona offline.** Desconecte da rede e tudo nesta página continua funcionando. É a prova mais simples de todas: uma ferramenta que mandasse o seu documento para ser tarjado em outro lugar pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/shared/pdf-text.js` para como cada palavra de uma página é encontrada e localizada, e `src/edit.js` para o apagamento em si — o que é recortado das instruções da página e o que é reposto para que o resto da linha não se desloque. Nenhum deles consegue alcançar a rede, e o leitor e o escritor ao lado também não.
