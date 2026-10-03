# Cómo reducir el tamaño de un PDF, y por qué algunos no encogen

Un PDF que no cabe en el límite de un correo es casi siempre un PDF lleno de imágenes. Aquí va cómo saber si el tuyo lo es, qué cuesta comprimirlo y por qué cualquier herramienta que te prometa un porcentaje fijo no ha mirado tu archivo.

[Abrir Compresor de PDF](https://abox.tools/es/comprimir-pdf/): Reduce un documento sin mandarlo a ninguna parte.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [compresor de PDF](https://abox.tools/es/comprimir-pdf/), arrastra el documento dentro y mira lo que te dice antes de cambiar nada. Lee el archivo y te enseña dónde está de verdad el tamaño, repartido entre imágenes, tipografías, texto y dibujo, y todo aquello a lo que ya no apunta nada del documento. Con esa pantalla sola suele quedar respondida la pregunta.

Si casi todo el tamaño son imágenes, puedes contar con un ahorro grande. Si son tipografías y texto, no, y no hay herramienta que lo consiga. Cuál de los dos tienes es toda la historia, y se ve en diez segundos.

## Dónde está de verdad el tamaño de un PDF

Un PDF es un contenedor con varias clases de cosas dentro, y no todas se comprimen igual.

- **Imágenes.** Fotografías y escaneos. Casi siempre son el grueso de un PDF grande, y son la única parte con margen de verdad.
- **Tipografías incrustadas.** Una tipografía completa puede ocupar cientos de kilobytes; un subconjunto con solo los caracteres usados ocupa muchísimo menos. En cualquier caso, ya las comprimió el programa que hizo el archivo.
- **Texto y dibujo vectorial.** Instrucciones en vez de píxeles: traza esta línea, pon esta palabra aquí. Ya viene compacto y ya viene comprimido.
- **Objetos a los que ya no apunta nada.** Los PDF los van acumulando. Editar un documento muchas veces añade el cambio en lugar de reescribir el archivo, así que una versión antigua de una página puede quedarse ahí dentro para siempre. Al reempaquetar el archivo se van.

Así que los dos documentos que la gente lleva a un compresor de PDF tienen pronósticos completamente distintos. Un documento escaneado es en el fondo un montón de fotografías, y suele quedarse entre un 60 y un 90 % más pequeño. Un contrato, una tesis o un informe exportado son texto, dibujo y tipografías, y todo eso ya lo comprimió el programa que lo escribió, así que ahí el ahorro suele ser de un pequeño porcentaje, y sale de reempaquetar y de tirar lo que ya no usa nadie.

Cualquier herramienta que te prometa «hasta un 90 % más pequeño» sin mirar tu archivo te está citando el mejor caso del primer tipo para venderte el segundo.

![La tarjeta de inventario: un veredicto que dice que la mayor parte del archivo son imágenes, una barra que desglosa el tamaño y una lista con lo que pesa cada parte.](https://abox.tools/screens/make-a-pdf-smaller/inventory.webp)

Dónde está el tamaño de verdad, antes de cambiar nada. Casi todo PDF grande lo es por la razón que enseña esta barra.

## Qué tienen que ver los PPP con esto

Un PDF no guarda solo la imagen: anota también de qué tamaño se dibuja esa imagen en la página. Y eso da algo más útil que el número de píxeles, que es la resolución efectiva.

Un escaneo de 4000 píxeles de ancho colocado a lo ancho de veinte centímetros de papel lleva unos 500 píxeles por pulgada. Una pantalla enseña unos 100. Una buena impresora de oficina trabaja a 300 y no sabe aprovechar mucho más. Todo lo que quede por encima es detalle que nada en el futuro de ese documento va a enseñar jamás, y suele ser casi todo el archivo.

Por eso un compresor de PDF sensato te pide unos PPP y no un porcentaje de calidad. Primero tira los píxeles que sobran por encima de tu cifra, que no le cuestan nada a nadie porque nadie los ve, y solo después empieza a gastar calidad de verdad.

Como orientación: **150 PPP** para un documento que se va a leer en pantalla, **entre 200 y 300** para algo que se va a imprimir y **entre 72 y 100** para un borrador que nadie va a guardar. Medir contra el tamaño al que se dibuja la imagen es además la razón de que un logotipo puesto pequeño no reciba el mismo trato que un escaneo a página completa: el logotipo ya está cerca de su resolución efectiva y no hay nada que quitarle.

![La tarjeta de ajustes: preajustes, una resolución en PPP, un control de calidad y un interruptor para quitar los metadatos, con un resumen de lo que debería pesar el resultado.](https://abox.tools/screens/make-a-pdf-smaller/settings.webp)

Los dos mandos que importan son la resolución y la calidad. Lo que hace cada uno con una página de texto y con una de fotos es el tema de esta sección.

## Qué debería y qué no debería tocar la compresión

Las imágenes se recodifican, así que esas sí pierden un poco. Lo demás no debería tocarse en absoluto, y conviene comprobar que la herramienta que uses lo respeta:

- **El texto sigue siendo texto.** Seleccionable, buscable y copiable. Un compresor que aplane las páginas y las convierta en imágenes te dará un archivo muy pequeño y te habrá destrozado el documento: no podrás buscar en él, los lectores de pantalla no podrán leerlo y no hay vuelta atrás.
- **Las tipografías siguen enteras.** Sustituir tipografías le cambia el aspecto al documento en el dispositivo de otra persona, que es justo lo que el PDF existe para evitar.
- **El dibujo vectorial se copia tal cual.** Ya es pequeño, y rasterizarlo lo dejaría a la vez más grande y peor.
- **Los formularios, los enlaces, los marcadores, la estructura de accesibilidad y los adjuntos pasan al archivo nuevo.** Son fáciles de perder en una reescritura, y casi nunca se nota hasta que alguien necesita uno.

Hay una regla emparentada con esto que un compresor debería seguir y muchos no siguen: si recodificar una imagen no sale de verdad más pequeño que el original, lo que toca es devolver los bytes originales. Empeorar una imagen sin ahorrar nada es pérdida pura, y pasa más de lo que uno diría con imágenes que ya venían bien comprimidas.

## Las imágenes que no se pueden comprimir

Algunas imágenes de dentro de un PDF se saltan, y una buena herramienta te dice cuáles en lugar de descontarlas sin decir nada:

- **Imágenes JPEG 2000, JBIG2 y codificadas para fax (CCITT).** Ningún navegador trae descodificador para ninguna de ellas, así que pasan intactas. Las dos últimas son de dos niveles, solo blanco y negro, y suelen estar ya cerca de su tamaño mínimo.
- **Imágenes CMYK.** Se dejan en paz a propósito, porque recodificarlas podría desplazar los colores que sacaría una imprenta, y eso es una sorpresa desagradable en un documento que alguien va a imprimir.

## Cosas que probar antes de comprimir

A veces el archivo es grande por una razón para la que comprimir es justamente la respuesta equivocada.

**¿Se escaneó cuando no hacía falta?** Un documento impreso y luego escaneado es un montón de fotografías de texto. Si el original todavía existe en alguna parte como documento, exportarlo a PDF te dará un archivo que ocupa una fracción y que encima se puede buscar.

**¿Se exportó con ajustes de imprenta?** Los procesadores de texto y los programas de diseño suelen exportar con calidad de imprenta por defecto. Volver a exportar para pantalla desde el archivo original suele ganarle a comprimir la exportación.

**¿Tiene que ser un solo archivo?** El límite de un correo va por mensaje. A veces la solución honesta es partir un documento de 200 páginas en capítulos.

## Los archivos cifrados, y por qué un compresor debería rechazarlos

La herramienta de aquí rechaza un PDF protegido con contraseña, incluso cuando la contraseña está en blanco, que es como guardan muchos escáneres y fotocopiadoras. No es una función que falte: es deliberado.

Quitarle la protección a un documento es un trabajo distinto de comprimirlo. Una herramienta que lo hiciera sin decir nada estaría haciendo algo que tú no le has pedido, sobre un archivo que alguien bloqueó a propósito, y te devolvería una copia que ya no tendría la propiedad que esa persona quiso ponerle. Si es lo que quieres, quítale tú la protección primero y a conciencia.

## Comprobar el resultado

Ábrelo. Mira las imágenes con el zoom al máximo, comprueba que el texto se sigue pudiendo seleccionar y confirma el número de páginas.

Lo último te lo hace la herramienta de aquí antes de ofrecerte el archivo: vuelve a abrir el documento que acaba de escribir y le cuenta las páginas, en tu propio dispositivo. Escribe además PDF 1.5, que entiende cualquier lector publicado desde 2003, así que «se abre en el mío» es una aproximación razonable a «se abre en el suyo».

## Por qué esto no necesita un servidor

Comprimir un PDF suena a trabajo de servidor, y durante casi toda la vida de la web lo fue. Lo que hay en realidad es analizar la estructura del archivo, encontrar los flujos de imagen, descodificarlos y recodificarlos con los códecs que el navegador ya trae, y volver a escribir el documento. Hoy todo eso funciona dentro de un navegador.

Y aquí eso importa más que con casi cualquier otro tipo de archivo, por lo que la gente suele comprimir: contratos, informes médicos, extractos bancarios, documentos de identidad, declaraciones de la renta. La herramienta de aquí no tiene ninguna función de red, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Cárgala, desenchúfate y comprime algo igualmente.

[¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) plantea otras tres comprobaciones como esa.
