# Cómo comprobar un extracto bancario en CSV antes de confiar en él

Una hoja de cálculo puede parecer perfecta y aun así contener un importe incorrecto o un movimiento ausente. Compárala con el extracto: usa los saldos impresos para comprobar los números y las filas originales para revisar lo demás.

Última actualización 29 de septiembre de 2026

## La respuesta corta

Un CSV que se abre correctamente en una hoja de cálculo puede tener un importe equivocado, un movimiento ausente o una fecha interpretada al revés. Compáralo con el extracto original: revisa filas, fechas y descripciones, y después utiliza los saldos impresos para comprobar los importes.

Conserva el PDF junto al archivo convertido. Que la descarga termine solo demuestra que el convertidor produjo un archivo. Estas comprobaciones ayudan a saber si dice lo mismo que el extracto.

## Antes de convertir, busca una exportación

Si el banco ofrece una descarga CSV del período que necesitas, empieza por ahí. Una exportación directa evita reconstruir una tabla a partir de texto colocado en una página PDF. Revisa la cuenta, las fechas y el significado de las columnas; habrá una etapa menos en la que puedan aparecer errores.

A veces solo tienes el PDF: un extracto antiguo, una cuenta cerrada o un documento que te enviaron. En esos casos, convertirlo sí resulta útil.

## Revisa un extracto pequeño paso a paso

Este extracto ficticio de una cuenta corriente empieza con **1,250.00**. Los importes positivos suman dinero y los negativos lo restan. La última columna está impresa en el extracto; no se ha calculado después en la hoja.

Cuatro movimientos ficticios, con un saldo inicial de 1,250.00

| Fecha | Descripción | Importe | Saldo impreso |
| --- | --- | --- | --- |
| 2026-08-03 | Pago de sueldo | +800.00 | 2,050.00 |
| 2026-08-04 | Alimentos | -43.20 | 2,006.80 |
| 2026-08-05 | Café | -6.80 | 2,000.00 |
| 2026-08-06 | Transferencia | -125.00 | 1,875.00 |

Cada fila permite comprobar que **saldo anterior + importe con signo = saldo nuevo**. Para la compra de alimentos, `2050.00 + (-43.20) = 2006.80`. Para el café, `2006.80 + (-6.80) = 2000.00`.

Supón que el CSV interpreta la compra de alimentos como **-48.20**. Todas las celdas están completas, pero `2050.00 + (-48.20) = 2001.80`. La diferencia con el saldo impreso es de **5.00**, lo que señala una fila concreta que revisar en el PDF.

Conserva los saldos impresos durante la revisión. Si los sustituyes por fórmulas basadas en los importes convertidos, la hoja coincidirá consigo misma, incluidos sus errores.

Comprueba qué representa el saldo antes de aplicar los signos. Un extracto de tarjeta de crédito puede mostrar deuda: las compras la aumentan y los pagos la reducen. No supongas que sus importes positivos y negativos significan lo mismo que en este ejemplo de cuenta corriente.

## Por qué el saldo final no basta

Es útil comparar el saldo inicial más todos los importes con el saldo final, pero los errores pueden compensarse. Si un pago se lee 5.00 por encima y otro 5.00 por debajo, el total seguirá coincidiendo.

Revisar todos los saldos acumulados disponibles ofrece más comparaciones. Si solo aparece un saldo al final del día, compáralo con el saldo impreso anterior más todos los movimientos intermedios.

Incluso eso tiene límites. Si faltan dos movimientos de **-20.00 y +20.00**, el saldo no cambia y la comprobación de ese tramo puede pasar. Compara también la secuencia de filas con el original.

Un saldo que coincide no demuestra que la fecha o el destinatario se hayan copiado bien, ni autentica el extracto. Solo comprueba la relación entre los importes y los saldos disponibles.

## Comprueba las fechas antes de ordenar

`03/04/2026` puede ser el 3 de abril o el 4 de marzo. Una fecha como `18/04/2026` permite distinguir el orden, pero un extracto corto puede no ofrecer esa pista. Revisa el período del documento y el formato del banco en lugar de aceptar una suposición.

Vuelve a revisarlas al abrir el CSV: la hoja de cálculo puede interpretar las fechas de otra manera que el convertidor. Conserva el orden original hasta terminar. Ordenar fechas mal interpretadas dificulta comparar las filas y rompe la secuencia de saldos.

Las fechas sin año también exigen revisar el período, sobre todo entre diciembre y enero. Comprueba los separadores numéricos: `1,240.00` y `1.240,00` pueden representar el mismo importe, y las celdas importadas deben conservar ese valor.

## Lee las descripciones y separa los totales

Una descripción que continúa en una segunda línea sigue siendo un único movimiento. Comprueba que ambas partes quedaron juntas. Presta atención a los saltos de página, donde los encabezados repetidos y los saldos arrastrados pueden parecer filas nuevas.

El PDF también puede contener resúmenes de cuenta, subtotales y detalles de pago. Forman parte del documento extraído, pero no deben importarse como movimientos adicionales. Identifica la tabla de movimientos y separa las filas de resumen antes de preparar la importación.

Dos pagos con la misma fecha, destinatario e importe pueden ser reales. Compara su posición y sus referencias con el extracto antes de borrar uno. Una extracción duplicada y un pago repetido necesitan correcciones distintas.

## Qué comprueba este convertidor

[PDF a CSV](https://abox.tools/es/convertir-pdf-a-csv/) detecta tablas por la alineación del texto, une celdas que continúan en otra línea y conserva totales y etiquetas de sección. Si encuentra varias tablas, puedes elegir la que necesitas. Ofrece un control para el orden de fechas ambiguas y deja las fechas sin año tal como están impresas.

Cuando reconoce una secuencia de saldos acumulados, indica si las comparaciones disponibles coinciden. Debes comprobar por tu cuenta los importes anteriores al primer saldo impreso frente al saldo inicial, y los posteriores al último saldo impreso. Un resultado favorable solo cubre las comparaciones que pudo hacer.

Si no reconoce una secuencia utilizable, no emite un veredicto. **La ausencia de un aviso no es una confirmación.** Ni un resultado silencioso ni una comprobación favorable garantizan que todo el archivo sea correcto. La vista previa muestra un máximo de 25 filas por tabla; revisa el archivo descargado para ver el resto.

Las páginas escaneadas necesitan reconocimiento de texto, que esta herramienta no ofrece. La conversión ocurre en el navegador. La guía sobre [subir un extracto bancario a un convertidor](https://abox.tools/es/guias/es-seguro-subir-un-extracto-bancario/) trata la cuestión de privacidad.

## Antes de importar el CSV en otro programa

Revisa la vista previa de importación con el mismo cuidado que el archivo. Selecciona la cuenta bancaria o tarjeta correcta, confirma el formato de fecha y asigna las columnas de fecha, descripción e importe. Son decisiones distintas de extraer el PDF. La [guía de importación CSV de Intuit](https://quickbooks.intuit.com/learn-support/en-uk/help-article/bank-transactions/prepare-csv-file-bank-upload-quickbooks/L4BjLWckq_GB_en_GB) muestra los requisitos de un producto concreto.

- Confirma la cuenta y el período del extracto.
- Revisa fechas, signos y formatos numéricos después de abrir el archivo.
- Compara los movimientos con el original, incluidos los saltos de página.
- Comprueba los saldos iniciales, acumulados y finales que estén disponibles.
- Investiga las diferencias y las filas repetidas antes de modificarlas.
- Conserva el extracto original y una copia del CSV revisado.
