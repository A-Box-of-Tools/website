# Cómo compartir texto y archivos sin guardar una copia en el servidor

Mueve una nota o un archivo sin dejar una copia en el correo, el historial de un chat o un servidor de intercambio. Los navegadores se conectan directamente por defecto. Si no pueden comunicarse, el anfitrión puede crear una nueva sesión con retransmisión en la nube: Cloudflare reenvía el contenido cifrado. Los destinatarios pueden conservar sus propias copias.

[Abrir Compartir texto y archivos](https://abox.tools/es/compartir-texto/): Comparte texto y archivos cifrados desde tu navegador abierto. La conexión directa es la predeterminada; la retransmisión en la nube es opcional. Tú apruebas a cada lector.

Última actualización 13 de octubre de 2026

## La respuesta corta

Direct es la opción predeterminada. Las indicaciones de alcance directo que siguen se refieren a ese modo. Para usar Cloud relay, el anfitrión lo elige antes de empezar y comparte la nueva invitación. La otra persona ve la opción y la confirma antes de conectar. Direct nunca cambia automáticamente. Cloudflare retransmite contenido cifrado y ve direcciones, horarios y volumen de tráfico. Ambos dispositivos necesitan internet durante toda la sesión. Siguen vigentes la aprobación, la contraseña y los controles del micrófono.

Abre [Compartir texto y archivos](https://abox.tools/es/compartir-texto/) en la máquina que tiene la cosa, escribe o adjunta, y pulsa *Empezar a compartir*. La página le da a la compartición un nombre como `brave-otter-42`; en el otro dispositivo, abre la misma página y añade `#brave-otter-42` al final de la dirección — o sigue el enlace copiado, sin más. El otro dispositivo pregunta antes de conectar, tú lo dejas entrar, y el texto o el archivo cruzan cifrados, directos de un navegador al otro. Cierra la pestaña que comparte y se acabó, en todas partes.

No se ha subido texto ni archivos compartidos a un servidor. Así funciona la herramienta. El resto explica por qué importa y cuáles son sus límites.

![La primera tarjeta de la herramienta de compartir: un cuadro de texto con unas líneas de notas de reunión, y encima un interruptor de Markdown y un botón para adjuntar un archivo.](https://abox.tools/screens/share-text-between-devices/write.webp)

Lo que se está entregando. En el mismo cuadro cabe una lista de la compra o un documento, y Markdown es un interruptor y no un modo aparte.

## Pasa una nota al teléfono o un archivo para un taller

**Del portátil al teléfono.** Pon una dirección larga, instrucciones o archivo en la página del portátil. Mantén Privado, abre el enlace copiado en el teléfono, aprueba al lector esperado y copia o descarga. Mantén visible y activa la pestaña hasta que llegue y termina. La copia guardada en el teléfono permanece aunque termine el enlace.

**Un taller o llamada de soporte en directo.** Comparte ejercicio, configuración de ejemplo o fragmento diagnóstico mientras ambos están presentes. Usa datos ficticios si puedes y aprueba lectores uno a uno. La lista del modo Red local visible no demuestra que estén en tu sala. Cada archivo debe respetar el límite de 200 MB.

Prueba la conexión en la red real antes de la cita. Acuerda una alternativa si bloquea el camino directo. Es una entrega en vivo: dejar algo durante la noche requiere un servicio que almacene deliberadamente.

## Dónde dejan copia los caminos habituales

Mándate una nota por correo y ahora existe en una carpeta de enviados y en una bandeja de entrada, ambas sincronizadas, ambas respaldadas, ambas buscables dentro de años. Pega una contraseña en una app de mensajería y se queda en el historial de esa conversación — y en la copia de seguridad en la nube de la app — mientras exista la conversación. Usa un pastebin o un sitio de subir archivos y el contenido queda en su servidor, detrás de un ajuste de caducidad y un botón de borrar de los que solo puedes comprobar el color. Cada uno de esos caminos es un servicio de almacenamiento con el compartir como función.

A veces es justo lo que quieres: una copia que espera hasta que la otra persona esté lista. Pero la mayoría de las comparticiones rápidas son lo contrario: el otro dispositivo está ahí mismo, el contenido es momentáneo, y cada copia guardada es pura carga. La contraseña del wifi para una visita, una dirección leída por teléfono, un mensaje de error que necesita otro par de ojos, un fragmento de configuración camino de la máquina a la que pertenece. Nada de eso quiere un archivo histórico.

## Qué significa «directo» de verdad

La herramienta usa WebRTC, como las videollamadas del navegador: dos navegadores abren un canal cifrado y envían datos sin servidor en el camino. Con una conexión local funcional, transfieren a la velocidad de esa red; la ruta también depende de VPN, políticas del navegador y ajustes de los dispositivos.

Hay una salvedad: los navegadores necesitan ayuda para encontrarse. Un pequeño servidor de encuentro enlaza a quien introduce el nombre con quien comparte y transmite unos kilobytes de preparación. No guarda contenido compartido ni lo transporta; su código está publicado. Presenta a las partes, no lleva la conversación. También lista nombres locales que aceptaron aparecer para encontrarlos en la página inicial. Es el servicio usado aquí y en Cámara remota. Obtener imágenes opcionales, consultar tipos de cambio y scripts de plataforma tienen límites propios en la [página de privacidad](https://abox.tools/es/privacidad/). La página de compartir explica qué ve el servidor.

Directo también significa mutuo: cada navegador conoce la dirección de red del otro, como en una llamada. El lado que lee lo sabe antes de que exista conexión alguna, y solo se conecta si lo decide.

## Compartir en el mismo Wi-Fi o Ethernet

Red local está desactivado por defecto. Antes de empezar, elige *Red local — sin relevo de internet*. Adjunta el archivo, conserva Privado para aprobar lectores y empieza. Visible está marcado por defecto: en el segundo dispositivo, revisa el tipo de conexión en *Conexiones disponibles* y pulsa Unirse junto al nombre. Se abre una pestaña de lectura y se inicia la solicitud. Los recursos privados esperan tu aprobación. Desmarca Visible antes de empezar para compartir solo por enlace. Ambos dispositivos necesitan el mismo Wi-Fi o Ethernet. Los archivos conservan el límite de 200 MB y cada lector elige qué descargar.

La lista agrupa navegadores por IPv4 pública o subred IPv6 vista por el servidor. Suele ser un router, pero VPN compartida o proveedor que comparte dirección pueden incluir otras redes. Rutas distintas o IPv4 e IPv6 pueden ocultar un dispositivo vecino. Mantén Privado en redes compartidas: el nombre aparece al grupo y la lista no prueba estar en la misma sala o edificio. Necesita internet. Si falla descubrir, sigue sirviendo el enlace copiado.

El enlace lleva el ajuste `?local=1#brave-otter-42`. Si dices el nombre, indica también Red local: `#brave-otter-42` solo pide modo normal. Si el lector usa otro modo, la página explica y le pide elegir antes de probar el del emisor.

El modo local no usa servidor público de descubrimiento de direcciones ni ofrece relevo de internet. Aún necesita internet para presentar navegadores. Wi-Fi de invitados puede aislar dispositivos; cortafuegos, VPN y políticas del navegador también bloquean o cambian la ruta. Controla cómo se encuentra un camino directo, sin demostrar que permanezca en un edificio físico.

## El nombre es la dirección; Privado decide quién entra

Un enlace de compartición se distingue de cualquier otro en algo muy práctico: sobrevive a decirse en voz alta. `brave-otter-42` se puede gritar de un lado a otro de una sala, leer por teléfono o copiar de una pizarra, y teclearse al otro lado sin que a nadie se le agoten los pulgares. Para eso exactamente tienen los nombres la pinta que tienen.

Cualquiera que conozca o adivine un nombre activo puede abrirlo. Compartir localmente con visibilidad lista el nombre a navegadores con igual IPv4 pública o subred IPv6: es público dentro del grupo. Para datos delicados, conserva el ajuste: se comparte en *privado* salvo que lo desmarques. Cada lector se presenta y decides quién entra. La presentación cruza el canal directo cifrado: ni el servidor de encuentro sabe quién preguntó.

![La tarjeta del nombre muestra thursday-notes y opciones de uso privado y de un solo uso.](https://abox.tools/screens/share-text-between-devices/name.webp)

El nombre es toda la dirección. Privado significa que cada lector tiene que pedirlo y tú le abres; de un solo uso significa que el borrador tampoco se queda en este dispositivo.

## Qué termina de verdad al cerrar la pestaña

La compartición vive en la pestaña que comparte y en ningún otro sitio, así que cerrar esa pestaña es el borrado — no una solicitud de borrado. El enlace muere en un par de segundos, y los lectores que siguen mirando ven su página quedarse vacía. No hay copia en servidor con su propio ciclo de vida, ni papelera, ni retención de treinta días. El borrador que escribiste queda en tu propio navegador para la próxima vez, y hasta eso se puede apagar con el ajuste de un solo uso.

Lo que no termina es la posesión. Un lector que copió el texto o descargó el archivo mientras la compartición estaba abierta, lo tiene: exactamente igual que si se lo hubieras dado por cualquier otro medio. Ninguna herramienta puede des-enviar, y una que lo afirmara te estaría mintiendo sobre el equipo de otra persona. Terminar gobierna el futuro — nadie nuevo, nada más — y esa es la parte que un servicio con copia guardada no puede darte.

## La entrevista en línea es el caso ideal

Una herramienta de mano a mano quiere los dos extremos presentes, y la entrevista es la única cita donde la presencia está garantizada: ya se están mirando. Es también el momento en que las vías con copia almacenada cuestan más. Lo que cruza el chat de la reunión acaba en la transcripción de la plataforma, unida a la grabación y a quien la reciba después; y abrir el correo o una app de mensajes para buscar un enlace con la pantalla compartida pone tu correspondencia en la grabación de otro. La página de compartir muestra lo compartido y nada más.

En la práctica: el enlace del portafolio, el repositorio, el PDF de la prueba, el fragmento de código que no sobreviviría a las comillas tipográficas del chat — arranca la compartición antes de la llamada y, cuando llegue el momento, di el nombre en voz alta. `brave-otter-42` cruza una llamada de voz intacto, que es exactamente para lo que se les dio esa forma a los nombres, y el otro lado tiene el archivo antes de acabar la frase. Dejada en privado, la compartición convierte además la llegada del entrevistador en algo que apruebas en plena llamada, no en una puerta abierta; y cuando la llamada termina, cerrar la pestaña termina la compartición con ella — nada queda esperando en una transcripción a ser releído fuera de contexto.

Una preparación honesta: los entrevistadores están en redes corporativas estrictas más a menudo que la mayoría de los lectores, y ahí vive el raro par sin camino directo. Su red no se puede probar desde casa — pero la herramienta anuncia el fallo en veinte segundos en vez de quedarse colgada, así que el plan B te cuesta unos instantes, no la entrevista.

## Cuándo esta es la herramienta equivocada

Ambos deben estar presentes al mismo tiempo y la pestaña que comparte debe seguir abierta. Compartir requiere conexión; solo el editor funciona sin ella. Si Direct falla en una red móvil o corporativa, el anfitrión puede detener el recurso compartido y crear uno nuevo con Cloud relay. Después envía la nueva invitación, cuya opción de conexión acepta el lector antes de conectar. Direct local no usa relevo. La suspensión del navegador y las políticas corporativas también pueden interrumpir una conexión con relevo.

Para todo lo demás — la nota, la contraseña, el archivo de configuración, el vídeo de 100 MB que está a un salto de wifi — la versión directa es más rápida, más simple, y deja el mundo exactamente como lo encontró.
