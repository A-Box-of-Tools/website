# ¿Cómo puede una página web funcionar sin el Wi-Fi?

Un service worker puede guardar una copia local. Terminar una operación sin conexión demuestra procesamiento local, no todas las rutas futuras de datos. Así funciona la caché y esto debes comprobar.

Última actualización 12 de octubre de 2026

## La respuesta corta

Un service worker puede guardar los recursos de una página en tu dispositivo y responder después desde esa copia. El sitio almacena la página, scripts y motores locales de cada herramienta. La caché debe completarse; el navegador puede rechazarla o borrarla y las actualizaciones pueden necesitar conexión. Comprueba primero el indicador sin conexión.

Una caché preparada permite una operación local sin conexión. Demuestra dónde se ejecutó esa operación, no garantiza todas las funciones ni lo que podría enviarse después. Un service worker es un mecanismo de caché, no un límite de privacidad por sí mismo.

## Qué demuestra sobrevivir al tirón de cable

La comprobación más fuerte de la guía de subidas es [tirar del cable](https://abox.tools/es/guias/es-seguro-subir-archivos/): cargar la herramienta, desconectar y usarla. Merece la pena precisar por qué funciona. Una herramienta que convierte tu archivo en un servidor necesita la red en el momento exacto en que hace su trabajo — corta el cable y el trabajo se para. Una herramienta que sigue funcionando ha demostrado, no afirmado, que el trabajo ocurre en tu máquina; y una página que no puede alcanzar la red no puede enviar tu archivo a ninguna parte, desee lo que desee su código.

Las herramientas locales indican si la copia está lista y si hay conexión. Prueba la operación con un archivo de tu dispositivo. Importar imágenes, consultar cambios, compartir y presentar cámaras tienen pasos de red explicados junto a sus controles.

## Cómo la copia se mantiene honrada

Dos preguntas deciden si lo guardado-para-siempre es regalo o trampa, y la maquinaria responde a ambas:

- **¿Se queda vieja la copia?** El worker busca una versión más nueva cuando hay conexión y la cambia entera. Las versiones van enteras porque la copia debe ser siempre coherente: mitad vieja, mitad nueva es el único estado que jamás debe servirse.
- **¿Qué se copió exactamente?** Todo lo que la página necesita y nada más — y cada herramienta de aquí guarda su copia en su propio compartimento. La caché de una herramienta contiene esa herramienta; instalar una no instala diez en silencio. La copia además puede inspeccionarse: las herramientas de desarrollo de tu navegador listan cada archivo cacheado, y la lista es la misma que la página trajo a la vista de todos.

El resultado es una página que se comporta como una aplicación que instalaste por el hecho de visitarla — cosa que además se ofrece literalmente: la barra de direcciones del navegador instala cualquier herramienta de aquí como aplicación, con el icono propio de la herramienta, abriéndose directa en la herramienta, sin botón en la página y sin script que lo pida. La misma maquinaria, vestida de atajo.

## Qué no prueba el sin-conexión

La comprobación es fuerte, no mágica, y sus límites merecen decirse tan claro como su fuerza:

- **Prueba la operación mientras no había conexión.** Una página podría guardar datos y enviarlos después. Cerrar una pestaña no borra el almacenamiento persistente. Revisa código, almacenamiento y solicitudes tras reconectar para comprobar el recorrido completo.
- **Se aplica a una función, no a todo el sitio.** [Compartir](https://abox.tools/es/compartir-texto/) y [Cámara remota](https://abox.tools/es/remote-camera/) necesitan el servidor público de encuentro, también en modo de red local. Las [URL de imágenes](https://abox.tools/es/imagenes-a-video/) y el [cambio opcional en línea](https://abox.tools/es/extraer-recibos-facturas/) necesitan sus servidores; el procesamiento local puede funcionar desconectado.
- **No te esconde.** Cargar la página ya le contó al sitio tu dirección, como todo cargado de página en la web. El sin-conexión trata de adónde van tus archivos, no de anonimato.

Combina el éxito sin conexión con revisar solicitudes, política y código. Una operación terminada desconectada no necesitó procesamiento en servidor en ese momento. Fallar no explica por sí solo por qué se necesitaba conexión; ningún resultado sustituye revisar los límites documentados.
