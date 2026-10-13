# AVIF a JPG — abre esa imagen que no puedes abrir

El formato que guardan las webs, convertido al que siempre se ha aceptado.

> Convierte AVIF a JPG en el navegador. Ya incluye el decodificador: no se sube nada, no hace falta cuenta y funciona sin conexión. Elige el color que sustituirá la transparencia.

Esta es una herramienta interactiva de navegador en https://abox.tools/es/convertir-avif-a-jpg/. Los archivos se procesan en el dispositivo donde se ejecuta ese navegador. La página explica las funciones opcionales de red y los envíos deliberados. Lo que sigue es su explicación escrita; abre la dirección para usarla.

## Tus imágenes se **procesan en tu navegador**. No se suben para procesarlos.

La conversión ocurre en el navegador y en tu dispositivo. No hay que descargar un decodificador ni esperar: el navegador lee AVIF desde 2021, por eso esa imagen que otros programas rechazan se ve bien en una pestaña. Esta página usa ese decodificador, dibuja la imagen y escribe un JPEG. No tiene funciones de red ni un servidor al que enviar una foto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir AVIF a JPG

1. **Elige los archivos AVIF.** Suéltalos en el selector o búscalos. Se reconocen por sus primeros bytes, no por el nombre: un AVIF renombrado sigue funcionando y un PNG se rechaza con un mensaje que indica su formato real.
2. **Elige la calidad y el color de fondo para la transparencia.** El control empieza en 92, donde una foto resulta difícil de distinguir del original. El campo de color solo aparece si algún archivo tiene transparencia, porque el JPEG debe rellenarla.
3. **Pulsa “Convertir” y descarga.** Cada resultado indica el archivo de origen, su tamaño y la diferencia. Suele pesar bastante más: AVIF comprime mejor y aquí cambias tamaño por compatibilidad. Un archivo tiene botón de descarga; varios también permiten descargar un ZIP.

## La versión larga

[El archivo que casi nada abre, salvo el navegador donde lees esto](https://abox.tools/es/guias/convertir-avif-a-jpg/): ¿Guardaste una imagen y recibiste un .avif que ningún programa abre? El navegador sí lo lee. Qué es AVIF, qué no puede conservar un JPEG, por qué ocupa más y cómo convertirlo sin subirlo.

## También en la caja

- [Creador de fotos de carnet](https://abox.tools/es/foto-carnet/): Elige un país y documento compatibles. Se distinguen los requisitos y las orientaciones.
- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.
- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.
- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El navegador lee, decodifica y escribe el archivo en tu dispositivo. La herramienta no pide ni envía nada por la red. La `Content-Security-Policy` enumera todas las direcciones permitidas y ninguna pertenece a este sitio. Ni siquiera hay un decodificador que cargar: ya está en el navegador.

### ¿Por qué ningún programa de mi dispositivo abre este archivo?

Porque AVIF es reciente para muchos programas. Las webs lo usan porque pesa mucho menos que JPEG a igual calidad. Al guardar una imagen recibes un `.avif`, pero el programa donde intentas abrirlo puede ser anterior al formato. Windows necesita una extensión; algunos editores, lectores electrónicos, impresoras y formularios no lo admiten. El navegador sí lo lee, por eso la imagen pudo llegar a ti y esta página puede convertirla.

### ¿El JPG pesará más que el AVIF?

Casi siempre, a menudo varias veces más. El resultado muestra cuánto. AVIF es un códec moderno y eficiente; JPEG es mucho más antiguo. Un AVIF de 40 KB puede convertirse en un JPEG de 200 KB con calidad visible similar. Cambias tamaño por compatibilidad. Si necesitas reducirlo después, el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) permite fijar un tamaño objetivo.

### ¿Qué pasa con la transparencia?

Se rellena con el color que elijas, y la página lo avisa antes de convertir. AVIF tiene canal alfa y JPEG no, así que no puede conservarse: decides qué color poner debajo. La mayoría de los AVIF son fotos opacas y el campo no aparece. Para conservar transparencia, conviértelo a PNG o WebP con el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que lee AVIF y escribe ambos formatos.

### ¿Qué pasa con HDR y el color de diez bits?

Esta herramienta escribe un JPEG SDR convencional de 8 bits desde el canvas del navegador. No conserva la profundidad adicional ni la información HDR del AVIF; los colores o brillos pueden cambiar. Guarda el original para archivar. Existen formatos HDR basados en JPEG: [la especificación Ultra HDR de Android](https://developer.android.com/media/platform/hdr-image-format) describe un mapa de ganancia que esta herramienta no crea.

### ¿Se vuelve a comprimir la imagen?

Sí, es inevitable. AVIF y JPEG son códecs distintos: hay que decodificar y volver a codificar. Todos los conversores lo hacen, también los que exigen subir el archivo. Puedes elegir la calidad; el valor inicial de 92 hace que una foto sea difícil de distinguir del original.

### ¿Se puede convertir al revés, de JPG a AVIF?

Aquí no. Esta herramienta usa el codificador de canvas del navegador y no incluye un codificador AVIF. Un tipo de salida no admitido vuelve a PNG; cambiar la extensión no crea un AVIF. Otras herramientas pueden codificar AVIF localmente con un codificador aparte, sin subir archivos. [Las reglas de salida de canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) explican el comportamiento.

### ¿Conserva la fecha, la cámara y la ubicación?

No. La imagen se dibuja en un lienzo que solo guarda píxeles; EXIF, GPS, perfiles de color y XMP quedan fuera. Las imágenes de una web no suelen tener esos datos. Para verlos o editarlos sin recomprimir la imagen, usa el [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/).

### ¿Puedo convertir una carpeta entera?

Sí. Añade los archivos que quieras. No hay límite de cantidad ni de tamaño porque no hay un servidor que los procese. Cada archivo tiene su fila y su descarga; con dos o más también puedes llevarte un ZIP.

### ¿Es gratis y funciona sin conexión?

Sí: sin cuenta, inicio de sesión, prueba ni marca de agua. La publicidad paga el sitio y no recibe información sobre tus imágenes. Carga la página una vez y desconéctate: seguirá funcionando igual. También es una comprobación directa de que no se sube nada.

## Cómo se comprueba la promesa de privacidad

- **El procesamiento se hace en este navegador.** La herramienta procesa entradas y resultados en el navegador. Su código no los sube para procesarlos. Content-Security-Policy limita recursos y destinos, pero los hosts permitidos pueden recibir solicitudes: no inspecciona sus datos ni prueba por sí sola que nada se envíe. Compara código y solicitudes de la operación concreta o complétala desconectado.
- **El decodificador ya está en el navegador.** Un AVIF que no se abre en el visor de fotos sí se abre en una pestaña: Chrome y Firefox lo leen desde 2021 y Safari desde 2023. Esta página añade un botón para guardar a ese decodificador: abre el archivo, lo dibuja y escribe un JPEG. No hay motor que descargar ni espera en la primera conversión, y no hace falta un servidor. Es lo que no explican los conversores que te piden subirlo.
- **Las partes transparentes y el color que las sustituye.** AVIF admite un canal alfa; JPEG no. Hay que colocar un color debajo. Aquí eliges cuál, con blanco como valor inicial. El campo solo aparece si se detecta transparencia en los píxeles decodificados de algún archivo. La mayoría de los AVIF guardados de webs son fotos opacas, por eso normalmente no hace falta mostrarlo.
- **Lo que esta conversión no conserva.** Esta herramienta escribe un JPEG SDR convencional de 8 bits desde el canvas del navegador. No conserva la profundidad adicional ni la información HDR del AVIF; los colores o brillos pueden cambiar. Guarda el original para archivar.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google, y el botón de donación, de Buy Me a Coffee. No reciben información sobre tus imágenes. Todo el código que lee, decodifica o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Carga la página una vez y desconéctate: funciona igual. Es la comprobación más sencilla. Un conversor que enviara tus imágenes a otro lugar no podría hacerlo.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/shared/image-convert.js` para la conversión: identifica el formato real, decodifica la imagen y la dibuja en el lienzo del que sale el JPEG. Es el mismo archivo que usan los otros dos conversores y no contiene ningún códec.
