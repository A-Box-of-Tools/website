# Como preparar as fotos do celular para a web

Uma foto de celular está no formato errado, é quatro vezes maior do que precisa e sabe onde você mora. Deixá-la postável é uma sequência curta — converter, enquadrar, comprimir — e cada passo roda na sua própria máquina, que é exatamente onde fotos com o seu GPS dentro devem ficar.

Última atualização 26 de agosto de 2026

## A resposta curta

1. **Fotos de iPhone primeiro:** passe os arquivos HEIC pelo [conversor de HEIC](https://abox.tools/pt/heic-para-jpg/) e escolha deixar os metadados de fora. Ele diz, antes de converter qualquer coisa, quais fotos carregam coordenadas GPS. Fotos que já são JPEG pulam este passo.
2. **Enquadre e dimensione:** solte o lote no [Redimensionador de imagens](https://abox.tools/pt/redimensionar-imagem/). Defina um lado maior — 1600 pixels servem para a maioria das páginas, 2000 se os leitores forem dar zoom — ou recorte o lote inteiro para uma mesma proporção com um clique.
3. **Acerte o orçamento:** termine no [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que aceita um alvo em kilobytes em vez de um controle de qualidade, e devolve o lote num zip só.

Tudo roda no seu navegador. Os originais — resolução cheia, GPS e tudo — nunca saem da sua máquina, e é essa a razão de fazer isso localmente em vez de num site de conversão.

## Para onde vão os metadados

O risco silencioso de uma foto de celular não são os pixels; são as etiquetas. Os metadados EXIF registram a câmera, os horários e, em quase todo telefone, as coordenadas GPS de onde a foto foi tirada. Poste isso e você pode estar publicando o seu endereço numa forma que qualquer um que olhe sabe ler.

O fato útil desta sequência é que ela cuida das etiquetas por conta própria. Redimensionar e comprimir redesenham a imagem a partir dos pixels, e pixels redesenhados não carregam etiquetas: o que sai dos passos 2 ou 3 está limpo sem você pedir. Os dois casos que pedem uma decisão:

- **Converter HEIC:** o conversor pode levar os metadados junto ou deixá-los de fora — é uma caixinha — e avisa quais fotos têm GPS a bordo. Para qualquer coisa pública, deixe de fora.
- **Uma foto que você não vai redimensionar:** se os pixels devem ficar intactos, byte a byte, use o [editor de EXIF](https://abox.tools/pt/remover-dados-exif/), que remove as etiquetas sem recodificar a imagem. O [guia de metadados](https://abox.tools/pt/guias/remover-dados-exif-e-gps/) é a versão longa.

## Por que redimensionar antes de comprimir

Porque os pixels são o orçamento. Uma foto de 12 megapixels espremida o bastante para caber em 300 KB fica visivelmente pior do que uma de 2 megapixels comprimida de leve no mesmo espaço: os mesmos kilobytes se espalham por seis vezes a área. Decidir primeiro o tamanho de exibição deixa o compressor gastar o orçamento em qualidade, e não em resolução que ninguém vai ver.

O compressor redimensiona por conta própria quando não há outro jeito de chegar ao alvo, mas trata isso como último recurso. Fazer o enquadramento você mesmo no redimensionador mantém a decisão — o que cortar, qual borda importa — onde ela deve ficar.

O [guia de redimensionamento](https://abox.tools/pt/guias/redimensionar-uma-imagem/) e o [guia de compressão](https://abox.tools/pt/guias/comprimir-uma-imagem-para-um-tamanho-exato/) aprofundam cada um a sua metade, inclusive o que os números de qualidade medem de verdade.

![O redimensionador ajustado no lado maior, com 1600 digitado e lados maiores prontos ao lado.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

O lado maior primeiro, porque é o único ajuste que trata igual uma foto em pé e uma deitada.

## O lote inteiro de uma vez

Cada ferramenta da sequência aceita uma pasta inteira num arrasto só: o conversor faz cada HEIC, rajadas incluídas, o redimensionador põe um mesmo enquadramento no conjunto todo ou deixa você recortar cada foto do seu jeito, e o compressor devolve tudo num único zip. Vinte fotos custam pouco mais da sua atenção do que uma: o tempo de máquina é da sua máquina, e é menor do que qualquer envio teria sido.

![Três linhas de resultado, cada uma com uma foto reduzida de megabytes para cerca de 150 kB, com a qualidade em que cada uma parou.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

E a qualidade depois, no lote inteiro de uma vez. A ordem importa: a seção de cima diz por quê.

## Se você faz isso toda semana

A sequência morar aqui em três ou quatro páginas é de propósito: cada página faz um trabalho, e cada uma prova sozinha que nada sai da sua máquina. Mas cada passo é código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências, com READMEs que explicam o decodificador, a reamostragem e a busca do tamanho-alvo.

Se as suas fotos tomam sempre a mesma forma — mesmo lado maior, mesmo orçamento, mesmas etiquetas fora — aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para compor esses módulos numa única área de soltar com as suas predefinições já dentro. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
