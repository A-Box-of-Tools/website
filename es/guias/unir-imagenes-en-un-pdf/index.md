# Cómo unir imágenes en un solo PDF

Alguien te ha pedido «un PDF» y tú lo que tienes son once fotografías de papeles. Aquí van las decisiones que de verdad cambian el resultado, que son el tamaño de página, el orden, la calidad y qué acaba diciendo el documento sobre ti, y también cuáles puedes ignorar.

[Abrir Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/), arrastra las fotos dentro, mueve las fichas hasta que el orden esté bien y crea el documento. Los valores por defecto, que son páginas A4, un margen pequeño y las fotografías copiadas sin recodificar, son lo que quiere casi todo el mundo.

Las cuatro cosas a las que conviene dar una segunda vuelta son el orden, el tamaño de página, el ajuste de calidad y qué acaba diciendo el documento sobre ti. Y van en ese orden, que es el de la frecuencia con que salen mal.

![Una vista previa de la primera página del PDF, con un resumen al lado: cuatro páginas, tamaño de página igual al de cada imagen y cuatro de cuatro imágenes copiadas sin tocar.](https://abox.tools/screens/combine-images-into-a-pdf/preview.webp)

La vista previa es la comprobación que merece la pena: es la página terminada, con la forma que tendrá la página terminada.

## Pon bien el orden antes que nada

El orden de las páginas es lo que más veces sale mal, porque los nombres de archivo se ordenan de maneras que nadie espera. En una ordenación alfabética, `IMG_2.jpg` va después de `IMG_10.jpg`, porque la comparación es carácter a carácter y el `1` va antes que el `2`. Una carpeta de escaneos llamados `pagina1` a `pagina12` te va a llegar en el orden equivocado en casi cualquier herramienta.

Con fotografías suele ser más fiable ordenar por fecha de captura, porque fotografiaste las páginas en el orden en que estaban. En cualquier caso, revisa las fichas antes de pulsar el botón, y no el PDF después.

## La calidad: la parte que casi todas las herramientas hacen mal en silencio

Un PDF puede llevar datos JPEG directamente. Es una propiedad del formato: los bytes comprimidos de un JPEG se meten en el documento tal cual, y el lector los descodifica igual que lo haría un navegador.

Y eso importa, porque significa que una fotografía no tiene por qué perder nada al entrar en un PDF: no se descodifica en ningún momento ni se vuelve a comprimir, así que la imagen del documento es bit a bit la de tu archivo. Muchas herramientas la recodifican igualmente, porque les resulta más simple renderizarlo todo a un lienzo y codificar de forma uniforme, y el resultado es una generación de calidad perdida sin ningún motivo.

Los demás formatos no pueden colarse así. El PNG, el WebP, el HEIC y compañía no tienen ningún filtro equivalente en PDF, así que hay que convertirlos, y eliges tú cómo:

- **Recodificar como JPEG**, que es lo que viene puesto. Da el archivo más pequeño a cambio de un pequeño coste de calidad, y es la respuesta correcta para fotografías.
- **Sin pérdidas.** Guarda los píxeles exactos a cambio de un documento mucho más grande. Es la respuesta correcta para capturas de pantalla, diagramas y cualquier cosa con texto o bordes nítidos, donde los artefactos del JPEG se ven a la legua.

## El tamaño de página, y cuándo es mejor «ajustar a la imagen»

Un tamaño de página estándar, sea A4, Carta, Oficio, A3, A5 o Tabloide, coloca cada imagen en una página de ese tamaño, escalada para que quepa dentro de tu margen. Tira de uno cuando el documento se vaya a imprimir o cuando lo vaya a archivar alguien oficial.

Con «exactamente el tamaño de cada imagen», cada página coincide con su imagen, así que no hay ni espacio en blanco ni escalado. Tira de esto cuando el PDF sea más un contenedor de imágenes que un documento: un porfolio, un conjunto de capturas, un cómic. Impreso queda mal, porque cada página tiene un tamaño distinto.

En cualquier cosa que se vaya a imprimir, un margen compensa. Las impresoras domésticas no llegan hasta el borde del papel, así que una fotografía puesta de borde a borde sale cortada.

### Páginas verticales a partir de fotografías horizontales

Si fotografiaste hojas de papel con el móvil de lado, todas las imágenes saldrán horizontales y quedarán pequeñitas en medio de una página vertical. Eso se arregla girando cada una un cuarto de vuelta antes de construir el documento, y es una decisión por imagen y no global, porque casi siempre hay unas cuantas que entraron bien orientadas.

![Los ajustes de página: tamaño, orientación, cómo encaja la imagen en la página, el margen y el color de fondo.](https://abox.tools/screens/combine-images-into-a-pdf/layout.webp)

El tamaño de página y el encaje deciden juntos si una foto se ve entera o recortada al papel. La opción de igualar cada imagen evita la pregunta por completo.

## Qué dice el PDF terminado sobre ti

Un PDF lleva un bloque de información sobre el documento: autor, productor, fecha de creación y a veces el título. Según lo que lo haya escrito, ahí puede acabar el nombre de tu cuenta, el nombre de tu equipo y la hora exacta a la que lo hiciste.

Conviene pararse a pensarlo, porque un PDF es de esas cosas que la gente le manda a otra gente: una candidatura, una reclamación, un papel para el casero. Los metadatos viajan con él, y cualquier lector puede enseñarlos.

La herramienta de aquí deja ese bloque vacío salvo por su propio nombre: ni nombres de archivo, ni nombre de equipo, ni nombre de usuario, ni fecha de creación mientras no marques la casilla que la pide. Si usas otra herramienta, ábrele una vez las propiedades al resultado para ver qué te ha escrito ahí.

Y luego están las propias imágenes. Si tus fotografías llevan etiquetas EXIF y GPS, lo que les pase depende de la vía: un JPEG copiado sin recodificar conserva lo que llevara dentro, mientras que una imagen que se recodifica pierde las etiquetas de rebote. Si te importa, límpialas antes con el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) — [su guía](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/) explica qué hay ahí dentro.

## Si el PDF sale demasiado grande

Las fotografías de móvil ocupan mucho, y con veinte se junta un documento que el correo va a rechazar. Tres cosas que probar, por orden:

**Reduce el lado más largo.** Una fotografía de 4000 píxeles de una hoja de papel lleva mucho más detalle del que va a aprovechar ningún lector ni ninguna impresora. Bajar el lado largo a unos 2000 píxeles suele dejar el archivo en la cuarta parte sin cambiar nada que nadie pueda ver en una página.

**Tira de JPEG y no de sin pérdidas** en cualquier cosa fotográfica. Sin pérdidas es la respuesta correcta para un diagrama y la equivocada para la foto de una página.

**Comprime el documento terminado.** El [compresor de PDF](https://abox.tools/es/comprimir-pdf/) trabaja contra el tamaño al que se dibuja cada imagen en la página y no contra su número de píxeles, que es la medición que importa; [su guía](https://abox.tools/es/guias/reducir-el-tamano-de-un-pdf/) explica lo que cuesta eso.

La herramienta no lleva dentro ningún límite de cuántas imágenes puedes usar. El techo de verdad es la memoria de tu propio dispositivo, porque el documento terminado se monta ahí antes de que lo descargues. Lo primero que lo nota son unos cientos de fotos de móvil a resolución completa, y reducir el lado más largo mueve ese techo bastante lejos.

## Lo que esto no te va a dar

Un PDF hecho a partir de fotografías es un PDF lleno de imágenes. Las palabras que hay dentro no son texto: no las puedes buscar, ni copiar, ni hacer que se las lea un lector de pantalla. Y eso es culpa de aquello de lo que partiste, no de la conversión.

Si necesitas texto buscable, lo que necesitas es OCR, que es otro trabajo. Y si el documento original todavía existe en alguna parte como documento, exportarlo directamente a PDF siempre le va a ganar a fotografiarlo: sale más pequeño, más nítido y buscable.

## Por qué esto no necesita una subida

Escribir un PDF es escribir un archivo estructurado: una cabecera, un conjunto de objetos y una tabla de referencias cruzadas. Ahí no hay nada que un navegador no sepa hacer, ni nada que obligue a las imágenes a viajar a ninguna parte.

Y aquí eso preocupa, por lo que la gente mete en estos documentos: documentos de identidad, extractos bancarios, informes médicos, contratos firmados. De hecho, si alguien está haciendo un PDF suele ser precisamente porque se lo va a mandar a una institución. La herramienta de aquí no tiene ninguna función de red, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio.

[¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) explica cómo comprobarlo por tu cuenta, aquí o en cualquier otro sitio.
