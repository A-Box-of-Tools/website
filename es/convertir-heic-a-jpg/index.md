# HEIC a JPG — convertir fotos de iPhone

Las fotos que hace un iPhone, en un formato que abre todo el mundo.

> Convierte en JPG las fotos HEIC de un iPhone, dentro del navegador. El descodificador funciona en tu dispositivo: no se sube nada, no hay cuenta, va sin conexión, y la fecha y los datos de la cámara pueden venirse contigo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-heic-a-jpg/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus fotos **nunca se suben**. No hay ningún servidor.

La descodificación ocurre dentro de tu navegador, en tu propio hardware. El HEIC es el único formato de imagen que un navegador no abre por su cuenta, así que esta página se trae el descodificador consigo: 1,4 MB, servidos desde este sitio y guardados en caché a partir de la primera visita. Ahí está la razón entera de que todos los demás convertidores de HEIC te pidan subir algo. Ellos ponen el códec en un servidor y tus fotos tienen que ir hasta allí; este lo pone aquí. En esta página no hay ninguna función de red, ni ningún servidor al otro lado al que mandar una foto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir fotos HEIC a JPG

1. **Elige tus fotos HEIC.** Arrástralas hasta el selector o búscalas a mano, directamente en una copia de seguridad del móvil o en una carpeta del escritorio. El navegador las lee del disco, y mientras lo haces no sale nada hacia ninguna parte. La lista te dice qué es cada una y qué lleva dentro.
2. **Comprueba qué llevan las fotos.** Cada fila te dice la fecha en que se tomó, la cámara y, en verde porque es la parte que conviene ver, si el archivo lleva coordenadas GPS. Eso se lee del contenedor sin descodificar la imagen, así que no cuesta nada y aparece al momento.
3. **Elige un formato y decide sobre los datos.** JPEG, salvo que tengas un motivo para otra cosa: es el formato que se abre en todas partes, que es el sentido entero de convertir. El control de calidad viene en 92, que es el ajuste en el que una fotografía cuesta distinguirla del original. La casilla decide si la fecha, la cámara y la ubicación se vienen contigo.
4. **Pulsa «Convertir» y descarga.** El descodificador llega con la primera conversión, 1,4 MB una sola vez, y a partir de ahí cada foto se descodifica y se escribe en tu propio dispositivo. Con un archivo tienes un botón de descarga; con varios tienes además un zip.

## La versión larga

[La foto que guardó tu móvil, y el formato que no abre nada](https://abox.tools/es/guias/convertir-heic-a-jpg/): Los iPhone guardan las fotos como HEIC, y media internet no sabe abrir una. Qué es el formato, por qué solo Safari lo descodifica, qué le cuesta a la imagen convertirla, y cómo hacerlo sin subirle las fotos a nadie.

## También en la caja

- [Creador de fotos de carnet](https://abox.tools/es/foto-carnet/): Elige el país. Aplica esa norma, exactamente.
- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.
- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.
- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.

## Preguntas

### ¿Se sube mi foto a alguna parte?

No. El archivo lo lee, lo descodifica y lo escribe tu propio navegador, en tu propio hardware. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Lo único que sí se carga es el propio descodificador, que viene de este sitio, una vez, antes de que tu foto entre siquiera en la ecuación.

### ¿Por qué esta página se descarga 1,4 MB la primera vez?

Porque el HEIC es el único formato de imagen que un navegador no abre. Es un fotograma HEVC dentro de un contenedor de cajas, y solo Safari, sobre hardware de Apple, tiene un descodificador para él; Chrome, Firefox y Edge rechazan el archivo sin más. Así que un convertidor de HEIC necesita un descodificador de alguna parte, y solo hay dos sitios de donde puede venir: un servidor o la página. Todos los demás eligieron el servidor, y justo por eso todos necesitan que subas tus fotos. Este se trae `libheif` compilado a WebAssembly. Se sirve desde este sitio, se guarda en caché tras la primera visita, y es el precio entero de que tus fotos no vayan a ninguna parte.

### ¿El JPEG conserva la fecha, la cámara y la ubicación?

Si tú quieres, y es una casilla de la página. Si la dejas activada, el bloque EXIF se copia del HEIC y se escribe en el JPEG tal como lo escribió el móvil, así que la foto convertida se te sigue ordenando por el día en que se tomó y no por el día en que la convertiste, que es la queja habitual con los convertidores de HEIC. Se cambia una etiqueta, y solo una: la orientación, que se pone en «derecha», porque la rotación ya está aplicada a los píxeles y un visor que volviera a aplicarla te pondría de lado todas las fotos verticales. Desmarca la casilla y el JPEG sale con la imagen y nada más.

### ¿Quita las coordenadas GPS?

Te avisa de que están ahí y luego hace lo que le pidas. La fila de cada foto dice si el archivo lleva coordenadas antes de que conviertas nada, que es más de lo que hace el móvil. Si desmarcas «conservar la fecha, la cámara y los ajustes», se quedan fuera del JPEG junto con todo lo demás; y si la dejas marcada, se trasladan. Si lo que quieres es repasar las etiquetas con detalle, o quitárselas a fotos que ya son JPEG, la herramienta para eso es el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/), que además lo hace sin volver a comprimir la imagen.

### ¿Se vuelve a comprimir la imagen?

Sí, y no queda otra: HEIC y JPEG son códecs distintos, así que no hay forma de pasar de uno a otro sin descodificar la imagen y volver a codificarla. Lo que sí puedes controlar es cuánto cuesta eso. El control de calidad viene en 92, donde una fotografía es muy difícil de distinguir del original, y tienes PNG en el menú para cuando no quieras ninguna pérdida y no te importe que el archivo ocupe de cinco a diez veces más.

### ¿Y si el archivo se llama .jpg pero en realidad es un HEIC?

Funciona igual. Todo archivo que sueltes aquí se identifica por sus primeros bytes y no por su nombre, porque el nombre es lo que decidiera ponerle la última aplicación que tocó el archivo. De hecho, un HEIC que llegó llamándose «.jpg» es una de las formas más habituales de acabar buscando una herramienta como esta. Un archivo que sea de verdad un JPEG o un PNG se rechaza con un mensaje que lo dice, en vez de convertirse en una copia de sí mismo.

### ¿Puede convertir una Live Photo o una ráfaga?

Las imágenes fijas que lleve dentro, sí. Un HEIC puede contener más de una imagen, y todas las que contenga se convierten y se nombran a partir del original con un número al final. La mitad de vídeo de una Live Photo es un archivo aparte que el móvil guarda junto al HEIC, así que aquí no está para convertirla. Los mapas de profundidad y las miniaturas sí están en el contenedor, pero no son imágenes que haya pedido nadie, y se dejan en paz.

### ¿Por qué no me acepta un AVIF?

Porque no hay nada que hacerle. El AVIF es el mismo contenedor que el HEIC con AV1 dentro en lugar de HEVC, y cualquier navegador actual lo descodifica de forma nativa, así que un convertidor te estaría mandando un megabyte de motor para resolver un problema que no tienes. Si necesitas un AVIF en JPEG, el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) y el [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) leen AVIF y escriben JPEG con el descodificador que tu navegador ya tiene.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagándolos: el trabajo lo hace tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus fotos.

### ¿Funciona sin conexión?

Sí, descodificador incluido. Carga la página una vez, desconéctate de internet y sigue trabajando con tus fotos exactamente igual que antes. Esa es además la prueba más contundente que hay de que no se sube nada: un convertidor que mandara tus HEIC fuera a descodificar se pararía en cuanto desenchufaras, y este no.

## Cómo se comprueba la promesa de privacidad

- **Tus fotos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **El descodificador vino de aquí, y de aquí no se mueve.** El HEIC es HEVC dentro de un formato de cajas, y ningún navegador salvo Safari sabe descodificarlo, así que esta página distribuye `libheif` compilado a WebAssembly: 1,4 MB, guardados en este repositorio, servidos desde este origen y cacheados por el service worker como cualquier otro archivo de aquí. No se descarga de una CDN, porque eso metería a un tercero en el camino de cada visita y dejaría la herramienta sin funcionar sin conexión. Y el binario va dentro del script, y no al lado, precisamente para que no haga falta ninguna descarga para arrancarlo.
- **Aquí nada le pide nada a la red.** En ningún archivo escrito para esta herramienta hay un `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. El motor incorporado, como toda compilación de Emscripten, trae dentro las rutas de carga que descargarían un `.wasm` desde una URL. No se toman, porque el binario ya está en la mano. Y si se tomaran, `connect-src` solo nombra los destinos de medición de Google, así que el navegador las rechazaría. La prueba es la política, no la promesa.
- **Los metadatos se leen aquí y se te cuentan a ti.** La lista de la página dice lo que lleva cada foto, o sea, la fecha, la cámara y si hay coordenadas GPS dentro. Es información que quizá quieras tener antes de darle el JPEG a alguien. La lee del archivo `src/boxes.js` dentro de este navegador, se muestra en esta página y se escribe en tu JPEG o se queda fuera, exactamente como tú elijas. En este repositorio no hay ningún evento de analítica propio que lleve un nombre de archivo, una fecha, una coordenada o un recuento.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tus fotos. Cada línea que lee, descodifica o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Carga la página una vez, desconéctate de la red y la herramienta sigue igual, porque el descodificador se guarda en caché con ella. Es la prueba más sencilla de todas, y aquí vale más que en ninguna otra parte del sitio: un convertidor que mandara tus fotos fuera a descodificar no tendría manera humana de apañárselas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/heif.js` para ver cómo se carga el descodificador y qué se le permite hacer, `src/boxes.js` para el análisis del contenedor que encuentra los metadatos de la foto, y `src/exif.js` para lo que le pasa a esos metadatos camino de un JPEG. El motor en sí es `vendor/libheif.js`, sin modificar y con su licencia al lado.
