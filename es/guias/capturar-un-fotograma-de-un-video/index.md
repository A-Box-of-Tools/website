# Cómo guardar un fotograma de un vídeo como imagen

Pausar el reproductor y pulsar la tecla de captura da una imagen de una ventana. A veces con eso basta. Esto es en qué se diferencian, y cómo conseguir el fotograma en sí cuando importa.

[Abrir Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/): Una imagen a máxima calidad, de cualquier punto.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/), suelta el clip dentro, busca el momento y pulsa *Capturar este fotograma*. Lo que cae en tus descargas es el fotograma a la resolución del propio vídeo — ⁦3840 × 2160⁩ de un clip 4K, del tamaño que fuera la vista previa de la página.

Deja el formato en PNG salvo que el tamaño del archivo sea un problema. El resto de esta página va de por qué esas dos frases no son lo mismo que una captura de pantalla, y de cuándo merece la pena la diferencia.

## Por qué una captura del reproductor en pausa es otra imagen

Todo el mundo tiene ya una manera de hacer esto: pausar, pulsar la tecla de captura, recortar los controles. Funciona, y para mandarlo rápido es exactamente el esfuerzo que toca. Pero a esas alturas a la imagen le han pasado cuatro cosas, y ninguna tiene vuelta atrás:

- **Tiene el tamaño de la ventana, no el del vídeo.** Un clip 4K en un reproductor a media pantalla da una imagen de un reproductor a media pantalla. Cada píxel que estaba en el archivo y no en la pantalla ha desaparecido.
- **Está escalada.** Lo que hiciera el reproductor para meter el fotograma en esa ventana — suavizar, enfocar o un remuestreo a secas — se queda dentro.
- **Ha pasado por la cadena de visualización.** Gestión de color, y en un clip HDR un mapeo de tonos elegido para tu monitor y no para el archivo.
- **Suele traer muebles.** Controles, una barra de progreso, una pista de subtítulos, el cursor.

Un capturador de fotogramas se salta las cuatro: decodifica el fotograma que el archivo guarda de verdad y escribe esos píxeles. La imagen tiene el tamaño que tiene el vídeo, y nadie ha dibujado encima.

## Caer en el fotograma que querías

Esta es la parte que la mayoría de las herramientas hace mal en silencio, y conviene saber qué mirar en cualquiera de ellas.

Un vídeo no es una tira de imágenes en el orden en que las ves. La mayoría de los fotogramas se guardan como una descripción de en qué se diferencian de otros, y en cualquier archivo con fotogramas B el orden en que están guardados no es el orden en que se muestran. Una herramienta que lleva un reproductor a un instante y coge lo que aparezca queda a merced de cómo redondee ese reproductor, y una que avanza «un fotograma» sumando una treintava de segundo se equivoca en todo clip que no sea exactamente de 30 fps — es decir, casi cualquier vídeo de móvil, porque varían la tasa de fotogramas según cambia la luz.

La salida es leer la propia lista de fotogramas del archivo y llamarlos por su sitio en ella. En un MP4, la herramienta de aquí hace eso: el deslizador se mueve un fotograma por paso, las flechas mueven uno, y puede decirte que estás en el fotograma 812 de 3540 porque los ha contado. En los formatos que no puede leer directamente lo dice, y avanza más o menos un fotograma en lugar de fingir.

Una prueba rápida para cualquier capturador: avanza unos fotogramas sobre algo con movimiento rápido. Si a veces la imagen no cambia, o salta de dos en dos, la herramienta está adivinando con marcas de tiempo.

![El buscador de fotogramas: una imagen fija de un vídeo con el código de tiempo grabado encima, una barra de desplazamiento, botones de paso y campos con la hora y el número de fotograma exactos.](https://abox.tools/screens/grab-a-frame-from-a-video/find.webp)

Ir fotograma a fotograma es como se cae en el que querías. La hora y el número de fotograma nombran lo mismo, y los dos se pueden escribir.

## En qué formato guardarlo

Solo hay tres respuestas de verdad, y la elección va de qué le pasa después a la imagen.

- **PNG** — el predeterminado, y el único que guarda el fotograma exacto. Elígelo si la imagen se va a editar, imprimir, comparar con otro fotograma o guardar. También es el más grande: cuenta unos pocos megabytes desde 1080p y alrededor de ocho desde 4K, porque una imagen fotográfica no es en lo que la compresión de PNG es buena.
- **JPEG** — la décima parte de tamaño, y aceptado en todas partes. Elígelo para una miniatura, una vista previa o cualquier cosa que vaya directa a un documento o a un chat. Es una segunda ronda de compresión con pérdida encima de la del propio vídeo, así que es mal punto de partida para seguir editando.
- **WebP** — más pequeño todavía a igual calidad visible, y ya compatible allí donde importa. La única pega es el software viejo: algunos programas de escritorio siguen sin abrirlo.

Conviene dejar algo claro: un fotograma sacado de un vídeo ya es una imagen comprimida. Guardarlo como PNG no deshace eso, ni puede recuperar el detalle que el códec tiró cuando se grabó el clip. Lo que PNG te da es que no se tire nada *dos veces*. Si después vas a corregir el color o recortar la imagen, eso importa; si se la vas a mandar a alguien, no.

## Capturar muchos de una vez

Una imagen cada pocos segundos es otro trabajo distinto de una imagen en un momento, y sale más a menudo de lo que parece: una hoja de contactos de una grabación larga, miniaturas entre las que elegir una portada, una muestra regular del material para comprobar el enfoque o la exposición a lo largo de un rodaje.

Pon un intervalo, pulsa el botón de serie, y la herramienta recorre el clip una vez y saca una imagen en cada marca. Dos notas prácticas. Sé generoso con el intervalo en un clip largo — una imagen por segundo de una hora de material son 3600 imágenes, y por eso la herramienta corta una tanda en 500. Y para esto elige JPEG salvo que tengas un motivo para no hacerlo: cien PNG de 4K son casi un gigabyte sostenido en la página antes de que hayas descargado ninguno.

Vuelven en un solo ZIP, con su código de tiempo por nombre, así que se ordenan como ocurrieron y cada uno se puede volver a encontrar en el vídeo.

![Tres fotogramas sacados del mismo clip, en miniatura y con sus tiempos, y un botón para guardarlos todos de una vez.](https://abox.tools/screens/grab-a-frame-from-a-video/shots.webp)

Saca varios y elige después. Se quedan en la página hasta que los guardas, y guardarlos es un botón.

## Vídeos verticales, y la clásica imagen de lado

Si alguna vez has sacado un fotograma de un vídeo de móvil y ha salido de lado, este es el motivo. Un móvil graba en apaisado y escribe un cuarto de vuelta en el archivo en lugar de girar los píxeles. Los reproductores leen esa vuelta y la aplican; una herramienta que lee solo los píxeles no, y el resultado es una imagen perfectamente buena del momento correcto, girada 90 grados.

El archivo no tiene nada malo, y volver a girar la imagen después no cuesta más que la molestia. La herramienta de aquí lee la rotación de la pista y la aplica antes de dibujar, así que un clip vertical da una imagen vertical.

## Lo que no se recupera

Una imagen solo puede ser tan buena como el fotograma del que salió, y dos cosas limitan eso sea cual sea la herramienta.

**El movido está en el fotograma.** Si el sujeto se movía durante la exposición, cada fotograma de ese movimiento está movido, y ahí dentro no hay ninguno nítido que encontrar. Grabar con una velocidad de obturación más alta es el único arreglo, y tiene que pasar antes de la grabación.

**La compresión también está en el fotograma.** El vídeo se comprime mucho más fuerte que una fotografía, y bastante más fuerte en los fotogramas entre fotogramas clave. Si una imagen se ve cuadriculada, prueba a moverte uno o dos fotogramas hacia cualquier lado: un fotograma clave se guarda entero y suele verse notablemente más limpio que sus vecinos.

Y si después la imagen tiene que ser de otro tamaño o de otra forma, hazlo como un paso aparte: el [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) redimensiona, recorta y convierte, y [su guía](https://abox.tools/es/guias/redimensionar-una-imagen/) cuenta lo que cuesta cada una de esas cosas.

## Por qué esto no necesita subir nada

Decodificar vídeo en un navegador es reciente y es real: WebCodecs expone el mismo decodificador por hardware que usa tu móvil para reproducir vídeo. El trabajo ocurre en el equipo que ya tiene el archivo, que para un clip de varios gigabytes es además el único arreglo que tiene sentido — subir una hora de 4K para recibir una imagen de 8 MB es mal negocio en todas las direcciones.

La herramienta de aquí no tiene función de red de ningún tipo, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, y ninguna es de este sitio. Desconecta internet y captura un fotograma igualmente, si prefieres comprobarlo a que te lo cuenten.

[¿Es seguro subir archivos a conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone otras tres comprobaciones que puedes hacerle a cualquier herramienta.
