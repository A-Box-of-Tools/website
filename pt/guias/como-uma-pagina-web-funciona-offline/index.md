# Como uma página web consegue funcionar sem o Wi-Fi?

Um service worker pode manter uma cópia local. Concluir desconectado é evidência de processamento local, não garantia de todos os caminhos futuros. Veja o cache e o que verificar.

Última atualização 13 de outubro de 2026

## A resposta curta

Um service worker pode guardar recursos da página no dispositivo e responder depois a partir dessa cópia. O site guarda página, scripts e motores locais de cada ferramenta. O cache precisa terminar; navegadores podem recusá-lo ou removê-lo e atualizações podem precisar de conexão. Confira antes o indicador offline.

Um cache pronto permite uma operação local sem conexão. Demonstra onde aquela operação ocorreu, não garante todas as funções nem o que pode ser enviado depois. Service worker é mecanismo de cache, não fronteira de privacidade por si só.

## Prepare-se para um voo ou uma conexão instável

**Antes de viajar,** abra as ferramentas exatas, espere cada indicador offline dizer que está pronto e desconecte para testar com um arquivo local de exemplo. Para um [fluxo de digitalização para PDF](https://abox.tools/pt/guias/digitalizar-varias-paginas-em-um-pdf/), carregue o scanner e o criador de PDF: visitar um não armazena o outro. Mantenha os arquivos no aparelho e salve cada resultado.

**Para recibos com conexão fraca,** armazene antes o [extrator de recibos](https://abox.tools/pt/guias/extrair-recibos-e-faturas/) e seus recursos de OCR. Reconhecimento, revisão, taxas manuais e downloads funcionam localmente. Consultar câmbio online e enviar depois o e-mail precisam de suas próprias conexões.

Confira novamente após limpar o armazenamento, mudar de navegador ou passar muito tempo sem usar. Um atalho instalado é conveniente, mas não garante que o navegador preserve todos os recursos nem que seus arquivos de trabalho estejam salvos.

## O que sobreviver ao puxão de cabo demonstra

A verificação mais forte do guia de envios é [puxar o cabo](https://abox.tools/pt/guias/e-seguro-enviar-arquivos/): carregar a ferramenta, desconectar e usar. Vale ser preciso sobre por que isso funciona. Uma ferramenta que converte o seu arquivo num servidor precisa da rede no exato momento em que trabalha — corte o fio e o trabalho para. Uma ferramenta que continua demonstrou, não afirmou, que o trabalho acontece no seu computador; e uma página que não alcança a rede não consegue mandar o seu arquivo a lugar nenhum, deseje o que desejar o código dela.

Ferramentas locais indicam se a cópia offline está pronta e se há conexão. Teste a operação com um arquivo do dispositivo. Importar imagens, consultar câmbio, compartilhar e apresentar câmeras têm etapas de rede explicadas junto aos controles.

## Como a cópia se mantém honesta

Duas perguntas decidem se o guardado-para-sempre é presente ou armadilha, e o maquinário responde às duas:

- **A cópia envelhece?** O worker procura uma versão mais nova quando há conexão e a troca inteira. Versões vão inteiras porque a cópia precisa ser sempre coerente: metade velha, metade nova é o único estado que jamais deve ser servido.
- **O que exatamente foi copiado?** Tudo de que a página precisa e nada além — e cada ferramenta daqui guarda a própria cópia no próprio compartimento. O cache de uma ferramenta contém aquela ferramenta; instalar uma não instala dez em silêncio. A cópia também é inspecionável: as ferramentas de desenvolvedor do seu navegador listam cada arquivo em cache, e a lista é a mesma que a página buscou às claras.

O resultado é uma página que se comporta como um aplicativo que você instalou só por visitá-la — o que, aliás, está literalmente em oferta: a barra de endereço do navegador instala qualquer ferramenta daqui como aplicativo, com o ícone próprio da ferramenta, abrindo direto na ferramenta, sem botão na página e sem script pedindo. O mesmo maquinário, vestido de atalho.

## O que o offline não prova

A verificação é forte, não mágica, e os limites dela merecem a mesma clareza que a força:

- **Prova a operação enquanto desconectado.** Uma página poderia guardar dados para enviar depois. Fechar a aba não apaga armazenamento persistente. Confira código, armazenamento e solicitações após reconectar para verificar o caminho completo.
- **Aplica-se a uma função, não ao site inteiro.** [Compartilhar](https://abox.tools/pt/compartilhar-texto/) e [Câmera remota](https://abox.tools/pt/remote-camera/) precisam do servidor público de encontro, inclusive em modo de rede local. [URLs de imagens](https://abox.tools/pt/imagens-para-video/) e [câmbio online opcional](https://abox.tools/pt/extrair-recibos-faturas/) precisam de seus servidores; partes locais funcionam desconectadas.
- **Não esconde você.** Carregar a página já contou ao site o seu endereço, como todo carregamento de página na web. O offline trata de para onde vão os seus arquivos, não de anonimato.

Combine sucesso offline com inspeção de solicitações, política e código. Uma operação concluída desconectada não precisou de processamento em servidor naquele momento. Falhar não explica sozinho a conexão necessária, e nenhum resultado substitui verificar os limites documentados.
