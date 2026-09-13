# Censurar PDF — las palabras salen, no se tapan

Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.

> Saca palabras de un PDF en vez de pintar un rectángulo negro encima. Las letras se borran de las propias instrucciones de dibujo de la página, el archivo terminado se vuelve a abrir y se busca dentro para demostrar que ya no están, y no se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/censurar-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El documento que elijas se abre, se lee, se edita y se vuelve a escribir en memoria en este equipo, con código servido desde esta dirección. Aquí nada puede subir nada, y al otro lado de esta página no hay ningún servidor que lo reciba. Ni el archivo ni las palabras que has buscado salen de la pestaña.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu equipo

## Cómo censurar un PDF para que las palabras desaparezcan de verdad

1. **Elige el PDF.** Un documento cada vez, y a propósito: censurar es un trabajo que hay que mirar página a página, y una herramienta que te dejara marcar palabras en un archivo y las aplicara sin avisar a otro es exactamente la forma en que se manda lo que no se debía. El navegador lo lee directamente de tu disco.
2. **Di qué tiene que irse.** Escribe las palabras — un nombre, una dirección, una referencia — y cada sitio donde aparecen se enumera con la línea en la que está y una casilla para marcarlo. Los buscadores de al lado buscan direcciones de correo, números de tarjeta, IBAN, números de la seguridad social y números de teléfono. Se ofrecen, y nunca se marcan por ti: un patrón no distingue un número de teléfono de un número de expediente.
3. **Lee la página y ve eligiendo palabras.** El panel enseña el texto del documento tal y como está guardado, en el orden en que lo copiaría un lector. Pulsa cualquier palabra para sacarla y vuelve a pulsarla para conservarla. Todo lo tachado es lo que va a desaparecer, y eso convierte este paso en la revisión además de en la selección: merece la pena hacerlo en cada página antes de pulsar el botón.
4. **Sácalas y lee la línea que dice que se ha comprobado.** Las letras se borran, el hueco que dejan se mantiene abierto, se pinta una caja negra encima si la has pedido, y las mismas palabras se sacan de los marcadores, los comentarios, los campos de formulario y las propiedades del documento. Después el archivo terminado se vuelve a abrir aquí y se busca dentro. Si una palabra que has quitado sigue encontrándose, no hay descarga y sí un mensaje que lo dice.

## La versión larga

[Cómo censurar un PDF para que el texto desaparezca de verdad](https://abox.tools/es/guias/censurar-un-pdf/): Una caja negra pintada en un lector de PDF suele dejar debajo las palabras, y copiar y pegar las recupera al instante. Qué quita una censura de verdad, los cuatro sitios donde se esconde una palabra fuera de la página, y cómo comprobar un archivo antes de mandarlo.

## También en la caja

- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.
- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.
- [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.
- [Cortador de audio](https://abox.tools/es/cortar-audio/): Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.

## Preguntas

### ¿En qué se diferencia de pintar una caja negra en un lector de PDF?

Un rectángulo pintado en un lector es una anotación: un objeto con una posición, guardado junto a la página. El texto de debajo está intacto. Cualquiera que seleccione esa zona y pulse copiar, o abra el archivo en otro programa, o le pase cualquier extractor de texto, recupera las palabras. Algunos lectores tienen una orden de «censurar» que sí aplica el borrado como es debido, y varios ofrecen solo el dibujo. Esta herramienta no tiene ningún rectángulo que apartar: las letras se recortan de las instrucciones de dibujo de la página, y la caja negra, si la dejas activada, se pinta después sobre un hueco que ya está vacío.

### ¿Cómo sé que las palabras han desaparecido de verdad?

Porque la herramienta lo comprueba, en tu equipo, y te enseña la cuenta. Cuando el archivo está escrito, lo vuelve a abrir el mismo lector de esta página, se lee cada página, se recogen todos los marcadores, comentarios, campos de formulario y propiedades, y se busca cada palabra que has quitado. La línea de resultados dice cuántas había y cuántas quedan. Si la respuesta no es la que debería, la pasada falla y no se ofrece nada para descargar. También puedes comprobarlo tú después en cualquier lector: pulsa Ctrl+F y busca la palabra.

### ¿Se mueve el resto de la página cuando se quita una palabra?

No. El texto se dibuja avanzando una pluma por la página, así que borrar cinco letras arrastraría normalmente el resto de la línea cinco letras hacia la izquierda. La anchura exacta de lo quitado se mide con las propias métricas de la tipografía y se devuelve como una instrucción de espaciado, que mueve la pluma sin dibujar nada. Las columnas siguen alineadas y los totales siguen bajo su encabezado.

### ¿Puede censurar un documento escaneado?

La imagen no, y lo dice en vez de fingir. Un escaneo es la fotografía de una página: las palabras son píxeles y no hay texto que quitar. Lo que un escaneo sí suele llevar es una capa de texto invisible que el OCR del escáner escribió sobre la imagen para que la página se pueda buscar; esta herramienta encuentra esa capa, quita de ella lo que elijas y te dice en la página que la imagen no ha cambiado. Así que una búsqueda y una copia dejan de encontrar la palabra, y quien mire la página la sigue leyendo. Para una imagen, el [censor de imágenes](https://abox.tools/es/censurar-imagen/) sobrescribe los píxeles.

### ¿Y las partes de un documento que no están en una página?

Se tratan, porque ahí es donde una censura suele escaparse. Las mismas palabras se sacan de los marcadores, los comentarios y las notas, de lo que se haya escrito en los campos de formulario, del texto que se le entrega a un lector de pantalla y del texto de reemplazo que un lector copia *en lugar de* las letras de la página. Este último existe para que las ligaduras y las palabras partidas se copien bien, y puede contener una frase entera. Las propiedades del documento y el paquete XMP se eliminan directamente. Los adjuntos y todo lo que se ejecute al abrir el archivo se descartan, porque en ninguno de los dos se puede buscar las palabras que estás quitando.

### ¿Se suben mis documentos a alguna parte?

No. El archivo lo lee, edita y escribe tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Lo que escribes en el cuadro de búsqueda se compara con texto que está en la memoria de esta pestaña y tampoco va a ninguna parte.

### ¿Por qué no puedo arrastrar una caja sobre la página como en otras herramientas?

Porque dibujar una página significa un motor de PDF completo — tipografías, degradados, transparencia, modos de fusión —, que es un megabyte o más de motor que descargar y ejecutar, y este sitio no lleva ninguno. Resulta que eso encaja con el trabajo: arrastrar un rectángulo selecciona un *trozo de papel*, y un trozo de papel no es lo mismo que el texto que hay debajo, que es justo por donde empieza el fallo de la caja negra. Lo que obtienes en su lugar es el texto del documento, en orden de lectura, con cada palabra pulsable. Y es además la única vista que puede decirte lo que una imagen de la página no puede: si las palabras que tienes delante son texto siquiera.

### ¿El archivo terminado se abrirá en todas partes?

Sí. La salida se escribe como PDF 1.5, o como la versión más alta que necesitara el archivo que le diste, y la 1.5 la entiende cualquier lector publicado desde 2003. Nada de la página se vuelve a codificar: las tipografías, las imágenes y el dibujo vectorial pasan byte a byte, así que lo que quede del texto sigue siendo seleccionable y buscable igual que antes.

### ¿Puede abrir un PDF protegido con contraseña?

No, y es a propósito. Un documento cifrado se rechaza con un mensaje que lo dice, incluso cuando la contraseña está en blanco, que es como guardan muchos escáneres y fotocopiadoras. Quitarle la protección a un archivo es otro trabajo distinto de sacarle palabras, y una herramienta que lo hiciera en silencio estaría haciendo algo que no le has pedido.

### ¿Hay límite de tamaño y cuesta algo?

No hay ningún límite escrito en la herramienta. El límite es tu propio equipo: el documento se sostiene en memoria mientras se trabaja con él, así que un portátil aguantará unos cientos de megabytes sin quejarse y empezará a sufrir en algún punto por encima. Es gratis, no hay cuenta, ni registro, ni prueba. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus documentos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Es además la forma más sencilla de comprobar que no se sube nada: una herramienta que mandara tu documento fuera para censurarlo se pararía en el momento en que tiraras del cable.

## Cómo se comprueba la promesa de privacidad

- **Un rectángulo negro no es una censura, y esto no pinta ninguno encima de nada.** En casi todos los programas que ofrecen censurar una página — un lector de PDF, un procesador de textos, una herramienta de diseño — el rectángulo es un objeto guardado junto al texto y no dentro de él. El texto sigue ahí, en el mismo archivo, en el mismo sitio, y seleccionar la zona y pulsar copiar te lo devuelve. Ese fallo ha publicado sumarios judiciales, informes de inteligencia y, en diciembre de 2025, nombres tachados en una publicación masiva de documentos del Departamento de Justicia de EE. UU. que eran legibles en cuestión de horas. Esta herramienta borra las letras de las instrucciones que dibujan la página. No hay ningún rectángulo con algo debajo, porque debajo no hay nada.
- **El archivo terminado se vuelve a abrir y se busca dentro, aquí, antes de ofrecértelo.** Hasta que eso pasa, todo lo de arriba es esta herramienta corrigiéndose sus propios deberes. Así que los bytes que están a punto de ser tu descarga se le entregan al mismo lector como si los hubiera mandado un desconocido, cada página se lee otra vez, se recogen todos los marcadores, comentarios, campos de formulario y propiedades del documento, y se buscan las palabras que has quitado. La cuenta aparece en los resultados. Si algo ha sobrevivido, la pasada se da por fallida y no hay descarga.
- **Las palabras no salen nunca de la pestaña, y la búsqueda tampoco.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna es nuestra. Esta herramienta no añade nada a esa lista: no tiene función de red propia, ni siquiera opcional. Lo que escribes en el cuadro de búsqueda es una cadena que se compara con texto que está en la memoria de esta pestaña, y ninguna de las dos cosas tiene adónde ir.
- **Censurar es el trabajo que peor sobrevive a una subida.** Lo que la gente censura es el motivo por el que no debe subirse. Una declaración testifical, un informe médico, un extracto bancario que va al casero, un contrato con el nombre de un cliente que va a otro. Entregarle eso al servidor de un desconocido para que quite la parte privada significa que la parte privada llega primero, entera, y esa es la versión que ellos se quedan. Esta página no tiene otra mitad.
- **Lo que queda se copia intacto.** Los únicos bytes que cambian en una página son las instrucciones de texto de las que formaban parte las letras quitadas. Cualquier otra instrucción, y cada tipografía, imagen y línea a las que se refiera la página, se copian exactamente como llegaron: nada se vuelve a dibujar, ni a codificar, ni a recomponer. La anchura de lo quitado se mide y se devuelve como una instrucción de espaciado, para que el resto de la línea se quede donde el documento lo puso.
- **No puede sacar palabras de una fotografía, y dice qué páginas son esas.** Una página escaneada es una imagen. Las palabras que hay en ella son píxeles y no texto, y aquí nada puede tocarlas. Si el escaneo lleva la capa invisible de búsqueda que produce el OCR de un escáner, esta herramienta quita esa capa — que es lo que habrían encontrado una búsqueda y una copia — y dice claramente en la página que la imagen sigue enseñando las palabras. Tapar esa imagen es otro trabajo; el [censor de imágenes](https://abox.tools/es/censurar-imagen/) es la herramienta que sobrescribe píxeles.
- **El documento deja de decir de dónde viene.** Las propiedades y el paquete XMP se van en cada pasada: sin línea de productor, sin fecha de creación, sin autor, sin título y sin ninguno de los bloques privados que deja detrás un programa de maquetación. Un archivo al que se le ha quitado un nombre de las páginas y cuyas propiedades siguen diciendo `Acuerdo Pérez borrador 3.docx` no está censurado, y eso no es algo que convenga dejar en manos de una casilla.
- **Los archivos cifrados se rechazan en vez de abrirse.** Un PDF con contraseña se rechaza, incluidos los que producen los escáneres con contraseña vacía y que técnicamente se abrirían. Quitarle la protección a un documento es otro trabajo distinto de sacarle palabras, y hacerlo sin avisar sería una cosa sorprendente para que una herramienta la hiciera en tu nombre.
- **Qué carga Google y qué no se le entrega.** Los scripts de publicidad y de medición vienen de Google. A ninguno de los dos se le entrega nada de tu documento: ni un archivo, ni una página, ni un nombre, ni un tamaño, ni un número de páginas, ni una palabra que hayas buscado. Todas las líneas que leen, editan o escriben un PDF se sirven desde este origen y están en el repositorio.
- **Qué carga el botón de donación y qué no se le entrega.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma su tipografía de Google Fonts. Es un enlace y nada más: no informa de ninguna visita y no se le entrega nada sobre ti ni sobre tus documentos. No pasa nada hasta que lo pulsas, y entonces estás en el sitio de otra gente.
- **Funciona sin conexión.** Desconéctate de la red y todo en esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tu documento fuera para censurarlo se pararía.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/pdf-text.js` para cómo se encuentra y se sitúa cada palabra de una página, y `src/edit.js` para el borrado en sí: qué se recorta de las instrucciones de la página y qué se pone en su lugar para que el resto de la línea no se mueva. Ninguno de los dos llega a la red, y el lector y el escritor de al lado tampoco.
