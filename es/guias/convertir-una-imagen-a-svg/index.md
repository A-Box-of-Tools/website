# Cómo vectorizar una imagen en SVG

Un PNG ampliado es una escalera. Un SVG son instrucciones para dibujar, así que es nítido a cualquier tamaño — y convertir lo uno en lo otro se llama vectorizar. Funciona de maravilla con formas y mal con fotografías, y la diferencia merece entenderse antes de empezar.

[Abrir Imagen a SVG](https://abox.tools/es/convertir-imagen-a-svg/): Una forma, un contorno. Señala lo que no debería estar ahí.

Última actualización 31 de agosto de 2026

## La respuesta corta

Abre [Imagen a SVG](https://abox.tools/es/convertir-imagen-a-svg/), suelta la imagen dentro y mira la línea roja. Esa línea es el contorno tal como está, dibujado sobre los píxeles de los que salió. Si sigue la forma, llévate el archivo. Si hay algo dentro que no debería estar — una mota, una grapa, un pie de foto, una sombra —, haz clic en eso y desaparece.

Todo lo de abajo son las dos preguntas que deciden si esto funciona siquiera: **si tu imagen es una forma o una fotografía**, y **cuál de las dos maneras de encontrar la forma necesita**.

![Los dos paneles: a la izquierda la imagen con el contorno rojo vectorizado encima, y a la derecha el SVG terminado.](https://abox.tools/screens/trace-an-image-into-an-svg/outline.webp)

El contorno se dibuja sobre la imagen y no solo al lado. Es el único sitio donde la cuestión puede zanjarse — un contorno está bien o mal respecto a esos píxeles y a nada más.

## Vectorizar no es convertir, y las fotografías no se vectorizan

Convertir un JPEG en PNG es una conversión: la misma imagen, descrita de otra manera, y nada se decide por el camino. Vectorizar no es eso. Tira casi todo y se queda con una sola cosa — el borde de una forma — y luego describe ese borde como curvas. Si tu imagen tiene una forma clara, eso es exactamente lo que querías. Si es la foto de una habitación, no hay ninguna forma que conservar, y lo que vuelve es cada mancha de color parecido convertida en su propio borrón.

No es una limitación esperando a que la ingeniería la elimine, así que merece la pena decir con claridad cómo son los números. Una página A4 de dibujo a línea se vectoriza en tres formas y seis kilobytes. Una página de escritura a mano, en cincuenta formas y ciento cincuenta. Un solo megapíxel de fotografía se vectoriza en **cuatro mil formas y megabyte y medio** — más grande que el JPEG, más lento de abrir, y no se parece a la fotografía. La herramienta deja de dibujar en ese punto y lo dice, en vez de dejar que lo descubras después de descargarlo.

![El aviso que aparece al vectorizar una fotografía: miles de formas separadas y un archivo enorme.](https://abox.tools/screens/trace-an-image-into-an-svg/photograph.webp)

En lo que acaba una fotografía vectorizada como dibujo a línea. El archivo sigue siendo tuyo para descargarlo; la página solo se niega a fingir que es un dibujo.

Lo que se vectoriza bien:

- logotipos, marcas y monogramas;
- plantillas, sellos y archivos de corte;
- firmas y rotulación a mano;
- dibujo a línea, tramas y tintas de cómic;
- siluetas, y cualquier cosa que ya sea negro sobre blanco.

Hay un trabajo fotográfico que sí funciona, y es un trabajo distinto: recortar un objeto de su fondo como silueta maciza. Para eso está el segundo ajuste.

## Las dos maneras de encontrar la forma

Vectorizar necesita un bit por píxel — dentro, o fuera — y hay dos maneras de decidirlo.

**Claro y oscuro** pregunta si cada píxel es más oscuro que un nivel, y el nivel se calcula por ti. Es exactamente lo correcto para tinta sobre papel, y es lo que quieres para cada logotipo, escaneo y plantilla. Cuando se equivoca, suele equivocarse de un modo que se ve: mueve el umbral hasta que los trazos finos sobrevivan sin que el papel se vuelva gris con ellos.

**El sujeto** hace otra pregunta, porque en una fotografía la primera no tiene respuesta. Una figura rojo oscuro de pie sobre piedra gris oscuro es oscuro sobre oscuro: no hay luminosidad que las separe, así que ningún umbral puede. En su lugar, esto aprende qué es el *fondo* en una franja alrededor del borde de la imagen, mide cada píxel contra él y se queda con lo más grande que no lo es. Un pie de foto en la esquina no es lo más grande, así que se descarta en vez de vectorizarse.

Tiene un fallo que conviene conocer de antemano: una fotografía recortada tan ajustada que el sujeto se sale por dos o tres lados. El borde es entonces sobre todo sujeto, así que el modelo aprende los colores del propio sujeto y la respuesta sale del revés. Nada de eso se arregla moviendo un control — la suposición estaba mal, no la aritmética. Desactiva *aprender el fondo de los bordes*, marca *que el clic diga «esto es fondo»* y haz clic en el fondo dos o tres veces en su lugar.

## Arreglar lo que tomó mal, señalándolo

Un umbral es un solo número para toda una imagen, y siempre está mal en alguna parte: una sombra se convierte en tinta, una grapa sobrevive, el centro de una O se rellena. Cada uno de esos es un error local con un arreglo local evidente, y el arreglo no es otro control — es señalar la cosa.

Haz clic en cualquier cosa que no debería estar en el dibujo y desaparece; vuelve a hacer clic y vuelve. Un clic toma **toda la mancha de ese color**, así que un clic quita una mota entera o un sello entero y no un píxel. Hacer clic en un trozo de fondo encerrado lo rellena, y así se cierra un agujero que no debería serlo. La línea bajo las imágenes dice cuál de las dos cosas es y cómo de grande antes de que hagas clic, así que un clic que se llevaría casi toda la imagen nunca es una sorpresa.

Las correcciones se guardan aparte del umbral, así que mover el control después no las tira, e invertir la imagen las invierte con ella — una mota que borraste sigue borrada en vez de reaparecer como un agujero perforado en el fondo.

## Los dos números del suavizado, y cuándo tocarlos

**Detalle** es cuánto puede apartarse la línea de los píxeles al simplificarse. Por debajo de uno, más o menos, no hace nada en absoluto — un escalón queda a un píxel entero de la línea a la que pertenece, así que una tolerancia menor conserva cada escalón y no queda nada que simplificar. Por encima de dos, más o menos, empieza a comerse curvas de verdad. Se calcula por forma salvo que digas lo contrario, porque un solo número no puede servir a la vez a una figura entera y al asta de dos píxeles de una letra.

**Agudeza de esquinas** es cuánto tiene que girar el contorno para que ese giro se conserve como esquina en vez de redondearse en curva. Es solo la mitad de la decisión — un vértice también se conserva como esquina si queda lo bastante lejos de sus vecinos, lo que atrapa por sí solo cada esquina evidente —, así que este número solo decide los giros suaves. Por debajo de unos veinte grados todo se vuelve esquina y un círculo vuelve como polígono.

La mayoría de las imágenes no necesitan tocar ninguno. Merece la pena conocerlos por los dos casos que sí: el escaneo de un texto muy pequeño, que quiere más detalle, y una forma que vas a cortar en una máquina, que normalmente quiere menos.

## Lo que obtienes, y qué hacer con ello

Un archivo con un solo `<path>` dentro. Los contornos giran en un sentido y los agujeros que encierran en el otro, que es lo que permite que una forma con cuarenta agujeros sea un solo elemento sin regla de relleno que fijar — así que Illustrator, Inkscape, Figma, un navegador y la mayoría del software de corte lo leen todos igual.

![El último paso: cuántas formas y puntos tiene el dibujo, su tamaño y el botón de descarga.](https://abox.tools/screens/trace-an-image-into-an-svg/save.webp)

Merece la pena echar un vistazo al recuento antes de descargar. Un dibujo son decenas o cientos de puntos; miles significa que la imagen era una fotografía.

Ir en sentido contrario — un SVG que ya tienes, y un PNG que necesitas — es [otro trabajo con su propia guía](https://abox.tools/es/guias/convertir-un-svg-a-png/). Nada de la vectorización es reversible: el SVG que sale de aquí es un dibujo nuevo de la forma, no la imagen de la que se hizo.
