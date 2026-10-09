# Cómo hacer un GIF animado con imágenes

Hacer el GIF es la parte fácil. Conseguir uno lo bastante pequeño como para poder publicarlo es la parte que merece la pena leer, porque un GIF no tiene control de calidad y solo tres cosas mueven su tamaño.

[Abrir Creador de GIF](https://abox.tools/es/crear-gif/): Convierte un puñado de imágenes en una sola animación.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Creador de GIF](https://abox.tools/es/crear-gif/), suelta las fotos dentro, ponlas en el orden en que deben reproducirse, indica cuánto tiempo se mantiene cada fotograma, y haz el GIF. Se reproduce en la página antes de que lo guardes.

Todo lo de abajo va de las dos cosas que se tuercen después: el archivo es mucho más grande de lo esperado, o la animación va más despacio de lo que decían los números. Las dos tienen causas concretas y ninguna es un fallo de la herramienta.

## Por qué un GIF es mucho más grande de lo que esperas

Un GIF de 20 fotogramas a 640 píxeles suele pesar entre 8 y 15 MB. La misma animación en MP4 son unos cientos de kilobytes. Eso no es un GIF mal hecho; eso es el formato.

Cualquier otro formato de imagen en movimiento que hayas usado guarda *diferencias*. Un códec de vídeo escribe un fotograma completo y luego, para los siguientes, solo lo que se movió y adónde — por eso un vídeo de una persona hablando delante de un fondo quieto casi no cuesta nada por fotograma. Un GIF no puede hacer eso. Cada fotograma se guarda como píxeles enteros, pasados por un compresor sin pérdida, y esa es toda la caja de herramientas.

Tampoco hay ajuste de calidad, porque no hay ningún paso con pérdida que bajar. Un JPEG al 60 % de calidad es una elección real con un control real detrás; un GIF no tiene nada equivalente. Así que el tamaño es aproximadamente **área × número de fotogramas**, y la única forma de moverlo es mover uno de esos dos números.

## Las tres cosas que de verdad lo hacen más pequeño

En el orden en que ayudan:

**1. Hazlo más pequeño.** Esta no es una de varias opciones, es la opción. El tamaño es área, así que reducir a la mitad el lado largo deja el archivo en la cuarta parte: de 640 px a 320 px convierte 12 MB en unos 3 MB. Un GIF en una página web o en una ventana de chat se está viendo a unos cientos de píxeles de todas formas. Los 480 px son el valor por defecto de la herramienta exactamente por esto, y 320 px es una respuesta perfectamente respetable.

**2. Usa menos fotogramas.** Diez fotogramas mantenidos una quinta parte de segundo cada uno son los mismos dos segundos de animación que veinte fotogramas a una décima, y la mitad de archivo. La suavidad cuesta bytes en proporción directa, así que gástala solo donde el movimiento la pida.

**3. Quita el difuminado y baja los colores.** Esta es contraintuitiva. El difuminado esparce un patrón fino de píxeles alternos para fingir los colores que la paleta no tiene, y ese patrón es *ruido* — que es justo lo que un compresor sin pérdida no puede comprimir. En arte plano, capturas de pantalla y dibujos de línea, quitarlo puede recortar un tercio del archivo y además verse mejor. En fotografías cambia bandas visibles por el ahorro, así que prueba las dos cosas y mira.

Bajar de 256 a 64 colores también ayuda, aunque menos de lo que la gente espera: acorta las palabras de código en vez de quitar píxeles.

Si nada de eso lo deja lo bastante pequeño, la respuesta honesta es que lo que estás haciendo es un vídeo. [Convertir esas mismas imágenes en un MP4](https://abox.tools/es/guias/convertir-imagenes-en-un-video/) será quizá una décima parte del tamaño, y en todas partes donde se acepta un GIF para algo que no sea una etiqueta `<img>` — incluida cualquier red social — lo convierten a vídeo al subirlo de todos modos.

## A qué velocidad puede ir de verdad un GIF

El formato guarda el retardo de cada fotograma en centésimas de segundo, lo que sugiere que podrías pedir 0,01 s y obtener cien fotogramas por segundo. No puedes.

Todos los navegadores suben un retardo menor de dos centésimas hasta una décima de segundo. La regla viene de los años noventa, cuando las páginas estaban llenas de animaciones puestas a la máxima velocidad posible y las máquinas de entonces no lo aguantaban, y ha sobrevivido a todas las razones por las que se introdujo. Nunca se ha quitado, y se aplica hoy a tu GIF.

Así que el rango práctico es:

- **0,02 s** (50 fotogramas por segundo) — lo más rápido que se le permite ser a un GIF, y más rápido de lo que suele necesitar.
- **0,05 s** (20 fotogramas por segundo) — animación fluida, y por donde empezar si estás animando movimiento.
- **0,1 s** (10 fotogramas por segundo) — el aspecto clásico del GIF. La mitad de fotogramas, la mitad de archivo, y se lee como algo deliberado.
- **0,5 s y más** — un pase de diapositivas. Cada imagen se está mirando, no animando.

Nada por debajo de 0,02 s se ofrece, porque es un número que se convertiría en silencio en 0,1 s en todos los navegadores que existen.

## La paleta, y qué está eligiendo en realidad

Un fotograma de GIF guarda como mucho 256 colores. Una fotografía tiene decenas de miles. Algo tiene que elegir 256 de ellos, y esa elección es lo que determina el aspecto del resultado — más que ningún otro ajuste.

La herramienta ofrece dos maneras de hacerla:

**Los mejores colores para cada fotograma** le da a cada imagen sus propios 256. Es lo que se ve más nítido, y es lo correcto para un conjunto de fotografías sin relación, donde cada una quiere un juego completamente distinto de todas formas.

**Una paleta para todo el GIF** construye una única tabla a partir de todos los fotogramas a la vez. Úsala cuando los fotogramas sean una *secuencia* — la misma escena, con unos instantes de diferencia. Con una paleta por fotograma, cualquier cambio en la imagen cambia qué 256 colores se eligen, y el fondo entero se desplaza ligeramente de color en cada fotograma. Ese temblor es lo que hace que un GIF casero parezca casero. Una paleta compartida lo quita, y de paso deja un archivo más pequeño, porque la tabla se escribe una vez en lugar de en cada fotograma.

Menos colores — 128, 64, 32 — merece la pena probarlo en cualquier cosa plana. Una animación de logotipo con ocho colores no pierde nada a 32, y en una fotografía se ve la diferencia enseguida.

![Los ajustes de color: una paleta de 128 colores, la elección entre una paleta compartida y una por fotograma, el difuminado desactivado y un resumen de fotogramas, duración y tamaño estimado.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

La paleta es el ajuste con más efecto sobre el tamaño y el que más herramientas esconden. El resumen de debajo se mueve mientras los cambias.

## La transparencia es un bit, y esa es toda la historia

Un píxel de GIF está pintado del todo o es del todo invisible. No hay nada en medio: ni sombra al 50 %, ni borde suave, ni desvanecido.

Así que si tus imágenes de origen tienen transparencia, activarla mantiene transparentes las zonas transparentes — pero todo borde suavizado, que es un degradado de la forma hacia la nada, se corta por la mitad y se convierte en uno duro y visiblemente dentado. Las formas redondas y el texto son lo que más sufre.

Si sabes sobre qué color va a ir el GIF, aplanarlo sobre ese color se verá mejor siempre. Quédate con la transparencia solo cuando el fondo sobre el que aterriza sea de verdad desconocido — y si la respuesta es «necesita un borde suave sobre cualquier fondo», el formato para eso es PNG animado o WebP, no GIF.

## Orden, tiempos, y que el bucle quede bien

Unas cuantas cosas que se saben más rápido de lo que se descubren:

**Ordenar por nombre cuenta bien.** Una secuencia de render o exportación se ordena como pretendías, así que `frame_2` cae antes que `frame_10` y no después. Ordenar por fecha devuelve un carrete al orden en que se disparó, que es lo que quieres cuando los nombres de archivo han vuelto a empezar en 0001.

**Dale más tiempo al último fotograma.** Un bucle con todos los fotogramas de la misma duración se lee como implacable. Mantener el último medio segundo aproximadamente le da al ojo dónde descansar y hace que todo parezca intencionado. Cada fotograma tiene su propio tiempo de espera para esto.

**Un bucle no debería dar un salto.** Al último fotograma le sigue inmediatamente el primero, así que si esos dos son muy distintos el bucle chasquea. O haces que se parezcan, o te apoyas en el corte manteniendo el último fotograma.

**Reproducir una vez significa reproducir una vez.** Algunas herramientas escriben un contador de bucle de uno, sobre el que los decodificadores nunca se han puesto del todo de acuerdo — unos pocos lo reproducen dos veces. Elegir «Reproducir una vez» aquí no escribe información de bucle en absoluto, y eso todos los decodificadores jamás construidos lo tratan igual.

![Cinco fotogramas en orden, cada uno con su campo de demora, encima de una fila que fija todas las demoras a la vez.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Orden y tiempos, ambos editables por fotograma. Fijarlos todos de golpe es la fila de arriba, que es lo que quiere cualquiera con más de tres fotogramas.

## Por qué esto no necesita un servidor

Hacer un GIF son dos trabajos que el navegador no ofrece: elegir la paleta y comprimir los píxeles con LZW. Ninguno de los dos es grande. Entre los dos serán unas cuatrocientas líneas, están escritas a la vista en el repositorio, y se ejecutan en tu propio equipo como todo lo demás aquí — que es por lo que la página sigue funcionando con la red desenchufada.

La razón de que tantos creadores de GIF suban archivos no es que el trabajo sea difícil. Es que un servidor es donde están la publicidad y las cuentas. Nada de convertir un puñado de fotografías en una animación exige que tus fotografías salgan de la habitación en la que están.

[¿Es seguro subir archivos a conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone cuatro comprobaciones que te dirán lo mismo sobre cualquier herramienta, esta incluida.
