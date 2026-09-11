# Cómo invertir un vídeo

Reproducir un clip al revés suena como la edición más sencilla que hay, y es la que un archivo de vídeo está peor preparado para hacer. Esto es lo que tiene que pasar de verdad, lo que cuesta, y el único paso que conviene dar antes.

[Abrir Invertidor de vídeo](https://abox.tools/es/invertir-video/): El último fotograma primero, con sonido y todo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Invertidor de vídeo](https://abox.tools/es/invertir-video/), suelta el clip dentro, decide si quieres el sonido invertido también, y exporta. Lo que sale es el mismo clip con su último fotograma primero, y dura exactamente lo mismo que el que entró.

A diferencia de cortar, esto obliga a escribir cada fotograma otra vez, y el sonido también. No es una carencia de una herramienta concreta: es lo que es invertir. El resto de esta página explica por qué, y qué significa para lo que vas a esperar.

## Por qué un vídeo no se puede reproducir al revés sin más

Un archivo de vídeo no es un montón de fotos. Aproximadamente uno de cada cincuenta fotogramas es una imagen entera —un *fotograma clave*— y todo lo que hay entre medias es una descripción de lo que cambió respecto a los fotogramas de alrededor. Por eso una hora de vídeo cabe en un móvil.

También significa que un decodificador solo puede ir hacia delante. Para enseñarte el último fotograma de un clip tiene que encontrar el fotograma clave anterior y decodificar todo lo que hay en medio. Pídele el penúltimo y hará el mismo trabajo otra vez.

Así que invertir se hace por grupos: decodificar un grupo hacia delante, guardarse los fotogramas, dárselos al codificador en el otro orden, pasar al grupo anterior. La alternativa evidente —decodificar el clip entero a una lista y recorrerla hacia atrás— necesita unos 3 MB de memoria por fotograma en 1080p, o 5 GB por minuto, que es por lo que las herramientas que lo hacen así se caen con cualquier cosa que dure más de unos segundos.

![La tarjeta de origen: el nombre del clip, su tamaño, el tamaño de su imagen, su duración y su códec.](https://abox.tools/screens/reverse-a-video/source.webp)

Lo que la herramienta averiguó sobre el archivo. Invertir es la única operación que no se puede hacer al vuelo, así que estas cifras deciden si cabe en memoria.

## Qué pasa con el sonido

Aquí es donde más se diferencian las herramientas de inversión, y donde vale la pena comprobar qué te han dado en realidad.

El sonido se comprime en paquetes de unas pocas decenas de milisegundos, cada uno codificado contra el anterior. Escribir esos paquetes al revés *no* reproduce una pista hacia atrás: reproduce trozos cortos hacia delante en el orden equivocado, lo cual suena a tartamudeo o a avería, no a inversión. La única forma de invertir el sonido como es debido es decodificar la pista entera, poner las muestras en el otro orden y volver a codificarla.

Eso es lo que pasa aquí, y por eso el sonido se recodifica cuando el [Cortador de vídeo](https://abox.tools/es/cortar-video/) y el [Recortador de vídeo](https://abox.tools/es/recortar-video/) no lo tocan nunca: esos trabajos no cambian *cuándo* pasa nada, y este no cambia ninguna otra cosa.

Si quieres la imagen al revés y nada de sonido —que es lo habitual para cualquier cosa que vaya a un feed que reproduce en silencio— quita la casilla. Va más rápido y el archivo es más pequeño.

![La tarjeta de exportación: un control de calidad, un interruptor para conservar el sonido y un resumen con el tamaño de salida, la duración y el número de fotogramas.](https://abox.tools/screens/reverse-a-video/export.webp)

El interruptor del sonido está aquí porque una voz del revés casi nunca es lo que nadie quería, y es más fácil decidirlo antes de exportar que después.

## Qué le cuesta a la imagen

Una recodificación. Los fotogramas salen en un orden para el que no se codificó nada en el archivo original, así que cada uno hay que escribirlo de nuevo.

Lo que una herramienta bien hecha no hará es gastar *más* de lo que gastó el original. Un clip invertido contiene exactamente las mismas imágenes que el que llegó, así que un bitrate más alto no tiene nada nuevo que describir: hace el archivo más grande sin que se vea mejor. El ajuste de calidad de aquí se mueve por debajo de ese techo, no por encima.

Como siempre, los pasos con pérdida se acumulan. Invertir un original es una generación. Invertir la exportación de una descarga de una grabación de pantalla son cuatro, y se nota.

## Corta primero, invierte después

Si el clip necesita las dos cosas, córtalo antes. Cortar es gratis —un buen cortador mueve fotogramas enteros sin decodificarlos— y cada segundo que quitas es un segundo que nadie tiene que decodificar y codificar otra vez.

Hacerlo al revés significa invertir metraje que estás a punto de tirar. En un clip largo, esa es la diferencia entre un trabajo de unos segundos y uno de varios minutos. La [guía de cómo cortar un vídeo](https://abox.tools/es/guias/cortar-un-video/) explica por qué ese primer paso no tiene por qué costarte nada de calidad.

El mismo orden vale para recortar: corta, recorta, invierte, y pagas una sola recodificación del clip más corto posible.

## Para qué lo usa la gente de verdad

- **El chiste del rebobinado.** Algo se cae, se rompe o salpica, e invertirlo lo devuelve a su sitio. Se lee como broma porque el metraje real reproducido al revés es inconfundible: el humo se recoge, el agua trepa.
- **Bumeranes hechos a mano.** Invierte un clip corto y únelo al original con el [Cortador de vídeo](https://abox.tools/es/cortar-video/); te queda el bucle de ida y vuelta sin la aplicación que suele hacerlo, y con la duración que tú quieras en vez de la suya.
- **Revelaciones.** Graba el estado final ya ordenado e inviértelo, para que un plato terminado se vuelva ingredientes o algo montado se desmonte. Es más fácil de grabar que la versión hacia delante, y esa es la gracia.
- **Habla al revés.** Que solo tiene interés si el sonido está invertido de verdad: mira más arriba.

## Formatos, y cuánto tarda

**MP4, M4V y MOV** se leen directamente, lleven lo que lleven dentro —H.264, HEVC, AV1 o VP9— mientras tu navegador pueda decodificar ese códec. Este es el camino rápido: el archivo se recorre hacia atrás un grupo de fotogramas cada vez, tan rápido como vaya tu equipo.

**Cualquier otra cosa que tu navegador pueda reproducir**, WebM sobre todo, se invierte llevando hacia atrás el reproductor del propio navegador por el clip, un instante cada vez. Funciona, y es más lento, porque cada uno de esos saltos obliga al navegador a decodificar desde el fotograma clave anterior. La página dice cuál de los dos caminos está usando, y por qué, antes de que empieces.

**AVI, WMV, FLV y casi todos los MKV** el navegador no los puede ni leer ni reproducir, y la herramienta los rechaza con un mensaje en vez de fallar a medio camino.

En cualquier caso este es uno de los trabajos más lentos de este sitio, porque cada fotograma se decodifica y se codifica y algunos se decodifican más de una vez. Un clip corto son segundos; uno largo en 4K es de los de arrancar y dejar trabajando.

## Por qué esto no necesita ninguna subida

Decodificar y recodificar vídeo en un navegador es reciente y es real: WebCodecs expone el mismo codificador por hardware que usa tu móvil para grabar vídeo, y es rápido por el mismo motivo. El trabajo pasa en la máquina que ya tiene el archivo, que para un vídeo grande es además la única disposición que tiene sentido: subirlo y descargar el resultado cuesta más tiempo que la codificación.

La herramienta de aquí no tiene ninguna función de red, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Desconéctate de internet e invierte un clip igualmente si prefieres comprobarlo a que te lo cuenten.

[¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone tres comprobaciones más que puedes hacerle a cualquier herramienta.
