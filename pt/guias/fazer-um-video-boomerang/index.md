# Como fazer um vídeo boomerang

Um boomerang é um clipe que vai para a frente, depois para trás, e repete. Nenhuma ferramenta aqui tem botão de boomerang; ele nasce de três que fazem cada uma o seu trabalho — cortar, inverter, juntar — e a sequência inteira roda no seu próprio computador.

Última atualização 13 de outubro de 2026

## A resposta curta

1. **Corte o momento.** Abra o [Cortador de vídeo](https://abox.tools/pt/aparar-video/), marque o segundo ou dois que irão e voltarão, escolha o método indicado e exporte um clipe separado. Copiar pode preservar quadros iniciais ocultos; um corte exato ainda pode carregar ajustes de áudio. Para um loop silencioso, omita som neste clipe intermediário. Se o reversor rejeitar a linha do tempo, aplique os ajustes em uma nova exportação local antes de continuar.
2. **Inverta uma cópia.** Solte esse clipe no [Inversor de vídeo](https://abox.tools/pt/inverter-video/), deixe o som de fora e exporte. Agora você tem o mesmo momento duas vezes, uma em cada sentido.
3. **Junte as duas.** De volta ao Cortador de vídeo, solte os dois arquivos, marque cada um inteiro, coloque a versão para a frente primeiro e exporte um arquivo só.

Nenhum salto precisa de download no meio: depois de cada exportação, uma linha sob o botão de download oferece levar o resultado direto para a ferramenta seguinte — o reversor depois do primeiro corte, o cortador de novo depois da reversão — e o arquivo chega já carregado.

Esse arquivo é o boomerang. Poste como está em qualquer lugar onde vídeo mudo roda em loop, ou passe pelo conversor de [Vídeo para GIF](https://abox.tools/pt/video-para-gif/) se o destino só anima GIF. Cada passo acontece no seu navegador; nada dessa sequência é enviado, em ponto nenhum, para ninguém.

## Escolha um movimento que funcione na volta

Um salto ou respingo são comuns. Um produto girando, uma gaveta abrindo ou uma mão colocando algo tornam o mesmo loop útil em uma demonstração. Escolha um movimento claro em uma tomada estável, com o assunto visível nos dois sentidos. Uma panorâmica ou alguém saindo do quadro costumam causar um solavanco incômodo na volta.

Silencie as duas metades se quiser um loop sem som: desative no primeiro corte e na reversão. Depois de juntar, confira a virada e a volta ao início e teste se o destino repete o MP4. A repetição da prévia não insere essa instrução no arquivo. Se precisar de outro formato, recorte o enquadramento do clipe curto para frente antes de revertê-lo.

## Por que cortar primeiro

Reverter exige decodificar e recodificar todos os quadros; o [guia de reversão](https://abox.tools/pt/guias/inverter-um-video/) explica por quê. Cortar custa pouco quando é possível copiar; cortes exatos recodificam a imagem. O [guia de corte](https://abox.tools/pt/guias/aparar-um-video/) explica a escolha.

Então a ordem é o truque todo. Inverta um clipe de dois segundos e o passo caro trabalha em dois segundos; inverta o original e ele trabalha em tudo, sendo que a maior parte você vai jogar fora. Numa gravação de celular de qualquer duração, cortar primeiro é a diferença entre um boomerang em menos de um minuto e uma barra de progresso para encarar.

Corte apertado. Um boomerang se lê melhor quando balança sobre um único movimento — um pulo, um respingo, uma virada — e cada quadro mantido é pago duas vezes, uma por sentido.

![O aparador de vídeo com um trecho marcado entre três e cinco vírgula seis segundos, e uma tabela com início, fim e duração.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Um ou dois segundos é tudo o que um boomerang é. Cortar primeiro é o que mantém a inversão barata, e é na tabela que a duração se decide.

## O que fazer com o som

Remova som das duas metades: o cortador e o reversor oferecem essa opção. Remover só ao reverter deixa som na metade para frente. Em um bumerangue tocaria primeiro normal e depois ao contrário; soa estranho e quase sempre é reproduzido sem som. Omitir áudio também acelera a reversão e reduz os dois arquivos.

Se mesmo assim você mantiver, o cortador junta os dois clipes do mesmo jeito; mas a costura que o olho perdoa, o ouvido não perdoa.

## A junção, e o que o cortador vai dizer

Os dois arquivos juntados são parentes próximos — um foi feito do outro — mas passaram por codificadores diferentes e não precisam combinar byte a byte no formato. O cortador confere. Onde os dois combinam, ele copia os quadros direto; onde não, recodifica uma vez e avisa no painel de exportação, em vez de deixar você adivinhando.

Ordene as partes antes de exportar: ida primeiro, volta depois. Um boomerang que começa pela volta se lê como um engano.

Um refinamento útil: marque a metade revertida a partir do segundo quadro antes de juntar e escolha o método exato se esse início não for um quadro-chave. O último quadro normal e o primeiro revertido são iguais; mostrá-lo duas vezes segura a virada por um instante.

![A ferramenta de inversão: um resumo com o tamanho de saída, a duração e o número de quadros, e uma chave para manter o som.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

A segunda metade. A chave do som importa aqui mais do que em qualquer outro lugar, pelo motivo que a seção de cima dá.

## Vídeo ou GIF no final

Fique com o MP4 se o destino toca vídeo: é muito menor, muito mais nítido, e repete igualzinho. Converta para GIF só quando o lugar exigir um, e aí fique de olho no medidor: um GIF paga cada quadro, e um boomerang é o clipe dele em dobro. O [guia do GIF parcial](https://abox.tools/pt/guias/gif-de-um-trecho-de-video/) cobre as alavancas de largura e quadros que o mantêm abaixo de um limite de tamanho.

## Se você faz isso toda semana

Três páginas para um efeito é de propósito: cada ferramenta faz um trabalho, e cada página consegue provar sozinha que o seu material nunca sai do computador. Mas as três são código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências em `src/`, com READMEs que os explicam.

Se boomerang é parte regular do seu trabalho, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para dobrar a caminhada de quadros do inversor e a junção do cortador numa página de um botão só. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
