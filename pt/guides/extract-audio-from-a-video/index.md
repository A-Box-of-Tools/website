# Como extrair o som de um vídeo

Escolha um vídeo e salve sua faixa decodificada como WAV no navegador. A saída contém só áudio; tamanho e precisão dependem da profundidade e dos canais.

[Abrir Extrair o áudio de um vídeo](https://abox.tools/pt/extrair-audio-de-video/): Arraste um vídeo e leve o som embora. A imagem nunca é decodificada, e nada é enviado.

Última atualização 13 de outubro de 2026

## Escolha o vídeo e ouça o resultado

Abra o extrator e escolha ou arraste o vídeo. O navegador decodifica o áudio e cria um WAV automaticamente. Ouça o resultado antes de baixar. Um vídeo sem som não tem faixa para extrair; um codec que o navegador não decodifique precisa de outro decodificador.

A conversão acontece no seu dispositivo, sem upload para decodificar. Vídeos grandes ainda precisam de memória para entrada, amostras decodificadas e saída; processamento local não torna a memória ilimitada.

![Profundidade WAV e opções de canais ao lado do player do áudio extraído.](https://abox.tools/screens/extract-audio-from-a-video/output.webp)

O player usa o WAV oferecido para baixar. Mudar profundidade ou canais cria outro resultado.

## Uma palestra para ouvir ou uma faixa para editar

Para ouvir uma aula, apresentação ou entrevista longe da tela, comece preservando os canais e o PCM de 16 bits padrão. Ouça o início e o final; leve o WAV ao [cortador de áudio](https://abox.tools/pt/cortar-audio/) se só um trecho importar. WAV pode ser muito maior que a faixa comprimida: confira o que o aplicativo de reprodução aceita antes de transferir.

Para editar uma narração ou podcast, escolha Float32 sem mudar os canais e preserve esse WAV como cópia de trabalho. A extração obtém a faixa já misturada: não separa voz e música, não remove ruído nem transcreve. Experimente mono após ouvir os dois canais; economiza espaço em fala, mas dois microfones podem carregar vozes diferentes ou se cancelar parcialmente ao calcular a média.

## Escolha 16 bits ou Float32

PCM de 16 bits é a opção padrão para ampla compatibilidade. A escrita arredonda e limita as amostras decodificadas. Float32 mantém seus valores quando os canais não mudam, inclusive valores acima da escala completa, e serve para continuar editando. Não restaura detalhes já perdidos por compressão.

WAV guarda áudio sem compressão e pode ser muito maior que a faixa comprimida do vídeo. O extrator não produz MP3 porque não inclui um codificador MP3. Outra aplicação com codificador local pode criar MP3 sem enviar o arquivo.

## Mantenha os canais ou misture para mono

Mantenha os canais de origem para preservar sua separação. Mono calcula a média em um canal: pode diminuir o arquivo, mas remove a posição estéreo e pode cancelar sons quando os canais se opõem. Ouça depois de alterar essa opção.

A ferramenta lê a taxa de amostragem original quando o cabeçalho a expõe e decodifica nessa taxa. Quando precisa assumir uma taxa, os dados de saída dizem qual. Confira se o tempo ou a taxa importar para a próxima aplicação.

## Salve, cancele ou tente de novo

Mudar profundidade ou canais substitui automaticamente o resultado anterior. Baixe a versão que ouviu. Cancelar retira o trabalho atual; uma decodificação em andamento pode terminar internamente, mas seu resultado atrasado não substitui uma escolha mais nova. Se a escrita falhar, use Criar WAV novamente com a fonte atual.

Para encurtar a faixa, continue no [cortador de áudio](https://abox.tools/pt/cortar-audio/). Para fades, ganho ou inversão, use o [editor de áudio](https://abox.tools/pt/editar-audio/).
