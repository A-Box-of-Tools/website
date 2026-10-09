# PNG a WebP — menos tamaño, con toda la transparencia

La misma imagen, a menudo un tercio más pequeña, con la transparencia intacta.

> Convierte PNG y AVIF a WebP en el navegador, sin pérdida o con mayor compresión. Ambos modos conservan la transparencia. Sin subir nada, sin cuenta y sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-png-a-webp/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

La conversión ocurre en el navegador y en tu dispositivo. Los navegadores escriben WebP desde 2020: el codificador ya estaba instalado antes de llegar aquí. No hay nada que descargar ni esperar. Esta página no tiene funciones de red ni un servidor al que enviar una imagen.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir PNG a WebP

1. **Elige los archivos PNG y AVIF.** Suéltalos o búscalos. Se reconocen por sus primeros bytes, no por el nombre: un JPEG se rechaza con un mensaje que explica el formato real. La fila también avisa si hay transparencia, para que sepas qué se va a conservar.
2. **Elige sin pérdida o más pequeño.** Sin pérdida conserva cada píxel opaco y reduce el archivo: útil para capturas, diagramas, logotipos y texto. Más pequeño activa el control de calidad, pensado para fotografías, donde el ahorro puede ser enorme con poca diferencia visible.
3. **Pulsa “Convertir” y lee el resultado.** Cada resultado muestra el tamaño nuevo, la diferencia y la codificación que realmente escribió el navegador: sin pérdida o con pérdida a la calidad elegida. Se lee del archivo terminado; no se limita a repetir el ajuste.
4. **Descarga los archivos por separado o juntos.** Un archivo tiene su botón; con dos o más también puedes descargar un ZIP. Los nombres repetidos reciben un número antes de la extensión para no reemplazar archivos.

## La versión larga

[La misma imagen, un tercio más pequeña y con la transparencia intacta](https://abox.tools/es/guias/convertir-png-a-webp/): WebP ocupa menos que PNG incluso sin perder información, y mucho menos si aceptas una pequeña pérdida. Qué modo conviene según la imagen, cuánto ahorra y cómo convertir sin subir archivos.

## También en la caja

- [AVIF a JPG](https://abox.tools/es/convertir-avif-a-jpg/): El formato que guardan las webs, convertido al que siempre se ha aceptado.
- [Creador de fotos de carnet](https://abox.tools/es/foto-carnet/): Elige el país. Aplica esa norma, exactamente.
- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.
- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El navegador lee, decodifica y escribe el archivo en tu dispositivo. La herramienta no pide ni envía nada por la red. La `Content-Security-Policy` enumera todas las direcciones permitidas y ninguna pertenece a este sitio.

### ¿Se conserva la transparencia?

Sí, en ambos modos. Es una de las principales ventajas frente a JPEG. WebP tiene canal alfa: el fondo transparente de un logotipo sigue siendo transparente, sin elegir un color ni aplanarlo. Cada fila avisa si hay transparencia antes de convertir y el resultado confirma que se ha conservado.

### ¿Qué diferencia hay entre sin pérdida y más pequeño?

Sin pérdida conserva exactamente cada píxel opaco y suele reducir entre una quinta y una tercera parte, porque WebP comprime mejor que PNG. Los píxeles semitransparentes tienen una salvedad, explicada debajo. Más pequeño usa compresión con pérdida: elimina detalles poco perceptibles y puede dejar una foto en una décima parte. Para texto, colores planos y bordes definidos, elige sin pérdida; para fotos, el otro modo.

### ¿Por qué dice “cada píxel opaco”? ¿Qué pasa con los semitransparentes?

Pueden cambiar ligeramente por el lienzo, no por WebP. El navegador guarda el color multiplicado por la transparencia; esa operación no siempre se puede invertir exactamente. Cuanto menos opaco es un píxel, menos precisión conserva. Esto afecta a los conversores que pasan por un lienzo, incluido este. \
\
Los píxeles totalmente opacos y los invisibles se conservan exactamente. En los intermedios, el color almacenado puede variar: aquí se han medido hasta 63 unidades de 255 en píxeles con menos de un cuarto de opacidad, y como máximo 4 en el resto. Apenas se ve porque los píxeles que más varían son los menos visibles. Ocurre en los bordes suavizados de un logotipo, que siguen viéndose igual. \
\
Para conservar una copia exacta de archivo, guarda el PNG. Para que se vea igual y pese menos, usa esta conversión.

### ¿Cómo sabe que el archivo es realmente sin pérdida?

Lee y comprueba el archivo terminado. WebP guarda la imagen en un bloque `VP8L` si es sin pérdida o `VP8` si es con pérdida. La página identifica ese bloque y muestra el resultado. El lienzo no tiene una bandera de codificación sin pérdida: se pide la máxima calidad y el navegador decide. Los navegadores actuales lo respetan, pero aquí se verifica de todos modos.

### ¿Un WebP se abre en todas partes?

En la web, sí: Chrome, Edge, Firefox y Safari lo muestran desde 2020. Fuera del navegador varía: Windows y macOS ya lo previsualizan, pero algunos programas antiguos, formularios y lectores electrónicos no lo aceptan. Si el destino lo rechaza, usa el conversor [WebP a JPG](https://abox.tools/es/convertir-webp-a-jpg/).

### ¿Por qué pesa tanto el PNG?

PNG es sin pérdida. Comprime bien capturas y logotipos con áreas repetidas, pero mal las fotografías, donde casi ningún píxel se repite. Una foto de teléfono en PNG puede pesar diez veces más que su JPEG. Para eso sirve el modo con pérdida. Si necesitas un límite concreto, el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) permite fijar un tamaño objetivo.

### ¿Conserva la fecha, la cámara y la ubicación?

No. El lienzo solo guarda píxeles y deja los metadatos fuera. [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) lee y edita metadatos JPEG, PNG y WebP sin recodificar sus imágenes. Para AVIF muestra el EXIF disponible como solo lectura y limpia convirtiendo la primera imagen decodificada a un PNG nuevo; el color o el HDR pueden cambiar.

### ¿Puedo convertir una carpeta entera?

Sí. No hay límite de cantidad ni tamaño porque no hay un servidor que los procese. Cada archivo tiene su fila y descarga. Con dos o más también puedes descargar un ZIP; arriba aparece el ahorro total.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis: sin cuenta, inicio de sesión, prueba ni marca de agua. La publicidad paga el sitio y no recibe información sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate: seguirá funcionando igual. Es una comprobación directa de que no se sube nada. Un conversor que enviara los archivos a un servidor dejaría de funcionar sin red.

### ¿También puedo convertir imágenes AVIF?

También se acepta AVIF si tu navegador puede decodificarlo. La salida sigue siendo WebP. Las secuencias AVIF solo producen la primera imagen decodificada. El canvas del navegador crea una copia SDR de 8 bits: el color o el HDR pueden cambiar, se omiten los metadatos y el archivo puede ser mayor. El original no cambia.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **La transparencia se conserva.** WebP tiene canal alfa, igual que PNG. Un logotipo con fondo transparente sigue siendo transparente: no hay color que elegir ni fondo que añadir. Es la diferencia respecto a [WebP a JPG](https://abox.tools/es/convertir-webp-a-jpg/), que debe rellenarlo porque JPEG no admite canal alfa.
- **Se comprueba si es sin pérdida.** El lienzo no tiene una opción explícita para WebP sin pérdida. El navegador elige la codificación según la calidad; los actuales usan la modalidad sin pérdida en el extremo superior. Como es comportamiento del motor y no una garantía del estándar, aquí se lee cada archivo generado y se indica la codificación real. Si un navegador deja de respetarlo, el resultado lo avisará.
- **Lo que el lienzo no conserva.** El lienzo solo guarda píxeles. Los bloques de texto, perfiles ICC o XMP del PNG no pasan al resultado. Los píxeles se conservan en el modo sin pérdida, pero no sus metadatos. [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) lee y edita metadatos JPEG, PNG y WebP sin recodificar sus imágenes. Para AVIF muestra el EXIF disponible como solo lectura y limpia convirtiendo la primera imagen decodificada a un PNG nuevo; el color o el HDR pueden cambiar.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google, y el botón de donación, de Buy Me a Coffee. No reciben información sobre tus imágenes. Todo el código que lee, decodifica o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Carga la página una vez y desconéctate: funciona igual. Es la comprobación más sencilla. Un conversor que enviara tus imágenes a otro lugar no podría hacerlo.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/shared/image-convert.js` para la conversión. En particular, `encodeWebp` escribe el archivo y vuelve a leer sus bloques RIFF para comprobar si el navegador generó realmente la codificación sin pérdida solicitada.
