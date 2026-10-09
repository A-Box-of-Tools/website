# O arquivo que quase nada abre, exceto o navegador onde você lê isto

Uma imagem salva de um site chega como `.avif` e o visualizador de fotos a recusa, enquanto o navegador mostra sem dificuldade. Essa diferença explica o problema e por que a conversão não precisa sair do computador.

[Abrir AVIF para JPG](https://abox.tools/pt/avif-para-jpg/): O formato que os sites salvam hoje, no formato que todos sempre aceitaram.

Última atualização 17 de setembro de 2026

## A resposta curta

Abra o [conversor de AVIF para JPG](https://abox.tools/pt/avif-para-jpg/), arraste os arquivos e aperte “Converter”. Deixe a qualidade em 92. Você recebe JPEGs, com um botão de download por imagem ou um zip se houver várias.

Nada é enviado, e também não é preciso baixar nada antes. O decodificador já está no navegador onde você lê esta página. Essa é a parte que vale entender e que explicamos abaixo.

## O que é AVIF e por que você tem um

AVIF guarda uma imagem estática como um quadro de vídeo moderno: um único quadro-chave do codec **AV1**, dentro do mesmo tipo de contêiner de caixas usado por MP4. Parece um jeito estranho de criar um formato de imagem, mas funciona muito bem. AV1 recebeu muito mais investimento técnico que codecs de imagem estática, porque é no vídeo que está o maior mercado.

O resultado ocupa muito menos que JPEG com qualidade visual semelhante, muitas vezes de três a cinco vezes menos. Sites passaram a usá-lo. Quando você salva uma imagem, recebe o formato servido pelo site; não foi você que escolheu AVIF.

Depois descobre que vários programas do computador não abrem o arquivo:

- o Windows precisa de uma extensão da loja para mostrar no aplicativo Fotos;
- muitos editores de desktop ainda recusam o formato;
- formulários que verificam extensões muitas vezes não o reconhecem;
- impressoras, leitores digitais e programas de câmeras estão anos atrás.

## O navegador já sabe ler

Arraste o arquivo que não abre para uma aba do navegador e a imagem aparece normalmente. Chrome e Firefox decodificam AVIF desde 2021; Safari, desde 2023.

É por isso que essa conversão não precisa de servidor. O conversor deve ler AVIF e gravar JPEG; o navegador já faz as duas coisas. [Esta ferramenta](https://abox.tools/pt/avif-para-jpg/) acrescenta um botão de salvar ao decodificador: abre o arquivo, desenha a imagem e pede um JPEG ao navegador.

Quando um conversor pede que você envie o AVIF, ele usa a própria cópia de um programa que você já tem e fica com a imagem enquanto trabalha.

## A comparação que explica quando é preciso outro decodificador

AVIF tem um parente próximo: **HEIC**, o formato das fotos do iPhone. Os projetos são quase iguais: o mesmo contêiner de caixas com um quadro de vídeo dentro, mas HEVC no lugar de AV1. A compatibilidade dos programas, porém, é o oposto.

|  | HEIC | AVIF |
| --- | --- | --- |
| Navegadores que decodificam | Só Safari | Todos |
| Navegadores que codificam | Nenhum | Nenhum |
| O que o conversor precisa incluir | Um decodificador de cerca de 1,4 MB | Nada |

Por isso nosso [conversor de HEIC](https://abox.tools/pt/heic-para-jpg/) baixa um codec no primeiro uso e explica esse processo, enquanto este não baixa nada. O site e a promessa são os mesmos; os formatos exigem soluções diferentes.

Isso dá uma pergunta útil para qualquer conversor: *o navegador já faz esse trabalho?* Se fizer, enviar o arquivo é uma escolha do site, não uma exigência da tarefa.

## O JPG vai ficar várias vezes maior

Espere esse resultado; ele não indica falha. Um AVIF de 40 KB pode virar um JPEG de 200 KB com qualidade visual semelhante. O exemplo da ferramenta fica cerca de cinco vezes maior, e a linha do resultado informa isso.

A razão é a mesma: AVIF está entre os codecs de imagem estática mais eficientes, e JPEG está entre os mais antigos. Você troca tamanho por compatibilidade. Faz sentido quando o destino não aceita AVIF, mas continua sendo uma troca.

Se o tamanho importar depois, o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) reduz o JPEG até um limite escolhido por você. A ferramenta oferece esse próximo passo abaixo do resultado.

## O que JPEG não consegue preservar

Duas características, que não afetam a maioria das imagens:

**Transparência.** AVIF pode ter fundo transparente; JPEG não. É preciso colocar uma cor por trás. A ferramenta pergunta qual, sugere branco e só mostra a opção quando algum arquivo realmente tem transparência. A maioria dos AVIFs salvos de sites é composta por fotos opacas, então essa pergunta geralmente nem aparece. Para preservar a transparência, use PNG ou WebP com o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que lê AVIF e grava ambos.

**HDR e maior profundidade de cor.** AVIF pode guardar dez ou doze bits por canal e representar luzes mais intensas que uma tela comum mostra. JPEG usa oito bits e não representa HDR, então essas imagens são reduzidas ao intervalo comum. Quase nenhuma imagem salva de uma página normal usa esses recursos; se a sua não usa, não há perda por esse motivo.

## O caminho contrário é outro problema

Aqui não há conversor de JPG para AVIF por causa do outro lado da mesma limitação: **nenhum navegador grava AVIF**. Se você pedir esse formato a um canvas, ele pode devolver um PNG com a identificação errada.

Uma página que afirma criar AVIF no navegador pode estar enganada ou enviar a imagem para um servidor codificá-la. Fazer isso corretamente sem servidor exige incluir um codificador. É um trabalho real, que está no [roteiro](https://abox.tools/pt/roteiro/), não uma função que se deva fingir pronta.

## Os metadados não acompanham a imagem

A imagem é decodificada e redesenhada. Só passam os pixels: EXIF, GPS, perfis de cor e XMP ficam para trás. Em uma imagem salva de um site, normalmente já havia poucos metadados ou nenhum.

Para conferir o que existe no arquivo antes de decidir, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) mostra os dados sem recomprimir a imagem. O guia [converter uma foto remove os metadados?](https://abox.tools/pt/guias/converter-uma-foto-remove-os-metadados/) explica com mais detalhes.
