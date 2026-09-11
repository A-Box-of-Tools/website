# ¿Es seguro usar un generador de contraseñas online?

Tu sospecha es correcta y conviene conservarla: una página que fabrica contraseñas es exactamente la página que no debe recordarlas. La buena noticia es que esto se puede comprobar — el azar se fabrica en tu máquina, los envíos se ven, y a un generador que se queda con lo que hizo se le puede pillar.

Última actualización 26 de agosto de 2026

## La respuesta corta

La sospecha que hay detrás de esta pregunta es exactamente la correcta, así que consérvala. Una página que fabrica contraseñas es la única página de la web que no tiene nada sensible que recibir y todo lo sensible que *guardar*: su salida es el secreto, y un generador que transmitiera lo que fabrica no sería una herramienta floja sino una colección de contraseñas. La pregunta nunca es si una página generadora parece de fiar. Es si *podría* quedarse con la contraseña si quisiera — y eso, cosa rara, se puede comprobar.

Lo deciden tres cosas: de dónde sale el azar, si el resultado puede salir de la página, y si algo del resultado es predecible. Las tres tienen respuestas honradas que un visitante puede verificar, que es más de lo que puede decirse de una aplicación descargada que genera en una ventana en la que nadie puede mirar.

## De dónde sale el azar del navegador

Todo generador serio en un navegador bebe del mismo pozo: `crypto.getRandomValues`, el generador aleatorio criptográfico del navegador, sembrado y resembrado por el sistema operativo con ruido del hardware. Es la misma fuente de la que el navegador saca las claves TLS — el cifrado sobre el que corre tu conexión con el banco. No existe ningún sentido útil en el que un programa de escritorio tenga acceso a mejor azar que una página web; los dos terminan en el mismo pozo del sistema.

Lo que una página *no* debe usar es `Math.random()`, la función de andar por casa para tirar un dado. Los navegadores la implementan con un generador rápido cuyo estado interno se reconstruye a partir de un puñado de salidas consecutivas — es decir, las contraseñas construidas sobre él parecen aleatorias y son calculables para cualquiera que haya visto una. No es teórico; se ha demostrado contra generadores en circulación más de una vez. Y desde fuera es invisible, que es el argumento más fuerte a favor de los generadores cuyo código se puede leer: la diferencia entre las dos funciones es una palabra en el código fuente.

Hay un grado de esmero más fino todavía. Convertir palabras aleatorias de 32 bits en «un número por debajo de 26» con un simple resto queda ligerísimamente sesgado hacia las primeras letras; un generador cuidadoso vuelve a sortear en vez de tomar el resto. El [generador de aquí](https://abox.tools/es/generador-de-contrasenas/) lo hace — el sesgo que evita es de una parte en 165 millones, invisible en el uso y exactamente la clase de detalle que separa una herramienta construida para el trabajo de un fragmento copiado de un foro.

## Qué podría hacer mal una página generadora

Nombremos los fallos sin rodeos, porque cada uno se puede comprobar:

- **Mandar la contraseña fuera.** La página genera en local y después envía lo que hizo — con el clic, con la analítica, o por lotes más tarde. Este es el fallo eliminatorio, y se ve: tiene que ser una petición de red, y las peticiones se pueden vigilar.
- **Generar en el servidor.** La contraseña llega por la red en vez de salir por ella — así que el operador la vio primero, y de cómo se fabricó no aprendes nada. La misma comprobación, en la otra dirección.
- **Generar débil.** `Math.random`, una semilla de marca de tiempo, una lista de unas pocas cientos de palabras vendida como fuerte. A esta no la caza ninguna pestaña de Red; solo el código legible, o un indicador de fuerza honrado, contado a partir de los ajustes reales.
- **Guardar un historial.** Recordar servicialmente tus últimas veinte contraseñas — en un almacenamiento que sobrevive a la pestaña, en una máquina que quizá se comparte.

El [generador de contraseñas y frases de paso](https://abox.tools/es/generador-de-contrasenas/) de este sitio está construido contra los cuatro por diseño: `crypto.getRandomValues` y nada más, generación en la página, ningún almacenamiento de ninguna clase, sin historial, y una línea de fuerza que informa exactamente de cuántos resultados eran posibles con tus ajustes. Las listas de palabras para frases de paso son las listas Diceware de la EFF, incluidas sin cambios en la carpeta de la herramienta.

## Cómo comprobar cualquier generador, este incluido

El método completo está escrito en [la guía sobre subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/), y esta es la página a la que aplicarlo antes que a ninguna otra:

- **Desconéctate primero.** Carga la página, quédate sin conexión y *entonces* genera. Una contraseña fabricada sin conexión no pudo venir de fuera ni salir en el momento de fabricarse. Esta página sigue funcionando sin conexión; ese es su sentido.
- **Mira la pestaña de Red mientras generas.** Pulsa el botón y lee la lista: no debe salir nada. Después copia la contraseña y vuelve a mirar — el copiado es el momento que elegiría una página deshonesta.
- **Busca lo que necesitaría una colección.** Una cuenta, una sincronización, una lista de «generadas recientemente». Un generador con memoria tiene una copia.

Una salvedad honrada corresponde al final. Una comprobación te dice qué hizo la página mientras mirabas; el código publicado y servido legible — como todo en este sitio — te dice qué hace en general. Queda la máquina misma: ninguna página web puede proteger una contraseña de un navegador comprometido o de un programa espía, y un generador tampoco. Lo que las comprobaciones te compran es más pequeño y real — una contraseña que ningún servidor vio nunca, fabricada por una aritmética que te dejaron leer.
