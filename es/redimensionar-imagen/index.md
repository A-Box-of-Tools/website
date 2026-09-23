# Redimensionar imagen — redimensionar, recortar y convertir

Di el tamaño. Dibuja la caja. Elige el formato.

> Redimensiona, recorta y convierte imágenes JPEG, PNG y WebP dentro del navegador. Píxeles exactos, un porcentaje o un lado largo, para una imagen o para una carpeta entera. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/redimensionar-imagen/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

El redimensionado, el recorte y el cambio de formato ocurren dentro de tu navegador, en tu propio hardware, con los codificadores de imagen que ya trae de serie. Esta herramienta no tiene ninguna función de red: no descarga nada y no envía nada. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una foto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo redimensionar una imagen sin subirla

1. **Elige tus imágenes.** Arrástralas hasta el selector o búscalas a mano. El navegador las lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Recorta, si te apetece.** La caja empieza sobre la foto entera, así que si la dejas en paz no recorta nada. Arrástrala, o fíjala a una forma, sea 1:1 para una foto de perfil, 9:16 para una historia o 16:9 para una miniatura, y pulsa «Lo más grande» para la mayor que quepa. Cada imagen conserva su propia caja: haz clic en cualquier fila de la lista para dibujar sobre esa. Y si todas tienen que quedar encuadradas igual, hay también un botón para eso.
3. **Di de qué tamaño tiene que salir.** Un ancho, un alto o los dos. También un lado largo, que deja las fotos verticales y las horizontales del mismo tamaño entre sí, o un porcentaje pelado. Si dejas una de las dos casillas en blanco, la foto conserva su propia forma.
4. **Elige el formato y pulsa el botón.** Puedes conservar el formato con el que llegó cada archivo, o escribirlo todo como JPEG, PNG o WebP. Cada resultado dice en qué se ha convertido y cuánto ha encogido. Haz clic en uno para abrirlo a tamaño completo, con todas sus cifras detrás y el original al lado para comparar. Un lote baja como un solo zip.

## La versión larga

[Cómo redimensionar una imagen sin destrozarla](https://abox.tools/es/guias/redimensionar-una-imagen/): Qué le pasa a una foto cuando le cambias las dimensiones en píxeles: por qué encogerla no tiene riesgo y agrandarla sí, qué hacer cuando la caja tiene otra forma, y cuándo lo que toca es recortar.

## También en la caja

- [HEIC a JPG](https://abox.tools/es/convertir-heic-a-jpg/): Las fotos que hace un iPhone, en un formato que abre todo el mundo.
- [Creador de fotos de carnet](https://abox.tools/es/foto-carnet/): Elige el país. Aplica esa norma, exactamente.
- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.
- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. Tu propio navegador descodifica, recorta, escala y escribe el archivo en tu propio hardware, con los codificadores JPEG, PNG y WebP que ya trae de serie. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio.

### ¿Qué pasa si le doy un ancho pero no un alto?

El alto sale de la propia forma de la foto, que es casi siempre lo que querías: «1920 de ancho» significa «1920 de ancho y el alto que salga». Si rellenas los dos, los dos pueden discrepar de la forma de la foto, y esa es la única vez que aparece la opción «si las formas no coinciden», con sus cuatro salidas: encajar dentro de la caja, llenarla y cortar lo que sobre, rellenar con un fondo, o estirar y aceptar la deformación.

### ¿Redimensionar una imagen hace perder calidad?

Hacer una foto más pequeña, no, al menos de ninguna forma que puedas ver: entran más píxeles de los que salen, así que el detalle que se conserva es detalle de verdad. Hacer una más grande no puede añadir lo que nunca se fotografió, y lo que sale es una copia más blanda de la misma foto, no una más nítida. Por eso viene activado «no agrandar nunca una foto más de lo que empezó». Lo que sí cuesta algo es la recodificación posterior, si el formato es JPEG o WebP, y el control de calidad es lo que gastas ahí.

### ¿Puedo recortar cada imagen de forma distinta?

Sí, y es lo que hace por defecto. Cada imagen de la lista lleva su propia caja, en sus propios píxeles, y al hacer clic en una fila esa imagen vuelve a la vista previa con su caja y su forma fijada. Nada de lo que le hagas a una afecta a otra. Además, todas las cajas empiezan sobre la foto entera, así que una imagen sobre la que nunca dibujes no se recorta en absoluto.

### ¿Puede recortar un lote entero igual de una vez?

Sí, con el botón que hay debajo de la vista previa. Le da a todas las demás imágenes la misma zona relativa, es decir, las mismas fracciones de su propio ancho y alto, lo que en un conjunto de capturas o exportaciones del mismo tamaño es exactamente la misma caja, y la página lo dice. Con una forma fijada, le da a cada una la mayor caja de esa forma que quepa dentro de esa zona, así que pulsar 1:1 y luego ese botón te saca cuadrados de una carpeta con fotos verticales y horizontales mezcladas. Después, todas las cajas siguen siendo editables.

### ¿Qué formatos puede leer y escribir?

Lee todo lo que el navegador sepa descodificar, que en la práctica son JPEG, PNG, WebP, GIF, BMP y, en casi todos los navegadores actuales, AVIF. Escribe JPEG, PNG y WebP, que son los codificadores que traen los navegadores. Con «conservar el formato», un JPEG sigue siendo un JPEG y un PNG sigue siendo un PNG; y lo que el navegador no sabe escribir, como un GIF o un BMP, sale como PNG, que es el que conserva intactos la transparencia y el color plano.

### ¿Qué pasa con la transparencia si guardo como JPEG?

Se rellena con el color de fondo, porque el JPEG no tiene canal alfa donde guardarla. El color lo eliges tú y empieza en blanco, que es lo que quiere casi todo el mundo y lo que hace casi cualquier otra herramienta sin decírtelo. El mismo color se usa detrás de un marco rellenado. Guarda como PNG o WebP y la transparencia pasa intacta.

### ¿Quita los datos EXIF y GPS?

De todo lo que procesa de verdad, sí, y de rebote: recortar o redimensionar consiste en descodificar la foto a píxeles y volver a codificar esos píxeles, y un lienzo lleno de píxeles no lleva etiquetas, así que la ubicación, el modelo de cámara y las marcas de tiempo sencillamente no se escriben en el archivo nuevo. Un archivo que no le estás cambiando nada es otro caso: se devuelve byte por byte, con etiquetas y todo. Si lo que quieres es quitar los metadatos sin tocar la foto, tienes el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/), que reescribe el contenedor sin volver a comprimir nada.

### ¿En qué se diferencia esto del compresor de imágenes?

Esta va de dimensiones: dices cuántos píxeles quieres y te los da. El [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) va de tamaño de archivo: dices cuántos kilobytes tienes permitidos y busca la calidad más alta que cabe, redimensionando solo si la calidad por sí sola no llega. Si te han dicho «1200 píxeles de ancho», estás en el sitio correcto. Si te han dicho «por debajo de 500 KB», la otra te dejará más cerca.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagándolos: el trabajo lo hace tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera para redimensionarlas se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. El redimensionado son un `drawImage` sobre un lienzo y un `canvas.toBlob`, o sea, el escalador y el codificador que ya vienen instalados en el navegador.
- **Un archivo que nadie ha pedido cambiar no se cambia.** Sin recorte, sin redimensionado y sin cambio de formato, el archivo que elegiste se te devuelve byte por byte en lugar de volver a guardarse. Y no es cortesía: es la razón de que esta herramienta no pueda recodificarte una foto sin decir nada, ni tirarle los metadatos a una que solo querías mirar.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tus fotos. Cada línea que lee, recorta, escala o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/geometry.js` para la aritmética que decide qué se conserva y de qué tamaño sale, y `src/codecs.js` para la única llamada a `drawImage` que hace el recorte y el redimensionado a la vez.
