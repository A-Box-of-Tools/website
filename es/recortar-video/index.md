# Recortar vídeo — recortar un vídeo en línea

Deja el clip en la parte que de verdad importa.

> Recorta un MP4, MOV o WebM a la forma que quieras: cuadrado, 9:16 o una caja de píxeles exacta. Todo en el navegador, sin subir nada y conservando el sonido.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/recortar-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

Cada fotograma lo descodifica, lo recorta y lo codifica tu propio navegador, en tu propio hardware. Aquí no hay nada que pueda descargar ni enviar, porque esta herramienta no tiene ninguna función de red. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un vídeo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Conserva el sonido
- ✓ Funciona sin conexión

## Cómo recortar un vídeo

1. **Elige un vídeo.** Arrastra un MP4, MOV, M4V o WebM hasta el selector, o busca uno a mano. El navegador lo lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Arrastra la caja sobre la parte que quieres conservar.** Arrastra por dentro para moverla y desde cualquier esquina para cambiarle el tamaño. Puedes fijarla antes a una forma, sea 1:1 para una publicación cuadrada, 9:16 para el móvil o 16:9 para un encuadre panorámico, o escribir una caja de píxeles exacta en los cuatro campos de debajo. Reproduce el clip, o arrastra el control deslizante de debajo, para elegir el fotograma sobre el que encuadras la caja.
3. **Elige cuánta calidad gastar.** La imagen tiene que volver a codificarse, porque un fotograma recortado ya es otra imagen. Con «Equilibrado» se queda cerca de lo que el archivo gastaba en esa zona; con «Mejor calidad» gasta más. El sonido se conserva salvo que lo desactives.
4. **Recórtalo y descárgalo.** El trabajo lo hace tu propio hardware, así que lo que tarde depende de tu dispositivo y no de una cola. El vídeo terminado va directo a las descargas del navegador.

## La versión larga

[Cómo recortar un vídeo a otra forma](https://abox.tools/es/guias/recortar-un-video/): Deja un clip en un cuadrado, en un vertical 9:16 o en una caja de píxeles exacta. Qué proporción quiere cada plataforma, por qué recortar tiene que recodificar y cortar no, y lo que eso cuesta.

## También en la caja

- [Invertidor de vídeo](https://abox.tools/es/invertir-video/): El último fotograma primero, con sonido y todo.
- [Creador de timelapse](https://abox.tools/es/crear-timelapse/): Una hora de grabación en veinte segundos.
- [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/): Una imagen a máxima calidad, de cualquier punto.
- [Vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/): Elige el trozo, el tamaño y la cadencia.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Tu propio navegador lo lee, lo descodifica, lo recorta y lo codifica, todo en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Y si prefieres comprobarlo a que te lo cuenten, desenchúfate de internet y recorta un clip igualmente.

### ¿Qué formatos de vídeo puedo recortar?

MP4, M4V y MOV se leen directamente, lleven lo que lleven dentro: H.264, HEVC, AV1 o VP9, siempre que el navegador sepa descodificar ese códec. Lo demás que el navegador sepa reproducir, y aquí el caso claro es el WebM, se recorta reproduciéndolo y grabando el resultado; funciona, pero tarda lo que dure el clip. Un archivo que el navegador no sabe ni leer ni reproducir, que en la práctica son los AVI, WMV, FLV y casi todos los MKV, se rechaza con un mensaje que lo dice, en lugar de fallar a mitad de camino.

### ¿Hay algún límite de tamaño o de duración?

La herramienta no lleva ningún límite dentro, y el archivo tampoco se carga entero en memoria de golpe, sino que se recorre de unos megabytes en unos megabytes. El techo de verdad son dos cosas: el vídeo terminado, que sí se monta en memoria antes de que lo descargues, y lo que tarde tu dispositivo en codificarlo.

### ¿Sobrevive el sonido?

Por la vía del MP4, tal cual: el audio se copia muestra a muestra sin llegar a descodificarse, así que sale byte por byte igual que estaba en el archivo. Por la vía de la grabación se captura de la reproducción y se vuelve a codificar, lo que cuesta algo de calidad. En los dos casos hay una casilla para dejarlo fuera del todo.

### ¿Recortar hace perder calidad?

La imagen se vuelve a codificar, porque un fotograma recortado ya es otra imagen y no hay manera de guardarla sin escribir los píxeles otra vez. Lo que la herramienta no hace es gastar más de lo que gastaba el original en esa misma zona, porque recodificar por encima de ahí solo engorda el archivo sin que se vea mejor.

### ¿Puedo cortar también la duración?

Aquí no, pero al lado sí. Esta herramienta cambia la forma de la imagen y nada más: el clip que sale dura exactamente lo mismo que el que entró, con su sincronía y su sonido intactos. Cortar es otro trabajo y tiene su propia herramienta. El [cortador de vídeo](https://abox.tools/es/cortar-video/) marca los trozos que merece la pena conservar y los guarda en un solo archivo, sin recodificar ni un fotograma.

### ¿Por qué el ancho y el alto se mueven de dos en dos?

Porque el H.264, el códec que hay dentro de un MP4, guarda la imagen en bloques y no tiene forma de describir un fotograma con un número impar de píxeles de lado. En vez de redondearte el recorte por lo bajo una vez fijado, la caja solo te ofrece números pares desde el principio.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu vídeo.

## Cómo se comprueba la promesa de privacidad

- **Tus vídeos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tu archivo, ni una línea de código que lo mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, ni nada que descargar, ni ningún motor que se baje la primera vez que la usas. Cada byte que toca tu vídeo llegó desde este origen al cargarse la página.
- **La descodificación y la codificación son locales.** Los fotogramas pasan por WebCodecs dentro de tu navegador, o por el mismo motor de reproducción que te enseñaría el clip de todas formas. El archivo terminado se monta en la memoria de este dispositivo y va directo a una descarga.
- **El sonido se copia, no se escucha.** Por la vía del MP4, las muestras de audio se trasladan sin llegar a descodificarse. Aquí nada las vuelve a convertir en sonido, y aunque lo hiciera, no habría adónde mandarlas.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu vídeo: ni un archivo, ni un fotograma, ni un nombre, ni un tamaño, ni una duración, ni la forma a la que lo has recortado. Cada línea que lee, descodifica, recorta o codifica se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tu vídeo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/mp4-reader.js` para el lector que encuentra los fotogramas dentro de un MP4, y `src/transcode.js` para el bucle que los descodifica, los recorta y los codifica. Ninguno de los dos importa nada capaz de hacer una petición.
