# Cómo cortar un vídeo sin recodificarlo

Copiar permite acortar un vídeo sin cambiar sus fotogramas codificados. Esta guía explica las limitaciones de los fotogramas clave, cuándo se puede copiar con fiabilidad y cuándo conviene recodificar.

[Abrir Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [cortador de vídeo](https://abox.tools/es/cortar-video/), suelta el clip y pulsa `I` y `O` para marcar cada trozo que quieras. Después, elige cómo exportar. En MP4, MOV o M4V, «Conservar cada byte» traslada los fotogramas conservados y el sonido al archivo nuevo sin modificarlos. Está disponible para un tramo, o para varios si todos los posteriores empiezan en un fotograma clave. Las demás selecciones necesitan la opción identificada expresamente como recodificación.

La copia no cuesta calidad y es rápida: extraer un minuto de una grabación de cuatro gigabytes cuesta aproximadamente lo mismo que escribir ese minuto en el disco, porque se usan referencias a los fotogramas en lugar de cargarlos. La elección depende de dónde empiece cada tramo conservado. De eso trata el resto de esta página.

## Por qué un corte no tiene por qué perder nada de calidad

Si la selección admite la copia, cada fotograma conservado puede mantenerse exactamente como se codificó. Trasladar esos bytes evita descodificarlos y volver a codificarlos, así que esta vía acorta el vídeo sin añadir otra etapa de codificación con pérdida.

Cuando la copia puede respetar los tiempos elegidos, la herramienta lee el índice del archivo, determina qué fotogramas codificados hacen falta y escribe esos bytes en un contenedor nuevo con un índice nuevo delante. Por esa vía no se descodifica nada.

Recodificar resulta útil cuando no se pueden mantener de forma fiable los tiempos elegidos mediante una copia. Suele tardar más porque el navegador tiene que descodificar y codificar cada imagen conservada; la copia depende sobre todo de la velocidad con la que se pueda escribir el archivo.

## Los fotogramas clave, y por qué tu corte puede caer antes

De esta limitación sale todo lo demás que hay que saber sobre cortar.

El vídeo no se guarda como una secuencia de imágenes completas, porque eso ocuparía una barbaridad. Casi todos los fotogramas se guardan como una descripción de en qué se diferencian de sus vecinos, y por eso no se pueden descodificar por su cuenta: hacen falta los fotogramas de alrededor. El único que se sostiene solo, como imagen completa, es el **fotograma clave**, y los fotogramas clave suelen ir separados entre uno y diez segundos.

Así que si marcas un corte dos segundos después del último fotograma clave, un cortador que copia fotogramas no puede empezar ahí: los fotogramas de tu marca son ilegibles sin la tirada que lleva hasta ellos. No le queda otra que arrastrar el tramo entero desde el fotograma clave anterior a tu marca.

Para el primer tramo conservado, el formato puede indicar *empieza a reproducir en este punto*: los fotogramas de más siguen en el archivo, con una marca de edición que pide al reproductor que los omita. Los reproductores que respetan esa instrucción empiezan en la marca. Uno que la ignore también puede mostrar los fotogramas anteriores.

Los fotogramas ocultos en una unión posterior pueden hacer que el navegador muestre un tramo antes de tiempo, incluso si la lista de edición es correcta. Por eso la herramienta impide copiar cuando cualquier tramo posterior al primero empieza entre fotogramas clave. Explica el motivo y deja que elijas expresamente el método que recodifica.

## Cuándo aceptar una recodificación

«Cortar exactamente aquí» descodifica desde el fotograma clave anterior, descarta los fotogramas que quedan fuera de los tramos marcados y recodifica todos los fotogramas conservados. No se limita al tramo inicial. Tarda más que copiar y puede reducir la calidad de imagen en todo el vídeo conservado. El sonido se copia cuando su formato lo permite.

Elige esta opción cuando la copia no esté disponible para tu selección o cuando necesites que el resultado empiece en los fotogramas conservados sin depender de una marca de edición inicial. La copia sigue siendo útil para un tramo o para varios cuyos inicios posteriores coincidan con fotogramas clave, siempre que el reproductor de destino gestione correctamente la marca de edición inicial.

También puedes mover el inicio de un tramo a un fotograma clave que aparezca en la línea de tiempo. Así puede quedar disponible la copia de un tramo posterior sin recodificar. Cambia qué imágenes conservas, así que decide según el contenido que necesites.

![La tarjeta de exportación: el método, un control de calidad, un interruptor para el sonido y un resumen que cuenta los trozos, la duración y el tamaño.](https://abox.tools/screens/trim-a-video/summary.webp)

En el resumen se toma la decisión de esta sección: lo que costará la copia y lo que costaría en su lugar volver a codificar.

## Sacar un trozo del medio

Quitar un tramo es otra operación distinta de conservar uno, y conviene saber que está disponible, porque muchos cortadores solo hacen lo segundo. Marca la parte que no quieres, elige quitarla y lo que queda a cada lado se une en un solo clip, con el sonido trasladado en sincronía.

La copia puede unir los trozos restantes si todos los posteriores al primero se reanudan en un fotograma clave. Si uno posterior necesita fotogramas ocultos antes de su inicio, elige «Cortar exactamente aquí». La alternativa por grabación que se explica más abajo no puede unir trozos separados, porque graba una sola pasada continua desde un único cabezal de reproducción.

![La línea de tiempo con dos segmentos marcados, y debajo una tabla con el inicio, el final y la duración de cada uno y el total conservado.](https://abox.tools/screens/trim-a-video/marks.webp)

Dos trozos conservados de un mismo clip. La tabla se puede editar, así que una marca que cayó una quinta de segundo tarde se escribe en vez de volver a marcarse.

## Formatos, y la alternativa

**MP4, M4V y MOV** se leen directamente, lleven el códec que lleven dentro: H.264, HEVC, AV1 o VP9. Copiar fotogramas no implica descodificarlos, así que esta vía funciona incluso con un códec para el que tu navegador no tenga descodificador, que es una consecuencia agradable de no mirar las imágenes.

**Lo demás que el navegador sepa reproducir**, y el caso claro es el WebM, se corta reproduciéndolo y grabando el resultado. Funciona, pero tiene dos costes: tarda lo que dure el trozo, y la imagen y el sonido se vuelven a codificar.

**Los AVI, WMV, FLV y casi todos los MKV** el navegador no sabe ni leerlos ni reproducirlos, y la herramienta te lo dice en vez de fallar a mitad de camino. A esos conviértelos antes a MP4 con algo que sí los maneje.

## Dos cosas que salen mal en silencio en otras herramientas

**La rotación.** Un móvil graba en horizontal y escribe una instrucción de rotación dentro del archivo en lugar de girar los píxeles. Un cortador que copia fotogramas tiene que trasladar esa instrucción, y si no lo hace, tu clip vertical sale de lado, que es la manera clásica de cargarse un vídeo cortado. La vía exacta de aquí gira los fotogramas mientras los recodifica y escribe un archivo que ya no necesita ninguna rotación.

**La sincronía del audio.** El audio y el vídeo se guardan en flujos separados, con sus propios tiempos, y no se cortan por los mismos puntos. Si no se los alinea a conciencia en el corte, el sonido se va desplazando. Por la vía de copia de aquí, el audio se copia muestra a muestra sin descodificarlo, así que sale byte por byte igual que estaba en el archivo, y una marca de edición lo mantiene sincronizado con la imagen con una precisión de una milésima de segundo.

## Cortar no es recortar

Son dos palabras que se usan una por otra. Cortar cambia la duración del clip; recortar cambia la forma de la imagen. Si lo que quieres es una versión cuadrada de un vídeo horizontal, o quitarle las bandas negras de los lados, eso es el [recortador de vídeo](https://abox.tools/es/recortar-video/), que a diferencia de cortar sí tiene que recodificar, por la razón que explica [su guía](https://abox.tools/es/guias/recortar-un-video/).

## Por qué esto no necesita una subida — y menos esto

El vídeo es el tipo de archivo que más gente da por hecho que hay que subir, porque los archivos son grandes y el trabajo suena pesado. Y cortar es justamente el caso en que eso es menos cierto: por la vía de copia, el archivo casi ni se lee. La herramienta recorre el índice, calcula qué rangos de bytes conservar y los escribe. Subir un archivo de cuatro gigabytes a un servidor para que haga eso sería la manera más lenta posible de organizarlo.

Y es además el tipo de archivo en el que subir sale más caro si preferirías no hacerlo, porque un vídeo lleva caras, voces, casas y ubicaciones como no las lleva un documento. La herramienta de aquí no tiene ninguna función de red, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio.

Si prefieres comprobarlo a que te lo cuenten, desenchúfate de internet y corta un clip igualmente. [¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) plantea otras tres comprobaciones parecidas.
