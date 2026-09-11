# Vídeo a GIF — convertir un vídeo en un GIF

Elige el trozo, el tamaño y la cadencia.

> Convierte un trozo de un MP4, MOV o WebM en un GIF animado. Elige el trozo, el ancho y la cadencia; los fotogramas se leen y el GIF se escribe dentro del navegador. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-video-a-gif/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

Cada fotograma lo lee, lo redimensiona, lo cuantiza y lo escribe tu propio navegador, en tu propio hardware. Aquí no hay nada que pueda descargar ni enviar, porque esta herramienta no tiene ninguna función de red. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un vídeo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Cualquier duración
- ✓ Funciona sin conexión

## Cómo convertir un vídeo en un GIF

1. **Elige un vídeo.** Arrastra un MP4, MOV, M4V o WebM hasta el selector, o busca uno a mano. El navegador lo lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Marca el trozo.** Reproduce el clip y pulsa `I` donde tiene que empezar y `O` donde tiene que terminar, o arrastra los tiradores de la barra. Un GIF dura unos pocos segundos, y este es el ajuste que decide si el archivo sale pequeño o enorme, mucho más que los otros dos.
3. **Elige el ancho y la cadencia.** A casi todo aquello para lo que sirve un GIF le van bien 480 píxeles de ancho y 12 fotogramas por segundo. Reducir el ancho a la mitad deja los píxeles en la cuarta parte, y doce fotogramas por segundo se leen como movimiento sin pagar por los que no ve nadie.
4. **Hazlo y descárgalo.** Se leen los fotogramas, se elige una sola paleta de 256 colores para toda la animación, y de cada fotograma se escribe solo la parte de la imagen que ha cambiado. Cuando termina se reproduce en la página, y ese es el mismo archivo que te da la descarga.

## La versión larga

[Cómo convertir un vídeo en un GIF](https://abox.tools/es/guias/convertir-un-video-en-gif/): Qué trozo, qué ancho y qué cadencia elegir, por qué un GIF hecho de un vídeo ocupa diez veces lo que el vídeo, y cuándo compensa usar uno.

## También en la caja

- [Creador de GIF](https://abox.tools/es/crear-gif/): Convierte un puñado de imágenes en una sola animación.
- [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/): Cada fotograma fuera, en su propio PNG.
- [Analizador de GIF](https://abox.tools/es/analizar-gif/): Fotogramas, duraciones, paletas y adónde fue cada byte.
- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Tu propio navegador lo lee, lo muestrea y lo convierte, todo en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Y si prefieres comprobarlo a que te lo cuenten, desenchúfate de internet y haz un GIF igualmente.

### ¿Qué formatos de vídeo puedo convertir?

MP4, M4V y MOV se leen directamente, lleven lo que lleven dentro: H.264, HEVC, AV1 o VP9, siempre que el navegador sepa descodificar ese códec. Lo demás que el navegador sepa reproducir, y aquí el caso claro es el WebM, se lee llevando el reproductor a cada instante, que es más lento y algo menos exacto sobre qué fotograma cae dónde. Un archivo que el navegador no sabe ni leer ni reproducir, que en la práctica son los AVI, WMV, FLV y casi todos los MKV, se rechaza con un mensaje que lo dice, en lugar de fallar a mitad de camino.

### ¿Por qué mi GIF es tan grande?

Porque el GIF es un formato de 1987 que guarda imágenes enteras y no movimiento. No hay forma de hacer uno de un clip de cinco segundos que sea tan pequeño como el MP4 de cinco segundos del que salió: un GIF hecho de un vídeo suele ocupar diez veces más que el vídeo. Los tres ajustes que lo deciden de verdad son, por orden, cuánto dura el trozo, cuánto mide de ancho la imagen y cuántos fotogramas por segundo lleva. Reducir el ancho a la mitad deja los píxeles en la cuarta parte, y lo que se paga son los píxeles.

### ¿Por qué solo 256 colores?

Porque es lo que da el formato: un GIF lleva una tabla de 256 colores como mucho y guarda cada píxel como un número dentro de ella. Esta herramienta elige esos 256 contando los colores de todos los fotogramas de tu trozo y repartiéndolos en 256 grupos, por corte de la mediana, que es el método estándar, así que la paleta se ajusta a tu clip en vez de ser un conjunto fijo de colores. Y donde falta un color, el tramado mezcla los dos más cercanos para que un degradado siga siendo un degradado en lugar de convertirse en franjas.

### ¿Qué hace el ajuste de tramado?

Cambiar un poco de ruido por mucho menos bandeado. Con él activado, un cielo que si no se convertiría en cuatro franjas planas sigue siendo un degradado, a costa de una textura tenue y de un archivo más grande. Desactivado, la imagen queda más plana y el archivo más pequeño, que es lo que les va bien a las grabaciones de pantalla, al dibujo de línea y a cualquier cosa hecha ya de color plano. El tramado que se usa aquí es ordenado y no de difusión de error, así que un fondo que no cambia se queda perfectamente quieto entre fotogramas en vez de temblar.

### ¿Hay algún límite de duración o de tamaño?

Lo que está limitado es el trozo, y por la memoria más que por una regla: todos sus fotogramas se sostienen a la vez mientras se elige la paleta, así que la página calcula lo que costarían tus ajustes y te lo dice antes de que empieces. Se niega en vez de dejar que la pestaña se quede sin memoria y desaparezca. Un trozo más corto, un ancho menor o una cadencia más baja bajan ese coste.

### ¿Conserva el sonido?

Un GIF no puede llevar sonido. No existe ninguna versión del formato que tenga audio, y esa es la razón principal de que la web haya sustituido casi del todo los GIF por vídeo mudo en bucle. Si el sonido importa, quédate con el vídeo: el [cortador de vídeo](https://abox.tools/es/cortar-video/) te saca un trozo sin recodificar ni un fotograma.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus vídeos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tu archivo, ni una línea de código que lo mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, ni nada que descargar, ni ningún motor que se baje la primera vez que la usas. Cada byte que toca tu vídeo llegó desde este origen al cargarse la página.
- **La descodificación es local.** Los fotogramas pasan por WebCodecs dentro de tu navegador, o por el mismo motor de reproducción que te enseñaría el clip de todas formas. Cuál de los dos se ha usado está escrito arriba de la página, porque cambia cómo se eligen los fotogramas y es algo que deberías poder ver.
- **El GIF se escribe aquí, con código que puedes leer.** La paleta, el tramado y la compresión LZW son unas seiscientas líneas dentro de la carpeta propia de esta herramienta. No hay ningún servicio de codificación, ni ninguna biblioteca que se descargue en tiempo de ejecución, ni ningún sitio en todo ello al que pudiera enviarse una imagen.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu vídeo: ni un archivo, ni un fotograma, ni un nombre, ni un tamaño, ni una duración, ni el trozo que has marcado. Cada línea que lee, muestrea, cuantiza o codifica se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tu vídeo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/frames.js` para las dos formas en que se leen los fotogramas de un vídeo, `src/quantize.js` para la paleta, y `src/gif.js` para el propio archivo, LZW incluido. Ninguno de ellos importa nada capaz de hacer una petición.
