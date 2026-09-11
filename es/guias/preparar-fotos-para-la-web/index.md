# Cómo preparar las fotos del móvil para la web

Una foto de móvil está en el formato equivocado, es cuatro veces más grande de la cuenta y sabe dónde vives. Dejarla publicable es una cadena corta — convertir, encuadrar, comprimir — y cada paso corre en tu propio equipo, que es exactamente donde deben estar las fotos con tu GPS dentro.

Última actualización 26 de agosto de 2026

## La respuesta corta

1. **Primero las fotos de iPhone:** pasa los HEIC por el [conversor de HEIC](https://abox.tools/es/convertir-heic-a-jpg/) y elige dejar los metadatos fuera. Te dice, antes de convertir nada, qué fotos llevan coordenadas GPS. Las fotos que ya son JPEG se saltan este paso.
2. **Encuadre y tamaño:** suelta el lote en el [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/). Fija un lado largo — 1600 píxeles van bien para la mayoría de páginas, 2000 si los lectores harán zoom — o recorta el lote entero a una misma proporción con un clic.
3. **Clava el presupuesto:** termina en el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que acepta un objetivo en kilobytes en vez de un control de calidad, y devuelve el lote en un solo zip.

Todo corre en tu navegador. Los originales — resolución completa, GPS y todo — nunca salen de tu equipo, que es la gracia de hacer esto en local en vez de en una web de conversión.

## A dónde van los metadatos

El riesgo silencioso de una foto de móvil no son los píxeles; son las etiquetas. Los metadatos EXIF apuntan la cámara, las horas y, en casi cualquier teléfono, las coordenadas GPS de donde se tomó la foto. Publícala y puede que estés poniendo tu dirección al alcance de cualquiera que mire.

Lo útil de esta cadena es que se ocupa de las etiquetas por su cuenta. Redimensionar y comprimir redibujan la imagen desde los píxeles, y los píxeles redibujados no llevan etiquetas: lo que sale de los pasos 2 o 3 está limpio sin que lo pidas. Los dos casos que piden una decisión:

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
