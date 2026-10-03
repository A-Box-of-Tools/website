# GIF a MP4 — la misma animación con una décima parte del tamaño

Cada fotograma conserva su duración, en H.264 dentro de un MP4. Se convierte en tu dispositivo, sin subidas.

> Convierte un GIF animado a MP4 en el navegador, con mucho menos tamaño. Conserva cada fotograma y su duración, sin ajustar la animación a una frecuencia fija. H.264 en MP4, sin subidas.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-gif-a-mp4/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus GIF **nunca se suben**. No hay ningún servidor.

El GIF se decodifica, dibuja fotograma a fotograma, codifica y escribe en un MP4 en la memoria del dispositivo. Lo hacen el codificador del navegador y el código servido desde esta página. No hay funciones de subida ni un servidor que reciba el archivo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo convertir GIF a MP4

1. **Elige el GIF.** Uno cada vez. El navegador lo lee del disco y muestra su peso, número de fotogramas, duración y dimensiones.
2. **Revisa qué se generará.** Una línea indica las dimensiones, los fotogramas y sus tiempos, la duración y la tasa de bits. Solo hay que elegir un color si el GIF tiene partes transparentes.
3. **Convierte y lee la comprobación.** Se dibuja y codifica cada fotograma con una barra de progreso. Después se reabre el archivo para comprobar que están todos y que dura lo mismo. Se reproduce en bucle desde la memoria para revisar la unión.

## La versión larga

[Cómo convertir un GIF a MP4 y por qué ocupa mucho menos](https://abox.tools/es/guias/convertir-un-gif-a-mp4/): Por qué un MP4 de la misma animación suele ocupar una décima parte del GIF, qué cambia al convertirlo, por qué importan los tiempos de cada fotograma y cómo hacerlo en el navegador sin subir el archivo.

## También en la caja

- [Vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/): Elige el trozo, el tamaño y la cadencia.
- [Creador de GIF](https://abox.tools/es/crear-gif/): Convierte un puñado de imágenes en una sola animación.
- [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/): Cada fotograma fuera, en su propio PNG.
- [Analizador de GIF](https://abox.tools/es/analizar-gif/): Fotogramas, duraciones, paletas y adónde fue cada byte.

## Preguntas

### ¿Por qué pesa mucho menos el MP4?

GIF guarda imágenes de hasta 256 colores; H.264 aprovecha los cambios entre fotogramas y admite color completo. La misma animación suele ocupar una décima parte o menos. Un GIF diminuto o casi estático puede producir un MP4 mayor; la página lo avisa.

### ¿Conserva los tiempos de la animación?

Sí. Cada fotograma conserva su duración; no se duplica, elimina ni ajusta a una frecuencia fija. Igual que un navegador, los retardos menores de dos centésimas se reproducen como diez centésimas. El vídeo dura lo mismo que el GIF en el navegador. Se reabre el resultado para comprobar duración y cantidad de fotogramas.

### ¿Se repetirá en bucle?

Depende del reproductor. GIF guarda una orden de repetición; MP4 no. Las aplicaciones de chat y redes suelen repetir vídeos cortos, y la vista previa de aquí también. Un reproductor convencional suele mostrarlo una vez.

### ¿Qué pasa con las partes transparentes?

Se rellenan con un color porque el vídeo es opaco. Si hay transparencia aparece un selector, blanco por defecto; si no, se oculta. El color se dibuja detrás de cada fotograma antes de codificarlo.

### ¿Cambia las dimensiones?

Solo cuando hace falta. H.264 necesita dimensiones pares: si un lado es impar, se añade una línea del color de fondo sin remuestrear. Si el GIF supera 3840 píxeles de ancho, se reduce hasta ese límite para que los codificadores lo admitan. La página muestra el tamaño previsto antes de empezar.

### ¿Cuánto tarda?

Un GIF normal tarda unos segundos con codificador de hardware, más sin él. Los fotogramas se guardan primero en memoria; al llegar a medio gigabyte se detiene con un aviso. La barra muestra el fotograma actual. Cancelar detiene el proceso y no escribe el resultado.

### ¿Se suben mis GIF?

No. El navegador lee, decodifica, codifica y escribe en tu dispositivo. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Desconéctate y usa la página para comprobarlo.

### ¿Funciona en el móvil?

Sí, si el navegador del teléfono puede codificar vídeo. Su codificador de hardware suele ser rápido. La limitación principal es la memoria: un GIF muy largo puede necesitar más de la disponible.

### ¿Hay límite de tamaño y cuesta algo?

La página detiene la lectura al llegar a medio gigabyte de fotogramas decodificados y lo avisa. Es gratis, sin cuenta, inicio de sesión ni prueba. La publicidad paga el sitio y no recibe datos sobre tus GIF.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando, algo que un conversor que enviara el GIF a un servidor no podría hacer.

## Cómo se comprueba la promesa de privacidad

- **Por qué MP4 ocupa tanto menos.** GIF guarda cada fotograma como una imagen de hasta 256 colores. Un códec de vídeo como H.264 aprovecha los cambios entre fotogramas y admite color completo. La animación suele ocupar una décima parte o menos. Por eso muchas plataformas y aplicaciones rechazan GIF grandes o los convierten a MP4 al recibirlos: cuando el GIF pesa demasiado, suele servir mejor un MP4.
- **No hay que esperar a subir el archivo.** Un servicio puede pedirte subir 30 MB para devolverte 3 MB, además de conservar una copia. Aquí el GIF se lee con código local y el MP4 lo escribe el codificador del navegador. Los bytes solo pasan del disco a la memoria y vuelven al disco. La `Content-Security-Policy` enumera los destinos permitidos; ninguno pertenece al sitio. Funciona sin red.
- **Se conserva la duración de cada fotograma.** GIF no tiene frecuencia fija: cada fotograma indica cuánto dura. Una presentación puede mantener una foto dos segundos y después mostrar diez rápidamente. Ajustarla a una frecuencia fija puede duplicar o eliminar fotogramas. Aquí cada fotograma se convierte en uno de vídeo con su duración original. Solo se aplica el ajuste habitual de los navegadores: los retardos inferiores a dos centésimas se reproducen como diez centésimas. El resultado se reabre para contar los fotogramas y comprobar la duración.
- **La transparencia y la repetición cambian.** Un vídeo es un rectángulo opaco: la transparencia del GIF se rellena con el color elegido, blanco por defecto. El campo solo aparece si hace falta. Además, MP4 no guarda la orden de repetirse que sí lleva GIF; decide el reproductor. Las aplicaciones de chat y redes suelen repetir clips cortos. La vista previa se repite para revisar la unión.
- **Tiempo y memoria necesarios.** Con codificador de hardware, presente en muchos dispositivos, un GIF normal tarda unos segundos; sin él puede tardar más. Primero se decodifican todos los fotogramas en memoria. Unos pocos megabytes pueden expandirse a un byte por píxel y fotograma. La página se detiene al llegar a medio gigabyte y avisa para evitar bloquear la pestaña. Siempre puedes cancelar.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben el GIF, fotogramas, nombre, tamaño ni duración. Todo el código que lee, codifica y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón de donación usa un script de cdnjs.buymeacoffee.com y Google Fonts. Es solo un enlace: no registra la visita ni recibe información tuya o de tus GIF. Solo al pulsarlo abres un sitio ajeno.
- **Funciona sin conexión.** Desconéctate y la página sigue funcionando. Una herramienta que enviara el GIF a un servidor no podría hacerlo.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/plan.js` para convertir los retardos del GIF en tiempos de vídeo, `src/encode.js` para dibujar y codificar, y `src/shared/gif-decode.js` para leer. Ninguno accede a la red, ni el escritor que los acompaña.
