# QR y código de barras — crea un código QR o un código de barras, sin conexión

Escríbelo y se convierte en un código. Para hacerlo no se envía nada.

> Haz un código QR para un enlace, una red wifi o una tarjeta de contacto, o un código de barras EAN-13, UPC-A, Code 128 o Code 39. Descárgalo en SVG o PNG. Todo ocurre en tu navegador.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/generar-codigo-qr/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus códigos y el texto que llevan dentro **nunca se suben**. No hay ningún servidor.

Un código QR es aritmética sobre una cadena de texto: no hay ningún archivo que enviar ni ningún servicio al que preguntar. Todos los pasos ocurren en unas mil líneas de JavaScript de esta página que puedes leer: elegir el modo, elegir la versión, la corrección de errores de Reed-Solomon, la máscara, las barras de un código de barras y el dígito de control de debajo. Esta herramienta no tiene ninguna función de red, y aquí eso pesa más que en casi cualquier otra página, porque lo que se está codificando muchas veces es la contraseña del wifi.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin caducidad
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo hacer un código QR sin subir nada

1. **Elige el tipo de código.** Un código QR lleva cualquier cosa y es lo que busca la cámara de un móvil, así que es la respuesta salvo que te hayan dicho otra cosa. Un código de barras lleva un número, y cuál necesitas lo decide quien vaya a escanearlo: una tienda quiere un EAN-13 o un UPC-A, una caja de envío quiere un ITF-14, y cualquier cosa interna suele ser Code 128.
2. **Di qué va dentro.** Un enlace es el caso habitual, y las casillas de encima construyen los otros formatos que los móviles conocen: una red wifi que se ofrece a conectarse sola, una tarjeta de contacto que se ofrece a guardarse, un correo, un mensaje de texto, un número de teléfono o un punto en un mapa. Elijas el que elijas, la cadena terminada se ve en la página, y eso es todo lo que lleva un código QR.
3. **Elige cuánto daño puede aguantar.** Los cuatro niveles meten más o menos corrección de errores, y más corrección significa un código más grande y más denso. Con L basta para una pantalla, M sirve para papel corriente y H es para algo que se va a manosear, a imprimir pequeño o a pegar en un escaparate al sol. Un código impreso en una carta que se limpia todos los días se merece Q o H.
4. **Ajusta el tamaño, el margen y los colores.** El margen forma parte del código. Cuatro módulos de espacio en calma alrededor es lo que pide la especificación, y recortarlo es la razón número uno de que un código impreso no escanee. Oscuro sobre claro y con contraste de verdad: un escáner lee la diferencia entre los dos, así que un gris pálido sobre blanco no vale, y claro sobre oscuro falla de plano en bastantes lectores.
5. **Compruébalo con el móvil que tengas a mano.** Antes de imprimir mil, escanea el que tienes en pantalla. Son diez segundos y pilla toda la categoría de errores que una vista previa no puede: una contraseña de wifi con un carácter que había que escapar, un enlace al que le faltaba el `https://`, un número de código de barras al que le falta un dígito.
6. **Llévate el SVG.** Es el código como instrucciones y no como píxeles, así que se imprime a cualquier tamaño sin quedarse blando, y un borde blando es justo lo que un escáner no consigue resolver. Llévate también el PNG si donde vayas a pegarlo no acepta un SVG; está dibujado con un número entero de píxeles por módulo, así que tampoco tiene los bordes borrosos.

## La versión larga

[Cómo hacer un código QR que también escanee en el móvil de otro](https://abox.tools/es/guias/como-hacer-un-codigo-qr/): Qué nivel de corrección de errores elegir, por qué el margen blanco de alrededor forma parte del código, de qué tamaño imprimirlo, y lo que acabas pagando después por el código «dinámico» de un generador gratuito.

## También en la caja

- [Lector de códigos QR y de barras](https://abox.tools/es/escanear-codigo-qr/): Apúntale con la cámara o suelta una imagen. Se lee aquí, y en ningún otro sitio.
- [Hash y suma de verificación](https://abox.tools/es/calcular-checksum/): Comprueba una descarga contra el número que publicó quien la distribuye, sin enviársela a nadie.
- [Generador de contraseñas y frases de contraseña](https://abox.tools/es/generador-de-contrasenas/): Se crean aquí, en tu propio navegador, y no se envían a ninguna parte. No se guarda nada y no hay historial.
- [Formateador de JSON](https://abox.tools/es/formatear-json/): JSON, XML, HTML, CSS y YAML, formateados o convertidos. Nada se pega en el servidor de nadie.

## Preguntas

### ¿Se envía a alguna parte lo que escribo?

No. Un código QR es aritmética sobre una cadena de texto, y esa aritmética ocurre dentro de tu propio navegador, en tu propio dispositivo. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Aquí eso vale más que en casi cualquier otra página, porque lo que la gente mete con más frecuencia en un código QR es la contraseña de su wifi.

### ¿Estos códigos caducan o dejan de funcionar más adelante?

No, ni pueden. Lo que escribes es lo que lleva el código, así que escanearlo devuelve exactamente esa cadena para siempre. Los que caducan son los que llevan dentro la dirección de otro: un código QR «dinámico» lleva un enlace al servidor del generador, que redirige al tuyo, con lo que ellos pueden contar cada escaneo, cambiar adónde va o apagarlo cuando se les acabe la prueba. Aquí no hay nada que redirija a través de nada.

### ¿Es gratis? ¿Puedo usarlo comercialmente?

Es gratis, no hay cuenta, ni marca de agua, ni límite de cuántos hagas, y puedes poner el resultado en un producto, un cartel o un escaparate. QR Code es una marca registrada de Denso Wave, que ha declarado que no la va a ejercer contra quien use los códigos, y la especificación está publicada como ISO/IEC 18004 y es libre de implementar, que es lo que hace esta página. El sitio lleva publicidad, que es lo que lo paga.

### ¿Qué nivel de corrección de errores debería elegir?

M, salvo que tengas un motivo para otra cosa. Con L el código sale más pequeño y va bien en pantalla; M sobrevive a un manejo corriente; y Q y H son para un código que se va a imprimir pequeño, plastificar, pegar en un escaparate o tapar en parte con un logotipo. Cada escalón mete más datos de comprobación, lo que exige un símbolo más grande para la misma cantidad de texto: pasar de L a H más o menos duplica el número de módulos para la misma cadena.

### ¿Cuánto puede llevar un código QR?

En el tamaño más grande, 177 módulos de lado, hasta 7089 dígitos, 4296 letras mayúsculas y dígitos, o 2953 bytes de cualquier otra cosa, y eso con la corrección de errores más débil; con la más fuerte es alrededor de un tercio de eso. En la práctica el límite no lo pone el formato, sino el escáner: pasados unos cientos de caracteres, los módulos se quedan tan pequeños que la cámara de un móvil corriente no los resuelve con el brazo estirado. Un código largo suele ser señal de que lo que debería ir dentro es un enlace corto.

### ¿Por qué mi código es más grande si escribo el enlace en minúsculas?

Porque un código QR tiene un modo para mayúsculas y dígitos que empaqueta dos caracteres en once bits, y no tiene ninguno parecido para las minúsculas, que cuestan ocho bits cada una. Una URL escrita `HTTPS://EJEMPLO.COM/PAGINA` puede salir un tercio más pequeña que la misma URL en minúsculas. El esquema y el host no distinguen mayúsculas de minúsculas, así que gritarlos no cambia nada salvo el tamaño. La ruta que va después del host sí las distingue, así que a esa no la toques.

### ¿Puede leer un código QR además de hacerlo?

Esta página no, pero la de al lado sí: [el lector](https://abox.tools/es/escanear-codigo-qr/) toma una foto, una captura de pantalla o tu cámara y te devuelve la cadena. Es un trabajo bastante más grande que dibujar uno — encontrar el símbolo dentro de una imagen, corregir el ángulo desde el que se tomó y reparar el daño son tres problemas que esta página no tiene —, y por eso es una herramienta aparte y no un botón aquí. Funciona en los mismos términos que todo lo demás: no se sube nada, y no se guarda ningún fotograma de la cámara.

### ¿Para qué es el margen? ¿Puedo hacerlo más pequeño?

El espacio en blanco que rodea a un código QR forma parte del código. Un lector lo usa para saber dónde termina el símbolo, y la especificación pide cuatro módulos por cada lado; un código de barras quiere unos diez. Aquí puedes ponerlo a cero, y la imagen quedará más limpia, pero entonces bastantes escáneres no la verán en absoluto, sobre todo contra un fondo recargado. Si el problema es el espacio, haz el código más pequeño en vez de recortarle el margen.

### ¿Qué código de barras necesito?

El que te pida quien vaya a escanearlo. El EAN-13 es el código de barras del comercio fuera de Norteamérica y el UPC-A es el norteamericano, y los dos necesitan un número que te asigne GS1, porque el número identifica a tu empresa y no solo al producto. El EAN-8 es la versión corta para envases pequeños. El ITF-14 va en la caja de envío. Y el Code 128 y el Code 39 llevan texto además de dígitos y no necesitan ningún registro, lo que los convierte en la respuesta correcta para cualquier cosa interna: activos, estanterías, partes de trabajo.

### ¿Qué es un dígito de control y por qué lo ha añadido la herramienta?

Es el último dígito de un código de barras de comercio, calculado a partir de los anteriores para que un escáner pueda distinguir una lectura errónea de una buena. El EAN-13 quiere doce dígitos y calcula el decimotercero; el UPC-A quiere once y calcula el duodécimo. Escribe el número corto y esta página lo añade. Escribe el número completo y comprueba el que le has dado, y si no cuadra se niega en lugar de corregirlo sin decir nada, porque un dígito equivocado arreglado en silencio es una etiqueta que escanea como el producto de otra persona.

### ¿Puedo poner un logotipo en el centro de un código QR?

Aquí no, pero merece la pena saber por qué funciona en otros sitios: lo que lo hace posible es la corrección de errores. En el nivel H se puede destruir alrededor del 30 % de los módulos y el código se sigue leyendo, así que un logotipo que cubra bastante menos que eso en el centro, donde no hay ningún patrón de localización, es daño reparable. Pasa el código por tu editor de imágenes en el nivel H, mantén el logotipo por debajo de una quinta parte del área más o menos, y pruébalo con un móvil de verdad en vez de fiarte.

### ¿Por qué el SVG es mejor que el PNG?

Porque un código son bordes, y un PNG tiene un número fijo de píxeles con los que hacerlos. Amplía uno y todos los bordes se ablandan, y un borde blando es exactamente lo que le cuesta a un escáner. A una impresora de 1200 PPP a la que le das un PNG de 512 píxeles le estás pidiendo que se invente la diferencia. Un SVG son los cuadrados como instrucciones, así que se imprime nítido tanto en una tarjeta de visita como en una valla. Y el PNG de aquí está dibujado con un número entero de píxeles por módulo, que es lo mejor que puede hacer un PNG.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu texto fuera para que le dibujaran un código se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Lo que escribes no tiene adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger una contraseña de wifi, ni una línea de código que la mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. El código se construye a partir de la cadena de texto con aritmética y se dibuja como un SVG, aquí, en tu propio dispositivo.
- **El código no apunta hacia nosotros.** Lo que escribes es lo que lleva el código. Varios generadores gratuitos te devuelven un código que contiene un enlace a su propio sitio, que después redirige al tuyo: así ellos cuentan cada escaneo, y el código deja de funcionar el día en que dejan de pagar el dominio o deciden que el plan gratuito ha caducado. Aquí no hay nada que acorte, redirija ni rastree. La cadena que ves en la página es la cadena que hay dentro de la imagen.
- **El PNG se hace a partir del SVG que hay en pantalla.** La descarga no es un segundo dibujado que pudiera discrepar de la vista previa. Se le entrega el mismo marcado al navegador y se pinta sobre un lienzo, y esa es además la razón de que pueda hacerse sin contactar con nada: no hay ninguna tipografía que descargar ni ninguna imagen que cargar dentro.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada de lo que escribes. Cada línea que convierte una cadena en un código se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/qr-encode.js` y `src/qr.js` para el propio código QR, con los modos, la versión y los bloques en uno y los patrones, la máscara y los bits de formato en el otro, `src/gf256.js` para la corrección de errores, y `src/barcode.js` para los de rayas.
