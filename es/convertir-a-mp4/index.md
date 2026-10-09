# Convertir a MP4 — de WebM, MKV y MOV a un formato compatible

La grabación de pantalla, el MKV o el vídeo de cámara, en H.264 y AAC dentro de un MP4. Copia lo compatible y recodifica solo lo necesario.

> Convierte WebM, MKV, MOV o MP4 a MP4 con H.264 y AAC en el navegador. Copia intactas las pistas compatibles y recodifica las demás en tu dispositivo. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-a-mp4/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

El vídeo se lee, separa en pistas y escribe como MP4 en la memoria del dispositivo, con los códecs del navegador y código servido desde aquí. No hay funciones de subida ni un servidor que lo reciba. No hace falta enviar un gigabyte para recibir otro distinto.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo convertir un vídeo a MP4

1. **Elige el vídeo.** Un WebM, MKV, MOV, M4V o MP4 cada vez. El navegador lo lee del disco y muestra duración, tamaño, dimensiones y contenedor.
2. **Lee las dos líneas de información.** Una describe la imagen y otra el sonido. Cada una indica si se copiará intacta o qué códec se usará para recodificarla. El propio archivo decide el proceso. Si el navegador no lee el sonido o prefieres un clip silencioso, marca la opción para omitirlo.
3. **Convierte y lee la comprobación.** Se copia o recodifica cada pista según corresponda, con una barra de avance. Después se reabre el MP4 y se comprueba duración, H.264 y sonido. Puedes reproducirlo desde memoria antes de descargarlo.

## La versión larga

[Cómo convertir un video a un MP4 compatible](https://abox.tools/es/guias/convertir-un-video-a-mp4/): Qué necesita un MP4 para ser compatible, por qué se rechazan WebM, MKV o MOV de iPhone, cuándo la conversión no pierde nada y cuándo vuelve a codificar, y cómo hacerla sin subir el archivo.

## También en la caja

- [Girar vídeo](https://abox.tools/es/girar-video/): Un cuarto de vuelta o media vuelta. Al girar mediante la cabecera, los fotogramas quedan intactos.
- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.
- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.
- [Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.

## Preguntas

### ¿Empeorará la calidad?

Las pistas copiadas no pierden nada: H.264 y AAC pasan byte por byte. Un MKV H.264 genera un MP4 con la misma imagen. VP9, VP8, AV1 o HEVC y audio Opus, Vorbis, MP3 o FLAC se recodifican a una tasa basada en la del original: la pérdida es pequeña, pero existe. Conserva el original en cualquier caso.

### ¿Por qué no conservar HEVC o VP9 en el MP4 si ocupan menos?

Porque se busca compatibilidad. HEVC puede necesitar una licencia ausente en el dispositivo; muchos formularios y programas de correo rechazan VP9 o AV1 en MP4. H.264 y AAC tienen una aceptación mucho mayor. La página avisa del coste de recodificar antes de empezar.

### ¿Conservará el sonido de una grabación de pantalla WebM?

Sí. El navegador suele grabar Opus, que aquí se convierte a AAC a 160 kbit/s. La imagen VP8 o VP9 pasa a H.264. Ambas operaciones ocurren en tu dispositivo, y el resultado se reabre para comprobar duración y sonido.

### ¿Por qué necesita conversión un MOV? ¿No es ya MP4?

Son formatos emparentados. Un MOV con H.264 y AAC se copia en segundos sin recodificar; cambia el contenedor que algunos formularios rechazan. Si el MOV de un iPhone lleva HEVC, la imagen se convierte a H.264 siempre que el navegador pueda decodificarla, algo que no todos los dispositivos permiten.

### ¿Qué archivos admite?

WebM y MKV con VP8, VP9, AV1, H.264 o HEVC y audio Opus, Vorbis, AAC, MP3 o FLAC. MP4, MOV y M4V con H.264, HEVC, VP9 o AV1 y audio AAC. Una imagen que no pueda decodificarse detiene el proceso; un sonido incompatible se omite con un aviso. No lee AVI, WMV, FLV ni MPEG-2.

### ¿Cuánto tarda?

Copiar tarda aproximadamente lo mismo que leer el archivo dos veces, normalmente segundos. Recodificar depende del equipo y su aceleración por hardware; un vídeo 4K largo puede tardar. La barra indica el fotograma actual. Cancelar detiene el proceso y no escribe el resultado.

### ¿Se suben mis vídeos?

No. El navegador lee, decodifica lo necesario y escribe en tu dispositivo. La `Content-Security-Policy` enumera las direcciones permitidas y ninguna pertenece al sitio. Desconéctate para comprobarlo. Evitar la subida también ahorra tiempo con archivos grandes.

### ¿Funciona en el móvil?

Sí, si su navegador puede decodificar y codificar vídeo. El codificador del teléfono suele ser rápido; la memoria es el límite porque el resultado se mantiene completo hasta guardarlo. Corta antes un clip largo con [Cortar vídeo](https://abox.tools/es/cortar-video/) o conviértelo en otro dispositivo con más memoria.

### ¿Hay límite de tamaño y cuesta algo?

El archivo se lee por partes, así que puede ser mayor que la memoria disponible. El resultado sí se mantiene en memoria, y el MP4 generado aquí no puede superar 4 GB. Es gratis, sin cuenta, inicio de sesión ni prueba. La publicidad paga el sitio y no recibe información del vídeo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando, algo que una herramienta que enviara el vídeo a un servidor no podría hacer.

## Cómo se comprueba la promesa de privacidad

- **No hay que esperar a subir el archivo.** Un vídeo suele ser el archivo más grande que intentas mover. Subirlo a un servicio y recibir otra copia puede tardar más que convertirlo. Aquí los códecs del navegador hacen el trabajo y los bytes solo pasan del disco a la memoria y vuelven al disco. La `Content-Security-Policy` enumera todos los destinos permitidos; ninguno pertenece al sitio. Funciona sin red.
- **Qué significa MP4 aquí.** El resultado es imagen H.264 y sonido AAC en un MP4 normal, una combinación ampliamente aceptada por teléfonos, navegadores, chats, correo y formularios. Un MP4 con HEVC, VP9 o AV1 puede rechazarse aunque tenga la extensión correcta. Por eso aquí solo se escribe H.264 y AAC: el objetivo es mejorar la compatibilidad.
- **Copia lo compatible y avisa de lo que recodifica.** Convertir no siempre implica recodificar. Los fotogramas H.264 de un MKV pueden copiarse byte por byte a MP4 sin perder nada; igual que AAC. VP8, VP9 o HEVC, y el sonido Opus o Vorbis, requieren decodificación y nueva codificación. La página decide qué necesita cada pista antes de empezar y lo explica, para que sepas si habrá otra generación de compresión.
- **El resultado se vuelve a abrir y comprobar.** Un MP4 puede abrirse aunque le falte el último segundo o el sonido. Aquí se reabre con el mismo lector para comprobar la duración, el códec H.264 y la pista de audio prevista. Puedes reproducirlo desde memoria antes de guardarlo.
- **Tiempo y memoria necesarios.** Copiar es rápido: se lee la estructura y después los datos al escribir. Recodificar tarda lo que permita el dispositivo; con hardware suele ser menos que la duración del clip, pero sin él un vídeo 4K largo puede tardar bastante. La entrada se lee por partes y puede superar la memoria disponible; el resultado se mantiene completo en memoria hasta descargarlo. Siempre puedes cancelar.
- **Qué formatos admite.** WebM y MKV con VP8, VP9, AV1, H.264 o HEVC, y sonido Opus, Vorbis, AAC, MP3 o FLAC; MP4, MOV y M4V con H.264, HEVC, VP9 o AV1 y sonido AAC. Si el navegador no decodifica la imagen, se indica el códec y se detiene. Si no decodifica el audio, se avisa y se omite. Aquí no se leen AVI, WMV, FLV ni MPEG-2.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben el vídeo, fotogramas, nombre, tamaño, duración ni formato original. Todo el código que lee, codifica y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón de donación lo dibuja un script de cdnjs.buymeacoffee.com, con letras de Google Fonts. Es solo un enlace: no registra la visita ni recibe datos tuyos o de tus vídeos. Solo pasa algo al pulsarlo, cuando abres un sitio ajeno.
- **Funciona sin conexión.** Desconéctate y la página sigue funcionando. Una herramienta que enviara el vídeo a convertir a un servidor se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/plan.js` para decidir qué pistas copiar y recodificar, `src/convert.js` para copiarlas y escribir, y `src/shared/mkv-reader.js` para leer WebM y MKV. Ninguno accede a la red, ni los demás lectores y el escritor.
