# La misma imagen, un tercio más pequeña y con la transparencia intacta

El modo sin pérdida de WebP conserva los píxeles del PNG y aun así ocupa menos. El modo con pérdida puede reducir una fotografía a una décima parte. La elección depende de lo que muestre la imagen; aquí explicamos cómo decidir.

[Abrir PNG a WebP](https://abox.tools/es/convertir-png-a-webp/): La misma imagen, a menudo un tercio más pequeña, con la transparencia intacta.

Última actualización 4 de octubre de 2026

También se acepta AVIF si tu navegador puede decodificarlo. La salida sigue siendo WebP. Las secuencias AVIF solo producen la primera imagen decodificada. El canvas del navegador crea una copia SDR de 8 bits: el color o el HDR pueden cambiar, se omiten los metadatos y el archivo puede ser mayor. El original no cambia.

## La respuesta corta

Abre el [convertidor de PNG a WebP](https://abox.tools/es/convertir-png-a-webp/), arrastra los archivos y elige entre dos opciones:

- **Sin pérdida** si la imagen tiene texto, colores planos o bordes definidos: una captura de pantalla, un diagrama, un logotipo, un gráfico o cualquier imagen dibujada en lugar de fotografiada. Cada píxel opaco queda exactamente igual y el archivo ocupa menos.
- **Más pequeño** si es una fotografía. La reducción es enorme y la diferencia visual resulta difícil de apreciar.

No se sube nada en ninguno de los dos casos. El navegador escribe WebP desde 2020, así que el codificador ya está en el dispositivo.

## Por qué un PNG ocupa tanto

PNG comprime sin pérdida: nunca descarta información. Busca repeticiones, como grupos de píxeles idénticos o filas parecidas a la anterior, y las describe de forma compacta.

Esto funciona muy bien con las imágenes para las que se diseñó. Una captura de pantalla suele tener paneles planos y texto repetido; un logotipo, unos pocos colores sólidos. Ambos se comprimen mucho.

En una fotografía funciona peor porque casi nada se repite. Cada zona de césped, cada degradado del cielo y cada grano de ruido del sensor difiere un poco del siguiente, y PNG registra todo. Una foto de teléfono guardada como PNG puede ocupar diez veces más que su JPEG. No significa que PNG sea malo: le estás pidiendo a un formato sin pérdida que conserve detalles que normalmente no necesitan guardarse de ese modo.

Por eso la elección correcta depende del contenido de la imagen.

## WebP sin pérdida: cambiar de formato sin cambiar la imagen

WebP tiene un modo sin pérdida que comprime mejor que PNG: es más reciente y utiliza más técnicas. En las imágenes para las que PNG funciona bien, suele reducir otro veinte o treinta por ciento sin descartar información.

Es el modo adecuado para texto y bordes definidos: capturas para documentación, diseños de interfaces, diagramas, dibujos de líneas, logotipos, gráficos e imágenes de píxeles. Obtienes la misma imagen en menos espacio; la principal limitación es que algún programa no pueda leer WebP.

La etiqueta «sin pérdida» merece comprobarse, y la herramienta lo hace. WebP guarda los píxeles en uno de dos tipos de bloque; el convertidor vuelve a leer el resultado para saber cuál se escribió. Si algún navegador dejara de respetar la petición, lo indicaría en lugar de entregar un archivo con pérdida etiquetado como si no la tuviera. Los navegadores actuales respetan la petición.

## WebP con pérdida: para fotografías

El otro modo descarta detalles que probablemente no notarías, como JPEG, pero de forma bastante más eficiente. En una fotografía puede reducir un PNG de 2 MB a menos de 200 KB sin que resulte fácil distinguirlos uno al lado del otro.

La calidad empieza en 80, el valor predeterminado de WebP, que suele dar buenos resultados en fotografías. Por debajo de aproximadamente 60, la pérdida empieza a notarse.

Este modo *no* es adecuado para las imágenes de colores planos anteriores. La compresión con pérdida suaviza los detalles, justo lo contrario de lo que necesitan el texto y los bordes definidos. Puede aparecer un halo tenue alrededor de las letras, como en un mal escaneo. Si la imagen contiene palabras, elige el modo sin pérdida.

## La transparencia se conserva en ambos modos

Es una duda habitual y la respuesta es sencilla: WebP tiene un canal alfa igual que PNG. Un logotipo con fondo transparente conserva ese fondo. No hay que elegir un color ni aplanar la imagen.

Conviene compararlo con la otra dirección. Convertir una imagen *a* JPEG sí elimina la transparencia porque JPEG no tiene canal alfa. La guía de [WebP a JPG](https://abox.tools/es/guias/convertir-webp-a-jpg/) dedica una sección a ello. WebP evita ese problema, una de las razones para elegirlo cuando el destino lo admite.

Hay un matiz medido que acompaña a esta afirmación precisa: el color guardado en un píxel *parcialmente* transparente puede cambiar muy ligeramente. Ocurre al pasar por el lienzo del navegador, no por WebP. El lienzo guarda el color multiplicado por la transparencia y no puede deshacer esa multiplicación con exactitud. La diferencia es invisible porque los píxeles cuyo color más cambia son los que menos muestran ese color. Los píxeles opacos se conservan bit por bit.

## ¿Se abre WebP en todas partes?

En la web, sí. Chrome, Edge, Firefox y Safari muestran WebP desde 2020, así que un sitio web ya no necesita preparar una alternativa por ese motivo. Esa es la principal razón para convertir: páginas más pequeñas con la misma imagen.

Fuera del navegador, la compatibilidad es menos uniforme. Windows y macOS ya muestran vistas previas, pero algunos programas antiguos, formularios de subida y muchos lectores electrónicos todavía lo rechazan. Si el destino no admite WebP, necesitas la herramienta inversa, [WebP a JPG](https://abox.tools/es/convertir-webp-a-jpg/), y su [guía](https://abox.tools/es/guias/convertir-webp-a-jpg/).

## Qué no se conserva

Los píxeles se conservan; los datos que los rodean, no. La conversión mediante el lienzo deja fuera los bloques de texto, perfiles de color ICC y bloques XMP del PNG.

En la mayoría de los PNG no supone gran cosa: rara vez llevan datos de cámara, y una captura de pantalla no los tiene. Si necesitas saber qué contiene el archivo, el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) lee y modifica esos datos sin volver a comprimir la imagen.

## Por qué no hace falta subir nada

Las dos partes del trabajo ya están en el dispositivo. El navegador decodifica PNG y codifica WebP desde 2020, la misma capacidad que permitió adoptar WebP en los sitios web.

Un convertidor que envía tus archivos a un servidor utiliza su propia copia de un software que ya tienes y guarda tus imágenes mientras trabaja. [Esta herramienta](https://abox.tools/es/convertir-png-a-webp/) hace la tarea en la página. Sigue funcionando sin red, la comprobación más sencilla de que el archivo no salió. La guía sobre [si es seguro subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) desarrolla la cuestión general.
