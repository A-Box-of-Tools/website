# Cómo preparar las fotos del móvil para la web

Una foto de móvil está en el formato equivocado, es cuatro veces más grande de la cuenta y sabe dónde vives. Dejarla publicable es una cadena corta — convertir, encuadrar, comprimir — y cada paso corre en tu propio equipo, que es exactamente donde deben estar las fotos con tu GPS dentro.

Última actualización 13 de octubre de 2026

## La respuesta corta

1. **Primero las fotos de iPhone:** pasa los HEIC por el [conversor de HEIC](https://abox.tools/es/convertir-heic-a-jpg/) y elige dejar los metadatos fuera. Te dice, antes de convertir nada, qué fotos llevan coordenadas GPS. Las fotos que ya son JPEG se saltan este paso.
2. **Encuadre y tamaño:** suelta el lote en el [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/). Fija un lado largo — 1600 píxeles van bien para la mayoría de páginas, 2000 si los lectores harán zoom — o recorta el lote entero a una misma proporción con un clic.
3. **Clava el presupuesto:** termina en el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que acepta un objetivo en kilobytes en vez de un control de calidad, y devuelve el lote en un solo zip.

Todo corre en tu navegador. Los originales — resolución completa, GPS y todo — nunca salen de tu equipo, que es la gracia de hacer esto en local en vez de en una web de conversión.

## Una galería de blog y un catálogo de productos usan los píxeles de forma distinta

**Un artículo o galería compartida.** Mide el espacio más ancho donde aparecerá la imagen y elige píxeles suficientes para las densidades de pantalla previstas. Fija un máximo de bytes por imagen y revisa caras, cielos y texturas finas en la página terminada. Los tamaños anteriores son puntos de partida, no límites universales.

**Tarjetas de productos con encuadre uniforme.** Recorta a la proporción de la tarjeta en el redimensionador y revisa cada imagen: el mismo recorte puede cortar un producto situado de otra forma. Añade margen hasta el marco exacto si deben verse todos los bordes. Conserva una copia mayor para el zoom del producto, en vez de ampliar la miniatura.

**Diagramas y capturas en el mismo artículo.** Usa PNG o WebP sin pérdida confirmado para texto pequeño y bordes definidos; JPEG o WebP con pérdida para fotos. El convertidor [PNG a WebP](https://abox.tools/es/convertir-png-a-webp/) indica si el navegador escribió realmente sin pérdida. Revisa el texto más pequeño en la página, no solo el tamaño del archivo.

## A dónde van los metadatos

El riesgo silencioso de una foto de móvil no son los píxeles; son las etiquetas. Los metadatos EXIF apuntan la cámara, las horas y, en casi cualquier teléfono, las coordenadas GPS de donde se tomó la foto. Publícala y puede que estés poniendo tu dirección al alcance de cualquiera que mire.

Los archivos realmente redimensionados o comprimidos se redibujan desde píxeles sin copiar etiquetas. Pero ambas herramientas devuelven intacto un archivo ya adecuado: una foto pequeña que no necesita ninguno de los pasos puede conservar EXIF y GPS. Revisa las copias finales antes de publicar y usa el [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) para limpiar los archivos intactos. Quedan dos decisiones:

- **Convertir HEIC:** el conversor puede llevar los metadatos consigo o dejarlos fuera — es una casilla — y avisa de qué fotos llevan GPS a bordo. Para cualquier cosa pública, fuera.
- **Una foto que no vas a redimensionar:** si los píxeles deben quedar intactos, byte a byte, usa el [editor EXIF](https://abox.tools/es/eliminar-datos-exif/), que quita las etiquetas sin recodificar la imagen. La [guía de metadatos](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/) es la versión larga.

## Por qué redimensionar antes de comprimir

Porque los píxeles son el presupuesto. Una foto de 12 megapíxeles apretada hasta caber en 300 KB se ve claramente peor que una de 2 megapíxeles comprimida con suavidad en el mismo hueco: los mismos kilobytes se reparten en seis veces más superficie. Decidir primero el tamaño al que se verá deja que el compresor gaste su presupuesto en calidad y no en resolución que nadie verá.

El compresor redimensiona por su cuenta cuando no hay otro modo de llegar al objetivo, pero lo trata como último recurso. Hacer tú el encuadre en el redimensionador mantiene la decisión — qué se recorta, qué borde importa — donde debe estar.

La [guía de redimensionado](https://abox.tools/es/guias/redimensionar-una-imagen/) y la [guía de compresión](https://abox.tools/es/guias/comprimir-una-imagen-a-un-tamano-exacto/) profundizan cada una en su mitad, incluida la cuestión de qué miden de verdad los números de calidad.

![El redimensionador puesto en lado más largo, con 1600 escrito y lados largos predefinidos al lado.](https://abox.tools/screens/get-photos-ready-for-the-web/long-edge.webp)

El lado largo primero, porque es el único ajuste que trata igual a una foto vertical y a una horizontal.

## El lote entero de una vez

Cada herramienta de la cadena acepta una carpeta entera en un solo arrastre: el conversor hace cada HEIC, ráfagas incluidas, el redimensionador pone un mismo encuadre a todo el conjunto o te deja recortar cada foto a su manera, y el compresor devuelve el lote en un único zip. Veinte fotos apenas cuestan más atención que una: el tiempo de máquina es de tu máquina, y es menos del que habría tardado cualquier subida.

![Tres filas de resultado, cada una con una foto reducida de megabytes a unos 150 kB, y la calidad con la que acabó cada una.](https://abox.tools/screens/get-photos-ready-for-the-web/quality.webp)

Y la calidad después, sobre todo el lote a la vez. El orden importa: la sección de arriba dice por qué.

## Si haces esto cada semana

Que la cadena viva aquí en tres o cuatro páginas es a propósito: cada página hace un trabajo, y cada una demuestra por sí sola que nada sale de tu equipo. Pero cada paso es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias con README que explican el decodificador, el remuestreo y la búsqueda del tamaño objetivo.

Si tus fotos toman siempre la misma forma — mismo lado largo, mismo presupuesto, mismas etiquetas fuera — apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele que componga esos módulos en una sola zona de arrastre con tus ajustes ya puestos. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
