# WebP a JPG — convierte sin subir nada

Las imágenes que guarda la web, en el formato que todos siguen aceptando.

> Convierte WebP a JPG en el navegador. Ya incluye el decodificador: no se sube nada, no hace falta cuenta y funciona sin conexión. Elige el color que sustituirá la transparencia.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-webp-a-jpg/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

La conversión ocurre en el navegador y en tu dispositivo. No hay decodificador que descargar ni motor que esperar: los navegadores leen WebP desde 2020 y escriben JPEG desde mucho antes. Todo lo necesario ya estaba en el dispositivo. La página no tiene funciones de red ni un servidor al que enviar una imagen.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir WebP a JPG

1. **Elige los archivos WebP.** Suéltalos o búscalos. Se identifican por sus primeros bytes, no por el nombre: un WebP llamado “.jpg” funciona; un PNG se rechaza indicando su formato real, en lugar de generar una copia innecesaria.
2. **Lee la información de cada archivo.** La lista muestra tamaño y dimensiones, y avisa si el WebP es sin pérdida, tiene transparencia o es animado. Cada aviso solo aparece cuando corresponde.
3. **Elige la calidad y el color que sustituirá la transparencia.** El control empieza en 92, donde una foto resulta difícil de distinguir del original. El campo de color solo aparece si algún archivo tiene transparencia, porque el JPEG debe rellenarla.
4. **Pulsa “Convertir” y descarga.** Cada resultado indica el origen, el tamaño nuevo y la diferencia. También avisa si se rellenó la transparencia o solo se guardó el primer fotograma. Un archivo tiene botón de descarga; varios también permiten un ZIP.

## La versión larga

[La imagen que guarda la web y el formato que casi todo acepta](https://abox.tools/es/guias/convertir-webp-a-jpg/): ¿Guardaste una imagen y recibiste un .webp que otros programas no abren? Qué es WebP, por qué convertirlo suele aumentar el tamaño, qué ocurre con la transparencia y cómo hacerlo sin subir nada.

## También en la caja

- [PNG a WebP](https://abox.tools/es/convertir-png-a-webp/): La misma imagen, a menudo un tercio más pequeña, con la transparencia intacta.
- [AVIF a JPG](https://abox.tools/es/convertir-avif-a-jpg/): El formato que guardan las webs, convertido al que siempre se ha aceptado.
- [Creador de fotos de carnet](https://abox.tools/es/foto-carnet/): Elige el país. Aplica esa norma, exactamente.
- [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El navegador lee, decodifica y escribe el archivo en tu dispositivo. La herramienta no pide ni envía nada por la red. La `Content-Security-Policy` enumera las direcciones permitidas y ninguna pertenece a este sitio. A diferencia del conversor HEIC, ni siquiera necesita cargar un decodificador: ya está en el navegador.

### ¿Para qué convertir WebP a JPG?

Para usarlo en programas que aún no admiten WebP. Es un formato pequeño y habitual al guardar imágenes de la web, pero versiones antiguas de Office y Photoshop, algunos estudios de impresión, formularios que miran la extensión, lectores electrónicos y programas de cámaras o impresoras pueden rechazarlo. JPG tiene una compatibilidad mucho más amplia.

### ¿Qué pasa con las partes transparentes?

Se rellenan con el color que elijas y se avisa antes de convertir. JPEG no tiene canal alfa: la transparencia no puede conservarse. Blanco es el valor inicial porque suele servir para un logotipo en un documento. Si necesitas conservarla, guarda el WebP o conviértelo a PNG con el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que escribe PNG, WebP y JPEG.

### ¿Convierte un WebP animado?

Convierte el primer fotograma y lo avisa tanto antes como después. JPEG solo contiene una imagen. Para extraer todos los fotogramas o convertir la animación a vídeo, puedes usar [Separar un GIF](https://abox.tools/es/separar-gif-en-fotogramas/) y [GIF a MP4](https://abox.tools/es/convertir-gif-a-mp4/) una vez que la animación esté en formato GIF.

### ¿Se vuelve a comprimir la imagen?

Sí. WebP y JPEG son códecs distintos, así que hay que decodificar y volver a codificar. Todos los conversores lo hacen, incluidos los que piden subir el archivo. El control empieza en 92, donde una foto es difícil de distinguir del original. Si el WebP era sin pérdida, el JPEG será su primera copia con pérdida; la lista lo avisa para que puedas decidir.

### ¿El JPG pesará más que el WebP?

A menudo sí, y el resultado muestra cuánto. WebP comprime mejor que JPEG con calidad visual similar, por eso se usa tanto en la web. Cambias tamaño por compatibilidad. Si después necesitas reducirlo, el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) permite fijar el tamaño objetivo.

### ¿Conserva la fecha, la cámara y la ubicación?

No. El lienzo solo guarda píxeles: EXIF, GPS, perfiles de color y XMP quedan fuera. Muchos WebP de la web ya vienen sin esos datos. Para verlos o editarlos sin recomprimir la imagen, usa el [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/).

### ¿Puedo convertir una carpeta entera?

Sí. No hay límite de cantidad ni tamaño porque no hay un servidor que los procese. Cada archivo tiene su fila y descarga; con dos o más también puedes descargar un ZIP. Si se repiten nombres, se añade un número antes de la extensión para no reemplazar ninguno.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis: sin cuenta, inicio de sesión, prueba ni marca de agua. La publicidad paga el sitio y no recibe información sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate: seguirá funcionando igual. Es una comprobación directa de que no se sube nada. Un conversor que enviara los archivos a un servidor dejaría de funcionar sin red.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **El decodificador ya está instalado; no hace falta un servidor.** Los navegadores publicados desde 2020 leen WebP y escriben JPEG desde mucho antes. Esta herramienta no incluye un motor ni descarga nada al estrenarse. No necesita un servidor, aunque otros conversores pidan subir el archivo. El [conversor HEIC](https://abox.tools/es/convertir-heic-a-jpg/) sí incluye un códec, porque solo Safari abre ese formato de forma nativa, y lo explica en su página.
- **Las partes transparentes y el color que las sustituye.** WebP admite transparencia y JPEG no tiene canal alfa, así que hay que poner un color debajo. Aquí lo eliges, con blanco por defecto. Solo se pregunta si los píxeles decodificados tienen transparencia; no se supone por el formato. Un conversor que no pregunta puede elegir negro, de donde salen esos logotipos con fondo negro.
- **Lo que el lienzo no conserva.** La imagen se decodifica y dibuja en un lienzo que solo guarda píxeles. EXIF, perfiles ICC, XMP y bloques de derechos de autor se pierden. Para algunas personas es útil y para otras supone una pérdida, por eso se avisa. Para consultar o editar metadatos sin recomprimir, usa el [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/).
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google, y el botón de donación, de Buy Me a Coffee. No reciben información sobre tus imágenes. Todo el código que lee, decodifica o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Carga la página una vez y desconéctate: funciona igual. Es la comprobación más sencilla. Un conversor que enviara tus imágenes a otro lugar no podría hacerlo.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, y `src/shared/image-convert.js` para la conversión: identifica el formato real, decodifica la imagen y la dibuja en el lienzo del que sale el JPEG. Es el mismo archivo de los otros dos conversores: unas trescientas líneas sin ningún códec.
