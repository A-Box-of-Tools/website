# Sobre abox.tools

Una sola persona, en Ontario, construyendo las herramientas que necesitaba una y otra vez y en las que no terminaba de confiar. Todo lo de aquí funciona en tu propio dispositivo, el código es público, y esta página explica el porqué de ambas cosas.

Última actualización 15 de octubre de 2026

## Qué es esto

abox.tools es una colección de herramientas pequeñas que hacen una sola cosa cada una: cambiar el tamaño de una foto, recortar un vídeo, unir dos PDF, leer lo que de verdad contiene un código QR. Ahora mismo hay 59, y también una [colección de guías](https://abox.tools/es/guias/) sobre las tareas para las que sirven.

Cada herramienta procesa los archivos en el navegador que la ejecuta, con el hardware de ese dispositivo. La mayoría usa los códecs del navegador; otras incluyen motores locales de JavaScript o WebAssembly, como el decodificador HEIC y el OCR de recibos. No se suben archivos para procesarlos. El sitio sirve páginas y código estáticos; el uso deliberado de la red y las funciones opcionales tienen límites propios, explicados más abajo.

Eso es el producto. Todo lo demás de esta página explica por qué merece la pena construirlo así y quién está detrás.

## Quién lo hace

Una persona, sola, en Ontario, Canadá. Esto no es una empresa. No hay equipo, ni inversores, ni una matriz detrás, ni ningún plan de que alguien lo compre. El correo va a [hi@abox.tools](mailto:hi@abox.tools) y lo lee quien escribió el código. En la [página de contacto](https://abox.tools/es/contacto/) se explica para qué sirve ese correo y para qué no.

El sitio se publica a propósito sin una firma personal. Es un proyecto pequeño, no una marca personal, y aquí lo que merece confianza no es un nombre al pie de una página, sino [el código](https://github.com/A-Box-of-Tools/website), que cualquiera puede leer, y el comportamiento de las páginas, que cualquiera puede comprobar en unos treinta segundos con las herramientas de desarrollo abiertas. Esas dos cosas se verifican. Una firma no.

## Por qué está hecho así

Muchos convertidores suben el archivo, lo procesan en un servidor y devuelven el resultado. Otros trabajan localmente. Lo útil es distinguir dónde se hace el trabajo y si exige que el archivo salga del navegador.

Procesar en servidor entrega una copia al proveedor. Para un pasaporte, imagen médica, contrato firmado o foto con ubicación, conviene revisar esa decisión. Políticas públicas, documentación de seguridad, auditorías y comportamiento observable aportan evidencia. La página sola no muestra cada copia interna, respaldo o acceso tras subir. Una política describe el manejo del proveedor; no es la misma restricción que terminar una operación local sin conexión.

Los navegadores han mejorado hasta hacer innecesaria esa promesa. Saben leer y escribir JPEG, PNG y WebP; saben abrir y decodificar vídeo; saben calcular el hash de un archivo, leer un código QR y escribir un PDF. Si el trabajo puede hacerse en tu propio equipo, entonces la pregunta «¿se quedarán con mi archivo?» deja de ser una pregunta sobre las intenciones de nadie y pasa a ser una pregunta sobre qué puede hacer el código físicamente. Y esa sí puedes responderla tú.

Ese es el argumento completo, y hay una guía que lo desarrolla como es debido: [¿es seguro subir archivos a una web?](https://abox.tools/es/guias/es-seguro-subir-archivos/)

## Comprobar, en lugar de confiar

Cuatro comprobaciones ofrecen pruebas distintas. Úsalas juntas y comprueba la función concreta que vas a utilizar:

- **Desconecta para una tarea local.** Deja que la herramienta cargue y espera a que indique que está lista sin conexión. Procesa un archivo de tu dispositivo. Terminar demuestra que esa operación fue local mientras estabas desconectado, pero no qué podría enviarse al reconectar.
- **Examina las solicitudes de red.** Revisa URL, cuerpos de solicitud y mensajes WebSocket; no te bases solo en el tamaño. El procesamiento local no envía tus archivos. Los recursos, los scripts de plataforma, las consultas opcionales y los envíos deliberados son tráfico diferente que se explica en sus páginas.
- **Lee la Content-Security-Policy.** Limita recursos y destinos de conexión. No inspecciona el contenido, no impide enviar datos a destinos permitidos ni describe el tráfico WebRTC entre navegadores. Compárala con el código y el comportamiento observado.
- **Lee el código y el resultado compilado.** El [repositorio](https://github.com/A-Box-of-Tools/website) contiene plantillas, módulos, partes compartidas y motores incluidos. La compilación genera páginas y minifica el código propio. Cada herramienta indica qué leer primero; puedes compilar y comparar con lo publicado.

Las funciones de red son deliberadas. [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/) puede obtener una URL de imagen. El [Extractor de recibos y facturas](https://abox.tools/es/extraer-recibos-facturas/) puede consultar un par de monedas y una fecha a Frankfurter y entregar el informe a tu aplicación de correo o de compartir. [Compartir texto y archivos](https://abox.tools/es/compartir-texto/), [Compartir una pestaña del navegador](https://abox.tools/es/share-tab/), [Cámara remota](https://abox.tools/es/remote-camera/) y las herramientas de voz en directo transfieren contenido entre navegadores. Los servicios de emparejamiento en línea transportan metadatos de descubrimiento, cuando se ofrece, y de conexión, nunca el contenido compartido. Estas herramientas necesitan internet para el emparejamiento. Cada herramienta explica su ruta directa o de retransmisión opcional y las conexiones necesarias; su página y la [página de privacidad](https://abox.tools/es/privacidad/) explican qué ve cada participante.

## Cómo se construyen y se comprueban las herramientas

Una herramienta se publica cuando funciona con archivos reales, no cuando funciona con el archivo contra el que se escribió. En la práctica eso significa manejarla a mano en un navegador con entradas incómodas: el vídeo sin fotograma clave justo donde quieres cortar, el HEIC de un teléfono que escribe el contenedor un poco mal, el PDF con una fuente incrustada solo en parte. Eso es lo que la gente tiene de verdad, y es justo lo que no encuentra una prueba escrita por la misma persona que escribió el fallo.

Una batería automática cubre el generador y los módulos del navegador. Se ejecuta en CI y un fallo detiene la publicación. Los analizadores y escritores comunes, como el lector MP4, viven en módulos compartidos que se copian a cada herramienta compilada. Una comprobación de duplicados impide mantener copias independientes que diverjan.

Las guías se escriben con el mismo criterio. Sus capturas las toma un script del sitio ya construido, en lugar de dibujarlas o simularlas, así que una imagen de una guía es una imagen de la página tal y como está hoy.

## Cómo se paga esto

Con publicidad y con donaciones de quienes encuentran útiles las herramientas. Ese es todo el modelo de negocio, y conviene ser preciso sobre qué implica y qué no.

**No hay nada que comprar.** Sin cuenta, nivel de pago, marca de agua de pago ni funciones reservadas. Sí importan los formatos compatibles, la memoria del navegador y los límites deliberados; cada herramienta los explica.

**Tus archivos no forman parte del trato.** La publicidad y el recuento de visitas usan servicios de Google. Los comentarios voluntarios envían el nombre de la herramienta, una respuesta fija positiva o negativa y un motivo fijo; nunca el archivo, su nombre, tamaño o contenido. El código no entrega datos de archivos a esos servicios. Los destinos permitidos siguen siendo destinos de red: la política de seguridad por sí sola no garantiza el contenido. La [página de privacidad](https://abox.tools/es/privacidad/) describe la recogida y el bloqueo. El procesamiento local funciona con esos scripts bloqueados.

**Las herramientas no se escriben para la publicidad.** Ninguna existe porque una palabra clave valiera dinero, y ninguna se ha hecho más lenta, más engorrosa o más larga para vender más impresiones. Qué se construye después se discute a la vista de todos, en [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), un párrafo por idea, incluidas las razones por las que varias propuestas aparentemente obvias se han rechazado.

## Idiomas

Aquí se mantienen el inglés, chino simplificado, alemán, español, portugués de Brasil, francés y japonés. Ocho traducciones anteriores siguen disponibles como páginas archivadas y no reciben los cambios actuales. Las páginas mantenidas solo aparecen en el mapa del sitio y en el selector cuando están traducidas; las incompletas siguen disponibles sin presentarse como traducciones terminadas.

El correo se responde en inglés, que es lo único honesto que puede decirse de un proyecto de este tamaño.

## Lo que este sitio no va a hacer

- Exigir una cuenta o un correo para procesar un archivo.
- Recibir o conservar archivos en un servidor para procesarlos.
- Poner una marca de agua en un resultado ni reservar una función para un plan de pago.
- Añadir un paso de red a una herramienta que no lo necesita.
- Afirmar en la página de una herramienta algo que el código del repositorio no hace.

Si ves que ocurre cualquiera de esas cosas, es a la vez un fallo y una promesa rota, y merece la pena avisar. La [página de contacto](https://abox.tools/es/contacto/) es la vía más rápida.
