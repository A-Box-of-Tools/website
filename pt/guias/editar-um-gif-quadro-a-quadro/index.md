# Como editar um GIF quadro a quadro

Não existe editor de GIF aqui, e não precisa: um separador que desmonta a animação em quadros e um criador que monta uma a partir de quadros são um editor com uma pasta no meio — e a pasta é a parte em que você edita, com o que já usa para imagens.

Última atualização 26 de agosto de 2026

## A resposta curta

1. **Desmonte.** Abra o [Separador de GIF](https://abox.tools/pt/separar-gif-em-quadros/) e solte o GIF. Cada quadro vira o próprio PNG — como aparece na tela, com a transparência mantida — e o ZIP inclui uma lista de tempos: os atrasos por quadro anotados para a reconstrução.
2. **Edite a pasta.** Apague os quadros que devem sair, retoque em qualquer editor de imagens os que devem mudar, renomeie para reordenar. Uma pasta de PNGs é um formato que tudo entende.
3. **Monte de volta.** Solte a pasta no [Criador de GIF](https://abox.tools/pt/criar-gif/), defina os tempos de cada quadro — ou apoie-se na lista — escolha a paleta e exporte.

Os três passos rodam no seu navegador. Nada é enviado em momento nenhum, o que aqui importa mais do que o normal: os GIFs que as pessoas consertam são tantas vezes gravações de tela com algo sensível meio visível dentro.

## O que o separador pode contar antes de editar

O separador mostra, para cada quadro, o atraso, a posição, o tamanho e a regra de descarte — e esse painel merece uma olhada antes de mexer em qualquer coisa, porque explica as duas surpresas da maioria dos GIFs.

Primeira: nem todo quadro é uma imagem inteira. Muitos GIFs guardam só os pixels que mudaram, remendados sobre o quadro anterior; o separador oferece cada quadro *como aparece* ou *como está guardado*, e para editar você quase sempre quer *como aparece*, para cada PNG se sustentar sozinho. Segunda: os atrasos são por quadro, não um número só. A pausa no desfecho é um atraso real num quadro real, e a lista de tempos é o que o carrega pela ida e volta.

Para os cortes comuns, o passo da pasta é até opcional: ficar com um quadro a cada dois ou a cada cinco, ou marcar os que quer, já vem dentro do separador — e cortar os quadros pela metade é o emagrecimento mais eficaz que um GIF pode receber.

![O separador mostrando doze quadros numerados de uma animação, cada um com o tempo em que fica na tela.](https://abox.tools/screens/edit-a-gif-frame-by-frame/apart.webp)

Cada quadro, numerado, com o próprio atraso. Essa é a metade que diz o que você está editando antes de editar.

## O que a reconstrução custa, com honestidade

Um GIF guarda no máximo 256 cores, escolhidas quando é construído. A reconstrução quantiza os quadros de novo — uma paleta compartilhada, ou as melhores cores por quadro — e em material fotográfico essa segunda quantização pode aparecer. Em gravações de tela e desenhos, a carga habitual, não aparece: eles nunca usaram 256 cores.

As outras alavancas do criador são as do [guia de orçamento de GIF](https://abox.tools/pt/guias/gif-de-um-trecho-de-video/): menos cores, o pontilhado de Floyd-Steinberg para degradês, e o comportamento do loop — para sempre, uma vez, ou um número.

Para ver se a cirurgia funcionou — e onde os bytes moram de verdade — solte o resultado no [Analisador de GIF](https://abox.tools/pt/analisar-gif/): ele traça quadros contra bytes, e o quadro pesado costuma ser uma repintura completa que alguém podia ter recortado.

O criador oferece a viagem ele mesmo: depois da exportação, uma linha sob o botão de download leva o GIF recém-feito direto para o analisador, já carregado.

![O criador de GIF com seis quadros em ordem, cada um com um campo de atraso, e uma linha para ajustar todos os atrasos de uma vez.](https://abox.tools/screens/edit-a-gif-frame-by-frame/together.webp)

E a volta. Os atrasos precisam ser recolocados na mão, e essa é a parte da ida e volta que convém saber antes.

## Se você faz isso toda semana

Separar, pasta, reconstruir: os passos moram em páginas separadas porque cada uma faz um trabalho, e cada uma consegue provar sozinha que nada sai da sua máquina. Mas é tudo código aberto: licença MIT, uma pasta por ferramenta, módulos ES sem dependências cujos READMEs explicam o decodificador, as regras de descarte e o quantizador.

Se cirurgia de GIF é tarefa recorrente, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça para dobrar a tabela de quadros do separador e o codificador do criador numa página em que apagar um quadro seja um clique. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
