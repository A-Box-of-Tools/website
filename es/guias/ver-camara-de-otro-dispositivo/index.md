# Cómo ver una cámara desde otro dispositivo

Reutiliza un teléfono para ver mascotas, la entrada o lugares difíciles de inspeccionar. Abre la cámara en un navegador y aprueba al espectador. La conexión directa usa una red local accesible; la retransmisión en la nube envía el vídeo cifrado a través de Cloudflare.

[Abrir Remote Camera](https://abox.tools/es/remote-camera/): Open a camera on one device and watch it in another browser, with optional viewer approval. Choose Direct or Cloud relay for encrypted live video.

Última actualización 15 de octubre de 2026

## Qué necesitas

Direct es la opción predeterminada. Las indicaciones de alcance directo que siguen se refieren a ese modo. Para usar Cloud relay, el anfitrión lo elige antes de empezar y comparte la nueva invitación. La otra persona ve la opción y la confirma antes de conectar. Direct nunca cambia automáticamente. Cloudflare retransmite contenido cifrado y ve direcciones, horarios y volumen de tráfico. Ambos dispositivos necesitan internet durante toda la sesión. Siguen vigentes la aprobación, la contraseña y los controles del micrófono.

Usa dos dispositivos con navegadores compatibles con el acceso a la cámara y WebRTC. Ambos necesitan internet para establecer el contacto y una red que les permita comunicarse entre sí. Un teléfono por Wi-Fi y un dispositivo por Ethernet pueden funcionar si la red permite esa comunicación. También puede funcionar un punto de acceso del teléfono si ambos dispositivos tienen internet para el emparejamiento y el punto de acceso permite que se comuniquen entre sí.

Abre la dirección HTTPS de confianza de este sitio. Una dirección HTTP normal con una IP de la red local no puede pedir acceso a la cámara. Si el navegador o el sistema solicita acceso a la red local, permítelo para esta sesión.

## Usos de un teléfono antiguo en casa

Un teléfono que ya no usas puede mostrar otra habitación o un lugar difícil de ver. Estos usos necesitan la misma conexión directa que cualquier sesión de cámara: internet para emparejar los dispositivos y una red doméstica donde se puedan comunicar.

- **Ver la habitación infantil.** Usa el directo para una comprobación visual adicional desde otra habitación mientras estás en casa. Coloca el teléfono en un soporte estable fuera del alcance del niño. El audio y los avisos de actividad son opcionales, y el navegador puede pausarlos o no mostrarlos. No es un sistema de vigilancia para la seguridad.
- **Mascotas en otra habitación.** Mientras trabajas en otra parte de la casa, comprueba si el perro se ha acomodado en su cama o qué hace el gato en su rincón favorito.
- **Una entrada interior.** Vigila la puerta desde otra habitación. Es una imagen en directo mientras miras, sin grabación. Los navegadores compatibles pueden avisar cuando detectan movimiento o sonido mientras la página del espectador pueda seguir funcionando.
- **Inspecciones de bricolaje.** Apunta el teléfono a una unión de tuberías bajo el fregadero, un tornillo caído detrás de un mueble o un hueco por donde pasas cables. Un portátil permite ver donde no cabe la cabeza.

Para una imagen más fiable, mantén visible la página de cámara y el teléfono despierto. La página conserva una conexión que funciona al quedar oculta, pero el navegador del teléfono puede pausar la captura o suspender la página al cambiar de aplicación o bloquear la pantalla. Direct necesita una red local accesible. La retransmisión en la nube es una alternativa elegida expresamente y requiere internet durante toda la sesión.

## Prepara una vista de inspección

1. Inicia la cámara, conecta el portátil y aprueba su solicitud con los pasos siguientes. Empareja los dispositivos mientras el teléfono siga siendo fácil de alcanzar.
2. Elige la cámara orientada al lugar que quieres inspeccionar. Coloca el teléfono en un soporte estable y revisa el encuadre en el portátil. Añade una lámpara o linterna si está oscuro.
3. Mira el directo mientras buscas el tornillo, revisas la unión o pasas un cable. Mueve el teléfono si el detalle necesario queda fuera del encuadre.
4. Mantén visible la página de cámara y la pantalla despierta hasta terminar. Después elige Stop camera and end the link.

## Empieza en el dispositivo de cámara

1. Elige un nombre para el enlace o conserva la sugerencia aleatoria. Deja Require my approval activado para aprobar a los espectadores, o desactívalo para permitir la visualización automática. Después elige Start camera. El navegador selecciona la cámara inicial.
2. Permite el acceso a la cámara. El audio está desactivado de forma predeterminada. Activa Enable microphone antes de iniciar si también quieres solicitar acceso al micrófono. Detén la cámara antes de cambiar esta opción.

Aparece la vista previa local junto con el enlace, el código elegido y un código QR. No se envían vídeo ni audio hasta que se acepte a un espectador. Mantén visible la página y despierto el dispositivo para una captura fiable. Detén la cámara antes de cambiar el nombre del enlace. Desactiva la inclusión en la lista antes de iniciar si quieres invitar solo mediante enlace. Si el navegador expone varias cámaras, aparece Camera después del permiso. Cambia allí para conservar el enlace y las conexiones de los espectadores; algunos dispositivos necesitan liberar primero la cámara anterior y pueden hacer una pausa breve.

## Conecta al espectador y apruébalo

1. En el otro dispositivo, puedes escribir en Watch a camera una nota que reconozca el propietario. En Available connections, revisa el icono del tipo de conexión y pulsa Join junto a la cámara para iniciar la solicitud.
2. También puedes abrir el enlace, escanear su QR o introducir el código en Watch a camera. Estas opciones esperan a que elijas Connect to camera.
3. Si Require my approval está activado, aprueba cada solicitud esperada en el dispositivo de cámara. Si está desactivado, los espectadores reciben vídeo automáticamente mientras haya espacio disponible.

La nota no verifica la identidad. Reconoce a cada persona y la solicitud esperada antes de aprobar. El emparejamiento intercambia direcciones de red incluso antes de la aprobación. La opción decide si el propietario debe actuar antes de enviar vídeo. Sin aprobación, cualquiera que conozca el enlace o encuentre la cámara en la lista puede mirar mientras haya espacio disponible. Los cambios afectan a solicitudes nuevas; los espectadores aceptados siguen conectados. Si la reproducción se pausa, elige Play live video. El audio compartido empieza automáticamente cuando el navegador lo permite; en caso contrario, elige Unmute audio. Los controles Mute audio y Full screen están dentro del marco del vídeo. Silenciar la reproducción no detiene los avisos de sonido.

## Comparte con varios espectadores

Hasta ocho espectadores aceptados pueden ver la misma cámara mediante conexiones directas independientes. El dispositivo de cámara los muestra en Connected viewers. Disconnect this viewer termina solo la vista de esa persona; Stop camera termina todas las vistas. Cada solicitud se aprueba por separado cuando la aprobación está activada. Una conexión fallida libera su plaza sin desconectar a los demás.

Elige Shared video bandwidth en el dispositivo de cámara para dejar capacidad libre para otros usos del Wi-Fi. Las opciones son 1, 2, 4, 6 y 10 Mbps; la opción predeterminada es 6 Mbps. El límite de vídeo se divide entre los espectadores, y cada navegador puede reducir aún más su velocidad si hay congestión. Con un límite de 1 Mbps, se aceptan nuevos espectadores solo mientras haya menos de cuatro aceptados en total; con límites superiores, el máximo total es ocho. El audio y los datos adicionales necesarios para la conexión se suman a ese límite. Puedes cambiarlo mientras compartes; reducirlo conserva a los espectadores actuales aunque superen el máximo para aceptar nuevas solicitudes.

El navegador no puede medir la capacidad total compartida del Wi-Fi. Si el vídeo se ralentiza, reduce el límite elegido o desconecta a algunos espectadores. El rendimiento del dispositivo también puede limitar la transmisión. Si el navegador no puede aplicar los límites de vídeo, el dispositivo de cámara lo indica; la adaptación habitual de cada conexión sigue funcionando.

## Activa avisos para el espectador cuando sean compatibles

Los espectadores conectados pueden elegir notificaciones de movimiento o sonido en los navegadores compatibles. Activa un aviso y acepta la solicitud de notificaciones del navegador. La detección de sonido necesita que el dispositivo de cámara comparta audio, y funciona aunque la reproducción esté silenciada. Las imágenes y el audio se analizan en el dispositivo del espectador, sin grabaciones ni envíos a servidores. Las notificaciones contienen solo un texto genérico sobre la actividad.

Mantén abierta la página del espectador. El navegador puede pausar el análisis en segundo plano o cuando el dispositivo entra en reposo, y los cambios de iluminación pueden activar avisos de movimiento. Algunos avisos pueden perderse; no es un sistema de vigilancia para la seguridad. En iPhone o iPad, puede ser necesario añadir el sitio a la pantalla de inicio para recibir notificaciones. Las opciones de notificación no compatibles se ocultan.

## Vuelve tras bloquear la pantalla o una interrupción

Al volver, la página intenta continuar con el mismo enlace y la cámara elegida. Si no puede reanudar, elige Resume camera; el navegador puede volver a pedir permiso de cámara. El espectador conserva la aprobación mientras siga la conexión directa original. Si se perdió esa conexión directa, debe reconectarse y recibir una nueva aprobación cuando Require my approval está activado. No se garantiza la captura en segundo plano con el teléfono bloqueado.

## Detén la sesión al terminar

Stop camera and end the link libera la captura y cierra la invitación. Volver a la página después de Stop no la reinicia. Cerrar la página de origen termina la sesión; ocultarla por sí solo conserva una conexión que funciona. Disconnect en el espectador elimina su imagen en directo; el origen conserva la vista previa local para otra solicitud.

Si se concede permiso de cámara después de Stop, la cámara se libera inmediatamente. Al iniciar de nuevo se usa el nombre del campo de enlace; New random name crea una invitación nueva. Terminar la sesión detiene el vídeo futuro, pero un espectador puede guardar lo que haya capturado por su cuenta en su pantalla.

## Si los dispositivos no conectan

Compartir el nombre de Wi-Fi no garantiza comunicación. El aislamiento de invitados, los cortafuegos, el bloqueo de detección de direcciones locales, los permisos de red del navegador o sistema y las rutas VPN pueden impedir la conexión directa. Detén ambos lados, revisa permisos y red, y prueba un enlace nuevo.

Connection details muestra los tipos de candidatos seleccionados y los fotogramas decodificados por el espectador. Direct usa solo candidatos de host, sin servidor STUN, retransmisor TURN ni alternativa de retransmisión. Una VPN, interfaz pública o ruta del sistema puede afectar al camino; los candidatos de host no prueban que el tráfico se quede dentro de un edificio.

## Qué ve el servicio de contacto

Abrir la página crea un WebSocket de descubrimiento hacia rendezvous. Iniciar o conectar añade un WebSocket de sala. Permanece abierto para recibir solicitudes, pero una conexión directa ya aceptada continúa si se cierra esa conexión de contacto. La cámara vuelve a intentar abrir su invitación sin repetir la captura ni la aprobación del espectador. Si el servicio no logra recuperarse, la vista existente continúa; detén e inicia de nuevo antes de invitar a otro espectador. El servicio ve el código, las direcciones IP, los horarios y las descripciones y candidatos de WebRTC. Ve los mensajes de configuración; el vídeo en directo, el audio activado y la nota del espectador viajan por la conexión cifrada entre dispositivos.

La lista agrupa las cámaras que aceptan aparecer según la dirección IPv4 pública o el prefijo IPv6 /64 observado por el servicio y la dirección de este sitio. Puede incluir desconocidos que comparten VPN o red móvil, y omitir cámaras cercanas. Join junto a una cámara solicita la conexión mediante el tipo indicado e intercambia las direcciones de red. Consultar la lista no conecta. El origen puede exigir aprobación o aceptar automáticamente. Abrir un enlace sigue esperando a Connect. Las salas y listas existen solo mientras hay conexiones abiertas. Cloudflare conserva durante siete días registros de conexión con metadatos, nunca el contenido de los mensajes. Los scripts publicitarios habituales pueden leer la dirección de la página, incluido el código de cámara en el fragmento. El código permite solicitar acceso, por lo que la aprobación en el origen sigue siendo esencial.

Esta es una vista de cámara en el navegador. El audio del micrófono es opcional. No tiene función de grabación y no instala una cámara del sistema para otras aplicaciones.
