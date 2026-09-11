# Como criar um código QR e provar que ele escaneia

O erro caro do QR não é fazer o código: é descobrir no local que os cartazes escaneiam para um erro de digitação. Gerar e verificar são duas ferramentas aqui, e rodar a segunda antes da tiragem custa um minuto e pega quase tudo que a tiragem teria despachado.

[Abrir Leitor de QR Code e código de barras](https://abox.tools/pt/ler-qr-code/): Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.

Última atualização 26 de agosto de 2026

## A resposta curta

1. **Crie.** Abra o [Gerador de QR e código de barras](https://abox.tools/pt/gerar-qr-code/), escolha o trabalho — um link, uma rede Wi-Fi, um cartão de contato — e confira a sequência exata que o código vai carregar, que a página mostra em vez de esconder. Exporte o SVG para impressão, o PNG para telas.
2. **Imprima um.** No tamanho real, no papel real, antes da tiragem de duzentos.
3. **Prove.** Fotografe a prova com um celular — de lado, na luz do lugar — e solte a foto no [Leitor de QR e código de barras](https://abox.tools/pt/ler-qr-code/). Ele mostra a carga decodificada e, para um link, o host que ele alcança de verdade. Se isso bate com o que você queria, a tiragem está segura.

As duas ferramentas rodam no seu navegador e não mandam nada para lugar nenhum — o que, para um código de Wi-Fi, significa que a senha dentro dele nunca foi digitada no site de ninguém.

![O gerador de QR com um endereço digitado, mostrando o código pronto e os dados dele: a versão, o nível de correção de erros e quanto espaço ainda sobra.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

O código, feito.

## O que a verificação pega de verdade

- **O erro de digitação.** A falha mais comum não é o código: é a URL dentro dele. Ler de volta é a única checagem que testa o que realmente ficou codificado, e não o que você achava que tinha colado.
- **O tamanho e a distância.** Um código escaneado do outro lado de um salão precisa de módulos maiores que um de cartão de visita. Fotografar a prova de onde as pessoas vão estar é o teste honesto; os níveis de correção de erro do gerador dizem em voz alta o que cada um custa em densidade.
- **As cores.** Códigos impressos em claro sobre escuro escaneiam; paletas de marca com pouco contraste, muitas vezes não. O leitor aguenta mais que a maioria dos celulares: se *ele* sofre com a foto, o celular mais velho do saguão não tem chance nenhuma.
- **A dobra e o reflexo.** A correção Reed-Solomon faz um código meio coberto ainda ler — até o nível que você escolheu. Um cartaz destinado ao tempo merece o nível mais alto e o código um pouco mais denso que ele custa.

![O leitor, que recebeu essa mesma imagem: ele informa o endereço que o código contém, a simbologia e onde na imagem ele o encontrou.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

E a mesma imagem lida de volta por outra ferramenta, o único teste que pega um código que saiu errado. O leitor mostra o que achou, e não abre.

## O mesmo leitor, para códigos que não são seus

Verificar é também o jeito seguro de abrir o QR que outra pessoa imprimiu. O leitor mostra o endereço inteiro e o host que ele alcança de verdade *antes de qualquer coisa abrir*, e nomeia os truques que disfarçam um link: um nome de usuário antes do @, um alfabeto sósia, um redirecionamento. O adesivo no parquímetro merece essa inspeção; o crachá do congresso também. Nada é aberto por você, e nada do que você escaneia é enviado a lugar nenhum.

## Se você faz isso toda semana

Criar e conferir moram em duas páginas de propósito: cada uma faz um trabalho, e cada uma consegue provar sozinha que nada sai da sua máquina. Mas as duas são código aberto: licença MIT, módulos ES sem dependências — o codificador do gerador e o decodificador Reed-Solomon do leitor, cada um com um README que o explica.

Se códigos saem da sua mesa toda semana, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça uma página que gera e já faz o código desenhado passar de volta pelo decodificador: um autoteste a cada exportação. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
