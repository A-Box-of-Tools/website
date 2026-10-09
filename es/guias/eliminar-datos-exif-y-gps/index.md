# Lo que una foto cuenta de ti, y cómo quitarlo

Una imagen recién salida de un móvil suele llevar las coordenadas del sitio en que se tomó, la hora al segundo y datos suficientes de la cámara como para atarla a todas las demás fotos del mismo dispositivo. Nada de eso se ve en pantalla. Aquí va lo que hay ahí dentro y cómo quitarlo.

[Abrir Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.

Última actualización 4 de octubre de 2026

## La respuesta corta

Abre [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) y elimina los metadatos de tus fotos. JPEG, PNG y WebP conservan sus datos de imagen comprimidos. La limpieza de AVIF crea un PNG nuevo de la primera imagen decodificada sin metadatos originales. Las opciones de orientación y perfil de color solo se aplican a los tres formatos de contenedor. El navegador decodifica AVIF y lo guarda como un PNG nuevo sin copiar los metadatos originales. Aquí puedes ver sus etiquetas EXIF disponibles, pero no editarlas. El PNG puede ser mayor y la conversión puede cambiar el color o el HDR. El archivo original no cambia.

Aun así, antes de hacerlo conviene mirar qué había ahí dentro. Suele haber más de lo que la gente espera, y esa lista es justamente el argumento para hacer todo esto.

## Qué hay de verdad dentro de una foto

Un JPEG no es solo una imagen comprimida: es un contenedor, y junto a la imagen hay varios bloques de información que han ido escribiendo ahí tu cámara, tu móvil o tu editor.

- **EXIF.** El principal. Marca y modelo de cámara, objetivo, ajustes de exposición, ISO, la fecha y la hora al segundo, la orientación en la que hay que mostrar la imagen y, en un móvil con la ubicación activada para la cámara, una posición GPS con una precisión de unos pocos metros. Muchas veces, además, el número de serie del cuerpo de la cámara.
- **GPS.** Técnicamente forma parte del EXIF, pero se merece mención aparte porque es el que más importa. Se escribe en grados, minutos y segundos, un formato que hace un trabajo excelente pareciendo cualquier cosa menos una dirección.
- **XMP.** Un paquete de XML que escriben los editores. Puede llevar tu nombre, tu software, valoraciones, palabras clave, historial de ediciones y una copia de algunos campos EXIF. Por eso quitar solo el EXIF no basta.
- **IPTC.** Un bloque más antiguo con campos de pie de foto, autoría, crédito y derechos, usado en la prensa y en la fotografía de archivo.
- **La miniatura incrustada.** Una segunda copia pequeña de la imagen. Se genera al escribir el archivo y no siempre se regenera al editarlo, y así es como una foto recortada puede acabar viajando con una miniatura de lo que se recortó.
- **La nota del fabricante.** Un bloque sin documentar de datos del fabricante. Nadie fuera del fabricante sabe todo lo que lleva dentro.

![El inspector: una miniatura de una foto junto a una lista de lo encontrado, con la marca y el modelo de la cámara, la fecha en que se tomó y coordenadas GPS.](https://abox.tools/screens/remove-exif-and-gps-data/inside.webp)

Lo que lleva de verdad una foto hecha con el móvil. Casi nadie ha mirado nunca, y por eso existe esta guía.

## Quién lo ve de verdad

Aquí conviene ser preciso, porque tanto la versión alarmista como la despreocupada están equivocadas.

**Casi todas las redes sociales grandes quitan los metadatos al publicar.** Facebook, Instagram y X recodifican las imágenes subidas y tiran las etiquetas por el camino. No es que te hagan un favor, porque los datos se los quedan ellos de su lado, pero sí significa que una foto publicada ahí no le entrega sus coordenadas a todo el que la vea.

**Casi todo lo demás las conserva.** Un adjunto de correo. Un archivo mandado por casi cualquier aplicación de mensajería como «documento» y no como foto. Una imagen en un foro, un anuncio de compraventa, una web personal, una unidad compartida, un informe de error, un ticket de soporte. En todos esos casos el archivo llega intacto, y cualquiera que lo descargue puede leer las etiquetas con herramientas que ya trae su sistema operativo.

Los riesgos reales son más bien cotidianos, nada dramáticos: un anuncio de compraventa fotografiado en casa, la foto de un niño tomada en su colegio, una cuenta supuestamente anónima cuyas fotos comparten todas el mismo número de serie de cámara, un «tomada la semana pasada» que en realidad es de marzo.

## ¿Por qué no volver a guardarla y ya?

Un editor o compresor elimina metadatos al decodificar la imagen y volver a codificarla. La codificación con pérdidas puede reducir la calidad. Un PNG sin pérdidas evita otra compresión con pérdidas, aunque la decodificación del navegador puede cambiar el color o el HDR.

Para JPEG, PNG y WebP: Quitar los metadatos como es debido no cuesta absolutamente nada. Las etiquetas están en el contenedor que va *alrededor* de la imagen comprimida, no dentro de ella, así que eliminarlas consiste en borrar entradas de una lista y volver a escribir esa lista. Los datos de imagen comprimidos se copian byte por byte, y el resultado descodifica exactamente los mismos píxeles. Ahí está la razón entera para usar una herramienta de metadatos en vez de un conversor.

La excepción es que fueras a recodificar de todas formas. Si ya estás comprimiendo o redimensionando la foto, las etiquetas se van de rebote y no te hace falta un segundo paso.

## Lo único que hay que conservar: la orientación

Los móviles no giran la imagen cuando tú giras el móvil. La graban tal como la vio el sensor y le añaden una etiqueta de orientación que dice cómo hay que girarla al mostrarla. Si quitas todas las etiquetas, algunos visores te enseñarán la foto de lado.

Para JPEG, PNG y WebP, conservar la orientación escribe un pequeño bloque EXIF con esa etiqueta cuando hace falta. Desactiva la opción para quitarla. AVIF se limpia usando la imagen orientada que decodifica el navegador y crea un PNG. Las opciones de orientación y perfil de color solo se aplican a JPEG, PNG y WebP.

Desactívala si prefieres que el archivo no lleve nada de EXIF, pero comprueba luego el resultado antes de mandarlo, porque lo más probable es que la foto salga de lado.

![La tarjeta de limpieza: un botón para quitarlo todo, con interruptores para conservar la etiqueta de orientación y el perfil de color.](https://abox.tools/screens/remove-exif-and-gps-data/strip.webp)

Quítalo todo, menos las dos cosas que conviene conservar. La orientación es la que, al irse, deja medio carrete tumbado de lado.

## Editar en lugar de quitar

Quitarlo todo es la respuesta correcta para casi todo el mundo, pero no siempre. Un fotógrafo puede querer conservar la línea de derechos y los ajustes de la cámara y que solo desaparezca la ubicación, y quien archiva puede necesitar corregir una fecha que estaba mal porque lo estaba el reloj de la cámara.

Para JPEG, PNG y WebP: Las dos cosas se pueden hacer. La ubicación se puede borrar por su cuenta, y las etiquetas de texto, las fechas, el ISO, la orientación y la resolución se pueden editar ahí mismo.

Una advertencia que vale para cualquier herramienta que haga esto, y no solo para esta: escribir el archivo reconstruye el bloque EXIF, y la nota del fabricante contiene desplazamientos hacia el bloque *original*. Por eso una nota reconstruida puede dejar de ser legible para el propio programa del fabricante. Si eso te importa, borra la nota del fabricante o deja el archivo sin editar.

## Formatos, y los que no se pueden hacer así

JPEG, PNG y WebP permiten ver, editar y limpiar metadatos en su contenedor. AVIF permite una vista previa del EXIF extraído disponible y limpieza a un PNG nuevo. Las etiquetas AVIF son de solo lectura; no se inventarían los demás metadatos. En AVIF animado se usa la primera imagen. HEIC y TIFF sin contenedor se reconocen, pero no se reescriben.

HEIC, el formato que suele guardar un iPhone, usa otro códec y esta herramienta lo reconoce, pero lo rechaza. Al convertirlo a JPEG, elige eliminar los metadatos.

Un TIFF suelto tampoco lo maneja, y por una razón más interesante: en un TIFF los metadatos y los datos de píxeles se direccionan con los mismos desplazamientos, así que quitar etiquetas obliga a reescribir el direccionamiento de la propia imagen. Se puede hacer, pero es otro trabajo.

## Una costumbre que merece la pena

Comprueba antes de publicar, no después. Leer las etiquetas lleva unos segundos, y la lista de hallazgos pone por delante lo que conviene saber, o sea la posición, las marcas de tiempo y los números de serie, antes de la tabla completa con todas las etiquetas. Así no necesitas saber qué buscar.

La posición se muestra primero en grados decimales, y es a propósito. Con «51 grados, 30 minutos, 26 segundos» no queda nada claro que la foto esté señalando el edificio en el que se tomó. Con un par de decimales que puedes pegar en un mapa, sí.

## No subas la foto para averiguar qué lleva dentro

La forma habitual de resolver este problema tiene su ironía: alguien preocupado por lo que revela su foto la sube a una web para averiguarlo. Y ahora esa web tiene la foto, las coordenadas, la marca de tiempo, el número de serie y una copia de la imagen en un disco suyo.

Y no hace ninguna falta. Leer y reescribir el contenedor que rodea a un JPEG son unos cientos de líneas de análisis que un navegador ejecuta sin despeinarse, y por eso la herramienta de aquí no tiene ninguna función de red: ni un `fetch`, ni un `XMLHttpRequest`, ni nada capaz de mandar un archivo aunque algo lo intentara. Cárgala una vez, desconéctate y verás que sigue funcionando.

[¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) explica cómo comprobar esa afirmación aquí o en cualquier otro sitio, y este es justo el tipo de archivo en el que más merece la pena comprobarla.
