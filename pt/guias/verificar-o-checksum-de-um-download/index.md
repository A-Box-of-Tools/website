# Como conferir um download com o checksum dele

A linha de hexadecimal embaixo de um link de download está ali para você poder provar que o arquivo chegou inteiro. Comparar leva cerca de um minuto. Saber quanto essa comparação vale — e qual hábito a torna inútil — leva o resto desta página.

[Abrir Hash e checksum](https://abox.tools/pt/verificar-checksum/): Confira um download contra o número que quem publicou divulgou, sem mandar o arquivo para ninguém.

Última atualização 26 de agosto de 2026

## A resposta curta

Abra o [Hash e checksum](https://abox.tools/pt/verificar-checksum/), arraste para lá o arquivo que você baixou e cole na caixa de baixo o checksum da página de download. A página deduz pelo comprimento qual algoritmo é aquele número e responde com uma frase.

Se bater, os bytes no seu disco são os que quem publicou mediu. Se não bater, baixe o arquivo de novo antes de abrir. Todo o resto é o que essa frase deixa de fora.

## O que é o número embaixo do link de download

A saída de uma função de hash: uma conta que lê cada byte de um arquivo e produz uma resposta curta, de tamanho fixo. O mesmo arquivo dá sempre a mesma resposta, e um arquivo que difere por um único bit dá uma resposta completamente diferente. Não uma quase igual: uma sem relação nenhuma. Tudo se apoia nessa propriedade.

Como a resposta é curta e o arquivo não, a conta joga informação fora, e existem por força muitos arquivos que compartilham qualquer resposta dada. Achar um de propósito é a parte difícil, e o quanto isso é difícil é o que separa os algoritmos abaixo uns dos outros.

Um checksum não tem nada de secreto e não dá para reverter. É uma impressão digital, divulgada para que duas pessoas possam concordar que estão com a mesma coisa na mão.

## Qual algoritmo você tem na frente

Você não escolhe: quem publicou já escolheu, e o seu trabalho é calcular o mesmo. Dá para saber só pelo comprimento:

- **32 caracteres hexadecimais** — MD5.
- **40** — SHA-1.
- **64** — SHA-256, e é este que você vai ver mais.
- **96** — SHA-384.
- **128** — SHA-512.

Não existem dois do mesmo tamanho, e é por isso que a ferramenta consegue identificar um valor colado sem que ninguém diga qual é. Uma sequência de 63 caracteres não é o checksum de nada: é um SHA-256 que perdeu um caractere no caminho para a área de transferência.

![O cartão de resultados: as somas MD5, SHA-1, SHA-256 e SHA-512 de um arquivo, cada uma com um botão de copiar.](https://abox.tools/screens/verify-a-file-checksum/digests.webp)

Todas de uma vez, porque qual usar é decidido por quem publicou o arquivo, e não por você.

## No seu próprio computador, sem navegador

Todo sistema operacional já vem com algo que faz isso, e vale conhecer o comando mesmo que você use uma página para a tarefa. Para a pergunta "como sei que o site de vocês calculou honestamente" não existe resposta melhor do que passar o mesmo arquivo pela ferramenta que veio com o seu computador.

**Windows**, no PowerShell:

```
Get-FileHash .\disk.iso -Algorithm SHA256
```

Máquinas mais antigas têm no lugar `certutil -hashfile disk.iso SHA256`, que imprime em maiúsculas e com espaços. Maiúscula e minúscula nunca importam numa comparação de checksum: essas letras são dígitos, não palavras.

**macOS**:

```
shasum -a 256 disk.iso
```

**Linux**:

```
sha256sum disk.iso
```

Os três imprimem a mesma sequência para o mesmo arquivo, e este site também. São especificações exatas com vetores de teste publicados; não sobra espaço para uma implementação ter opinião.

## Comparar sem ficar vesgo

Não leia sessenta e quatro caracteres em duas telas e decida que eles parecem iguais. As pessoas conferem os quatro primeiros e os quatro últimos e param, e essa é exatamente a comparação que um atacante trataria de passar. É também o jeito como um engano de boa-fé escapa.

Cole os dois em algo que compare por você. Na linha de comando é para isso que serve a opção `-c`:

```
sha256sum -c SHA256SUMS
```

No navegador é a caixa de comparação do [Hash e checksum](https://abox.tools/pt/verificar-checksum/), que aceita o valor na forma em que quem publicou escreveu: hexadecimal puro, uma linha de `sha256sum`, um arquivo `SHA256SUMS` inteiro, a forma `SHA256 (disk.iso) = …`, ou um `integrity="sha384-…"` tirado de uma tag de script. E responde sim ou não em uma frase.

![O cartão de comparação: uma soma de verificação colada numa caixa e um veredito dizendo que ela bate com o arquivo.](https://abox.tools/screens/verify-a-file-checksum/compare.webp)

Cole o que a página de download dizia e deixe a ferramenta comparar. Ler sessenta e quatro caracteres numa tela é o passo que isso vem tirar.

## O que exatamente uma coincidência prova

Que os bytes no seu disco são os que alguém tinha na frente quando anotou aquele número. É algo genuinamente útil de saber e é mais estreito do que a maioria supõe, então vale listar o que cobre e o que não cobre.

**Uma coincidência descarta:**

- um download que parou cedo demais e deixou um arquivo com cara de completo;
- corrupção no caminho, num disco que está morrendo, ou por um cabo USB ruim;
- o arquivo errado: a versão ARM em vez da x86, ou o lançamento do mês passado;
- um espelho que entrega calado outra coisa diferente do que anuncia.

**Uma coincidência não descarta:**

- **que o arquivo seja malicioso.** Quem publica consegue medir um malware com a mesma exatidão de qualquer outra coisa. Um checksum diz "isto é o que eles distribuíram", nunca "isto é seguro";
- **que quem publica tenha sido invadido.** Quem trocou o arquivo no servidor trocou o checksum logo abaixo no mesmo minuto. O que nos leva à próxima seção.

## O erro que deixa a operação inteira sem sentido

Pegar o checksum na mesma página, pela mesma conexão, que o arquivo.

Pense contra o que você está se defendendo. Se a preocupação é um download estragado, o checksum pode vir de qualquer lugar e a conferência funciona. Se a preocupação é alguém ter adulterado o arquivo, então quem conseguiu trocar o arquivo conseguiu trocar a linha de hexadecimal impressa embaixo, porque os dois vieram do mesmo servidor pela mesma conexão. Você estaria pedindo ao falsificador para confirmar a assinatura.

Um checksum vale mais quando chega até você por um caminho que o arquivo não fez:

- um arquivo `SHA256SUMS` com assinatura GPG separada, conferida contra uma chave que você já tinha. É o que as distribuições publicam e é a resposta de verdade;
- o anúncio de lançamento numa lista de e-mail, ou uma tag num repositório de código, em vez da página de download;
- um segundo espelho em outro domínio, e os dois comparados entre si;
- um gerenciador de pacotes, que faz isso por você contra chaves que vieram com o sistema operacional.

Nada disso torna inútil conferir um checksum publicado na mesma página. Ele pega o download quebrado, que é a falha que de fato acontece com as pessoas. Só não se convença de que ele pegou mais do que isso.

## MD5 e SHA-1 estão quebrados. Use assim mesmo, às vezes

Os dois estão quebrados no sentido mais forte que importa aqui: *colisões* podem ser construídas de propósito. Dois arquivos diferentes com o mesmo MD5 são fabricáveis em hardware comum desde 2004, e em 2017 uma equipe produziu dois PDFs diferentes com o mesmo SHA-1. Em 2020 a versão de prefixo escolhido desse ataque caiu para algumas dezenas de milhares de dólares de computação alugada.

Na prática isso significa que um MD5 que bate não te diz mais que ninguém mexeu no arquivo, porque quem quisesse poderia ter construído outro arquivo com o mesmo número. Ele continua te dizendo que o download não foi cortado nem corrompido, porque um acidente aleatório não vai cair numa colisão: essa é uma probabilidade que acidente nenhum jamais teve.

Então, se quem publicou imprimiu só um MD5, confira. Vale mais do que não conferir. E se quem publica é você, imprima um SHA-256.

## Não bateu. E agora?

1. **Baixe de novo**, do mesmo lugar. Uma transferência interrompida ou retomada é de longe a causa mais comum, e a segunda cópia costuma resolver.
2. **Confira se é a linha certa.** Páginas de lançamento listam vários arquivos: o checksum do instalador nunca vai bater com o do compactado, nem o de ARM com o de x86.
3. **Confira a versão.** Página de checksum salva nos favoritos fica desatualizada no dia em que sai uma correção de versão.
4. **Tente outro espelho** e compare entre si os checksums dos dois arquivos. Dois espelhos que concordam entre si e discordam do número divulgado são um problema diferente de um espelho que discorda dos dois.
5. **Enquanto isso, não abra.** Um arquivo que falha no checksum está, na melhor das hipóteses, danificado, e na pior não é o arquivo que você pediu.

## Por que fazer isso num navegador

Porque a linha de comando não é onde a maioria das pessoas está, e porque a alternativa óbvia, um site que pede para você enviar o arquivo, é uma coisa estranha de se fazer com um instalador de que você já desconfia. Mandar um arquivo para algum lugar para descobrir se ele foi adulterado no caminho acrescenta exatamente mais um lugar onde ele pode ser adulterado.

O [Hash e checksum](https://abox.tools/pt/verificar-checksum/) lê o arquivo em pedaços de quatro megabytes no seu próprio computador, então não há envio, não há limite de tamanho e não há nada em que confiar além da própria página, que você pode ler e que continua funcionando com a rede desligada. Se você prefere confiar no seu sistema operacional, rode o comando da seção acima e compare as duas respostas. Elas vão coincidir.
