# Proteger PDF — añade contraseña y las restricciones que necesites

Protege el documento sin entregárselo primero a una web.

> Añade contraseña o restricciones de impresión y copia a un PDF en el navegador. AES-256 por defecto, sin subidas. Se reabre el resultado para comprobar la protección antes de descargarlo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/proteger-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El documento se abre, cifra y escribe en la memoria del dispositivo con código de esta página. No hay funciones de subida ni un servidor que lo reciba. Ni el archivo ni la contraseña salen de esta pestaña.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo añadir contraseña o restricciones a un PDF

1. **Elige el PDF.** Un documento cada vez. Se lee y abre en el navegador. Si necesita contraseña, se dirige a la herramienta de desbloqueo; si solo tiene restricciones, se acepta y se sustituyen por las elegidas aquí.
2. **Escribe la contraseña de apertura dos veces.** Es la protección real. Las dos entradas deben coincidir antes de activar el botón. Si la olvidas, esta herramienta no la recuperará. Deja ambos campos vacíos si solo quieres restricciones en un documento que cualquiera pueda abrir.
3. **Marca las restricciones que necesites.** Imprimir, copiar texto e imágenes o modificar. Son peticiones para el lector, no bloqueos criptográficos. La contraseña del propietario las retira. Si se deja vacía, la de apertura cumple ambos papeles; si no hay ninguna, se genera una aleatoria y se descarta para que no pueda retirarse con una contraseña vacía.
4. **Protege y revisa la comprobación.** Se escribe una copia cifrada con una clave nueva y se reabre para comprobar que respeta la contraseña, las páginas y los permisos. Si falla, no hay descarga y se explica el motivo.

## La versión larga

[Cómo proteger un PDF con contraseña y qué garantía ofrece](https://abox.tools/es/guias/proteger-un-pdf/): Una contraseña de apertura cifra un PDF. Una restricción de impresión es una petición. Qué hace cada una, qué cifrado elegir, por qué no necesitas subir el documento y qué ocurre si olvidas la contraseña.

## También en la caja

- [Marca de agua en PDF](https://abox.tools/es/marca-de-agua-en-pdf/): Identifica el destino de una copia para que siga visible si termina en otro lugar.
- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.
- [PDF a CSV](https://abox.tools/es/convertir-pdf-a-csv/): Encuentra tablas en un PDF y las convierte en filas para una hoja de cálculo.
- [Extractor de recibos y facturas](https://abox.tools/es/extraer-recibos-facturas/): Lee las fotos, revisa los campos y los recortes, y envía por correo imágenes comprimidas con cada importe y los totales.

## Preguntas

### ¿Es seguro un PDF protegido con contraseña?

El esquema predeterminado, AES-256 con hash de PDF 2.0, es el actual; la seguridad depende de la contraseña. No todos los PDF que un lector llama protegidos usan lo mismo. El formato incluye desde claves antiguas de 40 bits hasta este esquema. Aquí se usa el actual y se identifica expresamente la opción antigua.

### ¿Qué diferencia hay entre contraseña y restricciones?

La contraseña de *usuario* permite abrir el documento. La del *propietario* retira las *restricciones* de impresión, copia y edición. Estas últimas son peticiones: si el archivo se abre sin contraseña, contiene lo necesario para leerlo, y un programa puede ignorar los permisos. [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/) lo hace. Usa restricciones para indicar lo que permites y contraseña para controlar la apertura.

### ¿Qué pasa si olvido la contraseña?

Puedes perder el acceso. Esta herramienta no busca contraseñas; `src/shared/pdf-crypt.js` permite comprobarlo. No cuentes con recuperar un archivo protegido con una contraseña fuerte. Por eso se pide dos veces. Guarda el original sin modificar para poder volver a él.

### ¿Elijo AES-256 o AES-128?

AES-256, salvo que deba abrirlo un lector anterior a 2010. Usa el esquema de PDF 2.0, compatible con Acrobat X y lectores actuales. AES-128 usa el esquema de 2005 y una derivación de contraseña de 1994 que facilita probar candidatas, aunque el algoritmo AES sea sólido. Si dudas, elige 256.

### ¿Puedo proteger un PDF que ya tiene protección?

Si se abre sin contraseña y solo tiene restricciones, sí: los ajustes nuevos las sustituyen. Si exige contraseña, usa primero [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/) y vuelve con la copia sin protección. Cambiar una contraseña requiere retirar el cifrado anterior y aplicar el nuevo.

### ¿Cambiará el aspecto del documento?

El contenido no se redibuja, recodifica ni redistribuye. Con la contraseña, el texto sigue seleccionable, las imágenes conservan su resolución y nada se mueve. Puede reducirse algo al omitir objetos antiguos o crecer porque el cifrado añade bytes a los flujos.

### ¿Qué ocurre si el documento está firmado?

La firma deja de ser válida en la copia, porque cubre los bytes exactos del original. La herramienta avisa si detecta una. Si necesitas ambas cosas, protege el documento primero y firma después la copia protegida.

### ¿Se suben los documentos o las contraseñas?

No. El navegador lee, cifra y escribe en tu dispositivo. La contraseña deriva la clave en esta pestaña. No hay procesamiento de servidor y la `Content-Security-Policy` no incluye destinos de este sitio. Desconéctate para comprobarlo: no hace falta entregar el original para protegerlo.

### ¿Cómo sé que se aplicó la protección?

La herramienta reabre el archivo y muestra la comprobación. Si configuraste contraseña, debe rechazar la apertura sin ella y aceptar la contraseña correcta. También comprueba páginas y restricciones. Si falla, no hay descarga. Puedes abrirlo después en otro lector y revisar la contraseña y los permisos en sus propiedades.

### ¿Hay límite de tamaño y cuesta algo?

No hay ningún límite escrito en la herramienta. El límite es tu propio equipo: el documento se sostiene en memoria mientras se trabaja con él, así que un portátil aguantará unos cientos de megabytes sin quejarse y empezará a sufrir en algún punto por encima. Es gratis, no hay cuenta, ni registro, ni prueba. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus documentos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando, algo que una herramienta que enviara el PDF a cifrar a un servidor no podría hacer.

## Cómo se comprueba la promesa de privacidad

- **Protege el documento sin entregar el original.** Un documento que quieres proteger no debería pasar primero, sin protección y junto con su contraseña, por un servidor cuya retención desconoces. Aquí lo lee el navegador, deriva la clave en la pestaña y escribe la copia cifrada en memoria. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. Desconéctate y seguirá funcionando.
- **La contraseña bloquea; las restricciones solicitan.** La *contraseña de apertura* protege el contenido con cifrado y no se guarda como texto en el archivo. Las *restricciones* de impresión, copia y edición son distintas. Si el documento se abre sin contraseña, contiene lo necesario para obtener su clave. El lector respeta los permisos por acuerdo y puede ignorarlos. Adobe lo documenta así y [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/) permite retirarlos. Son útiles para expresar lo que permites, pero no equivalen a un bloqueo criptográfico.
- **AES-256 por defecto; el esquema antiguo solo si lo necesitas.** Los lectores llaman protegidos a PDF con cifrados de generaciones muy distintas. Aquí se usa AES-256 con el hash de contraseña de PDF 2.0, diseñado para dificultar las pruebas de contraseñas. La seguridad depende de elegir una buena contraseña. AES-128 con derivación de 1994 queda como opción de compatibilidad para lectores anteriores a 2010, con su limitación explicada.
- **Se pide dos veces porque no hay recuperación.** Esta página no busca contraseñas. Si olvidas una contraseña fuerte de un documento cifrado con el esquema actual, puedes perder el acceso. Por eso hay que escribirla dos veces y ambas deben coincidir. Conserva el original: esta operación no lo modifica.
- **Se reabre el resultado antes de ofrecerlo.** El archivo generado se vuelve a leer: sin contraseña debe rechazarse si pediste bloqueo de apertura; con la contraseña elegida debe abrirse, conservar las páginas y mostrar los permisos solicitados. Si falla una comprobación, no se ofrece la descarga.
- **Las páginas no se vuelven a dibujar ni recomprimir.** Cambia el cifrado, no el contenido de las páginas. Instrucciones, fuentes e imágenes se conservan: con la contraseña, el texto sigue seleccionable y los escaneos mantienen su resolución. No se redistribuye nada. La reescritura omite versiones antiguas de objetos sustituidos.
- **La firma digital no sobrevive a la reescritura.** Una firma cubre los bytes exactos del original. Reescribirlo la invalida en la copia y se avisa si se detecta. El original sigue firmado. Si necesitas cifrado y firma, protege primero y firma después la copia protegida.
- **Si ya tiene contraseña, retírala primero.** No se superponen contraseñas. Un archivo que pide contraseña de apertura se rechaza con un enlace a [Desbloquear PDF](https://abox.tools/es/desbloquear-pdf/). Retira allí la protección y vuelve con la copia. Si solo tiene restricciones y se abre sin contraseña, sí se acepta y los nuevos ajustes sustituyen a los anteriores.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben documentos, páginas, nombre, tamaño, número de páginas, contraseña ni protección. Todo el código que lee, cifra y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma su tipografía de Google Fonts. Es un enlace y nada más: no informa de ninguna visita y no se le entrega nada sobre ti ni sobre tus documentos. No pasa nada hasta que lo pulsas, y entonces estás en el sitio de otra gente.
- **Funciona sin conexión.** Desconéctate y la página sigue funcionando. Una herramienta que enviara el documento a cifrar fuera se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/pdf-crypt.js` para derivar la clave de la contraseña y construir el diccionario /Encrypt, y `src/shared/aes.js` para el cifrado. Ninguno accede a la red, ni el lector y el escritor.
