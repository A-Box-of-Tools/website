# ¿Puede un agente de IA usar estas herramientas?

Sí. Son páginas web corrientes, sin cuentas, sin captchas y con todos los controles etiquetados, y un agente las maneja como maneja todo lo demás. La pregunta que merece una página es la de detrás: cuando le encargas una tarea con archivos a un agente, ¿adónde va el archivo? La respuesta depende por entero de dónde corre el navegador del agente.

Última actualización 6 de septiembre de 2026

## La respuesta corta

Sí. Cada herramienta de aquí es una página web corriente: un selector de archivos, unos controles etiquetados, un botón de descarga. No hay cuenta en la que entrar, ni captcha que resolver, ni paso alguno que exija a un humano en particular. Un agente de IA con navegador maneja estas páginas igual que maneja cualquier otra — y varias cosas que este sitio ya hace por las personas les sirven a los agentes de regalo; la última sección las enumera.

Pero «¿puede pulsar los botones?» es la pregunta pequeña. La que merece una página es qué pasa con la promesa de este sitio — *tu archivo nunca sale de tu máquina* — cuando la máquina que pulsa los botones no eres tú. La respuesta es que la promesa sobrevive a la delegación por completo, o no sobrevive nada, según una sola cosa: **dónde corre el navegador del agente.**

## Dos clases de agente, una distinción

Los agentes que usan herramientas vienen en dos formas, y la diferencia entre ellas pesa más que todo lo demás de esta página.

**Un agente local** corre en tu máquina: un asistente instalado en tu equipo, o uno que conduce el navegador que tienes delante. Cuando un agente así abre aquí una herramienta y le tiende tu archivo, el trabajo ocurre donde ocurre siempre con estas páginas — en un navegador, sobre tu hardware. El archivo se lee de tu disco, se procesa en la memoria de tu navegador y se escribe de vuelta en tu disco. La delegación no ha cambiado nada del camino que recorren los bytes. Una IA eligió los ajustes; el archivo siguió sin salir.

**Un agente en la nube** ejecuta un navegador en un equipo de su proveedor. Tú adjuntas un archivo a un chat, el agente trabaja en una máquina virtual en otra parte, y todo lo que haga con estas herramientas ocurre allí. Las herramientas siguen cumpliendo exactamente lo prometido — el archivo no va más allá del navegador en el que está —, pero ese navegador no es el tuyo, y la subida ya ocurrió en el momento en que adjuntaste el archivo, antes de que se abriera herramienta alguna. Ninguna página puede deshacer una subida que la precedió.

Así que la pregunta que este sitio no deja de hacer — ¿este trabajo necesita que mi archivo salga? — no desaparece cuando el trabajo lo hace un agente. Solo se adelanta un paso, a la elección del agente. Un agente local conduciendo una herramienta que vive entera en el navegador es el arreglo raro en el que delegar no cuesta ninguna privacidad: la IA hace el trabajo, y el archivo se queda en casa.

## Cómo encargarle una tarea a un agente

Los agentes rinden mejor con el mismo encargo que querría un colega: la herramienta, el archivo y qué aspecto tiene el trabajo terminado. Algunos patrones que funcionan:

- **Nombra el resultado, no solo la herramienta.** «Abre abox.tools/comprimir-imagen/ y deja esta foto por debajo de 200 KB» le da al agente el número que la página va a pedir. El [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) acepta un tamaño objetivo por su nombre — exactamente la clase de instrucción que un agente puede cumplir con fidelidad.
- **Enséñale el mapa.** Este sitio publica [llms.txt](https://abox.tools/llms.txt): cada herramienta y cada guía, con una línea de descripción cada una, en texto plano y en una sola petición. Un agente que lo lee sabe qué existe aquí sin rastrear nada. Y cada página tiene un gemelo en su propia dirección con `index.md` al final: la página en Markdown, sin la interfaz alrededor, para un agente que quiere lo que dice la página de una herramienta y no cómo se ve.
- **Déjale leer la página en la que está.** Cada herramienta lleva sus preguntas y respuestas en la propia página, y cada herramienta tiene una guía a un enlace de distancia. A un agente que parezca dudar con un ajuste se le puede decir que lea primero la guía — el mismo consejo que recibiría una persona.
- **Las cadenas funcionan.** Los trabajos que las guías de flujos de este sitio describen para personas — escanear y luego combinar en un [PDF](https://abox.tools/es/imagenes-a-pdf/); quitar los datos [EXIF](https://abox.tools/es/eliminar-datos-exif/) y luego redimensionar — son los trabajos en los que los agentes destacan, porque la salida de cada paso es la entrada del siguiente y nada entre medias pide criterio.

## Qué no delegar

Un agente puede manejar todas las herramientas de aquí. Hay dos lugares donde manejar no es todo el trabajo, y el resto debería quedarse contigo.

**Decidir qué no debe verse.** Las herramientas de censura borran lo que cubres — pero elegir qué cubrir *es* el trabajo, y un agente al que se le escapa una línea ha producido un archivo que parece terminado y no lo está. Deja que un agente opere el censor si quieres; mira tú el resultado antes de que vaya a ninguna parte, la misma regla que las guías de esas herramientas le dan a un operador humano.

**Abrir lo leído.** El lector de códigos QR de este sitio se niega a abrir lo que descodifica, porque leer y seguir son actos distintos. La misma separación merece imponérsele a un agente: un agente que lee un código, un enlace o una dirección en un archivo debe informar de ella, no visitarla. Y un agente que conduce tu propio navegador sostiene todo aquello en lo que ese navegador tiene la sesión iniciada — una razón para mirarlo con el mismo ojo crítico que a cualquier herramienta, que es de lo que va la sección siguiente.

## Un agente también puede comprobar la promesa

Las cuatro comprobaciones que enseña la guía sobre [subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) — desenchufar, mirar la pestaña Red, leer la Content-Security-Policy, leer el código — puede ejecutarlas todas un agente, y de hecho le resultan más fáciles que a una persona: leer una cabecera CSP o buscar llamadas a `fetch` en el código servido es trabajo mecánico. Si usas un agente para examinar herramientas antes de fiarte de ellas, este sitio espera ser examinado igual — y el comportamiento sin conexión en el que se apoyan esas comprobaciones tiene [su propia página](https://abox.tools/es/guias/como-puede-una-pagina-web-funcionar-sin-conexion/).

Lo que este sitio hace por un agente lo hace a propósito y para todo el mundo: cada control está etiquetado, porque los lectores de pantalla necesitan nombres y un agente lee esos mismos nombres; las páginas no tienen cuentas, ni ventanas emergentes, ni muros de consentimiento que sortear; el código es público y se sirve sin paso de compilación, de modo que el código que un agente audita es el que corre; y [llms.txt](https://abox.tools/llms.txt) es la caja entera en una petición. Nada de eso se añadió para las máquinas. Una página legible para una persona con lector de pantalla resulta legible para todo lo demás también.

Un límite honesto: esta página trata de agentes que usan estas herramientas, no de los agentes en sí. Lo que ve el proveedor de un agente — tus instrucciones, tus capturas, a veces tus archivos — es una pregunta aparte, y la costumbre a la que este grupo de guías vuelve una y otra vez es también la lente correcta para ella: pregúntate qué necesita salir de verdad de tu máquina, y en qué estado.
