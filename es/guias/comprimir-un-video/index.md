# Cómo comprimir un video para poder enviarlo

Un video que no se puede enviar tiene un problema: supera un límite. Aquí explicamos en qué se gastan los megabytes, qué se pierde al reducirlos y cómo ajustarse al límite sin subir primero el archivo que era demasiado grande.

[Abrir Compresor de vídeo](https://abox.tools/es/comprimir-video/): Indica el tamaño máximo. La herramienta calcula los ajustes y mide el resultado antes de entregarlo.

Última actualización 12 de septiembre de 2026

## La respuesta corta

Abre el [compresor de video](https://abox.tools/es/comprimir-video/), arrastra el archivo y pulsa el límite que te hayan indicado: 8 MB, 16, 25, 50 o 100. También puedes escribir otro número. La línea bajo el campo explica qué permite ese tamaño: las dimensiones y la tasa de bits que caben según la duración. Pulsa el botón y el dispositivo codificará el video, medirá el resultado y volverá a abrirlo para comprobar que conserva la duración. No se sube nada.

El resto de esta guía explica qué acabas de sacrificar. «Comprimir» un archivo zip no tiene el mismo costo que comprimir un video.

## En qué se gastan los megabytes

Casi todo el tamaño de un video corresponde a la imagen. Un minuto a 1080p grabado con un teléfono ocupa entre 60 y 150 MB; el sonido ocupa alrededor de uno. El resto son treinta imágenes por segundo, descritas mediante los cambios respecto a la anterior. Por eso, el tamaño se aproxima a una multiplicación: los bits por segundo asignados a la imagen, la *tasa de bits*, por la duración.

Así se obtiene una tasa de bits a partir de un límite de tamaño. Se resta el espacio del sonido, que se copia tal como está, y un pequeño margen para el contenedor. Lo que queda se divide por la duración. Un límite de 25 MB para dos minutos deja unos 1,6 megabits por segundo para la imagen. Ese es todo el presupuesto; lo demás depende de él.

## Por qué se reducen las dimensiones antes de empeorar la imagen

Una tasa de bits solo tiene sentido en relación con los píxeles que debe describir. Repartir 1,6 megabits por segundo entre los dos millones de píxeles de 1080p, treinta veces por segundo, deja muy poco para cada uno. El codificador acaba difuminando: los bordes pierden nitidez, las zonas lisas forman bloques y el movimiento se desdibuja. Esos mismos 1,6 megabits a 720p dan una imagen perfectamente aceptable; a 480p, una buena imagen.

Por eso la herramienta baja las dimensiones por pasos —1080p, 720p, 480p, 360p— hasta disponer de suficientes bits por fotograma. Lo calcula antes de empezar y te lo indica. Una imagen pequeña y nítida se ve mejor que otra grande y borrosa en cualquier pantalla. Los servicios que reciben videos hacen algo parecido sin explicarlo. La herramienta nunca aumenta las dimensiones por encima de las originales.

Puedes cambiar esa decisión. Una grabación de pantalla cuyo texto deba seguir leyéndose puede necesitar 1080p aunque pierda nitidez; un video que solo se verá en un teléfono puede bajar a 480p y dedicar más bits al movimiento.

## Qué se pierde y cómo perder menos

Comprimir un video implica volver a codificarlo. La imagen se decodifica, se dibuja más pequeña y se escribe de nuevo con la nueva tasa de bits: queda una generación más lejos de la cámara. El sonido no se toca; sus muestras se copian exactamente. La pérdida visual depende del límite: reducir un video a la mitad suele costar poco; pasar de 900 MB a 25 MB elimina casi todos sus bits, y se nota.

- **Pide el tamaño que necesitas, no uno menor.** Si el límite es 25 MB, usa 25 MB. Elegir 8 MB descarta dos tercios de la información de imagen sin necesidad.
- **Recorta primero.** La duración es la otra mitad de la multiplicación. Diez segundos que sobran consumen bits que podrían repartirse entre los segundos útiles. El [recortador de video](https://abox.tools/es/guias/cortar-un-video/) corta sin volver a codificar; úsalo antes de comprimir.
- **Quita el sonido si no importa.** Un minuto de audio estéreo ocupa alrededor de un megabyte. En un video corto con un límite ajustado, ese megabyte puede marcar la diferencia entre una imagen nítida y una borrosa.
- **Conserva el original.** No se puede recuperar lo perdido al comprimir. Comprime una copia, envía esa copia y guarda el archivo de la cámara.

## Lo extraño es tener que subirlo

Piensa en lo que pide un compresor en línea: subir el archivo que era demasiado grande para subirlo. Envías los 900 MB para recibir 25 MB. En muchas conexiones domésticas, la subida tarda más que la codificación. Después quedan las preguntas que plantean otras guías de este sitio: qué guardan, durante cuánto tiempo y quién puede verlo. Si el video muestra a tus hijos o el interior de tu casa, no son preguntas menores.

No hace falta nada de eso. Los navegadores recientes incluyen los mismos códecs de video que un teléfono, y [esta herramienta](https://abox.tools/es/comprimir-video/) los utiliza. Lee el archivo del disco por partes, decodifica la imagen, la reduce y la vuelve a codificar en tu dispositivo. El resultado queda en memoria hasta que lo guardas. La política de seguridad de la página enumera las direcciones que puede contactar, y ninguna pertenece a este sitio. Sigue funcionando sin conexión. Para comprobarlo, desconecta la red y comprime el video.

La guía sobre [si es seguro subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) desarrolla esta cuestión con más detalle.

## Qué comprueba la herramienta antes de entregar el archivo

Un codificador se acerca a la tasa de bits pedida, pero no la clava. Por eso se solicita un tamaño algo menor y se mide el resultado. Si supera el límite, se ajusta la tasa según la diferencia y se vuelve a codificar; la página avisa cuando ocurre. Después se abre el archivo terminado en el dispositivo y se comprueba que conserva la duración. Perder el último segundo o el sonido también produciría un archivo más pequeño; volver a leer el resultado permite distinguirlo. Puedes reproducirlo bajo la descarga antes de enviarlo.

## Qué formatos escribe y cuáles lee

Escribe MP4 con video H.264, la combinación que reproducen teléfonos, navegadores, aplicaciones de mensajería y clientes de correo. Esa compatibilidad es lo que necesita un archivo que se quiere enviar. No escribe WebM, HEVC ni AV1: ocupan menos con la misma calidad, pero muchas personas no podrían abrirlos. Lee MP4 y MOV, habituales en teléfonos, cámaras y grabaciones de pantalla, siempre que el navegador pueda decodificar el códec interior. Los videos HEVC de iPhone se abren en la mayoría de los dispositivos. Todavía no lee WebM, MKV ni AVI; la página lo indica al encontrarlos.
