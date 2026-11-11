# O arquivo que quase nada abre, exceto o navegador onde você lê isto

Uma imagem salva de um site chega como `.avif` e o visualizador de fotos a recusa, enquanto o navegador mostra sem dificuldade. Essa diferença explica o problema e por que a conversão não precisa sair do computador.

[Abrir AVIF para JPG](https://abox.tools/pt/avif-para-jpg/): O formato que os sites salvam hoje, no formato que todos sempre aceitaram.

Última atualização 13 de outubro de 2026

## A resposta curta

Abra o [conversor de AVIF para JPG](https://abox.tools/pt/avif-para-jpg/), arraste os arquivos e aperte “Converter”. Deixe a qualidade em 92. Você recebe JPEGs, com um botão de download por imagem ou um zip se houver várias.

Nada é enviado, e também não é preciso baixar nada antes. O decodificador já está no navegador onde você lê esta página. Essa é a parte que vale entender e que explicamos abaixo.

## Use JPEG quando o problema for compatibilidade

**Uma imagem baixada para documento ou formulário.** Converta a partir do AVIF original, comece com qualidade 92 e abra o JPEG no aplicativo que o rejeitava. Se o formulário também limitar bytes, confira o novo tamanho: converter pode aumentá-lo. Use o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) com JPEG selecionado para cumprir esse segundo requisito.

**Uma cópia para porta-retratos digital, impressora ou aparelho antigo.** Teste uma foto antes de converter a pasta inteira. Se exigir dimensões menores, ajuste a cópia: renomear apenas a extensão AVIF não altera o codec nem o tamanho. Preserve o original AVIF, principalmente em fotos HDR. Esta é uma cópia estática SDR para compatibilidade; de uma sequência obtém só a primeira imagem decodificada. Para manter um logo transparente, escolha PNG ou WebP pelo redimensionador.

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

## O que esta conversão não preserva

Duas características, que não afetam a maioria das imagens:

**Transparência.** AVIF pode ter fundo transparente; JPEG não. É preciso colocar uma cor por trás. A ferramenta pergunta qual, sugere branco e só mostra a opção quando algum arquivo realmente tem transparência. A maioria dos AVIFs salvos de sites é composta por fotos opacas, então essa pergunta geralmente nem aparece. Para preservar a transparência, use PNG ou WebP com o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que lê AVIF e grava ambos.

**HDR e profundidade de cor.** Esta ferramenta grava um JPEG SDR comum de 8 bits a partir do canvas do navegador. A profundidade adicional e as informações HDR do AVIF não são preservadas; cores ou realces podem mudar. Guarde o original para arquivar. Existem formatos HDR baseados em JPEG: [a especificação Ultra HDR do Android](https://developer.android.com/media/platform/hdr-image-format) descreve um mapa de ganho que esta ferramenta não cria.

## O caminho contrário é outro problema

Não há conversor JPG para AVIF aqui porque **esta página não inclui um codificador AVIF**. A saída do canvas usa JPEG, PNG ou WebP, sem apresentar um PNG renomeado como AVIF.

Um codificador separado, inclusive WebAssembly, pode criar AVIF localmente sem enviar a imagem a um servidor. É outra implementação. Um formato nativo não aceito volta para PNG, como explica [a documentação do canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).

## Os metadados não acompanham a imagem

A imagem é decodificada e redesenhada. Só passam os pixels: EXIF, GPS, perfis de cor e XMP ficam para trás. Em uma imagem salva de um site, normalmente já havia poucos metadados ou nenhum.

Para conferir o que existe no arquivo antes de decidir, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) mostra os dados sem recomprimir a imagem. O guia [converter uma foto remove os metadados?](https://abox.tools/pt/guias/converter-uma-foto-remove-os-metadados/) explica com mais detalhes.
