# Convierte una secuencia de imágenes o una presentación de fotos a MP4

Una secuencia renderizada necesita una imagen por fotograma de vídeo; una presentación necesita tiempo para mirar cada fotografía. Empieza por esa elección y revisa el orden, las dimensiones y la duración antes de codificar en tu dispositivo.

[Abrir Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/): Crea un MP4 a partir de una secuencia de render, fotos de timelapse o una presentación.

Última actualización 23 de octubre de 2026

## La respuesta corta

Abre [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/), añade y ordena fotos, elige segundos para diapositivas o fotogramas para secuencias, indica duración de cada una y crea el vídeo. Se recomienda MP4 con H.264; pruébalo en la aplicación receptora antes de compartir.

Los dos ajustes que más veces obligan a una segunda pasada son la duración y la resolución, y conviene entenderlos antes del primer renderizado, no después.

## De una secuencia renderizada numerada a MP4

1. En [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/), añade las imágenes fijas exportadas por Blender, After Effects u otro programa de renderizado. Usa un formato de imagen que el navegador pueda decodificar, como PNG o JPG.
2. Elige Ordenar por nombre. La ordenación entiende los números, así que frame_2 va antes que frame_10. Revisa la lista por si faltan fotogramas o la numeración vuelve a empezar donde no debería.
3. Deja Mantener cada imagen durante en un fotograma y ajusta la tasa de fotogramas a la del renderizado. Una secuencia de 240 imágenes a 24 fps dura diez segundos.
4. Elige las dimensiones de salida y Ajustar dentro para conservar la imagen completa. Las zonas transparentes adoptan el fondo seleccionado: el MP4 con H.264 no conserva el canal alfa.
5. Crea el vídeo, mira el principio y el final, descárgalo y ábrelo en la aplicación que lo recibirá.

Una carpeta de fotografías para un vídeo acelerado sigue los mismos pasos. La tasa de fotogramas determina la velocidad de reproducción; Ordenar por fecha usa la fecha de modificación del archivo, así que revisa el orden si has copiado o editado las fotografías. Para un vídeo que ya existe, usa el [Creador de vídeos acelerados](https://abox.tools/es/crear-timelapse/).

## Diapositivas, animación cuadro a cuadro o registro de progreso

Para vacaciones, resumen de evento o catálogo, cambia Mantener cada imagen durante a segundos, escribe por ejemplo tres y pulsa Aplicar a todas. Ordena la historia, elige 1080p o forma vertical del destino y Ajustar dentro para conservar toda la foto. Revisa duración antes de crear y mira primera, central y última imagen en el vídeo final.

Para animación cuadro a cuadro, render o fotos periódicas de progreso, usa fotogramas: una imagen durante un fotograma a 24 fps da 24 imágenes por segundo. Ordena por nombre y revisa. Escribe cortes directos entre imágenes, sin zoom, fundido ni sonido. Una presentación narrada necesita otro editor; un registro visual silencioso queda completo aquí.

## La cadencia y la duración no son lo mismo

Esta es la confusión que le cuesta a la gente un renderizado de más.

**Duración en segundos** indica cuánto permanece cada imagen. Tres segundos es un inicio cómodo para diapositivas; uno o dos es ágil; más de cinco se alarga salvo que haya narración.

**Frecuencia, con segundos elegidos,** es cuántas veces se repite la imagen por segundo. Una imagen fija de tres segundos se ve igual a 24 y 60 fps, pero cambia mucho el tamaño y tiempo de codificación.

Empieza con un fotograma por imagen. Así la frecuencia sí cambia duración: 24 imágenes a 24 fps duran uno, a 12 duran dos segundos. Para diapositivas normales cambia a segundos; 24 o 30 fps basta. Sin panorámicas, zoom ni fundidos, subir la frecuencia no añade movimiento.

![Los ajustes de resolución y tasa de fotogramas, con un resumen que cuenta las imágenes, la duración total, los fotogramas y el tamaño estimado.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

En segundos, cambiar frecuencia cambia cantidad de fotogramas, pero conserva duración de cada imagen. En fotogramas, cambia también la duración.

## La resolución, y las imágenes de otra forma

Un vídeo tiene un único tamaño de fotograma para toda su duración, y tus fotografías casi seguro que no comparten ninguno. Así que a las que no encajen les tiene que pasar algo, y ese algo es justo la decisión que conviene tomar a conciencia.

Empieza eligiendo la resolución según dónde vaya a acabar el vídeo:

- **⁦1920×1080⁩** para lo general. Es compatible con todo, se reproduce en todas partes y es lo que casi todo el mundo entiende por HD.
- **⁦1080×1920⁩**, los mismos números al revés, para cualquier destino pensado para el móvil: historias, reels, shorts.
- **⁦3840×2160⁩** solo si las imágenes llevan de verdad tanto detalle y el destino lo va a enseñar. Son cuatro veces los píxeles, cuatro veces el tiempo de codificación y más o menos cuatro veces el archivo.

Después decide qué hacer con las que no encajan. Encajar cada imagen dentro del fotograma la conserva entera y deja bandas a los lados: no tiene riesgo, y es la respuesta correcta cuando las imágenes importan más que la presentación. Llenar el fotograma y recortar lo que sobra queda más vistoso, pero a algunas les va a cortar la parte de arriba. Y mezclar fotografías verticales y horizontales en un mismo vídeo es el caso en el que no hay ninguna respuesta buena: decidir de antemano por qué lado prefieres equivocarte te ahorra un renderizado.

## El orden y la trampa de los nombres de archivo

Como en cualquier trabajo por lotes, los nombres de archivo se ordenan de una manera que no es la manera en que contaste tú. En una ordenación alfabética, `photo2.jpg` va después de `photo10.jpg`, porque la comparación es carácter a carácter.

Ordenar por nombre cuenta números: photo2 va antes de photo10. Por fecha usa modificación del archivo, no necesariamente captura; las fotos copiadas o editadas pueden necesitar orden manual. Arrastra si la historia no es cronológica. Revisa antes de crear: cambiar el orden del vídeo exige repetir todo.

![Seis imágenes en el orden en que se verán, cada una con un campo de duración, encima de una fila que fija todas las duraciones a la vez.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

El orden es la lista, y la lista se arrastra. Sale del orden en que las añadiste, que no es el que dan a entender los nombres de archivo.

## No hay banda sonora, y no es poca cosa

El MP4 que escribe esta herramienta lleva una única pista de vídeo y ninguna de audio. Si tu pase necesita música o narración, para ese paso te hará falta un editor de vídeo.

Y conviene saber por qué, no solo que es así. Añadir audio significa descodificar un archivo de música, codificarlo a AAC e intercalarlo con el vídeo dentro del contenedor. Las tres cosas son trabajo de verdad, y hacerlas mal te da un archivo que se va desincronizando según se reproduce. Por eso está en la lista de pendientes en vez de estar a medias.

Un consejo práctico si vas a añadir música después: elige primero la pista y luego ajusta la duración por imagen para que el pase se acerque a lo que dura la canción. Recortar la música para que quepa en el vídeo siempre suena peor que ajustar el vídeo a la música.

## Qué sale, y qué hacer si no se reproduce

Se busca MP4 con H.264 porque es la combinación que se reproduce en más sitios. Si ese codificador no está disponible, la herramienta puede recurrir a grabar la reproducción en tiempo real, normalmente en WebM, que aceptan menos editores y plataformas sociales. Mantén visible la pestaña durante esa grabación. Los tiempos de esta alternativa son aproximados y pueden saltarse imágenes si la decodificación se retrasa; para una secuencia numerada exacta, usa un codificador MP4 compatible.

Si el resultado es un WebM y una aplicación lo rechaza, vuelve a renderizar las imágenes originales con MP4 seleccionado en un navegador cuyo codificador WebCodecs admita H.264 con las dimensiones elegidas. Así evitas la generación adicional de codificación con pérdidas que supondría convertir el vídeo.

No hay un máximo fijo de imágenes. El vídeo se monta en memoria antes de descargarse, y la salida MP4 debe quedar por debajo de 4 GiB (unos 4,3 GB); la memoria puede agotarse antes. El codificador del navegador también debe admitir las dimensiones elegidas. Una presentación larga en 4K puede alcanzar estos límites con relativamente pocas imágenes de origen.

## Comprueba el resultado antes de compartirlo

Si las diapositivas pasan demasiado rápido, comprueba que la unidad de duración sea segundos y pulsa Aplicar a todas. Si una secuencia renderizada se reproduce demasiado despacio, revisa tanto la tasa de fotogramas como los fotogramas de duración de cada imagen. Las bandas conservan la imagen completa; si faltan bordes, normalmente se ha seleccionado Llenar el fotograma. Vuelve a exportar desde las imágenes originales cuando cambies estas opciones.

Para crear una animación que deba seguir siendo GIF, usa el [Creador de GIF](https://abox.tools/es/crear-gif/). Para convertir un GIF existente en vídeo, usa [GIF a MP4](https://abox.tools/es/convertir-gif-a-mp4/) directamente y conserva sus tiempos de reproducción. Extraer primero los PNG obliga a ajustar los tiempos a mano; la [guía para extraer fotogramas de un GIF](https://abox.tools/es/guias/separar-un-gif-en-fotogramas/) explica cuándo resulta útil ese paso adicional.

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
