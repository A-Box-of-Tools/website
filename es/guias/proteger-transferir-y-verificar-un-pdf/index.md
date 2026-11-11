# Proteger, transferir y verificar un PDF

Prepara primero el documento, protege su contenido final y comprueba después el archivo exacto que llega. La contraseña controla la apertura del PDF; una suma de comprobación verifica si los bytes recibidos coinciden con la copia enviada.

Última actualización 22 de octubre de 2026

## Termina el documento antes de protegerlo

Necesitas enviar un documento ficticio, `committee-papers.pdf`, a otra persona. Quieres que sea necesaria una contraseña para abrirlo y comprobar que la copia descargada coincide con el archivo final enviado. Son tareas distintas: la protección controla la apertura, una suma de comprobación compara bytes y la transferencia mueve esos bytes hasta el destinatario.

1. Termina e inspecciona el documento.
2. Genera una contraseña única y protege una copia del PDF.
3. Calcula SHA-256 para esa copia protegida exacta.
4. Transfiérela y pide al destinatario que compare la suma de comprobación.

Completa primero la edición, la selección de páginas, la eliminación de datos y la compresión. Proteger con contraseña no elimina un dato que olvidaste borrar; una suma de comprobación no puede decirte si el paquete contiene las páginas correctas. Guarda el original de forma segura. Cualquier cambio posterior en el archivo protegido requiere una nueva suma de comprobación.

## Exige una contraseña para abrir el PDF

Usa el [Generador de contraseñas y frases de contraseña](https://abox.tools/es/generador-de-contrasenas/) para crear una contraseña aleatoria larga y única. Guárdala donde puedas recuperarla de forma segura, por ejemplo, en el gestor de contraseñas. No reutilices una contraseña de una cuenta ni una publicada en una guía. La [guía del generador](https://abox.tools/es/guias/es-seguro-un-generador-de-contrasenas-online/) explica la generación local.

Carga el documento terminado en [Proteger PDF](https://abox.tools/es/proteger-pdf/) y configura la contraseña de apertura. Las restricciones de impresión o copia son otra función: un documento que se abre sin contraseña no cumple el objetivo de este proceso. Mantén AES-256, la opción predeterminada, salvo que un requisito de compatibilidad revisado exija otra solución. Consulta la [guía de protección](https://abox.tools/es/guias/proteger-un-pdf/) para conocer los ajustes y sus limitaciones.

Descarga `committee-papers-protected.pdf`. Dale un nombre que no revele por sí mismo información privada: cifrar un documento no oculta el nombre del archivo adjunto.

## Prueba la descarga protegida

Abre el archivo descargado en un lector PDF y comprueba que exige la contraseña de apertura. Usa la contraseña guardada y lee las páginas. Si el lector recuerda contraseñas, utiliza una sesión nueva del lector; una vista previa ya desbloqueada no demuestra qué verá quien lo abra por primera vez.

Confirma que el destinatario puede usar PDF protegidos con contraseña y que el archivo cumple el límite de la herramienta de transferencia. Compartir texto y archivos limita actualmente cada archivo a 200 MB. Si el documento necesita reducirse, vuelve al original, comprímelo e inspecciónalo y protege después la versión resultante. Hazlo antes de calcular su hash.

Guarda el original y la contraseña de forma segura. Perder la contraseña puede dejar la copia protegida ilegible. La copia cifrada es el archivo adjunto de los pasos restantes; no selecciones el original por error.

## Calcula el hash de los bytes cifrados finales

Selecciona `committee-papers-protected.pdf` en [Hash y suma de comprobación](https://abox.tools/es/calcular-checksum/) y usa su resultado SHA-256. Copia el hash completo: SHA-256 tiene 64 caracteres hexadecimales. Comparar solo el principio o el final es una comprobación más débil. La [guía de sumas de comprobación](https://abox.tools/es/guias/verificar-el-checksum-de-una-descarga/) explica cómo comparar un hash esperado.

Dos PDF pueden parecer idénticos y aun así tener hashes distintos. Incluso cifrar por separado el mismo original puede producir bytes diferentes. Calcula el hash de la descarga protegida real, no de una versión anterior ni de una copia sin cifrar guardada por un lector.

| Elemento de trabajo | Uso |
| --- | --- |
| PDF original | Conservarlo de forma segura para futuras modificaciones |
| PDF protegido | Calcular el hash, transferir y verificar este archivo exacto |
| Contraseña de apertura | Entregarla solo al destinatario previsto |
| SHA-256 esperado | Comunicarlo por un canal de confianza para compararlo |

## Transfiere la copia protegida

Abre [Compartir texto y archivos](https://abox.tools/es/compartir-texto/), selecciona la descarga protegida e invita al destinatario. Mantén el acceso privado y aprueba el dispositivo receptor previsto. Deja abierta la pestaña emisora hasta que el destinatario termine la descarga. Sigue la [guía de uso compartido](https://abox.tools/es/guias/compartir-texto-entre-dispositivos/) para conocer las opciones de conexión y resolver problemas.

Este paso utiliza deliberadamente una red. En el proceso habitual entre dispositivos, un servicio público de encuentro presenta los navegadores; incluso el modo de red local necesita esa presentación. Directo envía el archivo entre los pares. Elegir retransmisión en la nube envía el tráfico WebRTC cifrado a través del retransmisor. El servicio de presentación no transporta el contenido del archivo. El PDF descargado también conserva la protección con contraseña.

Entrega la contraseña por un canal de confianza separado. Comunica también el hash esperado por un canal autenticado, como la conversación que ya mantienes con el destinatario. Sustituir a la vez un archivo y su hash podría hacer que ambos coincidieran; por eso, un hash que solo acompaña a una descarga no fiable no demuestra su origen.

## Compara el archivo recibido antes de modificarlo

En el dispositivo receptor, descarga el archivo y abre [Hash y suma de comprobación](https://abox.tools/es/calcular-checksum/). Selecciona ese PDF recibido, usa SHA-256 y compara el hash completo con el valor esperado de confianza. El campo de comparación de la herramienta evita tener que detectar a simple vista un carácter incorrecto.

Un SHA-256 coincidente aporta pruebas sólidas de que los bytes recibidos coinciden con la copia cuyo hash calculó el remitente. Por sí solo no identifica al autor, no demuestra que el contenido sea correcto ni hace que el archivo sea seguro para abrir. Este proceso presupone un documento esperado de un remitente conocido.

Si los hashes difieren, confirma primero que ambas personas han elegido el mismo algoritmo y la copia protegida. Un original con un nombre parecido, una nueva exportación cifrada o una versión guardada posteriormente pueden explicar la diferencia. Resuélvela antes de considerar verificada la copia recibida. No descifres y vuelvas a guardar el archivo antes de comparar: eso cambiaría sus bytes.

Una vez que la comparación sea correcta, abre ese mismo archivo con la contraseña y confirma que las páginas previstas se leen bien. Calcular el hash y leer responden a preguntas diferentes; esta última comprobación sigue siendo importante.

## Termina la transferencia después de confirmar la recepción

Cierra la pestaña emisora cuando el destinatario haya descargado, verificado y abierto el documento. Esto detiene el alojamiento en directo. No borra una copia ya descargada, y la contraseña del PDF no ofrece caducidad ni revocación remota. Quien tenga tanto el archivo como la contraseña puede conservar el acceso.

La entrega completada es concreta: el PDF pide una contraseña de apertura, el archivo cifrado recibido coincide con el SHA-256 esperado y el destinatario previsto puede leer las páginas previstas. Limita a esa persona la invitación de transferencia y la entrega de la contraseña.
