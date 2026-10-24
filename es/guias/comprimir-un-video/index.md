# Cómo comprimir un video para poder enviarlo

Un video que no se puede enviar tiene un problema: supera un límite. Aquí explicamos en qué se gastan los megabytes, qué se pierde al reducirlos y cómo ajustarse al límite sin subir primero el archivo que era demasiado grande.

[Abrir Compresor de vídeo](https://abox.tools/es/comprimir-video/): Indica el tamaño máximo. La herramienta calcula los ajustes y mide el resultado antes de entregarlo.

Última actualización 13 de octubre de 2026

## La respuesta corta

Abre el [compresor de video](https://abox.tools/es/comprimir-video/), arrastra el archivo y pulsa el límite que te hayan indicado: 8 MB, 16, 25, 50 o 100. También puedes escribir otro número. La línea bajo el campo explica qué permite ese tamaño: las dimensiones y la tasa de bits que caben según la duración. Pulsa el botón y el dispositivo codificará el video, medirá el resultado y volverá a abrirlo para comprobar que conserva la duración. No se sube nada.

El resto de esta guía explica qué acabas de sacrificar. «Comprimir» un archivo zip no tiene el mismo costo que comprimir un video.

## Un archivo adjunto, una publicación o un informe de errores

Para un correo, comprueba el límite de todo el mensaje, resta los demás archivos y deja margen. Actualmente, Gmail personal admite 25 MB de archivos adjuntos; en trabajo y educación, el límite lo fija el administrador. Las [instrucciones de Gmail](https://support.google.com/mail/answer/6584?hl=en) explican la diferencia. Un ajuste predeterminado es un objetivo de tamaño, no una garantía de que todo destinatario lo acepte.

Para un informe de errores o una demostración corta, recorta las esperas antes de comprimir. Conserva los clics que explican el problema, el sonido si aporta información y resolución suficiente para leer el texto importante más pequeño. Reproduce la descarga en la aplicación de destino, comprueba el tamaño real y el último segundo. Si el texto no se lee, aumenta el objetivo o acorta el vídeo.

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
- **Recorta primero.** Quitar el tiempo innecesario deja más espacio para cada segundo restante. El [Recortador de vídeo](https://abox.tools/es/guias/cortar-un-video/) copia selecciones compatibles sin recodificar; los cortes exactos recodifican la imagen. El resultado puede incluir ajustes de reproducción, también de audio tras un corte exacto de imagen. Si el compresor rechaza esa línea de tiempo, guarda un vídeo nuevo con los ajustes aplicados en un editor local antes de continuar. Elige conscientemente el método indicado.
- **Quita el sonido si no importa.** Un minuto de audio estéreo ocupa alrededor de un megabyte. En un video corto con un límite ajustado, ese megabyte puede marcar la diferencia entre una imagen nítida y una borrosa.
- **Conserva el original.** No se puede recuperar lo perdido al comprimir. Comprime una copia, envía esa copia y guarda el archivo de la cámara.

## Lo extraño es tener que subirlo

Piensa en lo que pide un compresor en línea: subir el archivo que era demasiado grande para subirlo. Envías los 900 MB para recibir 25 MB. En muchas conexiones domésticas, la subida tarda más que la codificación. Después quedan las preguntas que plantean otras guías de este sitio: qué guardan, durante cuánto tiempo y quién puede verlo. Si el video muestra a tus hijos o el interior de tu casa, no son preguntas menores.

No hace falta nada de eso. Los navegadores recientes incluyen los mismos códecs de video que un teléfono, y [esta herramienta](https://abox.tools/es/comprimir-video/) los utiliza. Lee el archivo del disco por partes, decodifica la imagen, la reduce y la vuelve a codificar en tu dispositivo. El resultado queda en memoria hasta que lo guardas. La política de seguridad de la página enumera las direcciones que puede contactar, y ninguna pertenece a este sitio. Sigue funcionando sin conexión. Para comprobarlo, desconecta la red y comprime el video.

La guía sobre [si es seguro subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) desarrolla esta cuestión con más detalle.

## Qué comprueba la herramienta antes de entregar el archivo

Un codificador se acerca a la tasa pedida, sin acertar exactamente. Por eso se solicita un poco menos y se mide el resultado. Si se excede, se recalcula la tasa según la diferencia y se codifica otra vez; la página lo indica. Luego se abre el archivo en el dispositivo y se compara su duración con la fuente. Perder el último segundo o el sonido también reduciría el tamaño: solo revisar el resultado permite distinguirlo. Puedes reproducirlo debajo de la descarga. Si la comprobación dice que sigue superando el objetivo, elige menos resolución, un clip más corto o un límite mayor y vuelve a intentarlo.

## Qué formatos escribe y cuáles lee

Escribe MP4 con vídeo H.264 y audio original copiado. H.264 en MP4 es ampliamente compatible, pero el destino también debe admitir el códec de audio y el perfil de vídeo. Prueba allí el archivo final. Lee MP4 y MOV con códecs que tu navegador decodifique; no lee WebM, MKV ni AVI. No escribe WebM, HEVC ni AV1.
