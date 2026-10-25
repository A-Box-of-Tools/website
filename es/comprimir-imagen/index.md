# Compresor de imágenes

Tú dices el tamaño. Del resto se encarga él.

> Comprime JPEG, PNG, WebP o AVIF para un límite como 100 KB o 2 MB. Busca un resultado igual o menor que el objetivo, no una cantidad exacta de bytes. Sin subir archivos, también sin conexión.

Esta es una herramienta interactiva de navegador en https://abox.tools/es/comprimir-imagen/. Los archivos se procesan en el dispositivo donde se ejecuta ese navegador. La página explica las funciones opcionales de red y los envíos deliberados. Lo que sigue es su explicación escrita; abre la dirección para usarla.

## Tus imágenes se **procesan en tu navegador**. No se suben para procesarlos.

La compresión ocurre dentro de tu navegador, en tu propio hardware, con los codificadores que ya trae de serie. Esta herramienta no tiene ninguna función de red: no descarga nada y no envía nada. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una foto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo comprimir una imagen a un tamaño concreto

1. **Elige tus imágenes.** Arrástralas hasta el selector o búscalas a mano. El navegador las lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Escribe el tamaño que te piden.** 100 KB para ese formulario que no para de rechazarte la foto, 500 KB para el portal de solicitudes, 2 MB para una página que tiene que cargar rápido. Los cuatro tamaños más habituales están puestos como botones.
3. **Pulsa «Comprimir al objetivo».** Cada imagen se codifica varias veces mientras la herramienta se acerca a la calidad más alta que cabe. Lo que ya está por debajo del objetivo se queda exactamente como está.
4. **Mira lo que ha costado y descarga.** Cada resultado te dice en qué formato se ha escrito, con qué calidad, si han cambiado las dimensiones y cuánto se parece al original al medirlo. Con «Comparar» pones las dos fotos una al lado de la otra.

## La versión larga

[Cómo comprimir una imagen bajo un límite de tamaño](https://abox.tools/es/guias/comprimir-una-imagen-a-un-tamano-exacto/): Un formulario pide 500 KB y tu foto ocupa 4 MB. Lo que cuesta de verdad un límite de tamaño, qué ajuste hay que mover primero, y por qué un PNG no encoge como encoge un JPEG.

## También en la caja

- [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/): Di el tamaño. Dibuja la caja. Elige el formato.
- [HEIC a JPG](https://abox.tools/es/convertir-heic-a-jpg/): Las fotos que hace un iPhone, en un formato que abre todo el mundo.
- [WebP a JPG](https://abox.tools/es/convertir-webp-a-jpg/): Las imágenes que guarda la web, en el formato que todos siguen aceptando.
- [PNG a WebP](https://abox.tools/es/convertir-png-a-webp/): La misma imagen, a menudo un tercio más pequeña, con la transparencia intacta.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El archivo lo descodifica, lo comprime y lo mide tu propio navegador, en tu propio hardware, con los codificadores JPEG, PNG y WebP que ya trae de serie. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Además, la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, y ninguna de ellas es de este sitio.

### ¿Cómo cumple un límite de tamaño?

Codifica y mide varios candidatos y busca la mayor calidad que quepa. Si puede producir un archivo válido, queda igual o por debajo del objetivo, no necesariamente con los bytes exactos indicados. Un archivo ya bajo el límite sigue intacto. Si bajar la calidad no basta, reduce las dimensiones; revisa el resultado.

### ¿Qué significa aquí exactamente «pérdida mínima»?

Tres cosas concretas. La primera, que una imagen que ya está por debajo de tu objetivo pasa byte a byte, sin volver a codificarse. La segunda, que primero se gasta calidad y solo después resolución, y únicamente hasta el suelo en el que los artefactos de compresión empiezan a notarse; por debajo de ahí la herramienta hace la foto más pequeña y vuelve a subir la calidad, porque menos píxeles buenos se ven mejor que más píxeles estropeados. Y la tercera, que en cuanto encuentra un resultado que cabe, la búsqueda vuelve a subir hasta agotar el presupuesto, de modo que no acabas con un archivo de 300 KB habiendo pedido 500 KB.

### ¿Qué son las cifras SSIM y PSNR de cada resultado?

Son la medida de lo que ha costado la compresión. Se obtienen descodificando el resultado y comparándolo con la foto original. El SSIM compara brillo, contraste y estructura locales, que se parece mucho más a lo que le molesta al ojo que contar píxeles cambiados; por encima de 0,98 cuesta distinguirlas aunque las pongas una al lado de la otra. El PSNR es la cifra clásica en decibelios. Las dos se calculan en tu dispositivo y las dos se muestran, para que lo de la pérdida baja se pueda comprobar en lugar de creerse sin más.

### ¿Qué formatos puede leer y escribir?

Lee imágenes que tu navegador pueda decodificar, incluidas JPEG, PNG, WebP, GIF, BMP y AVIF. Las nuevas codificaciones usan JPEG, PNG o WebP. Los archivos que ya están por debajo del tamaño objetivo se devuelven intactos, con su formato y metadatos originales. Cuando hace falta codificar, Automático empieza con el formato original si el navegador puede escribirlo; en caso contrario, GIF empieza como PNG y AVIF, BMP o un tipo MIME desconocido como JPEG. Después puede elegir WebP si alcanza el objetivo con menos pérdida visible.

### ¿Por qué no puede comprimir mucho un PNG?

Porque el PNG no tiene pérdidas y no hay ningún control de calidad que bajar. La única manera de hacer un PNG más pequeño es darle menos píxeles o menos colores, así que con PNG seleccionado la herramienta llega al objetivo solo a base de redimensionar. Si la imagen es una fotografía, JPEG o WebP se acercarán mucho más a tu objetivo con una calidad que se ve perfectamente bien. Y si es un logotipo o una captura con transparencia, el WebP conserva esa transparencia que el JPEG rellenaría de blanco.

### ¿Comprimir una imagen le quita los datos EXIF y GPS?

Un resultado recodificado omite el EXIF, GPS, fechas y demás metadatos originales porque el lienzo solo guarda píxeles. Un archivo que ya está por debajo del tamaño objetivo se devuelve intacto, con sus metadatos. [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) lee y edita metadatos JPEG, PNG y WebP sin recodificar sus imágenes. Para AVIF muestra el EXIF disponible como solo lectura y limpia convirtiendo la primera imagen decodificada a un PNG nuevo; el color o el HDR pueden cambiar.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagándolos: el trabajo lo hace tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera para comprimirlas se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **El procesamiento se hace en este navegador.** La herramienta procesa entradas y resultados en el navegador. Su código no los sube para procesarlos. Content-Security-Policy limita recursos y destinos, pero los hosts permitidos pueden recibir solicitudes: no inspecciona sus datos ni prueba por sí sola que nada se envíe. Compara código y solicitudes de la operación concreta o complétala desconectado.
- **Aquí nada le pide nada a la red.** En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. La compresión es `canvas.toBlob`, o sea, el codificador que ya viene instalado en el navegador.
- **Las cifras se miden, no se mandan.** Los tamaños, el valor de calidad y la comparación SSIM se calculan en esta misma página y se te enseñan. En este repositorio no hay ningún evento de analítica propio que lleve un nombre de archivo, un tamaño, un recuento o un resultado.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tus fotos. Cada línea que lee, comprime o mide un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/compress.js` para la búsqueda que decide cuánta calidad se gasta, y `src/measure.js` para la comparación que hay detrás de la cifra de «coincidencia visual».
