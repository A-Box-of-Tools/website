# Visor DICOM — abre un estudio .dcm en el navegador

TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.

> Abre estudios de TC, resonancia, radiografía y ecografía en el navegador. Ventana y centro, recorre una serie entera, mide en milímetros, lee cada etiqueta DICOM y comprueba qué hay en el archivo que identifica al paciente. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/visor-dicom/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus estudios **nunca se suben**. No hay ningún servidor.

El navegador abre y decodifica el estudio: la cabecera, los píxeles, la ventana, las medidas. Al otro lado de esta página no hay ningún servidor al que mandar información sanitaria protegida, aunque algo aquí quisiera hacerlo, y nada del archivo se le cuenta a nadie: ni el nombre del paciente, ni el estudio, ni el nombre del archivo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu equipo

## Cómo abrir un archivo DICOM

1. **Elige los archivos.** Un archivo `.dcm` suelto, o la carpeta entera del disco: una TC o una resonancia son un archivo por corte, y soltarlos todos a la vez es lo que vuelve a montar la serie. El navegador los lee directamente de tu disco; mientras lo haces no se manda nada a ninguna parte.
2. **Elige la serie.** Un estudio suele llevar varias: el localizador y después cada adquisición. Cada una se apila en el orden en que la tomó el equipo, deducido de dónde cae cada corte en el paciente y no de la numeración, que no siempre va en el mismo sentido.
3. **Ajusta la ventana.** Este es el control que hace legible un estudio, y el que no tiene un editor de imágenes. Arrastra por la imagen para ensanchar la ventana y hacia arriba o abajo para mover su centro, o elige una de las ventanas con nombre — pulmón, hueso, cerebro, partes blandas — en una TC, donde las unidades son las mismas en cualquier equipo del mundo.
4. **Recorre la pila.** El deslizador de debajo de la imagen avanza por los cortes, y las flechas del teclado hacen lo mismo una vez que has pulsado sobre la imagen. Un archivo multifotograma — un lazo de ecografía, una angiografía — se reproduce con el botón de al lado.
5. **Mide algo.** Cambia a Medir y arrastra una línea. Donde el archivo dice a qué distancia están sus píxeles, la respuesta va en milímetros y tiene en cuenta los píxeles que no son cuadrados; donde no lo dice, la respuesta va en píxeles y lo advierte, en vez de inventarse una escala.
6. **Lee la cabecera.** Cada elemento del archivo, con su número, cómo lo llama la norma y qué contiene, y todo ello se puede buscar. Encima, la lista de lo que en este archivo concreto identifica al paciente, que es bastante más que el nombre.
7. **Llévate lo que necesites.** El fotograma en pantalla como PNG, con la ventana que hayas puesto y sin nada grabado encima, o la cabecera entera como texto plano. Los dos se construyen en la página a partir de lo que ya está ahí.

## La versión larga

[Cómo abrir un archivo DICOM, y qué hay dentro de uno](https://abox.tools/es/guias/abrir-un-archivo-dicom/): Qué hay en un disco hospitalario, por qué los archivos no tienen extensión, cómo abrir un estudio .dcm en el navegador, qué hacen de verdad la ventana y el centro, y qué lleva un estudio sobre el paciente además de la imagen.

## También en la caja

- [Imagen a ICO](https://abox.tools/es/crear-favicon/): Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.
- [Imagen a data URI](https://abox.tools/es/imagen-a-base64/): La imagen entera en una línea de texto, lista para pegarla en tu CSS o tu HTML.
- [SVG a imagen](https://abox.tools/es/convertir-svg-a-png/): Di el tamaño. Un vector no tiene ninguno propio que perder.
- [Imagen a SVG](https://abox.tools/es/convertir-imagen-a-svg/): Una forma, un contorno. Señala lo que no debería estar ahí.

## Preguntas

### ¿Se sube mi estudio a alguna parte?

No. El archivo lo lee, decodifica y dibuja tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Desconéctate de la red y sigue abriendo estudios. \
\
Aquí eso vale más que en cualquier otra página del sitio. Un archivo DICOM lleva en la cabecera el nombre del paciente, su fecha de nacimiento y su número de historia, así que subir uno a un visor es entregarle a un desconocido un historial médico, no una imagen.

### ¿Qué archivos DICOM puede abrir?

Archivos sin comprimir en cualquiera de las tres sintaxis de transferencia básicas — implicit y explicit little endian, y la big-endian retirada — además de deflated, RLE Lossless, JPEG baseline y JPEG Lossless, que es con lo que están comprimidos la mayoría de los estudios de TC y resonancia de un disco hospitalario. \
\
No puede decodificar JPEG 2000, JPEG-LS ni las sintaxis MPEG y HEVC que se usan para vídeo. Esas necesitan códecs que son megabytes de biblioteca compilada, y una página que descargara uno cuando hiciera falta no sería una página que funciona sin conexión. Un archivo en alguna de ellas se abre igualmente: la cabecera se lee y se muestra entera, y en lugar de la imagen aparece una línea que nombra el códec, en vez de un icono de imagen rota que no te dice nada.

### ¿Qué son la ventana y el centro, y para qué los necesito?

Un corte de TC contiene unos cuatro mil valores distintos y tu pantalla muestra doscientos cincuenta y seis grises. La ventana es la decisión de qué tramo de ese rango se lleva todos: por debajo todo es negro, por encima todo es blanco, y lo que queda en medio se reparte entre los grises. \
\
Por eso el mismo archivo parece un estudio distinto con dos ajustes, y por eso el pulmón y el hueso no se pueden ver a la vez. En una TC los números son unidades Hounsfield, definidas en términos absolutos — el agua es 0 y el aire es −1000 —, así que las ventanas con nombre de esta página llevan los mismos números que usa un radiólogo en su estación de trabajo. En una resonancia o una ecografía no existe esa escala, y la ventana con la que se abre es la que pide el propio archivo.

### ¿Por qué dice que mi medida está en píxeles?

Porque ese archivo no dice cómo de grande es un píxel. Eso lo lleva Pixel Spacing (0028,0030), en milímetros, y muchísimas ecografías, documentos escaneados y capturas secundarias sencillamente no lo tienen. \
\
Donde está, la medida va en milímetros y cada eje se mide con su propio espaciado, que es lo que importa en las imágenes cuyos píxeles no son cuadrados. Donde no está, la respuesta honesta es un recuento de píxeles, y eso es lo que aparece, en vez de elegir una escala y presentar el resultado como una longitud.

### Me ha abierto la carpeta como varias series. ¿Por qué?

Porque eso es lo que hay dentro. Un estudio se compone de series — el localizador y después cada adquisición o reconstrucción — y cada archivo dice a cuál pertenece en Series Instance UID (0020,000E). La lista desplegable se construye a partir de eso y no de la carpeta, que suele tenerlas todas mezcladas en una única lista de nombres. \
\
Dentro de una serie, los cortes se ordenan por dónde cae cada uno en el paciente, deducido de Image Position e Image Orientation. Instance Number sería la clave evidente y aquí es el recurso de reserva: la asigna lo que haya escrito los archivos y no tiene por qué ir en el mismo sentido que el paciente.

### ¿Qué significa la lista de «qué identifica al paciente»?

Es cada campo de tu archivo que nombra a la persona del estudio, o que acota quién puede ser, leído de este archivo en tu equipo. La lista sale de PS3.15 de la norma DICOM, la parte que dice qué tiene que desaparecer antes de que un conjunto de datos pueda llamarse anonimizado. \
\
Está ahí porque lo que la gente calcula mal no es que un estudio lleve un nombre. Es cuánto más lleva: la fecha de nacimiento, el número de petición, el médico que la solicitó, el centro, el número de serie del equipo y los UID del estudio, que son claves perfectas de vuelta al archivo que lo generó. Un estudio al que solo se le ha borrado el nombre no es anónimo. \
\
Esta herramienta solo te lo enseña. No escribe nada y no cambia nada, así que tampoco puede quitar nada de eso.

### ¿Puede anonimizar un estudio?

No, y no finge lo contrario. Esta página lee; no tiene código que escriba un archivo DICOM. Lo que hace es decirte exactamente qué hay dentro del tuyo, que es la parte difícil de averiguar y en la que la gente se equivoca. \
\
Una herramienta que quite los identificadores es otro trabajo, y con el listón mucho más alto: tiene que reescribir el archivo sin tocar los píxeles, sustituir los UID de forma coherente en un estudio entero y acertar con los elementos privados en los que algunos equipos esconden una segunda copia del nombre. Está en la hoja de ruta del sitio, y no atornillada a un visor.

### ¿Puede abrir un archivo sin extensión .dcm, o uno dañado?

Las dos cosas, sí. La extensión no se mira: lo que se comprueba es el archivo. Un conjunto de datos escrito sin el preámbulo habitual de 128 bytes — que es el aspecto de un estudio sacado directamente de la red — se lee deduciendo su codificación de su primer elemento, y la página avisa de que eso es lo que ha hecho. \
\
Un archivo que se corta a medias se lee hasta donde llega. Todo lo anterior al daño se muestra, con una nota que dice en qué byte se paró. Ese es justo el caso en que más falta hace un visor, así que tirar el archivo entero por sus últimos doce bytes sería el comportamiento equivocado.

### ¿Es un visor diagnóstico?

No. No es un producto sanitario, no ha pasado ninguna evaluación reglamentaria y nada de lo que hay aquí debería usarse para tomar una decisión clínica. Tu pantalla no está calibrada, el navegador no es una cadena de representación validada, y ninguna de las dos cosas se arregla desde dentro de una página web. \
\
Para lo que sí sirve es para todo lo demás por lo que se abre un estudio: comprobar qué hay en un disco, sacar un corte para una clase o un artículo, leer una cabecera, averiguar por qué otro programa rechaza el archivo y ver qué lleva un estudio sobre la persona retratada.

### ¿Cambia mi archivo?

No. Esta herramienta solo lee. No hay archivo de salida, ni recodificación, ni ningún botón que escriba un DICOM: lo que puedes descargar es un PNG del fotograma en pantalla y una copia en texto plano de la cabecera. Tu original sigue intacto en tu disco.

### ¿Es gratis y hace falta cuenta?

Es gratis, y no hay cuenta, ni registro, ni prueba. Tampoco hay límite de tamaño ni de cuántos archivos abres más allá de la memoria de tu propio equipo. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tu archivo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Es además la forma más sencilla de comprobar que no se sube nada: una herramienta que mandara tu estudio fuera para dibujarlo se pararía en el momento en que tiraras del cable.

## Cómo se comprueba la promesa de privacidad

- **Tu estudio no tiene adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna es nuestra. Aquí no hay ningún destino donde recoger tu archivo, ni código que lo enviaría si lo hubiera. Antes esto decía `connect-src 'none'`, que era absoluto; la publicidad costó eso, y decirlo forma parte del trato.
- **Aquí esto pesa más que en las demás páginas.** Un archivo DICOM no es una imagen con algunos metadatos encima. Es un historial médico con una imagen dentro: el nombre del paciente, la fecha de nacimiento, el número de historia, el número de petición, el médico que la solicitó, el centro y el número de serie del equipo son campos de la cabecera, y viajan con el archivo adonde vaya. Subir uno a una web para verlo significa entregarle todo eso a quien lleve esa web. Eso es exactamente lo que esta página existe para no hacer.
- **El lector son catorce archivos de este repositorio.** Aquí nada usa una biblioteca traída de ninguna parte. `src/dicom.js` recorre el archivo, `src/dictionary.js` sabe cómo se llaman las etiquetas, `src/pixels.js` convierte los bytes otra vez en medidas, `src/rle.js` y `src/jpeg-lossless.js` descomprimen las dos formas comprimidas que esta página sabe decodificar, y `src/window.js` lleva lo medido a los grises de tu pantalla.
- **Los identificadores se te enumeran a ti, y a nadie más.** La página imprime cada campo de tu archivo que nombra o acota a la persona retratada, porque esa es la pregunta que necesita respuesta quien está a punto de compartir un corte, y ningún visor la responde. Aparece en la pantalla que tienes delante y no va a ninguna otra parte: en este repositorio no hay ningún evento de analítica que lleve nada de eso, y la página no podría enviarlo aunque lo hubiera.
- **Lee. No escribe.** Aquí no hay ningún botón que cambie tu archivo, ni código que pudiera hacerlo. Lo que puedes llevarte es un PNG del fotograma en pantalla y una copia en texto de la cabecera, construidos los dos en la página a partir de lo que ya está ahí. Tu original sigue intacto en tu disco, que es además la respuesta honesta a qué pasa si cierras la pestaña.
- **Qué carga Google y qué no se le entrega.** Los scripts de publicidad y de medición vienen de Google. A ninguno de los dos se le entrega nada de tu archivo: ni los píxeles, ni una miniatura, ni un nombre, ni una etiqueta, ni un paciente, ni un nombre de archivo. Todas las líneas que analizan, decodifican o dibujan un estudio se sirven desde este origen y están en el repositorio.
- **Qué carga el botón de donación y qué no se le entrega.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma su tipografía de Google Fonts. Es un enlace y nada más: no informa de ninguna visita y no se le entrega nada sobre ti ni sobre tus archivos. No pasa nada hasta que lo pulsas, y entonces estás en el sitio de otra gente.
- **Funciona sin conexión.** Desconéctate de la red y todo en esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tu estudio fuera para dibujarlo se pararía en el momento en que tiraras del cable.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/dicom.js` para el analizador que recorre el archivo, `src/pixels.js` para la decodificación de los píxeles, `src/jpeg-lossless.js` para el códec que usan casi todas las exportaciones hospitalarias y `src/window.js` para la ventana y el centro. En ninguno de ellos hay una línea que pueda salir a la red.
