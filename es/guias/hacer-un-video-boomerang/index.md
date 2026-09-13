# Cómo hacer un video boomerang

Un boomerang es un clip que va hacia delante, luego hacia atrás, y se repite. Ninguna herramienta de aquí tiene un botón de boomerang; sale de tres que hacen cada una lo suyo — cortar, invertir, unir — y la cadena entera corre en tu propio equipo.

Última actualización 26 de agosto de 2026

## La respuesta corta

1. **Corta el momento.** Abre el [Cortador de video](https://abox.tools/es/cortar-video/), marca el segundo o dos que deben ir y volver, y expórtalos como clip propio.
2. **Invierte una copia.** Suelta ese clip en el [Inversor de video](https://abox.tools/es/invertir-video/), deja el sonido fuera y exporta. Ya tienes el mismo momento dos veces, una en cada sentido.
3. **Une las dos.** De vuelta en el Cortador de video, suelta los dos archivos, marca cada uno entero, pon primero el que va hacia delante y exporta un solo archivo.

Ningún salto necesita descarga intermedia: tras cada exportación, una fila bajo el botón de descarga ofrece llevar el resultado directamente a la siguiente herramienta — al invertidor tras el primer corte, de vuelta al cortador tras la inversión — y el archivo llega ya cargado.

Ese archivo es el boomerang. Publícalo tal cual donde el video mudo se repita en bucle, o pásalo por el conversor de [Video a GIF](https://abox.tools/es/convertir-video-a-gif/) si el destino solo anima GIF. Cada paso ocurre en tu navegador; nada de esta cadena se sube, en ningún punto, a nadie.

## Por qué cortar primero

Invertir tiene que decodificar y recodificar cada fotograma que toca; la [guía de inversión](https://abox.tools/es/guias/invertir-un-video/) explica por qué no hay manera más barata. Cortar, en cambio, es casi gratis: el cortador pasa los fotogramas enteros sin recodificarlos.

Así que el orden es todo el truco. Invierte un clip de dos segundos y el paso caro trabaja sobre dos segundos; invierte el original y trabaja sobre todo, y la mayor parte la vas a tirar. En una grabación de móvil de cualquier duración, cortar primero es la diferencia entre un boomerang en menos de un minuto y una barra de progreso a la que mirar.

Corta apretado. Un boomerang se lee mejor cuando oscila sobre un solo movimiento — un salto, una salpicadura, un giro — y cada fotograma que conservas se paga dos veces, una por sentido.

![El cortador de vídeo con un segmento marcado entre los tres y los cinco coma seis segundos, y una tabla con el inicio, el final y la duración.](https://abox.tools/screens/make-a-boomerang-video/section.webp)

Un segundo o dos es todo lo que es un bumerán. Cortar primero es lo que hace barata la inversión, y en la tabla se decide la duración.

## Qué hacer con el sonido

Déjalo fuera, y hazlo en el paso de invertir: el inversor tiene una casilla exactamente para eso. El audio de un boomerang sonaría hacia delante y luego hacia atrás; el sonido invertido resulta inconfundiblemente raro, y casi todos los sitios donde acaba un boomerang lo reproducen mudo de todos modos. Sin sonido, además, invertir va más rápido y los dos archivos pesan menos.

Si aun así lo conservas, el cortador unirá los dos clips igualmente; pero la costura que el ojo perdona, el oído no la perdona.

## La unión, y lo que el cortador te dirá

Los dos archivos que unes son parientes cercanos — uno salió del otro — pero han pasado por codificadores distintos y no tienen por qué coincidir byte a byte en su formato. El cortador lo comprueba. Donde los dos coinciden, copia los fotogramas tal cual; donde no, recodifica una vez y lo dice en el panel de exportación, en vez de dejarte adivinando.

Ordena las partes antes de exportar: primero la ida, después la vuelta. Un boomerang que empieza por el retorno se lee como un error.

Un refinamiento que vale sus diez segundos: recorta un fotograma del principio del clip invertido antes de unir. El último fotograma de la ida y el primero de la vuelta son la misma imagen, y mostrarla dos veces deja el giro colgado un instante.

![La herramienta de inversión: un resumen con el tamaño de salida, la duración y el número de fotogramas, y un interruptor para conservar el sonido.](https://abox.tools/screens/make-a-boomerang-video/reverse.webp)

La segunda mitad. El interruptor del sonido importa aquí más que en ningún otro sitio, por lo que dice la sección de arriba.

## Video o GIF al final

Quédate con el MP4 si el destino reproduce video: es mucho más pequeño, mucho más nítido y se repite igual de bien. Convierte a GIF solo cuando el sitio lo exija, y entonces vigila el contador: un GIF paga cada fotograma, y un boomerang es su clip dos veces. La [guía del GIF parcial](https://abox.tools/es/guias/gif-de-una-parte-de-un-video/) cubre las palancas de ancho y fotogramas que lo mantienen bajo un límite de tamaño.

## Si haces esto cada semana

Tres páginas para un efecto es a propósito: cada herramienta hace un trabajo, y cada página puede demostrar por sí sola que tu material nunca sale del equipo. Pero las tres son código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias bajo `src/` con README que los explican.

Si los boomerangs son parte habitual de tu trabajo, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele que pliegue el recorrido de fotogramas del inversor y la unión del cortador en una página con un solo botón. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
