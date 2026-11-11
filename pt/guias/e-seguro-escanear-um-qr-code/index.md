# É seguro escanear um QR code?

A leitura em si, sim. Um QR code é um pedaço de texto, e apontar a câmera para ele não faz nada além de ler esse texto. Tudo o que pode dar errado acontece um toque depois, quando algo abre o que foi lido — e esse toque está nas suas mãos não dar.

Última atualização 13 de outubro de 2026

## A resposta curta

Escanear é seguro. Um QR code é um pedaço curto de texto desenhado em quadradinhos, e apontar a câmera para ele faz exatamente uma coisa: lê esse texto de volta. A leitura não consegue instalar nada, não consegue visitar nada e não consegue mexer em nada no seu telefone, pela mesma razão que olhar para um endereço escrito não leva você até lá.

O perigo começa um passo depois, quando algo *abre* o que foi lido — e todo o truque de cada golpe com QR code está em fazer esse passo acontecer antes de você ver aonde está indo. O texto dentro do código é um endereço que ninguém consegue ler a olho nu, e a maioria dos telefones responde a ele com um único toque apressado. Mantenha a leitura e a abertura separadas, e o golpe fica sem nada com que trabalhar.

## Um cardápio, um pedido de pagamento ou uma etiqueta de equipamento

**Para um cardápio ou placa pública,** use o [leitor](https://abox.tools/pt/ler-qr-code/) e confira todo o texto decodificado antes de abrir algo. Para pagar ou entrar em uma conta, verifique o endereço no aplicativo oficial ou outro canal conhecido. O domínio mostrado por este leitor pertence à URL codificada; ele não o consulta para descobrir o destino final de um redirecionamento.

**Para uma etiqueta de equipamento que você cria,** baixe o código final, leia e compare o endereço com o manual previsto. Depois teste uma foto da etiqueta impressa, com tamanho, margem e iluminação reais. Isso confere a legibilidade da etiqueta, não a disponibilidade futura do manual.

Ler primeiro também ajuda com códigos em capturas recebidas por e-mail. Trate o conteúdo decodificado como algo a inspecionar, mesmo se a imagem vier de alguém conhecido.

## O que um QR code realmente é

Debaixo dos quadradinhos não há nada além de uma sequência de caracteres: alguns milhares no máximo, geralmente bem menos. Um endereço web, o nome e a senha de uma rede Wi-Fi, um cartão de contato, uma linha de texto. O formato foi projetado em 1994 para rastrear peças de carro numa fábrica da Toyota, e não contém instrução de espécie alguma. Um QR code não pode “conter um vírus” mais do que uma placa de rua pode.

O que ele pode conter é um texto que *pede* algo ao seu telefone: abrir este endereço, entrar nesta rede, salvar este contato. Cada uma dessas coisas é um pedido, não uma ordem. O código propõe; quem o escaneou decide. Um leitor que mostra o texto e espera é totalmente seguro. Um leitor que age sozinho sobre o texto entregou a decisão a quem imprimiu o código — e essa é toda a diferença entre um escaneamento seguro e um perigoso.

Uma nota de rodapé, por honestidade: o programa que decodifica pode ter defeitos, como qualquer programa que interpreta uma entrada, e já houve defeitos assim em leitores ao longo dos anos. Mas esse risco pertence ao leitor, não ao código, e não é nele que os golpes se apoiam. Eles se apoiam no toque.

## O truque do adesivo

O golpe que ficou comum o bastante para ganhar nome — quishing — é de uma simplicidade quase constrangedora: imprimir um código próprio, colar por cima de um verdadeiro e esperar. No parquímetro, onde o falso leva a uma página de pagamento parecida com a da prefeitura. Na mesa do restaurante, por cima do cardápio. No aviso de entrega deixado na porta, ao lado das palavras “não encontramos você”.

Repare no que o faz funcionar. Não é sofisticação técnica — não há nenhuma. É que um QR code é o único tipo de endereço que uma pessoa não consegue ler antes de seguir. Um endereço torto escrito em letras se entrega a qualquer um que olhe; o mesmo endereço desenhado em quadradinhos fica exatamente igual a um honesto. Quando você consegue ver aonde o código ia, já está lá, numa página construída para parecer a que você esperava, pedindo o número do seu cartão.

A defesa não é parar de escanear. É olhar o endereço *entre* o escaneamento e a visita, o que custa uns dois segundos e desmonta o truque por completo.

## Três maneiras de um endereço mentir

Dois segundos de olhar bastam, mas só se você souber o que olhar. Há três formas de aparência honesta que um endereço torto assume, e as três valem a pena conhecer de vista.

### 1. O nome antes do @

Um endereço web pode carregar um nome de usuário, escrito antes de um `@`: tudo até o `@` é decoração, e o destino de verdade começa depois. `seubanco.com.br@evil.example` não vai ao seu banco. Vai a `evil.example`, levando “seubanco.com.br” como um nome de login sem significado nenhum. O olho lê o começo de um endereço; o navegador lê o fim.

### 2. Letras que não são as letras que parecem

Os alfabetos se sobrepõem. Um `а` cirílico é desenhado exatamente como um `a` latino, e um endereço escrito com um é outro endereço, que na tela parece idêntico. O truque tem nome — ataque homógrafo — e é por isso que um destino pode ser cópia letra por letra do que você confia e ainda assim ficar em outro lugar.

### 3. A primeira parada honesta

O endereço no código pode ser genuinamente respeitável — um encurtador de links, um redirecionamento de marketing, o rastreio de cliques de um buscador — e apenas *encaminhar* você para um lugar que não é. O primeiro endereço passa no exame; o destino é decidido por um servidor quando você já partiu. Um endereço encurtado num código impresso não prova nada de errado, mas significa que o endereço que você consegue conferir não é o endereço em que vai chegar.

## Como escanear um sem risco

A regra cabe numa frase: **ler primeiro, abrir depois, e nunca deixar um único gesto fazer as duas coisas.** Na prática:

- Use um leitor que mostre o texto decodificado e pare aí. A maioria das câmeras de telefone mostra o destino numa faixinha antes de abrir: leia a faixinha em vez de tocá-la por reflexo, e leia o *fim* do endereço, não o começo.
- Desconfie mais onde o risco é maior e a superfície é pública: qualquer coisa que termine num pagamento, qualquer coisa que viva ao ar livre. O código de um parquímetro merece mais reflexão do que o da etiqueta de um museu.
- Um código que leva direto a uma página de login ou de dados de cartão é a hora de parar e digitar o endereço que você já conhece. A versão legítima daquela página nunca está a mais do que algumas teclas de distância.
- Códigos de Wi-Fi e cartões de contato merecem a mesma pausa: um pede ao telefone para lembrar uma rede, o outro para guardar uma pessoa. As duas coisas são aceitáveis quando aceitas de propósito, e nenhuma das duas deveria acontecer em silêncio.

## Como o leitor daqui se comporta

O [leitor de QR e códigos de barras](https://abox.tools/pt/ler-qr-code/) deste site segue a regra desta página: **nunca visita automaticamente um endereço decodificado.** Mostra o texto completo e o host da URL em uma linha separada. Sinaliza endereços suspeitos; não resolve redirecionamentos nem certifica o destino. Abrir o link exige outro botão, depois da leitura, ou nunca.

A leitura em si acontece no seu próprio computador. A imagem que você escaneia é decodificada no navegador e não é enviada a lugar nenhum; assim, um código do qual você desconfia pode ser examinado sem que ninguém — este site incluído — saiba o que ele dizia; a página continua funcionando com o Wi-Fi desligado, que é o jeito mais fácil de conferir essa afirmação. E uma carga abertamente hostil, como um endereço `javascript:` que executaria código em quem o abre, fica sem link nenhum e é chamada pelo nome.

A outra metade também existe: um [gerador de QR code](https://abox.tools/pt/gerar-qr-code/) que desenha os códigos no seu próprio computador, e um guia companheiro sobre [criar um código e provar que ele escaneia](https://abox.tools/pt/guias/criar-um-codigo-qr-e-provar-que-escaneia/) antes de mandar para a gráfica. E se atrás da sua pergunta estava a mais ampla — o que entregar qualquer coisa a um site realmente faz —, essa tem [uma página própria](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/).
