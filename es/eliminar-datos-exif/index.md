# Visor y eliminador de EXIF — quitar los metadatos de una foto

Mira lo que una foto cuenta de ti. Y luego quítaselo.

> Consulta, edita o elimina datos EXIF y GPS. JPEG, PNG y WebP conservan su codificación; la limpieza de AVIF crea un PNG nuevo. Sin subir archivos.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/eliminar-datos-exif/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus fotos **nunca se suben**. No hay ningún servidor.

El archivo lo abre, lo analiza y lo reescribe tu propio navegador. Esta herramienta no tiene ninguna función de red: no descarga nada y no envía nada. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una foto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ AVIF se limpia a PNG; JPEG, PNG y WebP conservan su codificación

## Cómo quitarle los datos EXIF a una foto

1. **Elige tus fotos.** Arrástralas hasta el selector o búscalas a mano. El navegador las lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Lee lo que llevan dentro, si te apetece.** La lista de hallazgos pone por delante lo que conviene saber, que es la posición GPS, las marcas de tiempo y los números de serie, y detrás va la tabla completa con todas las etiquetas. Para JPEG, PNG y WebP se enumeran estos bloques. AVIF solo muestra el EXIF extraído disponible; no se inventarían otros metadatos AVIF.
3. **Pulsa «Quitar todos los metadatos».** Para JPEG, PNG y WebP: Para casi todo el mundo, ahí se acaba el trabajo. Se van todas las etiquetas, los bloques XMP e IPTC, los comentarios y la miniatura incrustada, y de todas las fotos de la lista a la vez. El navegador decodifica AVIF y lo guarda como un PNG nuevo sin copiar los metadatos originales. Aquí puedes ver sus etiquetas EXIF disponibles, pero no editarlas. El PNG puede ser mayor y la conversión puede cambiar el color o el HDR. El archivo original no cambia.
4. **O edita en lugar de quitar.** Para JPEG, PNG y WebP: Cambia una fecha, corrige una línea de derechos, tira la ubicación y conserva los ajustes de la cámara. Después guardas esa foto por su cuenta.

## La versión larga

[Lo que una foto cuenta de ti, y cómo quitarlo](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/): Una foto salida de un móvil suele llevar el punto exacto en que se tomó, la hora al segundo y el número de serie de la cámara. Qué hay ahí dentro, quién puede leerlo y cómo quitarlo sin tocar la imagen.

## También en la caja

- [Visor DICOM](https://abox.tools/es/visor-dicom/): TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.
- [Imagen a ICO](https://abox.tools/es/crear-favicon/): Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.
- [Imagen a data URI](https://abox.tools/es/imagen-a-base64/): La imagen entera en una línea de texto, lista para pegarla en tu CSS o tu HTML.
- [SVG a imagen](https://abox.tools/es/convertir-svg-a-png/): Di el tamaño. Un vector no tiene ninguno propio que perder.

## Preguntas

### ¿Se sube mi foto a alguna parte?

No. El archivo lo lee, lo analiza y lo reescribe tu propio navegador, en tu propio hardware. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Además, la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, y ninguna de ellas es de este sitio.

### ¿Qué es el EXIF y qué más se esconde en una foto?

Para JPEG, PNG y WebP: El EXIF es un bloque de etiquetas que la cámara escribe junto a la imagen: la marca y el modelo, los ajustes de exposición, la fecha y la hora al segundo, muchas veces una posición GPS y a veces un número de serie. Y las fotos suelen llevar más cosas todavía: un paquete XMP de XML que ha puesto un editor, un bloque IPTC con campos de pie de foto y autoría, un perfil de color, una segunda copia pequeña de la imagen a modo de miniatura y una nota del fabricante con datos sin documentar. Esta herramienta te lo lista todo. Para JPEG, PNG y WebP se enumeran estos bloques. AVIF solo muestra el EXIF extraído disponible; no se inventarían otros metadatos AVIF.

### ¿Quitar los metadatos le baja la calidad a la imagen?

La limpieza de JPEG, PNG y WebP edita sus contenedores y copia los datos de imagen comprimidos byte por byte sin decodificarlos ni recomprimirlos. La limpieza de AVIF decodifica la primera imagen y escribe un PNG nuevo sin pérdidas ni metadatos originales. El PNG puede ser mayor y la decodificación del navegador puede cambiar el color o el HDR. El original no cambia.

### ¿Con qué formatos de archivo trabaja?

JPEG, PNG y WebP permiten ver, editar y limpiar metadatos en su contenedor. AVIF permite una vista previa del EXIF extraído disponible y limpieza a un PNG nuevo. Las etiquetas AVIF son de solo lectura; no se inventarían los demás metadatos. En AVIF animado se usa la primera imagen. HEIC y TIFF sin contenedor se reconocen, pero no se reescriben.

### ¿Me va a salir la foto girada después de quitarle los metadatos?

Para JPEG, PNG y WebP, conservar la orientación escribe un pequeño bloque EXIF con esa etiqueta cuando hace falta. Desactiva la opción para quitarla. AVIF se limpia usando la imagen orientada que decodifica el navegador y crea un PNG. Las opciones de orientación y perfil de color solo se aplican a JPEG, PNG y WebP.

### ¿Quita la ubicación GPS?

La limpieza elimina los datos GPS. Para JPEG, PNG y WebP también puedes borrar solo la ubicación y conservar lo demás. Las etiquetas AVIF son de solo lectura; la conversión a PNG no copia metadatos originales.

### ¿Puedo cambiar una etiqueta en vez de borrarla?

JPEG, PNG y WebP permiten editar y añadir etiquetas. Reescribir la nota del fabricante puede invalidar sus desplazamientos internos; conserva el original si eso importa. El EXIF de AVIF es de solo lectura. La limpieza crea un PNG sin metadatos originales en lugar de reescribir el contenedor AVIF.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus fotos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus fotos fuera a procesar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus fotos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** A diferencia de las demás herramientas de esta caja, esta no tiene ninguna función de «cargar desde una dirección web» ni ningún paso de red opcional. En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`.
- **Los metadatos que leemos no se los contamos a nadie.** Tu posición GPS se muestra en esta página y no va a ninguna otra parte. En este repositorio no hay ningún evento de analítica propio que lleve una etiqueta, un nombre de archivo, un tamaño o un recuento.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tus fotos. Cada línea que lee, analiza o reescribe un archivo se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tus archivos. Si no lo pulsas no ocurre nada, y lo que hay al otro lado es un sitio ajeno.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/tiff.js` para el analizador de EXIF, y `src/jpeg.js` para la prueba de que la imagen en sí solo se copia.
