# Editor de audio — invertir, acelerar o amplificar una pista

Ponla del revés, cámbiale la velocidad o levanta una grabación floja, y todo aquí mismo.

> Pon una pista del revés, acelérala o ralentízala y levanta una grabación que quedó floja. También le saca el sonido a un vídeo. Todo en el navegador, sin subir nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/editar-audio/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus grabaciones **nunca se suben**. No hay ningún servidor.

Tu archivo lo lee, lo edita y lo escribe tu propio navegador, en tu propio hardware. Aquí no hay nada que pueda descargar ni enviar, porque esta herramienta no tiene ninguna función de red. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una grabación.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Entra vídeo, sale audio
- ✓ Funciona sin conexión

## Cómo editar un archivo de audio

1. **Elige un archivo.** Arrastra hasta el selector un MP3, WAV, FLAC, M4A, Ogg u Opus, o un vídeo, si lo que quieres es sacarle el sonido. El navegador lo lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Dale la vuelta, si es a lo que venías.** Una sola casilla. Las muestras se escriben empezando por la última, y eso es exactamente reversible: hazlo dos veces y tienes el archivo del principio, muestra por muestra.
3. **Ajusta la velocidad.** Arrastra el control, escribe un múltiplo o pulsa uno de los preajustes. Luego decide qué le pasa al tono. Puedes dejarlo donde está, que es lo que quieres para una clase a 1,5×, o dejar que se mueva con la velocidad, que es lo que hace una cinta y lo que sube o baja una voz.
4. **Ajusta el nivel.** O dices un cambio en decibelios, o pides que la grabación suba hasta que su momento más alto quede justo por debajo del techo. La página te dice dónde va a caer ese momento antes de que pulses nada, y te avisa si el ajuste que has elegido lo empujaría por encima de la escala completa.
5. **Guárdalo.** El trabajo lo hace tu propio hardware, así que lo que tarde depende de tu dispositivo y no de una cola. Lo que sale es un WAV, o sea, las propias muestras con una cabecera delante. Primero se reproduce en la página y después va directo a las descargas del navegador.

## La versión larga

[Cómo limpiar una nota de voz antes de enviarla](https://abox.tools/es/guias/limpiar-una-nota-de-voz/): Corta el aire muerto y los comienzos en falso, y sube después el nivel casi a plena escala. Dos herramientas del navegador seguidas, en el orden que conserva la calidad, y la grabación nunca sale de tu equipo.

## También en la caja

- [Unir y separar PDF](https://abox.tools/es/unir-pdf/): Páginas movidas de sitio sin pasar por ningún servidor.
- [Compresor de PDF](https://abox.tools/es/comprimir-pdf/): Reduce un documento sin mandarlo a ninguna parte.
- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.
- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.

## Preguntas

### ¿Se sube mi audio a alguna parte?

No. Tu propio navegador lo lee, lo edita y lo escribe, todo en tu propio hardware. Esta herramienta no tiene parte de servidor, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Y si prefieres comprobarlo a que te lo cuenten, desenchúfate de internet e invierte una pista igualmente.

### ¿Puedo sacarle el audio a un vídeo?

Sí, y aquí es el mismo trabajo que abrir un MP3. Suelta un MP4, un MOV o un WebM y solo se descodifica su pista de audio: la imagen no se lee en ningún momento, y lo que sale es un archivo de sonido sin vídeo dentro. Si eso es todo lo que quieres — el sonido, sin cambios —, entonces [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/) hace el mismo trabajo en una página que no tiene nada más. Vuelve aquí cuando el sonido también necesite cambios.

### ¿Cambiar la velocidad cambia el tono?

Solo si se lo pides. Con «Conservar el tono», la grabación se corta en ventanas solapadas de unos cincuenta milisegundos que se vuelven a colocar más juntas o más separadas, y cada posición se elige de modo que las ondas encajen donde se cruzan. Así una voz sigue siendo la misma voz a 1,5×. Con «Dejar que se mueva» lo que se hace es remuestrear, que es lo que ocurre al poner una cinta más rápido: al doble de velocidad, exactamente una octava más arriba.

### ¿Por qué guarda un WAV y no un MP3?

Porque ningún navegador trae un codificador de MP3, y esta herramienta se niega a mandarle tu grabación a un servidor que sí lo tenga. Un WAV no necesita codificador alguno, ya que son las muestras con una cabecera de cuarenta y cuatro bytes delante, así que es a la vez la opción honesta y la única que no puede costar calidad. Ocupa más: unos diez megabytes por minuto en estéreo. Lo abre cualquier reproductor, cualquier móvil y cualquier editor, y quien quiera un MP3 puede sacarlo de ahí.

### ¿Qué formatos puedo abrir?

Los que el navegador sepa descodificar, que en la práctica son MP3, WAV, FLAC, M4A y AAC, Ogg Vorbis y Opus, además del audio que va dentro de un vídeo MP4, M4V, MOV o WebM. Fuera queda la misma lista corta de siempre: AVI, WMA y casi todos los MKV. Un archivo que este navegador no sepa leer se rechaza con un mensaje que lo dice, en lugar de fallar a mitad de camino.

### ¿Subirle el volumen lo va a distorsionar?

Solo si te pasas de la escala completa, y la página te avisa antes de que lo hagas. El audio digital tiene un techo duro: una muestra no puede sonar más alta que la escala completa, así que todo lo que quede por encima se aplasta contra ese techo, y eso es lo que suena a distorsión. El ajuste que no puede hacerte eso es «Lo más alto que dé», porque calcula el margen que le queda a la grabación y usa exactamente ese. Todo lo que queda por debajo del techo es una multiplicación y nada más: súbelo 6 dB, bájalo 6 dB y las muestras están donde empezaron.

### ¿Invertir o cambiar la velocidad hace perder calidad?

Invertir no: salen las mismas muestras en el otro orden, y eso es exacto. Cambiar la velocidad mueve todas las muestras, así que es aritmética y no una copia. Aun así, el remuestreador filtra como es debido por el camino, de modo que acelerar no dobla las notas altas hacia abajo con ese timbre metálico, y las ventanas del estirador se colocan donde encajan las ondas y no donde cayera la cuenta. Ninguna de las dos vías vuelve a codificar nada, entre otras cosas porque aquí no hay ningún codificador con el que hacerlo.

### ¿Hay algún límite de duración del archivo?

La herramienta no lleva ningún límite dentro. El techo de verdad es la memoria: la grabación entera se descodifica de golpe en esta página, y el WAV se monta también en memoria antes de que lo descargues, así que una hora de estéreo necesita algo menos de un gigabyte para trabajar. Un WAV de cuatro gigabytes se rechaza sin más, porque el propio campo de tamaño del formato no da para describirlo.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tu grabación.

## Cómo se comprueba la promesa de privacidad

- **Tus grabaciones no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tu archivo, ni una línea de código que lo mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** Esta herramienta no tiene ninguna función de red: no hay dirección que pegar, ni nada que descargar, ni ningún motor que se baje la primera vez que la usas. Cada byte que toca tu audio llegó desde este origen al cargarse la página.
- **El descodificador es el que ya trae el navegador.** El archivo se le pasa a `decodeAudioData`, el mismo código que reproduce una pista en un elemento `<audio>`. Aquí no se manda nada fuera para leer tu formato, ni se le pide nada a nadie de fuera de esta página.
- **La imagen de un vídeo no se descodifica nunca.** Cuando sueltas un vídeo, solo se pide su pista de audio. Los fotogramas no se leen, ni se descodifican, ni se dibujan, ni los mira nadie. En esta página no hay código capaz de hacerlo, y el archivo que sale lleva sonido y nada más.
- **Las muestras se anotan, no se vuelven a codificar.** Un WAV son las muestras que ha calculado esta página con una cabecera delante. En el bucle no hay ningún codificador tomando decisiones sobre tu grabación, ni nada que se pueda llamar una subida sobre la que fuera a ocurrir algo.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tu grabación: ni un archivo, ni una muestra, ni un nombre, ni un tamaño, ni una duración, ni lo alta que estaba. Cada línea que lee, edita y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y se compone con Google Fonts. No es más que un enlace: no avisa de ninguna visita, y no se le entrega nada sobre ti ni sobre tu archivo.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/audio-decode.js` para las veinte líneas que le pasan tu archivo al descodificador del propio navegador, `src/stretch.js` para el estirador de tiempo, `src/speed.js` para el remuestreador y `src/shared/wav.js` para la cabecera que va delante de las muestras. Ninguno de ellos importa nada capaz de hacer una petición.
