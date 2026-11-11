# Imágenes a vídeo

Crea un MP4 a partir de una secuencia de render, fotos de timelapse o una presentación.

> Convierte una secuencia de imágenes a MP4 en el navegador. Usa un fotograma por imagen para renders y timelapses, o segundos por foto para una presentación. Sin subidas ni cuenta.

Esta es una herramienta interactiva de navegador en https://abox.tools/es/imagenes-a-video/. Los archivos se procesan en el dispositivo donde se ejecuta ese navegador. La página explica las funciones opcionales de red y los envíos deliberados. Lo que sigue es su explicación escrita; abre la dirección para usarla.

## Tus imágenes se **procesan en tu navegador**. No se suben para procesarlos.

Cada fotograma lo codifica tu propio navegador, y el vídeo se monta en la memoria de este dispositivo. El codificador no toca la red en ningún momento, y aunque la tocara, al otro lado de esta página no hay ningún servidor al que mandar una imagen.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos se quedan en tu dispositivo

## Cómo convertir una secuencia de imágenes o una presentación a MP4

1. **Elige tus imágenes.** Arrastra una carpeta entera hasta el selector, o busca los archivos a mano. El navegador los lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Elige fotogramas para una secuencia o segundos para una presentación.** Usa «Ordenar por nombre» para fotogramas de render numerados y comprueba la primera y la última miniatura. Deja un fotograma por imagen para una secuencia de render o un timelapse de fotos, y ajusta la frecuencia de fotogramas a tu fuente. Para una presentación, cambia a segundos, escribe una duración como tres y pulsa «Aplicar a todas». Arrastra para reordenar o cambia la duración de una imagen concreta.
3. **Elige una resolución y una cadencia.** Elige 1080p para una primera exportación, o usa la forma cuadrada o vertical del destino. «Igualar la resolución más alta» toma la mayor anchura y la mayor altura de todas las imágenes. «Encajar dentro» conserva la imagen entera; «Llenar el fotograma» recorta los bordes. Comprueba el resumen de duración y tamaño de salida antes de codificar.
4. **Crea el vídeo y descárgalo.** La codificación la hace tu propio hardware, así que lo que tarde depende de tu dispositivo y no de una cola. El MP4 terminado va directo a las descargas del navegador.

## La versión larga

[Convierte una secuencia de imágenes o una presentación de fotos a MP4](https://abox.tools/es/guias/convertir-imagenes-en-un-video/): Convierte fotogramas renderizados numerados o fotografías de vídeo acelerado a MP4, o crea una presentación. Elige la duración en fotogramas o segundos, revisa el orden y evita recortes o tiempos incorrectos.

## También en la caja

- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.
- [Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.
- [Invertidor de vídeo](https://abox.tools/es/invertir-video/): El último fotograma primero, con sonido y todo.
- [Creador de timelapse](https://abox.tools/es/crear-timelapse/): Una hora de grabación en veinte segundos.

## Preguntas

### ¿Se suben mis imágenes a alguna parte?

No. Tu propio navegador las lee, las compone y las codifica, todo en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. La única excepción es la función opcional de «añadir desde una dirección web», que descarga una imagen que has pegado tú, y ese servidor sí ve tu dirección IP.

### ¿Qué formatos de imagen puedo usar?

Cualquier formato de imagen fija que el navegador sepa descodificar, que en la práctica son JPG, PNG, WebP, GIF, AVIF y, en dispositivos Apple, HEIC. Aquí no hay otra lista que mantener al día, porque descodificar es trabajo del navegador y no nuestro.

### ¿Qué formato de vídeo produce?

El formato preferido es MP4 con vídeo H.264. La alternativa graba en tiempo real, normalmente como WebM, que aceptan menos editores. Mantén la pestaña visible durante esa grabación; los tiempos son aproximados y pueden saltarse imágenes si la decodificación se retrasa. Usa el codificador MP4 para secuencias numeradas exactas cuando tu navegador lo admita.

### ¿Puedo usar esto para una secuencia de render de Blender o After Effects?

Sí, una secuencia de render numerada es exactamente para lo que está esto. Añade los fotogramas que escribió tu motor de render, deja la duración en un fotograma cada uno y pon la misma cadencia que el render. «Ordenar por nombre» cuenta como esperarías, así que `frame_2` cae antes de `frame_10` y no después. \
\
Una cosa que conviene saber antes de empezar: el H.264 no tiene canal alfa, así que la transparencia se aplana sobre el color de fondo en vez de conservarse. Si necesitas mantener el alfa, compón los fotogramas en tu editor.

### ¿Puedo hacer un timelapse con fotos?

Sí, y es el mismo trabajo que una secuencia de render: deja cada foto en un solo fotograma y elige una cadencia. A 30 fps, cada treinta fotos son un segundo de vídeo; a 12 fps, esas mismas fotos duran dos segundos y medio. \
\
«Ordenar por fecha» usa las fechas de modificación de los archivos, que pueden cambiar al copiar o editar las fotos. Comprueba el orden cuando los nombres de archivo hayan vuelto a empezar en 0001. Las fotos de distintos tamaños no son un problema, porque «Igualar la resolución más alta» parte de la mayor anchura y la mayor altura, luego limita el lado más largo a 7680 píxeles y redondea a dimensiones pares. Comprueba el resumen del tamaño de salida; los originales muy grandes aún pueden reducirse.

### ¿Hay algún límite de cuántas imágenes o de cuánto puede durar el vídeo?

No hay un límite fijo de imágenes, pero las exportaciones MP4 deben quedar por debajo de 4 GiB (unos 4,3 GB). El vídeo terminado se monta en la memoria antes de la descarga, así que tu dispositivo puede quedarse sin memoria mucho antes de ese tope. El codificador del navegador también limita las dimensiones de salida. Si falla una exportación grande, reduce la resolución, acorta la secuencia o divídela en partes.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera a procesar se pararía en cuanto desenchufaras.

### ¿Puedo añadir música o una banda sonora?

Todavía no. La herramienta produce solo vídeo: el MP4 que escribe lleva una única pista de vídeo y ninguna de audio. Si la necesitas, añade la banda sonora después, en un editor de vídeo.

## Cómo se comprueba la promesa de privacidad

- **El procesamiento se hace en este navegador.** La herramienta procesa entradas y resultados en el navegador. Su código no los sube para procesarlos. Content-Security-Policy limita recursos y destinos, pero los hosts permitidos pueden recibir solicitudes: no inspecciona sus datos ni prueba por sí sola que nada se envíe. Compara código y solicitudes de la operación concreta o complétala desconectado.
- **La codificación es local.** WebCodecs funciona dentro de tu navegador y el archivo terminado va directo a una descarga. Esta aplicación no tiene parte de servidor.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tus imágenes: ni un archivo, ni una miniatura, ni un nombre, ni un tamaño, ni un recuento. Cada línea que lee, descodifica, compone o codifica una imagen se sirve desde este origen y está en el repositorio.
- **El botón de donación no carga nada y no recibe nada.** El botón «Buy me a coffee» de la cabecera lo dibuja esta misma página y no carga nada de ningún sitio. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tus imágenes. Si no lo pulsas no ocurre nada, y lo que hay al otro lado es un sitio ajeno.
- **Una excepción deliberada.** Si usas «Añadir desde una dirección web», se contacta con ese servidor para traer la imagen y verá tu dirección IP. Solo se descargan las imágenes que pegues tú, y solo hacia dentro: `img-src` se abre, `connect-src` no. El contador de abajo lista todos los orígenes externos con los que se ha contactado.
- **Funciona sin conexión.** Desconéctate de la red y sigue funcionando todo menos la carga desde una dirección web. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/encoder.js` para el bucle de codificación, que no toca la red en ningún momento.
