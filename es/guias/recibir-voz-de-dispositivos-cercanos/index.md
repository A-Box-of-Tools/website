# Cómo recibir voz en directo de personas cercanas

Una persona anfitriona escucha mientras varias hablan desde sus navegadores. El anfitrión da nombre al receptor y elige Direct o Cloud relay antes de empezar; quienes llaman no necesitan un nombre visible. La detección cercana ayuda a encontrarlo, una contraseña opcional controla el acceso y el anfitrión elige qué voces escuchar. Cloud relay retransmite la voz cifrada a través de Cloudflare después de que quienes llaman confirmen esa opción.

[Abrir Voice Oncall](https://abox.tools/es/voice-oncall/): Open a pager and hear live voice from people who connect. Use Direct on your local network or choose Cloud relay over the internet, with a password and individual mute or remove controls.

Última actualización 14 de octubre de 2026

## Abre el receptor para escuchar

Abre [Voice Oncall](https://abox.tools/es/voice-oncall/) en el dispositivo que escuchará. Elige Host a pager, escribe un nombre reconocible para el receptor y configura una contraseña si quieres. Mantén Connection en Direct o elige Cloud relay antes de empezar cuando el acceso directo no esté disponible. Start pager prepara la reproducción por los altavoces y anuncia el receptor; no solicita permiso para usar el micrófono.

Usa la dirección HTTPS del sitio. No hay instalación, programa auxiliar de Python ni cuenta. Mantén abierta la página del anfitrión y su dispositivo activo mientras haya personas conectadas.

Si el teléfono interrumpe el sonido del anfitrión, vuelve a la página y elige Restore sound cuando aparezca. El receptor permanece abierto mientras el sonido está en pausa.

## Permite que se conecten las personas cercanas

Los participantes abren la misma herramienta y eligen Join junto al receptor en Available connections. Introducen la contraseña si se exige y esperan la aprobación del anfitrión. Require approval está activado en los receptores nuevos y puede desactivarse antes de empezar. El anfitrión puede elegir Approve o Deny en la ventana emergente o en la lista de solicitudes pendientes; Review later cierra la ventana sin rechazar la solicitud. El permiso del micrófono solo se solicita después de admitir al participante. Quienes llaman no necesitan escribir un nombre.

La lista agrupa las páginas según su dirección pública de internet y el origen de este sitio web. Eso suele coincidir con personas que usan la misma conexión, pero no explora la red Wi-Fi ni demuestra cercanía física. Las VPN y las rutas distintas pueden ocultar un receptor cercano, mientras que una pasarela compartida del operador puede incluir a desconocidos. Usa la invitación copiada por el anfitrión o el código QR cuando la lista no lo encuentre. Comparte las contraseñas por separado del enlace.

## Habla solo cuando quieras hacerlo

Un micrófono conectado empieza con la transmisión detenida. Mantén pulsado Talk, o selecciona el botón y mantén pulsada la barra espaciadora, para enviar voz en directo. Suéltalo para detenerla. Start talking ofrece un interruptor para hablar sin mantener pulsado; desactívalo cuando termines.

Solo el anfitrión recibe la voz de los participantes. Estos no se oyen entre sí, y varias voces simultáneas pueden superponerse para el anfitrión. Ocultar una página conserva una conexión que funciona correctamente. Se suelta un botón Talk que estuviera pulsado, mientras que el modo manos libres puede continuar si el navegador lo permite. Los teléfonos aún pueden pausar micrófonos, sonido o red al bloquearse.

Una interrupción real del micrófono detiene la transmisión de voz y mantiene abierta la conexión. Al volver, la página intenta sustituir un micrófono finalizado; usa Resume microphone si hace falta y empieza a hablar otra vez de forma deliberada. Tras suspenderse la página, se reutiliza la identidad del receptor o del participante para reconectar. Disconnect cierra la sesión del participante y detiene la recuperación; End pager impide que el anfitrión se reinicie.

## Elige a quién escucha el anfitrión

La lista de participantes del anfitrión muestra a cada persona con un identificador breve y su estado de voz. Mute silencia a un participante en el navegador del anfitrión y Unmute permite volver a oírlo. La página normal de quien habla también deja de transmitir cuando se silencia; quitar el silencio no activa deliberadamente su micrófono.

Remove silencia al participante localmente mientras el servicio confirma la eliminación; después cierra su conexión y bloquea la identidad de sesión conservada. Si el servicio rechaza la acción recordada, la fila sigue visible y el anfitrión puede volver a elegir Unmute. Los identificadores de sesión no son cuentas verificadas, por lo que eliminar a alguien no puede impedir de forma permanente que vuelva con una identidad nueva. Una contraseña ayuda a controlar el acceso. End pager cierra el receptor actual; un receptor nuevo usa una invitación nueva y reinicia el historial de moderación.

## Entiende la conexión

Un punto de acceso del teléfono puede funcionar si permite que los dispositivos participantes se comuniquen directamente. Conecta los dispositivos al mismo punto de acceso y mantén internet para la detección y el emparejamiento. Usa el enlace del receptor o el código QR si la lista cercana no lo muestra. Algunos puntos de acceso y dispositivos administrados bloquean el tráfico directo, así que prueba los dispositivos reales antes de depender de ello.

Se necesita internet para la detección, la admisión y el establecimiento de la conexión. Ese servicio transporta nombres de receptores, identificadores temporales de participantes, credenciales derivadas de contraseñas, moderación y detalles de red, nunca voz. Las páginas antiguas también pueden enviar nombres visibles de participantes. El audio Direct viaja por conexiones cifradas independientes entre navegadores, sin STUN ni TURN. La opción Cloud relay retransmite el audio cifrado a través de Cloudflare, que ve direcciones, tiempos y volumen de tráfico y requiere internet durante toda la sesión. La invitación incluye la ruta del anfitrión; los participantes la ven antes de conectarse. Direct nunca cambia automáticamente a un retransmisor.

Los participantes en espera se enteran en cuanto el anfitrión vuelve. Los dispositivos suspendidos, los temporizadores en segundo plano y los límites de conexión pueden retrasar la recuperación. El aislamiento de invitados, los cortafuegos, las rutas VPN o los permisos de red local del navegador pueden impedir el audio directo aunque ambos dispositivos estén en la misma Wi-Fi. Prueba los teléfonos y dispositivos que piensas utilizar.

Si quieres que una persona hable a muchos oyentes, usa [Local Walkie-Talkie](https://abox.tools/es/walkie-talkie/). Voice Oncall recibe muchas voces independientes en un único anfitrión.
