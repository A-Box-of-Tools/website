# Como criar um código QR e provar que ele escaneia

O erro caro do QR não é fazer o código: é descobrir no local que os cartazes escaneiam para um erro de digitação. Gerar e verificar são duas ferramentas aqui, e rodar a segunda antes da tiragem custa um minuto e pega quase tudo que a tiragem teria despachado.

[Abrir Leitor de QR Code e código de barras](https://abox.tools/pt/ler-qr-code/): Aponte a câmera, ou solte aqui uma foto. A leitura acontece aqui, e em nenhum outro lugar.

Última atualização 13 de outubro de 2026

## A resposta curta

1. **Crie.** Abra o [Gerador de QR e código de barras](https://abox.tools/pt/gerar-qr-code/), escolha o trabalho — um link, uma rede Wi-Fi, um cartão de contato — e confira a sequência exata que o código vai carregar, que a página mostra em vez de esconder. Exporte o SVG para impressão, o PNG para telas.
2. **Imprima um.** No tamanho real, no papel real, antes da tiragem de duzentos.
3. **Comprove.** Fotografe a prova impressa com um celular, em ângulo e com a luz do local, e adicione ao [Leitor de QR e códigos de barras](https://abox.tools/pt/ler-qr-code/). Mostra o conteúdo e, em links, o host desse endereço codificado. Se corresponder, teste com os celulares que usarão e confira o destino separadamente.

As duas ferramentas funcionam no navegador sem enviar nada. Em um código Wi-Fi, o processamento não transmite a senha para criar ou ler.

![O gerador de QR com um endereço digitado, mostrando o código pronto e os dados dele: a versão, o nível de correção de erros e quanto espaço ainda sobra.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

O código, feito.

## Confira o destino além da impressão

Para cardápio, inscrição ou manual, cole a URL HTTPS completa, preserve quatro módulos de margem e incorpore o SVG ao layout final. Imprima no tamanho previsto, monte na superfície prevista e escaneie de onde o visitante ficará. Leia o endereço e abra conscientemente no celular para completar a ação: ler o cardápio, chegar ao formulário ou ao manual correto. Uma string correta ainda pode levar a uma página indisponível ou que peça login inesperado.

Cartões de contato exigem outro passo: após ler o código impresso, salve o contato no celular e confira nome, número e e-mail. Em folhas de etiquetas, fotografe cada código separadamente: o leitor encontra um por imagem. Repita o teste ao mudar URL, cores, tamanho ou layout e use vários celulares antes de uma tiragem grande.

## O que a verificação pega de verdade

- **O erro de digitação.** A falha mais comum não é o código: é a URL dentro dele. Ler de volta é a única checagem que testa o que realmente ficou codificado, e não o que você achava que tinha colado.
- **O tamanho e a distância.** Um código escaneado do outro lado de um salão precisa de módulos maiores que um de cartão de visita. Fotografar a prova de onde as pessoas vão estar é o teste honesto; os níveis de correção de erro do gerador dizem em voz alta o que cada um custa em densidade.
- **As cores.** Este leitor lê códigos invertidos, mas isso não prova que todos os celulares façam o mesmo. Comece com módulos escuros sobre fundo claro e teste as cores reais da marca após imprimir.
- **Dobras e reflexos.** Reed–Solomon repara parte dos dados danificados, mas a porcentagem não é uma área garantida que pode cobrir. Os padrões de detecção precisam continuar legíveis. Uma placa exposta ao tempo merece o nível maior e o código um pouco mais denso que isso exige.

![O leitor, que recebeu essa mesma imagem: ele informa o endereço que o código contém, a simbologia e onde na imagem ele o encontrou.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

E a mesma imagem lida de volta por outra ferramenta, o único teste que pega um código que saiu errado. O leitor mostra o que achou, e não abre.

## O mesmo leitor, para códigos que não são seus

Verificar também permite abrir com mais cuidado um QR alheio. O leitor mostra o endereço inteiro e seu host *antes de abrir algo* e aponta o que conferir: usuário antes de @, letras parecidas ou encurtador conhecido. Não segue redirecionamentos nem descobre o destino final de um link curto. Vale conferir um adesivo de parquímetro ou crachá de congresso. Nada é aberto por você nem enviado do que escaneia.

## Se você faz isso toda semana

Criar e conferir moram em duas páginas de propósito: cada uma faz um trabalho, e cada uma consegue provar sozinha que nada sai do seu computador. Mas as duas são código aberto: licença MIT, módulos ES sem dependências — o codificador do gerador e o decodificador Reed-Solomon do leitor, cada um com um README que o explica.

Se códigos saem da sua mesa toda semana, aponte um agente de código para o [repositório](https://github.com/A-Box-of-Tools/website) e peça uma página que gera e já faz o código desenhado passar de volta pelo decodificador: um autoteste a cada exportação. Os módulos foram escritos para serem lidos, e levá-los embora é exatamente para isso que a licença existe.
