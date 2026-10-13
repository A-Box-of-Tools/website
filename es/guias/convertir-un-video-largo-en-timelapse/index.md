# Cómo convertir un video largo en un timelapse

Una hora de atardecer, un día de obra, el trayecto diario a través del parabrisas: metraje que vale la pena, a una velocidad que nadie va a mirar. El trabajo es una decisión sobre el tiempo y otra sobre el destino, y todo corre en tu navegador, sobre un archivo que nunca sale de tu equipo.

[Abrir Creador de timelapse](https://abox.tools/es/crear-timelapse/): Una hora de grabación en veinte segundos.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Creador de timelapse](https://abox.tools/es/crear-timelapse/), suelta la grabación, y fija o una velocidad — cualquiera entre 1,1× y 1000× — o, sin hacer cuentas, cuánto debe durar el resultado. Sesenta segundos es un buen punto de partida para cualquier cosa que vaya a un feed. Elige los fotogramas por segundo, reduce el tamaño si el original es 4K, y exporta.

Si el destino solo anima GIF, pasa después el clip exportado por el conversor de [Video a GIF](https://abox.tools/es/convertir-video-a-gif/); pero lee antes la última sección, porque un timelapse es lo más caro que se le puede pedir a un GIF que cargue.

Ese viaje viene incorporado: tras la exportación, una fila bajo el botón de descarga ofrece llevar el resultado directamente al conversor, y el clip llega allí ya cargado.

## Di la duración, no la velocidad

«¿A qué velocidad?» es la pregunta equivocada, porque la respuesta honesta es una división que no deberías tener que hacer: noventa minutos de metraje en un minuto de resultado son 90×; un día de obra en treinta segundos queda más cerca de 3000× que de nada que sugiera un control deslizante. La herramienta acepta la duración final directamente y calcula el factor por su cuenta, con lo que la respuesta sobrevive al día en que metas una grabación más larga.

Para lo que sigue sirviendo un factor de velocidad es para los números pequeños. Entre 1,1× y 2× un video sigue siendo *mirable como video* — una clase, una demostración — y por encima de más o menos 8× deja de ser reproducción rápida y se vuelve timelapse, donde cada fotograma de salida es una muestra arrancada del flujo del tiempo y todo lo que hay entre muestras sencillamente ya no está.

Ese muestreo es también lo que hace rápido el trabajo. La herramienta lee solo los instantes que la salida necesita — a 100×, alrededor de una centésima del archivo — en vez de decodificar una hora para quedarse con un minuto.

![La tarjeta de velocidad: una velocidad de veinte veces, la duración resultante, el intervalo entre los fotogramas que se conservan y una tasa de fotogramas.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Di la duración que quieres y la velocidad sale sola, o al revés. El intervalo es la cifra que dice cuánto del original se está saltando.

## Fotogramas y tamaño, en corto

- **Fotogramas por segundo.** 30 se lee como movimiento fluido para casi todo; 60 solo se gana su tamaño doble cuando el movimiento es el tema, y 24 da a nubes y multitudes un tictac agradablemente de cine.
- **Tamaño.** Un timelapse se mira casi siempre en pequeño. Bajar 4K a 1080p deja en un cuarto los píxeles que el codificador debe describir, y en la pantalla de un teléfono nadie lo notará jamás.

![El resumen de la tarjeta de exportación: el número de fotogramas, el intervalo, la duración final, el tamaño estimado y cuánto hay que leer del archivo.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

La última línea es la que conviene notar: un timelapse lee una fracción del archivo, y por eso esto es rápido en un clip que tardaría una hora en recodificarse.

## Cuándo el timelapse quiere ser un GIF

Casi nunca. Un timelapse es cambio constante del cuadro entero — exactamente aquello en lo que la compresión GIF es peor — así que hasta uno corto cae en las decenas de megabytes mientras el MP4 pesa la décima parte, más nítido. Publica el video en cualquier sitio donde el video se reproduzca.

Cuando el destino de verdad solo anima GIF, corta la secuencia a unos pocos segundos con bucle en la [línea de tiempo del conversor](https://abox.tools/es/convertir-video-a-gif/), mantén el ancho modesto y deja caer los fotogramas a ⁦10–12⁩. La [guía del GIF parcial](https://abox.tools/es/guias/gif-de-una-parte-de-un-video/) es la versión larga de ese presupuesto.

## Si haces esto cada semana

Que los dos pasos vivan aquí en dos páginas es a propósito: cada página hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero todo lo que ejecutan es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias con un README que nombra cada uno.

Si una cámara en trípode es parte de tu rutina, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele que componga el muestreador y el codificador de GIF en una página con tu velocidad y tamaño ya puestos. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
