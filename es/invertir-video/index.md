# Invertir un vídeo — reproducirlo al revés

El último fotograma primero, con sonido y todo.

> Reproduce un MP4, MOV o WebM al revés, con el sonido invertido también. Funciona en el navegador: no se sube nada, no hay marca de agua y va sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/invertir-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

Cada fotograma lo decodifica, lo da la vuelta y lo vuelve a codificar tu propio navegador, en tu propio equipo. Aquí nada puede pedir ni enviar nada, porque esta herramienta no tiene ninguna función de red, y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un vídeo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Invierte el sonido
- ✓ Funciona sin conexión

## Cómo invertir un vídeo

1. **Elige un vídeo.** Suelta un MP4, MOV, M4V o WebM sobre el selector, o búscalo a mano. El navegador lo lee directamente de tu disco, y mientras tanto no sale nada a ninguna parte.
2. **Decide qué hacer con el sonido.** «Invertir también el sonido» da la vuelta a la pista muestra a muestra, que es lo que hace que el habla salga como habla reproducida al revés y no como silencio. Desactívalo para un clip mudo, que además va más rápido.
3. **Decide cuánta calidad gastar.** La imagen hay que codificarla otra vez, porque los fotogramas salen en un orden para el que no se codificó nada en el archivo. «Equilibrado» se queda cerca de lo que gastó el original; «Máxima calidad» gasta más.
4. **Inviértelo y descárgalo.** El trabajo pasa en tu propio equipo, así que lo que tarde depende de tu máquina y no de una cola. El vídeo terminado va directo a las descargas de tu navegador.

## La versión larga

[Cómo invertir un vídeo](https://abox.tools/es/guias/invertir-un-video/): Reproducir un clip al revés: qué le hace invertir a la imagen y al sonido, por qué no se puede hacer sin recodificar, por qué es más lento que cortar, y qué hacer antes.

## También en la caja

- [Creador de timelapse](https://abox.tools/es/crear-timelapse/): Una hora de grabación en veinte segundos.
- [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/): Una imagen a máxima calidad, de cualquier punto.
- [Vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/): Elige el trozo, el tamaño y la cadencia.
- [Creador de GIF](https://abox.tools/es/crear-gif/): Convierte un puñado de imágenes en una sola animación.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Lo lee, lo decodifica, lo invierte y lo codifica tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Si prefieres comprobarlo a que te lo cuenten, desconéctate de internet e invierte un clip igualmente.

### ¿Qué formatos de vídeo puedo invertir?

MP4, M4V y MOV se leen directamente, lleven lo que lleven dentro: H.264, HEVC, AV1 o VP9, mientras tu navegador pueda decodificar ese códec. Cualquier otra cosa que tu navegador pueda reproducir, WebM sobre todo, se invierte llevando hacia atrás el reproductor del propio navegador, lo cual funciona pero es más lento. Un archivo que el navegador no puede ni leer ni reproducir, que en la práctica significa AVI, WMV, FLV y casi todos los MKV, se rechaza con un mensaje que lo dice en vez de fallar a medio camino. Lo que sale siempre es un MP4.

### ¿Se invierte también el sonido?

Sí, salvo que lo desactives. La pista entera se decodifica, las muestras se ponen en el otro orden y se vuelve a codificar como AAC. Esa segunda codificación no se puede evitar: un paquete de audio son unas pocas decenas de milisegundos de sonido codificadas contra el paquete anterior, así que escribir los paquetes al revés reproduciría trozos cortos hacia delante en el orden equivocado, y eso suena a avería y no a inversión.

### ¿Invertir pierde calidad?

La imagen se codifica una segunda vez, lo cual cuesta un poco. Aquí no se puede evitar como sí se evita al cortar: un clip invertido enseña sus fotogramas en un orden para el que no se codificó nada en el archivo original, así que cada fotograma hay que escribirlo de nuevo. Lo que la herramienta no hará es gastar más de lo que gastó el original, porque codificar por encima de eso solo hace el archivo más grande sin que se vea mejor.

### ¿Hay un límite de tamaño o de duración del vídeo?

No hay ningún límite metido en la herramienta, y el archivo no se lee entero en memoria: se recorre grupo de fotogramas a grupo de fotogramas, hacia atrás. Los techos prácticos son el vídeo terminado, que se monta en memoria antes de que lo descargues, y el sonido, que hay que tenerlo entero, porque invertir necesita la última muestra antes de poder escribir la primera.

### ¿Por qué tarda más en unos archivos que en otros?

Porque hay dos caminos de entrada. Un MP4 o un MOV los lee esta herramienta directamente y los decodifica un grupo de fotogramas cada vez, y eso va tan rápido como vaya tu equipo. Lo demás se invierte pidiéndole al reproductor del navegador un instante del clip detrás de otro, y cada uno de esos saltos obliga al navegador a decodificar desde el fotograma clave anterior. La página dice cuál de los dos está usando, y por qué, antes de que empieces.

### ¿Puedo invertir solo un trozo del clip?

Aquí no. Esta herramienta invierte el clip entero: lo que sale dura exactamente lo mismo que lo que entró, con el último fotograma primero. Corta antes el trozo que quieras con el [Cortador de vídeo](https://abox.tools/es/cortar-video/), que lo hace sin recodificar ni un fotograma, e invierte lo que salga de ahí.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus vídeos no tienen por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse tu archivo, ni nada en el código que lo enviara si lo hubiera.
- **Aquí nada pide nada.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, nada que descargar, ningún motor que se baje la primera vez. Cada byte que toca tu vídeo vino de este origen cuando cargó la página.
- **La decodificación y la codificación son locales.** Los fotogramas pasan por WebCodecs en tu propio navegador, o por el mismo motor de reproducción que te enseñaría el vídeo de todos modos. El archivo terminado se construye en la memoria de este equipo y va directo a una descarga.
- **El sonido también se da la vuelta aquí.** Invertir una pista significa decodificarla, y esa decodificación es la del propio navegador, corriendo en este equipo. Nada la escucha, nada la guarda y nada podría pasarla a ninguna parte: aquí no hay ningún camino en el código que envíe un byte.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu vídeo: ni el archivo, ni un fotograma, ni un nombre, un tamaño o una duración. Cada línea que lee, decodifica, invierte o codifica se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tu vídeo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/timeline.js` para las cuentas que deciden qué fotograma sale en cada momento y `src/reverse.js` para el bucle que recorre el archivo hacia atrás, un grupo de fotogramas cada vez. Ninguno importa nada que pueda hacer una petición.
