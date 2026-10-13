# Privacidad y cookies

Los archivos se procesan localmente. Compartir y las funciones opcionales de red tienen límites propios. Aquí se explican, junto a anuncios, comentarios, almacenamiento y alojamiento.

Última actualización 12 de octubre de 2026

## Tus archivos

Los archivos elegidos se leen, editan y escriben en el navegador de tu dispositivo. abox.tools no tiene un destino para subir archivos y procesarlos ni una base de datos de ellos. Las descargas se preparan localmente. Compartir, ver una cámara remota y entregar un informe de recibos a otra aplicación son transferencias deliberadas, explicadas abajo.

El procesamiento local no nos entrega:

- tus archivos ni sus vistas previas
- sus nombres, tamaños, dimensiones ni formatos
- su contenido, incluidos EXIF, GPS y texto reconocido

Cada página lleva una `Content-Security-Policy` que limita recursos y destinos. Algunas añaden el servidor de encuentro o la API opcional de cambio. La política no examina los datos enviados a un destino permitido y `connect-src` no describe el tráfico WebRTC entre navegadores. Léela junto al código y observa la función utilizada; la lista de servidores no demuestra el contenido de cada envío.

Los archivos que produces con una herramienta pasan al mecanismo de descargas de tu propio navegador y se guardan donde tú le digas. En ese paso tampoco intervenimos.

## Funciones que usan una conexión deliberadamente

[Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/) puede obtener una imagen de una dirección que indiques. Ese servidor recibe tu IP y la URL solicitada, incluidos los parámetros. La imagen se guarda en memoria local y se vuelve a codificar para procesarla. La solicitud no envía archivos elegidos en tu dispositivo.

El [Extractor de recibos y facturas](https://abox.tools/es/extraer-recibos-facturas/) lee fotos y reconoce texto localmente. Su botón opcional de cambio histórico solicita un par de monedas y la fecha elegida a [Frankfurter](https://frankfurter.dev/). Puede ser la fecha impresa en el recibo. El proveedor ve tu IP y la solicitud; no se envían credenciales ni referencia de origen, foto, nombre, comercio, importe o correo. Los cambios manuales no hacen solicitudes.

Los botones de correo y compartir preparan informes y copias JPEG localmente; después descargan un archivo de correo o los entregan a la aplicación elegida. Esta página no envía correos. La aplicación, proveedor y destinatario que elijas realizan el siguiente paso con sus políticas. [Compartir texto y archivos](https://abox.tools/es/compartir-texto/) y [Cámara remota](https://abox.tools/es/remote-camera/) envían contenido a otro navegador de forma deliberada; sus metadatos se describen abajo.

## Qué se recoge y quién lo recoge

Este sitio es gratuito y lo paga la publicidad. Eso significa que en estas páginas funcionan dos productos de Google, y en casi todas ellas un botón de donación. Esta es la lista entera.

### Google AdSense — los anuncios

Google sirve los anuncios y decide cuáles ves. Para eso puede poner y leer cookies o identificadores similares en tu navegador, y recibe tu dirección IP, una ubicación aproximada derivada de ella, tu agente de usuario y en qué página estabas. Según cuáles sean tus ajustes y dónde estés, los anuncios pueden personalizarse usando un perfil que Google tiene sobre ti, construido en gran medida a partir de tu actividad en otros sitios.

Nosotros no recibimos nada de eso, no podemos verlo, y nunca le enviamos a Google nada sobre tus archivos. La explicación del propio Google sobre cómo usa los datos de los sitios que llevan su publicidad está en [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — el contador de visitas

Usamos Google Analytics 4 para contar visitas a las páginas, y así saber en qué herramientas merece la pena trabajar. Registra la página que viste, más o menos cuándo, un identificador generado al azar y guardado en tu navegador, una ubicación aproximada, tu tipo de dispositivo y navegador, y el sitio que te trajo hasta aquí.

`analytics.js` configura las visitas. Tras responder voluntariamente, `feedback.js` envía también un evento `tool_feedback`: identificador de herramienta, voto fijo positivo o negativo y motivo fijo. No hay texto libre ni archivo, nombre, tamaño, dimensión, cantidad, formato o contenido en el evento. Podemos ver informes agregados de Analytics. Bloquearlo deja disponible el procesamiento local.

### Buy Me a Coffee — el botón de donación

La página principal y las páginas de las herramientas llevan un botón de donación, que se carga desde los servidores de Buy Me a Coffee. Cargarlo significa que su CDN ve tu dirección IP y que estabas en este sitio, y las letras del botón se traen de Google Fonts, que también ve tu dirección IP. No se envía nada más, y no pasa nada más a menos que lo pulses de verdad, momento en el cual estás en su sitio y bajo sus políticas. Esta página y la [página de condiciones](https://abox.tools/es/terminos/) no dibujan el botón.

### Alojamiento

El sitio lo sirve GitHub Pages, detrás de Cloudflare. Como cualquier alojamiento web, procesan las peticiones que hace tu navegador, lo que incluye tu dirección IP, la página pedida y tu agente de usuario, para entregar la página y mantener el servicio en pie y seguro. No tenemos acceso a los registros por visitante de ninguno de los dos.

### Cámara remota y presentación entre navegadores

[Cámara remota](https://abox.tools/es/remote-camera/) abre una conexión WebSocket de descubrimiento al cargar su página. Iniciar cámara, Conectar o seleccionar una cámara en línea añade una conexión de sala a nuestro servicio de intermediación. Seleccionar un nombre de la lista solicita una conexión de inmediato e intercambia direcciones de red. Al abrir un enlace para ver la cámara, la página sigue esperando a que se pulse Conectar. La aprobación de los espectadores por parte del anfitrión está activada de forma predeterminada y controla la transmisión de vídeo, no el intercambio de direcciones de red. El servidor ve códigos, direcciones, tiempos y mensajes de configuración, nunca vídeo ni notas del espectador. El vídeo usa una conexión directa cifrada, sin STUN ni TURN configurados, micrófono ni grabación. Internet sigue siendo necesario para la presentación. VPN y políticas del sistema pueden afectar la ruta; el modo local no demuestra un límite físico de red. La página explica estas limitaciones y cómo los scripts pueden leer la dirección completa del enlace.

### Compartir texto y archivos y el servidor de encuentro

[Compartir texto y archivos](https://abox.tools/es/compartir-texto/) abre una conexión de descubrimiento en su inicio y otra al compartir. Agrupa nombres por IPv4 pública o subred IPv6 y origen de página; es una ayuda para encontrar, no una prueba de la misma red física. El servidor ve nombres, IP, tiempos y mensajes de negociación, nunca texto ni archivos compartidos. Los nombres anunciados viven en conexiones abiertas sin almacenamiento permanente. El modo normal usa STUN públicos de Google y Cloudflare. Un lector puede elegir reintentar mediante TURN de Cloudflare, que retransmite tráfico cifrado sin las claves. El modo local omite STUN y TURN, pero sigue necesitando el servidor público. Cloudflare conserva metadatos de conexión de compartir y cámara siete días; son registros por visitante que podemos leer. Lo copiado o descargado por un destinatario sigue siendo suyo al cerrar la pestaña de origen.

## Cookies

No ponemos cookies de acceso ni sesión. Los scripts de Google pueden usar las cookies e identificadores descritos. El sitio también usa almacenamiento local para preferencias y trabajo temporal.

**El idioma que elijas.** Si eliges un idioma en el selector, esa elección se guarda en el almacenamiento local de tu navegador, con el nombre `abox-lang`, para que la siguiente página que abras salga en el idioma que pediste. No es una cookie: no se envía nunca ni a nosotros ni a nadie más, se queda en el dispositivo desde el que estás leyendo esto, y se borra al borrar los datos de sitio del navegador. Si no eliges ningún idioma, no se escribe nada en absoluto: una página que se te muestre en el idioma de tu propio navegador se resolvió en ese momento y se olvidó acto seguido.

**Otro almacenamiento local.** Los comentarios guardan la fecha de respuesta o cierre para no volver a preguntar. Las herramientas pueden guardar ajustes o un borrador opcional de lo compartido. Cambiar de idioma o continuar expresamente en otra herramienta puede guardar archivos y ajustes temporalmente en IndexedDB. No son cookies ni se nos envían; borrar los datos del sitio los elimina. La herramienta correspondiente explica los borradores persistentes.

Las cookies e identificadores de Google miden visitas y seleccionan y limitan anuncios. Son distintos de los registros locales del sitio descritos arriba.

### Cómo desactivarlo

- La personalización de anuncios se puede desactivar, para todos los sitios a la vez, en [Mi centro de anuncios](https://myadcenter.google.com/).
- Google Analytics se puede bloquear en todas partes con el [complemento de inhabilitación](https://tools.google.com/dlpage/gaoptout) del propio Google.
- Los ajustes de tu propio navegador pueden bloquear o borrar las cookies de terceros, y cualquier bloqueador de contenido impedirá que estos scripts lleguen a cargarse.

Bloquear anuncios, Analytics y el botón de donaciones deja disponible el procesamiento local. Con la caché preparada, funciona desconectado. Importar imágenes web, consultar cambios, presentar navegadores y enviar desde otra aplicación necesitan sus conexiones respectivas. Ninguna función de procesamiento se reserva detrás de un anuncio.

## Tus derechos sobre los datos

No conservamos tus archivos procesados. Los informes de Analytics y los metadatos de conexión descritos son otros datos. Puedes dirigir preguntas o solicitudes sobre su tratamiento a [hi@abox.tools](mailto:hi@abox.tools); indica la página y fecha aproximada, sin adjuntar un archivo privado.

Para datos de tu cuenta Google, usa [sus controles](https://myaccount.google.com/) o sus contactos de privacidad. Los proveedores opcionales de cambio, donación y correo gestionan sus servicios y solicitudes.

## Menores

El sitio no está dirigido a niños y no solicita edad ni cuenta de usuario. La información automática de páginas y conexiones descrita se aplica a visitantes de cualquier edad.

## Cambios y cómo contactar

Si esta página cambia, la fecha de arriba cambia con ella, y la edición queda en el historial público de commits junto con todo lo demás.

Las preguntas sobre cualquiera de estas cosas pueden ir a [hi@abox.tools](mailto:hi@abox.tools), o plantearse como una incidencia en [el repositorio](https://github.com/A-Box-of-Tools/website), donde la respuesta la ve todo el que se estuviera preguntando lo mismo.
