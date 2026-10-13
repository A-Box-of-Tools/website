# Cómo convertir una carpeta de imágenes en un vídeo

Un pase de diapositivas es fácil de hacer y fácil de tener que renderizar dos veces, porque hay dos ajustes que no significan lo que parece. Aquí va lo que controla cada uno y cuál elegir.

[Abrir Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Convierte una carpeta de imágenes en un vídeo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/), arrastra las fotos dentro, ponlas en orden, decide cuánto se queda cada una y crea el vídeo. Te llevas un MP4 con vídeo H.264, que se reproduce prácticamente en cualquier cosa.

Los dos ajustes que más veces obligan a una segunda pasada son la duración y la resolución, y conviene entenderlos antes del primer renderizado, no después.

## La cadencia y la duración no son lo mismo

Esta es la confusión que le cuesta a la gente un renderizado de más.

**La duración** es cuánto tiempo se queda cada imagen en pantalla, y es el ajuste que de verdad te importa. Tres segundos van bien por defecto para un pase que alguien está mirando; uno o dos segundos quedan ágiles; y pasar de cinco se hace pesado, salvo que haya una voz por encima.

**La cadencia** es cuántas veces por segundo el vídeo repite esa imagen. Al aspecto del pase no le cambia nada, porque una imagen fija que se queda tres segundos se ve idéntica a 24 fotogramas por segundo que a 60. Lo que sí cambia bastante es el tamaño del archivo y el tiempo de codificación.

Así que para un pase de diapositivas normal, cadencia baja. Con 24 o 30 sobra. La única razón para subir es que haya movimiento en el vídeo, como una panorámica o un zoom sobre cada foto, o un fundido entre ellas, porque ahí una cadencia baja se ve a saltos.

![Los ajustes de resolución y tasa de fotogramas, con un resumen que cuenta las imágenes, la duración total, los fotogramas y el tamaño estimado.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

La tasa de fotogramas y la duración no son lo mismo, y en el resumen queda claro: cambiar una mueve el número de fotogramas, no la duración.

## La resolución, y las imágenes de otra forma

Un vídeo tiene un único tamaño de fotograma para toda su duración, y tus fotografías casi seguro que no comparten ninguno. Así que a las que no encajen les tiene que pasar algo, y ese algo es justo la decisión que conviene tomar a conciencia.

Empieza eligiendo la resolución según dónde vaya a acabar el vídeo:

- **⁦1920×1080⁩** para lo general. Es compatible con todo, se reproduce en todas partes y es lo que casi todo el mundo entiende por HD.
- **⁦1080×1920⁩**, los mismos números al revés, para cualquier destino pensado para el móvil: historias, reels, shorts.
- **⁦3840×2160⁩** solo si las imágenes llevan de verdad tanto detalle y el destino lo va a enseñar. Son cuatro veces los píxeles, cuatro veces el tiempo de codificación y más o menos cuatro veces el archivo.

Después decide qué hacer con las que no encajan. Encajar cada imagen dentro del fotograma la conserva entera y deja bandas a los lados: no tiene riesgo, y es la respuesta correcta cuando las imágenes importan más que la presentación. Llenar el fotograma y recortar lo que sobra queda más vistoso, pero a algunas les va a cortar la parte de arriba. Y mezclar fotografías verticales y horizontales en un mismo vídeo es el caso en el que no hay ninguna respuesta buena: decidir de antemano por qué lado prefieres equivocarte te ahorra un renderizado.

## El orden y la trampa de los nombres de archivo

Como en cualquier trabajo por lotes, los nombres de archivo se ordenan de una manera que no es la manera en que contaste tú. En una ordenación alfabética, `foto2.jpg` va después de `foto10.jpg`, porque la comparación es carácter a carácter.

Con fotografías de un evento suele funcionar ordenar por fecha de captura, porque las hiciste en el orden en que fueron pasando las cosas. Y para cualquier cosa cuya historia no sea cronológica, lo suyo es mover las fichas a mano. Compruébalo antes de renderizar, porque el vídeo es el único resultado en el que arreglar el orden obliga a rehacer el trabajo entero.

![Seis imágenes en el orden en que se verán, cada una con un campo de duración, encima de una fila que fija todas las duraciones a la vez.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

El orden es la lista, y la lista se arrastra. Sale del orden en que las añadiste, que no es el que dan a entender los nombres de archivo.

## No hay banda sonora, y no es poca cosa

El MP4 que escribe esta herramienta lleva una única pista de vídeo y ninguna de audio. Si tu pase necesita música o narración, para ese paso te hará falta un editor de vídeo.

Y conviene saber por qué, no solo que es así. Añadir audio significa descodificar un archivo de música, codificarlo a AAC e intercalarlo con el vídeo dentro del contenedor. Las tres cosas son trabajo de verdad, y hacerlas mal te da un archivo que se va desincronizando según se reproduce. Por eso está en la lista de pendientes en vez de estar a medias.

Un consejo práctico si vas a añadir música después: elige primero la pista y luego ajusta la duración por imagen para que el pase se acerque a lo que dura la canción. Recortar la música para que quepa en el vídeo siempre suena peor que ajustar el vídeo a la música.

## Qué sale, y qué hacer si no se reproduce

Lo que se busca es MP4 con H.264, que es la combinación que se reproduce en más sitios. En un navegador sin WebCodecs, la herramienta recurre a grabar en WebM, que es el mismo material en un contenedor que aceptan menos editores y menos plataformas sociales.

Si acabas con un WebM y algo te lo rechaza, la solución no es convertirlo, sino usar un navegador compatible con WebCodecs, y las versiones actuales de Chrome, Edge y Safari lo son todas. Vuelve a renderizar en lugar de convertir, porque convertir es otra generación de codificación con pérdidas.

La herramienta no lleva dentro ningún límite de cuántas imágenes puedes usar. El techo es la memoria de tu propio dispositivo, porque el vídeo terminado se monta ahí antes de que lo descargues, y lo primero que lo nota es un pase largo en 4K.

## Hacer el archivo más pequeño

Si el resultado sale demasiado grande para donde tiene que ir, esto es lo que más ayuda, por orden:

**Baja la cadencia.** En un pase de imágenes fijas no cuesta nada que se vea, y es el mayor ahorro que puedes conseguir de una tacada.

**Baja la resolución.** 1080p en vez de 4K es la cuarta parte de los píxeles, y en la pantalla de un móvil no se va a enterar nadie.

**Acórtalo.** Tres segundos por imagen en vez de cinco son un 40 % menos de duración y un 40 % menos de archivo, y normalmente también un pase mejor.

Lo que no ayuda mucho es reducir antes las fotografías de origen. El vídeo se codifica a la resolución que hayas elegido pase lo que pase, así que una foto de 4000 píxeles y una de 2000 dan casi los mismos bytes en un vídeo de 1080p. Eso sí, la codificación va más rápida y el techo de memoria se aleja.

## Por qué esto no necesita un servidor, con una excepción declarada

Codificar vídeo era antes el argumento más claro a favor de subir cosas: los navegadores no podían y una máquina con FFmpeg sí. WebCodecs cambió eso al dar acceso al codificador por hardware que ya llevas dentro, el mismo con el que tu móvil graba vídeo en tiempo real. Y componer los fotogramas es un lienzo y poco más. Ninguno de los dos pasos necesita nada que no sea tu propio hardware.

Esta herramienta en concreto tiene una excepción, y la decimos en vez de esconderla: la función opcional de «añadir desde una dirección web» descarga una imagen desde una dirección que pegas tú, y el servidor de esa dirección ve tu IP y qué le has pedido. Eso va en la propia función, no es un defecto, y es el único paso de red que hay en toda la herramienta. Si no la usas, de tu dispositivo no sale absolutamente nada.

[¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone cuatro comprobaciones que te dirán lo mismo de cualquier herramienta, esta incluida.
