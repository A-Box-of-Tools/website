# Extractor de recibos y facturas — fotos para un informe que revisas

Lee las fotos, revisa los campos y los recortes, y envía por correo imágenes comprimidas con cada importe y los totales.

> Lee fotos de recibos y facturas en el dispositivo, revisa los recortes y los importes, y convierte cada documento a una moneda común para el correo con tipos manuales o históricos en línea. Envía imágenes comprimidas, valores individuales y un total general.

Las fotos se leen en el dispositivo. Las consultas opcionales de tipos históricos solo envían las monedas y la fecha elegida a Frankfurter. Enviar por correo y compartir entregan el contenido a la aplicación elegida por la persona.

## Las fotos se **leen en este dispositivo**. Los tipos de cambio en línea son opcionales. Tú eliges qué enviar por correo o compartir.

Las fotos se decodifican y se leen en este dispositivo. El motor de OCR y los datos del idioma inglés vienen con la página. No se suben fotos ni campos extraídos para el OCR. Los tipos de cambio manuales, la copia del informe y las descargas también son locales. Solo al pulsar Obtener tipo histórico se contacta con [Frankfurter](https://frankfurter.dev/), con los dos códigos de moneda y la fecha elegida. El servicio ve la consulta y tu dirección IP, pero no recibe imágenes, importes, texto de OCR, nombres de archivo ni direcciones de correo. Enviar por correo o compartir es tu siguiente paso: esos botones entregan el informe o los archivos elegidos a una aplicación del dispositivo. Tú eliges el destinatario, revisas el contenido y lo envías.

- ✗ Sin subidas para procesar
- ✗ Sin cuenta
- ✓ OCR sin conexión
- ✓ Revisa cada documento
- ✓ Envía desde tu propia aplicación

## Cómo extraer datos de recibos y facturas a partir de fotos

1. **Elige fotos claras.** Añade hasta 20 imágenes JPEG, PNG, WebP o AVIF, de un máximo de 20 MB cada una. Usa un recibo o una factura por imagen. El OCR admite texto impreso en inglés. Fotografía todo el documento con luz uniforme y texto derecho y nítido.
2. **Lee, recorta y compara.** Ejecuta el OCR y revisa cada foto junto a los campos sugeridos y el texto leído. Gira las imágenes de lado y vuelve a leerlas si hace falta. Ajusta el recorte para conservar todos los bordes y el texto, y vuelve a leer ese recorte. Corrige el comercio, la fecha, la referencia, la moneda y el total. El comercio o la referencia pueden quedar vacíos si no se pueden leer de forma fiable. Distingue el total final de subtotales, descuentos, efectivo entregado, cambio, impuestos o saldo pendiente.
3. **Confirma cada documento.** Revisa los campos, el recorte y la conversión. Elige la moneda impresa en el documento y después una moneda final común para todos los documentos del correo. Introduce cada tipo de cambio manualmente o elige la consulta en línea y pulsa Obtener tipo histórico después de revisar la fecha del recibo. Se muestra cuánto vale una unidad de la moneda del documento en la moneda final. Los documentos con la misma moneda usan un tipo de 1. Solo los importes convertidos y confirmados entran en el total general. Elimina las fotos duplicadas para no contar un recibo dos veces.
4. **Lleva el informe a tu aplicación.** Revisa las vistas previas y los tamaños de los JPEG preparados. Usa Correo con imágenes para elegir una aplicación compatible, o descarga el archivo de correo con el informe y los adjuntos JPEG. Revisa y envía el mensaje tú mismo. Si la aplicación no puede abrir el archivo de correo, descarga y extrae el ZIP, y adjunta sus imágenes y el CSV en un mensaje nuevo.

## La versión larga

[Extraer datos de recibos y facturas a partir de fotos](https://abox.tools/es/guias/extraer-recibos-facturas-de-fotos/): Cómo revisar el OCR y los recortes, elegir una moneda común y tipos manuales o históricos, y preparar imágenes comprimidas por correo con cada valor convertido, la cantidad de documentos y un total general.

## También en la caja

- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.
- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.
- [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.
- [Cortador de audio](https://abox.tools/es/cortar-audio/): Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.

## Preguntas

### ¿Lee correctamente todos los recibos y facturas?

No. El OCR puede confundir un dígito o no leer impresión tenue, texto diminuto o un logotipo estilizado. El analizador evita etiquetas de descuentos y efectivo entregado, pero no puede usar una etiqueta que el OCR no haya leído. El comercio y la referencia pueden quedar vacíos si no hay un candidato fiable. La falta del nombre del comercio o una moneda de dólar o yen sin identificar también pueden activar una lectura más cercana del encabezado del comercio. Esa lectura se muestra por separado y solo proporciona el nombre del comercio y sugerencias de moneda basadas en su dirección. Una lectura poco fiable o la falta de un importe o una fecha pueden activar una segunda lectura con ajuste local del contraste para distinguir mejor la impresión del papel. Puedes comparar las dos lecturas del documento completo. Las discrepancias no resueltas sobre importes, fechas, referencias o monedas pueden dejar campos vacíos para que los rellenes. La moneda impresa tiene prioridad sobre una deducción basada en la dirección, y una fecha reconocida del recibo o la factura tiene prioridad sobre una fecha de un comprobante de pago con tarjeta añadido. Puede mejorar una sugerencia, pero no recuperar detalles perdidos por desenfoque ni garantizar un resultado correcto. Compara cada sugerencia con la foto y confirma cada documento antes de exportarlo. Esta herramienta no extrae líneas de productos ni demuestra que los cálculos de una factura sean correctos.

### ¿Puede una imagen contener varios recibos?

Usa un recibo o una factura por imagen. La herramienta trata cada imagen como un documento y no separa colecciones de recibos ni hojas de plantillas. Añade una imagen o un recorte independiente para cada documento, con sus datos identificativos y su importe final visibles. De lo contrario, el texto de distintos recibos puede mezclarse en una sola sugerencia.

### ¿Cómo se interpretan las fechas y los símbolos de moneda?

La fecha del documento se conserva tal como está impresa. Para consultar un tipo de cambio en línea, revísala y elígela en el campo independiente de fecha de conversión; una fecha como 24/09/2018 no se rellena automáticamente allí. El símbolo de libra sugiere GBP. El símbolo $ por sí solo puede significar USD, CAD, AUD u otra moneda de dólar. Tiene prioridad la moneda impresa junto al total final. Si la moneda sigue sin estar clara, un país reconocido o un código postal distintivo junto con su región en la dirección del comercio pueden sugerirla. La línea de la dirección impresa aparece junto a la sugerencia. Una ciudad por sí sola o una dirección de cliente, entrega o banco no bastan; los datos ambiguos o contradictorios sin resolver dejan la moneda vacía. No se consulta ningún servicio de ubicación. Compara cada código sugerido con el documento.

### ¿Qué archivos e idiomas puede leer?

Fotos JPEG, PNG, WebP y AVIF, hasta 20 por lote y 20 MB por archivo. El modelo de OCR incluido lee texto impreso en inglés. No se admiten otras escrituras, texto manuscrito, PDF ni archivos HEIC. Para una foto HEIC de iPhone, crea primero un JPEG con la aplicación de fotos del dispositivo o el conversor HEIC de este sitio.

### ¿Qué significan el número de documentos y los totales?

Cada foto cuenta como un documento. Cada documento muestra su importe original y su valor convertido en la misma moneda final del correo. El total general suma los valores convertidos y revisados, redondeados individualmente a dos decimales. El informe también conserva los totales originales por moneda. Enviar por correo y descargar adjuntos requieren que todos los documentos estén revisados. Las fotos duplicadas cuentan dos veces si no eliminas una.

### ¿El botón de correo envía algo automáticamente?

No. Si es compatible, ofrece el informe y las copias JPEG comprimidas mediante el menú de compartir del dispositivo; elige allí la aplicación de correo. Si no es compatible, descarga un archivo de correo con el informe y los adjuntos. El asunto sugerido incluye el número de documentos y, cuando todos estén revisados, el total general en la moneda final. Si editas el asunto, se conserva tu texto. Revisa el destinatario, el contenido y los adjuntos, y envía el mensaje tú mismo. La página no puede saber si la aplicación los aceptó o si finalmente enviaste el mensaje.

### ¿Las imágenes recortadas se adjuntan al archivo de correo?

Sí. El archivo `.eml` descargado contiene el informe y todos los JPEG preparados como adjuntos. Las aplicaciones compatibles lo abren como borrador; otras pueden abrirlo como un mensaje que hay que reenviar o volver a enviar. Las fotos originales no cambian y no se adjuntan. El ZIP contiene los mismos JPEG y el CSV si necesitas adjuntarlos manualmente. Ningún navegador puede garantizar que todas las aplicaciones de correo acepten un borrador o el contenido del menú de compartir.

### ¿Cómo se elige la moneda predeterminada del correo?

Cada documento con un código de moneda válido tiene un voto. El código más frecuente se convierte en la moneda final del correo. En caso de empate, se usa la primera aparición en el orden actual de documentos. Se ignoran los códigos ausentes o incompletos. Leer, corregir o eliminar documentos actualiza la moneda predeterminada. Elegir una moneda final manualmente conserva esa elección. Usar moneda predeterminada restaura la elección automática. Cambiar la moneda final borra los tipos de cambio y las confirmaciones anteriores.

### ¿Puedo elegir una moneda que no aparece en la lista?

Sí. Elige Otro / código personalizado e introduce un código de tres letras para la moneda del documento o la moneda final del correo. Cambiar la moneda final actualiza todos los documentos y borra sus tipos y confirmaciones anteriores. La cobertura en línea depende de las monedas y de la fecha. Si no hay un tipo histórico, introdúcelo manualmente; no se sustituye por el más reciente.

### ¿Se suben las fotos para el OCR?

No. Tesseract las lee en el navegador con los datos del idioma inglés incluidos en la página. Copiar y descargar son acciones locales. Elegir correo o compartir con el dispositivo entrega intencionadamente la información seleccionada a otra aplicación, que gestiona cualquier entrega posterior.

### ¿Por qué una foto muy detallada puede dar un mal resultado?

Los reflejos, el desenfoque, los pliegues y la distancia pueden ocultar letras incluso en una imagen grande. El OCR amplía los recortes pequeños hasta tres veces y añade un borde blanco estrecho, manteniendo la copia de trabajo dentro de 2400 píxeles en su lado más largo. Esto puede ayudar a leer letras pequeñas, pero no recupera detalles ausentes. Llena el encuadre con un documento, mantén el texto nítido y uniformemente iluminado, y gira una página de lado antes de leerla de nuevo. Ni el original ni el adjunto de correo se amplían para el OCR.

### ¿Funciona sin conexión?

La lectura, la edición, los recortes, la conversión manual, el recuento, la preparación de JPEG y las descargas funcionan después de guardar la página y los recursos de OCR en caché. Consultar tipos históricos en línea requiere conexión; un tipo ya obtenido permanece disponible en la pestaña abierta. Abrir un borrador puede funcionar sin conexión, pero entregar el correo normalmente requiere la conexión de la aplicación.

### ¿Cómo usan los tipos históricos la fecha del recibo?

Revisa la fecha impresa en el recibo e introdúcela en el campo de fecha de conversión. No se adivinan fechas ambiguas. Elige la consulta en línea y pulsa Obtener tipo histórico. El resultado indica su fecha real de observación, que puede ser anterior a la solicitada cuando no se publicó un tipo ese día. Revísala antes de confirmar. También puedes introducir un tipo manual distinto para cada documento. El correo registra el tipo, su origen y la fecha usada para cada valor convertido.

## Cómo se comprueba la promesa de privacidad

- **El OCR se realiza en tu dispositivo.** Una foto contiene píxeles, no texto, por lo que hace falta un motor de OCR para leerla. Esta página incluye Tesseract y los datos del idioma inglés en lugar de entregar la foto a un servidor. El navegador lee en memoria los archivos elegidos. El sitio no almacena las fotos ni los campos extraídos. El motor y los datos ocupan unos 8 MB antes de la compresión de entrega y se guardan en caché con la herramienta. Sus versiones, archivos de origen y [licencias figuran junto a ellos](https://abox.tools/es/extraer-recibos-facturas/vendor/README.md).
- **Un importe sugerido todavía necesita tu revisión.** Un dígito desvaído, un reflejo o un subtotal cerca del final pueden producir una respuesta incorrecta que parezca convincente. Compara el comercio, la fecha, la referencia, la moneda y el total con la imagen, corrige los datos y comprueba que todo el documento quede dentro del recorte. Solo los documentos confirmados entran en los totales. Todos los documentos del lote deben estar confirmados para enviar por correo o descargar adjuntos. Cambiar un campo, el recorte o la rotación requiere otra revisión. Un informe copiado o un CSV pueden incluir filas sin terminar, marcadas como pendientes de revisión. La confirmación registra tu revisión; no demuestra de forma independiente que los cálculos del documento sean correctos.
- **Tú controlas la entrega al correo.** Cuando se admite compartir archivos, Correo con imágenes abre el menú de compartir del dispositivo con las copias JPEG comprimidas y el informe. Elige allí la aplicación de correo y revisa el destinatario, el mensaje y los adjuntos. Si no es compatible, descarga el archivo de correo con el informe y todos los adjuntos JPEG. Las aplicaciones compatibles lo abren como borrador; otras pueden requerir Reenviar o Volver a enviar. Esta página no envía nada. La aplicación y el proveedor de correo gestionan la entrega según sus propios ajustes.
- **Las imágenes que envías son copias recortadas y comprimidas.** Ajusta cada recorte para conservar el recibo o la factura completos. La página sugiere un recorte cuando encuentra bordes claros del documento; de lo contrario, conserva la imagen completa. En un recibo largo de papel de color, un color de papel coincidente más allá del borde detectado puede conservar ese extremo de la imagen, manteniendo el encabezado o el texto final con algo de fondo adicional. Revisa y ajusta la sugerencia. Crea copias JPEG de hasta 1600 píxeles en su lado más largo e intenta que cada imagen ocupe unos 350 KB. Revisa las vistas previas y los tamaños indicados antes de enviar; el tamaño objetivo no está garantizado. Las fotos originales no cambian y no se adjuntan. Si la aplicación de correo no puede usar el archivo de correo, descarga el ZIP, extráelo y adjunta sus copias JPEG y el CSV manualmente.
- **Los tipos de cambio en línea son opcionales.** Los tipos manuales permiten preparar todo sin conexión. Seleccionar la opción en línea no envía una consulta por sí solo: pulsa Obtener tipo histórico para ese documento. Solo se envían la moneda de origen, la moneda final y la fecha elegida a api.frankfurter.dev, sin credenciales ni referencia de origen. Frankfurter puede ver tu dirección IP y la consulta. El tipo obtenido y su fecha de observación aparecen junto al documento y en el informe. Son tipos de referencia y pueden diferir del cargo de un banco o una tarjeta. Si el servicio no proporciona un tipo, usa uno manual; la página nunca sustituye el resultado por el tipo de hoy sin avisar.
- **El informe permanece en esta pestaña hasta que lo guardes o compartas.** No hay cuentas ni historial de documentos. Mantén la página abierta durante la revisión y copia el informe o guarda el CSV antes de salir. Cerrar o recargar la página pierde el lote guardado en memoria. Un informe que copies, descargues o entregues a otra aplicación permanece donde lo hayas guardado.
- **Qué reciben los demás scripts de la página.** Los scripts de publicidad, medición y del botón de donaciones se cargan como en las demás herramientas. No reciben fotos, texto de OCR, nombres de archivo, nombres de comercios, importes ni número de documentos. El código que lee las fotos y prepara el informe se sirve desde este sitio y figura en el repositorio.
- **La lectura funciona sin conexión; la entrega depende de la aplicación.** Espera a que la línea de estado sin conexión indique que está listo, desconéctate y lee otra foto. El motor de OCR en caché, el formulario de revisión, los totales, la copia, la preparación de JPEG, la conversión manual y las descargas siguen funcionando. Consultar tipos en línea requiere conexión. La aplicación de correo puede guardar un borrador sin conexión; enviarlo requiere la conexión que use esa aplicación.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/ocr.js` para la interfaz del OCR local, `src/main.js` para la revisión y la entrega al correo o al menú de compartir, `src/attachments.js` para las copias JPEG, `src/email.js` para el archivo de correo, `src/fx.js` para la conversión y las consultas opcionales de tipos históricos, y `vendor/` para el motor y sus licencias. El informe y los adjuntos se preparan en la pestaña. Tú eliges una aplicación de correo o descargas un archivo de correo, y lo envías.
