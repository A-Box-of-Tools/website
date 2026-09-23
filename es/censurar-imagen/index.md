# Censurar una imagen — tapar, pixelar o difuminar

Lo que tapas se borra del archivo; no queda escondido dentro.

> Cubre un nombre, una dirección o un número de cuenta en una foto o una captura y vuelve a guardar la imagen, de modo que los píxeles ocultos desaparecen del archivo en lugar de quedarse debajo de un rectángulo. Todo ocurre en el navegador.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/censurar-imagen/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

El navegador decodifica la imagen, pinta encima y la vuelve a codificar con los códecs que ya trae. Esta herramienta no tiene ninguna función de red, ni para pedir ni para enviar, y aquí eso pesa más que en casi cualquier otra página del sitio: las imágenes que llegan a un censor son justo las que todavía llevan legible un nombre, una dirección o un número de cuenta.

- ✗ Sin subida
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo censurar una imagen para que lo tapado desaparezca de verdad

1. **Elige la imagen.** Una captura, un escaneo o una foto: cualquier cosa que tu navegador pueda abrir. Se lee directamente del disco y no sale nada a ninguna parte mientras lo haces.
2. **Arrastra un recuadro sobre lo que nadie debe ver.** Y arrastra otro para lo siguiente. Un recuadro se mueve arrastrándolo, se redimensiona por sus tiradores, o se alcanza con la tecla Tab y se desplaza con las flechas. Lo que aparece debajo del recuadro es el resultado real, dibujado por el mismo código que escribe el archivo.
3. **Elige tapar, pixelar o difuminar — y elige tapar.** El relleno negro no deja absolutamente nada. Pixelar y difuminar sustituyen los píxeles por promedios de sí mismos, lo cual basta para una cara al fondo y no basta para nada que se lea como texto.
4. **Pulsa «Censurar y guardar» y comprueba el archivo.** La imagen que aparece después es el archivo terminado, decodificado otra vez. Ábrelo en un editor y busca una capa, o intenta seleccionar el texto tapado: hay una sola imagen plana, y lo que cubriste se sobrescribió antes de escribirla.

## La versión larga

[Cómo censurar una imagen para que lo tapado desaparezca de verdad](https://abox.tools/es/guias/censurar-una-imagen/): Los recuadros negros que dibujan casi todos los programas quedan encima de la imagen y se pueden apartar. Qué separa una censura real de una simple tapadera, por qué el texto pixelado se puede volver a leer y cómo comprobar un archivo antes de enviarlo.

## También en la caja

- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.
- [Visor DICOM](https://abox.tools/es/visor-dicom/): TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.
- [Imagen a ICO](https://abox.tools/es/crear-favicon/): Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.
- [Imagen a data URI](https://abox.tools/es/imagen-a-base64/): La imagen entera en una línea de texto, lista para pegarla en tu CSS o tu HTML.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El archivo lo decodifica, censura y codifica tu propio navegador en tu propio equipo. Esta herramienta no tiene ninguna función de red, nunca pide ni envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Carga la página una vez, desconéctate de internet y sigue funcionando.

### ¿Lo tapado desaparece de verdad del archivo?

Sí, y por eso existe esta herramienta. La imagen se decodifica en un búfer de píxeles; los recuadros sobrescriben los píxeles que hay dentro; el búfer se codifica después como un archivo nuevo. Los valores originales ya no están en memoria antes de que el codificador reciba nada, así que no hay ninguna capa que esconder, ninguna anotación que quitar y ningún historial que deshacer. Puedes comprobarlo como comprobarías la afirmación de cualquier otro: abre el resultado en un editor de imágenes y busca una segunda capa, o intenta seleccionar el texto que tapaste.

### ¿Se puede recuperar una zona pixelada o difuminada?

A veces, y esto es lo único que conviene leer antes de elegir. El relleno negro sustituye todo lo que hay debajo por un color plano, así que no sobrevive nada: ni un borde, ni un promedio, ni el número de caracteres. Pixelar sustituye cada bloque por el promedio de ese bloque, y una cuadrícula de promedios sigue siendo una medida de lo que había debajo: con texto en una tipografía corriente y un tamaño previsible, hay trabajos publicados que han reconstruido el original renderizando cadenas candidatas y comparando sus promedios. Difuminar es una convolución, y las convoluciones se pueden invertir en principio. Así que pixela una cara del fondo si quieres, y tapa en negro todo lo que se lea como texto.

### ¿Por qué un rectángulo negro dibujado en un editor de documentos no es lo mismo?

Porque la mayoría de los editores guardan el rectángulo al lado de la imagen y no dentro de ella. Una forma dibujada en un lector de PDF, en una presentación, en un procesador de textos o en un editor de imágenes por capas es un objeto con una posición, colocado encima de la página; moverlo, borrarlo o abrir el archivo con otro programa devuelve exactamente lo que estaba cubriendo. Periódicos, tribunales y ministerios han publicado documentos censurados así. Aquí el rectángulo no se guarda en ningún sitio: es un conjunto de valores de píxel escritos sobre los que había.

### ¿También quita los datos EXIF y GPS?

Sí, como efecto secundario. Guardar significa codificar un lienzo lleno de píxeles, y un lienzo no lleva etiquetas, así que la ubicación, el modelo de cámara, las fechas y la miniatura incrustada sencillamente no se escriben en el archivo nuevo. La miniatura importa aquí: es una segunda copia pequeña de la imagen, no siempre se regenera al editar una foto, y una foto censurada que viaja con una miniatura sin censurar deshace todo el trabajo. Si lo que quieres es quitar los metadatos sin recodificar la imagen, el [Visor y limpiador EXIF](https://abox.tools/es/eliminar-datos-exif/) reescribe el contenedor en lugar de la imagen.

### ¿Qué formatos puede leer y escribir?

Lee todo lo que tu navegador sepa decodificar, que en la práctica es JPEG, PNG, WebP, GIF, BMP y, en casi todos los navegadores actuales, AVIF. Escribe JPEG, PNG y WebP, porque esos son los codificadores que traen los navegadores. En «automático» un JPEG vuelve como JPEG y todo lo demás como PNG, lo que mantiene una foto con tamaño de foto y deja nítido el texto que quedó a la vista en una captura. La elección no cambia nada de la censura: los píxeles ya no están cuando el codificador los ve.

### ¿Puedo hacerlo sin ratón?

Sí. «Añadir un recuadro en el centro» coloca uno sobre la imagen, Tab pasa de un recuadro a otro, las flechas mueven el que tiene el foco y Alt con las flechas lo redimensiona; con Mayús cada paso es de diez píxeles y Supr lo elimina. Además, cada recuadro tiene debajo de la imagen una fila con su tamaño, su posición, lo que hace y un botón para quitarlo, de modo que toda la herramienta se maneja con el teclado y la lee un lector de pantalla.

### ¿Funciona en el móvil?

Sí. Dibujar, mover y redimensionar son eventos de puntero y no de ratón, así que un dedo funciona igual, y los tiradores se dibujan más grandes en una pantalla táctil. La imagen en pantalla se redibuja al tamaño de la pantalla mientras trabajas; el archivo se censura siempre a su resolución completa cuando pulsas el botón.

### ¿Es gratis y hace falta una cuenta?

Es gratis, y no hay cuenta, ni registro, ni versión de prueba, ni marca de agua. Tampoco hay límite de tamaño para la imagen, porque no hay ningún servidor pagándolo: el trabajo ocurre en tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus imágenes.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna es nuestra. Aquí no hay ningún punto de recogida donde pudieran acabar tus archivos, ni nada en el código que los enviaría si lo hubiera.
- **Los píxeles tapados desaparecen aquí, no de camino a la salida.** La imagen se decodifica en un búfer de píxeles, los recuadros se escriben sobre ese búfer y el búfer pasa al codificador. En esta página no existe ninguna versión de la imagen con los recuadros como capa aparte, porque esa versión no llega a crearse nunca. Está en `src/redact.js`.
- **Aquí nada pide nada.** No hay `fetch`, ni `XMLHttpRequest`, ni `sendBeacon` en ninguna parte de `src/`. El trabajo es `getImageData`, tres bucles sobre los bytes y `canvas.toBlob`, y todo eso ya viene instalado en el navegador.
- **Los recuadros no se comunican a ninguna parte.** Dónde dibujaste, cuántos son, de qué tamaño y qué estilo elegiste se queda en la memoria de esta página hasta que la cierras. En este repositorio no hay ningún evento de analítica que lleve nada de eso, y la única pregunta que hace el sitio después de una descarga envía un pulgar arriba o abajo y el nombre de la herramienta, nada más.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo un paso de red dentro. Es la prueba más sencilla de todas, y la que conviene hacer antes de censurar un pasaporte.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/redact.js` para las tres funciones que sobrescriben los píxeles y `src/preview.js` para entender por qué lo que se ve en pantalla lo dibujan esas mismas tres funciones.
