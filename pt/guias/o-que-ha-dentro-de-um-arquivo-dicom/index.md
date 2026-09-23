# O que há dentro de um arquivo DICOM?

Mais do que o exame. Um arquivo DICOM é um prontuário médico com uma imagem dentro: seu nome, sua data de nascimento e seu número de hospital viajam no mesmo arquivo que os pixels — e isso importa mais no exato momento em que alguém põe um CD na sua mão e você sai procurando um visualizador.

Última atualização 26 de agosto de 2026

## A resposta curta

Um arquivo DICOM — o `.dcm` do CD que o hospital entrega — não é um formato de imagem como o JPEG. É um formato de prontuário médico com uma imagem dentro. Antes de os pixels começarem, o arquivo carrega um cabeçalho com centenas de etiquetas, e entre elas, rotineiramente: o nome completo do paciente, data de nascimento, sexo e número de hospital; a data, a hora e a descrição do estudo; o médico solicitante; a instituição e o aparelho, até o número de série; e um conjunto de identificadores únicos que servem de chaves de volta ao arquivo que os produziu.

Nada disso aparece quando a imagem está na tela, e é exatamente assim que se esquece. O exame é o prontuário. Trate o arquivo como o documento que ele é, não como a imagem que ele contém.

## Por que este arquivo é enviado com tanta naturalidade

A armadilha na prática: depois de um exame, o paciente recebe um disco ou um download, tenta abrir, e nada na máquina aceita — DICOM não é um formato que o software comum fale. Então ele procura “abrir arquivo dcm online”, e quase tudo o que encontra é uma caixa de envio. Instantes depois, um prontuário médico completo e identificado — nome, data de nascimento, números de hospital, descrições de estudo com cara de diagnóstico e tudo — está no servidor de quem quer que tenha rankeado bem naquele dia.

Repare no formato: é o problema do documento de identidade de novo — um arquivo sensível, um momento de atrito, um buscador — mas com um arquivo sensível em segundo grau. Um passaporte vaza quem você é; um exame vaza quem você é *e o que estava sendo investigado*. O argumento geral sobre envios tem [página própria](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/); este é o arquivo para o qual aquele argumento dispensa tempero.

Abrir o arquivo em local é a cura inteira, e é para isso que serve o [visualizador DICOM](https://abox.tools/pt/visualizador-dicom/) daqui: o exame, um controle de janela de verdade, uma pasta reempilhada na série, medições em milímetros e cada etiqueta do cabeçalho legível — sem que nada saia da sua máquina. O passo a passo está no [guia para abri-lo](https://abox.tools/pt/guias/abrir-um-arquivo-dicom/).

## “Tirei o nome” não é desidentificar

O erro seguinte é mais fino e mais bem-intencionado: compartilhar um exame — com um serviço de segunda opinião, um pesquisador, um fórum — depois de apagar a etiqueta óbvia. O próprio padrão é direto sobre o quanto isso é pouco. O perfil de desidentificação do DICOM lista as etiquetas que precisam ser tratadas antes que um conjunto de dados possa se chamar desidentificado, e ele corre às *centenas* de entradas, porque a identidade mora em mais lugares que o campo do nome:

- **Identificadores diretos além do nome** — data de nascimento, ID do paciente, número do atendimento, os nomes do médico e da instituição.
- **Chaves** — os identificadores únicos carimbados em cada arquivo: não dizem quem você é, mas dizem exatamente *qual prontuário você é* para qualquer sistema que já viu o original.
- **Quase-identificadores** — data e hora do estudo, modelo e série do aparelho, região do corpo, idade do paciente: vagos um a um, estreitos juntos.
- **Os próprios pixels** — o ultrassom e algumas outras modalidades queimam o nome do paciente direto na imagem, onde edição de etiqueta nenhuma alcança. (Para uma imagem exportada, isso é trabalho de [tarja no nível do pixel](https://abox.tools/pt/tarjar-imagem/), não de ferramenta de metadados.)

Por isso o visualizador daqui tem um painel que lista exatamente o que, no seu arquivo, identifica o paciente, e com que grau de diretude — construído da lista do próprio padrão. E por isso o visualizador apenas *lê*: não contém código que escreva um arquivo DICOM, porque “anonimizado” é uma promessa com uma régua bem mais alta do que a que um visualizador alcança — e uma ferramenta que a cumprisse pela metade seria pior do que uma que nunca a faz.

## Tratando um exame como o prontuário que ele é

Os hábitos caem sozinhos de tudo o que veio acima:

- **Olhe em local.** Um visualizador que funciona com o Wi-Fi desligado — este funciona — provou onde o trabalho acontece. O visualizador que vem no próprio disco, se rodar na sua máquina, também serve.
- **Compartilhe por canais médicos quando o conteúdo é o que importa.** Mandar um estudo para outro hospital é problema resolvido, com infraestrutura responsável por trás; um e-mail pessoal com um `.zip` de arquivos `.dcm` é uma cópia do seu prontuário em servidores de e-mail, por tempo indeterminado.
- **Se precisar compartilhar um arquivo, saiba antes o que há nele.** Leia o cabeçalho e o painel de identidade, para que o que você repassar seja uma decisão e não uma surpresa — e trate a desidentificação bem-feita como um serviço que o seu centro de imagem lhe deve mediante pedido, não como uma caixinha que você improvisa.
- **Lembre que o disco sobrevive ao recado.** A cópia na pasta de downloads e o CD na gaveta também são prontuários completos, iguais ao escaneamento de documento que ninguém lembra de ter apagado.

Nada disso diz para nunca compartilhar um exame — segundas opiniões são a razão de ser das cópias. Diz: o arquivo é um documento sobre você, então as duas perguntas a que este grupo inteiro de guias vive chegando valem aqui também — a quem ele está sendo entregue, e se essa entrega precisava sequer acontecer.
