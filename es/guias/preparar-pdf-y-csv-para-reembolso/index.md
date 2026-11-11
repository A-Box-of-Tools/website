# Preparar un PDF y un CSV de reembolso a partir de fotos de recibos

Una solicitud de reembolso suele necesitar recibos legibles y una lista de gastos. Parte de un único conjunto de fotos revisadas para que el PDF y el CSV describan los mismos documentos en el mismo orden.

Última actualización 22 de octubre de 2026

## Genera los justificantes y las filas a partir de los mismos registros

Un PDF ofrece al destinatario recibos que leer. Un CSV proporciona campos que comprobar o abrir en una hoja de cálculo. Empieza en el [Extractor de recibos y facturas](https://abox.tools/es/extraer-recibos-facturas/), revisa los registros y utiliza sus archivos JPEG preparados en [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/). Comprime el PDF solo si debe ajustarse a un límite menor de archivos adjuntos.

Este ejemplo práctico utiliza tres recibos ficticios en dólares canadienses:

| Recibo, en orden de registro | Total confirmado |
| --- | --- |
| 1. North Street Print | 12,40 CAD |
| 2. Market Car Park | 8,00 CAD |
| 3. Harbour Stationery | 17,60 CAD |

El total esperado es 38,00 CAD. Comprueba primero los campos y formatos de archivos adjuntos que exige el destinatario. Este artículo prepara dos archivos que se corresponden; no determina si un gasto reúne las condiciones para pagarse.

## Empieza con una foto por documento

Conserva los originales y selecciona copias en el [extractor](https://abox.tools/es/extraer-recibos-facturas/). Admite JPEG, PNG, WebP y AVIF compatibles con el navegador, hasta 20 imágenes por lote y 20 MB por imagen. El reconocimiento utiliza un modelo local de texto impreso en inglés. Convierte primero las imágenes no compatibles y consigue una foto más clara si una fecha o un importe están demasiado borrosos para leerlos.

Cada imagen se convierte en un registro documental. Tres páginas de una factura no se agrupan automáticamente como un único gasto. Los totales repetidos entre esas páginas pueden crear varios registros para el mismo cargo; este proceso sencillo presupone un recibo completo en cada foto. La [guía de extracción](https://abox.tools/es/guias/extraer-recibos-facturas-de-fotos/) describe el alcance de la herramienta y los pasos de revisión.

## Revisa los campos y los recortes juntos

El reconocimiento propone valores; compáralos con la imagen. Comprueba el comercio, la fecha, la referencia, el total y la moneda. Un subtotal, un impuesto, el efectivo entregado o el cambio pueden parecer razonables sin ser el importe final del recibo. No inventes un valor ausente para que una fila parezca completa.

Conserva el documento completo dentro del recorte del archivo adjunto, incluidos el número de recibo, el importe final y el desglose de impuestos pertinente. Confirma los campos y el recorte solo después de leerlos. Un cambio posterior en el recorte o en un campo puede anular la confirmación, así que revisa de nuevo el estado antes de exportar.

En este ejemplo, elige CAD como moneda final y verifica que las tres monedas originales sean CAD. Los registros en la misma moneda usan un tipo de cambio de uno; no hace falta consultar tipos de cambio por internet. Si hay distintas monedas, sigue la revisión de tipos de cambio de la guía de extracción en lugar de sumar importes de monedas diferentes.

Solo los registros confirmados entran en los totales. Una suma aparentemente correcta puede omitir un recibo sin terminar. Comprueba conjuntamente los tres registros confirmados y los 38,00 CAD. Los avisos de duplicados solo comparan el nombre y el tamaño del archivo: inspecciona las imágenes, porque los duplicados renombrados pueden pasar inadvertidos y las imágenes distintas pueden generar un aviso.

## Exporta filas e imágenes que se correspondan

Descarga el CSV revisado y los archivos JPEG preparados, o el ZIP que contiene ambos. Extrae el ZIP antes de seleccionar las imágenes para la siguiente herramienta. Los nombres de los archivos adjuntos incluyen números de registro estables, mientras que la columna de nombre de archivo del CSV contiene el nombre de la foto original. Guarda también una copia del informe de texto: enumera juntos los nombres originales y los de los archivos preparados. Usa esa correspondencia y el comercio, la fecha y el importe para relacionar filas e imágenes, sobre todo cuando se repitan nombres de archivos de la cámara.

Es posible exportar un CSV sin terminar la revisión. Abre la descarga real e inspecciona el estado y los campos de cada registro; exportar no significa que todo esté confirmado. En este ejemplo debe haber tres registros de gastos previstos, cada uno con su imagen correspondiente y el importe en CAD comprobado de la tabla anterior. El CSV también termina con filas de número de documentos, número de revisados y total general; son resúmenes, no recibos adicionales. Exclúyelas al sumar las filas de gastos por tu cuenta.

Guarda el conjunto como `workshop-expenses.csv` y una carpeta de trabajo con las imágenes de recibos numeradas. Mantén las fotos originales por separado. Al abrir el CSV en una hoja de cálculo, el programa puede interpretar las fechas o los números a su manera; compara lo que muestra con el texto exportado y el recibo antes de confiar en un valor importado.

## Crea el PDF en orden de registro

Selecciona los JPEG preparados en [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/). El paso entre herramientas consiste en descargar y seleccionar; volver a elegir las fotos originales de la cámara descartaría los recortes revisados y rompería la correspondencia con esos archivos adjuntos.

Ordena las imágenes para que coincidan con las filas de gastos del CSV: impresión, estacionamiento y, después, papelería. Comprueba la correspondencia de nombres del informe en lugar de confiar en el orden del selector de archivos. Elige una disposición de página que mantenga cada recibo completo y legible y guarda `workshop-receipts.pdf`. La [guía de imágenes a PDF](https://abox.tools/es/guias/unir-imagenes-en-un-pdf/) explica los tamaños de página y la calidad de imagen.

![Controles de disposición de página de Imágenes a PDF para elegir el tamaño del papel y cómo se ajusta una imagen a la página.](https://abox.tools/screens/prepare-a-reimbursement-pdf-and-csv/layout.webp)

Controles de disposición de página. Conserva completos los recibos largos y comprueba la letra pequeña en el PDF exportado, no solo en la vista previa.

Abre el PDF descargado y lee todas las páginas. Comprueba la orientación, los bordes completos, las fechas y las cifras pequeñas de impuestos. Este PDF basado en imágenes no adquiere una capa de texto con búsqueda por el mero hecho de haber usado OCR para crear el CSV.

## Comprime solo si lo exige el límite del destinatario

Si el PDF cabe, consérvalo. El extractor ya prepara archivos JPEG comprimidos, así que otra pasada puede aportar poco y dificultar la lectura de la letra pequeña. En caso contrario, prueba una copia en [Comprimir PDF](https://abox.tools/es/comprimir-pdf/), compara tamaños y vuelve a leer todos los recibos. La compresión no garantiza una reducción concreta. La [guía de compresión de PDF](https://abox.tools/es/guias/reducir-el-tamano-de-un-pdf/) explica las ventajas y limitaciones.

## Comprueba los dos archivos que vas a presentar

- El CSV contiene los tres gastos previstos y confirmados, con las monedas correctas.
- Cada recibo corresponde a un registro y aparece en el orden correspondiente del PDF.
- Cada página del PDF final conserva los detalles que justifican su importe.
- Los importes confirmados en CAD suman 38,00 CAD.
- Los archivos adjuntos exactos cumplen los requisitos de formato y tamaño del destinatario.

El OCR y la revisión manual de este ejemplo se realizan localmente. La consulta opcional de tipos de cambio históricos es una acción de red independiente; enviar los archivos resultantes por correo electrónico u otro servicio es otra. Conserva los originales para posibles consultas posteriores. Un PDF y un CSV coincidentes facilitan la revisión, pero no demuestran que el reconocimiento sea correcto ni garantizan su aceptación.
