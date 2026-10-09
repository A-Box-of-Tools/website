# PDF a CSV — tablas de todo tipo, incluidos extractos bancarios

Encuentra tablas en un PDF y las convierte en filas para una hoja de cálculo.

> Convierte tablas de PDF a CSV: extractos, facturas, listas de precios e informes. Detecta columnas por la posición del texto y compara saldos cuando es posible. Sin subir nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-pdf-a-csv/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El PDF se abre y lee en la memoria del dispositivo con código de esta página. El CSV se escribe del mismo modo. No hay funciones de subida ni un servidor que lo reciba. Números de cuenta, saldos, destinatarios y precios se quedan en la pestaña.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo convertir las tablas de un PDF a CSV

1. **Elige el PDF.** Un documento cada vez. Se leen todas las páginas antes de decidir el separador decimal y el orden de las fechas, porque son propiedades del documento completo: puede escribir 1.240,00 o 1,240.00.
2. **Revisa las tablas encontradas.** Cada tabla conserva sus columnas y encabezados. Si continúa en otra sección o página con la misma estructura, se reúne sin repetir el encabezado. Las celdas partidas en varias líneas se unen. Totales, subtotales y etiquetas se conservan como filas.
3. **Elige una tabla o todas.** El selector permite exportar una o todas seguidas. Si hay saldos, se muestran las comparaciones coincidentes y las filas no comprobadas. Las fechas con año pasan a YYYY-MM-DD y los importes a números con signo. Las fechas sin año se dejan como estaban: asignar uno sería una suposición.
4. **Descarga el CSV.** Se escribe según RFC 4180, con comillas y saltos CRLF, en UTF-8 con marca de orden de bytes para que Excel reconozca los símbolos. Si exportas todas las tablas, cada una mantiene sus encabezados y se separan con una línea vacía. No se sube nada.

## La versión larga

[¿Es seguro subir un extracto bancario?](https://abox.tools/es/guias/es-seguro-subir-un-extracto-bancario/): Un extracto reúne destinatarios, importes y saldos en un archivo. Qué recibe el convertidor, qué hacen los servicios cuidadosos y cómo comprobar si realmente era necesario subirlo.

## También en la caja

- [Extractor de recibos y facturas](https://abox.tools/es/extraer-recibos-facturas/): Lee las fotos, revisa los campos y los recortes, y envía por correo imágenes comprimidas con cada importe y los totales.
- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.
- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.
- [Extraer el audio de un vídeo](https://abox.tools/es/extraer-audio-de-video/): Suelta un vídeo y quédate con el sonido. La imagen no se descodifica nunca, y no se sube nada.

## Preguntas

### ¿Cómo encuentra tablas si el PDF no guarda una tabla real?

Por la posición del texto. Primero separa las notas laterales: las celdas de una tabla comparten exactamente la línea base; las notas solo coinciden por casualidad. Después divide cada región por títulos y huecos, detecta dónde comienzan o terminan celdas alineadas y reúne bloques de las mismas columnas. No usa plantillas por banco o formulario.

### ¿Solo sirve para extractos bancarios?

No. Detecta tablas de facturas, listas de precios, horarios, resultados e informes. Nació para extractos, pero se amplió porque un mismo documento puede tener muchas tablas distintas. En los extractos, además puede comparar cambios netos entre saldos legibles.

### ¿Qué pasa con una descripción que ocupa varias líneas?

Se vuelve a unir a su fila. Una línea cercana con una sola celda de texto se considera continuación; si está más cerca de la fila siguiente, se une a ella, como ocurre con etiquetas encima de su valor. Una línea con varias celdas o con un número se conserva como fila propia.

### ¿Qué demuestra la comprobación de saldos?

Compara la suma de importes entre dos saldos legibles con la diferencia entre ellos e indica cuántas comparaciones coinciden. También ayuda a identificar columnas de saldo e importe sin depender de sus títulos. Se señalan filas sin comprobar: antes del primer saldo, después del último e intervalos con importes ausentes o ilegibles. Una celda vacía de débito o crédito no utilizado cuenta como cero; un valor ilegible no. Los saldos coincidentes no descartan errores que se compensen ni validan descripciones o fechas. Revisa el CSV frente al PDF antes de usarlo.

### ¿Y si 03/04 significa 4 de marzo, no 3 de abril?

Cambia el selector de fechas y se recalcula todo. La herramienta usa el documento, no tu ubicación: una fecha con día mayor de doce permite inferir el orden y la página lo indica. Si todos los días son del uno al doce, es ambiguo; avisa de *esa ambigüedad* y empieza con día primero hasta que lo cambies. Las fechas sin año se conservan tal como aparecen.

### ¿Funciona con un PDF escaneado?

No, y lo avisa en vez de descargar un archivo vacío. Un escaneo es una imagen sin texto que alinear. Para un extracto, busca primero la exportación CSV, OFX o QIF del banco: evita la conversión y es más fiable que reconocer una imagen.

### ¿Puede abrir un PDF protegido con contraseña?

No retira contraseñas. Usa primero [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/) en este sitio: lo hace en el navegador y mantiene la posición del texto. También puedes abrirlo con la contraseña y guardar otra copia al imprimir desde Chrome o Edge, o exportar desde Vista Previa en Mac. Evita servicios que pidan subir el documento para desbloquearlo.

### ¿Se sube mi PDF a alguna parte?

No. El navegador lee el archivo y escribe el CSV en tu dispositivo. No hay procesamiento en servidor y la `Content-Security-Policy` enumera los destinos permitidos, ninguno del sitio. Desconéctate y convierte un PDF para comprobarlo.

### ¿Por qué aparece un carácter extraño al principio del CSV?

Es la marca de orden de bytes. Indica a Excel en Windows que el archivo usa UTF-8 para conservar símbolos como euros y libras. Los lectores suelen ignorarla, pero algunos analizadores pueden incluir ese carácter invisible al principio del primer encabezado. Es el coste de mejorar la compatibilidad con Excel.

### ¿Hay límite de tamaño y cuesta algo?

No hay un límite fijado. El documento se mantiene en memoria y el límite depende del dispositivo; unos cientos de páginas suelen ser manejables. Es gratis, sin cuenta, inicio de sesión ni prueba. La publicidad paga el sitio y no recibe datos del documento.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando, algo que una herramienta que enviara el PDF a un servidor no podría hacer.

## Cómo se comprueba la promesa de privacidad

- **Los PDF que conviertes suelen contener datos que no quieres entregar.** Extractos, facturas, recibos e informes contienen pagos, saldos, precios y cifras de una empresa. Subirlos a un conversor entrega una copia a otro servidor. Aquí no hay un servicio al otro lado: no existe un destino al que enviar el documento.
- **Los saldos permiten comparar cambios netos, con límites claros.** Detectar columnas y unir líneas exige inferir la estructura y puede fallar. La herramienta suma los importes entre dos saldos legibles y los compara con su diferencia. Indica cuántas comparaciones coinciden y qué filas no se comprobaron: anteriores al primer saldo, posteriores al último o dentro de intervalos ilegibles. Coincidir es información útil, no prueba de que todo sea correcto: los errores que se compensan pueden pasar. Una tabla sin saldo reconocido no tiene esta comprobación.
- **La estructura se deduce de la página, sin plantillas por banco.** No hay una lista de bancos ni formatos admitidos. Se separan las notas laterales y se buscan líneas con celdas alineadas en cada región. Puede funcionar con documentos desconocidos, pero puede fallar si las columnas se solapan o no se distinguen bien.
- **La contraseña se retira en una herramienta separada.** Un PDF protegido se rechaza. Para retirar la protección sin que salga del dispositivo, usa [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/), que conserva intacto el contenido de las páginas, o imprime una copia PDF desde el navegador o Vista Previa. Evita servicios que exijan subirlo para desbloquearlo: entregar el documento es justo lo que esta página pretende evitar.
- **No reconoce texto dentro de fotografías.** Un escaneo contiene píxeles, no texto que pueda alinearse en columnas. Se detecta y se explican alternativas locales. En un extracto, lo primero es buscar la descarga CSV que suele ofrecer el banco. Reconocer letras en imágenes requiere OCR, una tarea distinta.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben documentos, tablas, filas, cifras, nombres ni número de páginas. Todo el código que lee PDF o escribe CSV se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma su tipografía de Google Fonts. Es un enlace y nada más: no informa de ninguna visita y no se le entrega nada sobre ti ni sobre tus documentos. No pasa nada hasta que lo pulsas, y entonces estás en el sitio de otra gente.
- **Funciona sin conexión.** Desconéctate y la página sigue funcionando. Una herramienta que enviara el documento a convertir fuera se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/layout.js` para separar regiones de una página, `src/tables.js` para detectar tablas y columnas, `src/rows.js` para reunir líneas en filas y `src/check.js` para comparar los saldos de un extracto. Ninguno accede a la red, ni el lector que usan.
