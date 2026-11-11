# Cómo crear una miniatura de video con el fotograma exacto

La diferencia entre una miniatura y un pantallazo es más o menos un cuarto de segundo: el fotograma donde los ojos están abiertos y el balón sigue en el aire. Conseguir ese fotograma, al tamaño de la plataforma, bajo su límite de bytes, es una cadena de tres pasos que corre entera en tu navegador.

Última actualización 13 de octubre de 2026

## La respuesta corta

1. **Consigue el fotograma.** Abre el [Capturador de fotogramas](https://abox.tools/es/capturar-fotograma-de-video/), suelta el video y avanza por la lista de fotogramas del propio archivo hasta el instante exacto. Guárdalo como PNG: la copia sin pérdida, para que nada quede decidido todavía.
2. **Encuadra el fotograma.** Lleva el PNG al [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/), recorta a la forma de la plataforma y elige dimensiones adecuadas a fuente y destino. YouTube recomienda actualmente 16:9 para vídeos y 9:16 para Shorts; abajo se distingue cada caso.
3. **Cumple el límite.** Termina en el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) con el límite actual de la plataforma como objetivo y algo de margen. Elige JPEG para una miniatura fotográfica de YouTube; no dejes Auto si exige JPG o PNG.

Nada en la cadena sube nada, que es justo lo que quieres cuando el video está sin publicar; la miniatura se hace precisamente porque el video aún no es público.

## Una portada legible a su tamaño real

Al publicar vídeo, elige un fotograma que explique qué se verá: el objeto terminado, quien habla mirando arriba o el instante antes de la acción. El texto de origen debe leerse en vista pequeña. Estas herramientas capturan, recortan y comprimen; añadir título u otro diseño exige un editor de imagen entre la captura PNG y la compresión final.

En una web, la misma imagen sirve de póster antes de reproducir. Iguala forma y tamaño mostrado del reproductor y comprueba que explique el clip en teléfono. También sirve para portada de presentación: pruébala en la diapositiva real, sin suponer que el público ve el PNG completo.

## Por qué avanzar gana a pausar

Pausar un reproductor y hacerle un pantallazo pierde dos veces. La pausa cae donde el reproductor pudo pararse — el sitio más cercano, no el fotograma que querías — y el pantallazo es una foto del reproductor: su resolución, su interfaz, su manejo del color, no los del archivo.

El capturador recorre en cambio la lista de fotogramas del propio archivo, uno a uno en ambos sentidos, y te entrega el fotograma decodificado en sí, a la resolución completa del video. Un cuarto de segundo de búsqueda a cada lado del momento suele ser donde vive la miniatura: el fotograma *entre* los dos evidentes, donde el movimiento se lee y nada sale movido.

Guarda la captura en PNG aunque la miniatura final sea JPEG. Conserva la imagen dibujada sin otra codificación con pérdida; cada decisión posterior de compresión ocurre una vez al final, dentro de un límite de bytes, sin acumular dos pérdidas.

![Una imagen fija de un vídeo con el código de tiempo visible, junto a los controles de paso y desplazamiento y la hora exacta de la que se sacó.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Avanzar hasta el fotograma, en vez de pausar y hacer una captura. La sección de arriba dice cuál es la diferencia de verdad.

## La aritmética de la plataforma

Recorta antes de comprimir, como explica [la guía de fotos](https://abox.tools/es/guias/preparar-fotos-para-la-web/): los píxeles son el presupuesto. ⁦1280×720⁩ en 16:9 es una salida pequeña útil, no la recomendación actual de YouTube. Sus [instrucciones de miniaturas](https://support.google.com/youtube/answer/72431?hl=en) recomiendan ahora ⁦3840×2160⁩ para vídeos y ⁦2160×3840⁩ para Shorts; JPG y PNG son ejemplos admitidos. En escritorio, hasta 50 MB; en móvil, las miniaturas de vídeo deben ser menores de 2 MB. Revisa tu vía de subida y no amplíes una imagen pequeña solo para alcanzar una cifra. Necesitas cuenta verificada; los Shorts personalizados se suben actualmente con YouTube Studio en un dispositivo de escritorio.

El recuadro bloquea 16:9 o 9:16: ajustas arrastrando, sin calcular. Mantén texto y caras en los dos tercios centrales: los feeds redondean esquinas y superponen la duración abajo a la derecha.

![El redimensionador con una anchura de 1280 y una altura de 720 escritas, y un resumen de cómo saldrá la imagen.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

Una exportación de ejemplo de 1280 por 720. Elige dimensiones según el destino actual y el detalle real de la fuente.

## Una hoja de contactos, cuando el momento no aparece

Cuando el instante justo anda perdido en diez minutos de metraje, el otro modo del capturador guarda un fotograma cada N segundos y entrega el lote en un ZIP. Repasa las imágenes como una hoja de contactos, apunta el tiempo de la más cercana y avanza desde ahí. Es más rápido que frotar la barra, y deja una carpeta de candidatas para el día en que la plataforma pida otra forma.

## Si haces esto cada semana

Que los pasos vivan aquí en tres páginas es a propósito: cada página hace un trabajo, y cada una puede demostrar por sí sola que nada sale de tu equipo. Pero cada paso es código abierto: licencia MIT, una carpeta por herramienta, módulos ES sin dependencias con README que explican el decodificador, el remuestreo y la búsqueda del objetivo de bytes.

Si las miniaturas son un entregable semanal, apunta un agente de código al [repositorio](https://github.com/A-Box-of-Tools/website) y pídele la versión de una sola página: avanzar, recortar al preajuste de tu plataforma, comprimir a su techo, un botón. Los módulos se escribieron para leerse, y llevárselos es exactamente para lo que está la licencia.
