# Comprimir vídeo — até um tamanho que dê para enviar

Diga o tamanho máximo. A ferramenta calcula os ajustes e mede o resultado antes de entregar.

> Reduza um vídeo para menos de 8, 16, 25 ou quantos megabytes precisar, no navegador. Calcula dimensões e taxa de bits, codifica e mede. Nada é enviado e o áudio é copiado sem alterações.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/comprimir-video/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem vídeos. Não existe servidor.

O vídeo é decodificado, reduzido, codificado novamente e gravado na memória do seu computador. Quem faz o trabalho são os codecs do navegador e o código desta página. Não há função de upload nem servidor para receber o arquivo. Um gigabyte não precisa sair daqui para voltar menor.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Os arquivos ficam no seu aparelho

## Como comprimir um vídeo até caber no envio

1. **Escolha o vídeo.** Um MP4 ou MOV por vez. O navegador lê do disco e mostra duração, tamanho, dimensões e taxa de bits.
2. **Diga o tamanho máximo.** Digite os megabytes ou escolha 8, 16, 25, 50, 100, metade ou um quarto. A linha abaixo mostra dimensões, taxa disponível depois de reservar o áudio e tamanho estimado. Você pode remover o som para dedicar todo o espaço à imagem.
3. **Escolha outras dimensões, se precisar.** O limite define um tamanho automaticamente. Você pode mudar se precisar de texto legível em 1080p ou só quiser assistir no celular. O tamanho escolhido é um teto: a imagem nunca é ampliada além do original.
4. **Comprima e confira a medição.** A imagem é decodificada, reduzida e codificada quadro a quadro, com uma barra de progresso. Depois o arquivo é medido e reaberto para conferir a duração. Se ultrapassar o limite, há uma segunda tentativa com maior compressão. Você pode assistir ao resultado na memória antes de baixar.

## A versão longa

[Como comprimir um vídeo até o tamanho que você consegue enviar](https://abox.tools/pt/guias/comprimir-um-video/): O que um limite de tamanho custa à imagem, para onde vão os megabytes, por que reduzir a resolução antes de perder nitidez e como comprimir no navegador sem enviar o arquivo.

## Também na caixa

- [Conversor para MP4](https://abox.tools/pt/converter-para-mp4/): Da gravação de tela, do arquivo extraído ou da câmera para um MP4 com H.264 e AAC. Copia o que pode e só recodifica o necessário.
- [Rotacionar vídeo](https://abox.tools/pt/girar-video/): Um quarto de volta, meia volta ou para o outro lado. Na rotação pelo cabeçalho, os quadros da imagem ficam intactos.
- [Imagens para vídeo](https://abox.tools/pt/imagens-para-video/): Transforme uma pasta de imagens em um vídeo.
- [Aparador de vídeo](https://abox.tools/pt/aparar-video/): Marque os trechos que valem a pena enquanto ele toca. Receba tudo como um vídeo só.

## Perguntas

### Quanto um vídeo pode diminuir?

Até onde ainda caiba uma imagem utilizável; a página avisa se o limite for pequeno demais. O áudio é copiado e mantém seu tamanho, aproximadamente um megabyte por minuto para estéreo comum. A imagem precisa de algumas centenas de quilobits por segundo mesmo nas menores dimensões. Remover o áudio deixa mais espaço para ela.

### Por que as dimensões mudaram?

A taxa de bits precisa ser considerada junto com o número de pixels. Dois megabits por segundo podem funcionar em 720p e ficar borrados em 4K. A ferramenta reduz as dimensões até distribuir bits suficientes por quadro. Uma imagem menor e nítida costuma ser melhor que uma grande e borrada. Você vê a escolha antes de começar e pode alterá-la.

### A qualidade vai piorar?

Sim. A imagem é codificada novamente com uma taxa menor, ganhando mais uma geração de compressão. O áudio não muda. Reduzir 900 MB para 25 MB perde muito mais detalhe que reduzir um arquivo à metade. A página mostra dimensões e taxa para que você possa avaliar a troca.

### Qual formato é gerado?

MP4 com vídeo H.264 e a faixa de áudio copiada intacta. A escolha busca ampla compatibilidade. Não gera WebM, HEVC ou AV1, que podem ocupar menos espaço, mas nem todos os destinatários conseguem abrir.

### Quais arquivos são aceitos?

MP4 e MOV com H.264, HEVC, VP9 ou AV1, se o navegador conseguir decodificar. HEVC exige suporte no computador. Ainda não lê WebM, MKV nem AVI; a página avisa claramente ao selecionar esses formatos.

### Quanto tempo leva?

Depende do codificador do computador. Com aceleração por hardware, um minuto em 1080p costuma levar menos de um minuto; sem ela, mais. Um vídeo 4K longo pode demorar bastante. A barra mostra o quadro atual. Cancelar interrompe o trabalho sem gravar o resultado.

### Por que foram necessárias duas passagens?

A taxa solicitada é aproximada e um vídeo complexo pode ultrapassá-la. A ferramenta deixa margem e mede o resultado. Se ficar grande demais, calcula outra taxa pela diferença e codifica novamente. São feitas até duas passagens, e a página informa quando precisou da segunda.

### Meus vídeos são enviados para algum lugar?

Não. O navegador lê, decodifica, codifica e grava no seu computador. A `Content-Security-Policy` lista os destinos permitidos; nenhum pertence a este site. Desconecte a rede para conferir. Evitar o upload também costuma poupar mais tempo que a própria codificação.

### Funciona no celular?

Sim, se o navegador do celular codificar vídeo. O codificador de hardware costuma ser rápido, mas o resultado inteiro ocupa memória até ser salvo. Corte um vídeo longo antes com o [Cortador de vídeo](https://abox.tools/pt/aparar-video/) ou use um computador com mais memória.

### Há limite de tamanho, e custa alguma coisa?

Não há limite fixo de entrada: o arquivo é lido em partes. O resultado fica na memória até o download, então o limite depende do computador; algumas centenas de megabytes costumam caber. É grátis, sem conta, login ou período de teste. A publicidade paga o site e não recebe dados do vídeo.

### Funciona offline?

Sim. Carregue a página uma vez e desconecte a internet. Ela continua funcionando, algo impossível para uma ferramenta que enviasse o vídeo a um servidor.

## Como dá para conferir a promessa de privacidade

- **O upload é a parte demorada, e aqui ele não acontece.** Vídeos costumam ser os maiores arquivos que tentamos enviar. Fazer upload de 900 MB para receber 25 MB pode levar mais tempo que a compressão, além de entregar uma cópia a outro servidor. Aqui os codecs do navegador fazem o trabalho e os bytes só passam do disco para a memória e de volta ao disco. A `Content-Security-Policy` lista os destinos permitidos; nenhum pertence a este site. Funciona sem conexão.
- **O ponto de partida é o limite que você precisa cumprir.** Um aplicativo de mensagens, e-mail ou formulário impõe um máximo. Você informa esse número e a página calcula o restante: reserva o espaço do áudio e do contêiner, e divide o que sobra pela duração para obter a taxa de bits da imagem. Depois reduz as dimensões por tamanhos conhecidos até haver bits suficientes por quadro. Nunca amplia. Os ajustes aparecem antes de começar e você pode escolher outras dimensões.
- **Comprimir vídeo significa codificar novamente.** Ao contrário de um ZIP, esta compressão tem perdas. A imagem é decodificada, reduzida e codificada em H.264 na taxa permitida pelo limite: mais uma geração de compressão desde a câmera. O áudio não é recodificado; seus dados são copiados intactos. O resultado é MP4 pela compatibilidade com celulares, navegadores e aplicativos de mensagens.
- **O resultado é medido e ajustado uma segunda vez se necessário.** O codificador se aproxima da taxa solicitada, mas nem sempre acerta exatamente. A ferramenta deixa uma margem e mede o arquivo. Se ainda ultrapassar o limite, calcula uma taxa menor pela diferença e faz uma segunda passagem. A página informa quando isso acontece. Também reabre o resultado para conferir a duração: perder o final ou o áudio não seria uma compressão válida.
- **O custo no seu computador, explicado com clareza.** O tempo depende do seu computador. Com codificador de hardware, costuma ser menor que a duração do vídeo; sem ele, pode ser maior, especialmente em 4K. A entrada é lida em partes, mas o resultado inteiro fica na memória até o download. Esse é o limite prático. Você pode cancelar a qualquer momento.
- **Quais arquivos são lidos e quais não são.** Lê MP4 e MOV com H.264, HEVC, VP9 ou AV1, desde que o navegador decodifique o formato. Um vídeo HEVC de iPhone exige suporte no computador. WebM, MKV e AVI ainda não são lidos aqui; a página avisa ao encontrá-los.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e medição vêm do Google. Não recebem vídeo, quadro, nome, tamanho, duração nem o limite escolhido. Todo o código que lê, codifica e grava é servido deste endereço e está no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão "Buy me a coffee" no cabeçalho é desenhado por um script de cdnjs.buymeacoffee.com e usa letras do Google Fonts. É apenas um link: não registra visitas e não recebe informações sobre você ou seus vídeos. Nada acontece até você clicar, e o destino é um site de outra pessoa.
- **Funciona offline.** Desconecte a rede e a página continua funcionando. Uma ferramenta que enviasse o vídeo a um servidor para comprimir pararia.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/plan.js` para calcular dimensões e taxa de bits a partir do limite, e `src/encode.js` para decodificar, desenhar e codificar, copiando o áudio sem alterações. Nenhum deles acessa a rede, nem o leitor e o gravador usados junto.
