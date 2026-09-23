# Imagen a ICO — crear un favicon y los iconos de Windows y macOS

Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.

> Convierte un PNG, JPEG o SVG en un .ico de verdad con varios tamaños, o en un .icns de macOS, dentro del navegador. Favicon, icono de aplicación de Windows, icono de Mac y los archivos de Apple y Android que necesita una web. No se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/crear-favicon/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

Tanto el escalado como los propios archivos de icono se hacen dentro de tu navegador. La imagen la dibuja el lienzo que el navegador ya trae de serie, y cada contenedor, sea el `.ico` de Windows o el `.icns` de macOS, se monta a partir de esos píxeles con un par de cientos de líneas que puedes leer en `src/ico.js` y `src/icns.js`. Esta herramienta no tiene ninguna función de red: no descarga nada y no envía nada. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un logotipo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo hacer un archivo .ico sin subir nada

1. **Elige la imagen.** Arrastra hasta el selector un PNG, JPEG, WebP o SVG, o coge varias y conviértelas de una vez. Lo más cómodo es que sea cuadrada, y con 256 píxeles o más ya hay detalle de sobra para todos los tamaños. El navegador la lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Elige los archivos que necesitas.** Windows y los navegadores leen `.ico`; un Mac lee `.icns` y ni mira el otro. Marca uno, o los dos si lo que estás haciendo se distribuye en ambos. Una web quiere además las imágenes extra de Apple, de Android y del mosaico, y eso es la tercera casilla.
3. **Di para qué es el icono.** El favicon de una web son 16, 32 y 48 píxeles; una aplicación de Windows quiere también 256; y una aplicación que tiene que verse bien en un portátil de alta densidad quiere los tamaños intermedios que pide Windows al 125 % y al 150 %. Elige el que encaje con el trabajo, o marca los tamaños tú. Cada tamaño de la lista viene con el nombre de quien lo pide. El `.icns` no te da esa elección: Apple nombra exactamente diez ranuras, y entran las diez.
4. **Resuelve la forma y el fondo.** Un icono es cuadrado y casi ningún logotipo lo es. Si rellenas, se conserva la imagen entera con espacio arriba y abajo; si recortas, se coge el centro; y si estiras, queda aplastada. La transparencia se conserva como transparencia, salvo que elijas un color para ponerlo detrás.
5. **Mira el de 16 píxeles antes de descargar.** Ese es el tamaño al que más veces se va a ver el icono, y donde desaparecen los trazos finos y las letras pequeñas. Cada cuadrado de la vista previa está dibujado a su tamaño real a partir de tu propio archivo. Si el más pequeño sale borroso, la solución es un dibujo más simple, no otro ajuste.
6. **Llévate los archivos.** Un .ico con todos los tamaños dentro, llamado `favicon.ico` cuando es eso lo que has pedido, porque esa es la dirección que buscan los navegadores. Un .icns al lado si marcaste esa opción, listo para meterlo en un paquete de aplicación de Mac. Y si marcas además el conjunto para web, te llevas las imágenes de Apple, de Android y del mosaico de Windows, el manifiesto y el bloque de HTML para pegar en tu página. Todo lo que sea más de un archivo baja como un solo zip.

## La versión larga

[Cómo hacer un favicon que todavía se lea a dieciséis píxeles](https://abox.tools/es/guias/como-hacer-un-favicon/): Qué tamaños necesita de verdad un favicon.ico, qué archivos extra piden los iPhone, Android y un Mac, y por qué un logotipo que funciona en un cartel desaparece a dieciséis píxeles.

## También en la caja

- [Imagen a data URI](https://abox.tools/es/imagen-a-base64/): La imagen entera en una línea de texto, lista para pegarla en tu CSS o tu HTML.
- [SVG a imagen](https://abox.tools/es/convertir-svg-a-png/): Di el tamaño. Un vector no tiene ninguno propio que perder.
- [Imagen a SVG](https://abox.tools/es/convertir-imagen-a-svg/): Una forma, un contorno. Señala lo que no debería estar ahí.
- [Comparador de alturas](https://abox.tools/es/comparar-alturas/): Escribe las alturas, llévate la imagen. No se envía nada para dibujarla.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. Tu propio navegador descodifica y escala la imagen en tu propio hardware, y el .ico se monta a partir de esos píxeles con código servido desde esta página. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio.

### ¿Qué tamaños debe contener un favicon.ico?

16, 32 y 48, y no es cuestión de gustos. El de 16 es lo que dibuja un navegador en una pestaña, el de 32 es lo que usa Windows para un acceso directo del escritorio y lo que usan varios navegadores para un marcador, y el de 48 es el tamaño al que Google lee el icono de un sitio. Todo lo que pase de ahí va en un PNG al lado del .ico, no dentro, y eso es justamente lo que produce el conjunto para web de aquí.

### ¿Qué tamaños necesita el icono de una aplicación de Windows?

16, 32, 48 y 256, que es lo que lleva el app.ico que trae por defecto el propio Visual Studio. El de 16 es la barra de título y la vista pequeña del Explorador, el de 32 el escritorio y la barra de tareas, el de 48 los iconos medianos del Explorador y el de 256 el menú Inicio y la vista extragrande. En una pantalla de alta densidad Windows pide además 20, 24, 40, 64 y 96, y si no están, los remuestrea del tamaño más cercano que tenga. El preajuste «todas las escalas» los mete.

### ¿Por qué el archivo es más grande que la imagen de la que partí?

Porque un .ico no es una imagen, sino varias, y las pequeñas se guardan sin comprimir para que las pueda leer cualquier cosa. Una entrada de 32x32 son exactamente 4264 bytes lleve lo que lleve, y una de 256x256 sin comprimir son 264 KB. Por eso, a partir de 64 píxeles, los tamaños se guardan como PNG. Si eliges «PNG para todos los tamaños» sale el archivo más pequeño posible; si eliges sin comprimir para todos, el más compatible.

### ¿Qué diferencia hay entre las entradas PNG y las sin comprimir?

Solo cómo se guardan los píxeles dentro del .ico. Una entrada sin comprimir es la disposición original de Windows, con una cabecera de mapa de bits, los píxeles del revés y una máscara de transparencia de un bit, y la sabe leer cualquier versión de Windows publicada jamás. Una entrada PNG es un archivo PNG entero metido dentro del icono, que en los tamaños grandes ocupa de tres a diez veces menos, pero que solo se entiende desde Windows Vista en adelante. El ajuste por defecto usa cada uno donde gana: sin comprimir hasta 64 píxeles y PNG por encima.

### ¿Puede hacer un icono más grande que 256 píxeles?

No, y no puede nada. El formato guarda cada lado en un solo byte, y el 0 está cogido, porque significa 256. Ese es el techo, así que un .ico que contenga una imagen de 512 píxeles no es un icono más grande: es un icono roto. Si necesitas 512, necesitas un PNG, que es justo lo que incluye el conjunto para web para Android y para la pantalla de arranque de una aplicación web.

### ¿Conserva la transparencia?

Sí, en los dos tipos de entrada, y además escribe la vieja máscara de un bit junto al canal alfa, para que el software demasiado antiguo para leer el alfa siga recortando el icono en vez de pintarte una caja negra. El único archivo que se hace opaco a propósito es el icono táctil de Apple del conjunto para web: iOS lo compone sobre su propio mosaico y convierte la transparencia en negro, así que se aplana sobre tu color de fondo, que por defecto es blanco.

### Mi logotipo es un texto ancho. ¿Qué le pasa?

Algo tiene que pasarle, porque un icono es cuadrado. Si lo rellenas, se conserva entero pero queda pequeñísimo: un texto rellenado dentro de un cuadrado de 16 píxeles mide unos tres píxeles de alto y no hay quien lo lea. Recortar al centro suele funcionar mejor, o saca el símbolo del conjunto y usa solo eso, como hace casi cualquier marca con su favicon. La vista previa te enseña cuál de los dos sobrevive antes de que descargues nada.

### ¿Qué hay en el conjunto para web y necesito todo?

Siete PNG, un manifiesto de aplicación web, un browserconfig.xml y un bloque de HTML para pegar. Lo necesitas porque un .ico cubre los navegadores y Windows y nada más: la pantalla de inicio de un iPhone lee un PNG de 180 píxeles con un nombre propio, Android y cualquier aviso de instalación leen el manifiesto, y un mosaico anclado al menú Inicio lee el XML. Ninguno de ellos va a mirar dentro de un .ico. Todo se genera aquí, en tu dispositivo, y el zip lleva dentro una nota que dice para qué es cada archivo.

### ¿Puede hacer también un icono de macOS?

Sí. Marca *icono de macOS* y te llevas un `.icns` junto al `.ico`, o en su lugar. Es otro contenedor para la misma idea, y ninguno de los dos sistemas leerá el del otro: Windows quiere .ico y un paquete de aplicación de Mac quiere .icns. Ahí los tamaños no se eligen, porque Apple publica exactamente diez ranuras: 16, 32, 64, 128, 256, 512 y 1024 píxeles, con tres de ellas apareciendo dos veces como la versión Retina del tamaño de debajo. Entran las diez, dibujadas a partir de siete renders, y por eso un .icns es el archivo más grande.

### ¿Cómo uso el archivo .icns?

Para una aplicación va dentro del paquete, en `TuApp.app/Contents/Resources/`, y se nombra en `Info.plist` bajo `CFBundleIconFile`; cualquier herramienta de empaquetado de Mac tiene un campo para eso. Para cualquier otra cosa, selecciona el archivo en el Finder y pulsa Comando-C, luego abre Obtener información sobre la carpeta o la imagen de disco que quieras cambiar, haz clic en el icono pequeño de arriba a la izquierda y pulsa Comando-V.

### ¿El .icns es igual que el que hace iconutil?

Lleva las mismas diez ranuras con los mismos tipos de cuatro letras, y un PNG en cada una, que es lo que produce `iconutil` a partir de una carpeta `.iconset`. Hay una diferencia deliberada: la herramienta de Apple escribe además un elemento `TOC` , un índice de los tipos y las longitudes que vienen después. Eso es una optimización más que parte del formato, porque un lector sin él recorre los elementos de punta a punta y llega a la misma respuesta. Y como un índice equivocado es peor que ningún índice, se deja fuera.

### ¿Puedo convertir varias imágenes a la vez?

Sí. Cada imagen de la lista se convierte en su propio .ico con los mismos ajustes, y el lote baja como un solo zip con una carpeta por imagen, porque si no, dos de ellos se llamarían favicon.ico y uno sobrescribiría al otro. Cada salida que hayas marcado se hace para cada imagen. Haz clic en cualquier fila para poner esa imagen en la vista previa.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagándolos: el trabajo lo hace tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tu logotipo fuera a convertir se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tu logotipo no tiene adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. El escalado es un `drawImage` sobre un lienzo, y cada icono es una cabecera que `src/ico.js` o `src/icns.js` escriben delante de esos píxeles, aquí en esta página.
- **El archivo se describe a partir de sus propios bytes.** La lista de tamaños que ves junto a un icono terminado no es la lista de tamaños que pediste. Se vuelve a leer del archivo recién escrito, con `readIcoDirectory` o `readIcnsElements`, así que si alguna vez un escritor discrepara de los ajustes, te lo diría la página en lugar de enterarte tú cuando Windows no dibujara nada y macOS te pintara una hoja de papel en blanco.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tu imagen. Cada línea que lee, escala o escribe un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/ico.js` y `src/icns.js` para los dos formatos de icono, con el directorio, las entradas y la máscara en uno y las diez ranuras que nombra Apple en el otro, y `src/sizes.js` para saber de dónde sale cada tamaño de los que ves en la página.
