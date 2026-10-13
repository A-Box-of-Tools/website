# ¿Puede un agente de IA usar estas herramientas?

Los agentes pueden usar la interfaz. Para evaluar datos, revisa dónde se ejecuta el navegador, qué envía el agente y qué funciones usan red.

Última actualización 12 de octubre de 2026

## La respuesta corta

Un agente con control del navegador puede usar estas páginas normales: controles etiquetados, selección de archivos y descargas, sin cuenta del sitio. Su entorno debe admitir acceso a archivos, API y permisos necesarios. La cámara o el panel de compartir pueden necesitar tu participación.

Para procesar archivos, la primera pregunta es **dónde se ejecuta el navegador**. Revisa también qué recibe el servicio del agente y si la función obtiene o comparte datos deliberadamente. Un navegador local no resuelve las tres preguntas.

## Dos clases de agente, una distinción

Los agentes que usan herramientas vienen en dos formas, y la diferencia entre ellas pesa más que todo lo demás de esta página.

**Un navegador controlado localmente** lee y procesa en ese dispositivo. La herramienta local no añade una subida para procesar. El agente aún puede enviar instrucciones, capturas o contexto al proveedor según su implementación y ajustes.

**Un navegador en la nube** se ejecuta en el ordenador del proveedor. Si adjuntas un archivo para usarlo allí, ya ha salido de tu dispositivo. Estas herramientas lo procesan en ese navegador y no deshacen la transferencia anterior. Compartir y entregar a aplicaciones son acciones adicionales en ambos entornos.

Especifica un navegador local cuando importe mantener allí el procesamiento, revisa el propio agente y autoriza los envíos deliberados por separado. [Cambio y entrega al correo](https://abox.tools/es/extraer-recibos-facturas/), [importación por URL](https://abox.tools/es/imagenes-a-video/), [compartir](https://abox.tools/es/compartir-texto/) y [cámara](https://abox.tools/es/remote-camera/) documentan sus límites de red.

## Cómo encargarle una tarea a un agente

Los agentes rinden mejor con el mismo encargo que querría un colega: la herramienta, el archivo y qué aspecto tiene el trabajo terminado. Algunos patrones que funcionan:

- **Nombra el resultado, no solo la herramienta.** «Abre abox.tools/comprimir-imagen/ y deja esta foto por debajo de 200 KB» le da al agente el número que la página va a pedir. El [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) acepta un tamaño objetivo por su nombre — exactamente la clase de instrucción que un agente puede cumplir con fidelidad.
- **Enséñale el mapa.** Este sitio publica [llms.txt](https://abox.tools/llms.txt): cada herramienta y cada guía, con una línea de descripción cada una, en texto plano y en una sola petición. Un agente que lo lee sabe qué existe aquí sin rastrear nada. Y cada página tiene un gemelo en su propia dirección con `index.md` al final: la página en Markdown, sin la interfaz alrededor, para un agente que quiere lo que dice la página de una herramienta y no cómo se ve.
- **Déjale leer la página en la que está.** Cada herramienta lleva sus preguntas y respuestas en la propia página, y cada herramienta tiene una guía a un enlace de distancia. A un agente que parezca dudar con un ajuste se le puede decir que lea primero la guía — el mismo consejo que recibiría una persona.
- **Indica comprobaciones entre pasos.** Para escanear a PDF o limpiar imágenes, pide revisar orden, recorte, legibilidad y tamaño. OCR, censura y decidir qué compartir requieren criterio y revisión del resultado.

## Qué no delegar

Operar controles es solo una parte. Revisa decisiones que cambian lo que otros ven o reciben. Dos ejemplos:

**Decidir qué no debe verse.** Las herramientas de censura borran lo que cubres — pero elegir qué cubrir es el trabajo, y un agente al que se le escapa una línea ha producido un archivo que parece terminado y no lo está. Deja que un agente opere el censor si quieres; mira tú el resultado antes de que vaya a ninguna parte, la misma regla que las guías de esas herramientas le dan a un operador humano.

**Abrir lo leído.** El lector de códigos QR de este sitio se niega a abrir lo que descodifica, porque leer y seguir son actos distintos. La misma separación merece imponérsele a un agente: un agente que lee un código, un enlace o una dirección en un archivo debe informar de ella, no visitarla. Y un agente que conduce tu propio navegador sostiene todo aquello en lo que ese navegador tiene la sesión iniciada — una razón para mirarlo con el mismo ojo crítico que a cualquier herramienta, que es de lo que va la sección siguiente.

## Un agente también puede comprobar la promesa

Las cuatro comprobaciones que enseña la guía sobre [subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) — desenchufar, mirar la pestaña Red, leer la Content-Security-Policy, leer el código — puede ejecutarlas todas un agente, y de hecho le resultan más fáciles que a una persona: leer una cabecera CSP o buscar llamadas a `fetch` en el código servido es trabajo mecánico. Si usas un agente para examinar herramientas antes de fiarte de ellas, este sitio espera ser examinado igual — y el comportamiento sin conexión en el que se apoyan esas comprobaciones tiene [su propia página](https://abox.tools/es/guias/como-puede-una-pagina-web-funcionar-sin-conexion/).

Hay controles etiquetados, [llms.txt](https://abox.tools/llms.txt) y copias Markdown. El código, módulos compartidos y motores son públicos. La compilación genera y minifica las páginas; compárala con la publicación para auditar. DevTools y diagnósticos WebRTC dependen del entorno del agente.

Esta guía no garantiza la privacidad de un proveedor de agentes. Instrucciones, capturas y a veces archivos pueden enviarse aunque el navegador sea local. Incluye esas rutas y las funciones de red en la tarea; la ubicación del navegador no las prueba.
