# Desbloquear PDF — elimina la contraseña y las restricciones

Muchos PDF protegidos no necesitan contraseña. Aquí ves qué protección tiene el tuyo antes de cambiarlo.

> Quita la contraseña y las restricciones de impresión, copia y edición de un PDF en el navegador. Indica si necesita contraseña; no la adivina ni sube el archivo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/desbloquear-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

El documento se abre, descifra y escribe en la memoria del dispositivo con código servido desde esta página. No hay funciones de subida ni un servidor que lo reciba. Ni el archivo ni la contraseña salen de esta pestaña.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo quitar la contraseña o las restricciones de un PDF

1. **Elige el PDF.** Un documento cada vez. El navegador lo lee del disco y prueba primero la contraseña vacía, que abre los PDF que solo tienen restricciones.
2. **Lee lo que encontró.** Indica el tipo de protección, algoritmo, seguridad y las restricciones que pide respetar: impresión, copia, edición, comentarios, formularios, reorganización de páginas o lectura accesible.
3. **Escribe la contraseña solo si se solicita.** El campo aparece si la contraseña vacía no abrió el documento. Sirve tanto la de apertura como la del propietario. No se adivina ninguna y lo escrito se queda en la pestaña.
4. **Retira la protección y revisa la comprobación.** El documento se descifra con su clave y se escribe sin diccionario de cifrado. Después se reabre sin contraseña con un lector que rechaza archivos cifrados. Si no se abre o cambia el número de páginas, se avisa y no se ofrece la descarga.

## La versión larga

[Cómo desbloquear un PDF y reconocer qué lo bloquea](https://abox.tools/es/guias/desbloquear-un-pdf/): Un PDF que no se puede imprimir y uno que no se puede abrir plantean problemas distintos. Qué significa cada protección, cuál se retira con un clic y cuál requiere conocer la contraseña.

## También en la caja

- [Proteger PDF](https://abox.tools/es/proteger-pdf/): Protege el documento sin entregárselo primero a una web.
- [Marca de agua en PDF](https://abox.tools/es/marca-de-agua-en-pdf/): Identifica el destino de una copia para que siga visible si termina en otro lugar.
- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.
- [PDF a CSV](https://abox.tools/es/convertir-pdf-a-csv/): Encuentra tablas en un PDF y las convierte en filas para una hoja de cálculo.

## Preguntas

### ¿Necesito la contraseña?

A menudo no. Muchos extractos, recibos e informes protegidos se abren para cualquiera y solo tienen restricciones de uso. Estas se retiran sin contraseña. Si el archivo realmente pide una contraseña para abrirse, sí debes conocerla. La página distingue los dos casos al elegirlo.

### ¿Abre un PDF si no conozco su contraseña?

No lo intenta. No hay diccionario ni búsqueda por fuerza bruta; puedes comprobarlo en `src/shared/pdf-crypt.js`. Ni siquiera busca las claves antiguas de 40 bits, aunque sean débiles. Si perdiste la contraseña de apertura, esta herramienta no puede recuperarla.

### ¿Qué diferencia hay entre las dos contraseñas?

La contraseña de *usuario* permite abrir el archivo. La de *propietario* retira las restricciones de impresión, copia y edición. Es habitual tener contraseña de propietario y ninguna de usuario: el PDF se abre, pero el lector no deja imprimir. Aquí se acepta cualquiera de las dos y se indica cuál funcionó.

### ¿Es legal quitar las restricciones?

Depende del documento, tus derechos sobre él y la legislación aplicable. Técnicamente, los permisos son un campo que los lectores respetan por acuerdo, no una barrera criptográfica, como documenta Adobe. La herramienta está pensada para documentos que tienes derecho a usar: tu extracto que no imprime, un informe que necesitas copiar o un escaneo que debes ordenar. Quitar restricciones no te concede derechos que no tenías.

### ¿Qué cifrados admite?

RC4 de 40 y 128 bits, revisiones 2 y 3; AES-128, revisión 4; y AES-256 en las revisiones 5 y 6, la forma de 2008 retirada y la actual de PDF 2.0. No admite cifrado con certificado ni una variante no publicada de Adobe. Ambos casos muestran un mensaje específico.

### ¿Cambiará el aspecto del documento?

No se redibuja, recodifica ni redistribuye contenido. Las instrucciones, fuentes e imágenes pasan intactas. El texto sigue seleccionable, los escaneos mantienen su resolución y nada se mueve. Puede pesar algo menos porque se omiten objetos antiguos sustituidos.

### ¿Qué ocurre si el documento está firmado?

La firma deja de ser válida en la copia reescrita, porque cubre los bytes del original. La herramienta detecta firmas y avisa en el resultado. Conserva el original, que sigue siendo el firmado.

### ¿Se suben los documentos o las contraseñas?

No. El navegador lee, descifra y escribe en tu dispositivo. La contraseña deriva la clave en la pestaña. No hay servidor de procesamiento y la `Content-Security-Policy` enumera los destinos permitidos, ninguno del sitio. Desconéctate para comprobarlo.

### ¿Cómo sé que se retiró la protección?

Se reabre el resultado con un lector que rechaza PDF cifrados. Debe abrirse sin contraseña y mantener el número de páginas. Si falla, no hay descarga. Puedes comprobarlo además en otro lector: las propiedades del documento deberían mostrar todos los permisos como permitidos.

### ¿Hay límite de tamaño y cuesta algo?

No hay ningún límite escrito en la herramienta. El límite es tu propio equipo: el documento se sostiene en memoria mientras se trabaja con él, así que un portátil aguantará unos cientos de megabytes sin quejarse y empezará a sufrir en algún punto por encima. Es gratis, no hay cuenta, ni registro, ni prueba. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus documentos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez y desconéctate. Seguirá funcionando; una herramienta que enviara el PDF a otro sitio para desbloquearlo no podría hacerlo.

## Cómo se comprueba la promesa de privacidad

- **Las restricciones no equivalen a una contraseña de apertura.** Un PDF puede tener una *contraseña de apertura*: sin ella no se lee y esta herramienta no la busca. Las *restricciones* de impresión, copia o edición son distintas. Si el archivo se abre para cualquiera, contiene lo necesario para obtener su clave. Los permisos son un campo que los lectores respetan por acuerdo, como documenta Adobe. Esta página distingue ambos casos y solo pide contraseña cuando realmente hace falta.
- **No adivina contraseñas.** Si el documento exige contraseña, debes proporcionarla o seguirá cerrado. No hay diccionarios, listas ni búsqueda de claves, ni siquiera para las antiguas de 40 bits. Es una decisión expresa: no es una herramienta para probar millones de contraseñas. Acepta tanto la contraseña de apertura como la del propietario que retira las restricciones.
- **La contraseña se escribe y utiliza aquí.** Se usa para derivar la clave en esta pestaña. No se guarda, no se recuerda entre archivos ni aparece en la dirección. La `Content-Security-Policy` enumera los destinos permitidos y ninguno pertenece al sitio. La contraseña no se envía por la red.
- **Se reabre el resultado antes de ofrecerlo.** El archivo generado se entrega al mismo lector que usan [el compresor](https://abox.tools/es/comprimir-pdf/), [la herramienta para unir PDF](https://abox.tools/es/unir-pdf/) y [la de censura](https://abox.tools/es/censurar-pdf/), que rechaza documentos cifrados. Debe abrirse sin contraseña y conservar el número de páginas. Si no cumple, el proceso falla y no hay descarga.
- **Las páginas no se vuelven a dibujar ni recomprimir.** Cambia el cifrado que rodea el documento. Las instrucciones de dibujo, fuentes e imágenes se escriben intactas: el texto sigue seleccionable, los escaneos conservan su resolución y nada se desplaza. Al reescribir se omiten versiones antiguas de objetos sustituidos en ediciones anteriores, lo que suele reducir algo el tamaño.
- **La firma digital no sobrevive a la reescritura.** Una firma cubre los bytes exactos del archivo. Reescribirlo invalida esa firma. La copia generada queda sin firma válida y el resultado lo avisa si detecta una. Conserva el original: sigue siendo el documento firmado.
- **Muestra el alcance real de la protección.** Un PDF con RC4 de 40 bits y otro con AES-256 pueden aparecer como protegidos, aunque su seguridad sea muy distinta. La página indica algoritmo, longitud de clave y revisión, y explica cuáles están rotos, obsoletos o vigentes. Así puedes valorar un archivo que te presentaron como seguro.
- **Los documentos cifrados con certificado se rechazan claramente.** Algunos PDF se cifran para un certificado cuya clave privada está en una tarjeta o almacén de claves. Se rechazan con un mensaje específico. Una contraseña no puede sustituir esa clave privada.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y medición vienen de Google. No reciben documentos, páginas, nombre, tamaño, cantidad de páginas, contraseña ni tipo de protección. Todo el código que lee, descifra y escribe se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y toma su tipografía de Google Fonts. Es un enlace y nada más: no informa de ninguna visita y no se le entrega nada sobre ti ni sobre tus documentos. No pasa nada hasta que lo pulsas, y entonces estás en el sitio de otra gente.
- **Funciona sin conexión.** Desconéctate y la página sigue funcionando. Una herramienta que enviara el documento a un servidor se detendría.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/shared/pdf-crypt.js` para convertir la contraseña en la clave del documento, sin un bucle que pruebe contraseñas, y `src/shared/aes.js` y `src/shared/rc4.js` para los algoritmos de cifrado. Ninguno accede a la red, ni el lector y el escritor.
