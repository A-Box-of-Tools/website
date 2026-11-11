# ¿Convertir una foto borra sus metadatos?

A veces, y las dos respuestas han quemado a gente. Reencodear por un lienzo lo arranca todo; un conversor cuidadoso lo traslada todo; la imagen se ve igual en ambos casos. La única jugada fiable es dejar de predecir y mirar el archivo.

Última actualización 13 de octubre de 2026

## La respuesta corta

A veces. Convertir, redimensionar o comprimir una foto quita sus metadatos cuando la herramienta reconstruye la imagen a partir de píxeles, y los conserva cuando la herramienta los traslada a propósito — y nada en pantalla te dice cuál de las dos cosas pasó. La imagen se ve igual en ambos casos, porque los metadatos nunca fueron parte de la imagen.

Los dos desenlaces sorprenden, en direcciones opuestas. Alguien cuenta con que «solo redimensionar» borre la ubicación, y la ubicación sobrevive. Otro cuenta con que la fecha de captura sobreviva a un cambio de formato, y ya no está. Los dos errores tienen la misma cura: dejar de predecir lo que una herramienta probablemente hizo, y mirar lo que el archivo contiene de verdad.

## Conserva una copia de archivo y otra para compartir

**Para una biblioteca fotográfica,** guarda el original y usa una conversión que preserve expresamente las fechas si las necesitas. El [convertidor HEIC](https://abox.tools/es/guias/convertir-heic-a-jpg/) conserva metadatos compatibles en JPEG; revisa una muestra antes de convertir toda la colección. La fecha de modificación del archivo es distinta de la fecha de captura.

**Para un anuncio de venta o portafolio público,** crea una copia aparte. Redimensiona o comprime según necesites, [elimina expresamente las etiquetas no deseadas](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/) y revisa el archivo descargado final. No subas el original de archivo.

Así detectas el caso fácil de pasar por alto: un redimensionador o compresor decide que no hace falta cambiar nada y devuelve los bytes originales. Un archivo ya pequeño puede seguir llevando GPS aunque pase por una página de limpieza de imágenes.

## Qué viaja al lado, y por qué va separado

Un archivo de foto son dos cosas en un mismo contenedor: la imagen codificada, y un bloque de etiquetas sobre ella — EXIF, muchas veces con XMP y un perfil de color. Las etiquetas suelen decir cuándo se tomó la foto, la cámara y el objetivo, la exposición, las coordenadas GPS de donde estabas, y con frecuencia una miniatura incrustada — a veces de la imagen tal como era *antes* de una edición, que es como un recorte puede no quitar lo que recortó. El recorrido completo de ese bloque está en [la guía de EXIF](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/).

El punto que lo decide todo: las etiquetas están *al lado* de los píxeles, no dentro. Una herramienta que decodifica la imagen recibe píxeles y ninguna etiqueta; lo que escriba de salida contiene solo lo que decida devolver. Una herramienta que edita el archivo sin reencodear puede dejar las etiquetas intactas — o quitar exactamente esas y nada más.

## Por qué reencodear arranca, y copiar conserva

La mayoría de tareas de imagen del navegador usan un lienzo: decodifican a píxeles, los transforman y codifican un archivo nuevo. Ese archivo no copia las etiquetas de cámara salvo que la herramienta las restaure expresamente. Cuando el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) y el [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) realmente recodifican, sus salidas no conservan EXIF, GPS ni XMP. Ambos también pueden devolver intacto el original si no necesita reducción, conservando sus metadatos. Revisa la descarga; no deduzcas la eliminación del nombre de la página.

Un conversor, en cambio, puede esmerarse en preservar. El [conversor de HEIC a JPG](https://abox.tools/es/convertir-heic-a-jpg/) de este sitio hace exactamente eso: levanta el bloque de metadatos del contenedor HEIC y lo instala en el JPEG, fechas, GPS y todo, porque una conversión debe ser la misma foto con otro abrigo. (Una etiqueta se reescribe a propósito: la orientación, para que la imagen no se tumbe; y el bloque solo cabe en la salida JPEG — el menú de formatos lo dice.) Dos herramientas honradas, comportamientos opuestos, cada una correcta para su trabajo — y precisamente por eso adivinar por el tipo de herramienta no funciona.

Fuera del navegador el panorama está igual de mezclado, con la misma lógica debajo. Las capturas de pantalla y las exportaciones son codificaciones nuevas: sin metadatos de cámara. Las apps de mensajería recomprimen fuerte, así que las fotos enviadas como fotos suelen perder sus etiquetas — pero el mismo archivo enviado «como documento» viaja byte a byte, etiquetas incluidas. Los adjuntos de correo y las nubes mueven archivos sin cambios. El patrón se sostiene: reconstruido significa arrancado, copiado significa conservado.

## Comprobar en vez de suponer

La comprobación tarda menos de un minuto: abre el archivo de salida — no el original — en el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) y lee lo que hay. Analiza el archivo en tu propia máquina y muestra cada etiqueta, miniatura incrustada incluida. Si no hay nada, nada se filtró. Si sigue ahí, ves exactamente qué.

De todo lo anterior salen tres hábitos:

- **Cuando el objetivo es la privacidad, quita a propósito.** Arranca las etiquetas con la herramienta EXIF — edita el archivo sin reencodear, así que la imagen no pierde nada — y luego comprueba el resultado. No te fíes de un redimensionado que arranca de rebote.
- **Cuando el objetivo es conservar el registro, convierte con una herramienta que diga que preserva** — y comprueba eso también, porque «seguramente lo guardó» falla en la otra dirección: un archivo fotográfico con las fechas evaporadas también es una pérdida.
- **Comprueba el archivo que de verdad envías**, tras el último paso de tu cadena. Cada herramienta decide por su cuenta, y solo cuenta el contenido del archivo final.

Y si la herramienta de comprobar es a su vez una página web, la pregunta de siempre también va por ella: un visor de metadatos recibe tu foto, GPS incluido. El de aquí corre entero en tu navegador, sin enviar nada a ninguna parte, y [la guía sobre subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) enseña a verificar esa afirmación en vez de creerla.
