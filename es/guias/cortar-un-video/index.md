# Cómo cortar un vídeo sin recodificarlo

Cortar no le cambia el aspecto a ningún fotograma, así que un buen cortador ni los toca: los traslada a un archivo nuevo tal y como estaban. Aquí va lo que eso te ahorra, y el único sitio donde se nota.

[Abrir Cortador de vídeo](https://abox.tools/es/cortar-video/): Marca lo que vale mientras se reproduce. Te lo devuelve como un solo vídeo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [cortador de vídeo](https://abox.tools/es/cortar-video/), arrastra el clip dentro, pulsa `I` y `O` para marcar cada trozo que quieras, tantos como te apetezca, y exporta. En un MP4, un MOV o un M4V, los fotogramas que conservas se trasladan al archivo nuevo tal y como estaban, con los mismos bytes y los mismos ajustes de codificación, y el sonido se copia muestra a muestra sin descodificarlo.

O sea que un corte no te cuesta nada de calidad, y además va rápido: sacar un minuto de una grabación de cuatro gigabytes viene a costar lo que cuesta escribir ese minuto en disco, porque a los fotogramas se les apunta en vez de cargarlos. Lo único que se nota es dónde cae de verdad tu corte, y de eso va el resto de esta página.

## Por qué un corte no tiene por qué perder nada de calidad

Cortar no le cambia el aspecto a ningún fotograma. Cada fotograma que conservas tiene que salir idéntico a como entró, así que no hay ninguna razón para descodificarlo y volver a codificarlo, y sí muchas para no hacerlo: una recodificación tiene pérdidas, y te empeoraría un poco el clip entero solo por acortarlo.

Así que un buen cortador no recodifica. Lee el índice del archivo, calcula qué fotogramas codificados caen dentro de tu rango y escribe esos bytes en un contenedor nuevo con un índice nuevo delante. Por esa vía no se descodifica absolutamente nada.

Muchas herramientas recodifican igualmente, porque descodificar y volver a codificar es muchísimo más fácil de programar que analizar el formato del contenedor. Y normalmente sabes cuál te ha tocado por lo que tarda: una copia va tan rápido como escriba tu disco, mientras que una recodificación va tan rápido como codifique vídeo tu dispositivo, que es cien veces más lento.

## Los fotogramas clave, y por qué tu corte puede caer antes

De esta limitación sale todo lo demás que hay que saber sobre cortar.

El vídeo no se guarda como una secuencia de imágenes completas, porque eso ocuparía una barbaridad. Casi todos los fotogramas se guardan como una descripción de en qué se diferencian de sus vecinos, y por eso no se pueden descodificar por su cuenta: hacen falta los fotogramas de alrededor. El único que se sostiene solo, como imagen completa, es el **fotograma clave**, y los fotogramas clave suelen ir separados entre uno y diez segundos.

Así que si marcas un corte dos segundos después del último fotograma clave, un cortador que copia fotogramas no puede empezar ahí: los fotogramas de tu marca son ilegibles sin la tirada que lleva hasta ellos. No le queda otra que arrastrar el tramo entero desde el fotograma clave anterior a tu marca.

Lo interesante es qué hace con eso. El formato de archivo tiene una manera estándar de decir *empieza a reproducir en este punto*: los fotogramas de más siguen en el archivo, pero el contenedor le indica al reproductor que se los salte. Cualquier reproductor corriente lo respeta, y el clip empieza exactamente donde dijiste. Uno que lo ignore empezará antes, hasta el hueco de un fotograma clave.

La herramienta de aquí te dice en qué caso estás, y por cuánto, antes de exportar. Así es una decisión y no una sorpresa.

## Cuándo aceptar una recodificación

Existe también el corte exacto, que funciona recodificando el tramo inicial: descodifica desde el fotograma clave y escribe una tirada nueva de fotogramas que sí empieza donde lo marcaste. Es más lento, y cuesta algo de calidad, pero solo en ese tramo inicial.

Tira de él cuando el clip vaya a parar a un sitio que no vaya a respetar la instrucción del contenedor, o donde no controles el reproductor: algunos editores de vídeo, algunos sistemas de emisión y videoconferencia y algunos reproductores por hardware antiguos. Para todo lo demás, que es casi todo, quédate con la copia: un navegador, un móvil, una plataforma social, un reproductor multimedia.

Hay una tercera opción que no cuesta nada: mover tu marca. Si la herramienta te enseña dónde están los fotogramas clave, llevar el corte al más cercano te da un corte exacto sin ninguna recodificación. Pocas veces compensa renunciar a una copia por un segundo de diferencia.

![La tarjeta de exportación: el método, un control de calidad, un interruptor para el sonido y un resumen que cuenta los trozos, la duración y el tamaño.](https://abox.tools/screens/trim-a-video/summary.webp)

En el resumen se toma la decisión de esta sección: lo que costará la copia y lo que costaría en su lugar volver a codificar.

## Sacar un trozo del medio

Quitar un tramo es otra operación distinta de conservar uno, y conviene saber que está disponible, porque muchos cortadores solo hacen lo segundo. Marca la parte que no quieres, elige quitarla y lo que queda a cada lado se une en un solo clip, con el sonido trasladado en sincronía.

La unión arrastra la misma limitación de fotograma clave en el punto donde arranca la segunda mitad, y por el mismo motivo. Funciona por las dos vías de MP4 de aquí, y es lo único que no puede hacer la alternativa por grabación de más abajo, porque una grabación se hace de una pasada y desde un solo cabezal.

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
