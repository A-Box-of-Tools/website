# Lo que un PDF recuerda

Más que sus páginas. Un PDF lleva de forma rutinaria el nombre de su autor, el programa que lo produjo, el archivo que era antes de ser un PDF — y, si se editó de cierta manera muy común, cada versión anterior de sí mismo, borrados incluidos. Nada de eso aparece en pantalla.

Última actualización 26 de agosto de 2026

## La respuesta corta

Un PDF no es una imagen de sus páginas. Es un contenedor, y las páginas son solo la parte de la carga que se muestra. Alrededor de ellas, el formato tiene sitio para un bloque de información del documento, una segunda copia XML de lo mismo, comentarios, datos de formularios, archivos adjuntos — y, a través de una manera muy común de guardar ediciones, versiones anteriores completas del documento, apiladas bajo la actual.

Nada de esto es un defecto. Cada pieza se diseñó para un trabajo razonable, y dentro de una organización casi todo es inofensivo o útil. El problema es el cruce de frontera: en el momento en que un PDF sale — hacia la otra parte de un contrato, una lista de correo, un expediente público — todo lo que recuerda se va con él, y lo que recuerda no se muestra en ninguna página. La gente revisa lo que un documento dice y envía lo que el archivo contiene, y son dos cosas distintas.

## La etiqueta con el nombre: /Info y el paquete XMP

Todo PDF puede llevar un diccionario de información del documento: autor, título, fechas de creación y modificación, y los nombres de los programas que lo crearon y produjeron. La mayoría lleva una segunda copia, más rica, de los mismos datos como XML incrustado, llamada XMP. Ninguna de las dos se muestra con las páginas; ambas están a un panel de propiedades de distancia.

Los valores se rellenan solos, y eso es lo que los hace filtrar. *Autor* suele ser el nombre de cuenta con el que se instaló el sistema operativo: un nombre real y completo, en documentos que sus autores creían anónimos: candidaturas, dictámenes, quejas, ofertas. *Título* es rutinariamente el nombre del archivo del que se exportó el PDF, así que `Borrador-v7-reparos-legales.docx` sobrevive dentro del PDF pulido que debía sustituirlo. La línea del productor fecha el programa; las fechas contradicen versiones oficiales. Se han escrito estudios enteros sobre lo que los PDF institucionales confiesan en este bloque.

## El deshacer eterno: guardados incrementales

La pieza más afilada del contenedor es de la que el formato está más orgulloso. El PDF admite *actualizaciones incrementales*: en vez de reescribir el archivo, un editor puede añadir sus cambios al final y dejar intacto todo lo anterior. El visor lee el archivo desde el final y muestra la versión más nueva; las viejas siguen ahí, byte a byte, en el mismo archivo.

Guardar añadiendo es rápido y a prueba de cuelgues — y significa que un documento editado así contiene su propia historia. El texto «borrado» no se ha ido: está superado, y recuperarlo es cosa de leer el archivo tal como era antes del último añadido. Un rectángulo negro trazado sobre un nombre en un editor que guarda incrementalmente produce un archivo que contiene el nombre *dos veces* — una bajo el rectángulo y otra en la historia —, lo que duplica el fallo descrito en [la guía del censurado](https://abox.tools/es/guias/se-puede-recuperar-el-texto-censurado/).

El remedio es una reescritura completa: abrir el archivo, quedarse con lo que la versión actual usa de verdad, escribir un archivo nuevo sin pasado. Eso hace por construcción el [compresor de PDF](https://abox.tools/es/comprimir-pdf/) de aquí: una reescritura no puede evitar abandonar la historia, y la herramienta cuenta el material superado que dejó atrás en su desglose de tamaños, que es además la manera más fácil de descubrir que tu archivo tenía historia.

## La bodega: comentarios, campos, adjuntos, capas

El resto de la memoria es más corriente, y se filtra igual:

- **Comentarios y anotaciones**: la conversación de la revisión, viajando con el documento revisado, visible para quien sepa mirar.
- **Los campos de formulario** conservan sus valores rellenados como datos incluso donde una página aplanada ya no los muestra.
- **Los adjuntos**: un PDF puede incrustar archivos enteros, de cualquier tipo, y los visores los enseñan en un panel lateral que la mayoría de la gente no ha abierto nunca. La hoja de cálculo de detrás del gráfico a veces va adjunta al gráfico.
- **Las capas de contenido opcional** pueden guardar contenido de página apagado en vez de quitado: presente entero, mostrado nunca.

Cada una de estas cosas son datos que las páginas no enseñan, en un archivo que la gente juzga por sus páginas.

## Enviar un PDF sin su memoria

El patrón de todo esto: lo que sobrevive lo decide cómo se escribió el archivo, así que el arreglo es pasarlo por algo que escriba con desmemoria, en tu propia máquina — la historia de un documento es exactamente lo que no hay que subir al servidor de un desconocido, argumento que [la guía sobre subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) desarrolla entero. Tres herramientas de este sitio escriben PDF, y las tres se construyeron para dejar la memoria fuera:

- La herramienta de [unir y separar PDF](https://abox.tools/es/unir-pdf/) escribe su salida **sin diccionario de información alguno**: sin autor, sin fechas, sin línea que nombre al programa. Lo que copia de tus originales es lo que sus páginas usan, no su equipaje. Hay [una guía](https://abox.tools/es/guias/unir-y-separar-archivos-pdf/).
- El [compresor de PDF](https://abox.tools/es/comprimir-pdf/) reescribe el archivo por completo — historia superada abandonada, paquete XMP y datos privados de aplicaciones no conservados — y detalla lo que quitó. También [con guía](https://abox.tools/es/guias/reducir-el-tamano-de-un-pdf/).
- La herramienta de [censurar PDF](https://abox.tools/es/censurar-pdf/), para cuando la memoria es justamente el asunto: en cada pasada limpia el bloque de información, el paquete XMP, los marcadores, los comentarios, los valores de campos y los adjuntos, además del censurado en sí — [su guía](https://abox.tools/es/guias/censurar-un-pdf/) lo recorre todo.

Y la prueba de aceptación refleja la fuga: juzga el archivo, no las páginas. Abre el panel de propiedades y lee lo que queda; busca en el archivo crudo una palabra quitada; mira el desglose del compresor sobre lo que tu documento llevaba encima. Un PDF sin memoria no tiene nada que confesar, lo lea quien lo lea.
