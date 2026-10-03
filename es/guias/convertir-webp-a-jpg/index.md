# La imagen que guarda la web y el formato que casi todo acepta

Al guardar una imagen de muchos sitios web recibes un `.webp`: el navegador lo lee perfectamente, pero bastantes programas todavía lo rechazan. Aquí explicamos qué es, qué se pierde al convertirlo y por qué el JPEG suele ocupar más.

[Abrir WebP a JPG](https://abox.tools/es/convertir-webp-a-jpg/): Las imágenes que guarda la web, en el formato que todos siguen aceptando.

Última actualización 17 de septiembre de 2026

## La respuesta corta

Abre el [convertidor de WebP a JPG](https://abox.tools/es/convertir-webp-a-jpg/), arrastra los archivos y pulsa «Convertir». Deja la calidad en 92 salvo que necesites cambiarla. Obtendrás archivos JPEG, con una descarga por imagen o un zip si hay varias.

No se sube nada porque no hace falta. La razón también explica por qué es tan rápido: el decodificador ya está en el navegador.

## Por qué tienes un archivo .webp

WebP es el formato de imagen de Google. Los sitios lo usan porque ocupa bastante menos que JPEG con una calidad visual parecida: normalmente entre un cuarto y un tercio menos, a veces más. En sitios que sirven millones de imágenes, eso ahorra ancho de banda y tiempo de carga. Por eso muchos sitios grandes lo adoptaron en los últimos años.

Cuando haces clic derecho y guardas una imagen, la carpeta de descargas recibe el formato que servía el sitio. No elegiste WebP; solo guardaste una imagen.

Después descubres que el destino no lo acepta. Los obstáculos habituales son:

- formularios que comparan la extensión con una lista escrita hace años;
- versiones antiguas de Word, PowerPoint y Photoshop;
- muchos lectores electrónicos y programas de impresoras y cámaras;
- algunas imprentas que solo aceptan JPEG o TIFF.

Mientras tanto, el navegador lo abre sin problemas: todos leen WebP desde 2020. Esa diferencia entre el navegador y otros programas es la razón de esta guía.

## El JPG probablemente ocupará más; es normal

Conviene saberlo antes de convertir: un WebP de 300 KB puede convertirse en un JPEG de 450 KB. No significa que haya fallado nada.

WebP comprime mejor que JPEG. JPEG se terminó en 1992; WebP llegó en 2010 con casi veinte años más de investigación. Al pasar del formato nuevo al antiguo, un compresor menos eficiente necesita más bytes para describir la misma imagen. Cambias tamaño por compatibilidad. Tiene sentido cuando el destino no acepta WebP, pero un convertidor debería explicarlo.

Si después necesitas reducir el tamaño, el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) ajusta el JPEG al límite que indiques. Aparece debajo del resultado para que no tengas que buscarlo.

## La transparencia debe sustituirse por un color

Esta es la sorpresa más frecuente y la razón por la que algunos convertidores entregan logotipos con un rectángulo negro detrás.

WebP puede tener transparencia. JPEG no tiene canal alfa ni forma de guardar «aquí no hay nada». Hay que dibujar algo detrás de la imagen y elegir qué color será. Los convertidores que no preguntan no conservan la transparencia: deciden por ti, y muchos terminan usando negro.

[Este convertidor](https://abox.tools/es/convertir-webp-a-jpg/) pregunta, propone blanco y solo muestra la opción si algún archivo realmente tiene transparencia. Comprueba los píxeles decodificados, no solo el formato: muchos WebP incluyen un canal alfa completamente opaco. Un selector de color que no cambia nada solo confunde.

Si necesitas conservar la transparencia, no conviertas a JPEG. Conserva WebP o conviértelo a PNG con el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que lee WebP y escribe PNG.

## Un WebP animado da un solo fotograma

WebP puede contener una animación, como GIF. JPEG solo guarda una imagen, así que no puede conservar los demás fotogramas.

La herramienta avisa antes de convertir: la fila indica que el archivo es animado, y el resultado lo recuerda. Recibes el primer fotograma. Si necesitas conservar el movimiento, el destino debe ser un video en lugar de una imagen fija. La guía para [convertir un GIF a MP4](https://abox.tools/es/guias/convertir-un-gif-a-mp4/) explica qué implica ese cambio.

## La imagen se vuelve a comprimir

WebP y JPEG utilizan códecs distintos. No basta con cambiar el contenedor: hay que decodificar la imagen a píxeles y codificarla de nuevo. Todos los convertidores de WebP a JPG lo hacen, incluidos los que piden subir el archivo.

Lo que puedes controlar es cuánto se pierde. La calidad predeterminada es 92, un valor con el que una fotografía resulta difícil de distinguir del original. Por debajo de aproximadamente 75, la pérdida empieza a verse en bordes definidos y texto.

Hay un caso que conviene reconocer: WebP **sin pérdida**. Los programas de diseño lo usan para gráficos planos. Al convertirlo, el JPEG será la primera copia con pérdida de esa imagen. La herramienta identifica esos archivos en la lista para que sea una decisión consciente.

## Los metadatos no se conservan

Al convertir mediante el lienzo del navegador, solo pasan los píxeles. Quedan fuera EXIF, coordenadas GPS, perfiles de color y bloques de derechos de autor.

Si vas a enviar la imagen, puede ser justo lo que querías. Si no lo es, o quieres revisar qué contiene antes de decidir, el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) lee y modifica esos datos sin volver a comprimir la imagen. La guía sobre [si convertir una foto elimina sus metadatos](https://abox.tools/es/guias/convertir-una-foto-borra-sus-metadatos/) ofrece una explicación más amplia.

## Por qué este convertidor no pide subir el archivo

Al buscar un convertidor de WebP, casi todos los resultados piden enviar el archivo a un servidor. Conviene preguntar para qué hace falta ese servidor. En este caso, no hace falta.

Leer WebP requiere un decodificador que el navegador ya tiene desde 2020: por eso mostraba la imagen en el sitio del que la guardaste. Escribir JPEG requiere un codificador que los navegadores incluyen desde hace mucho. Las dos partes del trabajo ya están instaladas. Un sitio que sube el archivo usa su propia copia de ese software y conserva la imagen mientras trabaja.

No ocurre lo mismo con todos los formatos. El [convertidor de HEIC](https://abox.tools/es/guias/convertir-heic-a-jpg/) sí necesita un decodificador que muchos navegadores no tienen; por eso lo incluye y lo explica. La respuesta depende del formato. La pregunta útil es qué necesita realmente la conversión. La guía sobre [si es seguro subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) desarrolla esa cuestión.
