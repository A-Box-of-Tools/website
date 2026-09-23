# Cómo limpiar una nota de voz antes de enviarla

Una nota de voz llega con treinta segundos de ruido de bolsillo, dos comienzos en falso y un nivel que fijó la distancia al teléfono. Dejarla lista para enviar son dos pasos — cortar y después subir — y ambos corren en tu navegador, que es donde debe quedarse una grabación de tu propia voz diciendo cosas privadas.

[Abrir Editor de audio](https://abox.tools/es/editar-audio/): Ponla del revés, cámbiale la velocidad o levanta una grabación floja, y todo aquí mismo.

Última actualización 26 de agosto de 2026

## La respuesta corta

1. **Corta.** Abre el [Recortador de audio](https://abox.tools/es/cortar-audio/), suelta la nota y marca las partes que valen con `I` y `O` mientras suena. La forma de onda enseña los silencios y los comienzos en falso como tramos planos, así que la mayor parte del corte se hace a ojo. Exporta un solo archivo.
2. **Sube.** Lleva ese archivo al [Editor de audio](https://abox.tools/es/editar-audio/) y normaliza: el nivel sube hasta justo debajo de la plena escala, lo más alto que puede estar una grabación sin saturar. Exporta, y envía eso.

El viaje entre los dos no necesita descarga: en cuanto el recortador exporta, una fila bajo su botón de descarga ofrece llevar el resultado directamente al editor, y la nota llega allí ya cargada.

Los dos pasos corren en tu propio equipo. Una nota de voz es de lo más personal que puede ser un archivo, y las webs de «mejorar audio online» de siempre se quedan una copia como precio del control deslizante.

![El editor de audio con una grabación cargada: su duración, su formato, su frecuencia de muestreo y un pico de unos seis decibelios negativos.](https://abox.tools/screens/clean-up-a-voice-memo/source.webp)

Lo que la herramienta averigua antes de que toques nada. El nivel de pico es la cifra que decide si subir el volumen es seguro.

## Por qué cortar antes de subir

Porque normalizar lee el archivo entero para encontrar su momento más alto, y en una nota en bruto el momento más alto suele ser justo lo que estás a punto de borrar: el golpe del teléfono al soltarlo, la tos antes de la segunda toma. Normaliza primero y ese pico fija el techo, con lo que la voz sale tan baja como entró. Corta la broza y lo más alto que queda es la voz misma, que es en lo que debe gastarse el margen.

El recortador corta en la muestra exacta y funde cada unión durante unos milisegundos, así que un corte en mitad del ruido de la habitación no puede chascar. Solo las uniones: el audio intacto entre ellas se copia, no se recodifica.

## Lo que el editor arregla, y lo que no

Normalizar arregla lo *bajo*. No arregla lo ruidoso: el nivel del aire acondicionado sube con el de la voz, porque es una sola grabación y van dentro juntos. Lo que mantiene inteligible una nota es sobre todo el corte — el aire muerto es donde el ruido se oye a solas — más el control de velocidad por consideración al oyente: 1,25× conservando el tono es el truco de los pódcast, y funciona igual de bien con una nota que divaga.

El editor escribe WAV — muestras exactas, sin codificador de por medio — así que el archivo pesa más que el original comprimido. Para una nota que se mide en minutos es un precio justo por no apilar nunca una segunda codificación con pérdida sobre la primera que hizo el teléfono; el mensajero que la envíe la comprimirá una vez más de todos modos, y esa debería ser la única.

![El editor: un control de velocidad en 1,25, un control de volumen en más cuatro decibelios y un resumen de la duración, la velocidad y el pico resultantes.](https://abox.tools/screens/clean-up-a-voice-memo/edit.webp)

Velocidad y volumen, con el resumen debajo diciendo qué van a hacer. Nada se aplica hasta que exportas, así que ambos se pueden mover y devolver a su sitio.

## La misma cadena, grabaciones más largas

Una entrevista, una clase, una reunión: la cadena es la misma, solo que el corte rinde más. Marca las preguntas que importan, deja caer el resto, y las propias marcas se guardan como un archivo de texto plano y se recargan, lo que convierte una limpieza larga en algo que se puede soltar y retomar. Para el audio que vive dentro de un video, el editor también saca la pista de un MP4 o un MOV sin tocar la imagen: el primer paso para convertir una llamada grabada en algo escuchable de camino al trabajo.

## Si haces esto cada semana

Cortar y subir viven en dos páginas a propósito: cada una hace un trabajo, y cada una puede demostrar por sí sola que la grabación nunca salió de tu equipo. Pero las dos son código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias cuyos README explican los cortes a muestra exacta y el escritor de WAV.

Si te llueven notas a diario, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele la versión de una página: forma de onda, marcas, normalizar al exportar. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
