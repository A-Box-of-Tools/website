# Cómo extraer el sonido de un vídeo

Elige un vídeo y guarda su pista decodificada como WAV en el navegador. La salida solo contiene audio; su tamaño y precisión dependen de la profundidad y los canales.

[Abrir Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.

Última actualización 12 de octubre de 2026

## Elige el vídeo y escucha el resultado

Abre el extractor y elige o arrastra el vídeo. El navegador decodifica su audio y crea un WAV automáticamente. Escucha el resultado antes de descargar. Un vídeo silencioso no tiene pista que extraer y un códec no admitido por el navegador necesita otro decodificador.

La conversión ocurre en tu dispositivo, sin subir el archivo para decodificarlo. Los vídeos grandes necesitan memoria para la entrada, las muestras decodificadas y la salida; procesar localmente no hace ilimitada la memoria.

![Profundidad WAV y opciones de canales junto al reproductor del audio extraído.](https://abox.tools/screens/extract-audio-from-a-video/output.webp)

El reproductor usa el WAV disponible para descargar. Cambiar profundidad o canales crea un resultado nuevo.

## Elige 16 bits o Float32

PCM de 16 bits es la opción predeterminada para una reproducción ampliamente compatible. Al escribirlo se redondean y limitan las muestras decodificadas. Float32 conserva sus valores si los canales no cambian, incluso por encima de la escala completa, y sirve para editar después. No restaura detalles ya perdidos por compresión.

WAV guarda audio sin comprimir y puede ser mucho mayor que la pista comprimida del vídeo. El extractor no produce MP3 porque no incluye un codificador MP3. Otra aplicación con codificador local puede crear MP3 sin subir el archivo.

## Conserva los canales o mezcla a mono

Conserva los canales originales para mantener su separación. Mono los promedia en uno: puede reducir el tamaño, pero elimina la posición estéreo y puede cancelar sonidos cuando los canales se oponen. Escucha tras cambiar esta opción.

La herramienta lee la frecuencia de muestreo original cuando su cabecera la expone y decodifica a esa frecuencia. Si debe asumir una, los datos de salida indican cuál. Compruébalos si la duración o la frecuencia importan para la siguiente aplicación.

## Guarda, cancela o vuelve a intentarlo

Cambiar profundidad o canales reemplaza automáticamente el resultado anterior. Descarga la versión escuchada. Cancelar retira el trabajo actual; una decodificación en curso puede terminar internamente, pero su resultado tardío no reemplaza una elección nueva. Si falla la escritura, usa Crear WAV de nuevo con la fuente actual.

Para acortar la pista, sigue en el [recortador de audio](https://abox.tools/es/cortar-audio/). Para fundidos, ganancia o invertirla, usa el [editor de audio](https://abox.tools/es/editar-audio/).
