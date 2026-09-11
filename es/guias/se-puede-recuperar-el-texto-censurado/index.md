# ¿Se puede recuperar el texto tapado con negro?

Incómodamente a menudo, sí — con la herramienta de seleccionar texto, no con un laboratorio. La mayoría de los rectángulos negros se dibujan *encima* de las palabras y se guardan al lado de ellas, y las palabras viajan debajo. Esta página es el catálogo de las formas en que eso ocurre, y de lo que borrar tiene que significar en su lugar.

Última actualización 26 de agosto de 2026

## La respuesta corta

Incómodamente a menudo, sí. No con técnicas forenses: seleccionando la zona tapada y pulsando copiar. La mayoría de las herramientas a las que la gente recurre cuando algo debe ocultarse dibujan un rectángulo *encima* del contenido y lo guardan *al lado*, y todo lo que hay debajo viaja en el archivo, pacientemente, hasta que alguien mira.

No es un error raro de gente descuidada. Ha publicado nombres de expedientes judiciales, cifras sin censurar de informes oficiales — y, en una publicación masiva de documentos de un caso en diciembre de 2025, nombres en negro que se leían a las pocas horas. Quienes cometieron esos errores tenían abogados y procedimientos. Lo que no tenían es la distinción de la que trata esta página: la diferencia entre cubrir y quitar.

## El rectángulo que es un objeto

En un lector de PDF, un procesador de textos, unas diapositivas o un editor de imágenes con capas, una caja negra dibujada no es pintura. Es un *objeto*: una forma con posición, tamaño y color, guardada en el archivo como cosa aparte, delante de un texto que sigue entero. El documento no dice «esta palabra ya no está»; dice «esta palabra está aquí, y delante hay un rectángulo».

Todo lo demás se sigue de ahí. Selecciona la zona y copia, y el portapapeles recibe el texto, porque copiar lee la capa de texto e ignora la decoración que tiene delante. Abre el archivo en un editor y el rectángulo sencillamente se aparta. Expórtalo a otro formato y las capas pueden aplanarse en otro orden. En pantalla la caja es idéntica a una censura de verdad, y justo por eso el error sobrevive a las revisiones: el ojo comprueba la página, y la página se ve bien.

El PDF añade una variante más silenciosa. Un PDF puede declarar que una serie de glifos «deletrea» algo distinto de lo dibujado — una función de accesibilidad llamada `/ActualText` — y copiar lee la declaración en vez de la tinta. Un documento puede, por tanto, filtrar una palabra que ni siquiera está visible en la página.

## El desenfoque que es aritmética

Pixelar parece más seguro de lo que es. Un mosaico es una cuadrícula de promedios, y un promedio es una *medición* de lo que había debajo: pequeña y con pérdidas, pero medición al fin. Para texto en una fuente conocida y a un tamaño previsible, eso ha bastado para leerlo de vuelta: tomar cada cadena plausible, dibujarla, pixelarla de la misma manera, y quedarse con la candidata cuyo mosaico coincide. Nada de eso exige un laboratorio; es un bucle y una comparación.

El desenfoque es peor en principio. Un desenfoque es una convolución — cada píxel de salida, un promedio ponderado de sus vecinos — y las convoluciones se deshacen lo bastante bien, lo bastante a menudo, como para que la deconvolución sea una herramienta corriente de la fotografía y no un ataque exótico. Los dos efectos comparten además un fallo que no es matemático: anuncian que algo está oculto y aproximadamente cuánto mide, lo que para una contraseña de seis caracteres ya es una pista.

Un relleno plano no tiene ninguna de esas propiedades. Un solo color, de borde a borde, no transporta la medición de nada. Por eso es el ajuste por defecto de la herramienta de [censurar imágenes](https://abox.tools/es/censurar-imagen/) de aquí, por eso sus opciones de pixelar y desenfocar dicen en su propia etiqueta lo que no prometen, y por eso su control de intensidad informa de un número y no de un adjetivo.

## Las copias que un archivo guarda de su pasado

La tercera familia de fallos no tiene nada que ver con el tapado. Los archivos recuerdan, de maneras que nada en pantalla enseña:

- **Los metadatos de una foto incluyen a menudo una miniatura** de la imagen tal como era antes de editarla. Recorta tu dirección fuera de una foto, y el bloque EXIF puede conservar aún el original sin recortar en pequeño. El [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) muestra ese bloque y lo quita; hay [una guía](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/).
- **Algunos editores guardan en el sitio sin truncar.** Un famoso par de fallos de 2023 — en el marcador de capturas de un teléfono y en la herramienta de recortes de un escritorio — dejaba los bytes de la imagen original dentro del archivo tras recortar, de modo que la parte «recortada» podía reconstruirse a partir de los restos.
- **Los PDF pueden llevar su propia historia.** Un PDF editado con guardados incrementales añade los cambios al final del archivo y deja intacta dentro la versión anterior, borrados incluidos.

El hilo común: lo que un visor muestra y lo que un archivo contiene son preguntas distintas, y una censura comprobada solo mirando ha contestado únicamente la primera.

## Qué exige quitar de verdad

Una censura de verdad cambia los datos, no la vista, y se comprueba por el mismo camino por el que puede fallar: preguntando al archivo, no a la pantalla.

Para una imagen, eso significa que los píxeles bajo la caja dejan de existir antes de que se escriba archivo alguno. Eso hace exactamente la herramienta de [censurar imágenes](https://abox.tools/es/censurar-imagen/): los valores cubiertos se sobrescriben en memoria y solo entonces se entregan al codificador, de modo que la salida contiene píxeles negros donde estaba el contenido, no tinta negra delante. La versión paso a paso está en [la guía de censurar una imagen](https://abox.tools/es/guias/censurar-una-imagen/).

Para un PDF, significa que los glifos se borran de las instrucciones que dibujan la página, junto con los portadores ocultos: declaraciones `/ActualText`, marcadores, comentarios, campos de formulario. Eso hace la herramienta de [censurar PDF](https://abox.tools/es/censurar-pdf/), y después hace lo más importante: reabre su propia salida y busca en ella las palabras quitadas, y **si algo sobrevivió, no hay descarga**. El recorrido está en [la guía de censurar un PDF](https://abox.tools/es/guias/censurar-un-pdf/).

Y uses la herramienta que uses, donde sea, la prueba de aceptación es tuya: selecciona encima de la zona censurada y copia; busca en el archivo la palabra quitada; ábrelo en otro visor. Si el contenido se quitó, nada puede encontrarlo — y que una herramienta haga esto en tu navegador, sin que el archivo salga de tu máquina, es también una afirmación que puedes comprobar en vez de creer: [la guía sobre subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) enseña cómo. Censurar es el único trabajo donde el archivo es sensible por definición, y eso lo convierte en el último que debería pasar por el servidor de un desconocido.
