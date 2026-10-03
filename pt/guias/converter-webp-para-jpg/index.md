# A imagem que a web salva e o formato que quase tudo aceita

Ao salvar uma imagem de muitos sites, você recebe um `.webp`: o navegador lê perfeitamente, mas vários programas ainda recusam. Veja o que é esse formato, o que muda na conversão e por que o JPEG costuma ficar maior.

[Abrir WebP para JPG](https://abox.tools/pt/webp-para-jpg/): As imagens que a web salva, no formato que todos ainda aceitam.

Última atualização 17 de setembro de 2026

## A resposta curta

Abra o [conversor de WebP para JPG](https://abox.tools/pt/webp-para-jpg/), arraste os arquivos e aperte “Converter”. Deixe a qualidade em 92, a menos que tenha um motivo para mudar. Você recebe JPEGs, com um download por imagem ou um zip se houver várias.

Nada é enviado porque não precisa ser. A razão também explica a rapidez: o decodificador já está no navegador.

## Por que você recebeu um .webp

WebP é o formato de imagem do Google. Os sites o usam porque ocupa bem menos que JPEG com qualidade visual semelhante: normalmente de um quarto a um terço menos, às vezes mais. Para quem serve milhões de imagens, isso economiza banda e tempo de carregamento. Por isso muitos sites grandes adotaram o formato nos últimos anos.

Quando você clica com o botão direito e salva uma imagem, a pasta de downloads recebe o formato que o site estava servindo. Você não escolheu WebP; só salvou uma imagem.

Depois descobre que ela não entra onde você precisa. Os obstáculos comuns são:

- formulários que comparam a extensão com uma lista feita anos atrás;
- versões antigas de Word, PowerPoint e Photoshop;
- muitos leitores digitais e programas de impressoras e câmeras;
- algumas gráficas que só aceitam JPEG ou TIFF.

Enquanto isso, o navegador abre sem dificuldade: todos leem WebP desde 2020. Essa diferença entre o navegador e os outros programas é a razão desta página.

## O JPG provavelmente ficará maior; isso não é falha

Vale saber antes de converter: um WebP de 300 KB muitas vezes vira um JPEG de 450 KB. Nada deu errado.

WebP comprime melhor que JPEG. JPEG ficou pronto em 1992; WebP chegou em 2010, com quase vinte anos a mais de pesquisa. Ao passar do formato novo ao antigo, você pede que um compressor menos eficiente descreva a mesma imagem, e ele precisa de mais bytes. É uma troca de tamanho por compatibilidade, válida quando o destino não aceita WebP, mas que o conversor deve explicar.

Se precisar reduzir o tamanho depois, o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/) ajusta o JPEG ao limite que você indicar. Ele aparece abaixo do resultado para você não precisar procurar.

## A transparência precisa virar uma cor

Essa é a surpresa que faz logotipos saírem de alguns conversores com um retângulo preto atrás.

WebP pode ter transparência. JPEG não tem canal alfa nem como representar “não há nada aqui”. É preciso pintar uma cor por trás da imagem. Conversores que não perguntam não estão preservando a transparência: estão escolhendo por você, e muitos acabam usando preto.

[Este conversor](https://abox.tools/pt/webp-para-jpg/) pergunta, sugere branco e só mostra a opção quando algum arquivo realmente tem transparência. Ele verifica a imagem decodificada, não apenas o formato: muitos WebPs têm um canal alfa totalmente opaco. Um seletor de cor que não muda nada só atrapalha.

Se você precisa manter a transparência, não converta para JPEG. Guarde o WebP ou transforme em PNG com o [Compressor de imagens](https://abox.tools/pt/comprimir-imagem/), que lê WebP e grava PNG.

## WebP animado vira um único quadro

Um WebP pode conter uma animação, como GIF. JPEG guarda uma única imagem, então não tem como preservar os outros quadros.

A ferramenta avisa antes de converter: a linha identifica o arquivo animado, e o resultado repete o aviso. Você recebe o primeiro quadro. Para preservar o movimento, o destino deve ser vídeo, não imagem estática. O guia sobre [converter GIF para MP4](https://abox.tools/pt/guias/converter-gif-para-mp4/) explica o que essa mudança envolve.

## A imagem é recomprimida

WebP e JPEG usam codecs diferentes. Não basta trocar o contêiner: a imagem precisa ser decodificada em pixels e codificada de novo. Todo conversor de WebP para JPG faz isso, inclusive os que pedem envio.

Você controla quanto se perde. A qualidade padrão é 92, um valor em que uma foto é difícil de distinguir da original. Abaixo de cerca de 75, as perdas começam a aparecer em bordas nítidas e texto.

Um caso merece atenção: WebP **sem perdas**. Ferramentas de design usam esse modo para gráficos de cores chapadas. O JPEG será a primeira cópia com perdas dessa imagem. A ferramenta identifica esses arquivos na lista para você decidir antes de converter.

## Os metadados ficam para trás

Ao converter pelo canvas do navegador, só passam os pixels. EXIF, coordenadas GPS, perfis de cor e blocos de direitos autorais ficam de fora.

Para quem vai enviar uma imagem, isso pode ser o resultado desejado. Caso não seja, ou se você quiser conferir os dados antes de decidir, o [Visualizador e removedor de EXIF](https://abox.tools/pt/remover-dados-exif/) lê e altera esses dados sem recomprimir a imagem. O guia [converter uma foto remove os metadados?](https://abox.tools/pt/guias/converter-uma-foto-remove-os-metadados/) traz uma explicação mais longa.

## Por que este conversor não pede envio

Ao procurar um conversor de WebP, quase todos os resultados pedem que você mande o arquivo para um servidor. Vale perguntar para que o servidor é necessário. Neste caso, ele não é.

Ler WebP exige um decodificador que o navegador já tem desde 2020; é por isso que mostrava a imagem no site de origem. Gravar JPEG exige um codificador que navegadores incluem há muito tempo. As duas partes do trabalho já estão instaladas. Um site que recebe o arquivo usa a própria cópia desse programa e fica com sua imagem enquanto trabalha.

Nem toda conversão é assim. O [conversor de HEIC](https://abox.tools/pt/guias/converter-heic-para-jpg/) precisa de um decodificador ausente em muitos navegadores, por isso o inclui e explica como funciona. A resposta depende do formato. A pergunta útil é o que aquela conversão realmente exige. O guia [é seguro enviar arquivos?](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) desenvolve essa questão.
