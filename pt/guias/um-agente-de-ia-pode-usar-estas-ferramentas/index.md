# Um agente de IA pode usar estas ferramentas?

Agentes usam a interface do navegador. Para avaliar os dados, confira onde ele roda, o que o agente envia e quais funções usam rede.

Última atualização 23 de outubro de 2026

## A resposta curta

Um agente que controla o navegador pode usar essas páginas comuns: controles identificados, escolha de arquivos e downloads, sem conta no site. O ambiente deve suportar acesso a arquivos, APIs e permissões. Permissão de câmera ou painel de compartilhar podem precisar da sua participação.

Para processar arquivos, a primeira pergunta é **onde o navegador controlado roda**. Confira também o que o serviço do agente recebe e se a função busca ou compartilha dados deliberadamente. Um navegador local não responde às três perguntas.

## Dê ao agente uma tarefa que ele possa conferir

**Preparar anexos de uma inscrição.** Informe ao agente as dimensões, o formato aceito e o máximo de bytes de cada arquivo. Peça que preserve os originais e entregue cópias prontas separadas. Por exemplo: “Transforme estas três fotos em JPEGs com menos de 200 KB cada; mostre as dimensões, os tamanhos reais e prévias legíveis antes de eu enviá-las”. Um download bem-sucedido não comprova que o formulário aceitará o arquivo.

**Preparar a documentação de despesas.** Um agente pode seguir o [fluxo de recibos](https://abox.tools/pt/guias/extrair-recibos-e-faturas/), mas é preciso conferir estabelecimento, data, moeda, total e recorte com cada imagem. Peça que prepare o relatório e os anexos para sua revisão. Escolher um destinatário ou enviá-los é uma ação separada.

A abordagem também serve para uma tarefa mensal: reutilize o resultado esperado e as verificações das instruções com os novos arquivos. Confirme onde o navegador do agente está sendo executado e como trata os dados sempre que o ambiente mudar.

## Dois tipos de agente, uma distinção

Agentes que usam ferramentas vêm em duas formas, e a diferença entre elas pesa mais do que todo o resto desta página.

**Um navegador controlado localmente** lê e processa no dispositivo. A ferramenta local não acrescenta envio para processamento. O agente ainda pode enviar instruções, capturas ou contexto ao provedor conforme sua implementação e configurações.

**Um navegador na nuvem** roda no computador do provedor. Um arquivo anexado para uso ali já saiu do seu dispositivo. Estas ferramentas o processam naquele navegador e não desfazem a transferência anterior. Compartilhar e entregar a apps são ações adicionais nos dois ambientes.

Especifique um navegador local quando quiser manter o processamento no dispositivo, confira o agente e autorize transferências deliberadas separadamente. [Câmbio e entrega ao email](https://abox.tools/pt/extrair-recibos-faturas/), [importação por URL](https://abox.tools/pt/imagens-para-video/), [compartilhar](https://abox.tools/pt/compartilhar-texto/) e [câmera](https://abox.tools/pt/remote-camera/) documentam os limites de rede.

## Como entregar uma tarefa a um agente

Agentes rendem melhor com o mesmo briefing que um colega pediria: a ferramenta, o arquivo e a cara que o trabalho pronto tem. Alguns padrões que funcionam:

- **Nomeie o resultado, não só a ferramenta.** “Abra abox.tools/comprimir-imagem/ e deixe esta foto abaixo de 200 KB” dá ao agente o número que a página vai pedir. O [compressor de imagens](https://abox.tools/pt/comprimir-imagem/) aceita um tamanho-alvo pelo nome — exatamente o tipo de instrução que um agente carrega com fidelidade.
- **Mostre o mapa a ele.** Este site publica o [llms.txt](https://abox.tools/llms.txt), que descreve cada ferramenta e inclui um link para um índice separado de guias. Os dois índices estão em texto simples, então um agente pode escolher uma ferramenta ou um guia sem precisar rastrear o site. E cada página de ferramenta ou guia tem um gêmeo no seu próprio endereço com `index.md` no fim: a página em Markdown, sem a interface em volta, para um agente que quer o que a página de uma ferramenta diz, e não a aparência dela.
- **Deixe-o ler a página em que está.** Cada ferramenta carrega suas perguntas e respostas na própria página, e cada ferramenta tem um guia a um link de distância. A um agente que pareça em dúvida com um ajuste dá para dizer que leia o guia primeiro — o mesmo conselho que uma pessoa receberia.
- **Defina verificações entre etapas.** Em digitalização para PDF ou limpeza de imagens, peça ordem, recorte, texto legível e tamanho. OCR, ocultação e decidir o que compartilhar precisam de julgamento e revisão do resultado.

## O que não delegar

Operar controles é parte da tarefa. Revise decisões que mudam o que outra pessoa pode ver ou receber. Dois exemplos:

**Decidir o que não pode ser visto.** As ferramentas de tarja apagam o que você cobre — mas escolher o que cobrir é o trabalho, e um agente que deixa passar uma linha produziu um arquivo que parece pronto e não está. Deixe um agente operar a tarja se quiser; olhe você mesmo o resultado antes de ele ir a qualquer lugar, a mesma regra que os guias dessas ferramentas dão a um operador humano.

**Abrir o que foi lido.** O leitor de QR deste site nunca segue automaticamente um endereço decodificado: ler e visitar são atos diferentes. Vale exigir o mesmo de um agente: ao ler um código, link ou endereço em um arquivo, ele deve informar, não visitar. Um agente que controla seu navegador também tem acesso às sessões abertas nele. É motivo para examiná-lo como qualquer ferramenta, conforme a próxima seção.

## Um agente também pode conferir a promessa

As quatro verificações que o guia sobre [enviar arquivos](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/) ensina — puxar o cabo, olhar a aba Rede, ler a Content-Security-Policy, ler o código — um agente consegue executar todas, e elas são até mais fáceis para ele do que para uma pessoa: ler um cabeçalho CSP ou procurar chamadas a `fetch` no código servido é trabalho mecânico. Se você usa um agente para examinar ferramentas antes de confiar nelas, este site espera ser examinado do mesmo jeito — e o comportamento offline em que essas verificações se apoiam tem [uma página própria](https://abox.tools/pt/guias/como-uma-pagina-web-funciona-offline/).

Controles são identificados; [llms.txt](https://abox.tools/llms.txt) e cópias Markdown ajudam a leitura. Código, módulos compartilhados e motores são públicos. A compilação gera e minifica páginas; compare com a publicação para auditar. DevTools e diagnóstico WebRTC dependem do ambiente do agente.

O guia não garante a privacidade do provedor do agente. Instruções, capturas e às vezes arquivos podem ser enviados mesmo com navegador local. Considere esses caminhos e as funções de rede na tarefa; a localização do navegador não os prova.
