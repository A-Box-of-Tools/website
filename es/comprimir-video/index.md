# Comprimir vídeo — hasta un tamaño que puedas enviar

Indica el tamaño máximo. La herramienta calcula los ajustes y mide el resultado antes de entregarlo.

> Reduce un vídeo a menos de 8, 16, 25 o los megabytes que necesites en el navegador. Calcula dimensiones y tasa de bits, codifica y mide. No sube nada y copia el sonido intacto.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/comprimir-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

El vídeo se decodifica, reduce, vuelve a codificar y escribe en la memoria del dispositivo. Lo hacen los códecs del navegador y el código de esta página. No hay funciones de subida ni un servidor que lo reciba. No hace falta enviar un gigabyte para recibirlo más pequeño.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo comprimir un vídeo hasta poder enviarlo

1. **Elige el vídeo.** Un MP4 o MOV cada vez. El navegador lo lee del disco y muestra duración, tamaño, dimensiones y tasa de bits.
2. **Indica el tamaño máximo.** Escribe los megabytes o elige 8, 16, 25, 50, 100, la mitad o una cuarta parte. La línea de abajo muestra las dimensiones, la tasa disponible tras reservar el sonido y el tamaño estimado. Puedes omitir el audio para dedicar todo el espacio a la imagen.
3. **Cambia las dimensiones si lo necesitas.** La herramienta elige un tamaño según el objetivo. Puedes cambiarlo si necesitas texto legible a 1080p o solo ver el clip en un teléfono. Ese tamaño es un máximo: nunca se amplía la imagen original.
4. **Comprime y revisa la medición.** La imagen se decodifica, reduce y codifica fotograma a fotograma con una barra de avance. Después se mide el archivo y se reabre para comprobar la duración. Si supera el objetivo, se intenta una segunda pasada más ajustada. Puedes reproducir el resultado desde memoria antes de descargarlo.

## La versión larga

[Cómo comprimir un video para poder enviarlo](https://abox.tools/es/guias/comprimir-un-video/): Qué pierde un video al ajustarse a un límite de tamaño, en qué se gastan los megabytes, por qué conviene reducir las dimensiones antes de perder nitidez y cómo hacerlo en el navegador sin subir el archivo.

## También en la caja

- [Conversor a MP4](https://abox.tools/es/convertir-a-mp4/): La grabación de pantalla, el MKV o el vídeo de cámara, en H.264 y AAC dentro de un MP4. Copia lo compatible y recodifica solo lo necesario.
- [Girar vídeo](https://abox.tools/es/girar-video/): Un cuarto de vuelta o media vuelta. Al girar mediante la cabecera, los fotogramas quedan intactos.
- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.
- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.

## Preguntas

### ¿Cuánto se puede reducir un vídeo?

Hasta donde permita mantener una imagen reconocible, y la página avisa si el objetivo es demasiado pequeño. El audio se copia y conserva su tamaño, aproximadamente un megabyte por minuto en estéreo habitual. La imagen necesita al menos unos cientos de kilobits por segundo incluso con dimensiones pequeñas. Omitir el sonido deja más espacio a la imagen.

### ¿Por qué cambiaron las dimensiones?

Una tasa de bits solo tiene sentido respecto al número de píxeles. Dos megabits por segundo pueden servir a 720p y verse borrosos a 4K. La herramienta reduce las dimensiones hasta repartir suficientes bits por fotograma. Una imagen pequeña y clara suele ser mejor que una grande y borrosa. Se avisa antes de empezar y puedes elegir el tamaño.

### ¿Empeorará la calidad?

Sí. La imagen se recodifica a menor tasa, con otra generación de compresión. El sonido no cambia. Un clip de 900 MB reducido a 25 MB pierde mucho más detalle que uno reducido a la mitad. La página muestra las dimensiones y la tasa para que puedas valorar la diferencia.

### ¿Qué formato genera?

MP4 con vídeo H.264 y la pista de audio copiada intacta. Se elige por su amplia compatibilidad. No genera WebM, HEVC ni AV1, que pueden ocupar menos pero no todos los destinatarios podrán abrir.

### ¿Qué archivos admite?

MP4 y MOV con H.264, HEVC, VP9 o AV1 si el navegador los decodifica. HEVC necesita soporte en el dispositivo. Aún no admite WebM, MKV ni AVI; se avisa claramente al elegirlos.

### ¿Cuánto tarda?

Depende del codificador del dispositivo. Con hardware, un minuto de 1080p suele tardar menos de un minuto; sin él, más. Un clip 4K largo puede tardar bastante. La barra indica el fotograma actual; cancelar detiene el proceso sin escribir el resultado.

### ¿Por qué hizo dos pasadas?

La tasa solicitada es aproximada y un vídeo complejo puede superarla. Se deja margen y se mide el resultado. Si pesa demasiado, se calcula otra tasa según la desviación y se codifica de nuevo. Se hacen hasta dos pasadas y la página indica si necesitó la segunda.

### ¿Se suben mis vídeos?

No. El navegador lee, decodifica, codifica y escribe en tu dispositivo. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Desconéctate para comprobarlo. Evitar la subida suele ahorrar más tiempo que la propia codificación.

### ¿Funciona en el móvil?

Sí, si su navegador codifica vídeo. El hardware del teléfono suele ser rápido, pero dispone de menos memoria para guardar el resultado. Corta antes un clip largo con [Cortar vídeo](https://abox.tools/es/cortar-video/) o usa un dispositivo con más memoria.

### ¿Hay límite de tamaño y cuesta algo?

No hay un límite de entrada fijado: se lee por partes. El resultado se mantiene en memoria hasta descargarlo, así que depende del dispositivo; unos cientos de megabytes suelen ser manejables. Es gratis, sin cuenta, inicio de sesión ni prueba. La publicidad paga el sitio y no recibe datos del vídeo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando, algo que una herramienta que enviara el vídeo a un servidor no podría hacer.

## Cómo se comprueba la promesa de privacidad

- **No hay que esperar a subir el archivo.** Los vídeos suelen ser los archivos más grandes que enviamos. Subir 900 MB para recibir 25 MB puede tardar más que la compresión, además de entregar una copia. Aquí los códecs del navegador hacen el trabajo y los bytes solo pasan del disco a la memoria y vuelven al disco. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Funciona sin red.
- **El punto de partida es el límite que necesitas cumplir.** Un chat, correo o formulario impone un máximo. Aquí introduces ese número y se calcula el resto: primero se reserva lo que ocupa el sonido y el contenedor; el espacio restante, dividido por la duración, da la tasa de bits de la imagen. Se reducen las dimensiones por tamaños habituales hasta dar suficientes bits a cada fotograma. Nunca se amplía. Los ajustes se muestran antes de empezar y puedes elegir otras dimensiones.
- **Comprimir vídeo implica volver a codificar.** A diferencia de un ZIP, esta compresión tiene pérdida. La imagen se decodifica, reduce y codifica como H.264 con la tasa que permite el objetivo: otra generación desde la cámara. El sonido no se recodifica; se copia intacto. El resultado es MP4, por su amplia compatibilidad con teléfonos, navegadores y chats.
- **Se mide el resultado y se ajusta una segunda vez si hace falta.** El codificador se aproxima a la tasa solicitada, no siempre la cumple exactamente. Se deja un margen y se mide el archivo. Si supera el objetivo, se calcula una tasa menor según la desviación y se hace una segunda pasada. La página indica si fue necesaria. También reabre el resultado para comprobar la duración: reducir el tamaño perdiendo el final o el audio no sería una compresión válida.
- **Tiempo y memoria necesarios.** El tiempo depende del dispositivo. Con codificador de hardware suele ser menor que la duración del clip; sin él puede tardar más, especialmente con 4K. La entrada se lee por partes, pero el resultado queda completo en memoria hasta descargarlo. Ese es el límite práctico. Siempre puedes cancelar.
- **Qué formatos admite.** Lee MP4 y MOV con H.264, HEVC, VP9 o AV1, siempre que el navegador decodifique el códec. Un clip HEVC de iPhone necesita que el dispositivo lo admita. Aún no lee WebM, MKV ni AVI; lo avisa al encontrarlos.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben el vídeo, fotogramas, nombre, tamaño, duración ni objetivo elegido. Todo el código que lee, codifica y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón de donación lo dibuja un script de cdnjs.buymeacoffee.com, con letras de Google Fonts. Es solo un enlace: no registra la visita ni recibe datos tuyos o de tus vídeos. Solo pasa algo al pulsarlo, cuando abres un sitio ajeno.
- **Funciona sin conexión.** Desconéctate y todo sigue funcionando. Una herramienta que enviara el vídeo a un servidor para comprimirlo se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/plan.js` para calcular dimensiones y tasa de bits a partir del objetivo, y `src/encode.js` para decodificar, dibujar y codificar mientras se copia el audio intacto. Ninguno accede a la red, ni el lector y el escritor.
