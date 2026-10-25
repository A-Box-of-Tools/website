# Cómo censurar una imagen para que lo tapado desaparezca de verdad

Tapar algo y quitarlo se ven idénticos en pantalla y no son lo mismo. Aquí está la diferencia, los dos estilos que dejan más rastro del que la gente supone, y las comprobaciones que te dicen cuál de las dos cosas acabas de hacer.

[Abrir Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.

Última actualización 13 de octubre de 2026

## La respuesta corta

Abre el [Censor de imágenes](https://abox.tools/es/censurar-imagen/), arrastra la imagen dentro, dibuja un recuadro sobre cada cosa que nadie debe ver y pulsa «Censurar y guardar». Usa el relleno negro para todo lo que se lea como texto. El archivo que recibes tiene valores de píxel distintos donde estaban los recuadros: no hay dentro ningún rectángulo que apartar, porque no hay ningún rectángulo.

Todo lo demás explica por qué esa última frase es lo importante, y cómo saber si una herramienta que ya usas puede decir lo mismo.

## Una captura de soporte o un fragmento de documento

**Una captura para informar de un error.** Conserva el error y controles explicativos; tapa con relleno sólido correos, cuentas, tokens en la barra de dirección y notificaciones ajenas. Elige PNG para texto nítido. Abre el archivo `-redacted` y lee alrededor de todos los cuadros antes de adjuntarlo, incluidos nombres repetidos en otro lugar.

**Un recibo, etiqueta de paquete o fragmento de identificación.** Cubre todo el campo con margen alrededor de las letras y tapa QR y barras además del número legible. Los campos Izquierda, Arriba, Ancho y Alto ayudan con vistas pequeñas. Trabaja imagen por imagen y revisa la guardada a tamaño completo. Quitar un campo no elimina pistas en otros lugares; el cuadro revela tamaño y posición del área tapada. Usa sólido para caras cuando importe identificar: difuminado y pixelado conservan medidas del sujeto.

## Tapar y quitar se ven idénticos en pantalla

Dibuja un rectángulo negro sobre un nombre en un lector de PDF, en una presentación, en un procesador de textos o en un editor de imágenes por capas. Lo que ves es un nombre con un rectángulo negro encima. Lo que has *guardado*, en casi todos esos programas, es un documento que contiene el nombre y, aparte, un rectángulo con una posición, un tamaño y un color.

Quien abra ese archivo puede mover el rectángulo, borrarlo o abrir el documento en un programa que dibuje las capas en otro orden. El nombre sigue ahí. Nada en la pantalla te dice cuál de las dos cosas ha ocurrido, y por eso mismo esto le sigue pasando a organizaciones que tienen abogados.

Así se han publicado escritos judiciales, informes oficiales, contratos y más de un documento escaneado de un periódico. El patrón es siempre el mismo: el rectángulo era la anotación, y la anotación no era la imagen.

## Qué es una censura de verdad

Una imagen es una cuadrícula de números, uno por píxel. Censurarla significa **escribir números distintos en la cuadrícula** y guardar después la cuadrícula. A partir de ahí no hay nada que recuperar, no porque el archivo lo esconda bien, sino porque los valores no están en el archivo. Es la única versión de esto que sobrevive a que la abra alguien con curiosidad.

De ahí se siguen tres cosas, y son el aspecto que debe tener un archivo censurado:

- **El resultado es una imagen plana.** Sin capas, sin objetos, sin lista de anotaciones, sin nada que activar y desactivar. Si tu herramienta devuelve un archivo con una capa dentro, ha tapado en lugar de quitar.
- **Es un archivo nuevo, no uno viejo editado.** Los píxeles han pasado por un decodificador y un codificador, así que lo que sale se escribe desde la cuadrícula ya censurada.
- **Los metadatos también desaparecen**, como efecto secundario. Una cuadrícula de píxeles no lleva modelo de cámara, ni posición GPS, ni fecha. Lo que habría llevado está en [lo que una foto cuenta de ti](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/).

Esto último merece decirse despacio, porque esconde otra trampa. Muchas fotos llevan una **miniatura incrustada**: una segunda copia pequeña de la imagen, escrita al crear el archivo y no siempre regenerada cuando la imagen se edita. Una foto censurada por una herramienta que edita el archivo en su sitio, en vez de recodificarlo, puede viajar con una miniatura del original sin censurar. Es una imagen pequeña, y es de sobra lo bastante grande como para leer un nombre en ella.

![La tarjeta de guardado: un menú de formato, un control de calidad y una nota que dice que los píxeles tapados se quitan del archivo que se escribe.](https://abox.tools/screens/redact-an-image/save.webp)

Guardar es el paso que lo hace real. Lo que sale es un archivo nuevo sin esos píxeles, no el original con un rectángulo encima.

## Negro, pixelado o difuminado, y por qué no son equivalentes

Los tres sobrescriben los píxeles. Solo uno no deja nada detrás.

### Relleno negro

Todos los píxeles del cuadro toman el mismo color. No sobrevive contorno ni brillo medio de lo cubierto. El tamaño y contexto aún sugieren qué tipo de campo había. Es el único de los tres donde «¿se puede deshacer?» tiene un no rotundo respecto a esos píxeles. Úsalo para nombre, dirección, cuenta, matrícula, firma o código de barras.

### Pixelado

El recuadro se corta en bloques y cada bloque pasa a ser el color promedio de ese bloque. Los píxeles originales desaparecen de verdad, pero una cuadrícula de promedios sigue siendo una medida de lo que había debajo, y con texto esa medida puede bastar.

El ataque no es sutil. El texto sale de un conjunto pequeño de posibilidades: una tipografía, un tamaño, una posición y una cadena. Quien sospeche qué clase de dato había puede renderizar cada cadena candidata del mismo modo, pixelarla con la misma cuadrícula de bloques y comparar los promedios con los tuyos. La coincidencia suele ser única. Se ha demostrado sobre capturas pixeladas reales, y hay software publicado que lo hace.

Lo que decide es **de cuántos bloques está hecho el pixelado**. Dos bloques sobre una palabra son dos números, y con dos números no se identifica una cadena. Cuarenta bloques sobre esa misma palabra son cuarenta números, y cuarenta sobran. Por eso el Censor de imágenes te dice el número de bloques del pixelado más fino de la imagen en lugar de llamar «fuerte» a un ajuste: el número es el hecho, y el adjetivo es una opinión sobre él.

### Difuminado

Cada píxel pasa a ser un promedio ponderado de sus vecinos. Eso es una convolución, y las convoluciones son invertibles en principio: recuperar el original a partir de una copia difuminada es un problema estándar con software estándar, y funciona mejor justo en el caso que aquí importa, que es texto nítido difuminado con un radio pequeño.

Pixelar y difuminar reducen distracciones del fondo, pero no son fiables para impedir identificación. Usa relleno sólido si importa ocultar al sujeto. Para nombres, números y campos legibles, **tápalos por completo**.

![El editor: una foto con una caja opaca sobre una parte, la elección entre negro, pixelado y desenfoque, un control de intensidad y un resumen de las zonas marcadas.](https://abox.tools/screens/redact-an-image/cover.webp)

Tres maneras de tapar algo, y no son equivalentes. Esta sección trata de cuál de ellas sobrevive a alguien que intente deshacerla.

## Cuatro comprobaciones antes de enviarlo

Entre todas llevan un minuto y funcionan sobre el resultado de cualquier herramienta, incluida esta. Una afirmación que puedes comprobar vale más que una que te piden aceptar.

1. **Intenta seleccionar el texto.** Abre el archivo y arrastra sobre la zona tapada. Si algo se resalta, el texto sigue en el documento y lo que estás viendo es una forma dibujada encima.
2. **Ábrelo en un editor y busca capas.** Una sola capa, llamada algo así como «Fondo», es el aspecto de una imagen censurada. Un objeto rectángulo aparte significa que el original está debajo.
3. **Mira la miniatura.** Algunos gestores de archivos y visores muestran la miniatura incrustada en lugar de volver a leer la imagen. Si la versión pequeña todavía enseña lo que tapaste, el archivo se editó en vez de reconstruirse.
4. **Inspecciona los bordes y el entorno.** No deben quedar letras, dígitos ni partes de códigos fuera del cuadro, ni repetirse el campo en otro lugar. JPEG suaviza bordes; su nitidez por sí sola no comprueba que se sobrescribieron los píxeles de origen.

## Recorta en lugar de tapar, siempre que puedas

Si lo que quieres esconder está en el borde de la imagen (una cabecera con el nombre de una cuenta, una pestaña del navegador, una barra de tareas con tu usuario), recortarlo es más fuerte que taparlo y deja un archivo más limpio. No hay ningún recuadro del que sospechar porque ya no hay nada ahí.

El [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) recorta, y [su guía](https://abox.tools/es/guias/redimensionar-una-imagen/) cuenta qué más hace. Para lo que está en medio, usa el censor.

## Una captura suele ser lo más delator

En una captura, la imagen no es casi nunca lo único que te identifica. Antes de enviar una, mira qué rodea la parte que querías enseñar: el título de la ventana, la barra de direcciones y su lista de sugerencias, las pestañas abiertas, una notificación, la hora y la fecha, la barra de tareas, un avatar con la sesión iniciada en una esquina, el nombre de la red wifi. Cualquiera de esas cosas puede situarte, y ninguna es lo que estabas mirando cuando hiciste la captura.

## Nada de esto necesita una subida

Leer una imagen, escribir encima de algunos de sus píxeles y volver a codificarla son cosas que cualquier navegador sabe hacer desde hace años. No hay ninguna razón técnica para que la foto de tu pasaporte, tu nómina o tu extracto bancario viaje al servidor de un desconocido y vuelva solo para que le pongan un recuadro negro. Y esas son justo las imágenes que recibe una herramienta de censura.

La de aquí no las envía a ninguna parte: la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, y ninguna es nuestra. Carga la página, desconéctate de internet y censura algo igualmente si prefieres comprobarlo a que te lo cuenten. [¿Es seguro subir archivos a los conversores online?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone tres comprobaciones más que puedes hacerle a cualquier herramienta.
