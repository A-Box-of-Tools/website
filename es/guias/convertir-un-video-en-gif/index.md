# Cómo convertir un vídeo en un GIF

El GIF es un formato de 1987 que guarda imágenes enteras en vez de movimiento, así que uno hecho a partir de un vídeo siempre sale grande. Aquí va cuál de los tres ajustes mover cuando se te va de tamaño, y cuánto te ahorra cada uno.

[Abrir Vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/): Elige el trozo, el tamaño y la cadencia.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [convertidor de vídeo a GIF](https://abox.tools/es/convertir-video-a-gif/), arrastra el clip dentro, marca los segundos que quieras y deja el ancho en 480 y la cadencia en 12 fotogramas por segundo. Ese es el ajuste que le viene bien a casi cualquier GIF. Y si el archivo sale demasiado grande, baja el ancho antes de tocar nada más, porque es el ajuste que paga dos veces.

El resto de esta página va del porqué, porque «mi GIF ocupa 14 MB» es el problema que tiene todo el mundo de verdad, y cuál es el ajuste que hay que mover no es nada evidente.

## Por qué un GIF de un vídeo es tan enorme

Un códec de vídeo guarda *movimiento*. Escribe una imagen completa cada par de segundos y luego, para cada fotograma intermedio, una descripción de cómo se ha movido esa imagen: este bloque de píxeles se ha deslizado cuatro a la izquierda, esta zona se ha oscurecido un poco. Un clip de cinco segundos puede ocupar unos cientos de kilobytes porque casi todo él son instrucciones sobre una imagen que ya tienes.

El GIF no tiene nada de eso. Quedó terminado en 1989, antes de que existiera nada parecido. Cada fotograma es una imagen, comprimida por su cuenta con un esquema pensado para capturas de pantalla de una hoja de cálculo. En el formato no hay estimación de movimiento por ninguna parte, y no hay manera de añadírsela.

Así que la cifra con la que hay que contar es **diez veces el tamaño del vídeo**, y de eso no te libra ningún conversor. Lo que sí puede hacer uno bueno es no desperdiciar nada por encima de ahí y darte los tres ajustes que de verdad lo deciden.

![La tarjeta de sección: un fotograma de vídeo con código de tiempo y una barra que muestra un trozo de cuatro segundos marcado dentro de un clip de veinte.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

La sección primero, porque todos los ajustes de abajo se multiplican por los segundos que hayas conservado.

## Los tres ajustes, y lo que cuesta cada uno

Todo lo que tiene que ver con el tamaño de un GIF se reduce a cuántos píxeles lleva dentro, que es la duración por la cadencia por el área de un fotograma.

- **El trozo, y va lineal.** El doble de largo son el doble de fotogramas y más o menos el doble de archivo. Este lo entiende ya casi todo el mundo, y conviene ser implacable: un GIF que dice lo que tiene que decir en tres segundos no solo pesa menos, es que además es mejor GIF.
- **El ancho, y va al cuadrado.** Al reducir el ancho a la mitad se reduce el alto con él, así que quedan *la cuarta parte* de los píxeles. Pasar de 640 a 320 no te ahorra algo menos de la mitad: te ahorra unas tres cuartas partes. Es el ajuste que nadie toca primero y el que mejor paga.
- **La cadencia, y va lineal.** Diez fotogramas por segundo ocupan dos tercios de lo que ocupan quince. Es además el ajuste donde más se nota la pérdida, porque un movimiento demasiado lento se lee como roto y no como pequeño.

Un ejemplo con los números hechos. Seis segundos de un clip de móvil a sus propios ⁦1080×1920⁩ y 30 fps son 180 fotogramas de dos millones de píxeles, o sea unos 350 millones de píxeles, que eso no es un GIF, es un secuestro. Los mismos seis segundos a 480 de ancho y 12 fps son 72 fotogramas de 400 000 píxeles, unos 30 millones, más o menos la doceava parte, y eso ya se parece a lo que la gente entiende por un GIF.

![La tarjeta de exportación: una anchura de 480, una tasa de fotogramas, una elección de difuminado y un resumen que estima los fotogramas y el tamaño.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Tres ajustes y una estimación que se mueve con ellos. De cuál gastar primero trata esta sección.

## Qué cadencia elegir

Doce es lo que viene puesto aquí, y acierta más veces de las que uno diría. Es la cadencia que lleva usando un siglo la animación dibujada a mano: lo bastante rápida para que el ojo la lea como movimiento continuo y lo bastante lenta para no estar pagando por fotogramas que no ve nadie.

- **De 5 a 8:** queda con aire de pase de diapositivas. Vale para una panorámica lenta o para una grabación de pantalla en la que no se mueve nada rápido.
- **De 10 a 15:** lo normal. Se lee como movimiento. Casi todos los GIF que merece la pena hacer caen aquí.
- **De 20 a 25:** fluido, y más o menos el doble de tamaño que a 12 a cambio de una diferencia que casi nadie sabría nombrar. Compensa con movimiento rápido, un clip deportivo o cualquier cosa con una panorámica de latigazo.

Y hay un techo duro que conviene conocer: el GIF guarda en centésimas de segundo cuánto se queda cada fotograma en pantalla, y todos los navegadores tratan un retardo por debajo de dos centésimas como si fueran diez. O sea que el máximo real son 50 fotogramas por segundo, y un archivo que pida 100 se reproducirá a 10 sin avisar. Un conversor que te ofrezca 60 fps o está ignorando eso o está a punto de darte una sorpresa.

## 256 colores, y para qué sirve el tramado

Aquí está la otra mitad de la edad del formato: un GIF lleva una tabla de 256 colores como mucho, y cada píxel es un número que apunta dentro de ella. Un fotograma de vídeo tiene hasta dieciséis millones. Casi todo eso se tira, y de cómo se tire depende casi todo el aspecto que acabe teniendo el GIF.

Un buen conversor cuenta los colores de *tu* clip y elige 256 que le vengan bien, en lugar de tirar de un conjunto fijo. Un plano de un bosque se lleva 256 verdes; uno de un atardecer, 256 naranjas. Eso es lo que hace la herramienta de aquí, y lo hace sobre todos los fotogramas del trozo y no solo sobre el primero, así que un color que solo sale al final también tiene su sitio.

El **tramado** es lo que ocurre allí donde el color que hace falta sigue sin estar. En vez de redondear una zona entera al color más cercano disponible, cosa que convierte un cielo suave en cuatro franjas planas con escalones visibles entre ellas, alterna los dos colores más cercanos en un patrón fino, y a una distancia normal de visionado tu ojo los mezcla y ve el que falta.

- **Déjalo activado** en cualquier cosa fotográfica: cielos, piel, degradados, sombras, cine.
- **Desactívalo** con el color plano: grabaciones de pantalla, dibujo de línea, logotipos, dibujos animados y cualquier cosa con zonas grandes de un solo tono. Ahí no hay ningún degradado que proteger, y sin él el archivo queda más pequeño y más limpio.

Un detalle que conviene conocer si andas comparando conversores. La forma evidente de tramar, la difusión de error, que es la que usan casi todos los editores de imagen, hace que el resultado de cada píxel dependa de los píxeles de alrededor. En una animación eso significa que un fondo que no se mueve trama distinto en cada fotograma, con lo que hormiguea a la vista, y además obliga a guardar cada fotograma entero porque técnicamente ha cambiado cada píxel. La alternativa, el tramado ordenado, depende solo de dónde está cada píxel, así que un fondo quieto se queda perfectamente quieto. Es lo que usa esta herramienta, y por eso sus archivos salen a la vez más tranquilos y más pequeños.

## Cuándo no hacer un GIF en absoluto

Conviene preguntárselo, porque muchas veces la respuesta honesta es «no lo hagas». Un MP4 o un WebM mudo en bucle ocupa una décima parte de lo que ocupa la misma animación en GIF, se reproduce igual, y encima es en lo que cualquier plataforma social te va a convertir el GIF en cuanto lo subas.

Quédate con el GIF cuando el destino necesite uno de verdad:

- un sitio donde solo se acepta una imagen, y ahí entra mucho software de chat, de foros, de wikis y de correo;
- un README o una página de documentación, donde un GIF se reproduce ahí mismo y un vídeo necesita un reproductor;
- una presentación o un documento que tiene que seguir moviéndose sin conexión;
- un emoji, una pegatina o una reacción, lo bastante pequeños como para que nada de la aritmética de arriba importe.

Cuando el sonido importa, la pregunta se responde sola: el GIF nunca ha tenido audio y nunca lo va a tener. Corta el vídeo y ya está: el [cortador de vídeo](https://abox.tools/es/cortar-video/) te saca un trozo sin recodificar ni un fotograma.

## Bajar de un límite de tamaño

Si alguien se pone a afinar un GIF, casi siempre es porque hay un límite al otro lado. Más o menos por orden de cuánto aprietan:

- **Correo:** de 10 a 25 MB para el mensaje entero, y un adjunto que se acerque a esa cifra se lo va a quitar o rebotar algo por el camino. Apunta bastante por debajo.
- **Chat y foros:** normalmente de 8 a 10 MB, y a veces mucho menos si lo que quieres es una vista previa incrustada y no una descarga.
- **Un README de GitHub:** 10 MB por archivo, y pasando de un par de megabytes la página empieza a parecer rota en un móvil.
- **Los huecos de pegatinas y emojis:** muchas veces unos cientos de kilobytes, lo que se traduce en un ancho pequeño y un trozo corto, no en una cadencia más baja.

Cuando te pasas, el orden en que hay que probar es este: acorta el trozo, luego reduce el ancho a la mitad, luego baja la cadencia y luego desactiva el tramado. Los dos primeros valen más que los dos últimos juntos.

## Nada de esto necesita una subida

Convertir un vídeo en un GIF es descodificar, redimensionar, contar colores y comprimir, cuatro cosas que un navegador lleva años sabiendo hacer por su cuenta. La herramienta enlazada arriba lo hace todo en tu dispositivo: el archivo se lee de tu disco, los fotogramas los descodifica tu navegador, y el GIF se monta en memoria y va directo a tus descargas.

Y aquí eso preocupa más de lo habitual, porque los clips que la gente convierte en GIF son personales: un momento de un vídeo familiar, una grabación de pantalla de algo del trabajo, unos segundos de una llamada. Un conversor que quiere que se los subas te está pidiendo una copia, y ya no queda ninguna razón técnica para dársela.
