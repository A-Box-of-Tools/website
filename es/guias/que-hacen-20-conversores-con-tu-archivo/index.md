# Qué hacen 20 convertidores en línea con tu archivo

Entregamos la misma imagen de 542 KB a veinte convertidores gratuitos y medimos los tamaños de cuerpos de petición que salían del navegador. Diecinueve la enviaron a un servidor. Trece lo hicieron antes de pulsar un botón, y todos los resultados que comprobamos después seguían en una dirección pública.

Última actualización 13 de octubre de 2026

## La respuesta corta

El 17 de septiembre de 2026 entregamos el mismo archivo a veinte convertidores gratuitos y registramos los tamaños de los cuerpos de petición mediante los mecanismos descritos abajo. **Diecinueve de los veinte lo subieron.** Uno no.

Ese resultado era previsible. Otras tres cosas no lo eran tanto: **trece de los diecinueve enviaron el archivo en cuanto se seleccionó**, antes de pulsar Convertir y de poder cambiar de opinión; **todos los archivos terminados que buscamos después seguían accesibles mediante una dirección web**, sin cookies, cuenta ni sesión; y **dos servicios incluyeron el nombre del archivo en esa dirección**.

Nada de esto demuestra mala conducta. La subida es el funcionamiento habitual de muchos convertidores, y sus plazos de conservación suelen ser breves y concretos. Guardar dos horas un archivo en una dirección difícil de adivinar no es un escándalo. Sí muestra algo más útil: hay una gran diferencia entre «*el sitio dice que elimina mi archivo*» y «*puedo comprobar qué ocurrió con él*», y parte de esa diferencia puede medirse en una tarde.

## Usa la comparación para planear tu comprobación

**Elegir convertidor para documentos.** La tabla fechada invita a inspeccionar la función exacta, no es clasificación de seguridad actual. Crea una muestra ficticia del formato requerido, observa selección y conversión y revisa la descarga. Probar un PNG no demuestra cómo trata un PDF bancario ni otra herramienta del mismo dominio.

**Documentar la elección de herramientas del equipo.** Registra URL, fecha, navegador, acciones, transferencia observada y condiciones publicadas de conservación. Guarda la muestra ficticia y captura descritas abajo para repetir. Distingue una subida observada de una promesa y una prueba incompleta de una superada.

Repite también cuando un servicio cambie funciones: usa la misma tarea inocua y compara pruebas. No reutilices cifras históricas como si fueran nuevas mediciones.

## Cómo se midió

El método es sencillo y repetible porque lo que importa son las mediciones, no solo la opinión sobre ellas.

### El archivo

Un PNG de ⁦450 x 350⁩ píxeles aleatorios, unos 542 KB, llamado `abox-probe-9471.png`. El ruido aleatorio es difícil de comprimir. Una carga de tamaño parecido es una pista, pero hay que inspeccionar el cuerpo de la petición para determinar qué se envió. El nombre distintivo permitió localizar el archivo en una URL después.

### La medición

Antes de entregar el archivo, instrumentamos estas API de petición para registrar el tamaño de lo que recibían y después ejecutar su función normal: `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send` y, especialmente importante, `HTMLFormElement.submit`. Después pusimos el archivo en el selector de la propia página, esperamos diez segundos y leímos el registro.

La comprobación de formularios es necesaria. Varios sitios usan un envío HTML normal, invisible para las comprobaciones de `fetch` y `XMLHttpRequest`. PicResize muestra al mismo tiempo una vista local desde una dirección `blob:`, lo que parece trabajo en el navegador hasta que se observa el envío del formulario.

### La comprobación posterior

Cuando el sitio devolvía un enlace al archivo terminado, lo solicitamos desde una línea de comandos: otro programa, sin cookies ni sesión y sin compartir nada con el navegador. Si el archivo se obtiene así, cualquiera que tenga la dirección puede leerlo.

Fueron veinte sitios que pudimos controlar, no necesariamente los veinte más grandes. Probamos otros nueve sin conseguir medirlos. Se enumeran más abajo porque resistirse a la automatización no equivale a superar una prueba de privacidad.

## La tabla

Los tamaños siguientes son las mediciones de cuerpos de petición comunicadas el 17 de septiembre de 2026; los valores ausentes siguen ausentes. La última columna conserva los resúmenes de políticas comunicados ese día. Los enlaces llevan a páginas de referencia actuales, comprobadas el 12 de octubre de 2026, no a pruebas archivadas de la redacción anterior.

| Convertidor | ¿Salió el archivo? | Bytes medidos | Destino | Conservación según la política |
| --- | --- | --- | --- | --- |
| Squoosh | No | 0 | — | nada que conservar |
| TinyPNG | Sí, al seleccionar | 542,566 | `tinypng.com/backend/opt/store` | 48 horas |
| iLoveIMG | Sí, al seleccionar | 542,816 | `api9.iloveimg.com/v1/upload` | 2 horas |
| iLovePDF | Sí, al seleccionar | 542,801 | `api4.ilovepdf.com/v1/upload` | 2 horas |
| Sejda | Sí, al seleccionar | 542,537 | `sejda.com/api/files/upload` | tras procesar; enlaces compartidos, 7 días |
| PDF24 | Sí, al seleccionar | 542,531 | `filetools24.pdf24.org/client.php` | «normalmente», 1 hora |
| PDF Candy | Sí, al seleccionar | 542,522 | `s35.api.pdfcandy.com/uploadcbc/…` | 2 horas |
| jpg2pdf.com | Sí, al seleccionar | 542,570 | `jpg2pdf.com/api/upload` | 1 hora, según las condiciones |
| Img2Go | Sí, al seleccionar | 542,589 | `www21.img2go.com/v2/dl/web7/…` | 72 horas |
| Online-Convert | Sí, al seleccionar | 542,423 | `www8.online-convert.com/v2/dl/web7/…` | 72 horas |
| PDF2Go | Sí, al seleccionar | 542,542 | `www15.pdf2go.com/v2/dl/web7/…` | 72 horas |
| Compress2Go | Sí, al seleccionar | 542,492 | `www6.compress2go.com/v2/dl/web7/…` | 72 horas |
| PicResize | Sí, al seleccionar | 542,568 | `picresize.com/en/edit`, envío de formulario | 20 minutos |
| ResizePixel | Sí, al seleccionar | envío de formulario | `resizepixel.com/` | en menos de 1 hora |
| CloudConvert | Sí, al convertir | 543,218 | `eu-central.storage.cloudconvert.com/…` | 24 horas |
| Convertio | Sí, al convertir | no registrado | `convertio.co/process/…` | 24 horas |
| Ezgif | Sí, al convertir | 542,483 | `ezgif.com/optimize`, envío de formulario | 1 hora tras el último uso |
| Aconvert | Sí, al convertir | envío de formulario | `aconvert.com/results.php` | 2 horas |
| Online2PDF | Sí, al convertir | 547,330 | `online2pdf.com/conversion/frame` | «inmediatamente» |
| IMGonline | Sí, al convertir | 542,633 | `imgonline.com.ua/eng/…-result.php` | no se encontró una política |

Veinte convertidores, un archivo de 542 KB, 17 de septiembre de 2026. «Al seleccionar» significa que la subida empezó al elegir el archivo; «al convertir», que esperó al botón. Convertio cambió de página antes de que pudiéramos leer el tamaño: se indica como no registrado, sin estimarlo.

## Las observaciones y sus límites

La tabla publicada está disponible como [JSON con procedencia y limitaciones](https://abox.tools/data/converter-observations-2026-09-17.json) y [filas CSV](https://abox.tools/data/converter-observations-2026-09-17.csv). Estos archivos transcriben el artículo; no son una nueva prueba. Al contar la tabla aparecen trece subidas al seleccionar, lo que corrige las once antes indicadas en el texto.

No se conservaron con el artículo los registros originales de peticiones, la versión del navegador, el archivo aleatorio exacto ni copias históricas de las políticas. Las cifras siguen siendo observaciones comunicadas, no datos originales verificables de forma independiente. Los mecanismos no cubren toda vía de transferencia: navegación de formularios, otros marcos, trabajadores y WebRTC requieren inspección aparte. Un cero significa que esta prueba no registró una subida, no que ninguna transferencia sea posible.

Para repetir la comparación, crea un archivo sintético nuevo, registra sus bytes exactos y SHA-256 y usa un perfil de navegador nuevo. Guarda una captura de red con cuerpos de petición y navegación preservada; inspecciona por separado la selección y la conversión. Anota versión del navegador, URL, hora, acción, destino, tamaño del cuerpo y si contiene el archivo de prueba. Elimina credenciales y enlaces privados de resultados antes de compartir. Conserva el texto de la política con URL y fecha, y registra aparte las pruebas sin completar.

Una URL de archivo que responde sin sesión demuestra acceso para quien posee esa URL en ese momento. Comprueba otra vez después del plazo de conservación antes de afirmar que falló la eliminación. Ni ese acceso ni una captura de red demuestra qué permanece en registros o copias internas.

## Trece suben el archivo antes de que pulses el botón

No esperábamos una diferencia tan marcada. En trece de los diecinueve, el archivo ya viajaba al servidor mientras la página seguía mostrando un botón Convertir que nadie había pulsado.

En iLoveIMG aparecía *Compress IMAGES*, esperando la orden de empezar, pero ya habían salido 542,816 bytes hacia `api9.iloveimg.com`. Lo mismo ocurrió en iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf y los cuatro sitios de la plataforma descrita más abajo.

Hay una razón técnica razonable: subir mientras se leen las opciones hace que la conversión parezca inmediata al pulsar el botón. Pero elimina sin explicarlo un paso que muchas personas creen tener. Elegir un archivo parece abrirlo; pulsar Convertir parece enviarlo. En trece de estos veinte servicios, ambas acciones ocurren al elegirlo.

La consecuencia es concreta: si seleccionaste el borrador sin censurar, un recibo de sueldo o la foto que querías recortar antes, puedes darte cuenta cuando ya se ha enviado.

## El resultado queda en una dirección pública

Cuatro sitios devolvieron un enlace normal al archivo convertido. Solicitamos los cuatro desde una línea de comandos, sin cookies ni sesión y con un programa distinto del navegador. Los cuatro devolvieron el archivo.

- **Ezgif**: `s1.ezgif.com/tmp/…` devolvió 542,483 bytes, el tamaño exacto de nuestra prueba.
- **Aconvert**: `s6.aconvert.com/convert/…` devolvió un PDF de 474,856 bytes.
- **ResizePixel**: `resizepixel.com/Image/…` devolvió 432,111 bytes.
- **IMGonline**: `srv2.imgonline.com.ua/result_img/…` devolvió un JPEG de 128,179 bytes.

Las direcciones probadas incluían componentes difíciles de adivinar. Quien tuviera una podía descargar el resultado en el momento de la comprobación. Un enlace puede filtrarse por historial, capturas o mensajes, y mediante referencias cuando lo permita la política de la página. HTTPS oculta la ruta a un intermediario de red normal; la política de referencia determina qué recibe otro sitio después. La observación afecta a estos cuatro enlaces, no a todos los métodos de descarga de un convertidor.

Aconvert lo advierte en la propia página del resultado: los archivos no se conservan más de dos horas y no deben enlazarse desde otros sitios. Es una advertencia útil, en el lugar y momento adecuados. Fue el único de los cuatro que la mostró.

## El nombre del archivo también viaja

Solemos pensar solo en el contenido. El convertidor recibe más información, y dos de estos veinte servicios mostraron esa parte adicional en un lugar visible.

PDF Candy subió el archivo a una dirección terminada en `/uploadcbc/1789652849416-abox-probe-9471.png`: una marca de tiempo seguida del nombre original. ResizePixel mostró la vista previa desde `/Image/<id>/Preview/abox-probe-9471.png`, también con el nombre.

Nuestro `abox-probe-9471.png` no revelaba nada. Los archivos reales pueden llamarse `passport-scan.jpg`, `contract-signed-final.pdf` o `scan-12wk.png`. El nombre puede ser la línea de metadatos más descriptiva del documento. La dirección de una solicitud suele registrarse, almacenarse en caché y conservarse durante más tiempo y por más sistemas que el propio archivo.

También viajan datos interiores que no se ven en pantalla. Una foto del teléfono puede incluir las coordenadas de la toma, la hora, el número de serie de la cámara y hasta una miniatura anterior al recorte. Sea cual sea el tratamiento posterior de la imagen, el convertidor recibe esos datos *antes* de procesarla.

## Cuatro nombres, una plataforma

Img2Go, Online-Convert, PDF2Go y Compress2Go parecen servicios independientes. El archivo llegó a cuatro dominios distintos: `www21.img2go.com`, `www8.online-convert.com`, `www15.pdf2go.com` y `www6.compress2go.com`. Todos lo recibieron en la misma ruta:

```
/v2/dl/web7/upload-file/<uuid>
```

El mismo destino interno, comportamiento, texto de política y plazo de 72 horas. Son cuatro puertas de entrada a una plataforma, algo que sus políticas explican si se leen hasta ese punto.

No es una crítica: compartir infraestructura entre varias marcas es habitual y eficiente. Importa porque cambiar de convertidor cuando no confías en uno puede no cambiar de proveedor. «Usaré otro sitio» solo reduce esa dependencia si realmente es otro servicio.

Un detalle parecido: CloudConvert envió el archivo a `eu-central.storage.cloudconvert.com`. El nombre indica la región de destino, más información geográfica de la que ofrecían muchos de los otros sitios.

## Qué dicen las políticas y qué puedes comprobar

Los compromisos de conservación suelen ser breves y concretos: desde la eliminación inmediata de Online2PDF y los veinte minutos de PicResize hasta las dos horas de iLovePDF, iLoveIMG, PDF Candy y Aconvert, o las 72 horas de la plataforma de cuatro sitios.

Dos casos destacan por otra razón. **jpg2pdf.com** no tenía una política de privacidad en la dirección habitual: el único enlace legal de la portada era `/terms`. Allí prometía una hora de conservación bajo «Terms and Privacy». En **IMGonline** no encontramos una política: ni enlace en la portada en inglés, ni contenido en las dos direcciones habituales, ni información de almacenamiento o eliminación en la herramienta. Sus resultados sí podían recuperarse con el enlace, como se explicó antes.

El número de horas no es toda la cuestión. **Si un enlace público devuelve el archivo después del plazo indicado, puede mostrar que la eliminación no se completó a tiempo.** Un enlace caducado no demuestra que se hayan borrado todas las copias internas. No ves si la eliminación alcanza copias de seguridad, registros, informes de error que capturaron el cuerpo de la petición o la red que guardó el resultado. Tampoco ves el destino de esas copias tras una venta o una brecha. Una política expresa intenciones sobre sistemas que no puedes inspeccionar; las promesas sinceras y las falsas pueden usar las mismas palabras.

Ese es el argumento para preferir una herramienta que no envíe el archivo. No demuestra que esas empresas mientan; reduce lo que tienes que aceptar sin poder comprobarlo.

## El que no subió el archivo

Squoosh, el compresor de Google, recibió, mostró y comprimió el archivo, y **esta prueba no registró ninguna subida del archivo**. Se comunicaron cero bytes de subida con la misma medición que había registrado 542,566 saliendo de TinyPNG un minuto antes.

Es importante incluirlo como control. Demuestra que la medición puede dar un resultado negativo, por lo que los diecinueve positivos no proceden simplemente de un método que siempre encontraría tráfico. También demuestra que la tarea puede hacerse en el navegador con esos formatos y sin servidor. Convertir no obliga por sí solo a subir.

Muchos servicios mantienen la subida porque nacieron cuando era necesaria y porque el servidor permite gestionar cuentas, cuotas y planes de pago. Medir y limitar el uso de una herramienta que funciona enteramente en el navegador es más difícil.

## Qué no pudimos medir

Intentamos probar otros nueve sitios que no aparecen en la tabla: FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com y SimpleImageResizer.

En ocho casos, la limitación fue del método: sus selectores solo respondían a un clic real y no aceptaban un archivo introducido por un script. No se subió nada y no hubo medición. **Eso no es un resultado y no debe interpretarse como tal**. En particular, no demuestra que esos servicios mantengan el archivo en el dispositivo; significa que la prueba no se ejecutó.

SimpleImageResizer expuso otro límite. Su formulario tenía un campo de archivo, pero declaraba `enctype="application/x-www-form-urlencoded"`. Con esa combinación, el navegador envía *solo el nombre*, no los bytes. Nuestra primera medición sumaba el contenido del formulario y anunciaba una subida de 1,085,210 bytes que no había ocurrido. Retiramos la fila. Quien repita el método debe comprobar el `enctype` antes de confiar en la medición de un formulario.

## Compruébalo por tu cuenta

Los registros originales no están disponibles, por lo que la tabla histórica no puede verificarse mediante peticiones originales. El método anterior sirve para una comparación nueva. La versión más rápida no necesita herramientas especiales:

- **Desconecta la red.** Carga la herramienta, apaga el wifi y úsala. El trabajo local continúa; el que depende de un servidor se detiene. Una promesa escrita no puede sustituir ese resultado.
- **Observa la pestaña Red.** Abre las herramientas de desarrollo, selecciona Red, ordena por tamaño y usa el convertidor. Inspecciona las cargas de las peticiones, no solo la columna de tamaño transferido, que suele describir respuestas. Una miniatura, una subida por partes o un archivo codificado pueden tener otro tamaño. Mira *antes* y después de pulsar Convertir.
- **Lee `connect-src`.** La `Content-Security-Policy` del código de la página enumera las direcciones que puede contactar y el navegador aplica esa restricción. Si incluye una dirección del sitio, la página puede enviar allí el archivo.

La guía [¿es seguro subir archivos a convertidores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) explica estas tres comprobaciones y una cuarta con más detalle.

## Cómo responde este sitio a la misma pregunta

El código de este sitio es una evidencia distinta de las mediciones históricas anteriores. La implementación actual afirma lo siguiente; comprueba la función que usarás con las [cuatro comprobaciones](https://abox.tools/es/guias/es-seguro-subir-archivos/).

- **Sin conexión.** El procesamiento local funciona con recursos cargados y caché lista. Obtener imágenes, cambios en línea y presentar navegadores necesitan conexión.
- **Solicitudes.** El código de procesamiento no sube archivos elegidos. Las visitas y los votos fijos voluntarios son distintos. El cambio envía monedas y fecha; las funciones entre navegadores envían contenido deliberadamente al elegido. **Política.** La mayoría hereda destinos de plataforma. Los recibos añaden Frankfurter y compartir y cámara añaden el servidor de encuentro. Se limitan destinos, no se demuestra cada carga.
- **Retención.** abox.tools no recibe archivos para procesarlos, así que esa operación no crea una copia de servidor que deba borrar. Los registros locales, los metadatos de encuentro de siete días y las copias de destinatarios de compartir o correo son rutas distintas descritas en Privacidad.
- **Código.** El [código es público](https://github.com/A-Box-of-Tools/website). Compila y compara el resultado. Incluye módulos compartidos y motores empaquetados.

La [página de privacidad](https://abox.tools/es/privacidad/) describe los límites: [importaciones de URL](https://abox.tools/es/imagenes-a-video/), [cambio opcional y entrega a aplicaciones](https://abox.tools/es/extraer-recibos-facturas/), [compartir entre navegadores](https://abox.tools/es/compartir-texto/) y [cámara remota](https://abox.tools/es/remote-camera/), además de anuncios, Analytics y comentarios fijos. Transferir deliberadamente es distinto de subir para procesar.

Ejemplos locales: [comprimir hacia un tamaño objetivo](https://abox.tools/es/comprimir-imagen/), [recortar vídeo](https://abox.tools/es/recortar-video/), [borrar EXIF y GPS](https://abox.tools/es/eliminar-datos-exif/) y [crear PDF con imágenes](https://abox.tools/es/imagenes-a-pdf/). Revisa formatos y resultado. Estas tareas no necesitan subir para procesar ni cuenta.

## Cómo usar estas mediciones

Puedes citar y repetir las mediciones. El resumen de la investigación es: veinte convertidores gratuitos medidos el 17 de septiembre de 2026; diecinueve subieron el archivo; trece lo enviaron antes de pulsar Convertir; y los cuatro resultados comprobados se recuperaron desde una dirección pública sin ninguna sesión.

Agradecemos un enlace a esta página, aunque no es obligatorio. Si repites el método y obtienes otro resultado, nos interesa saberlo: los sitios cambian y esto refleja una tarde concreta. Escríbenos desde la [página de contacto](https://abox.tools/es/contacto/). Publicaremos aquí las correcciones acompañadas de una medición de bytes.
