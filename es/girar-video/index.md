# Girar vídeo — corrige un clip grabado de lado

Un cuarto de vuelta o media vuelta, escrito en la cabecera: sin decodificar fotogramas ni perder calidad.

> Gira un vídeo de lado o invertido en el navegador. Cambia la cabecera sin recodificar, o aplica el giro a los píxeles para reproductores antiguos. Lee MP4, MOV, WebM y MKV; genera MP4. Sin subidas.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/girar-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

El vídeo se lee, recibe una cabecera nueva y se escribe en la memoria de este dispositivo, con código servido desde esta página. Si aplicas el giro a los píxeles, lo hacen los códecs del navegador. Nada puede subir el archivo y no hay un servidor que lo reciba. No hace falta enviar un gigabyte para recibirlo girado.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo girar un vídeo

1. **Elige el vídeo.** Un archivo MP4, MOV, M4V, WebM o MKV. El navegador lo lee del disco y muestra el formato y la orientación actuales.
2. **Elige el giro y revisa la vista previa.** Un cuarto de vuelta a derecha o izquierda, o media vuelta. El primer fotograma muestra el giro con las mismas cuentas que llevará el archivo. Activa la recodificación solo si un reproductor ignora la cabecera. También puedes omitir el sonido.
3. **Gíralo y lee la comprobación.** Cambiar la cabecera y copiar los fotogramas tarda segundos. Aplicar el giro a los píxeles tarda lo que la codificación y muestra el avance. Después se reabre el archivo para comprobar duración, orientación y sonido, y puedes reproducirlo desde la memoria.

## La versión larga

[Cómo girar un video sin perder calidad](https://abox.tools/es/guias/girar-un-video/): Por qué un video del teléfono se ve de lado, qué hacen los nueve números de su encabezado, cuándo basta con cambiarlos y cuándo conviene girar los píxeles, sin subir el archivo.

## También en la caja

- [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.
- [Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.
- [Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.
- [Invertidor de vídeo](https://abox.tools/es/invertir-video/): El último fotograma primero, con sonido y todo.

## Preguntas

### ¿Girar el vídeo reduce la calidad?

El giro normal no. Cambia la cabecera y copia cada fotograma byte por byte: la imagen es idéntica y el tamaño casi igual. Solo la opción de aplicar el giro a los píxeles recodifica, y se avisa antes. Recodificar por defecto pierde calidad en una tarea que solo necesitaba nueve números.

### ¿Por qué sigue viéndose de lado en un reproductor?

Ese reproductor ignora la matriz de presentación. Los teléfonos, navegadores y programas modernos la respetan; algunos antiguos no. Activa la opción de aplicar el giro a los píxeles: se giran y recodifican como H.264 para que todos lo muestren igual, a costa de una generación de calidad.

### ¿Qué significa un cuarto de vuelta a la derecha?

Girar en el sentido de las agujas del reloj. La parte superior se mueve hacia la derecha. Elige el botón que deje bien orientada la vista previa y pulsa el botón de girar.

### ¿Qué archivos admite?

MP4, MOV y M4V con cualquier códec de imagen, porque cambiar la cabecera no requiere decodificar. En WebM y MKV se copia H.264 y se recodifican los demás. AAC se copia; Opus, Vorbis, MP3 y FLAC pasan a AAC. El sonido que no pueda decodificarse se omite con un aviso. El resultado es MP4.

### ¿Cuánto tarda?

El giro normal tarda segundos: se lee la estructura y después los datos al escribir. Un gigabyte avanza a la velocidad del disco. Aplicar el giro a los píxeles tarda lo que el dispositivo necesite para codificar; con aceleración de hardware suele ser menos que la duración del clip, y sin ella puede ser más.

### ¿Se suben mis vídeos?

No. El navegador lee, modifica la cabecera y escribe en tu dispositivo. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Desconéctate para comprobarlo. Con archivos grandes, evitar la subida también es lo que más tiempo ahorra.

### ¿Funciona en el móvil?

Sí. El giro normal no decodifica, así que un teléfono puede hacerlo tan rápido como otro equipo. El límite es la memoria para el resultado hasta guardarlo; unos cientos de megabytes suelen caber. Aplicar el giro a los píxeles usa el codificador del teléfono, que puede acelerarlo por hardware.

### ¿Hay límite de tamaño y cuesta algo?

El archivo se lee por partes, así que puede ser mayor que la memoria disponible. El resultado sí se mantiene en memoria, y el MP4 generado aquí no puede superar 4 GB. Es gratis, sin cuenta, inicio de sesión ni prueba. La publicidad paga el sitio y no recibe información del vídeo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando: una herramienta que enviara el vídeo a un servidor se detendría al perder la red.

## Cómo se comprueba la promesa de privacidad

- **El giro son nueve números en la cabecera.** Un teléfono guarda los fotogramas tal como los vio el sensor y anota el giro en una matriz de nueve números en la cabecera de la pista. El reproductor la aplica al mostrar la imagen. Para corregir un vídeo de lado basta con cambiar esa matriz. Aquí se escribe la elegida y se copian intactos todos los fotogramas y paquetes, sin decodificarlos. Por eso un gigabyte tarda segundos, la imagen es idéntica y el tamaño apenas cambia.
- **No hay que esperar a subir el archivo.** Muchos servicios piden el vídeo entero y lo devuelven girado. Enviar un gigabyte suele tardar más que el trabajo, sin contar qué ocurre con la copia. Muchos además recodifican y pierden calidad en una operación que solo necesitaba nueve números. Aquí los bytes van del disco a la memoria y vuelven al disco. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Funciona sin red.
- **Qué hacer si un reproductor ignora la cabecera.** Los teléfonos, navegadores, editores y reproductores modernos respetan la matriz de presentación, usada en vídeos de teléfono desde 2010. Algunos reproductores antiguos la ignoran. Para ellos, o si no puedes comprobar el destino, puedes aplicar el giro a los píxeles: cada fotograma se dibuja girado y se recodifica como H.264. Cuesta una generación de calidad y tiempo de codificación, por eso es una opción adicional.
- **El resultado se vuelve a abrir y comprobar.** Una matriz incorrecta podría producir un archivo que se abra pero se vea mal. Aquí se vuelve a leer el resultado para comprobar duración, orientación, dimensiones y sonido. Se reproduce desde la memoria junto a la descarga para que lo revises antes de guardarlo.
- **Qué formatos lee y escribe.** MP4, MOV y M4V con H.264, HEVC, VP9 o AV1: un giro en la cabecera no depende del códec. En WebM y MKV se copia H.264; los demás se recodifican aplicando el giro porque este escritor no puede envolverlos directamente en MP4. AAC se copia; Opus, Vorbis, MP3 y FLAC pasan a AAC. Si el navegador no decodifica el sonido, se avisa y se omite. El resultado siempre es MP4.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben el vídeo, fotogramas, nombre, tamaño, duración ni giro elegido. Todo el código que lee, gira y escribe el archivo se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón de donación lo dibuja un script de cdnjs.buymeacoffee.com, con letras de Google Fonts. Es solo un enlace: no registra la visita ni recibe datos tuyos o de tus vídeos. Solo pasa algo al pulsarlo, cuando abres un sitio ajeno.
- **Funciona sin conexión.** Desconéctate y todo sigue funcionando. Es la comprobación más sencilla: una herramienta que enviara el vídeo fuera para girarlo se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/plan.js` para los nueve números del giro, `src/rotate.js` para copiar y escribir, y `src/shared/copy-tracks.js` para trasladar fotogramas sin leerlos. Ninguno accede a la red, ni los lectores y el escritor que los acompañan.
