# Como preparar as fotos do celular para a web

Uma foto de celular está no formato errado, é quatro vezes maior do que precisa e sabe onde você mora. Deixá-la postável é uma sequência curta — converter, enquadrar, comprimir — e cada passo roda no seu próprio computador, que é exatamente onde fotos com o seu GPS dentro devem ficar.

Última atualização 13 de outubro de 2026

## A resposta curta

1. **Fotos de iPhone primeiro:** passe os arquivos HEIC pelo [conversor de HEIC](https://abox.tools/pt/heic-para-jpg/) e escolha deixar os metadados de fora. Ele diz, antes de converter qualquer coisa, quais fotos carregam coordenadas GPS. Fotos que já são JPEG pulam este passo.
2. **Enquadre e dimensione:** solte o lote no [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/). Defina um lado maior — 1600 pixels servem para a maioria das páginas, 2000 se os leitores forem dar zoom — ou recorte o lote inteiro para uma mesma proporção com um clique.
3. **Acerte o orçamento:** termine no [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que aceita um alvo em kilobytes em vez de um controle de qualidade, e devolve o lote num zip só.

Tudo roda no seu navegador. Os originais — resolução cheia, GPS e tudo — nunca saem do seu computador, e é essa a razão de fazer isso localmente em vez de num site de conversão.

## Uma galeria de blog e um catálogo de produtos usam pixels de formas diferentes

**Um artigo ou galeria compartilhada.** Meça o espaço mais largo onde a imagem aparecerá e escolha pixels suficientes para as densidades de tela previstas. Defina um máximo de bytes por imagem e confira rostos, céus e texturas finas na página pronta. Os tamanhos anteriores são pontos de partida, não limites universais.

**Cartões de produtos com enquadramento uniforme.** Recorte na proporção do cartão no redimensionador e confira cada imagem: o mesmo corte pode cortar um produto posicionado de outra forma. Adicione margens até o quadro exato se todas as bordas precisam aparecer. Preserve uma cópia maior para o zoom do produto, em vez de ampliar a miniatura.

**Diagramas e capturas no mesmo artigo.** Use PNG ou WebP sem perdas confirmado para texto pequeno e bordas definidas; JPEG ou WebP com perdas para fotos. O conversor [PNG para WebP](https://abox.tools/pt/png-para-webp/) informa se o navegador realmente gravou sem perdas. Confira o menor texto na página, não apenas o tamanho do arquivo.

## Para onde vão os metadados

O risco silencioso de uma foto de celular não são os pixels; são as etiquetas. Os metadados EXIF registram a câmera, os horários e, em quase todo telefone, as coordenadas GPS de onde a foto foi tirada. Poste isso e você pode estar publicando o seu endereço numa forma que qualquer um que olhe sabe ler.

Arquivos realmente redimensionados ou comprimidos são redesenhados a partir de pixels sem copiar etiquetas. Mas ambas as ferramentas devolvem intacto um arquivo já adequado: uma foto pequena que não precisa de nenhum passo pode preservar EXIF e GPS. Confira as cópias finais antes de publicar e use o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) para limpar arquivos intactos. Restam duas decisões:

- **Converter HEIC:** o conversor pode levar os metadados junto ou deixá-los de fora — é uma caixinha — e avisa quais fotos têm GPS a bordo. Para qualquer coisa pública, deixe de fora.
- **Uma foto que você não vai redimensionar:** se os pixels devem ficar intactos, byte a byte, use o [editor de EXIF](https://abox.tools/pt/remover-dados-exif/), que remove as etiquetas sem recodificar a imagem. O [guia de metadados](https://abox.tools/pt/guias/remover-dados-exif-e-gps/) é a versão longa.

## Por que redimensionar antes de comprimir

Porque os pixels são o orçamento. Uma foto de 12 megapixels espremida o bastante para caber em 300 KB fica visivelmente pior do que uma de 2 megapixels comprimida de leve no mesmo espaço: os mesmos kilobytes se espalham por seis vezes a área. Decidir primeiro o tamanho de exibição deixa o compressor gastar o orçamento em qualidade, e não em resolução que ninguém vai ver.

O compressor redimensiona por conta própria quando não há outro jeito de chegar ao alvo, mas trata isso como último recurso. Fazer o enquadramento você mesmo no redimensionador mantém a decisão — o que cortar, qual borda importa — onde ela deve ficar.

O [guia de redimensionamento](https://abox.tools/pt/guias/redimensionar-uma-imagem/) e o [guia de compressão](https://abox.tools/pt/guias/comprimir-uma-imagem-para-um-tamanho-exato/) aprofundam cada um a sua metade, inclusive o que os números de qualidade medem de verdade.

![O redimensionador ajustado no lado maior, com 1600 digitado e lados maiores prontos ao lado.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

O lado maior primeiro, porque é o único ajuste que trata igual uma foto em pé e uma deitada.

## O lote inteiro de uma vez

Cada ferramenta da sequência aceita uma pasta inteira num arrasto só: o conversor faz cada HEIC, rajadas incluídas, o redimensionador põe um mesmo enquadramento no conjunto todo ou deixa você recortar cada foto do seu jeito, e o compressor devolve tudo num único zip. Vinte fotos custam pouco mais da sua atenção do que uma: o processamento acontece no seu computador, e é menor do que qualquer envio teria sido.

![Três linhas de resultado, cada uma com uma foto reduzida de megabytes para cerca de 150 kB, com a qualidade em que cada uma parou.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

E a qualidade depois, no lote inteiro de uma vez. A ordem importa: a seção de cima diz por quê.

## Se você faz isso toda semana

A sequência morar aqui em três ou quatro páginas é de propósito: cada página faz um trabalho, e cada uma prova sozinha que nada sai do seu computador. Mas cada passo é código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências, com READMEs que explicam o decodificador, a reamostragem e a busca do tamanho-alvo.

Se as suas fotos tomam sempre a mesma forma — mesmo lado maior, mesmo orçamento, mesmas etiquetas fora — aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para compor esses módulos numa única área de soltar com as suas predefinições já dentro. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
