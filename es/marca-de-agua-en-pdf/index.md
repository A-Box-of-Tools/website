# Marca de agua en PDF — indica en cada página a quién va dirigida

Identifica el destino de una copia para que siga visible si termina en otro lugar.

> Añade una marca de agua a un PDF en el navegador: destinatario, fecha o nombre, en cualquier idioma, con tamaño, ángulo y opacidad ajustables. No se sube nada y se comprueba el resultado.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/marca-de-agua-en-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El documento se abre, recibe la marca y se escribe en la memoria del dispositivo con código de esta página. El navegador dibuja el texto. No hay funciones de subida ni un servidor que reciba el archivo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo poner una marca de agua en un PDF

1. **Elige el PDF.** Un documento cada vez. El navegador lo lee del disco. Los documentos protegidos se dirigen primero a la herramienta de desbloqueo; los demás, incluidos los escaneos, se abren aquí.
2. **Escribe el texto.** Indica destinatario y fecha, por ejemplo «Solo para Banco Acme · 12 de septiembre de 2026». Admite cualquier idioma y escritura que el navegador pueda dibujar con tus fuentes.
3. **Elige la posición y revisa la vista previa.** Tamaño, diagonal u horizontal, una marca central o repetida, opacidad, color y todas las páginas o solo la primera. La vista previa usa una hoja en blanco de las dimensiones de la primera página y muestra la posición exacta.
4. **Añade la marca y lee la comprobación.** Se añade una sola imagen al documento y una instrucción para dibujarla en cada página seleccionada. Después se reabre el archivo para comprobar la marca y el número de páginas. Si falla, se avisa y no hay descarga.

## La versión larga

[Cómo poner una marca de agua en un PDF y qué consigue](https://abox.tools/es/guias/poner-una-marca-de-agua-en-un-pdf/): Por qué conviene identificar el destinatario de una copia, qué evita y qué no evita una marca de agua, qué escribir y cómo añadirla en el navegador sin subir el documento.

## También en la caja

- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.
- [PDF a CSV](https://abox.tools/es/convertir-pdf-a-csv/): Encuentra tablas en un PDF y las convierte en filas para una hoja de cálculo.
- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.
- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.

## Preguntas

### ¿Se puede quitar una marca de agua?

Sí, con un editor de PDF. No es un bloqueo: identifica para quién se preparó una copia, como «Solo para Banco Acme». Si alguien la usa en otro lugar, esa identificación sigue visible salvo que la retiren. Para controlar quién abre el documento, usa una contraseña con [Proteger PDF](https://abox.tools/es/proteger-pdf/).

### ¿Puede estar en chino, árabe u otro idioma?

Sí. El navegador dibuja el texto con las fuentes del dispositivo y lo añade como imagen, así que no está limitado al alfabeto latino. A cambio, el texto de la marca no será seleccionable ni se podrá buscar.

### ¿Por qué no veo mi documento en la vista previa?

El sitio no incluye un motor completo de PDF. La vista muestra una hoja en blanco con las dimensiones de la primera página y la posición calculada de la marca. Usa el mismo código que escribe el resultado. Abre ese resultado en un lector para ver la marca sobre el contenido real.

### ¿Cambia el contenido debajo de la marca?

No. Las instrucciones, fuentes e imágenes se copian intactas; la marca se dibuja encima con la opacidad elegida. El texto sigue seleccionable, los escaneos conservan resolución y nada se mueve. Se añade una sola imagen compartida por todas las páginas, normalmente unas decenas de kilobytes para pocas palabras.

### ¿Funciona con escaneos y páginas giradas?

Sí. La marca se dibuja sobre la imagen del escaneo. Las páginas con rotación se marcan tal como las muestra el lector: una diagonal en la vista sigue siendo una diagonal en la página visible.

### ¿Qué ocurre si el documento está firmado?

La firma digital deja de ser válida en la copia reescrita porque cubre los bytes del original. Se avisa si se detecta una. Conserva el original firmado.

### ¿Puedo marcar un PDF con contraseña?

Retira primero la protección con [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/), añade la marca aquí y, si quieres, vuelve a poner contraseña con [Proteger PDF](https://abox.tools/es/proteger-pdf/). Esta página no pide contraseñas. También dirige al desbloqueo los archivos con solo restricciones, porque reescribirlos las eliminaría.

### ¿Se suben el documento o las palabras que escribo?

No. El navegador lee, dibuja y escribe en tu dispositivo. No hay procesamiento en servidor y la `Content-Security-Policy` enumera los destinos permitidos, ninguno del sitio. Desconéctate para comprobarlo.

### ¿Cómo sé que se añadió la marca a cada página?

Se reabre el resultado y se comprueba que cada página seleccionada declara la marca en sus recursos y termina con la instrucción para dibujarla. También debe conservarse el número de páginas. Si falla, no se ofrece la descarga.

### ¿Hay límite de tamaño y cuesta algo?

No hay ningún límite escrito en la herramienta. El límite es tu propio equipo: el documento se sostiene en memoria mientras se trabaja con él, así que un portátil aguantará unos cientos de megabytes sin quejarse y empezará a sufrir en algún punto por encima. Es gratis, no hay cuenta, ni registro, ni prueba. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus documentos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando, algo que una herramienta que enviara el documento a un servidor no podría hacer.

## Cómo se comprueba la promesa de privacidad

- **Los documentos que marcas suelen ser los que menos quieres subir.** Un pasaporte para un arrendador, un extracto para una hipoteca o un contrato reservado. Antes de entregarlos, puedes identificar al destinatario sin enviarlos primero al servidor de un tercero. Aquí el navegador lee, dibuja la marca y escribe la copia en memoria. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Funciona sin red.
- **Una marca identifica la copia; no impide copiarla.** «Solo para Banco Acme, 12 de septiembre de 2026» permite identificar para quién se preparó una copia que aparezca en otro lugar. No es protección: un editor de PDF puede retirar la marca. Si necesitas impedir que alguien sin autorización lea el documento, añade contraseña con [Proteger PDF](https://abox.tools/es/proteger-pdf/), accesible desde el resultado.
- **La marca es una imagen y admite cualquier escritura.** Para dibujar texto, un PDF necesita fuentes incorporadas o las catorce básicas latinas. En vez de añadir un motor de fuentes, el navegador dibuja las palabras una vez con las fuentes del dispositivo y las coloca como imagen con máscara de transparencia, a resolución de impresión. Así admite cualquier escritura que puedas introducir. El texto de la marca no se puede seleccionar ni buscar después.
- **El contenido de las páginas no se vuelve a dibujar.** Se añaden al documento la imagen de la marca, su máscara y un ajuste de opacidad. Cada página recibe dos pequeñas instrucciones de dibujo, antes y después del contenido existente. Las instrucciones originales, fuentes e imágenes pasan intactas: el texto sigue seleccionable, los escaneos conservan resolución y nada se mueve. La reescritura solo omite versiones antiguas de objetos sustituidos.
- **La vista previa muestra la posición de la marca.** El sitio no incluye un motor para representar PDF. La vista previa usa una página en blanco con el tamaño y forma de la primera página, y coloca la marca con las mismas cuentas que escriben el archivo. No dibuja el contenido del documento. Abre el resultado en un lector para ver ambos juntos.
- **Se reabre el resultado antes de ofrecerlo.** El archivo generado se vuelve a abrir con el lector común de las herramientas PDF. Debe mantener el número de páginas y cada página prevista debe incluir el recurso de la marca y la instrucción que lo dibuja. Si falla, no hay descarga.
- **La firma digital no sobrevive a la reescritura.** Una firma digital cubre los bytes exactos del original. Reescribirlo invalida la firma en la copia y se avisa al detectarla. Conserva el original, que sigue siendo el firmado.
- **Retira antes la protección de un PDF bloqueado.** Esta página no pide contraseñas. Si el archivo está protegido, te dirige a [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/). Vuelve con la copia abierta, añade la marca y, si quieres, aplica después una contraseña con [Proteger PDF](https://abox.tools/es/proteger-pdf/).
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben documentos, páginas, nombre, tamaño, número de páginas ni texto de la marca. Todo el código que lee, marca y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma su tipografía de Google Fonts. Es un enlace y nada más: no informa de ninguna visita y no se le entrega nada sobre ti ni sobre tus documentos. No pasa nada hasta que lo pulsas, y entonces estás en el sitio de otra gente.
- **Funciona sin conexión.** Desconéctate y la página sigue funcionando. Una herramienta que enviara el documento fuera para marcarlo se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/stamp.js` para la posición de la marca, `src/render.js` para convertir el texto en imagen y `src/apply.js` para los tres objetos añadidos al documento y los dos de cada página. Ninguno accede a la red, ni el lector y el escritor.
