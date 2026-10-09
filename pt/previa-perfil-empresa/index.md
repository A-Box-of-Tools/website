# Prévia do Perfil da Empresa — veja como ficará no Google antes de publicar

Digite os dados e veja uma simulação do cartão do Google. Nada é enviado para desenhá-la.

> Veja uma prévia do Perfil da Empresa no Google: painel de informações, cartão no celular e resultado de busca. Cole um perfil existente ou digite os dados e baixe PNG ou SVG. Tudo no navegador.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/previa-perfil-empresa/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem perfis e suas imagens. Não existe servidor.

Cada campo digitado vira uma imagem por meio do JavaScript desta página, cujo código você pode ler. Nenhuma etapa contata terceiros, seja para buscar a empresa, conferir o endereço ou desenhar uma estrela. A ferramenta não tem função de rede. Isso importa porque o endereço comercial pode ser a casa de alguém, e o telefone pode ser pessoal.

- ✗ Sem envio
- ✗ Sem conta
- ✗ Sem marca d'água
- ✓ Funciona offline
- ✓ Código aberto

## Como visualizar um Perfil da Empresa no Google antes de publicar

1. **Comece pelo perfil que já existe, se houver.** Abra a empresa no Google, selecione o cartão inteiro, com nome, estrelas e linhas abaixo, copie e cole na seção do início desta página. A ferramenta reconhece nome, categoria, nota, quantidade de avaliações, endereço, telefone, site e horários da semana. Ela informa exatamente quais campos preencheu para você conferir possíveis erros. Também aceita uma exportação da API do Perfil da Empresa.
2. **Confira primeiro o nome e a categoria.** São os campos de maior impacto. O nome pode ser cortado nas três apresentações, principalmente no resultado de busca. Acrescentar cidade e atividade ao fim do nome pode deixar esses detalhes escondidos por reticências. A categoria é a linha que ainda cabe no resultado local quando quase nada mais cabe, e ajuda a corresponder à busca.
3. **Preencha a semana e confira o status.** A linha de status muda sozinha: *Aberto · Fecha às 21:00* pode virar *Fechado · Abre às 09:00 ter.*. O cálculo usa os horários informados e o relógio do seu computador. Marcar um dia como fechado mostra o que uma pessoa verá ao consultar naquele período. Um intervalo que termina antes de começar, como 22:00 a 02:00, é interpretado como atravessando a meia-noite. Ative *Pré-visualizar uma data e hora escolhidas* para conferir uma noite específica ou a manhã seguinte no fuso horário deste dispositivo. Desative a opção para voltar a seguir o relógio. Esta escolha não é salva no JSON do perfil.
4. **Confira quais botões aparecem.** Sem endereço, não há *Rotas*. Sem site, não há *Site*. Sem telefone, não há *Ligar*. Esses campos determinam os botões abaixo do nome. Quando falta um deles, a pessoa precisa procurar em outro lugar antes de agir. É uma conferência rápida e uma ausência comum em perfis reais.
5. **Confira as três apresentações.** O mesmo perfil recebe três espaços diferentes. O painel de informações é amplo e costuma aparecer quando a pessoa já conhece o nome. O cartão no celular é o que muitos visitantes veem. O resultado local é o mais estreito, onde alguém escolhe entre sua empresa e duas concorrentes. Uma descrição que cabe no primeiro pode nem aparecer no terceiro.
6. **Baixe a imagem e guarde o perfil.** O PNG pode sair no tamanho original da apresentação, no dobro ou no triplo, ampliando sem alterar as quebras de linha. O SVG é útil em documentos: contém a foto e não depende de links externos, mantendo nitidez na impressão. O terceiro download é o perfil salvo; guarde-o para continuar depois.

## A versão longa

[Como visualizar um Perfil da Empresa no Google antes de publicar](https://abox.tools/pt/guias/visualizar-perfil-empresa-google/): Confira o perfil na busca do computador, no celular e no resultado local: quanto do nome cabe, o papel da categoria, os botões de contato e o status de aberto ou fechado.

## Também na caixa

- [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/): Diga o tamanho. Ele resolve o resto.
- [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/): Diga o tamanho. Desenhe a caixa. Escolha o formato.
- [HEIC para JPG](https://abox.tools/pt/heic-para-jpg/): As fotos que o iPhone tira, num formato que tudo abre.
- [WebP para JPG](https://abox.tools/pt/webp-para-jpg/): As imagens que a web salva, no formato que todos ainda aceitam.

## Perguntas

### Esta ferramenta é do Google?

Não. O site não tem vínculo, aprovação ou conexão com o Google. Perfil da Empresa no Google é uma marca do Google, citada apenas para identificar o que está sendo simulado. A imagem é desenhada no seu navegador com os dados digitados; não é captura de tela, visualização ao vivo nem conexão com sua conta. Nada feito aqui altera o perfil real. Para isso, é preciso usar o Google.

### A ferramenta importa meu perfil automaticamente?

Não. Buscar o perfil exigiria contato com um servidor, capacidade que também permitiria enviar os campos a ele. A ferramenta foi feita sem essa função. Você copia o perfil e o cola aqui; a página lê o texto e informa os campos reconhecidos. Também abre diretamente uma exportação em JSON da API do Perfil da Empresa.

### Alguma coisa que eu digito é mandada para algum lugar?

Não. O código não contém `fetch`, `XMLHttpRequest` ou `sendBeacon`. A `Content-Security-Policy` lista os endereços permitidos, e nenhum pertence a este site. Isso é especialmente relevante porque um perfil comercial pode conter o endereço residencial e o telefone pessoal de alguém.

### Qual é a precisão da simulação?

Ela mostra o que cabe no espaço e aproxima a aparência. O Google usa Google Sans, que pode não estar no seu computador, e muda o espaçamento nas atualizações da Busca e do Maps. Trate os pixels como aproximação. A prévia permite conferir quanto do nome cabe em cada largura, se a categoria continua legível na versão estreita e quais botões os campos preenchidos habilitam.

### Por que meu perfil novo aparece sem estrelas?

Porque um perfil sem avaliações deve mostrar isso claramente. Cinco estrelas vazias podem parecer uma avaliação ruim à primeira vista. Deixe nota e quantidade de avaliações vazias para mostrar a mensagem de que ainda não há avaliações. Preencha ambos para exibir estrelas proporcionais à nota: 4,6 mostra quatro estrelas e três quintos da quinta, não cinco estrelas completas.

### Como é calculada a indicação Aberto ou Fechado?

A semana preenchida e, por padrão, o relógio local deste dispositivo. O estado é atualizado a cada minuto. Você também pode escolher uma data e hora locais para verificar um momento específico da semana. A pré-visualização usa o fuso horário deste dispositivo, sem conversão para o da empresa nem horários especiais de feriados. Se a empresa estiver noutro local, insira a hora local que deseja conferir. Esta escolha não faz parte do JSON salvo do perfil.

### Posso usar a imagem em uma proposta, apresentação ou relatório para cliente?

Sim. Não há marca d’água, conta, limite de imagens nem link para este site dentro do arquivo. São seus dados desenhados no seu computador. Avise ao destinatário que é uma simulação: uma imagem tão reconhecível pode ser confundida com uma captura de um perfil já publicado.

### Qual é a diferença entre as três prévias?

A largura determina quanto conteúdo aparece. O **painel de informações** é o cartão alto à direita da busca no computador pelo nome da empresa, com mais espaço. O cartão **no celular** corresponde à apresentação móvel. O **resultado de busca** é uma entrada do bloco local de três empresas sob um mapa: é a versão mais estreita, onde a pessoa compara alternativas sem necessariamente conhecer seu nome.

### A foto que eu adicionar é enviada?

Não. Ela é decodificada nesta página, redesenhada em um canvas no tamanho adequado e incorporada à imagem como dados. O arquivo não sai do computador, e os metadados de local e data são descartados porque o canvas não os preserva. Guarde o original se precisar dele; a simulação usa uma cópia.

### Posso salvar o que digitei para continuar depois?

Sim, em um arquivo. *Salvar o perfil* grava um JSON no seu disco com todos os campos e a foto. Ao reabri-lo aqui, os dados voltam. Nada fica no navegador entre visitas, e não há conta. Endereço, telefone e horários da empresa não são dados que este site deva guardar.

### Funciona offline?

Sim. Abra a página uma vez e desligue a internet: campos, desenho e geração de PNG continuam funcionando. Uma ferramenta que enviasse os dados para desenhar o cartão em outro lugar pararia ao perder a conexão.

## Como dá para conferir a promessa de privacidade

- **Não existe para onde o que você digita possa ir.** A Content-Security-Policy lista todos os endereços que esta página pode contatar, e nenhum pertence a este site. Não há destino para coletar endereço ou telefone, nem código para enviá-los.
- **Nada aqui busca coisa alguma.** Não há `fetch`, `XMLHttpRequest` ou `sendBeacon` em `src/`. É por isso que a ferramenta não busca seu perfil automaticamente: você precisa colá-lo. A capacidade de buscar dados em um servidor também permitiria enviá-los.
- **A foto é lida aqui e perde os metadados ao entrar.** A foto de capa é decodificada nesta página e redesenhada em um canvas antes de entrar na simulação. Isso limita seu tamanho e remove os dados sobre onde e quando foi tirada. A simulação incorpora a imagem, não o arquivo original.
- **O download reproduz a prévia da tela.** O PNG usa a mesma marcação entregue ao navegador e desenhada em um canvas, evitando uma segunda composição que pudesse divergir da prévia. Não há fonte para buscar nem imagem externa vinculada. Por isso, o download funciona sem rede e produz um arquivo independente.
- **Salvar o perfil gera um arquivo, não uma conta.** O JSON é gravado no seu disco. Reabri-lo é a única forma de a ferramenta recuperar os dados. Nada fica armazenado no navegador entre visitas: endereço e horário da empresa não são dados que este site deva guardar.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e medição vêm do Google, e o botão de contribuição, do Buy Me a Coffee. Nenhum deles recebe o que você digita. Todo o código que transforma os campos em imagem é servido desta origem e está no repositório.
- **Funciona offline.** Desligue a rede e a ferramenta continua igual, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/surfaces.js` para os três cartões, com todas as coordenadas definidas no código; `src/profile.js` para o cálculo que determina se o estabelecimento está aberto agora; e `src/parse-listing.js` para a leitura de um perfil colado.
