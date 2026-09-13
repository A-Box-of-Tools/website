# Imágenes a vídeo — hacer un pase de diapositivas en MP4

Convierte una carpeta de imágenes en un vídeo.

> Convierte imágenes JPG, PNG o WebP en un vídeo MP4 de pase de diapositivas, gratis y sin salir del navegador. No se sube nada, no hay que registrarse y funciona sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/imagenes-a-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

Cada fotograma lo codifica tu propio navegador, y el vídeo se monta en la memoria de este dispositivo. El codificador no toca la red en ningún momento, y aunque la tocara, al otro lado de esta página no hay ningún servidor al que mandar una imagen.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos se quedan en tu dispositivo

## Cómo convertir imágenes en un vídeo

1. **Elige tus imágenes.** Arrastra una carpeta entera hasta el selector, o busca los archivos a mano. El navegador los lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Ponlas en orden y decide cuánto dura cada una.** Arrastra para reordenarlas. La duración se puede dar en fotogramas o en segundos, para todas las imágenes a la vez o de una en una.
3. **Elige una resolución y una cadencia.** «Igualar la resolución más alta» sigue a tu imagen más grande. Los preajustes cubren 4K, 1080p, 720p, cuadrado y vertical, y tienes un tamaño a medida si ninguno te encaja.
4. **Crea el vídeo y descárgalo.** La codificación la hace tu propio hardware, así que lo que tarde depende de tu dispositivo y no de una cola. El MP4 terminado va directo a las descargas del navegador.

## La versión larga

[Cómo convertir una carpeta de imágenes en un vídeo](https://abox.tools/es/guias/convertir-imagenes-en-un-video/): Haz un pase de diapositivas en MP4 con tus fotos: qué controlan de verdad la cadencia y la duración, qué hacer con las imágenes que tienen otra forma, y por qué el resultado no lleva banda sonora.

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

MP4 con vídeo H.264, que se reproduce prácticamente en cualquier cosa. En un navegador sin WebCodecs, la herramienta recurre a grabar en WebM, que es el mismo material en un contenedor que aceptan menos editores.

### ¿Puedo usar esto para una secuencia de render de Blender o After Effects?

Sí, una secuencia de render numerada es exactamente para lo que está esto. Añade los fotogramas que escribió tu motor de render, deja la duración en un fotograma cada uno y pon la misma cadencia que el render. «Ordenar por nombre» cuenta como esperarías, así que `frame_2` cae antes de `frame_10` y no después. \
\
Una cosa que conviene saber antes de empezar: el H.264 no tiene canal alfa, así que la transparencia se aplana sobre el color de fondo en vez de conservarse. Si necesitas mantener el alfa, compón los fotogramas en tu editor.

### ¿Puedo hacer un timelapse con fotos?

Sí, y es el mismo trabajo que una secuencia de render: deja cada foto en un solo fotograma y elige una cadencia. A 30 fps, cada treinta fotos son un segundo de vídeo; a 12 fps, esas mismas fotos duran dos segundos y medio. \
\
«Ordenar por fecha» devuelve un carrete al orden en que se disparó, cosa que importa cuando los nombres de archivo han vuelto a empezar en 0001. Y que las fotos tengan tamaños distintos no es problema, porque «Igualar la resolución más alta» dimensiona el vídeo de modo que no se reduzca ninguna.

### ¿Hay algún límite de cuántas imágenes o de cuánto puede durar el vídeo?

La herramienta no lleva ningún límite dentro. El techo de verdad es la memoria de tu propio dispositivo, porque el vídeo terminado se monta ahí antes de que lo descargues. Lo primero que lo nota son los pases de diapositivas en 4K muy largos.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera a procesar se pararía en cuanto desenchufaras.

### ¿Puedo añadir música o una banda sonora?

Todavía no. La herramienta produce solo vídeo: el MP4 que escribe lleva una única pista de vídeo y ninguna de audio. Si la necesitas, añade la banda sonora después, en un editor de vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera. Esto antes decía `connect-src 'none'`, que era absoluto. Poner publicidad costó eso, y decirlo forma parte del trato.
- **La codificación es local.** WebCodecs funciona dentro de tu navegador y el archivo terminado va directo a una descarga. Esta aplicación no tiene parte de servidor.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tus imágenes: ni un archivo, ni una miniatura, ni un nombre, ni un tamaño, ni un recuento. Cada línea que lee, descodifica, compone o codifica una imagen se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tus imágenes. Si no lo pulsas no ocurre nada, y lo que hay al otro lado es un sitio ajeno.
- **Una excepción deliberada.** Si usas «Añadir desde una dirección web», se contacta con ese servidor para traer la imagen y verá tu dirección IP. Solo se descargan las imágenes que pegues tú, y solo hacia dentro: `img-src` se abre, `connect-src` no. El contador de abajo lista todos los orígenes externos con los que se ha contactado.
- **Funciona sin conexión.** Desconéctate de la red y sigue funcionando todo menos la carga desde una dirección web. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/encoder.js` para el bucle de codificación, que no toca la red en ningún momento.
