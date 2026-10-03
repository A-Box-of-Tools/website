# Cómo girar un video sin perder calidad

Un video que se ve de lado puede tener sus fotogramas intactos: el teléfono escribió una indicación en el encabezado y algún programa la ignora. Aquí explicamos qué dice, por qué corregirla debería tardar segundos y cuándo conviene girar la propia imagen.

[Abrir Girar vídeo](https://abox.tools/es/girar-video/): Un cuarto de vuelta o media vuelta, escrito en la cabecera: sin decodificar fotogramas ni perder calidad.

Última actualización 13 de septiembre de 2026

## La respuesta corta

Abre la herramienta para [girar videos](https://abox.tools/es/girar-video/), arrastra el archivo, elige el giro que deje bien la vista previa y pulsa el botón. El giro se escribe en el encabezado y todos los fotogramas se copian intactos: tarda segundos y no pierde calidad. El resultado se abre de nuevo para comprobar la orientación solicitada y se reproduce bajo la descarga. No se sube nada.

El resto de esta guía explica por qué basta con eso. Muchas herramientas y muchos consejos tratan un giro como una recodificación, aunque no tenga por qué serlo.

## Por qué el video se ve de lado

El sensor de la cámara de un teléfono tiene orientación horizontal. Cuando grabas con el teléfono vertical, el sensor sigue registrando una imagen horizontal tumbada de lado, y así se guarda cada fotograma. El teléfono añade una indicación al encabezado: una matriz de visualización de nueve números que dice, por ejemplo, «muestra esto con un cuarto de vuelta a la derecha». Los teléfonos, navegadores y reproductores y editores modernos leen esa indicación y giran la imagen al mostrarla. Por eso se ve bien en el teléfono.

Si se ve de lado en otro sitio, la indicación se está ignorando o es incorrecta: la cámara calculó mal la orientación, un convertidor perdió el encabezado o un reproductor antiguo nunca lo leyó. El problema está en la indicación, no en los fotogramas.

## La solución puede ser cambiar nueve números

Girar el video puede consistir en escribir otra indicación. Los fotogramas quedan intactos: no se decodifican ni se vuelven a codificar. El archivo resultante ocupa casi lo mismo y se genera en el tiempo que tarda en leerse una vez. Eso hace por defecto la herramienta para [girar videos](https://abox.tools/es/girar-video/): combina el giro elegido con el que ya indicaba el archivo, escribe la matriz resultante y copia cada fotograma y cada paquete de audio byte por byte.

Muchas herramientas en línea decodifican el video, giran los píxeles y lo codifican todo de nuevo. Eso pierde una generación de calidad, tarda lo que una codificación y cambia cada fotograma para una tarea que solo necesitaba nueve números. Se hace así porque programar un único recorrido que siempre recodifica es más sencillo que mantener dos, no porque el archivo lo necesite.

## Cuándo conviene aplicar el giro a los píxeles

Algunos reproductores antiguos ignoran la matriz y muestran los fotogramas tal como están guardados, de lado. Si el video va a uno de ellos o a un destino que no puedes comprobar, el encabezado no basta: hay que girar los píxeles. La herramienta ofrece una casilla para «aplicar el giro a la imagen». Dibuja cada fotograma girado y lo codifica como H.264, con una tasa algo mayor que la original para dar margen a esa segunda generación. Se pierde algo de calidad y tarda lo que una codificación; por eso es una opción adicional y la página lo explica.

Un WebM o MKV cuya imagen no sea H.264 se convierte de este modo aunque no marques la casilla, porque la herramienta solo puede construir el encabezado MP4 alrededor de fotogramas H.264. La página lo indica al encontrar ese caso.

## ¿Hacia qué lado hay que girar?

Un cuarto de vuelta a la derecha sigue el sentido de las agujas del reloj: el borde superior se mueve como al girar el teléfono a la derecha. La herramienta muestra el primer fotograma con el giro elegido y el mismo cálculo que llevará el encabezado. Elige el botón que deje bien la vista previa. Si está boca abajo, necesita media vuelta; si la cámara interpretó mal la orientación, a veces necesita el cuarto de vuelta contrario al que imaginabas.

## Lo extraño es tener que subirlo

Las herramientas en línea suelen pedir el archivo primero. Hay que subir un gigabyte de vacaciones, una clase o un partido para recibir una copia girada. La subida tarda más que toda la tarea, antes incluso de preguntar quién guarda el archivo. Nada de esto exige un servidor: leer un encabezado y escribir otro supone unos pocos kilobytes de trabajo, e incluso girar los píxeles utiliza códecs que ya están en el navegador.

La herramienta para [girar videos](https://abox.tools/es/girar-video/) trabaja en el navegador. Lee el archivo del disco por partes, le da un nuevo encabezado y escribe el resultado en memoria. La política de seguridad de la página enumera las direcciones que puede contactar, y ninguna pertenece a este sitio. Sigue funcionando al desconectar la red: es la comprobación más sencilla.

## Revísalo antes de enviarlo

La herramienta vuelve a abrir su resultado con el mismo lector que usa para el original y comprueba tres cosas: la duración, el giro solicitado con sus dimensiones correspondientes y el sonido anunciado. Después lo reproduce desde la memoria bajo la descarga. Míralo un momento —la orientación se comprueba de un vistazo— y guárdalo. Conserva también el original: el giro normal no pierde nada, pero el original sigue siendo la única copia que no es una copia.
