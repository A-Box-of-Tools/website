# Privacidad y cookies

Los archivos se procesan localmente. Compartir y las funciones opcionales de red tienen límites propios. Aquí se explican, junto a anuncios, medición del uso, comentarios voluntarios, almacenamiento y alojamiento.

Última actualización 5 de noviembre de 2026

## Tus archivos

Los archivos elegidos se leen, editan y escriben en el navegador de tu dispositivo. abox.tools no tiene un destino para subir archivos y procesarlos ni una base de datos de ellos. Las descargas se preparan localmente. Compartir, ver una cámara remota y entregar un informe de recibos a otra aplicación son transferencias deliberadas, explicadas abajo.

El procesamiento local no nos entrega:

- tus archivos ni sus vistas previas
- sus nombres, tamaños, dimensiones ni formatos
- su contenido, incluidos EXIF, GPS y texto reconocido

Cada página lleva una `Content-Security-Policy` que limita recursos y destinos. Algunas añaden el servidor de encuentro o la API opcional de cambio. La política no examina los datos enviados a un destino permitido y `connect-src` no describe el tráfico WebRTC entre navegadores. Léela junto al código y observa la función utilizada; la lista de servidores no demuestra el contenido de cada envío.

Los archivos que produces con una herramienta pasan al mecanismo de descargas de tu propio navegador y se guardan donde tú le digas. En ese paso tampoco intervenimos.

## Comentarios que decides enviar

El [formulario de comentarios y el punto de acceso para agentes](https://feedback.abox.tools/), independientes del resto del sitio, aceptan mensajes sin iniciar sesión ni dar una dirección de correo. Al enviar, el mensaje y los datos opcionales de página, agente o navegador y la dirección de respuesta pasan por Cloudflare hasta la bandeja de entrada de quien mantiene el sitio. Es un mensaje deliberado, distinto de los archivos procesados en una herramienta y de los votos fijos de opinión que se describen más abajo.

El servicio solo acepta texto, nunca adjuntos, y no abre los enlaces enviados. Los correos muestran por separado el tipo de remitente autodeclarado y el formato de envío; ninguno de los dos verifica la identidad de una persona o de un agente. La dirección de conexión se usa para los límites de la plataforma y para un identificador de red con clave, sin añadir la dirección al informe. Un registro privado contra abusos guarda identificadores con clave de red, mensaje y página, horas de los intentos, estado de entrega y comprobantes, pero no el texto del mensaje, direcciones de página, direcciones de respuesta, datos del entorno ni direcciones IP sin procesar. Los registros de informes caducan a las 24 horas; los de red, tras un día sin actividad. Los registros caducados y las horas de intentos antiguos se eliminan cada hora. Cloudflare puede conservar copias de seguridad del servicio subyacente según sus propias políticas.

Cloudflare y el proveedor de correo gestionan los metadatos de conexión y entrega. El registro del cuerpo de las solicitudes está desactivado en la aplicación. Los informes reales permanecen en la bandeja de entrada para atenderlos y darles seguimiento; la dirección de respuesta opcional sirve para contestar el mensaje. La supresión de duplicados, un tiempo de espera por red y unos límites móviles por red y globales reducen los correos repetidos. No incluyas archivos privados, credenciales ni transcripciones de conversaciones.

## Funciones que usan una conexión deliberadamente

[Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/) puede obtener una imagen de una dirección que indiques. Ese servidor recibe tu IP y la URL solicitada, incluidos los parámetros. La imagen se guarda en memoria local y se vuelve a codificar para procesarla. La solicitud no envía archivos elegidos en tu dispositivo.

El [Extractor de recibos y facturas](https://abox.tools/es/extraer-recibos-facturas/) lee fotos y reconoce texto localmente. Su botón opcional de cambio histórico solicita un par de monedas y la fecha elegida a [Frankfurter](https://frankfurter.dev/). Puede ser la fecha impresa en el recibo. El proveedor ve tu IP y la solicitud; no se envían credenciales ni referencia de origen, foto, nombre, comercio, importe o correo. Los cambios manuales no hacen solicitudes.

Los botones de correo y compartir preparan informes y copias JPEG localmente; después descargan un archivo de correo o los entregan a la aplicación elegida. Esta página no envía correos. La aplicación, proveedor y destinatario que elijas realizan el siguiente paso con sus políticas. [Compartir texto y archivos](https://abox.tools/es/compartir-texto/), [Compartir una pestaña del navegador](https://abox.tools/es/share-tab/) y [Cámara remota](https://abox.tools/es/remote-camera/) envían contenido a otro navegador de forma deliberada; sus metadatos se describen abajo.

### Catálogo público de herramientas para agentes (MCP y A2A)

Los clientes MCP y A2A envían palabras clave públicas sobre la tarea o el formato, el idioma del catálogo y un límite de resultados a un Cloudflare Worker en `mcp.abox.tools`. Los servicios de catálogo devuelven descripciones y enlaces públicos de herramientas. No aceptan archivos, no ofrecen un destino para subirlos y no requieren una cuenta. No envíes palabras clave privadas, nombres de archivo, contenido de archivos ni contraseñas.

Filtrar dentro del catálogo interactivo ya cargado se hace localmente, sin otra solicitud al catálogo. Al abrir un resultado, se pide al entorno que abra el sitio de esa herramienta, donde eliges y procesas los archivos en el navegador. El proveedor del entorno del agente o de la aplicación trata tus solicitudes y el historial de conversación según su propia política. El servicio recibe lo que el entorno envía en la solicitud al catálogo. No solicita ni recupera el historial de conversación de ese entorno.

La aplicación no registra consultas ni cuerpos de solicitudes y no tiene base de datos ni tareas persistentes. La observabilidad del Worker está desactivada. Cloudflare sigue tratando direcciones IP, tiempos y metadatos de las solicitudes para el alojamiento, la seguridad y los controles de frecuencia. Cloudflare determina la conservación de esos metadatos gestionados por el proveedor. No hemos verificado un plazo fijo de conservación para este servicio. Si no usas el catálogo remoto, el sitio habitual y el procesamiento local siguen disponibles.

## Qué se recoge y quién lo recoge

Este sitio es gratuito y lo paga la publicidad. Eso significa que en estas páginas funcionan dos productos de Google. Esta es la lista entera.

### Google AdSense — los anuncios

Google sirve los anuncios y decide cuáles ves. Para eso puede poner y leer cookies o identificadores similares en tu navegador, y recibe tu dirección IP, una ubicación aproximada derivada de ella, tu agente de usuario y en qué página estabas. Según cuáles sean tus ajustes y dónde estés, los anuncios pueden personalizarse usando un perfil que Google tiene sobre ti, construido en gran medida a partir de tu actividad en otros sitios.

Nosotros no recibimos nada de eso, no podemos verlo, y nunca le enviamos a Google nada sobre tus archivos. La explicación del propio Google sobre cómo usa los datos de los sitios que llevan su publicidad está en [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — visitas y usos completados

Usamos Google Analytics 4 para contar visitas a las páginas y usos completados, y así saber en qué herramientas merece la pena trabajar. Registra la página que viste, el momento aproximado, un identificador generado al azar y guardado en tu navegador, una ubicación aproximada, tu tipo de dispositivo y navegador y las etiquetas habituales de atribución de campañas.

La dirección que recibe Analytics usa la URL canónica de la página y solo las etiquetas habituales de campaña. Se omiten los demás parámetros de consulta y los fragmentos de la dirección. El título de la página es fijo y del sitio de referencia solo se envía el origen, sin ruta ni consulta.

Contamos el primer uso completado por cada carga de página, por ejemplo, solicitar una descarga ya preparada, completar una copia o mostrar un análisis o una vista utilizable en una herramienta de inspección. El único dato específico de la herramienta que se añade al evento es su identificador fijo. No confirma que tu sistema operativo haya guardado una descarga.

También contamos la apertura de las páginas de herramientas. En Images to Video, Image Stacker, GIF Analyzer y GIF Splitter, eventos fijos registran la entrada, el inicio del procesamiento, un resultado listo, un problema o una cancelación, como máximo una vez por etapa y carga de página. Los ejemplos integrados se excluyen de esas etapas. Algunos enlaces de continuación solo comunican identificadores fijos de las páginas de origen y destino, nunca la dirección ni el texto del enlace. Estos recuentos ayudan a localizar dónde termina una visita; no identifican trabajos individuales ni confirman la llegada a la siguiente página.

Los comentarios voluntarios registran el identificador fijo de la herramienta, una respuesta fija positiva o negativa y un motivo fijo después de que elijas una respuesta. No hay texto libre. Las herramientas no adjuntan archivos, nombres, contenidos, texto introducido, cantidades, tamaños, dimensiones, formatos, ajustes, mensajes de error ni otros detalles de entrada o salida a ninguno de los dos registros. Podemos ver informes agregados de Analytics. Bloquearlo deja disponible el procesamiento local, también sin conexión cuando la caché de la herramienta esté lista.

### Buy Me a Coffee — el enlace de donación

La página principal y las páginas de las herramientas llevan un enlace de donación a Buy Me a Coffee. Este sitio dibuja el enlace por sí mismo, así que mostrarlo no carga nada de ellos ni de ningún servicio de tipografías, y ninguno de los dos ve tu visita. Solo saben de ti si lo pulsas, momento en el cual estás en su sitio y bajo sus políticas.

### Alojamiento

El sitio lo sirve GitHub Pages, detrás de Cloudflare. Como cualquier alojamiento web, procesan las peticiones que hace tu navegador, lo que incluye tu dirección IP, la página pedida y tu agente de usuario, para entregar la página y mantener el servicio en pie y seguro. No tenemos acceso a los registros por visitante de ninguno de los dos.

### Opciones de conexión para herramientas emparejadas

Las cinco herramientas de emparejamiento comienzan en Direct. El anfitrión puede elegir Cloud relay antes de empezar; la invitación lleva esa opción y la otra persona la ve antes de conectar. Direct nunca pasa automáticamente al relevo. Cloudflare TURN retransmite texto, archivos, vídeo, audio y mensajes de control cifrados sin sus claves de descifrado, pero ve direcciones, horarios y volumen de tráfico. Ambos dispositivos necesitan internet durante toda la sesión. Las credenciales temporales quedan en la memoria del navegador y se renuevan mediante el servicio de encuentro, sin publicarse en enlaces ni listas. La lista puede mostrar el modo elegido. La aprobación, la contraseña y los controles del micrófono siguen aplicándose.

Las cinco herramientas ofrecen conexiones disponibles en la red local o en un grupo privado. Un mismo código de grupo generado al azar permite descubrir sesiones desde redes diferentes. Cada herramienta tiene su propia lista y las sesiones de grupo no aparecen también en la lista de la red local. El código permite descubrir, no acceder: siguen aplicándose las contraseñas, la aprobación del anfitrión y la ruta de conexión elegida. El servicio recibe el código dentro de una conexión cifrada para comprobar la pertenencia al grupo y después solo conserva un identificador derivado y el resultado en conexiones abiertas. Las direcciones de las solicitudes y sus registros de metadatos de siete días contienen ese identificador, nunca el código. La página guarda el código solo en memoria, lo excluye de invitaciones e informes de conexión y lo olvida al recargar. Los scripts normales de la página pueden leer sus campos; un grupo privado no los aísla. Cualquier persona con el código puede descubrir las sesiones ofrecidas al grupo, así que compártelo solo con las personas previstas.

### Compartir una pestaña del navegador

[Compartir una pestaña del navegador](https://abox.tools/es/share-tab/) usa el selector de un navegador de escritorio para capturar una pestaña y enviar vídeo en directo a un espectador aprobado. El espectador solicita acceso, el anfitrión lo aprueba y el espectador lo confirma antes de enviar vídeo. No hay captura de audio, cámara o micrófono. La información visible en la pestaña elegida se comparte; el espectador puede grabar lo que recibe.

El descubrimiento cercano en línea está desactivado de forma predeterminada. El anfitrión puede activar Show in nearby shared tabs antes de empezar; el espectador elige expresamente Find nearby tabs para abrir la lista. La conexión de descubrimiento muestra solo el código aleatorio de invitación y la opción de conexión, nunca el título, dirección o imagen de la pestaña capturada ni la nota del espectador. Join junto a un resultado envía la solicitud por la ruta indicada. Sin un comprobante de aprobación válido, sigue siendo necesaria la aprobación. Un enlace copiado aún espera a Request to watch. El servicio agrupa las páginas de esta herramienta por dirección IPv4 pública o subred IPv6 /64 y origen del sitio web, no por ubicación física. Las puertas de enlace compartidas o VPN pueden incluir desconocidos u ocultar dispositivos cercanos. Las entradas existen en conexiones abiertas, sin historial almacenado, y detener la sesión retira la del anfitrión.

En Direct, el vídeo usa una conexión directa cifrada en una red accesible, sin STUN público ni TURN. Cloud relay usa la ruta de retransmisión cifrada descrita arriba. Ambos dispositivos necesitan internet para el descubrimiento y el emparejamiento. El servidor de encuentro ve códigos de sala, direcciones IP, horarios, descripciones WebRTC y candidatos de conexión, pero no vídeo, notas del espectador ni decisiones de aprobación. Cloudflare conserva registros de metadatos de conexión durante siete días.

Los scripts habituales de la página pueden leer su dirección y estado, incluido un código de invitación; un enlace por sí solo nunca da acceso al vídeo. El espectador no puede controlar al anfitrión ni seleccionar texto de la página. La herramienta no tiene grabación, pero el contenido visible de una sesión iniciada forma parte de la imagen y el espectador puede capturarlo o grabarlo por su cuenta. La página explica los límites de red; usar direcciones locales no demuestra un límite físico de red.

### Cámara remota y presentación entre navegadores

[Cámara remota](https://abox.tools/es/remote-camera/) abre una conexión WebSocket de descubrimiento al cargar su página. Iniciar cámara o Conectar añade una conexión de sala a nuestro servicio de intermediación. Join junto a una cámara solicita la conexión e intercambia direcciones de red por la ruta indicada. Al abrir un enlace para ver la cámara, la página sigue esperando a que se pulse Conectar. La aprobación de los espectadores por parte del anfitrión está activada de forma predeterminada y controla la transmisión de vídeo y audio, no el intercambio de direcciones de red. El servidor ve códigos, direcciones, tiempos y mensajes de configuración, nunca vídeo, audio ni notas del espectador. En Direct, el vídeo y el audio activado usan una conexión cifrada entre navegadores, sin STUN ni TURN configurados. Cloud relay usa la ruta de retransmisión cifrada descrita arriba. No hay función de grabación. El audio está desactivado de forma predeterminada; el anfitrión solo solicita acceso al micrófono al elegir compartir audio. Internet sigue siendo necesario para la presentación. VPN y políticas del sistema pueden afectar la ruta; el modo local no demuestra un límite físico de red. La página explica estas limitaciones y cómo los scripts pueden leer la dirección completa del enlace.

Las alertas opcionales analizan imágenes pequeñas y audio recibido en el dispositivo del espectador, sin grabaciones ni subidas. Activarlas solicita permiso para las notificaciones del navegador. El navegador y el sistema operativo muestran avisos genéricos sin imágenes, audio, nombre del enlace ni notas del espectador. Desconectar detiene el análisis y cierra las notificaciones de esta sesión. La página debe permanecer abierta; el navegador puede pausar el análisis en segundo plano o durante la suspensión.

### Walkie-talkie local

[Walkie-talkie local](https://abox.tools/es/walkie-talkie/) se aloja directamente en el sitio web, sin Python ni descargas. Al abrir la página se conecta de forma segura a nuestro servidor de encuentro para el descubrimiento cercano. Iniciar o unirse añade una conexión de canal para autenticación, configuración y comprobaciones de disponibilidad. Make this channel discoverable publica el nombre del canal y la invitación para oyentes a los navegadores agrupados por dirección IPv4 pública o subred IPv6 /64 y origen de la página. Las puertas de enlace compartidas pueden incluir desconocidos y las VPN pueden ocultar dispositivos cercanos; esto no es un escaneo físico de wifi. El anfitrión puede desactivar la opción antes de empezar para que las invitaciones circulen solo por enlace. Ocultar o terminar el canal retira la entrada. La voz en directo viaja del navegador del anfitrión a un máximo de diez navegadores que solo reciben, mediante WebRTC cifrado, de forma directa por defecto o a través del Cloud relay elegido expresamente; el servidor de encuentro no recibe audio ni escribe historial de salas. El estado temporal de la sala existe en conexiones abiertas. Cloudflare conserva durante siete días registros de metadatos de invocación que incluyen el identificador de sala, la dirección y la hora. Las claves del anfitrión y de los oyentes son distintas y viajan en el contenido de mensajes seguros, no en las URL de las solicitudes. Las invitaciones para oyentes llevan una clave en el fragmento. El estado de recuperación activo se guarda en el almacenamiento de sesión de cada pestaña; el navegador también conserva localmente una clave personal aleatoria para volver a la misma sesión. Los scripts habituales del sitio pueden leer su dirección y el almacenamiento del navegador; quitar un fragmento después de guardarlo no los aísla. Cualquiera con una invitación para oyentes y una ruta elegida que funcione puede solicitar unirse. Por defecto hace falta la aprobación del anfitrión antes de escuchar, y el anfitrión puede desactivarla. Los navegadores aprobados pueden volver a la misma sesión del anfitrión hasta que este la termine; no hay ningún control para retirar a un oyente. Direct no configura STUN ni TURN; Cloud relay usa TURN. No hay función de grabación. El emparejamiento necesita internet; las VPN y las rutas del sistema operativo pueden afectar la conexión directa, sin demostrar un límite físico de LAN. Un destinatario puede grabar el audio por su cuenta.

### Guardia de voz

[Guardia de voz](https://abox.tools/es/voice-oncall/) recibe en un navegador anfitrión flujos de audio cifrados e independientes de hasta diez participantes, de forma directa por defecto o a través del Cloud relay elegido expresamente. Su conexión de descubrimiento cercano muestra los pagers anunciados que comparten dirección IPv4 pública o subred IPv6 y origen de la página; es una pista, no un escaneo de LAN ni una prueba de pertenecer a la misma wifi física. El servicio ve nombres de pager, credenciales de admisión derivadas de la contraseña, estado de moderación y detalles de conexión, nunca la voz. Quien llama no necesita un nombre visible; el anfitrión ve en su lugar un identificador corto. Los clientes antiguos todavía pueden enviar un nombre visible. Una contraseña opcional y la aprobación del anfitrión controlan la admisión. La aprobación está activada por defecto; un navegador aprobado puede volver a la misma sesión del anfitrión salvo que se lo retire. La credencial de acceso derivada de la contraseña se calcula en el navegador y se envía dentro de la señalización segura, no en una URL. El anfitrión nunca concede acceso al micrófono; los participantes activan la transmisión deliberadamente con Talk. El silencio del anfitrión apaga localmente la reproducción de cada participante, y retirarlo bloquea su identidad de sesión guardada, no una identidad permanente de la persona. El estado de recuperación activo se guarda, cuando está disponible, en el almacenamiento de sesión de cada pestaña; también se conserva localmente una clave personal aleatoria para volver a la misma sesión. Los scripts normales del sitio pueden leer la dirección de la página y ambos tipos de almacenamiento. Los adjuntos de socket mantienen el estado temporal del pager sin historial almacenado, mientras que Cloudflare conserva durante siete días registros de metadatos de invocación. Direct no configura STUN ni TURN; Cloud relay usa TURN. No hay función de grabación. Se necesita internet para el descubrimiento y el emparejamiento, y la conexión directa sigue dependiendo de las rutas del navegador y de la red.

### Compartir texto y archivos y el servidor de encuentro

[Compartir texto y archivos](https://abox.tools/es/compartir-texto/) abre una conexión de descubrimiento en su inicio y otra al compartir. Agrupa nombres por IPv4 pública o subred IPv6 y origen de página; es una ayuda para encontrar, no una prueba de la misma red física. El servidor ve nombres, IP, tiempos y mensajes de negociación, nunca texto ni archivos compartidos. Los nombres anunciados viven en conexiones abiertas sin almacenamiento permanente. Direct normal usa STUN públicos de Google y Cloudflare, que ven la dirección de la solicitud. Red local limita Direct a direcciones de host sin STUN ni TURN. Cloud relay es una opción distinta que el anfitrión elige antes de compartir y el lector acepta antes de conectar. Todas las opciones necesitan el servidor público para establecer la conexión. Cloudflare conserva siete días los metadatos de conexión del servidor de encuentro para compartir, cámara y voz; son registros por visitante que podemos leer. Lo copiado o descargado por un destinatario sigue siendo suyo al cerrar la pestaña de origen.

## Cookies

No ponemos cookies de acceso ni sesión. Los scripts de Google pueden usar las cookies e identificadores descritos. El sitio también usa almacenamiento local para preferencias y trabajo temporal.

**Aprobaciones de conexión.** Las cinco herramientas guardan credenciales aleatorias de reconexión en el almacenamiento local para un número limitado de combinaciones recientes de herramienta, sala y ruta. No contienen contenido compartido, nombres ni direcciones IP. Compartir texto, Compartir una pestaña y Cámara remota presentan los comprobantes de aprobación solo por la conexión cifrada entre navegadores; las herramientas de voz envían su clave personal al servicio de presentación al unirse. La aprobación dura la sesión actual del anfitrión: desconectar la conserva, la expulsión la revoca y terminar o iniciar otra sesión la restablece. Borrar o bloquear el almacenamiento puede exigir otra aprobación. Los scripts de cualquier página de este origen web, incluidos los de terceros, pueden leer estas credenciales. No están aisladas de los scripts ni aparecen en invitaciones o listas de descubrimiento.

**El idioma que elijas.** Si eliges un idioma en el selector, esa elección se guarda en el almacenamiento local de tu navegador, con el nombre `abox-lang`, para que la siguiente página que abras salga en el idioma que pediste. No es una cookie: no se envía nunca ni a nosotros ni a nadie más, se queda en el dispositivo desde el que estás leyendo esto, y se borra al borrar los datos de sitio del navegador. Si no eliges ningún idioma, no se escribe nada en absoluto: una página que se te muestre en el idioma de tu propio navegador se resolvió en ese momento y se olvidó acto seguido.

**Otro almacenamiento local.** Los comentarios guardan la fecha de respuesta o cierre para no volver a preguntar. Las herramientas pueden guardar ajustes o un borrador opcional de lo compartido. Cambiar de idioma o continuar expresamente en otra herramienta puede guardar archivos y ajustes temporalmente en IndexedDB. No son cookies ni se nos envían; borrar los datos del sitio los elimina. La herramienta correspondiente explica los borradores persistentes.

Las cookies e identificadores de Google miden visitas y usos de las herramientas y seleccionan y limitan anuncios. Son distintos de los registros locales del sitio descritos arriba.

### Cómo desactivarlo

- La personalización de anuncios se puede desactivar, para todos los sitios a la vez, en [Mi centro de anuncios](https://myadcenter.google.com/).
- Google Analytics se puede bloquear en todas partes con el [complemento de inhabilitación](https://tools.google.com/dlpage/gaoptout) del propio Google.
- Los ajustes de tu propio navegador pueden bloquear o borrar las cookies de terceros, y cualquier bloqueador de contenido impedirá que estos scripts lleguen a cargarse.

Bloquear anuncios y Analytics deja disponible el procesamiento local. Con la caché preparada, funciona desconectado. Importar imágenes web, consultar cambios, presentar navegadores y enviar desde otra aplicación necesitan sus conexiones respectivas. Ninguna función de procesamiento se reserva detrás de un anuncio.

## Tus derechos sobre los datos

No conservamos tus archivos procesados. Los informes de Analytics y los metadatos de conexión descritos son otros datos. Puedes dirigir preguntas o solicitudes sobre su tratamiento a [hi@abox.tools](mailto:hi@abox.tools); indica la página y fecha aproximada, sin adjuntar un archivo privado.

Para datos de tu cuenta Google, usa [sus controles](https://myaccount.google.com/) o sus contactos de privacidad. Los proveedores opcionales de cambio, donación y correo gestionan sus servicios y solicitudes.

## Menores

El sitio no está dirigido a niños y no solicita edad ni cuenta de usuario. La información automática de páginas y conexiones descrita se aplica a visitantes de cualquier edad.

## Cambios y cómo contactar

Si esta página cambia, la fecha de arriba cambia con ella, y la edición queda en el historial público de commits junto con todo lo demás.

Las preguntas sobre cualquiera de estas cosas pueden ir a [hi@abox.tools](mailto:hi@abox.tools), o plantearse como una incidencia en [el repositorio](https://github.com/A-Box-of-Tools/website), donde la respuesta la ve todo el que se estuviera preguntando lo mismo.
