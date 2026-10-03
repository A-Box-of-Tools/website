# Cómo censurar un PDF para que el texto desaparezca de verdad

Un rectángulo negro sobre un nombre y un nombre borrado se ven idénticos en pantalla. Uno de los dos sobrevive a que lo seleccionen y lo copien. Aquí está la diferencia, los sitios donde se esconde una palabra que no son la página, y la comprobación de treinta segundos que te dice cuál de los dos tienes.

[Abrir Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Censor de PDF](https://abox.tools/es/censurar-pdf/), suelta el documento, escribe las palabras que tienen que irse, marca las que quieres decir y pulsa «Sacarlas». Las letras se borran de las propias instrucciones de dibujo de la página, las mismas palabras se sacan de los marcadores, los comentarios, los campos de formulario y las propiedades del documento, y el archivo terminado se vuelve a abrir y se busca dentro delante de ti antes de ofrecértelo.

Todo lo que sigue explica por qué esa última frase es la importante, y cómo saber si la herramienta que ya usas puede decir lo mismo.

## De qué fallo va esto

Pinta un rectángulo negro sobre un nombre en un lector de PDF. Lo que ves es un nombre con un rectángulo negro encima. Lo que la mayoría de los lectores *guardan* es un documento que contiene el nombre y, por separado, un rectángulo con una posición, un tamaño y un color.

Un rectángulo pintado así es una **anotación**: un objeto que está junto a la página y no dentro de ella. El texto de debajo está exactamente como estaba. Selecciona la zona y pulsa copiar, o abre el archivo en un programa que dibuje las anotaciones de otra manera, o pásale cualquier extractor de texto, y el nombre vuelve. Nada en la pantalla distingue eso de una censura de verdad, que es precisamente por lo que sigue pasándoles a organizaciones que tienen abogados.

Ha publicado sumarios judiciales, informes de inteligencia, contratos y, en diciembre de 2025, nombres tachados en una publicación masiva de documentos del Departamento de Justicia de EE. UU. que eran legibles a las pocas horas de publicarse. El patrón siempre es el mismo. El rectángulo era la anotación, y la anotación nunca fue el texto.

## Qué hace en su lugar una censura de verdad

Una página de un PDF es una lista de instrucciones: usa esta tipografía, mueve la pluma aquí, dibuja estos glifos. Las palabras de la página existen exactamente en un sitio, como operandos de esas instrucciones de dibujo:

```
BT /F1 12 Tf 72 700 Td (Estimado Sr. Pérez) Tj ET
```

Censurar el nombre significa **borrar esas letras de esa instrucción** y volver a escribir la página. Después de eso no hay nada que recuperar, no porque el archivo lo esconda bien, sino porque las letras no están en el archivo. No hay ningún rectángulo con algo debajo, porque debajo no hay nada.

Hay que devolver una cosa, o el resultado queda visiblemente mal. El texto se dibuja avanzando una pluma por la página, así que borrar cinco letras arrastra el resto de la línea cinco letras hacia la izquierda: las columnas dejan de estar alineadas y los totales se deslizan bajo el encabezado equivocado. Una herramienta que hace esto bien mide cuánto habrían avanzado las letras quitadas y devuelve esa distancia como una instrucción de espaciado, que mueve la pluma sin dibujar nada.

La caja negra, si la hay, se pinta *después*, sobre un hueco que ya está vacío. Es una cortesía hacia quien lea el documento — una señal de que se ha quitado algo — y no la censura. Esa es toda la distinción en una frase: en una censura de verdad la caja es adorno; en una falsa, la caja *es* la censura.

![La tarjeta de búsqueda: dos términos escritos, con el número de coincidencias y una lista de cada sitio en el que aparecen en el documento.](https://abox.tools/screens/redact-a-pdf/find.webp)

Tú dices qué tiene que desaparecer y la herramienta encuentra todas las apariciones, incluidas las de la página tres que nadie recordaba.

## Los cuatro sitios donde se esconde una palabra que no son la página

Esta es la parte que pilla a quien hizo bien la primera. Un PDF lleva texto en varios sitios a la vez, y un lector los enseña, los busca o los copia todos. Quitar un nombre de la página y dejarlo en cualquiera de estos es no haberlo quitado.

- **Las propiedades del documento.** Título, autor y el nombre del archivo del que se exportó este. Un documento al que se le ha quitado un nombre de las páginas y cuyas propiedades siguen diciendo `Acuerdo Pérez borrador 3.docx` no está censurado. Suele haber una segunda copia de la misma información en un paquete XMP, que también tiene que irse.
- **Los marcadores.** El esquema del lateral de un lector es una lista de encabezados con números de página pegados, y un encabezado es una línea de texto que nada de la página controla.
- **Los campos de formulario y los comentarios.** Lo que alguien escribió en un formulario se guarda dos veces: una como valor del campo y otra como la apariencia que dibuja el lector. Las dos tienen que irse. Una nota lleva su texto y el nombre de quien la escribió.
- **El texto de reemplazo.** Un PDF puede declarar que una serie de glifos «deletrea» otra cosa, para que una ligadura o una línea partida se copien como la palabra que representan. Eso significa que un documento puede enseñar una cosa y entregarle otra a quien pulse Ctrl+C, y una censura que solo quitara lo dibujado dejaría la frase intacta para cualquiera que seleccionase el párrafo.

Los adjuntos son el quinto. Un PDF puede llevar dentro archivos enteros, y nada de lo que hagas con las páginas los toca.

![La tarjeta de página: el texto de una página, extraído y seleccionable, con los términos encontrados resaltados.](https://abox.tools/screens/redact-a-pdf/page.webp)

Esta es la parte que sorprende. Un PDF no es una imagen: sus palabras las puede seleccionar, buscar y copiar cualquiera que lo reciba.

## Cómo comprobar un archivo, en treinta segundos

Hazlo con todo lo que estés a punto de mandar, sea cual sea la herramienta que lo produjo. Es la comprobación que habría pillado todos y cada uno de los fallos publicados.

1. **Abre el archivo terminado y pulsa Ctrl+F** (Cmd+F en un Mac). Busca la palabra que quitaste. Una censura de verdad no devuelve nada. Si el lector salta a un rectángulo negro, la palabra sigue ahí dentro y el rectángulo está apoyado encima.
2. **Selecciona la zona tachada y cópiala.** Arrastra sobre el rectángulo, pulsa Ctrl+C y pega en un cuadro de texto. Si llega algo, has encontrado el mismo fallo por el otro lado.
3. **Selecciona el documento entero y copia eso.** Ctrl+A y luego Ctrl+C, pega en cualquier editor de texto y lee lo que sale. Esta es la más útil de las tres, porque te enseña el documento tal y como lo ve un extractor de texto, incluido texto que no sabías que estaba ahí, cosa habitual en una página escaneada.
4. **Mira las propiedades** — Archivo → Propiedades en la mayoría de los lectores — y el panel de marcadores. Los dos son sitios donde un nombre sobrevive a una censura perfecta en la página.

El [Censor de PDF](https://abox.tools/es/censurar-pdf/) hace por ti la primera y la tercera y te enseña la cuenta, porque una herramienta que afirma haber quitado algo no es una prueba y una búsqueda en el archivo terminado sí.

## Los documentos escaneados son otro problema

Un escaneo es la fotografía de una página. Las palabras que hay en ella son píxeles y no texto, y por mucho que edites la capa de texto no las tocas, porque no hay capa de texto, o porque la que hay describe la imagen en vez de ser la imagen.

La mayoría de los escáneres y herramientas de PDF actuales añaden una capa de texto invisible sobre la imagen, escrita por reconocimiento óptico de caracteres, para que la página se pueda buscar. Esa capa es texto de verdad y se puede quitar. Merece la pena quitarla: es lo que habrían encontrado una búsqueda, una copia y cualquier sistema automático que lea documentos. No cambia nada de la imagen, en la que las palabras siguen siendo perfectamente legibles para quien mire la página.

Así que para un escaneo la secuencia honesta es: sacar las palabras de la capa de texto y después ocuparse de la imagen por separado, lo que significa sobrescribir píxeles. Eso es lo que hace el [censor de imágenes](https://abox.tools/es/guias/censurar-una-imagen/), y la guía de al lado explica por qué un desenfoque o un mosaico no bastan para el texto.

## Por qué no imprimirlo y volver a escanearlo

Porque funciona y te cuesta todo lo demás. Imprimir una página censurada y volver a escanearla sí produce un documento sin capa de texto que pueda filtrarse, y un documento que nadie puede buscar, que ningún lector de pantalla puede leer, que es entre cinco y cincuenta veces más grande y cuya calidad es la que le apeteciera al escáner de la oficina. Además da por hecho que la página se imprimió tal y como se veía: una anotación puede estar marcada como «ver en pantalla y no imprimir», y cuando eso es lo que era tu caja negra, la hoja que sale de la impresora lleva el nombre.

El mismo argumento vale para «aplanar a imagen», que algunas herramientas ofrecen como censura. Convierte cada página en una fotografía de sí misma. Si las palabras estaban tapadas en vez de borradas, ahora el tapado es permanente, pero todo lo demás del documento se ha ido con él, y el archivo que mandas es uno con el que nadie puede trabajar.

## Por qué este es el trabajo que menos merece una subida

A un servicio de censura hay que darle el archivo sin censurar. Esa es toda la transacción: la versión privada llega primero, entera, y es la versión que queda en el disco de otra gente. Diga lo que diga la política de privacidad, la secuencia no admite discusión: el documento con el que tenías cuidado es el que entregaste.

Lo que la gente censura lo empeora más de lo que suena. Declaraciones testificales, informes médicos, extractos bancarios que van al casero, un contrato con el nombre de un cliente que va a otro, un escrito con una dirección particular. Esos son los documentos, que es exactamente por lo que la herramienta para ellos no debería tener un servidor al otro lado.

Todo lo del [censor de este sitio](https://abox.tools/es/censurar-pdf/) ocurre en tu propio navegador: el archivo se lee, se edita, se escribe y se comprueba en tu equipo, y las palabras que buscas tampoco salen nunca de la pestaña. Desconéctate de internet y sigue funcionando, que es la prueba más sencilla que hay de que no se manda nada a ninguna parte. Qué implica de verdad una subida está en [¿es seguro subir archivos?](https://abox.tools/es/guias/es-seguro-subir-archivos/)
