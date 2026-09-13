# Cómo crear una miniatura de video con el fotograma exacto

La diferencia entre una miniatura y un pantallazo es más o menos un cuarto de segundo: el fotograma donde los ojos están abiertos y el balón sigue en el aire. Conseguir ese fotograma, al tamaño de la plataforma, bajo su límite de bytes, es una cadena de tres pasos que corre entera en tu navegador.

Última actualización 26 de agosto de 2026

## La respuesta corta

1. **Consigue el fotograma.** Abre el [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/), suelta el video y avanza por la lista de fotogramas del propio archivo hasta el instante exacto. Guárdalo como PNG: la copia sin pérdida, para que nada quede decidido todavía.
2. **Encuadra el fotograma.** Lleva el PNG al [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/): recorta a la forma de la plataforma — 16:9 para YouTube — y fija el lado largo; 1280 píxeles es el número que YouTube pide de verdad.
3. **Clava el techo.** Termina en el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) con el límite de la plataforma como objetivo — 2 MB para una miniatura de YouTube — y deja que elija JPEG o WebP.

Nada en la cadena sube nada, que es justo lo que quieres cuando el video está sin publicar; la miniatura se hace precisamente porque el video aún no es público.

## Por qué avanzar gana a pausar

Pausar un reproductor y hacerle un pantallazo pierde dos veces. La pausa cae donde el reproductor pudo pararse — el sitio más cercano, no el fotograma que querías — y el pantallazo es una foto del reproductor: su resolución, su interfaz, su manejo del color, no los del archivo.

El capturador recorre en cambio la lista de fotogramas del propio archivo, uno a uno en ambos sentidos, y te entrega el fotograma decodificado en sí, a la resolución completa del video. Un cuarto de segundo de búsqueda a cada lado del momento suele ser donde vive la miniatura: el fotograma *entre* los dos evidentes, donde el movimiento se lee y nada sale movido.

Guarda la captura como PNG aunque la miniatura final vaya a ser JPEG o WebP. El PNG es una copia exacta del fotograma; toda decisión con pérdida ocurre entonces una sola vez, al final, dentro de un presupuesto de bytes, en vez de dos veces y acumulándose.

![Una imagen fija de un vídeo con el código de tiempo visible, junto a los controles de paso y desplazamiento y la hora exacta de la que se sacó.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Avanzar hasta el fotograma, en vez de pausar y hacer una captura. La sección de arriba dice cuál es la diferencia de verdad.

## La aritmética de la plataforma

Recorta antes de comprimir, por la misma razón que da la [guía de fotos](https://abox.tools/es/guias/preparar-fotos-para-la-web/): los píxeles son el presupuesto. Un recorte 16:9 de un fotograma 4K llevado a ⁦1280×720⁩ deja que el compresor gaste sus 2 MB en calidad que nadie tendrá que entornar los ojos para ver. La caja de recorte del redimensionador se bloquea en 16:9, así que la forma es un arrastre y no un cálculo; el texto y las caras quieren quedar en los dos tercios centrales, porque los feeds redondean las esquinas y superponen la duración abajo a la derecha.

![El redimensionador con una anchura de 1280 y una altura de 720 escritas, y un resumen de cómo saldrá la imagen.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

Y después la aritmética: lo que pida la plataforma, escrito como dos números.

## Una hoja de contactos, cuando el momento no aparece

Cuando el instante justo anda perdido en diez minutos de metraje, el otro modo del capturador guarda un fotograma cada N segundos y entrega el lote en un ZIP. Repasa las imágenes como una hoja de contactos, apunta el tiempo de la más cercana y avanza desde ahí. Es más rápido que frotar la barra, y deja una carpeta de candidatas para el día en que la plataforma pida otra forma.

## Si haces esto cada semana

Que los pasos vivan aquí en tres páginas es a propósito: cada página hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero cada paso es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias con README que explican el decodificador, el remuestreo y la búsqueda del objetivo de bytes.

Si las miniaturas son un entregable semanal, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele la versión de una sola página: avanzar, recortar al preajuste de tu plataforma, comprimir a su techo, un botón. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
