# Compartir texto y archivos — directo de tu navegador al suyo, sin subir nada

Lo compartido vive en esta pestaña abierta. Los lectores lo reciben cifrado, directamente desde tu navegador, y al cerrar la pestaña se acaba: ningún servidor guarda nada.

> Envía texto o archivos de un navegador a otro por una conexión directa y cifrada. Un nombre de enlace que se puede decir en voz alta, actualización en vivo mientras escribes, aprobación por lector - y nada guardado en ningún servidor, nunca. Gratis y sin registro.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/compartir-texto/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus textos y archivos compartidos **nunca se suben**. No hay ningún servidor.

Lo que compartes aquí viaja de tu navegador al de cada lector por un canal WebRTC cifrado de extremo a extremo, y a ningún otro sitio. El único servidor implicado — nombrado en la `Content-Security-Policy` de esta página, con el código en el repositorio — presenta a los dos navegadores y enumera los nombres de enlace locales visibles en la lista. No guarda texto ni archivos compartidos, y el contenido nunca pasa por él. Los nombres de la lista duran solo mientras quien comparte sigue conectado. No hay historial de contenido ni cuenta. Cierra esta pestaña y lo compartido se acaba en todas partes a la vez, también en las páginas abiertas de los lectores.

- ✗ Nada guardado
- ✗ Sin cuenta
- ✓ Cifrado de extremo a extremo
- ✓ Se acaba con tu pestaña
- ✓ Código abierto

## Cómo compartir texto y archivos sin subirlos a ninguna parte

1. **Escribe el texto, o adjunta los archivos.** El editor es lo compartido: lo que contenga cuando un lector se conecta es lo que recibe, y lo que cambies después llega en vivo a los lectores conectados, mientras escribes. Los archivos viajan por el mismo canal, hasta 200 MB cada uno; los lectores ven la lista y descargan solo lo que piden, así que nadie gasta ancho de banda en un archivo que no quería.
2. **Activa Markdown si el texto merece formato.** Un solo interruptor. Títulos, negritas, listas, código y enlaces se renderizan en vivo junto al editor mientras escribes, y los lectores reciben la vista formateada por defecto, con un conmutador para volver al texto original. El renderizador viaja con esta página y lo escapa todo: el texto compartido no puede convertirse en script en la máquina de un lector, lo haya escrito quien lo haya escrito.
3. **Ponle nombre al enlace, o quédate con la sugerencia.** El nombre es la dirección: `brave-otter-42` se puede decir de un lado a otro de una sala, leer por teléfono o copiar de una pizarra. Las comparticiones locales visibles enumeran su nombre, así que mantén Privado activado para cualquier contenido delicado. Para una compartición disponible solo por enlace, un nombre que nadie adivinaría también es útil. Un nombre bajo el que ya comparte otra persona se rechaza, y el tuyo queda libre en cuanto paras.
4. **Decide quién entra.** Privado es lo predeterminado: a cada lector se le pide presentarse — un nombre, una pista, cualquier cosa que reconozcas — y tú ves el mensaje con un botón para dejarle leer o rechazarlo. La presentación viaja por el canal directo, así que ni el intermediario sabe quién llamó. Desmárcalo para una compartición abierta que pueda leer cualquiera con el nombre.
5. **Empieza a compartir, y deja la pestaña abierta.** La pestaña es el servidor: lo compartido está disponible mientras siga abierta y despierta, y ni un momento más. Un portátil que se cierra también lo termina. Copia el enlace, o simplemente di el nombre: un lector puede escribirlo como `#name` al final de la dirección de esta página. Para el modo Red local, copia el enlace: lleva `?local=1` antes del nombre. Si el lector usa otro modo, se le pregunta antes de reintentar con el tuyo.
6. **Al otro lado: primero consentir, después llamar.** Quien abre el enlace se entera de que alguien comparte, se le avisa de que una conexión directa muestra a cada lado la dirección de red del otro, y solo se conecta si lo decide. En una compartición privada se presenta y espera a que le abras. Lo que recibe se actualiza en vivo mientras editas, y desaparece cuando cierras la pestaña.

## La versión larga

[Cómo compartir texto y archivos entre dispositivos sin subirlos](https://abox.tools/es/guias/compartir-texto-entre-dispositivos/): Llevar texto o archivos de un navegador a otro por una conexión directa y cifrada: sin mandarse correos a uno mismo, sin historial de chat, sin cuenta, y sin que ningún servidor se quede una copia.

## También en la caja

- [Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/): Escríbelo y se convierte en un código. Para hacerlo no se envía nada.
- [Lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/): Apúntale con la cámara o suelta una imagen. Se lee aquí, y en ningún otro sitio.
- [Hash y suma de verificación](https://abox.tools/es/calcular-checksum/): Comprueba una descarga contra el número que publicó quien la distribuye, sin enviársela a nadie.
- [Generador de contraseñas y frases de contraseña](https://abox.tools/es/generador-de-contrasenas/): Se crean aquí, en tu propio navegador, y no se envían a ninguna parte. No se guarda nada y no hay historial.

## Preguntas

### ¿Se sube algo, a alguna parte?

No. El texto y los archivos van de tu navegador al de cada lector por un canal WebRTC cifrado, directamente. El único servidor implicado lleva la presentación y los nombres de enlace locales cuya publicación se haya elegido, nunca el contenido. No guarda texto ni bytes de archivos. Las salas y las entradas de búsqueda terminan con sus conexiones abiertas; los registros de conexión de siete días de Cloudflare contienen metadatos, nunca el contenido.

### ¿Y por qué esta herramienta habla con un servidor, precisamente en este sitio?

Porque dos navegadores no pueden encontrarse solos: algo tiene que juntar a quien tecleó `brave-otter-42` con quien comparte bajo ese nombre, y llevar la oferta de conexión entre ambos. Ese algo es el intermediario, la única dependencia de red de esta página, nombrado en su `Content-Security-Policy` y publicado en el mismo repositorio que la página. Es el servidor más pequeño capaz de hacer el trabajo. También enumera los nombres de enlace locales cuya publicación se haya elegido, para navegadores que usan la misma dirección IPv4 pública o la misma subred IPv6. No guarda contenido ni puede leer el canal cifrado entre los navegadores.

### ¿Qué puede ver exactamente ese servidor?

Que un nombre de enlace está en uso, cuándo se conectan y se van quien comparte y los lectores, sus direcciones IP y el establecimiento de la conexión cifrada que intercambian, y los nombres de enlace cuya publicación en la lista se haya elegido. La lista agrupa los nombres por la dirección IPv4 pública o la subred IPv6 que ve el servidor, y por el origen de la página. No el texto, no los archivos, no sus nombres ni tamaños, no a quién se dejó entrar en una compartición privada, y no lo que nadie escribió al presentarse: todo eso viaja por el canal directo, cifrado de extremo a extremo, que no pasa por el servidor. Cloudflare, que ejecuta el servidor, guarda un registro de cada conexión durante siete días: el nombre de enlace, la dirección y la hora. Nada más sobrevive a la compartición.

### ¿Qué pasa cuando cierro la pestaña?

Lo compartido se acaba en todas partes a la vez. El enlace deja de funcionar en un par de segundos, y los lectores que aún tengan la página abierta ven desaparecer su copia, con una nota de que la compartición terminó. No es una petición de borrado a un servidor: no hay copia en servidor que borrar. La pestaña era el único lugar donde lo compartido existía, y cerrarla es toda la limpieza.

### ¿Puede un lector quedarse con lo que compartí?

Mientras la compartición está abierta, sí: compartir es eso. Un lector puede copiar el texto o descargar un archivo, y lo que se llevó es suyo, exactamente como si se lo hubieras dado por cualquier otro medio. Lo que garantiza terminar es el futuro: nadie nuevo puede llegar a ello, y las páginas abiertas dejan de mostrarlo. Ninguna herramienta puede des-enviar lo que ya llegó, y esta página no finge lo contrario.

### ¿Qué es el modo privado?

Lo predeterminado. A cada lector que llega se le dice que la compartición es privada y se le pide presentarse; tú ves el mensaje — «soy Alice, la de la reunión» — con botones para dejarle leer o rechazarlo, y no se envía nada hasta que decides. La presentación viaja por el canal directo ya cifrado, así que el servidor nunca sabe quién llamó ni qué decidiste. Desmarcado antes de compartir, queda una compartición abierta.

### ¿Por qué verá el lector mi dirección IP?

Porque la conexión es directa de verdad, y una conexión directa va entre dos direcciones: cada extremo conoce necesariamente la del otro, como en una llamada de teléfono. Al lector se le avisa antes de que exista conexión alguna y solo se conecta si lo decide; hasta entonces, tú ni siquiera sabes que abrió el enlace. Si ese trato no conviene para algo concreto, la alternativa es un servicio que pase por un servidor — con el trato contrario.

### ¿Cómo de grandes pueden ser los archivos, y qué velocidad tiene?

Hasta 200 MB por archivo, de cualquier tipo, a la velocidad de la conexión más lenta de las dos. Una conexión local que funciona transfiere a la velocidad de esa red; las VPN y el enrutamiento del navegador pueden afectar la ruta. Los lectores descargan cada archivo cuando lo piden, así que un archivo grande adjunto no se transfiere hasta que alguien lo solicita.

### ¿Funciona sin conexión?

La mitad, siendo honestos: el editor sí. La página carga, tu borrador está ahí, el Markdown se renderiza, y puedes escribir y guardar sin red ninguna. Compartir no, y no puede: llegar al navegador de otra persona es un acto de red, y la presentación necesita el intermediario. Es la única herramienta de este sitio cuyo trabajo es imposible sin conexión, y dar a entender otra cosa sería deshonesto.

### ¿Y si no conseguimos conectar?

La oferta de retransmisor que se describe a continuación solo se aplica al modo de conexión normal. La mayoría de los pares de navegadores se alcanzan directamente una vez presentados; una minoría no, normalmente cuando un lado está en la red de direcciones compartidas de una operadora móvil o tras una red corporativa estricta. Esta página nunca pasa a un relevo en silencio — eso cambiaría lo que esta herramienta es sin decirlo —, así que a los veinte segundos dice claramente que no hubo conexión directa y le ofrece uno al lector: un relevo de Cloudflare que reenvía los bytes cifrados entre los dos navegadores y no puede leerlos, porque la clave nunca sale de los dos extremos. El lector lo elige por su nombre, en su propia página, tras saber qué ve — las dos direcciones, como la conexión directa —, y ahí tampoco se guarda nada. Tu lado no cambia: tu navegador sigue enviando a ese único lector, como lo haría si estuviera tras una VPN. El modo Red local nunca ofrece un retransmisor. Comprueba que ambos dispositivos usan la misma red Wi-Fi o Ethernet y que el aislamiento de la red de invitados, un cortafuegos o una VPN no bloquean la conexión.

### ¿Es seguro renderizar Markdown, si cualquiera puede compartir cualquier cosa?

Esa pregunta es la razón de que el renderizador sean ochenta líneas en el código de esta página y no una biblioteca. Cada carácter se escapa antes de emitir ninguna etiqueta, solo puede producirse un conjunto fijo de etiquetas inofensivas, y los enlaces aceptan solo `http`, `https` y `mailto`: un enlace `javascript:` se queda en texto inerte. El texto compartido no puede convertirse en script en tu máquina, lo haya escrito quien lo haya escrito, y las ochenta líneas puedes leerlas.

### ¿Pueden dos personas compartir bajo el mismo nombre?

A la vez, no. Una compartición viva por nombre, impuesto en el intermediario: quien llega segundo es rechazado y se le pide otro nombre. En cuanto una compartición termina, su nombre queda libre — lo que también significa que un enlace guardado vale lo que valga la compartición que tenga detrás: el mismo nombre, la semana que viene, puede ser de otra persona. Trata un enlace como algo de un momento, no de una persona.

### ¿Es gratis? ¿Necesito una cuenta?

Gratis, sin cuenta, sin registro, y sin ningún límite que merezca mención: dieciséis lectores simultáneos por compartición. El sitio lleva publicidad, que es lo que lo paga; los anuncios no reciben nada sobre lo que esta página comparte, y el intermediario cabe de sobra en un plan gratuito precisamente porque no guarda nada y casi no hace nada.

### ¿Puedo compartir archivos por mi red local?

Sí. Antes de empezar, elige Red local — sin retransmisor de internet, conecta ambos dispositivos a la misma red Wi-Fi o Ethernet y copia el enlace para el lector. El enlace incluye el modo; un lector con otro modo debe elegir explícitamente antes de reintentar con el modo de quien comparte. La presentación de los navegadores aún necesita internet. Este modo no usa descubrimiento público de direcciones y nunca pasa a un retransmisor de internet. Una VPN o las políticas de red del navegador pueden cambiar la ruta o impedir la conexión; la opción no demuestra que los bytes permanezcan dentro de un edificio. La aprobación privada sigue activada por defecto y el límite sigue siendo de 200 MB por archivo. Una sesión puede incluir hasta 256 archivos. Visible en la lista viene activado en este modo: el otro navegador puede abrir la página de la herramienta y elegir tu nombre en la lista de esta conexión. Desmárcalo para compartir solo por enlace; también puedes seguir copiando el enlace para el lector.

### ¿Cómo encuentra la lista las comparticiones locales?

Al abrir la página inicial de esta herramienta se piden al intermediario los nombres de enlace visibles en la lista de navegadores que usan la misma dirección IPv4 pública o la misma subred IPv6. Normalmente significa el mismo router, pero una VPN compartida o un proveedor que comparte una dirección pueden incluir otras redes. Si unos dispositivos usan IPv4 y otros IPv6, o siguen rutas distintas, pueden no aparecer aunque estén en la misma red local. La lista no demuestra que sea una misma red local física. Se necesita internet. Solo aparecen las comparticiones en modo Red local. Elige este modo antes de empezar, ya que está desactivado por defecto. Las comparticiones locales se anuncian por defecto; desmarca Visible en la lista para compartir solo por enlace y mantén Privado activado en redes compartidas. Al elegir un nombre se abre la página de consentimiento de la compartición; nunca conecta automáticamente ni evita la aprobación privada. El directorio conserva solo los nombres de enlace mientras quien comparte sigue conectado, nunca el texto, los nombres de archivo ni sus bytes. Si la búsqueda no está disponible, compartir por enlace sigue funcionando.

## Cómo se comprueba la promesa de privacidad

- **El contenido va a tu lector, y a ningún otro sitio.** El texto y los archivos viajan por un canal de datos WebRTC: una conexión directa, cifrada con DTLS, entre tu navegador y el de cada lector. No hay servidor en esa ruta. El modo Red local usa las direcciones de red propias de los navegadores, sin descubrimiento público de direcciones ni retransmisor de internet. Una VPN o las políticas de red del navegador pueden afectar la ruta de esas direcciones; no es una garantía sobre un edificio físico. En el modo normal, un lector al que no se pueda llegar directamente puede elegir un retransmisor cifrado en su propia página, que reenvía el mismo contenido cifrado sin poder leerlo.
- **Qué es el intermediario, y todo lo que ve.** Una conexión directa necesita una presentación. Esta página inicial abre automáticamente un WebSocket a nuestro intermediario para los nombres de enlace locales visibles en la lista; empezar a compartir abre otro para la propia compartición. Un lector usa un solo socket de presentación. Ese servidor junta a quien tecleó un nombre de enlace con quien comparte bajo ese nombre, les pasa unos kilobytes de negociación y no retiene nada: nunca escribe almacenamiento, y una sala deja de existir en cuanto quien comparte se desconecta. Puede ver que un nombre está en uso, cuándo llega y se va cada uno, y sus direcciones IP. No puede ver el texto, los archivos, a quién se dejó entrar ni qué dijo nadie: hasta la llamada a una compartición privada viaja por el canal directo cifrado. Su código completo está en el repositorio, junto al de esta herramienta. El directorio enumera solo los nombres anunciados por quienes siguen conectados con la misma dirección IPv4 pública o la misma subred IPv6. Puede incluir otras redes detrás de una VPN compartida o de una dirección compartida por el proveedor. Si unos dispositivos usan IPv4 y otros IPv6, o siguen rutas distintas, pueden no aparecer aunque estén en la misma red local. Lo que sobrevive a una compartición es una sola cosa: Cloudflare, que ejecuta el servidor, guarda un registro de cada conexión durante siete días, con el nombre de enlace, la dirección y la hora, nunca el contenido.
- **Nada se guarda: cerrar la pestaña es el borrado.** Lo compartido existe solo mientras tu pestaña está abierta. Ciérrala y los lectores nuevos no encuentran nada, y quien esté mirando ve desaparecer su copia — aunque lo que alguien copió o descargó antes es suyo, como lo sería cualquier cosa que le hubieras dado en mano. El borrador que escribes queda en el almacenamiento de tu propio navegador, para que siga ahí la próxima vez, y solo ahí; marcado como de un solo uso, no queda en ninguna parte.
- **El nombre del enlace es una dirección, y Privado, el cerrojo.** Cualquiera que conozca o adivine un nombre puede abrir lo que hay detrás. Por eso las sugerencias son nombres que se pueden decir en voz alta. Las comparticiones locales visibles publican su nombre en la lista de esta conexión: queda público para los navegadores que usan la misma dirección IPv4 pública o la misma subred IPv6. Mantén Privado activado para cualquier contenido delicado. Viene activado: cada lector que llega debe presentarse, por el canal directo, y no se envía nada hasta que tú lo dejas entrar.
- **Una conexión directa muestra a cada lado la dirección del otro.** Eso es lo que significa entre pares, y el lector lo sabe antes de que ocurra: abrir un enlace compartido solo pregunta al intermediario si alguien está compartiendo; después la página dice con claridad que conectar revela a cada lado la dirección IP del otro, y espera un clic. Hasta ese clic, quien comparte ni siquiera sabe que el lector existe.
- **Qué carga Google, y qué no recibe.** Los scripts de anuncios y medición vienen de Google, y el botón de donativos, de Buy Me a Coffee. Ninguno recibe el texto, los archivos, sus nombres o tamaños, ni quién se conectó. La excepción es la propia dirección de esta página: el enlace de un lector lleva el nombre del enlace, y el script de anuncios lee la dirección. Una compartición que deba quedar en privado quiere el interruptor de privado. Cada línea que toca el contenido se sirve desde este origen y está en el repositorio.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/main.js` para las dos mitades del intercambio — la pestaña de quien comparte y la del lector son el mismo archivo — y `src/markdown.js` para el renderizador que procesa texto llegado del otro lado del cable, y que por eso escapa todo antes de emitir nada. El código completo del servidor es `workers/rendezvous/worker.js`, en el mismo repositorio: una sala por nombre de enlace, más un directorio de búsqueda con los nombres anunciados en conexiones abiertas, nunca el texto ni los archivos.
