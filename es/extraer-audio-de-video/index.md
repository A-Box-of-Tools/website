# Extraer el audio de un vídeo — el sonido a solas, en WAV

Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.

> Saca el sonido de un MP4, MOV o WebM y guárdalo como WAV. El vídeo no sale de tu dispositivo y su imagen no se descodifica en ningún momento: todo el trabajo ocurre en tu propio navegador.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/extraer-audio-de-video/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus vídeos **nunca se suben**. No hay ningún servidor.

El descodificador es el que ya trae tu navegador, el mismo camino de código que reproduce un archivo en un elemento `<video>`, y se le pide la pista de audio y nada más. Escribir un WAV consiste en poner una cabecera de cuarenta y cuatro bytes delante de las muestras, y eso está en `src/shared/wav.js`. No hay ningún codificador por medio, no hay paso de subida, y esta página no tiene función de red de ninguna clase.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin límite de tamaño
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo extraer el audio de un vídeo sin subirlo

1. **Suelta el vídeo.** Un MP4, MOV, M4V o WebM, de un móvil, de una cámara, de un grabador de pantalla o de una descarga. Lo lee tu propio navegador; no hay paso de subida que omitir.
2. **Lee lo que ha encontrado.** La duración, el número de canales y la frecuencia de muestreo, sacados directamente del archivo. Si el archivo no declaró su frecuencia, la página lo dice, en lugar de remuestrear en silencio y afirmar que no se tocó nada.
3. **Elige mono si lo quieres más pequeño.** Dejar los canales como están mantiene la grabación exactamente igual que era. Mezclar a mono reduce el archivo a la mitad y es lo que quiere una transcripción o una grabación de voz; promedia los canales en lugar de tirar uno.
4. **Escúchalo antes de guardarlo.** El reproductor es el archivo que está a punto de descargarse, no el vídeo, así que si suena bien, la descarga está bien.
5. **Llévatelo, o pásalo al siguiente.** Descarga el WAV, o mándalo directamente al recortador o al editor sin guardarlo antes.

## También en la caja

- [Cortador de audio](https://abox.tools/es/cortar-audio/): Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.
- [Editor de audio](https://abox.tools/es/editar-audio/): Ponla del revés, cámbiale la velocidad o levanta una grabación floja, y todo aquí mismo.
- [Unir y separar PDF](https://abox.tools/es/unir-pdf/): Páginas movidas de sitio sin pasar por ningún servidor.
- [Compresor de PDF](https://abox.tools/es/comprimir-pdf/): Reduce un documento sin mandarlo a ninguna parte.

## Preguntas

### ¿Se sube mi vídeo a alguna parte?

No. Tanto la descodificación como la escritura ocurren en tu propio navegador, en tu propio hardware. Esta herramienta no tiene función de red de ninguna clase — nunca descarga nada y nunca envía nada — y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Si prefieres comprobarlo a que te lo cuenten, desconéctate de internet y saca el sonido igualmente.

### ¿Puede darme un MP3?

No, y no va a fingir que sí. Ningún navegador trae un codificador de MP3, y la única manera de llegar a uno es mandar tu vídeo a un servidor que lo tenga, que es justo lo que este sitio existe para no hacer. Lo que obtienes es un WAV: las muestras con una cabecera de cuarenta y cuatro bytes delante, que no necesita codificador alguno y no puede costar calidad. Es más grande, unos diez megabytes por minuto en estéreo, y lo abre cualquier reproductor, móvil o editor. Lo que quiera un MP3 puede hacer uno a partir de él en un segundo.

### ¿Se llega a mirar la imagen?

No, y aquí no hay nada que pudiera mirarla. Al descodificador del navegador se le entrega el archivo y se le pide su pista de audio; la pista de vídeo no se descodifica nunca, no se dibuja nunca y no llega siquiera al código de esta página. En `src/` no hay ningún descodificador de vídeo que pudiera ejecutarse. El archivo que sale contiene sonido y nada más.

### Dice que no se pudo leer sonido, pero el vídeo se ve perfectamente.

Entonces es casi seguro que el vídeo no tiene pista de audio. Una grabación de pantalla hecha sin micrófono seleccionado es muda, y también lo es un clip exportado por un editor con el sonido silenciado; los dos se reproducen perfectamente, porque hay imagen que reproducir. El mensaje nombra esto primero porque es la más probable de las dos causas; la otra es un formato que este navegador no va a leer. Abre el archivo en un reproductor y busca un control de volumen que no haga nada: es la forma más rápida de saber cuál de las dos tienes.

### ¿Qué formatos de vídeo puedo abrir?

Los que descodifique tu navegador, que en la práctica significa MP4, M4V, MOV y WebM, y todos los formatos de audio además. Lo que queda fuera es la misma lista corta que en el resto del sitio: AVI, WMV y la mayoría de los MKV. Un archivo que tu navegador no vaya a leer se rechaza con un mensaje que lo dice, en lugar de fallar a mitad de camino.

### ¿Se pierde calidad?

Nada más allá de lo que el vídeo ya le hizo a su propio audio cuando se creó. Las muestras que devuelve el descodificador se escriben tal cual: no hay una segunda codificación, así que no hay una segunda generación de pérdida. Lo único que conviene saber es la frecuencia de muestreo: la del propio archivo se lee primero de su cabecera y la descodificación se hace a esa frecuencia, de modo que tu grabación no se remuestrea en silencio. Si un archivo no declara ninguna, la página dice qué frecuencia supuso.

### ¿Por qué el WAV es mucho más grande que el vídeo?

Porque un WAV no está comprimido y la pista de audio del vídeo sí lo estaba. El sonido con calidad de CD ocupa unos diez megabytes por minuto en estéreo, contenga lo que contenga; la pista AAC dentro de un MP4 quizá una décima parte de eso. Mezclar a mono lo reduce a la mitad. Es el precio de no recodificar, y se paga una sola vez: lo que abras después con el archivo ya puede comprimirlo.

### ¿De qué duración puede ser el vídeo?

Aquí no hay ningún límite puesto, porque no hay un servidor pagándolo. El techo real es la memoria de tu propio dispositivo: el archivo se lee entero y toda la pista de audio se mantiene como muestras, así que una grabación muy larga en un dispositivo pequeño puede quedarse sin sitio. Unas cuantas horas de vídeo normalmente van bien, y un móvil aguantará menos que un portátil.

### ¿Puedo recortarlo o subirle el volumen?

Sí, pero no aquí: esta página hace un solo trabajo. Cuando hay un resultado aparece una fila de enlaces junto a la descarga que lo lleva directamente al [recortador de audio](https://abox.tools/es/cortar-audio/) o al [editor de audio](https://abox.tools/es/editar-audio/) sin guardarlo antes, y sin que ninguno de los dos lo suba tampoco.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni límite de cuántos vídeos abres. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tu archivo.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y sigue funcionando. Esa es también la forma más simple de demostrar que no se sube nada: una herramienta que mandara tu vídeo fuera para procesarlo se pararía en el momento en que te desconectaras.

## Cómo se comprueba la promesa de privacidad

- **Tu vídeo no tiene adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Aquí no hay ningún punto final donde recoger un archivo, ni nada en el código que lo enviaría si lo hubiera.
- **La imagen no se descodifica en ningún momento.** Solo se pide la pista de audio. Los fotogramas no se leen, ni se descodifican, ni se dibujan, ni se miran, porque en esta página no hay código capaz de hacerlo, y el archivo que sale contiene sonido y nada más. No es una promesa de contención: a `decodeAudioData` se le entregan los bytes y devuelve sonido, y en `src/` no hay ningún descodificador de vídeo que pudiera ejecutarse.
- **El descodificador es el que ya trae tu navegador.** Aquí no se envía nada para leer tu formato, ni se le pide nada a nada de fuera de esta página para leerlo. Qué archivos funcionan es, por tanto, lo que tu navegador ya sabe reproducir.
- **Las muestras se escriben tal cual, no se vuelven a codificar.** Un WAV son las muestras que devolvió el descodificador con una cabecera delante. No hay ningún codificador por medio tomando decisiones sobre tu grabación, ni nada que pudiera describirse como una subida donde eso pudiera ocurrir.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación de Buy Me a Coffee. A ninguno se le entrega nada sobre tu vídeo: ni el archivo, ni una muestra, ni un nombre, un tamaño o una duración.
- **Funciona sin conexión.** Desconecta la red y la herramienta sigue igual, porque nunca hubo un paso de red en ella. Es la prueba más simple de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/audio-decode.js` para el único descodificador que hay y para saber por qué nunca se pide la imagen, y `src/shared/samplerate.js` para el olfateo de cabecera que evita que tu grabación se remuestree en silencio.
