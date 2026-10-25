# ¿Es seguro subir archivos a los conversores en línea?

La respuesta honesta suele ser «probablemente sí, pero no tienes forma de comprobarlo». Aquí va lo que le hace de verdad una subida a tu archivo, por qué casi todas las herramientas la siguen haciendo, y cuatro pruebas que te dicen si la que tienes delante la necesita.

Última actualización 13 de octubre de 2026

## La respuesta corta

Subir puede ser adecuado para un archivo no sensible y un servicio cuyas condiciones encajen. La retención y el acceso varían por proveedor y función; un temporizador de borrado no demuestra por sí solo dónde está cada copia.

El problema no es que estén mintiendo, sino que **no tienes manera de saber si lo hacen**. En cuanto un archivo sale de tu dispositivo, cualquier promesa sobre lo que pasa después es una promesa que te estás creyendo: cuánto tiempo se guarda, quién puede llegar hasta él, si se cuela en una copia de seguridad que sobreviva al temporizador de borrado, qué le ocurre si la empresa se vende o sufre una brecha. Nada de eso se ve desde fuera.

Así que la pregunta útil no es «¿me fío de este sitio?», sino **«¿de verdad este trabajo necesita que mi archivo salga de aquí?»**. En un número de trabajos cada vez mayor la respuesta es que no, y cuando la respuesta es que no, la de la confianza deja de ser una pregunta que tengas que responder.

## Empieza por la tarea y comprueba su alcance

**Un archivo adjunto demasiado grande.** Sigue la guía de [imagen](https://abox.tools/es/guias/comprimir-una-imagen-a-un-tamano-exacto/), [PDF](https://abox.tools/es/guias/reducir-el-tamano-de-un-pdf/) o [vídeo](https://abox.tools/es/guias/comprimir-un-video/). Trabaja con una copia, usa el límite real del destinatario y comprueba texto o movimiento en la descarga. Varios archivos pueden compartir un límite total.

**Un conjunto documental o ejemplo para soporte.** [Selecciona y ordena las páginas pedidas](https://abox.tools/es/guias/unir-y-separar-archivos-pdf/); [quita detalles de capturas](https://abox.tools/es/guias/censurar-una-imagen/) o [censura texto PDF compatible](https://abox.tools/es/guias/censurar-un-pdf/) antes de entregarlo conscientemente. Preparar el archivo localmente no decide quién debe recibirlo.

Con un convertidor desconocido, prueba antes el procedimiento exacto con contenido ficticio y las comprobaciones siguientes. El ensayo puede revelar formatos incompatibles, subidas prematuras o resultados ilegibles antes de usar el documento real.

## Qué hace de verdad una «subida»

Una subida envía datos del archivo del navegador a otro dispositivo. Pueden ser los bytes originales o una copia transformada. Elegir un archivo no equivale a subirlo: una herramienta local puede leerlo sin enviarlo.

El procesamiento en servidor puede crear archivos de trabajo, registros que identifican solicitudes, resultados en caché y copias de seguridad. Son posibilidades que revisar en las condiciones, no tres copias que todo servicio necesariamente crea. Una prueba externa de navegador no verifica su borrado interno.

El nombre y los metadatos integrados pueden viajar con la subida. Las fotos pueden incluir ubicación, hora, cámara, software y miniaturas; los campos dependen del dispositivo, ajustes y ediciones. Inspecciona el archivo en vez de suponer que toda foto de móvil tiene todos ellos.

## Por qué casi todas las herramientas suben de todas formas

No porque quieran tus archivos, sino porque durante casi toda la vida de la web no había alternativa. Un navegador no sabía descodificar un vídeo, ni recodificar una imagen a una calidad elegida, ni analizar un formato de archivo; un servidor con FFmpeg e ImageMagick sí. Subir no era un modelo de negocio: era el único sitio donde podía ocurrir el trabajo.

Eso dejó de ser cierto hace poco y sin hacer ruido. Hoy los navegadores traen WebAssembly, que ejecuta esos mismos códecs compilados a una velocidad cercana a la nativa; WebCodecs, que da acceso al codificador de vídeo por hardware que ya llevas dentro; y una API de lienzo capaz de descodificar y recodificar imágenes directamente. El trabajo para el que hacía falta un servidor ocurre ahora en el propio dispositivo que ya tiene el archivo.

Muchas herramientas siguen subiendo, y hay motivos honestos: una cadena de procesos que nadie quiere reescribir, un formato sin descodificador del lado del navegador, un trabajo de verdad demasiado pesado para un móvil. Y hay también un motivo menos honesto: el servidor es donde viven las cuentas, las cuotas y los planes de pago. Una herramienta que funciona entera dentro de tu navegador es difícil de medir.

## Cuatro comprobaciones que puedes hacer tú

Prueba la operación y entrada concretas que usarás. Cada comprobación responde a una parte; juntas son más útiles que una sola.

### 1. Desconecta para la operación local

Carga completamente la herramienta y espera a que su caché indique que está lista. Desconecta y procesa un archivo del dispositivo. Terminar demuestra que esa operación no necesitó servidor mientras no había conexión. Fallar también puede significar recursos ausentes o funciones no compatibles, y no prueba una subida. El éxito no demuestra qué pasa al reconectar; la [guía sin conexión](https://abox.tools/es/guias/como-puede-una-pagina-web-funcionar-sin-conexion/) explica ese límite.

### 2. Inspecciona las solicitudes

Abre DevTools antes, limpia la lista y conserva el registro. Revisa destinos, parámetros, cuerpos de solicitud y mensajes WebSocket. Las columnas de tamaño suelen describir respuestas; solicitudes pequeñas pueden llevar datos extraídos o comprimidos. Igualar el tamaño del archivo no basta. Las listas ordinarias tampoco muestran cargas WebRTC; revisa el transporte y usa los diagnósticos WebRTC del navegador.

### 3. Lee la Content-Security-Policy

La [directiva connect-src](https://www.w3.org/TR/CSP3/#directive-connect-src) limita destinos de API como fetch y WebSocket. Un tercero permitido puede recibir datos. Otras directivas regulan imágenes, formularios y recursos; la lista no describe tráfico WebRTC entre navegadores. CSP es una restricción útil, no una auditoría de cargas ni una prueba aislada de que no se sube nada.

### 4. Sigue los datos en el código

Compara el código publicado y generado. Sigue los archivos por fetch, XMLHttpRequest, sendBeacon, WebSocket y RTCPeerConnection, y revisa formularios, URL de recursos y entregas a aplicaciones. Son ejemplos, no una lista exhaustiva. Lo decisivo son los datos que recibe cada ruta, incluidos los scripts de plataforma y comentarios.

## Lo que «funciona en tu navegador» no significa

Aquí conviene ser preciso, porque la frase se usa muy a la ligera y este sitio tiene que aguantar el mismo listón que está proponiendo.

- **No significa que no haya ninguna petición.** La propia página ha llegado por la red, y casi todas las herramientas gratuitas llevan publicidad o analítica que hablan con alguien. La afirmación va de tu *archivo*, no del tráfico en general.
- **No te esconde la dirección IP.** La ven todos los sitios que visitas, este incluido. El procesamiento local va del contenido de tus archivos, no del anonimato.
- **No sobrevive a una función que descarga algo.** Una herramienta que te deja pegar una dirección web tiene que contactar con esa dirección, y ese servidor se entera de tu IP y de qué le has pedido. Eso va en la propia función y no es un defecto, pero es una excepción real, y una herramienta debería decirlo con todas las letras en vez de pasarla por alto.
- **No equivale a «borramos tus archivos».** Procesar localmente identifica dónde se ejecuta una operación. La retención es otra afirmación sobre lo que hace un proveedor tras recibir datos. Lee la implementación y los límites de red antes de considerar cualquier frase una garantía.

## Cuándo subir está genuinamente bien

Esto no va de que subir sea siempre un error. Manda el archivo cuando el contenido no sea sensible y así te resulte más cómodo, cuando el trabajo sea de verdad demasiado pesado para tu dispositivo, cuando el formato no tenga descodificador del lado del navegador, o cuando estés usando un servicio con el que ya tienes una relación y cuyas condiciones te has leído de verdad.

Ten más cuidado cuando el archivo lleve algo que no publicarías: documentos de identidad, pruebas médicas, contratos, cualquier cosa con una dirección o una cara que no pensabas compartir, o una foto cuyos datos de ubicación no has mirado. Con esos, más vale una herramienta que puedes comprobar que una en la que tienes que confiar. Y no porque sea probable que la de confianza te falle, sino porque con la comprobable la pregunta ni siquiera llega a plantearse.

## Cómo responde este sitio a esas cuatro comprobaciones

Sería una guía bastante rara la que te mandara comprobar y luego pidiera quedar exenta. Así que, por orden:

- **Sin conexión.** El procesamiento local funciona con recursos cargados y caché lista. Obtener imágenes, cambios en línea y presentar navegadores necesitan conexión.
- **Solicitudes.** El código de procesamiento no sube archivos elegidos. Las visitas y los votos fijos voluntarios son distintos. El cambio envía monedas y fecha; las funciones entre navegadores envían contenido deliberadamente al elegido.
- **Política.** La mayoría hereda destinos de plataforma. Los recibos añaden Frankfurter y compartir y cámara añaden el servidor de encuentro. Se limitan destinos, no se demuestra cada carga.
- **Código.** El [código es público](https://github.com/A-Box-of-Tools/website). Compila y compara el resultado. Incluye módulos compartidos y motores empaquetados.

La [página de privacidad](https://abox.tools/es/privacidad/) describe los límites: [importaciones de URL](https://abox.tools/es/imagenes-a-video/), [cambio opcional y entrega a aplicaciones](https://abox.tools/es/extraer-recibos-facturas/), [compartir entre navegadores](https://abox.tools/es/compartir-texto/) y [cámara remota](https://abox.tools/es/remote-camera/), además de anuncios, Analytics y comentarios fijos. Transferir deliberadamente es distinto de subir para procesar.

Ejemplos locales: [comprimir hacia un tamaño objetivo](https://abox.tools/es/comprimir-imagen/), [recortar vídeo](https://abox.tools/es/recortar-video/), [borrar EXIF y GPS](https://abox.tools/es/eliminar-datos-exif/) y [crear PDF con imágenes](https://abox.tools/es/imagenes-a-pdf/). Revisa formatos y resultado. Estas tareas no necesitan subir para procesar ni cuenta.

![Panel de privacidad con procesamiento local, referencias al código y resumen en directo de los recursos cargados.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

El panel muestra la afirmación y el código que la respalda. Su resumen ayuda a revisar las solicitudes del navegador, pero no inspecciona por sí mismo las cargas.
