# Cómo transmitir voz en una red local

Una persona habla y las demás escuchan en el navegador. Inicia el canal en este sitio y comparte el enlace o anúncialo cerca. La conexión directa usa una red local accesible. Si el anfitrión elige retransmisión en la nube, los oyentes confirman antes de enviar voz cifrada a través de Cloudflare.

[Abrir Local Walkie-Talkie](https://abox.tools/es/walkie-talkie/): Start a named channel, then hold to talk or speak hands-free. Connect directly on your local network, or choose Cloud relay for listeners over the internet.

Última actualización 3 de noviembre de 2026

## Empieza en el dispositivo desde el que vas a hablar

Abre Local Walkie-Talkie en este sitio web y escribe en Channel name un nombre que los oyentes reconozcan. Mantén Make this channel discoverable activado para publicar el canal, o desactívalo para invitar solo mediante enlace. Deja Connection en Direct, o elige Cloud relay antes de empezar si los dispositivos no pueden conectarse directamente. Elige Start channel y permite el acceso al micrófono. Un teléfono o dispositivo compatible puede alojar el canal desde la página HTTPS. No necesitas un programa auxiliar de Python, una descarga ni una cuenta. Para una conexión más fiable, mantén visible la página del emisor y el dispositivo activo cuando sea posible.

## Aprueba a los oyentes

Require approval está activado en los canales nuevos. Cada oyente nuevo espera antes de recibir audio. Usa Approve o Deny en la ventana de solicitud o en la lista; Review later cierra la ventana y mantiene la solicitud pendiente. Puedes desactivar la aprobación antes de empezar. Una identidad aprobada anteriormente puede recuperar la conexión en la misma sala; terminar la transmisión impide esa recuperación.

## Busca un canal o invita a los oyentes

Los oyentes abren Local Walkie-Talkie, comprueban el icono de conexión del canal en Available connections y pulsan Join en su fila. La lista se actualiza automáticamente. Consultarla no conecta; al unirse solo reciben audio y nunca se solicita acceso al micrófono. Si el canal no aparece, comparte el enlace o código QR para oyentes; abrir una invitación Direct inicia la conexión automáticamente. Una invitación Cloud relay muestra primero el tipo de conexión y espera a Join. Si el navegador bloquea el sonido, Unmute lo activa. Una vez conectados, los oyentes usan Mute/Unmute y Leave.

Ambas partes necesitan internet para la búsqueda y el emparejamiento. El servicio transmite nombres de canales, invitaciones para oyentes, detalles de conexión y estados; la voz en directo sigue una ruta cifrada independiente desde el emisor hasta cada oyente. Direct es la opción predeterminada y nunca cambia de ruta automáticamente. Cloud relay es una alternativa explícita que retransmite el audio cifrado a través de Cloudflare; ve direcciones, horarios y volumen de tráfico, y necesita internet durante toda la sesión. Ambas partes usan la ruta elegida por el anfitrión.

La búsqueda de dispositivos cercanos agrupa los navegadores por su dirección IPv4 pública o prefijo IPv6 /64 y por el origen de este sitio web. No analiza el Wi-Fi ni demuestra que un canal de la lista esté en la misma red física. Las conexiones a internet compartidas pueden incluir desconocidos; las VPN y otras rutas de internet pueden ocultar dispositivos que están al lado. Usa el enlace para oyentes si la búsqueda no encuentra un canal.

## Mantén pulsado para hablar

Mantén pulsado el botón Talk con el dedo o el ratón, o dale el foco y mantén pulsada la barra espaciadora. Suéltalo para dejar de enviar voz. Para hablar con las manos libres, pulsa Start talking: la voz sigue transmitiéndose hasta que pulses Stop talking. Comprueba el estado de transmisión que se muestra antes de dejar el dispositivo. Silenciar el micrófono tiene prioridad sobre ambas opciones. Pueden conectarse hasta diez oyentes, incluidas las conexiones en espera; empieza con un grupo pequeño y comprueba los dispositivos y la red que vayas a utilizar.

## Recupera la conexión con el emisor

Los receptores en espera permanecen en la misma página, conservan su elección de silenciar el sonido y se enteran en cuanto el emisor vuelve a estar disponible. Una conexión de voz directa que ya funciona puede continuar durante una interrupción breve del servicio de emparejamiento. Los navegadores en segundo plano, los límites de conexiones del servicio y los dispositivos en suspensión pueden retrasar la recuperación.

Ocultar la página conserva una conexión que funciona. Se suelta el botón de hablar mantenido pulsado; la transmisión manos libres iniciada con Start talking puede continuar si el navegador lo permite. Aun así, el teléfono puede suspender el micrófono, el audio o la red al bloquear la pantalla. Una interrupción real del micrófono detiene la transmisión y mantiene abierto el canal. Al volver, la página intenta sustituir un micrófono que haya dejado de funcionar; si hace falta, elige Resume microphone. Tras una suspensión de la página, intenta recuperar el mismo canal; usa Resume channel si el navegador requiere una acción. Después de una interrupción, la transmisión permanece desactivada hasta que la inicies de nuevo.

El almacenamiento temporal del navegador, independiente para cada pestaña, también permite conservar el canal al recargar la página. Si ese almacenamiento no está disponible, recargar la página del emisor crea una invitación nueva. End broadcast retira el canal de la lista, termina la sesión e impide la reanudación automática. El siguiente inicio crea una invitación nueva. Leave desconecta a un oyente y detiene sus reintentos.

## Comparte las invitaciones con cuidado

Una invitación para oyentes permite a quien la tiene solicitar acceso por la ruta elegida por el anfitrión. Con Require approval activado, el anfitrión debe aprobar la solicitud antes de que el oyente reciba audio. Empezar con Make this channel discoverable activado comparte de forma intencionada el nombre del canal y la clave de invitación para oyentes con su grupo de búsqueda. Cualquiera que lo encuentre puede solicitar unirse; la aprobación sigue siendo necesaria. Desactiva esa opción antes de empezar si quieres compartir invitaciones solo mediante enlace. La clave independiente del emisor permanece en su pestaña del navegador y no se comparte. En los enlaces copiados, las claves de los oyentes viajan en el fragmento después del carácter # y, después, en mensajes seguros de emparejamiento. El servicio mantiene temporalmente el estado de la sala en las conexiones abiertas; Cloudflare conserva durante siete días registros de metadatos de las invocaciones, nunca audio del micrófono.

Los scripts habituales del sitio web para publicidad y medición también se ejecutan en esta página. La herramienta no les entrega audio, pero los scripts de la página pueden leer la dirección y el almacenamiento del navegador. Eliminar el fragmento de la invitación cuando hay almacenamiento disponible reduce su exposición posterior; no aísla esos scripts. Confía en la página antes de concederle acceso al micrófono. Los destinatarios pueden grabar por su cuenta lo que oyen.

## Comprueba que los dispositivos puedan conectarse

Un punto de acceso móvil puede funcionar si permite que los dispositivos se conecten directamente entre sí. Conecta los dispositivos al mismo punto de acceso y mantén la conexión a internet para la búsqueda y el emparejamiento. Si el canal no aparece en la lista, usa el enlace para oyentes o el código QR. Algunos puntos de acceso y dispositivos administrados bloquean las conexiones directas; prueba los dispositivos que realmente vayas a utilizar.

Una red Wi-Fi para invitados puede aislar los dispositivos entre sí. Los cortafuegos, los permisos del navegador para acceder a la red local, las VPN y las rutas del sistema operativo pueden afectar a la conexión directa, aunque dos dispositivos parezcan compartir la misma red Wi-Fi. Direct utiliza únicamente candidatos de tipo host y ningún servidor STUN o TURN; eso limita la ruta, pero no demuestra que exista una frontera física de red. Prueba los teléfonos y demás dispositivos que vayas a utilizar antes de depender del canal.
