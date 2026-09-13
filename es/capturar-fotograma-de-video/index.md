# Capturar un fotograma — guardar una imagen de un vídeo

Una imagen a máxima calidad, de cualquier punto.

> Guarda cualquier fotograma de un MP4, MOV o WebM como PNG o JPEG a tamaño completo. Avanza fotograma a fotograma, o saca uno cada pocos segundos. Funciona en el navegador: no se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/capturar-fotograma-de-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

Los fotogramas los encuentra, decodifica y dibuja tu propio navegador, en tu propio equipo. Aquí nada puede pedir ni enviar nada, porque esta herramienta no tiene ninguna función de red, y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un vídeo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Resolución completa
- ✓ Funciona sin conexión

## Cómo capturar un fotograma de un vídeo

1. **Elige un vídeo.** Suelta un MP4, MOV, M4V o WebM sobre el selector, o búscalo a mano. El navegador lo lee directamente de tu disco, y mientras tanto no sale nada a ninguna parte.
2. **Encuentra el momento.** Dale al play y párate donde quieras, o arrastra el control. En un MP4 el control se mueve un fotograma por paso, así que no hay redondeo entre lo que ves y lo que guardas. Las flechas avanzan de fotograma en fotograma, y con `Mayús` de diez en diez.
3. **Elige un formato.** El PNG guarda el fotograma exactamente como se decodificó, que es lo que aquí significa «máxima calidad». JPEG y WebP son más pequeños y suponen una segunda compresión encima de la del propio vídeo, lo cual está bien para una vista previa y no para nada que luego se vaya a editar.
4. **Captura uno, o una serie.** Un fotograma suelto va directo a tus descargas. «Cada N segundos» recorre el clip una vez y saca una imagen en cada marca, que es útil para hojas de contactos y miniaturas, y salen en un solo ZIP en vez de cien preguntas de guardado.

## La versión larga

[Cómo guardar un fotograma de un vídeo como imagen](https://abox.tools/es/guias/capturar-un-fotograma-de-un-video/): Saca una imagen de un clip a su resolución real: por qué una captura de pantalla del reproductor en pausa no es la misma imagen, en qué formato guardarla y cómo caer en el fotograma exacto que querías.

## También en la caja

- [Vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/): Elige el trozo, el tamaño y la cadencia.
- [Creador de GIF](https://abox.tools/es/crear-gif/): Convierte un puñado de imágenes en una sola animación.
- [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/): Cada fotograma fuera, en su propio PNG.
- [Analizador de GIF](https://abox.tools/es/analizar-gif/): Fotogramas, duraciones, paletas y adónde fue cada byte.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Lo lee y lo decodifica tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Si prefieres comprobarlo a que te lo cuenten, desconéctate de internet y captura un fotograma igualmente.

### ¿Qué significa de verdad «máxima calidad»?

Dos cosas. La imagen se guarda a la resolución del propio vídeo, no al tamaño de la vista previa de la página: un clip 4K da una imagen de 3840 x 2160. Y con PNG elegido, el fotograma se guarda exactamente como salió del decodificador, así que el archivo contiene la imagen que contiene el vídeo, sin una segunda ronda de compresión encima. Una captura de pantalla de la ventana de un reproductor no te da ninguna de las dos: tiene el tamaño de la ventana y se toma después de que el reproductor la haya escalado y gestionado el color.

### ¿De qué formatos de vídeo puedo sacar un fotograma?

MP4, M4V y MOV se leen directamente, lleven lo que lleven dentro: H.264, HEVC, AV1 o VP9, mientras tu navegador pueda decodificar ese códec. Ese es el camino exacto, en el que la herramienta puede dirigirse a fotogramas concretos. Cualquier otra cosa que tu navegador pueda reproducir, WebM sobre todo, se resuelve moviendo el reproductor y dibujando lo que enseña, lo cual sigue guardando una imagen a tamaño completo pero cae en el fotograma que eligió el reproductor y no en el que pediste tú. Un archivo que el navegador no puede ni leer ni reproducir, que en la práctica significa AVI, WMV, FLV y casi todos los MKV, se rechaza con un mensaje que lo dice.

### ¿Puedo avanzar de fotograma en fotograma?

En un MP4 sí, y exactamente: la herramienta lee la propia lista de fotogramas del archivo, así que las flechas se mueven entre las imágenes que están realmente en él, incluso en un clip con la cadencia inestable, donde un paso fijo de una treintava de segundo se iría desviando. En el camino de reproducción no existe esa lista, así que un paso es un empujón de aproximadamente un fotograma, y la página lo avisa.

### ¿Por qué mi vídeo vertical de móvil aparece derecho aquí?

Porque la rotación se ha aplicado a propósito. Un móvil graba en horizontal y escribe un cuarto de giro dentro del archivo en vez de girar los píxeles, así que el fotograma que entrega un decodificador está tumbado y todos los reproductores lo giran de camino a tu pantalla. Una herramienta que se salte ese paso guarda una imagen plausible del momento correcto, de lado. Esta lee el giro de la pista y lo aplica antes de dibujar nada.

### ¿Hay un límite de tamaño o de duración del vídeo?

No hay ningún límite metido en la herramienta, y el archivo no se lee entero en memoria: se recorre de unos pocos megabytes cada vez, que es por lo que un clip largo se abre tan rápido como uno corto. Las imágenes que capturas se quedan en la página hasta que las descargas, así que el techo práctico son unos cientos de PNG en 4K, y no el vídeo en sí.

### ¿Puedo redimensionar o recortar la imagen después?

Aquí no, pero al lado sí. Esta herramienta guarda el fotograma tal cual; cambiar su tamaño o su forma es un trabajo aparte con sus propias decisiones, y el [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) hace las dos cosas, también sin subir nada. Para hacer el archivo más pequeño sin cambiar la imagen está el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/).

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus vídeos no tienen por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse tu archivo, ni nada en el código que lo enviara si lo hubiera.
- **Aquí nada pide nada.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, nada que descargar, ningún motor que se baje la primera vez. Cada byte que toca tu vídeo vino de este origen cuando cargó la página.
- **La decodificación es local.** Los fotogramas pasan por WebCodecs en tu propio navegador, o por el mismo motor de reproducción que te enseñaría el vídeo de todos modos. La imagen se dibuja en un lienzo de este equipo y va directa a una descarga.
- **El archivo se lee de unos pocos megabytes cada vez.** Un vídeo es el único tipo de archivo de aquí que no cabe con seguridad en memoria, así que no se carga entero nunca. El lector coge una ventana alrededor del fotograma que hayas pedido, que es también la razón de que un clip de dos gigabytes se abra tan rápido como uno pequeño.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu vídeo: ni el archivo, ni un fotograma, ni un nombre, un tamaño, una duración o el momento en el que te has parado. Cada línea que lee, decodifica o dibuja se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tu vídeo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/mp4-reader.js` para el lector que encuentra los fotogramas dentro de un MP4 y `src/frames.js` para la parte que decodifica el que has pedido. Ninguno de los dos importa nada que pueda hacer una petición.
