# É seguro enviar arquivos para conversores online?

Normalmente a resposta honesta é “provavelmente, mas você não tem como conferir”. Aqui está o que enviar realmente faz com o seu arquivo, por que a maioria das ferramentas ainda faz isso, e quatro testes que dizem se a que está na sua frente precisa fazer.

Última atualização 12 de outubro de 2026

## A resposta curta

Enviar pode ser adequado para um arquivo não sensível e um serviço com termos apropriados. Retenção e acesso variam por provedor e função; um prazo de exclusão não prova sozinho onde cada cópia fica.

O problema não é que eles estejam mentindo. É que **você não tem como saber se estão**. Assim que um arquivo sai do seu computador, toda promessa sobre o que acontece depois é uma promessa que você aceita na fé: por quanto tempo ele fica, quem consegue alcançá-lo, se ele foi copiado para um backup que sobrevive ao cronômetro de exclusão, o que acontece com ele se a empresa for vendida ou invadida. Nada disso é visível de fora.

Então a pergunta útil não é “eu confio neste site?”. É **“este trabalho precisa mesmo que o meu arquivo saia daqui?”** Para um número grande e crescente de trabalhos a resposta é não, e quando a resposta é não, a pergunta sobre confiança deixa de ser uma que você precisa responder.

## O que “enviar” de fato faz

Um envio transmite dados do arquivo do navegador a outro computador. Podem ser os bytes originais ou uma cópia transformada. Escolher um arquivo não é enviar: uma ferramenta local pode lê-lo sem transmiti-lo.

Processamento em servidor pode criar arquivos de trabalho, registros de solicitações, resultados em cache e backups. São possibilidades para conferir nos termos, não três cópias que todo serviço necessariamente cria. Um teste externo no navegador não verifica exclusão interna.

Nome e metadados embutidos podem viajar junto. Fotos podem conter localização, horário, câmera, software e miniaturas; os campos dependem do dispositivo, configurações e edições. Inspecione o arquivo em vez de presumir todos esses dados em cada foto de celular.

## Por que a maioria das ferramentas envia mesmo assim

Não é porque queiram os seus arquivos. É porque, durante a maior parte da vida da web, não havia alternativa. Um navegador não conseguia decodificar um vídeo, recodificar uma imagem numa qualidade escolhida ou interpretar um formato de arquivo, e um servidor com FFmpeg e ImageMagick conseguia. Enviar não era um modelo de negócio, era o único lugar onde o trabalho podia acontecer.

Isso deixou de ser verdade há pouco tempo e sem alarde. Os navegadores hoje trazem WebAssembly, que roda os mesmos codecs compilados perto da velocidade nativa, WebCodecs, que expõe o codificador de vídeo por hardware que já está no seu computador, e uma API de Canvas que decodifica e recodifica imagens diretamente. O trabalho para o qual um servidor era necessário agora roda no aparelho que já tem o arquivo.

Muitas ferramentas ainda enviam, e há motivos honestos: um encanamento existente que ninguém quer reescrever, um formato sem decodificador do lado do navegador, um trabalho genuinamente pesado demais para um celular. Existe também um motivo menos honesto, que é o servidor ser o lugar onde moram as contas, as cotas e os planos pagos. Uma ferramenta que roda inteiramente no seu navegador é difícil de cobrar.

## Quatro verificações que você mesmo pode fazer

Verifique a operação e entrada que pretende usar. Cada verificação responde a uma parte; juntas são mais fortes que uma só.

### 1. Desconecte para a operação local

Carregue tudo e aguarde o indicador de cache offline pronto. Desconecte e processe um arquivo do dispositivo. Concluir prova que a operação não precisou de servidor durante a desconexão. Falhar também pode significar recursos ausentes ou falta de suporte, não prova de envio. O sucesso não demonstra o que ocorre ao reconectar; o [guia offline](https://abox.tools/pt/guias/como-uma-pagina-web-funciona-offline/) explica esse limite.

### 2. Inspecione as solicitações

Abra DevTools antes, limpe a lista e preserve o registro. Confira destinos, parâmetros de URL, corpos de solicitações e mensagens WebSocket. Colunas de tamanho frequentemente descrevem respostas; solicitações pequenas podem levar dados extraídos ou comprimidos. Comparar o tamanho do arquivo não basta. Listas comuns não mostram conteúdo WebRTC; leia o transporte e use os diagnósticos WebRTC do navegador.

### 3. Leia a Content-Security-Policy

A [diretiva connect-src](https://www.w3.org/TR/CSP3/#directive-connect-src) limita destinos de APIs como fetch e WebSocket. Um host terceiro permitido pode receber dados. Outras diretivas regulam imagens, formulários e recursos; essa lista não descreve tráfego WebRTC entre navegadores. CSP é uma restrição, não auditoria de conteúdo nem prova isolada de ausência de envio.

### 4. Siga os dados no código

Compare código publicado e gerado. Siga arquivos por fetch, XMLHttpRequest, sendBeacon, WebSocket e RTCPeerConnection e confira formulários, URLs de recursos e entregas a apps. São exemplos, não lista completa. O decisivo são os dados dados a cada caminho, incluindo scripts de plataforma e feedback.

## O que “roda no seu navegador” não quer dizer

Vale ser preciso, porque a expressão é usada de forma frouxa e este site tem que se sujeitar ao mesmo critério que está propondo.

- **Não quer dizer requisição nenhuma.** A própria página chegou pela rede, e a maioria das ferramentas gratuitas carrega publicidade ou análise que conversa com alguém. A afirmação é sobre o seu *arquivo*, não sobre tráfego em geral.
- **Não esconde o seu endereço IP.** Todo site que você visita enxerga o IP, este inclusive. Processamento local é sobre o conteúdo dos seus arquivos, não sobre anonimato.
- **Não sobrevive a uma função que busca alguma coisa.** Uma ferramenta que deixa você colar um endereço da web precisa acessar aquele endereço, e aquele servidor fica sabendo o seu IP e o que você pediu. Isso é inerente à função, não um defeito dela, mas é uma exceção real, e uma ferramenta deve dizer isso com todas as letras em vez de arredondar.
- **Não é o mesmo que “excluímos seus arquivos”.** Processamento local identifica onde uma operação roda. Retenção é outra afirmação sobre o que um provedor faz depois de receber dados. Leia a implementação e os limites de rede antes de tratar qualquer frase como garantia.

## Quando enviar está genuinamente tudo bem

Isto não é um argumento de que todo envio é um erro. Mande o arquivo quando o conteúdo não for sensível e o trabalho ficar mais fácil assim, quando o trabalho for de fato pesado demais para o seu aparelho, quando o formato não tiver decodificador do lado do navegador, ou quando você estiver usando um serviço com o qual já tem relação e cujos termos leu de verdade.

Tenha mais cuidado quando o arquivo contém algo que você não postaria publicamente: documentos de identidade, exames de imagem, contratos, qualquer coisa com um endereço ou um rosto que você não pretendia compartilhar, ou uma foto cujos dados de localização você não olhou. Para esses, uma ferramenta que você consegue conferir merece preferência sobre uma ferramenta em que você precisa confiar. Não porque a confiável provavelmente vá trair você, e sim porque com a verificável a pergunta nem chega a surgir.

## Como este site responde a essas quatro verificações

Seria um guia estranho o que mandasse você conferir e depois pedisse isenção. Então, na ordem:

- **Offline.** Processamento local funciona com recursos carregados e cache pronto. Imagens web, câmbio online e apresentação entre navegadores precisam de conexão.
- **Solicitações.** O código de processamento não envia arquivos escolhidos. Visualizações e votos fixos opcionais são distintos. Câmbio leva moedas e data; funções entre navegadores enviam conteúdo deliberadamente ao escolhido.
- **Política.** A maioria herda destinos de plataforma. Recibos acrescentam Frankfurter e compartilhar e câmera acrescentam o servidor de encontro. A política limita destinos sem provar cada conteúdo.
- **Código.** O [código é público](https://github.com/A-Box-of-Tools/website). Compile e compare o resultado, incluindo módulos compartilhados e motores empacotados.

A [página de privacidade](https://abox.tools/pt/privacidade/) explica limites: [importação por URL](https://abox.tools/pt/imagens-para-video/), [câmbio opcional e entrega a apps](https://abox.tools/pt/extrair-recibos-faturas/), [compartilhar entre navegadores](https://abox.tools/pt/compartilhar-texto/) e [câmera remota](https://abox.tools/pt/remote-camera/), além de anúncios, Analytics e feedback fixo. Transferência deliberada é distinta de envio para processamento.

Exemplos locais: [comprimir para um tamanho alvo](https://abox.tools/pt/comprimir-imagem/), [recortar vídeo](https://abox.tools/pt/cortar-video/), [remover EXIF e GPS](https://abox.tools/pt/remover-dados-exif/) e [criar PDF com imagens](https://abox.tools/pt/imagens-para-pdf/). Confira formatos e resultado. Essas tarefas não precisam de envio para processamento nem conta.

![Painel de privacidade com processamento local, referências ao código e resumo ao vivo dos recursos carregados.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

O painel mostra a afirmação e o código que a sustenta. Seu resumo ajuda a inspecionar as solicitações do navegador, mas não examina sozinho o conteúdo.
