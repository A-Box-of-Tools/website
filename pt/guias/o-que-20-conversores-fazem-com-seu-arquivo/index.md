# O que 20 conversores on-line fazem com seu arquivo

Entregamos a mesma imagem de 542 KB a vinte conversores grátis e medimos os tamanhos dos corpos das requisições que saíam do navegador. Dezenove enviaram a um servidor; treze antes de apertarmos um botão. Todos os resultados procurados depois ainda estavam em endereços públicos.

Última atualização 13 de outubro de 2026

## O resultado

Em 17 de setembro de 2026, entregamos o mesmo arquivo a vinte conversores grátis e registramos os tamanhos dos corpos das requisições pelos mecanismos descritos abaixo. **Dezenove dos vinte enviaram o arquivo.** Um não.

Três detalhes chamaram atenção: **treze dos dezenove enviaram o arquivo assim que ele foi escolhido**, antes do clique em Converter; **todos os resultados que procuramos depois continuavam acessíveis por um endereço comum da web**, sem cookie, login ou sessão; e **dois serviços colocaram o nome do arquivo nesse endereço**.

Isso não é prova de má conduta. Muitos desses serviços sempre funcionaram por envio, publicam prazos curtos de retenção e dependem de endereços difíceis de adivinhar. A conclusão é mais específica: existe uma diferença mensurável entre *o site dizer que apaga meu arquivo* e *eu conseguir verificar o que aconteceu com ele*.

## Use a comparação para planejar sua verificação

**Escolher conversor para documentos.** A tabela datada convida a inspecionar o recurso exato, não é classificação de segurança atual. Crie uma amostra fictícia do formato requerido, observe seleção e conversão e confira o download. Testar um PNG não prova como trata um PDF bancário nem outra ferramenta do mesmo domínio.

**Documentar a escolha de ferramentas da equipe.** Registre URL, data, navegador, ações, transferência observada e condições publicadas de retenção. Guarde a amostra fictícia e captura descritas abaixo para repetir. Diferencie um envio observado de uma promessa e um teste incompleto de um aprovado.

Repita também quando um serviço mudar recursos: use a mesma tarefa inofensiva e compare evidências. Não reutilize números históricos como se fossem novas medições.

## Como foi feita a medição

O método é simples e pode ser repetido. O objetivo é apresentar medições, não pedir confiança em uma opinião.

### O arquivo

Um PNG de ⁦450 x 350⁩ pixels aleatórios, cerca de 542 KB, chamado `abox-probe-9471.png`. Ruído aleatório é difícil de comprimir. Uma carga de tamanho próximo é uma pista, mas ainda é preciso inspecionar o corpo da requisição para determinar o que foi enviado. O nome distinto permitiu encontrar o arquivo em uma URL depois.

### A medição

Antes de fornecer o arquivo, instrumentamos estas APIs de requisição para registrar o tamanho dos dados recebidos e depois executar sua função normal: `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send` e, especialmente importante, `HTMLFormElement.submit`. Depois inserimos o arquivo no seletor da própria página, esperamos dez segundos e lemos o registro.

Observar formulários é importante. Alguns serviços enviam por formulário HTML, sem passar por `fetch` ou `XMLHttpRequest`. O PicResize, por exemplo, mostra a imagem localmente por um endereço `blob:` enquanto faz o envio. Só a prévia parece indicar processamento local; a requisição do formulário revela o contrário.

### A conferência posterior

Quando o site devolvia um link para o resultado, buscamos esse endereço pela linha de comando em outro programa, sem cookies, sessão ou dados do navegador. Se o arquivo era devolvido assim, qualquer pessoa com o endereço também podia obtê-lo.

Os vinte são os sites que conseguimos operar, não necessariamente os maiores. Tentamos outros nove sem conseguir medi-los. Eles aparecem mais adiante: uma falha de automação não é um resultado favorável.

## As medições

Os tamanhos abaixo são as medições de corpos de requisição informadas em 17 de setembro de 2026; os valores ausentes continuam ausentes. A última coluna preserva os resumos de políticas daquela data. Os links levam a páginas de referência atuais, conferidas em 12 de outubro de 2026, não a cópias arquivadas da redação anterior.

| Conversor | O arquivo saiu? | Bytes medidos | Destino | Retenção informada |
| --- | --- | --- | --- | --- |
| Squoosh | Não | 0 | — | nada para guardar |
| TinyPNG | Sim, ao escolher | 542.566 | `tinypng.com/backend/opt/store` | 48 horas |
| iLoveIMG | Sim, ao escolher | 542.816 | `api9.iloveimg.com/v1/upload` | 2 horas |
| iLovePDF | Sim, ao escolher | 542.801 | `api4.ilovepdf.com/v1/upload` | 2 horas |
| Sejda | Sim, ao escolher | 542.537 | `sejda.com/api/files/upload` | após o processamento; links compartilhados por 7 dias |
| PDF24 | Sim, ao escolher | 542.531 | `filetools24.pdf24.org/client.php` | “normalmente” 1 hora |
| PDF Candy | Sim, ao escolher | 542.522 | `s35.api.pdfcandy.com/uploadcbc/…` | 2 horas |
| jpg2pdf.com | Sim, ao escolher | 542.570 | `jpg2pdf.com/api/upload` | 1 hora, conforme os Termos |
| Img2Go | Sim, ao escolher | 542.589 | `www21.img2go.com/v2/dl/web7/…` | 72 horas |
| Online-Convert | Sim, ao escolher | 542.423 | `www8.online-convert.com/v2/dl/web7/…` | 72 horas |
| PDF2Go | Sim, ao escolher | 542.542 | `www15.pdf2go.com/v2/dl/web7/…` | 72 horas |
| Compress2Go | Sim, ao escolher | 542.492 | `www6.compress2go.com/v2/dl/web7/…` | 72 horas |
| PicResize | Sim, ao escolher | 542.568 | `picresize.com/en/edit`, envio por formulário | 20 minutos |
| ResizePixel | Sim, ao escolher | envio por formulário | `resizepixel.com/` | em até 1 hora |
| CloudConvert | Sim, ao converter | 543.218 | `eu-central.storage.cloudconvert.com/…` | 24 horas |
| Convertio | Sim, ao converter | não capturado | `convertio.co/process/…` | 24 horas |
| Ezgif | Sim, ao converter | 542.483 | `ezgif.com/optimize`, envio por formulário | 1 hora após o último uso |
| Aconvert | Sim, ao converter | envio por formulário | `aconvert.com/results.php` | 2 horas |
| Online2PDF | Sim, ao converter | 547.330 | `online2pdf.com/conversion/frame` | “imediatamente” |
| IMGonline | Sim, ao converter | 542.633 | `imgonline.com.ua/eng/…-result.php` | política não encontrada |

Vinte conversores, um arquivo de 542 KB, em 17 de setembro de 2026. “Ao escolher” significa que o envio começou na seleção do arquivo; “ao converter”, que esperou pelo botão. O Convertio mudou de página antes da leitura da quantidade de bytes; por isso, o tamanho está marcado como não capturado.

## As observações e seus limites

A tabela publicada está disponível como [JSON com procedência e limitações](https://abox.tools/data/converter-observations-2026-09-17.json) e [linhas CSV](https://abox.tools/data/converter-observations-2026-09-17.csv). Os arquivos transcrevem este artigo; não são um novo teste. A contagem da tabela mostra treze envios na seleção, corrigindo os onze antes citados no texto.

Os registros originais de requisições, a versão do navegador, o arquivo aleatório exato e cópias históricas das políticas não foram guardados com o artigo. As cifras continuam sendo observações relatadas, não dados brutos que o leitor possa verificar de forma independente. Os mecanismos não cobrem toda transferência: navegação de formulários, outros quadros, workers e WebRTC exigem inspeção separada. Um zero significa que o teste não registrou envio, não que nenhuma transferência seja possível.

Para repetir a comparação, crie um arquivo sintético novo, registre seus bytes exatos e SHA-256 e use um perfil novo do navegador. Salve uma captura de rede com corpos das requisições e navegação preservada; inspecione seleção e conversão separadamente. Registre versão do navegador, URL, horário, ação, destino, tamanho do corpo e se ele contém o arquivo de teste. Remova credenciais e links privados dos resultados antes de compartilhar. Preserve o texto da política, a URL e a data e registre os testes incompletos separadamente.

Uma URL de arquivo que responde sem sessão demonstra acesso para quem tem a URL naquele momento. Confira de novo depois do prazo de retenção antes de afirmar que a exclusão falhou. Nem essa consulta nem uma captura de rede prova o que permanece em registros ou backups internos.

## Treze enviam antes do clique em Converter

Em treze dos dezenove casos, o arquivo já estava a caminho do servidor enquanto a página ainda mostrava um botão Converter que não tinha sido apertado.

No iLoveIMG, o botão ainda dizia *Compress IMAGES*, mas 542.816 bytes já haviam sido enviados a `api9.iloveimg.com`. Observamos comportamento semelhante em iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf e nos quatro sites da mesma plataforma descrita adiante.

Há uma razão técnica: enviar enquanto a pessoa ajusta as opções faz a conversão parecer instantânea depois do clique. Isso melhora a espera, mas elimina uma etapa que muita gente acredita ter. Escolher um arquivo parece apenas abri-lo; apertar Converter parece autorizar o envio. Nesses casos, o envio começa no primeiro momento.

A consequência é direta: perceber que você escolheu o rascunho sem tarjas, o holerite ou a foto que pretendia recortar primeiro pode acontecer só depois de o arquivo já ter saído.

## O resultado fica em um endereço público

Quatro sites devolveram links comuns para os arquivos prontos. Buscamos os quatro por outro programa, sem cookies ou sessão. Todos devolveram o arquivo:

- **Ezgif**: `s1.ezgif.com/tmp/…` devolveu 542.483 bytes, exatamente o arquivo de teste.
- **Aconvert**: `s6.aconvert.com/convert/…` devolveu um PDF de 474.856 bytes.
- **ResizePixel**: `resizepixel.com/Image/…` devolveu 432.111 bytes.
- **IMGonline**: `srv2.imgonline.com.ua/result_img/…` devolveu um JPEG de 128.179 bytes.

Os endereços testados continham partes difíceis de adivinhar. Quem tivesse um deles podia buscar o resultado no momento da verificação. Links podem vazar pelo histórico, capturas de tela ou mensagens e por referências quando a política da página permitir. HTTPS oculta o caminho de um intermediário comum de rede; a política de referência determina o que outro site recebe depois. A observação vale para esses quatro links, não para todo método de download de um conversor.

O Aconvert avisa na própria página de resultado que os arquivos ficam por no máximo duas horas e que não devem ser vinculados de outros sites. Entre os quatro observados, foi o único a mostrar esse aviso ali.

## O nome do arquivo também viaja

Um conversor recebe mais que o conteúdo visível, e dois serviços deixaram isso explícito no endereço.

O PDF Candy enviou o arquivo a uma URL terminada em `/uploadcbc/1789652849416-abox-probe-9471.png`: data e hora numéricas seguidas do nome original. O ResizePixel mostrou a prévia em `/Image/<id>/Preview/abox-probe-9471.png`.

Nosso arquivo se chamava `abox-probe-9471.png` e não revelava nada pessoal. Arquivos reais podem se chamar `passport-scan.jpg`, `contract-signed-final.pdf` ou `scan-12wk.png`. Um nome pode resumir todo o conteúdo. Além disso, o endereço é a parte da requisição que costuma ser registrada, armazenada em cache e mantida por mais tempo, geralmente por mais sistemas que o próprio arquivo.

Há também os dados internos que não aparecem na tela. Uma foto de celular pode carregar as coordenadas do local onde foi tirada, o horário, o número de série da câmera e até uma miniatura de como a imagem era *antes* do recorte. Independentemente do tratamento aplicado à imagem depois, o serviço recebeu esses dados junto com o original.

## Quatro nomes, uma plataforma

Img2Go, Online-Convert, PDF2Go e Compress2Go parecem serviços separados. O arquivo foi enviado a quatro servidores: `www21.img2go.com`, `www8.online-convert.com`, `www15.pdf2go.com` e `www6.compress2go.com`. Todos usaram o mesmo caminho:

```
/v2/dl/web7/upload-file/<uuid>
```

Mesmo destino funcional, mesmo comportamento de envio, mesmo texto de política e prazo informado de 72 horas. São quatro apresentações de uma plataforma, relação descrita nas políticas para quem as lê.

Não há nada de incomum em operar várias marcas sobre a mesma infraestrutura. A consequência prática é que trocar de site por desconfiança pode não trocar quem processa os dados. A mudança só reduz essa dependência se o serviço por trás também for diferente.

Outro detalhe: o CloudConvert enviou o arquivo a `eu-central.storage.cloudconvert.com`. O nome do servidor indica a região usada, informação mais explícita que a de muitos outros serviços medidos.

## O que as políticas prometem

Os prazos publicados eram em geral curtos e específicos: exclusão imediata após a conversão no Online2PDF, vinte minutos no PicResize, duas horas em iLovePDF, iLoveIMG, PDF Candy e Aconvert e 72 horas na plataforma de quatro sites.

No **jpg2pdf.com**, não havia política no endereço habitual; o link jurídico da página inicial levava a `/terms`, onde “Terms and Privacy” informava uma hora. No **IMGonline**, não encontramos política: nem link na página inicial em inglês, nem documento nos dois endereços convencionais, nem informação sobre armazenamento ou exclusão na ferramenta. O resultado continuava acessível a quem tivesse o link.

O número de horas não é toda a questão. **Um link público que ainda devolve o arquivo depois do prazo informado pode revelar uma exclusão que não ocorreu a tempo.** Um link expirado não prova que todas as cópias internas foram removidas. Você não vê se a exclusão alcançou backups, registros, relatórios de erro que capturaram o corpo da requisição ou a rede que guardou o resultado. Também não vê o destino dessas cópias após uma venda da empresa ou um incidente. Uma política declara intenções sobre sistemas que você não pode inspecionar; promessas honestas e desonestas podem usar as mesmas palavras.

Esse é o argumento para preferir processamento que não envie o arquivo. Não é uma acusação de mentira contra as empresas medidas. É uma forma de dispensar a necessidade de confiar no tratamento de uma cópia remota.

## O serviço que não enviou

O Squoosh, compressor do Google, recebeu, mostrou e comprimiu o arquivo, e **este teste não registrou envio do arquivo**. Foram relatados zero bytes de envio pela mesma medição que registrara 542.566 saindo do TinyPNG um minuto antes.

Ele funciona como controle da medição: o método consegue produzir resultado negativo, então os dezenove positivos não vieram de um procedimento que sempre encontraria envio. Também demonstra que essa tarefa e esses formatos podem ser processados no navegador, sem servidor.

Muitos serviços usam servidores por sua história de implementação e pelo modelo de contas, cotas e planos pagos. Um processamento inteiramente local é mais difícil de limitar por uso. Isso não torna o envio uma exigência técnica de toda conversão.

## O que não conseguimos medir

Outros nove sites foram tentados: FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com e SimpleImageResizer.

Em oito casos, os controles não aceitaram um arquivo inserido por script e exigiam uma interação real. O teste não chegou à etapa de envio. **Isso não é um resultado sobre a privacidade desses serviços** e não demonstra que processem localmente; significa apenas que a medição não foi executada.

O SimpleImageResizer revelou uma armadilha do método. O formulário tinha campo de arquivo, mas declarava `enctype="application/x-www-form-urlencoded"`. Nessa combinação, o navegador envia *apenas o nome*, não os bytes do arquivo. A primeira versão da nossa medição somou os dados do formulário e informou incorretamente um envio de 1.085.210 bytes. Excluímos a linha em vez de publicar esse número. Ao repetir o método, confira o `enctype` antes de concluir que o arquivo foi enviado.

## Como conferir por conta própria

Os registros originais não estão disponíveis, então a tabela histórica não pode ser verificada pelas requisições brutas. O método acima permite uma comparação nova. A versão mais rápida não precisa de ferramentas especiais:

- **Desligue a internet.** Carregue a ferramenta, desligue o Wi-Fi e use-a. O trabalho local continua; o que depende do servidor para. Uma promessa escrita não substitui esse resultado.
- **Observe a aba Rede.** Abra as ferramentas de desenvolvedor, selecione Rede, ordene por tamanho e use o conversor. Inspecione as cargas das requisições, não só a coluna de tamanho transferido, que costuma descrever respostas. Uma miniatura, um envio em partes ou um arquivo codificado podem ter outro tamanho. Olhe *antes* e depois de apertar Converter.
- **Leia `connect-src`.** A `Content-Security-Policy` no código da página lista destinos permitidos para essas conexões, e o navegador a aplica. Um endereço do próprio serviço nessa lista permite que o código envie dados para ele.

O guia [é seguro enviar arquivos a conversores on-line?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) detalha essas verificações e uma quarta opção.

## Como este site responde às mesmas perguntas

O código deste site é uma evidência distinta das medições históricas acima. A implementação atual afirma o seguinte; confira a função pretendida com as [quatro verificações](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/).

- **Offline.** Processamento local funciona com recursos carregados e cache pronto. Imagens web, câmbio online e apresentação entre navegadores precisam de conexão.
- **Solicitações.** O código de processamento não envia arquivos escolhidos. Visualizações e votos fixos opcionais são distintos. Câmbio leva moedas e data; funções entre navegadores enviam conteúdo deliberadamente ao escolhido. **Política.** A maioria herda destinos de plataforma. Recibos acrescentam Frankfurter e compartilhar e câmera acrescentam o servidor de encontro. A política limita destinos sem provar cada conteúdo.
- **Retenção.** abox.tools não recebe arquivos para processamento; essa operação não cria cópia em servidor a excluir. Registros locais, metadados de encontro de sete dias e cópias mantidas por destinatários de compartilhamento ou email são caminhos distintos descritos em Privacidade.
- **Código.** O [código é público](https://github.com/A-Box-of-Tools/website). Compile e compare o resultado, incluindo módulos compartilhados e motores empacotados.

A [página de privacidade](https://abox.tools/pt/privacidade/) explica limites: [importação por URL](https://abox.tools/pt/imagens-para-video/), [câmbio opcional e entrega a apps](https://abox.tools/pt/extrair-recibos-faturas/), [compartilhar entre navegadores](https://abox.tools/pt/compartilhar-texto/) e [câmera remota](https://abox.tools/pt/remote-camera/), além de anúncios, Analytics e feedback fixo. Transferência deliberada é distinta de envio para processamento.

Exemplos locais: [comprimir para um tamanho alvo](https://abox.tools/pt/comprimir-imagem/), [recortar vídeo](https://abox.tools/pt/cortar-video/), [remover EXIF e GPS](https://abox.tools/pt/remover-dados-exif/) e [criar PDF com imagens](https://abox.tools/pt/imagens-para-pdf/). Confira formatos e resultado. Essas tarefas não precisam de envio para processamento nem conta.

## Usar estes números

Você pode citar as medições e repetir o teste. Ao reproduzi-las, mantenha o contexto: vinte conversores gratuitos, medidos em 17 de setembro de 2026; dezenove enviaram o arquivo; treze enviaram antes do clique em Converter; e quatro de quatro resultados verificados foram obtidos por endereço público, sem sessão.

Um link para esta página é bem-vindo, mas não obrigatório. Sites mudam, e este é o registro de uma tarde. Se repetir o método e encontrar outro resultado, use a [página de contato](https://abox.tools/pt/contato/). Correções acompanhadas das medições serão publicadas.
