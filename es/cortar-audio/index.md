# Cortar audio — recortar audio en línea

Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.

> Reproduce una grabación y marca cada trozo que valga la pena según pasa, y guarda luego esos trozos como un solo archivo. Cortes exactos al sample, sin chasquidos en las uniones, sin subir nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/cortar-audio/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus grabaciones **nunca se suben**. No hay ningún servidor.

Tu grabación la lee, la marca, la corta y la escribe tu propio navegador, en tu propio equipo. Aquí nada puede pedir ni enviar nada, porque esta herramienta no tiene ninguna función de red, y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una grabación.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Tantos trozos como quieras
- ✓ Corta justo donde marcaste
- ✓ Funciona sin conexión

## Cómo cortar un archivo de audio

1. **Elige una grabación.** Suelta un MP3, WAV, FLAC, M4A, Ogg u Opus sobre el selector, o un vídeo si lo que quieres es un trozo de su sonido. El navegador lo lee directamente de tu disco y lo dibuja como una onda, y mientras tanto no sale nada a ninguna parte.
2. **Reprodúcela y marca los trozos que quieras.** Pulsa `I` donde deba empezar un trozo y `O` donde deba acabar. Hazlo tantas veces como quieras: cada pareja se convierte en una fila de la tabla de abajo y en una banda sobre la onda. `U` deshace la última, `Espacio` reproduce y pausa, las flechas saltan cinco segundos, y con `Mayús` se mueven diez milisegundos. Baja la velocidad de reproducción si el momento es difícil de pillar.
3. **Retoca las marcas.** Cada fila se puede reproducir por su cuenta, ajustar escribiendo dentro una hora exacta, subir o bajar en el orden, o borrar. Los dos extremos del trozo seleccionado también se pueden arrastrar sobre la onda, que es la forma más rápida de poner una marca en el silencio y no en la respiración de antes. El total de arriba es lo que durará la grabación terminada.
4. **Consérvalos, o quítalos.** Conservar es lo habitual: la grabación terminada son los trozos que marcaste, unidos en orden. Quitarlos es el otro trabajo que la gente quiere y rara vez encuentra: marca los «ehs», el teléfono sonando o las salidas en falso, y lo que queda se une sin ellos.
5. **Córtalo y descárgalo.** Cada corte cae en el sample que marcaste; aquí no hay redondeo a ningún fotograma clave, porque el sonido no tiene. Lo único que vale la pena elegir es cuánto fundido poner en cada unión: cinco milisegundos bastan para evitar un chasquido y son demasiado cortos para oírse como un fundido. Lo que sale es un WAV, que se reproduce primero en la página y después va directo a las descargas de tu navegador.

## La versión larga

[Cómo cortar audio sin perder calidad](https://abox.tools/es/guias/cortar-un-archivo-de-audio/): Dónde cae de verdad un corte de audio, por qué puede ser exacto cuando uno de vídeo no puede, por qué a veces una unión chasca, y qué está haciendo en realidad un fundido de cinco milisegundos.

## También en la caja

- [Editor de audio](https://abox.tools/es/editar-audio/): Ponla del revés, cámbiale la velocidad o levanta una grabación floja, y todo aquí mismo.
- [Unir y separar PDF](https://abox.tools/es/unir-pdf/): Páginas movidas de sitio sin pasar por ningún servidor.
- [Compresor de PDF](https://abox.tools/es/comprimir-pdf/): Reduce un documento sin mandarlo a ninguna parte.
- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.

## Preguntas

### ¿Se sube mi audio a alguna parte?

No. Lo lee, lo marca, lo corta y lo escribe tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Si prefieres comprobarlo a que te lo cuenten, desconéctate de internet y corta una grabación igualmente.

### ¿Puedo quedarme con varios trozos de la misma grabación?

Para eso está. Pulsa `I` y `O` tantas veces como quieras mientras suena; cada pareja se convierte en una fila, y el archivo terminado son todas las filas unidas en orden y sin nada más. Casi todos los cortadores en línea te dan una pareja de tiradores y te preguntan qué único tramo conservar, lo cual está bien para recortar la entrada y la salida de una sintonía y no sirve absolutamente de nada para escuchar una hora de entrevista una vez y quedarte con las seis respuestas que valen.

### ¿El corte cae exactamente donde lo marqué?

Sí, en cada trozo y en cualquier reproductor. Este es el sitio en el que el audio es más sencillo que el vídeo: una grabación decodificada es una tirada de números y cada uno vale por sí mismo, así que no hay ningún equivalente de un fotograma clave al que redondear ni ninguna razón para que un corte empiece antes de tiempo. La página enseña el número de sample en el que empieza el resultado, que es la marca que hiciste multiplicada por la frecuencia de muestreo y redondeada al sample entero más cercano.

### ¿Por qué chascaría una unión, y para qué es el fundido?

Porque cortar de la mitad de una palabra a la mitad de otra pone dos ondas que no tienen nada que ver una al lado de la otra, y a un altavoz al que se le pide saltar entre ellas le sale un chasquido. No es un fallo del corte: es como suena una discontinuidad. La solución es un fundido de unos pocos milisegundos a cada lado de cada unión, lo bastante largo para que el cono llegue y demasiado corto para oírse como un fundido. Cinco milisegundos es lo que viene puesto y se puede quitar. El fundido solo se pone en un borde que sea de verdad un corte, así que un borde justo al principio o al final de la grabación se queda exactamente como estaba.

### ¿Puedo quitar los trozos malos en vez de conservarlos?

Sí. Márcalos y luego elige «Quitarlos»: lo que *no* marcaste se une en su lugar, en orden. La misma lista de marcas responde a las dos preguntas, así que puedes cambiar de una a otra y ver cómo cambia la duración sin marcar nada dos veces.

### ¿Puedo guardar mis marcas y volver a ellas?

Sí. «Guardar marcas» escribe un archivo de texto plano, una línea por trozo, con el inicio y el final separados por una coma, y «Cargar marcas» lee uno. Se ofrecen dos formatos, segundos a secas y `HH:MM:SS.mmm`, y los dos son la misma disposición que escribe el cortador de vídeo de este sitio, así que un archivo hecho contra el vídeo se puede soltar sobre su audio y al revés. Marcar es trabajo minucioso y nadie debería tener que hacerlo dos veces.

### ¿Qué formatos puedo abrir?

Lo que decodifique tu navegador, que en la práctica significa MP3, WAV, FLAC, M4A y AAC, Ogg Vorbis y Opus, y el audio dentro de vídeos MP4, M4V, MOV y WebM. Lo que se queda fuera es la misma lista corta de siempre: AVI, WMA y casi todos los MKV. Un archivo que este navegador no vaya a leer se rechaza con un mensaje que lo dice, en vez de fallar a medio camino.

### ¿Por qué guarda un WAV en vez de un MP3?

Porque ningún navegador incluye un codificador de MP3, y esta herramienta se niega a mandar tu grabación a un servidor que sí lo tenga. Un WAV no necesita codificador ninguno, son los samples con una cabecera corta delante, así que es a la vez la opción honesta y la única que no puede costar calidad a la salida. Es más grande: unos diez megabytes por minuto en estéreo. Cualquier reproductor, teléfono y editor abre uno, y lo que quiera un MP3 puede hacerlo a partir de él. Cortar un MP3 copiando sus tramas mantendría el archivo pequeño, pero también movería cada corte al límite de trama más cercano, que es justo el redondeo que esta herramienta existe para no hacer.

### ¿Hay un límite de duración de la grabación?

No hay ningún límite metido en la herramienta. El techo práctico es la memoria: la grabación entera se decodifica de golpe en esta página, y el WAV se monta en memoria antes de que lo descargues, así que una hora en estéreo necesita algo menos de un gigabyte para trabajar. Un WAV de cuatro gigabytes se rechaza directamente, porque el propio campo de tamaño del formato no puede describirlo.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu grabación.

## Cómo se comprueba la promesa de privacidad

- **Tus grabaciones no tienen por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún destino donde pudiera recogerse tu archivo, ni nada en el código que lo enviara si lo hubiera.
- **Aquí nada pide nada.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, nada que descargar, ningún motor que se baje la primera vez. Cada byte que toca tu audio vino de este origen cuando cargó la página.
- **El decodificador es el que ya está en tu navegador.** El archivo se le pasa a `decodeAudioData`, el mismo código que reproduce una pista en un elemento `<audio>`. Aquí no se envía nada para leer tu formato, y tampoco se le pide nada a nada de fuera de esta página para leerlo.
- **La imagen de un vídeo no se decodifica en ningún momento.** Cuando sueltas un vídeo, solo se pide su pista de audio. Los fotogramas no se leen, no se decodifican, no se dibujan y no se miran: no hay código en esta página que pudiera, y el archivo que sale lleva sonido y nada más.
- **El corte es una copia, en memoria, en este equipo.** Cortar es un `set` por trozo y por canal: los samples que has conservado se mueven a un array nuevo en el orden en que los pusiste. Lo único que se multiplica por algo son los pocos cientos de samples de cada fundido, y la página te dice cuántos antes de que pulses el botón.
- **Los samples se escriben tal cual, no se vuelven a codificar.** Un WAV son los samples que tiene esta página con una cabecera delante. No hay ningún codificador en el bucle tomando decisiones sobre tu grabación, ni nada que pudiera describirse como una subida en la que eso ocurriera.
- **El archivo de marcas se hace en la página.** Guardar tus marcas escribe un archivo de texto a partir de los números que ya están en pantalla, directo a tus descargas. Cargar uno lo lee aquí. Ninguno de los dos se acerca a una red, y ninguno lleva más que tiempos.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu grabación: ni el archivo, ni un sample, ni un nombre, un tamaño, una duración o dónde has cortado. Cada línea que lee, corta y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tu grabación.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/segments.js` para las marcas y el archivo en el que se guardan, `src/shared/audio-decode.js` para las veinte líneas que le pasan tu archivo al decodificador del propio navegador, `src/trim.js` para las cuentas que convierten una marca en una tirada de samples y el bucle que los copia, y `src/shared/wav.js` para la cabecera que va delante de ellos. Ninguno importa nada que pueda hacer una petición.
