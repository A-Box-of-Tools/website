# Empilhar imagens — junte uma sequência, arquivos RAW inclusive

Vinte quadros em um, sem vinte envios e sem um conversor RAW.

> Junte uma sequência de fotografias numa só: tire a média para matar o ruído, use a mediana para tirar as pessoas de uma cena, clareie para rastros de estrelas, ou faça focus stacking de uma macro. Lê CR2, NEF, ARW, DNG, RAF e CR3 puxando a prévia da própria câmera. Roda inteiramente no seu navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/empilhar-imagens/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem fotografias. Não existe servidor.

Cada quadro é aberto, decodificado, alinhado, combinado e escrito pelo seu próprio navegador, no seu próprio computador. Uma pilha de vinte arquivos RAW de 60 MB é cerca de um gigabyte de fotografias, e nenhum byte disso se move: a ferramenta não tem função de rede alguma, e os arquivos são lidos direto do seu disco por um worker que não tem para onde mandar nada.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca-d'água
- ✓ Lê RAW
- ✓ Funciona offline
- ✓ Código aberto

## Como empilhar um conjunto de fotografias no navegador

1. **Escolha os quadros.** Uma sequência de fotos, uma série de intervalômetro ou uma pasta de RAW com prévias JPEG utilizáveis. Espere os arquivos terminarem de abrir. Cada linha mostra o que foi encontrado: para RAW, a câmera e o tamanho real da prévia incorporada. Os arquivos que não puderam ser abertos ficam na lista para você conferir quais foram deixados de fora.
2. **Escolha o método que combina com o que você quer perder.** Ruído: média, ou sigma clipping para rejeitar valores diferentes dos demais. Pessoas, carros ou um avião: mediana, desde que ocupem cada parte da cena em menos da metade dos quadros. Rastros de estrelas: clarear. Macro fotografada ao longo do anel de foco: focus stacking. A nota abaixo do menu explica o método e seus limites.
3. **Decida se os quadros precisam de alinhamento.** Comece com Automático: ele mede deslocamento, rotação e escala e depois corrige a perspectiva quando regiões confiáveis espalhadas pela imagem concordam. É útil para estrelas em campo amplo. Só deslocamento exige menos medições para uma sequência estável. Escolha Não se os quadros já se encaixam, ou para rastros de estrelas que devem manter o movimento do céu. Um tripé fixo não mantém as estrelas alinhadas. Cada quadro é medido contra o marcado como referência, que é o primeiro até você escolher outro. “Usar como referência” muda a marca sem reordenar a lista.
4. **Leia os quatro números, e então aperte o botão.** Antes de começar, a página mostra o tamanho planejado do resultado, a memória estimada da pilha, as decodificações planejadas para empilhar e os bytes lidos na inspeção. Processos internos do navegador e liberação de memória podem consumir mais que os buffers modelados; esses números são um plano, não uma garantia do uso total. Se forem necessárias faixas, a página sugere uma resolução de trabalho menor. Depois, compare a referência com o resultado no tamanho real dos pixels e confira os detalhes de alinhamento antes de baixar.

## A versão longa

[Como empilhar fotografias para reduzir o ruído, ou tirar pessoas](https://abox.tools/pt/guias/empilhar-fotos-para-reduzir-ruido/): Empilhar junta uma sequência de quadros numa imagem só. Qual método usar depende do que você quer perder: ruído, transeuntes, ou a profundidade de campo rasa de uma macro. Como cada um funciona, quanto custa, e onde os arquivos RAW entram.

## Também na caixa

- [Censor de imagens](https://abox.tools/pt/tarjar-imagem/): O que você cobre é apagado do arquivo, não escondido dentro dele.
- [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/): Veja o que uma foto conta sobre você. Depois tire isso.
- [Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/): Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.
- [Imagem para ICO](https://abox.tools/pt/criar-favicon/): Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.

## Perguntas

### As minhas fotografias são enviadas para algum lugar?

Não. Cada quadro é aberto, decodificado, alinhado, empilhado e escrito pelo seu próprio navegador no seu próprio hardware. Esta ferramenta não tem função de rede alguma — nunca busca nada e nunca envia nada — e a `Content-Security-Policy` da página lista todos os endereços que ela pode contatar, e nenhum deles pertence a este site. Carregue a página uma vez, tire o cabo da internet, e ela continua funcionando. Isso importa mais aqui do que na maioria das ferramentas simplesmente pelo volume: uma pilha de vinte quadros RAW é cerca de um gigabyte, e enviar um gigabyte de fotografias para que se tire uma média delas é justamente o que esta ferramenta existe para evitar.

### Quais formatos RAW ele consegue ler, e como?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL e formatos relacionados são compatíveis quando o arquivo contém uma prévia JPEG utilizável. A ferramenta percorre os diretórios e usa a maior prévia encontrada, que pode ser menor que a imagem do sensor ou não existir. **Os dados do sensor não são decodificados.** Os pixels mantêm o balanço de branco e o estilo de imagem da câmera, com oito bits por canal. Confira as dimensões na linha. A contagem de inspeção cobre cabeçalhos e diretórios; a decodificação também lê a fatia JPEG.

### Então por que não decodificar os dados do sensor direito?

Decodificar o sensor exigiria um mecanismo RAW como LibRaw ou dcraw, com os esquemas de compressão de cada câmera. Usar um JPEG incorporado mantém esta ferramenta pequena e usa o decodificador do navegador. Também significa aceitar a renderização da câmera e a resolução da prévia presente no arquivo. Para escolher os ajustes de revelação RAW, revele os quadros antes e exporte JPEG ou PNG para empilhar aqui.

### Quantos quadros ele aguenta, e de que tamanho?

Seis dos sete métodos têm acumuladores cujo tamanho não cresce com o número de quadros. Média, clarear, escurecer, somar e focus stacking precisam de uma passagem por faixa; sigma clipping precisa de duas. Mediana guarda os valores de cada quadro para a faixa atual, então sua memória cresce com a quantidade de quadros. Qualquer método pode ser dividido em faixas se seus buffers ultrapassarem o orçamento da ferramenta, o que exige decodificar os quadros de novo para cada faixa. A página estima esses buffers e mostra as decodificações planejadas para empilhar. Inspeção e alinhamento acrescentam trabalho, e os processos internos de codecs e GPU do navegador podem precisar de memória além da estimativa.

### O que o alinhamento dos quadros faz de fato?

A ferramenta mede o deslocamento de cada quadro em relação à referência e o reposiciona com precisão menor que um pixel. Usa correlação de fase: o deslocamento aparece como uma diferença de fase entre os espectros, então uma transformada de Fourier por imagem encontra um deslocamento de duzentos pixels tão facilmente quanto um de dois. Rotação e escala são recuperadas pelo mesmo método sobre o espectro em coordenadas logarítmico-polares. Automático também mede regiões espalhadas pelo quadro e corrige a perspectiva quando há concordância entre medições confiáveis suficientes. Isso ajuda a alinhar estrelas de um campo amplo nas bordas e no centro. Se não for possível medir essa correção com confiança, mantém rotação e escala e informa essa alternativa em Detalhes de alinhamento. A correção vale para o quadro inteiro; não alinha um objeto que se move sozinho nem todas as profundidades de uma cena fotografada um passo para o lado. Um quadro deslocado à esquerda não alcança a borda direita. Por isso o resultado é recortado para a área comum e pode ficar um pouco menor, evitando bordas escuras por áreas sem cobertura.

### Qual método eu devo usar?

**Média** para ruído quando nada se mexeu: o ruído aleatório independente cai aproximadamente pela raiz quadrada do número de quadros. **Mediana** para remover o que ocupa uma parte da cena em menos da metade dos quadros. **Sigma clipping** tira a média dos valores próximos da média e rejeita os que passam do limite escolhido. Pode manter objetos em movimento em conjuntos pequenos ou se aparecem com frequência; mediana é mais segura quando removê-los é a prioridade. **Clarear** para rastros de estrelas, fogos e light painting. **Escurecer** para remover elementos claros que se mexeram. **Somar** faz uma mistura aditiva dos quadros decodificados. Trabalha com valores de imagem de oito bits e não reproduz uma exposição mais longa da câmera. **Focus stacking** para uma macro fotografada ao longo do anel de foco.

### Por que o meu resultado tem oito bits se os meus arquivos RAW têm catorze?

A entrada RAW é a prévia JPEG da câmera, e a saída é um PNG ou JPEG de oito bits. Média e sigma clipping usam acumuladores mais amplos e arredondam no final. Assim estimam um valor mais limpo a partir de quadros com ruído sem arredondar cada etapa intermediária. A imagem salva continua com oito bits por canal; não ganha a profundidade de bits nem o alcance dinâmico dos dados lineares do sensor.

### Posso empilhar quadros de tamanhos diferentes, ou de câmeras diferentes?

Sim, mas confira se é intencional. O maior quadro define a área de trabalho; os outros são ajustados e centralizados nela. O resultado salvo é recortado para a área comum, então formatos diferentes ou o alinhamento podem deixá-lo menor que a área planejada. Misturar câmeras também mistura sua renderização de cores. Mantenha exposição e enquadramento constantes e compare com a referência para examinar o resultado.

### Ele diz que a execução vai ser em faixas. O que isso quer dizer?

A memória de trabalho necessária supera o que a ferramenta quer reservar de uma vez. A imagem é dividida em faixas horizontais, empilhadas uma por uma. A geometria de alinhamento e o método são os mesmos; a reamostragem do navegador pode variar levemente no último bit. Os quadros são lidos de novo para cada faixa, então demora mais. A página mostra quantas decodificações serão necessárias. Reduzir a resolução de trabalho um nível divide a memória por quatro e quase sempre permite uma passagem só. A nota indica o ajuste adequado.

### Por que esta ferramenta usa um Worker e nenhuma das outras usa?

Porque é a única cujo trabalho se mede em minutos. Toda outra ferramenta aqui faz algo que leva um segundo ou dois, onde tirar o trabalho da linha principal seria cerimônia. Empilhar vinte quadros grandes é aritmética densa sobre centenas de megabytes, e na linha principal isso significa uma página congelada: nenhuma barra de progresso andando, um botão Cancelar que não responde, e no fim um navegador se oferecendo para fechar a aba. O Worker é uma segunda linha de execução neste mesmo navegador, rodando um arquivo desta mesma pasta, sob esta mesma política. Não é um servidor e não é uma função de rede.

### É grátis, e eu preciso de conta?

É grátis, sem conta, login, período de teste ou marca d’água. Não há uma cota do serviço para a quantidade ou o tamanho dos quadros. Os limites práticos são a memória do dispositivo, os limites de canvas e decodificação do navegador e o tempo da pilha. A publicidade sustenta a página e não recebe nada sobre suas fotos.

## Como dá para conferir a promessa de privacidade

- **As suas fotografias não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum deles pertence a este site. Não existe aqui um endpoint onde os seus arquivos pudessem ser recolhidos, e não existe no código nada que os enviasse se existisse — nenhum `fetch`, nenhum `XMLHttpRequest`, nenhum `sendBeacon`, nem em `src/` nem no worker.
- **As prévias RAW são lidas neste dispositivo.** Muitos arquivos RAW contêm uma prévia JPEG renderizada pela câmera. Esta ferramenta percorre os diretórios do arquivo e extrai a maior prévia utilizável. A leitura de inspeção conta os cabeçalhos e diretórios lidos para encontrá-la e descrevê-la; a decodificação também lê a fatia JPEG. Os dados do sensor nunca são decodificados, e a linha mostra as dimensões reais da prévia.
- **O trabalho acontece num Worker neste computador, não num servidor.** Esta é a única ferramenta aqui que usa um, porque empilhar são minutos de aritmética em vez de segundos, e uma página congelada não consegue mostrar progresso nem ser cancelada. Um Worker é uma segunda linha de execução neste mesmo navegador — veja `src/worker.js`. Ele recebe os próprios arquivos, o que sai de graça, porque a referência a um arquivo não são os bytes; e ele tem exatamente a mesma Content-Security-Policy da página, ou seja, lugar nenhum para onde mandá-los.
- **Sobre o conjunto não se relata nada em lugar nenhum.** Quantos quadros você empilhou, que câmera os escreveu, quanto cada um tinha se deslocado, que método você escolheu e quanto tempo levou ficam na memória desta página até você fechá-la. Não existe neste repositório um evento de analytics próprio que carregue qualquer parte disso, e a única pergunta que este site faz depois de um download manda um polegar para cima ou para baixo e o nome da ferramenta, mais nada.
- **Funciona offline.** Desconecte da rede e a ferramenta continua a mesma, porque nunca houve um passo de rede nela. O worker e cada módulo que ele carrega ficam em cache pelo service worker desta página, então uma cópia instalada empilha arquivos RAW com a rede desligada.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/raw.js` explica como encontrar prévias RAW incorporadas sem decodificar o sensor, `src/stack.js` traz a conta de cada método e `src/plan.js` explica a memória de trabalho estimada e as decodificações planejadas da pilha. Processos internos do navegador e liberação de memória podem acrescentar memória além dos buffers modelados.
