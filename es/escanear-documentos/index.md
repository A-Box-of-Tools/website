# Escáner de documentos — una foto de una hoja, enderezada

Fotografía la hoja. Te devuelve algo que parece escaneado.

> Convierte la foto de una hoja hecha con el teléfono en un PDF enderezado y con luz uniforme. Las esquinas se buscan solas, la perspectiva se deshace y la sombra se divide. Funciona entero en el navegador: no se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/escanear-documentos/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El navegador decodifica la foto, la endereza, la limpia y la escribe en un PDF, sin más que aritmética y los códecs que ya trae. Esta herramienta no tiene ninguna función de red, ni para pedir ni para enviar, y aquí eso importa por lo que la gente fotografía: un pasaporte, una nómina, un contrato de alquiler, un formulario que una oficina pidió «escaneado».

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo escanear un documento con la cámara del teléfono

1. **Fotografía la hoja.** Desde arriba, con la hoja entera en el encuadre y las cuatro esquinas visibles o casi. No hace falta que sea perpendicular ni que la luz sea uniforme: el ángulo y la sombra son para lo que existe esta herramienta. Lo que sí importa es llenar el encuadre; una hoja fotografiada desde el otro lado de la habitación no tiene detalle que recuperar.
2. **Comprueba las cuatro esquinas.** Se encuentran solas al leer la foto, y la página lo dice cuando no está segura: la de una hoja sobre una mesa del mismo color es una orilla realmente difícil de ver. Pulsa en cualquier punto de la foto y la esquina más cercana viene a tu dedo, o llega a una con `Tab` y muévela con las flechas.
3. **Decide qué hacer con la luz.** «Color, igualado» mide el papel a lo largo de la hoja y lo divide, así que la sombra desaparece y un sello o una firma conservan su color. «Blanco y negro» va más allá y es lo que hace que un escaneo quepa en un correo. Lo que ves en pantalla es el resultado real, producido por el mismo código que escribe el archivo.
4. **Añade las demás páginas.** Cada foto que añadas se convierte en otra página del mismo documento, en el orden de la lista, y cada una conserva sus propias esquinas. Las flechas de una página de la tira la mueven antes o después.
5. **Guarda el PDF y ábrelo antes de mandarlo.** El documento se escribe aquí, en la memoria de esta página. No se ha subido nada para hacerlo, y no se ha informado de nada a ninguna parte.

## La versión larga

[Cómo escanear un documento con el teléfono](https://abox.tools/es/guias/escanear-un-documento-con-el-telefono/): Qué separa la foto de una hoja de un escaneo de esa misma hoja: el ángulo, la luz desigual y el tamaño del archivo. Cómo hacer la foto, qué arreglar después y por qué nada de esto necesita un servidor.

## También en la caja

- [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.
- [Cortador de audio](https://abox.tools/es/cortar-audio/): Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.
- [Editor de audio](https://abox.tools/es/editar-audio/): Ponla del revés, cámbiale la velocidad o levanta una grabación floja, y todo aquí mismo.
- [Unir y separar PDF](https://abox.tools/es/unir-pdf/): Páginas movidas de sitio sin pasar por ningún servidor.

## Preguntas

### ¿Se sube mi documento a alguna parte?

No. La foto la decodifica, endereza, limpia y escribe en un PDF tu propio navegador en tu propio equipo. Esta herramienta no tiene ninguna función de red, nunca pide ni envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Carga la página una vez, desconéctate de internet y sigue funcionando.

### ¿Cómo encuentra las esquinas de la hoja sin un modelo?

Buscando las cuatro rectas largas de las que se compone un rectángulo. La foto se reduce, se toma el gradiente — dónde cambia la imagen y en qué dirección — y cada píxel que cae sobre un borde vota por la recta sobre la que estaría. Las rectas fuertes se emparejan en rectángulos candidatos, y cada candidato se puntúa recorriendo sus cuatro lados y preguntando cuánto de cada uno tiene realmente un borde debajo, y si los cuatro son la frontera de una misma cosa: una hoja es más clara que lo que la rodea, o más oscura, pero es la misma en los cuatro lados, y eso es lo que impide confundir una línea de texto con el borde inferior de la hoja. No hay pesos, no se descarga nada, y la aritmética es la misma para cualquier documento que pase por ella.

### Las esquinas que ha encontrado están mal. ¿Y ahora?

Arrástralas. Las esquinas son una posición de partida y nunca una decisión: el escaneo se toma de donde acaben las cuatro. Pulsa en cualquier punto de la foto y la esquina más cercana salta a tu dedo, que es más fácil que acertar con un tirador pequeño, y las flechas mueven la esquina enfocada píxel a píxel. La página además te dice cuándo las esquinas son una suposición y no un hallazgo, y marca esa página en la tira: el motivo habitual es una hoja apoyada en una mesa más o menos de su mismo color, porque ahí de verdad casi no hay borde que encontrar.

### ¿Por qué la hoja enderezada sale con la forma correcta y no achatada?

Porque la forma se recupera de la perspectiva en vez de medirse en los bordes. Una hoja fotografiada en ángulo tiene el borde lejano escorzado, así que el método evidente — tomar el par de bordes opuestos más largo y llamar a eso la proporción — produce un A4 visiblemente achatado, que es lo que dan la mayoría de los escáneres web. La foto de un rectángulo lleva en realidad información suficiente para recuperar tanto la proporción del rectángulo como la distancia focal de la cámara, con tal de que sea una cámara corriente; es un resultado de Zhang y He de 2003, y es lo que hace `src/geometry.js`. Cuando la foto se ha tomado perpendicular no hay perspectiva de la que partir y tampoco hace falta, porque entonces los bordes son exactos: ahí recurre a ellos, y la página dice cuál de los dos ha respondido.

### ¿Qué le hace exactamente a la imagen eso de «limpiar»?

Divide la luz. El brillo del propio papel se mide a lo largo de la hoja — una rejilla de casillas, y en cada casilla un percentil alto del brillo, que el texto es demasiado oscuro y demasiado escaso para mover — y cada píxel se divide por el papel estimado en ese punto. Lo que queda es la tinta, con luz uniforme, sin la sombra y sin la caída hacia los bordes. No es lo mismo que subir el contraste: subir el contraste de una hoja fotografiada deja la parte clara en blanco, la oscura en negro y la escritura de la parte oscura ilegible, y por eso el «autonivel» empeora estas imágenes en lugar de mejorarlas.

### ¿Por qué el modo blanco y negro es tanto más pequeño?

Porque una imagen con dos colores es de verdad una fracción de los datos de una imagen con dieciséis millones, y aquí se guarda así: un bit por píxel, empaquetados de ocho en ocho y comprimidos de forma exacta, en vez de como un JPEG de una imagen en blanco y negro. En las mismas páginas sale unas dieciocho veces más pequeño que el modo en color, así que un contrato de veinte páginas se queda por debajo del megabyte en lugar de rondar los quince. El umbral es el de Sauvola, que decide cada píxel contra la media y la dispersión de su propio vecindario en vez de contra un número único para toda la hoja, y eso es lo que mantiene legible la escritura dentro de una sombra. No tiene medios tonos, así que una hoja con una fotografía debería usar alguno de los otros modos.

### ¿Puedo meter varias páginas en un PDF?

Sí. Cada foto que añadas se convierte en otra página, en el orden de la lista, y cada página conserva sus propias esquinas, así que un montón de hojas fotografiadas una detrás de otra se convierte en un documento. Las flechas de cada página de la tira la mueven antes o después. El ajuste de limpieza es común a todas a propósito: unas páginas limpiadas de forma distinta dentro de un mismo documento parecen dos documentos.

### ¿Lee el texto, para que pueda buscar dentro del PDF?

No. No hay capa de texto ni reconocimiento de caracteres: lo que sale es una imagen de la hoja sobre una página. Hacerlo bien significaría un motor de OCR, que son decenas de megabytes de modelo que descargar, y un escáner de documentos que se bajara un modelo antes de poder leer tu nómina sería un escáner de documentos con un motivo para llamar a casa a propósito de nóminas. Si necesitas el texto, el modo blanco y negro produce justo el tipo de archivo con el que mejor trabaja el software de OCR de tu propio equipo.

### Ha salido borroso. ¿Por qué?

Casi siempre porque la hoja era pequeña dentro de la foto. El panel de debajo de la vista previa dice cuánto del encuadre ocupaba la hoja y a cuántos puntos por pulgada equivale eso aproximadamente en una hoja de ese tamaño: por debajo de unos 150 DPI un escaneo impreso se ve blando, y contra el detalle que nunca estuvo en el archivo no puede hacer nada ninguna herramienta. Acércate en vez de usar el zoom, aguanta quieto y deja que la cámara enfoque la hoja antes de disparar. El pulso es la otra causa, y tampoco se recupera.

### ¿Es gratis y hace falta cuenta?

Es gratis, y no hay cuenta, ni registro, ni prueba, ni límite de páginas, ni marca de agua. Tampoco hay límite para el tamaño de las fotos, porque no hay ningún servidor pagándolas: el trabajo ocurre en tu propio equipo. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus documentos.

## Cómo se comprueba la promesa de privacidad

- **Tus documentos no tienen adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna es nuestra. Aquí no hay ningún destino donde recoger tus fotos, ni código que las enviaría si lo hubiera.
- **No hay modelo, así que no hay nada que descargar ni nada que preguntar.** Encontrar las cuatro esquinas de una hoja es aritmética: el gradiente de la imagen, una votación de las rectas que hay en ella y una comprobación de qué hay realmente debajo de cada lado del rectángulo que gana. Sin pesos, sin motor de inferencia, sin nada que se descargue la primera vez y sin nada que se comporte distinto con el documento de otra persona que con el tuyo. Mira `src/detect.js`.
- **El documento no lleva fecha, ni autor, ni nombre de equipo.** Un escaneo es algo que la gente manda a otra gente, normalmente porque una oficina lo ha pedido. Lo único que se escribe en el PDF además de las propias páginas es el nombre de esta herramienta, y un título si escribes uno. No hay fecha de creación, ni autor, ni número de serie, ni nada sacado de tu reloj, de tus nombres de archivo o de tu equipo. Mira `src/document.js`.
- **Aquí nada pide nada.** No hay ningún `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` en ninguna parte de `src/`. El trabajo es un `getImageData`, unos cuantos bucles sobre los bytes y el propio codificador JPEG del navegador, y todo eso ya está instalado en tu equipo.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta no cambia, porque nunca hubo un paso de red dentro. Es la prueba más sencilla de todas, y la que conviene hacer antes de escanear un pasaporte.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/detect.js` para cómo se encuentran las esquinas sin ningún modelo, `src/warp.js` para el enderezado y `src/clean.js` para cómo se divide la luz desigual.
