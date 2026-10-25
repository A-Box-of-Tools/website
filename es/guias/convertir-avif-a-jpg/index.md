# El archivo que casi nada abre, salvo el navegador donde lees esto

Guardas una imagen de un sitio web y recibes un archivo `.avif` que el visor de fotos rechaza, mientras el navegador lo muestra sin problemas. Esa diferencia explica tanto el problema como la solución: convertirlo no requiere que salga del dispositivo.

[Abrir AVIF a JPG](https://abox.tools/es/convertir-avif-a-jpg/): El formato que guardan las webs, convertido al que siempre se ha aceptado.

Última actualización 13 de octubre de 2026

## La respuesta corta

Abre el [convertidor de AVIF a JPG](https://abox.tools/es/convertir-avif-a-jpg/), arrastra los archivos y pulsa «Convertir». Deja la calidad en 92. Obtendrás archivos JPEG, con una descarga por imagen o un zip si hay varias.

No se sube nada y tampoco hace falta descargar nada antes. El decodificador ya está en el navegador donde lees esto. Esa es la parte que conviene entender, y más abajo tiene su propia sección.

## Usa JPEG cuando el problema sea la compatibilidad

**Una imagen descargada para un documento o formulario.** Convierte desde el AVIF original, empieza con calidad 92 y abre el JPEG en la aplicación que lo rechazaba. Si el formulario también limita los bytes, revisa el tamaño nuevo: convertir puede aumentarlo. Usa el [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/) con JPEG seleccionado para cumplir ese segundo requisito.

**Una copia para un marco digital, impresora o dispositivo antiguo.** Prueba una foto antes de convertir toda la carpeta. Si exige dimensiones menores, ajusta la copia: cambiar solo la extensión AVIF no altera el códec ni el tamaño. Conserva el original AVIF, sobre todo en fotos HDR. Esta es una copia fija SDR para compatibilidad; de una secuencia solo obtiene la primera imagen decodificada. Para mantener transparente un logo, elige PNG o WebP mediante el redimensionador.

## Qué es AVIF y por qué tienes uno

AVIF guarda una imagen fija como si fuera un fotograma de video moderno: un único fotograma clave de **AV1**, dentro del mismo tipo de contenedor de cajas que usa MP4. Puede parecer una forma extraña de diseñar un formato de imagen, pero funciona muy bien. AV1 ha recibido mucha más inversión técnica que los códecs de imagen fija porque el video mueve mucho más dinero.

El resultado ocupa mucho menos que un JPEG con una calidad visual parecida, a menudo entre tres y cinco veces menos. Los sitios web empezaron a usarlo. Cuando guardas una imagen, descargas el formato que sirve el sitio; no elegiste AVIF.

Después descubres que muchos programas del dispositivo no lo abren:

- Windows necesita una extensión de la tienda para mostrarlo en Fotos;
- muchos editores de escritorio todavía lo rechazan;
- los formularios que comprueban extensiones a menudo no lo reconocen;
- las impresoras, los lectores electrónicos y el software de cámaras van varios años por detrás.

## El navegador ya sabe leerlo

Arrastra ese archivo que no puedes abrir a una pestaña del navegador y se mostrará correctamente. Chrome y Firefox decodifican AVIF desde 2021; Safari, desde 2023.

Esto explica por qué la conversión no necesita un servidor. Un convertidor debe leer AVIF y escribir JPEG, y el navegador ya hace ambas cosas. [Esta herramienta](https://abox.tools/es/convertir-avif-a-jpg/) añade un botón para guardar a ese decodificador: abre el archivo, dibuja la imagen y pide al navegador un JPEG.

Cuando un convertidor te pide subir un AVIF, utiliza su propia copia de un software que ya tienes y conserva tu imagen mientras trabaja.

## La comparación que explica cuándo hace falta otro decodificador

AVIF tiene un pariente muy cercano: **HEIC**, el formato en que guarda las fotos un iPhone. Comparten casi el mismo diseño: un contenedor de cajas con un fotograma de video dentro, HEVC en lugar de AV1. Sin embargo, la compatibilidad del software es justamente la contraria.

|  | HEIC | AVIF |
| --- | --- | --- |
| Navegadores que lo decodifican | Solo Safari | Todos |
| Navegadores que lo codifican | Ninguno | Ninguno |
| Qué debe incluir el convertidor | Un decodificador de unos 1,4 MB | Nada |

Por eso nuestro [convertidor de HEIC](https://abox.tools/es/convertir-heic-a-jpg/) descarga un códec al usarlo por primera vez y explica cómo funciona, mientras este no descarga ninguno. El sitio y la promesa son los mismos; los formatos necesitan soluciones distintas.

Esto también te da una pregunta útil ante cualquier convertidor: *¿el navegador ya sabe hacer esto?* Si la respuesta es sí, subir el archivo es una decisión del sitio, no una exigencia de la tarea.

## El JPG ocupará varias veces más

Es normal y no indica un fallo. Un AVIF de 40 KB puede convertirse en un JPEG de 200 KB con una calidad visual parecida. El ejemplo de la herramienta ocupa unas cinco veces más al convertirlo, y la línea del resultado lo indica.

La razón es la misma: AVIF es uno de los códecs de imagen fija más eficientes y JPEG uno de los más antiguos. Cambias tamaño por compatibilidad. Tiene sentido cuando el destino no acepta AVIF, pero conviene saber qué estás cambiando.

Si después necesitas reducir el tamaño, el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) ajusta el JPEG al límite que indiques. La herramienta lo ofrece debajo del resultado.

## Lo que esta conversión no conserva

Dos características, que no afectan a la mayoría de las imágenes:

**Transparencia.** AVIF puede tener un fondo transparente y JPEG no. Hay que poner un color debajo. La herramienta lo pregunta solo si algún archivo realmente tiene transparencia y propone blanco. La mayoría de los AVIF guardados de sitios web son fotografías opacas, así que normalmente no aparece esa pregunta. Si necesitas conservar la transparencia, usa PNG o WebP con el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/), que lee AVIF y escribe ambos formatos.

**HDR y profundidad de color.** Esta herramienta escribe un JPEG SDR convencional de 8 bits desde el canvas del navegador. No conserva la profundidad adicional ni la información HDR del AVIF; los colores o brillos pueden cambiar. Guarda el original para archivar. Existen formatos HDR basados en JPEG: [la especificación Ultra HDR de Android](https://developer.android.com/media/platform/hdr-image-format) describe un mapa de ganancia que esta herramienta no crea.

## Convertir en sentido contrario es otro problema

Aquí no hay conversor JPG a AVIF porque **esta página no incluye un codificador AVIF**. Su salida de canvas usa JPEG, PNG o WebP; no presenta un PNG renombrado como AVIF.

Un codificador aparte, incluido WebAssembly, puede crear AVIF localmente sin enviar la imagen a un servidor. Es otra implementación. Un formato nativo no admitido vuelve a PNG, como explica [la documentación de canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob).

## Los metadatos no se conservan

La imagen se decodifica y se vuelve a dibujar. Solo pasan los píxeles: EXIF, GPS, perfiles de color y XMP quedan fuera. Una imagen guardada de una página web normalmente ya lleva pocos metadatos o ninguno.

Si quieres revisar lo que contiene el archivo antes de decidir, el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) lo muestra sin volver a comprimir la imagen. La guía sobre [si convertir una foto elimina sus metadatos](https://abox.tools/es/guias/convertir-una-foto-borra-sus-metadatos/) lo explica con más detalle.
