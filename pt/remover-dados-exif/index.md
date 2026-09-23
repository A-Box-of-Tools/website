# Remover dados EXIF — ver e apagar metadados de fotos

Veja o que uma foto conta sobre você. Depois tire isso.

> Veja os dados EXIF e de GPS escondidos numa foto, edite, ou apague tudo num clique. Roda no seu navegador, não envia nada, e a foto nunca é recodificada.

Esta página é uma ferramenta interativa que funciona inteiramente no seu navegador, em https://abox.tools/pt/remover-dados-exif/ — nada do que você entrega a ela é enviado para lugar algum. O que segue é tudo o que a página diz sobre a ferramenta em palavras; para usá-la, abra o endereço.

## **Nada sai daqui**, nem fotos. Não existe servidor.

O arquivo é aberto, interpretado e reescrito pelo seu próprio navegador. Esta ferramenta não tem função de rede de espécie alguma: não há o que buscar nem o que mandar. E do outro lado desta página não existe servidor nenhum para onde mandar uma foto, mesmo que houvesse caminho.

- ✗ Sem envio
- ✗ Sem conta
- ✓ Funciona offline
- ✓ Código aberto
- ✓ Nunca recodifica a imagem

## Como remover os dados EXIF de uma foto

1. **Escolha suas fotos.** Arraste até o seletor, ou escolha na mão. Quem lê tudo direto do seu disco é o navegador, e nada é mandado para lugar nenhum enquanto você faz isso.
2. **Leia o que tem nelas, se quiser.** A lista de achados nomeia as coisas que vale saber, como a posição de GPS, os horários e os números de série, antes da tabela completa com todas as etiquetas.
3. **Clique em “Remover todos os metadados”.** Esse é o trabalho inteiro para a maioria das pessoas. Todas as etiquetas, os blocos XMP e IPTC, os comentários e a miniatura embutida vão embora, em todas as fotos da lista de uma vez.
4. **Ou edite em vez de remover.** Mude uma data, corrija uma linha de direitos autorais, jogue fora a localização e mantenha os ajustes da câmera. Depois salve aquela foto sozinha.

## A versão longa

[O que uma foto conta sobre você, e como tirar isso](https://abox.tools/pt/guias/remover-dados-exif-e-gps/): Uma foto tirada no celular normalmente carrega o ponto exato onde foi feita, a hora com precisão de segundo e o número de série da câmera. O que tem lá dentro, quem consegue ler, e como tirar sem encostar na imagem.

## Também na caixa

- [Visualizador DICOM](https://abox.tools/pt/visualizador-dicom/): Tomografia, ressonância, raio X e ultrassom, com a janela, o cabeçalho e as medidas.
- [Imagem para ICO](https://abox.tools/pt/criar-favicon/): Uma imagem entra. Sai todo tamanho que um navegador, o Windows ou um Mac pede.
- [Imagem para data URI](https://abox.tools/pt/imagem-para-base64/): A imagem inteira como uma linha de texto. Cole direto no CSS ou no HTML.
- [SVG para imagem](https://abox.tools/pt/svg-para-png/): Diga o tamanho. Um vetor não tem tamanho próprio a perder.

## Perguntas

### Minha foto é enviada para algum lugar?

Não. Quem lê, interpreta e reescreve o arquivo é o seu próprio navegador, no seu próprio hardware. Esta ferramenta não tem função de rede de espécie alguma: nunca busca nada e nunca manda nada. E a `Content-Security-Policy` da página lista todos os endereços que ela pode acessar, nenhum dos quais é deste site.

### O que é EXIF, e o que mais está escondido numa foto?

EXIF é um bloco de etiquetas que a câmera escreve ao lado da imagem: a marca e o modelo, os ajustes de exposição, a data e a hora com precisão de segundo, muitas vezes uma posição de GPS e às vezes um número de série. As fotos costumam carregar mais coisas além disso: um pacote XMP de XML vindo de um editor, um bloco IPTC com campos de legenda e assinatura, um perfil de cor, uma segunda cópia pequena da imagem como miniatura, e uma maker note com dados não documentados do fabricante. Esta ferramenta lista tudo isso.

### Remover os metadados reduz a qualidade da imagem?

Não, e esse é o motivo principal para usar uma ferramenta assim em vez de salvar a foto de novo. Os metadados ficam no contêiner em volta da imagem comprimida, e não dentro dela. Removê-los é apagar itens de uma lista e escrever a lista de volta, enquanto os dados de imagem comprimida são copiados byte por byte. O resultado decodifica exatamente para os mesmos pixels. Nada é decodificado e nada é recomprimido.

### Quais formatos de arquivo ele trata?

JPEG, PNG e WebP. HEIC e AVIF são reconhecidos, mas não reescritos: são formatos de caixas montados a partir de átomos aninhados e precisam de outro interpretador, então a ferramenta avisa isso em vez de produzir um arquivo quebrado. Um TIFF puro também fica de fora, porque num TIFF os metadados e os pixels são endereçados pelos mesmos deslocamentos.

### Minha foto vai aparecer girada depois que os metadados forem removidos?

Pode acontecer, e existe um ajuste para isso. Os celulares normalmente gravam a imagem do jeito que o sensor viu e acrescentam uma etiqueta de Orientação dizendo como virar. Remova essa etiqueta e alguns visualizadores mostram a foto deitada. A opção de “manter a etiqueta de orientação”, que já vem ligada, escreve de volta um pequeníssimo bloco EXIF contendo só essa etiqueta, e só quando a foto realmente precisava. Desligue se você preferir que o arquivo não carregue EXIF nenhum.

### Ele remove a localização de GPS?

Remove. Remover tudo tira o diretório de GPS inteiro, e dá para apagar só a localização e manter o resto. A posição aparece primeiro em graus decimais, porque “51 graus, 30 minutos, 26 segundos” não deixa evidente que a foto está entregando o prédio em que foi tirada.

### Posso mudar uma etiqueta em vez de apagá-la?

Pode. Etiquetas de texto, datas, o ISO, a orientação e a resolução podem todas ser editadas, e algumas etiquetas comuns podem ser acrescentadas a uma foto que não tem nenhuma. Uma ressalva: escrever o arquivo reconstrói o bloco EXIF, e uma maker note contém deslocamentos que apontam para dentro do bloco original, então uma maker note reconstruída pode deixar de ser legível pelo próprio software do fabricante. Se isso importa para você, apague a maker note ou deixe o arquivo sem editar.

### É grátis, e preciso de conta?

É grátis, e não tem conta, nem login, nem período de teste. O site exibe publicidade, e é ela que paga a conta. Os anúncios não recebem nada sobre as suas fotos.

### Funciona offline?

Funciona. Carregue a página uma vez, depois desligue a internet e ela continua funcionando. Esse é também o jeito mais simples de provar que nada está sendo enviado: uma ferramenta que mandasse as suas fotos embora para serem processadas pararia no instante em que você tirasse da tomada.

## Como dá para conferir a promessa de privacidade

- **Suas fotos não têm para onde ir.** A Content-Security-Policy lista todos os endereços que esta página pode acessar, e nenhum deles é deste site. Não existe aqui um endpoint onde seus arquivos pudessem ser recolhidos, e não existe no código nada que os mandaria mesmo que existisse.
- **Nada aqui vai buscar coisa alguma.** Ao contrário das outras ferramentas desta caixa, esta não tem função de “carregar de um endereço da web” nem nenhuma etapa de rede opcional. Não existe `fetch`, nem `XMLHttpRequest`, nem `sendBeacon` em lugar nenhum de `src/`.
- **Os metadados que lemos não são contados a ninguém.** A sua posição de GPS aparece nesta página e não vai a mais lugar nenhum. Não existe neste repositório nenhum evento de análise personalizado que carregue uma etiqueta, um nome de arquivo, um tamanho ou uma contagem.
- **O que o Google carrega, e o que não chega até ele.** Os scripts de publicidade e de medição vêm do Google. Nenhum dos dois recebe coisa alguma sobre as suas fotos. Toda linha que lê, interpreta ou reescreve um arquivo é servida desta origem e está listada no repositório.
- **O que o botão de doação carrega, e o que não chega até ele.** O botão “Buy me a coffee” do cabeçalho é desenhado por um script vindo de cdnjs.buymeacoffee.com e busca as letras dele no Google Fonts. É um link e nada mais: não informa visita nenhuma, e não recebe nada sobre você nem sobre os seus arquivos. Nada acontece a menos que você clique, e o lugar para onde ele leva é o site de outra empresa.
- **Funciona offline.** Desligue a rede e a ferramenta continua igualzinha, porque nunca houve uma etapa de rede nela. Essa é a prova mais simples de todas.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy, `src/tiff.js` para o interpretador de EXIF, e `src/jpeg.js` para a prova de que a imagem em si nunca é mais que copiada.
