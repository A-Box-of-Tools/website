# Crear un timelapse — acelerar un vídeo en línea

Una hora de grabación en veinte segundos.

> Convierte un vídeo largo en un timelapse: 10x, 60x o la velocidad que escribas. Todo en el navegador, sin subir nada, sin marca de agua y también sin conexión.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/crear-timelapse/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

Cada fotograma lo elige, lo descodifica y lo vuelve a codificar tu propio navegador, en tu propio hardware. Aquí no hay nada que pueda descargar ni enviar, porque esta herramienta no tiene ninguna función de red. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un vídeo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ La velocidad que escribas
- ✓ Funciona sin conexión

## Cómo hacer un timelapse a partir de un vídeo

1. **Elige un vídeo.** Arrastra un MP4, MOV, M4V o WebM hasta el selector, o busca uno a mano. El navegador lo lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Di cuánto más rápido.** Pulsa una de las velocidades o escribe la tuya. Si prefieres decir cuánto debe durar el resultado, por ejemplo «que quepa en veinte segundos», escríbelo y la velocidad sale sola.
3. **Comprueba el intervalo.** La línea que hay debajo de la velocidad dice lo que va a pasar de verdad: un fotograma cada tantos segundos del original. Es el número que se pondría en una cámara, y el que conviene mirar dos veces antes de empezar.
4. **Créalo y descárgalo.** El trabajo ocurre en tu propio hardware, así que lo que tarde depende de tu dispositivo y no de ninguna cola. El vídeo terminado va directo a las descargas del navegador.

## La versión larga

[Cómo convertir un video largo en un timelapse](https://abox.tools/es/guias/convertir-un-video-largo-en-timelapse/): Una hora de metraje en un minuto que se deja ver: cómo elegir la velocidad, por qué decir la duración final gana a hacer cuentas, y cuándo el resultado debe volverse un GIF.

## También en la caja

- [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/): Una imagen a máxima calidad, de cualquier punto.
- [Vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/): Elige el trozo, el tamaño y la cadencia.
- [Creador de GIF](https://abox.tools/es/crear-gif/): Convierte un puñado de imágenes en una sola animación.
- [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/): Cada fotograma fuera, en su propio PNG.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Tu propio navegador lo lee, lo descodifica, elige los fotogramas y los codifica en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse: ninguna es de este sitio. Si prefieres comprobarlo a que te lo cuenten, desconéctate de internet y crea un timelapse igualmente.

### ¿Qué significa exactamente la velocidad?

La proporción entre lo que entra y lo que sale. A 60× una hora de grabación se queda en un minuto, sea cual sea la cadencia a la que lo reproduzcas. Por debajo, la herramienta toma un fotograma cada *velocidad ÷ fotogramas por segundo*: 60× a 30 fotogramas por segundo es uno cada dos segundos. La página te enseña ese intervalo antes de empezar, porque es el número que dice lo que está pasando de verdad.

### ¿Qué formatos de vídeo puedo acelerar?

MP4, M4V y MOV se leen directamente, lleven lo que lleven dentro: H.264, HEVC, AV1 o VP9, siempre que tu navegador sepa descodificar ese códec. Todo lo demás que tu navegador pueda reproducir, sobre todo WebM, se lee llevando el reproductor a cada instante, lo cual funciona con cualquier formato que sepa abrir. Un archivo que el navegador no pueda ni leer ni reproducir, que en la práctica es AVI, WMV, FLV y casi cualquier MKV, se rechaza con un mensaje que lo dice, en lugar de fallar a medio camino. Lo que sale siempre es un MP4.

### ¿Por qué el timelapse no tiene sonido?

Porque no hay nada que merezca la pena conservar. El sonido a treinta veces su velocidad no es voz ni música, es un pitido; y la alternativa, dejar el audio a su velocidad original debajo de una imagen que se le ha adelantado, sería un clip distinto del que has pedido. Así que la pista se descarta, y eso explica buena parte de que una hora de vídeo salga en unos pocos megabytes. Si lo que quieres es el audio por separado, el [Editor de audio](https://abox.tools/es/editar-audio/) lo guarda.

### ¿Es más rápido que convertir el vídeo entero?

Mucho más, y para eso se lee el archivo directamente. Un fotograma solo se puede descodificar empezando por el fotograma clave que lo precede, pero nada obliga a conservar los que hay en medio: un timelapse a 60× de una hora descodifica unos pocos miles de fotogramas en lugar de cien mil. El resumen te dice cuántos leerá exactamente antes de que pulses el botón.

### ¿Se pierde calidad?

Los fotogramas que se conservan se codifican una segunda vez, y eso cuesta algo. No hay forma de evitarlo, porque el clip terminado los enseña en momentos para los que no había nada codificado en el archivo original. En lo que esta herramienta sí gasta más que las demás herramientas de vídeo de aquí es en el bitrate, y a propósito: dos fotogramas separados por dos segundos tienen mucho menos en común que dos separados por una treintava parte de segundo, así que el códec tiene menos que reaprovechar y una cifra pensada para grabaciones normales saldría con bloques.

### ¿Hay algún límite de tamaño o de duración?

La herramienta no lleva ninguno, y el archivo tampoco entra entero en memoria: se leen tramos cortos alrededor de cada instante y nada más. El techo práctico es el timelapse terminado, que se monta en memoria antes de que lo descargues, y un timelapse es corto por definición. El resumen te enseña aproximadamente cuánto va a ocupar antes de empezar.

### ¿Puedo acelerar solo una parte del clip?

Aquí no. Esta herramienta coge el clip entero, del primer fotograma al último. Recorta antes el trozo que quieras con el [Cortador de vídeo](https://abox.tools/es/cortar-video/), que lo hace sin volver a codificar ni un fotograma, y acelera lo que salga de ahí.

### ¿Es gratis? ¿Hace falta una cuenta?

Es gratis, y no hay cuenta, ni registro, ni prueba, ni marca de agua. El sitio se paga con publicidad, y a los anuncios no se les entrega nada sobre tu vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus vídeos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tu archivo, ni una línea de código que lo mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, ni nada que descargar, ni ningún motor que se baje la primera vez que la usas. Cada byte que toca tu vídeo llegó desde este origen al cargarse la página.
- **La descodificación y la codificación son locales.** Los fotogramas pasan por WebCodecs dentro de tu navegador, o por el mismo motor de reproducción que te enseñaría el clip de todas formas. El archivo terminado se monta en la memoria de este dispositivo y va directo a una descarga.
- **La mayor parte del archivo ni siquiera se lee.** Un timelapse necesita un fotograma cada pocos segundos, así que la herramienta lee el tramo corto de archivo que rodea a cada uno y se salta el resto. Es una decisión de velocidad y no de privacidad, pero conviene saberlo igualmente: incluso aquí, en tu dispositivo, la mayor parte de tu vídeo no llega a abrirse.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu vídeo: ni un archivo, ni un fotograma, ni un nombre, ni un tamaño, ni una duración. Cada línea que lee, descodifica, elige o codifica se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tu vídeo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/plan.js` para las cuentas que deciden de qué instante sale cada fotograma, y `src/decode.js` para el bucle que lee solo las partes del archivo que esos instantes necesitan. Ninguno de los dos importa nada capaz de hacer una petición.
