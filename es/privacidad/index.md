# Privacidad y cookies

La versión corta es que tus archivos no se suben nunca, porque no hay ningún sitio al que subirlos. Todo lo demás de esta página va de la publicidad, del contador de visitas y del alojamiento, que son las partes en las que sí intervienen otras empresas.

Última actualización 3 de septiembre de 2026

## Tus archivos

Todas las herramientas de este sitio hacen su trabajo dentro de tu propio navegador, en tu propio hardware. Cuando eliges un archivo, lo lee la página que ya tienes abierta. No se nos envía, porque no hay ningún servidor nuestro al que enviarlo: este sitio es un conjunto de archivos estáticos, sin backend, sin base de datos y sin almacenamiento.

Eso significa que nunca recibimos, vemos, guardamos, registramos ni procesamos:

- tus archivos, ni enteros ni en parte
- miniaturas o vistas previas de ellos
- sus nombres, tamaños, dimensiones o formatos
- cuántos elegiste, ni qué hiciste con ellos
- nada leído de dentro de ellos, incluidos los datos EXIF y GPS

Esto no es una promesa sobre nuestras intenciones. Cada página lleva una `Content-Security-Policy` que enumera todas las direcciones a las que la página tiene permitido conectarse, y quien la hace cumplir es el navegador. Ninguna de esas direcciones es nuestra. Puedes leer la política al principio del código fuente de cualquier página, o abrir la pestaña Red del navegador y comprobarlo: ninguna petición lleva tu archivo.

Los archivos que produces con una herramienta pasan al mecanismo de descargas de tu propio navegador y se guardan donde tú le digas. En ese paso tampoco intervenimos.

## La única excepción, y dónde se aplica

La herramienta [Imágenes a vídeo](https://abox.tools/es/imagenes-a-video/) tiene una función de «añadir desde una dirección web». Si pegas una dirección en ella, tu navegador descarga esa imagen del servidor que hayas nombrado, y **ese servidor ve tu dirección IP** y qué archivo has pedido. Eso es inevitable, y es la naturaleza misma de la función.

Solo ocurre con las direcciones que tecleas tú, está construida de modo que las imágenes puedan entrar pero los datos no puedan salir, y la página de esa herramienta lo explica con más detalle. Ninguna otra herramienta de este sitio puede hacer una petición hacia fuera que lleve algo tuyo dentro.

## Qué se recoge y quién lo recoge

Este sitio es gratuito y lo paga la publicidad. Eso significa que en estas páginas funcionan dos productos de Google, y en casi todas ellas un botón de donación. Esta es la lista entera.

### Google AdSense — los anuncios

Google sirve los anuncios y decide cuáles ves. Para eso puede poner y leer cookies o identificadores similares en tu navegador, y recibe tu dirección IP, una ubicación aproximada derivada de ella, tu agente de usuario y en qué página estabas. Según cuáles sean tus ajustes y dónde estés, los anuncios pueden personalizarse usando un perfil que Google tiene sobre ti, construido en gran medida a partir de tu actividad en otros sitios.

Nosotros no recibimos nada de eso, no podemos verlo, y nunca le enviamos a Google nada sobre tus archivos. La explicación del propio Google sobre cómo usa los datos de los sitios que llevan su publicidad está en [policies.google.com/technologies/partner-sites](https://policies.google.com/technologies/partner-sites).

### Google Analytics — el contador de visitas

Usamos Google Analytics 4 para contar visitas a las páginas, y así saber en qué herramientas merece la pena trabajar. Registra la página que viste, más o menos cuándo, un identificador generado al azar y guardado en tu navegador, una ubicación aproximada, tu tipo de dispositivo y navegador, y el sitio que te trajo hasta aquí.

Está configurado para no hacer nada más, y la configuración es un archivo que puedes leer: el `analytics.js` que hay junto a cada página monta un contador de páginas vistas y no contiene ningún evento propio. En este sitio no hay nada que le pase un archivo, un nombre de archivo, una dimensión o un recuento, porque aquí no hay código capaz de hacerlo.

### Buy Me a Coffee — el botón de donación

La página principal y las páginas de las herramientas llevan un botón de donación, que se carga desde los servidores de Buy Me a Coffee. Cargarlo significa que su CDN ve tu dirección IP y que estabas en este sitio, y las letras del botón se traen de Google Fonts, que también ve tu dirección IP. No se envía nada más, y no pasa nada más a menos que lo pulses de verdad, momento en el cual estás en su sitio y bajo sus políticas. Esta página y la [página de condiciones](https://abox.tools/es/terminos/) no dibujan el botón.

### Alojamiento

El sitio lo sirve GitHub Pages, detrás de Cloudflare. Como cualquier alojamiento web, procesan las peticiones que hace tu navegador, lo que incluye tu dirección IP, la página pedida y tu agente de usuario, para entregar la página y mantener el servicio en pie y seguro. No tenemos acceso a los registros por visitante de ninguno de los dos.

### El intermediario de la herramienta de compartir

Una herramienta, [Compartir texto y archivos](https://abox.tools/es/compartir-texto/), lleva texto y archivos directamente de un navegador a otro, y una conexión directa necesita una presentación. Por eso esa página, la única del sitio, abre un WebSocket a un pequeño servidor nuestro, que junta los dos extremos de un nombre de enlace y les pasa el establecimiento de la conexión. Nunca ve el texto ni los archivos; viajan por la conexión cifrada que él presentó. Sí ve el nombre de enlace, cuándo se conecta y se va cada lado, y sus direcciones IP, y Cloudflare, que lo ejecuta, guarda un registro de cada conexión durante siete días. Es el único registro por visitante de este sitio que podemos leer. La propia página de la herramienta lo describe por completo, y su código entero está en el repositorio.

## Cookies

No ponemos ninguna cookie propia. No hay inicio de sesión ni sesión, y solo hay una preferencia que lleguemos a recordar.

**El idioma que elijas.** Si eliges un idioma en el selector, esa elección se guarda en el almacenamiento local de tu navegador, con el nombre `abox-lang`, para que la siguiente página que abras salga en el idioma que pediste. No es una cookie: no se envía nunca ni a nosotros ni a nadie más, se queda en el dispositivo desde el que estás leyendo esto, y se borra al borrar los datos de sitio del navegador. Si no eliges ningún idioma, no se escribe nada en absoluto: una página que se te muestre en el idioma de tu propio navegador se resolvió en ese momento y se olvidó acto seguido.

Cualquier cookie o identificador similar que encuentres aquí es de Google y lo ponen los scripts de publicidad y analítica descritos arriba. Se usan para medir visitas y para seleccionar y limitar anuncios.

### Cómo desactivarlo

- La personalización de anuncios se puede desactivar, para todos los sitios a la vez, en [Mi centro de anuncios](https://myadcenter.google.com/).
- Google Analytics se puede bloquear en todas partes con el [complemento de inhabilitación](https://tools.google.com/dlpage/gaoptout) del propio Google.
- Los ajustes de tu propio navegador pueden bloquear o borrar las cookies de terceros, y cualquier bloqueador de contenido impedirá que estos scripts lleguen a cargarse.

Que lo bloquees todo nos parece bien. **Todas las herramientas de este sitio funcionan con los scripts bloqueados, y funcionan con la red desconectada del todo.** Aquí no hay nada retenido detrás de un anuncio.

## Tus derechos sobre los datos

No tenemos ningún dato personal tuyo, así que no hay nada que podamos enseñarte, corregir, exportar ni borrar. Una solicitud dirigida a nosotros volvería vacía, dicho con toda honestidad.

Los datos descritos arriba los tiene Google, que actúa como responsable de ellos por su cuenta. Las solicitudes sobre ellos hay que dirigirlas a Google, a través de [tu cuenta de Google](https://myaccount.google.com/) o de sus contactos de privacidad.

## Menores

Este sitio no está dirigido a menores y no le pregunta a nadie su edad, porque no le pide nada a nadie. No recogemos a sabiendas ningún dato personal de nadie, tenga la edad que tenga.

## Cambios y cómo contactar

Si esta página cambia, la fecha de arriba cambia con ella, y la edición queda en el historial público de commits junto con todo lo demás.

Las preguntas sobre cualquiera de estas cosas pueden ir a [hi@abox.tools](mailto:hi@abox.tools), o plantearse como una incidencia en [el repositorio](https://github.com/A-Box-of-Tools/website), donde la respuesta la ve todo el que se estuviera preguntando lo mismo.
