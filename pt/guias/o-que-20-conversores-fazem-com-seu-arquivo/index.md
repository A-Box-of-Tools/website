# O que 20 conversores on-line fazem com seu arquivo

Entregamos a mesma imagem de 542 KB a vinte conversores grátis e medimos cada byte que saiu do navegador. Dezenove enviaram o arquivo a um servidor; onze fizeram isso antes de apertarmos um botão. Todos os resultados que procuramos depois ainda estavam em endereços públicos.

Última atualização 17 de setembro de 2026

## O resultado

Em 17 de setembro de 2026, entregamos o mesmo arquivo a vinte conversores on-line gratuitos e medimos os bytes que saíram do navegador. **Dezenove enviaram o arquivo.** Um não enviou.

Três detalhes chamaram atenção: **onze dos dezenove enviaram o arquivo assim que ele foi escolhido**, antes do clique em Converter; **todos os resultados que procuramos depois continuavam acessíveis por um endereço comum da web**, sem cookie, login ou sessão; e **dois serviços colocaram o nome do arquivo nesse endereço**.

Isso não é prova de má conduta. Muitos desses serviços sempre funcionaram por envio, publicam prazos curtos de retenção e dependem de endereços difíceis de adivinhar. A conclusão é mais específica: existe uma diferença mensurável entre *o site dizer que apaga meu arquivo* e *eu conseguir verificar o que aconteceu com ele*.

## Como foi feita a medição

O método é simples e pode ser repetido. O objetivo é apresentar medições, não pedir confiança em uma opinião.

### O arquivo

Um PNG de 450 × 350 pixels aleatórios, com cerca de 542 KB, chamado `abox-probe-9471.png`. O ruído aleatório comprime pouco e torna o tamanho reconhecível nas requisições. O nome distinto permite encontrá-lo depois em uma URL, o que se mostrou relevante.

### A medição

Antes de fornecer o arquivo, substituímos os métodos de envio da página por versões que registravam o tamanho recebido e depois executavam a operação normal: `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send` e `HTMLFormElement.submit`. Colocamos o arquivo no seletor da própria página, esperamos dez segundos e lemos o registro.

Observar formulários é importante. Alguns serviços enviam por formulário HTML, sem passar por `fetch` ou `XMLHttpRequest`. O PicResize, por exemplo, mostra a imagem localmente por um endereço `blob:` enquanto faz o envio. Só a prévia parece indicar processamento local; a requisição do formulário revela o contrário.

### A conferência posterior

Quando o site devolvia um link para o resultado, buscamos esse endereço pela linha de comando em outro programa, sem cookies, sessão ou dados do navegador. Se o arquivo era devolvido assim, qualquer pessoa com o endereço também podia obtê-lo.

Os vinte são os sites que conseguimos operar, não necessariamente os maiores. Tentamos outros nove sem conseguir medi-los. Eles aparecem mais adiante: uma falha de automação não é um resultado favorável.

## As medições

Os números abaixo foram medidos em 17 de setembro de 2026. A última coluna resume a política publicada por cada serviço naquele dia.

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

## Onze enviam antes do clique em Converter

Em onze dos dezenove casos, o arquivo já estava a caminho do servidor enquanto a página ainda mostrava um botão Converter que não tinha sido apertado.

No iLoveIMG, o botão ainda dizia *Compress IMAGES*, mas 542.816 bytes já haviam sido enviados a `api9.iloveimg.com`. Observamos comportamento semelhante em iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf e nos quatro sites da mesma plataforma descrita adiante.

Há uma razão técnica: enviar enquanto a pessoa ajusta as opções faz a conversão parecer instantânea depois do clique. Isso melhora a espera, mas elimina uma etapa que muita gente acredita ter. Escolher um arquivo parece apenas abri-lo; apertar Converter parece autorizar o envio. Nesses casos, o envio começa no primeiro momento.

A consequência é direta: perceber que você escolheu o rascunho sem tarjas, o holerite ou a foto que pretendia recortar primeiro pode acontecer só depois de o arquivo já ter saído.

## O resultado fica em um endereço público

Quatro sites devolveram links comuns para os arquivos prontos. Buscamos os quatro por outro programa, sem cookies ou sessão. Todos devolveram o arquivo:

- **Ezgif**: `s1.ezgif.com/tmp/…` devolveu 542.483 bytes, exatamente o arquivo de teste.
- **Aconvert**: `s6.aconvert.com/convert/…` devolveu um PDF de 474.856 bytes.
- **ResizePixel**: `resizepixel.com/Image/…` devolveu 432.111 bytes.
- **IMGonline**: `srv2.imgonline.com.ua/result_img/…` devolveu um JPEG de 128.179 bytes.

Esse é um padrão comum da web, não uma invasão. Os endereços têm trechos aleatórios longos, difíceis de adivinhar. Ainda assim, a proteção depende do **sigilo da URL**, não de senha ou conta. URLs podem aparecer no histórico, em capturas da barra de endereço, em cabeçalhos `Referer` conforme a navegação e a política aplicada, em intermediários de rede e em mensagens que compartilham o link em vez do arquivo.

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

O ponto principal não é a diferença entre uma e duas horas. **Você não consegue observar diretamente toda a exclusão.** Não vê se ela alcançou backup, registro, relatório de erro que capturou o corpo da requisição ou rede de distribuição que guardou o resultado. Também não vê de fora o destino de todas as cópias após uma venda da empresa ou um incidente. Uma política descreve compromissos sobre sistemas que você não controla.

Esse é o argumento para preferir processamento que não envie o arquivo. Não é uma acusação de mentira contra as empresas medidas. É uma forma de dispensar a necessidade de confiar no tratamento de uma cópia remota.

## O serviço que não enviou

O Squoosh, compressor de imagens do Google, abriu, mostrou e comprimiu o arquivo sem fazer **nenhuma requisição de rede** no teste. Zero bytes pelo mesmo método que havia registrado 542.566 bytes saindo para o TinyPNG.

Ele funciona como controle da medição: o método consegue produzir resultado negativo, então os dezenove positivos não vieram de um procedimento que sempre encontraria envio. Também demonstra que essa tarefa e esses formatos podem ser processados no navegador, sem servidor.

Muitos serviços usam servidores por sua história de implementação e pelo modelo de contas, cotas e planos pagos. Um processamento inteiramente local é mais difícil de limitar por uso. Isso não torna o envio uma exigência técnica de toda conversão.

## O que não conseguimos medir

Outros nove sites foram tentados: FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com e SimpleImageResizer.

Em oito casos, os controles não aceitaram um arquivo inserido por script e exigiam uma interação real. O teste não chegou à etapa de envio. **Isso não é um resultado sobre a privacidade desses serviços** e não demonstra que processem localmente; significa apenas que a medição não foi executada.

O SimpleImageResizer revelou uma armadilha do método. O formulário tinha campo de arquivo, mas declarava `enctype="application/x-www-form-urlencoded"`. Nessa combinação, o navegador envia *apenas o nome*, não os bytes do arquivo. A primeira versão da nossa medição somou os dados do formulário e informou incorretamente um envio de 1.085.210 bytes. Excluímos a linha em vez de publicar esse número. Ao repetir o método, confira o `enctype` antes de concluir que o arquivo foi enviado.

## Como conferir por conta própria

O método é publicado para que outras pessoas possam repetir e corrigir a tabela. Há verificações simples:

- **Desligue a internet.** Carregue a ferramenta, desligue o Wi-Fi e use-a. O trabalho local continua; o que depende do servidor para. Uma promessa escrita não substitui esse resultado.
- **Observe a aba Rede.** Abra as ferramentas de desenvolvedor, escolha Rede, ordene por tamanho e use a ferramenta. Se uma foto de 4 MB foi enviada, haverá uma requisição de 4 MB no topo da lista. Observe *antes* de apertar Converter e também depois: esse é o resultado descrito acima.
- **Leia `connect-src`.** A `Content-Security-Policy` no código da página lista destinos permitidos para essas conexões, e o navegador a aplica. Um endereço do próprio serviço nessa lista permite que o código envie dados para ele.

O guia [é seguro enviar arquivos a conversores on-line?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) detalha essas verificações e uma quarta opção.

## Como este site responde às mesmas perguntas

Depois de medir outros sites, precisamos responder pelos mesmos critérios:

- **Bytes dos arquivos enviados: zero.** As ferramentas processam no navegador, sem enviar arquivo, miniatura, nome, tamanho ou conteúdo extraído.
- **Destino: nenhum servidor de processamento.** O site serve arquivos estáticos. A lista `connect-src` da política inclui publicidade, medição e contribuição, mas **nenhum servidor deste site para receber arquivos**.
- **Retenção: não se aplica.** Sem receber os arquivos, não há cópia remota nem prazo de exclusão em que confiar.
- **Verificável: sim.** O código é [público](https://github.com/A-Box-of-Tools/website). A geração reduz comentários e espaços sem transformar a lógica; você pode executá-la e comparar com os arquivos publicados.

As exceções são explícitas. O site usa publicidade e contagem de visitas do Google, sem entregar dados dos arquivos a esses serviços. [Imagens para Vídeo](https://abox.tools/pt/imagens-para-video/) pode buscar uma imagem em um endereço colado, cujo servidor verá seu IP. [Compartilhar Texto](https://abox.tools/pt/compartilhar-texto/) usa uma conexão para apresentar dois navegadores, sem armazenar ou transportar o conteúdo por esse servidor. A [política de privacidade](https://abox.tools/pt/privacidade/) explica os três casos.

As alternativas locais incluem [compressão de imagens até um tamanho escolhido](https://abox.tools/pt/comprimir-imagem/), [imagens para PDF](https://abox.tools/pt/imagens-para-pdf/), [junção de PDFs](https://abox.tools/pt/juntar-pdf/), [compressão de PDF](https://abox.tools/pt/comprimir-pdf/) e [consulta e remoção de EXIF](https://abox.tools/pt/remover-dados-exif/). São gratuitas, sem conta e sem destino para enviar seus arquivos.

## Usar estes números

Você pode citar as medições e repetir o teste. Ao reproduzi-las, mantenha o contexto: vinte conversores gratuitos, medidos em 17 de setembro de 2026; dezenove enviaram o arquivo; onze enviaram antes do clique em Converter; e quatro de quatro resultados verificados foram obtidos por endereço público, sem sessão.

Um link para esta página é bem-vindo, mas não obrigatório. Sites mudam, e este é o registro de uma tarde. Se repetir o método e encontrar outro resultado, use a [página de contato](https://abox.tools/pt/contato/). Correções acompanhadas das medições serão publicadas.
