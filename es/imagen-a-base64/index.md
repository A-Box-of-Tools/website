# Imagen a data URI — codificar una imagen en base64 para CSS o HTML

La imagen entera en una línea de texto, lista para pegarla en tu CSS o tu HTML.

> Convierte un PNG, JPEG, SVG o WebP en un data URI listo para pegar en tu CSS o tu HTML. Los SVG se codifican con porcentajes y no en base64, así que salen más cortos y siguen leyéndose. Todo en el navegador, sin subir nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/imagen-a-base64/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus imágenes **nunca se suben**. No hay ningún servidor.

La codificación ocurre dentro de tu navegador, en tu propio hardware. Es aritmética sobre unos bytes que la página ya tiene: sin codificador, sin servidor y sin ningún paso de red que quitar. Esta herramienta no tiene ninguna función de red, no descarga nada y no envía nada. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar una imagen.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin recodificar
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir una imagen en un data URI

1. **Elige tus imágenes.** Arrástralas hasta el selector o búscalas a mano. El navegador las lee directamente del disco, y mientras lo haces no sale nada hacia ninguna parte.
2. **Di adónde va el resultado.** El URI a secas, una regla CSS, una propiedad personalizada, una etiqueta `<img>` o Markdown. Todas entrecomillan el URI, que es el detalle del que depende que un SVG incrustado funcione o falle en silencio.
3. **Lee lo que ha costado.** Cada resultado te dice en cuántos caracteres se ha convertido, cuánto más grande es eso que el archivo, y si incrustar algo de ese tamaño es buena idea. Base64 añade un tercio, y si ese tercio compensa una petición ahorrada depende por completo del tamaño, así que la página te dice de qué lado de la raya caes.
4. **Mira los avisos.** Si la imagen lleva EXIF, un perfil de color o XMP, se te dice cuál es y cuántos bytes de tu resultado son eso. Si la extensión no coincide con el formato real, la página usa el formato y te avisa. Y si tu navegador no sabe dibujar el resultado, también te lo dice.
5. **Copia o descarga.** Un botón por resultado, y uno para todos a la vez. Las propiedades personalizadas salen envueltas en un bloque `:root`, listas para pegarlas al principio de una hoja de estilos.

## La versión larga

[Cuándo meter una imagen dentro de tu CSS y cuándo no](https://abox.tools/es/guias/incrustar-una-imagen-en-css/): Lo que cuesta un data URI, por qué base64 añade un tercio y gzip no te lo devuelve, por qué un SVG no debería ir nunca en base64, y el error de comillas que rompe los SVG incrustados sin decir nada.

## También en la caja

- [SVG a imagen](https://abox.tools/es/convertir-svg-a-png/): Di el tamaño. Un vector no tiene ninguno propio que perder.
- [Imagen a SVG](https://abox.tools/es/convertir-imagen-a-svg/): Una forma, un contorno. Señala lo que no debería estar ahí.
- [Comparador de alturas](https://abox.tools/es/comparar-alturas/): Escribe las alturas, llévate la imagen. No se envía nada para dibujarla.
- [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/): Tú dices el tamaño. Del resto se encarga él.

## Preguntas

### ¿Se sube mi imagen a alguna parte?

No. El archivo lo lee y lo codifica tu propio navegador, en tu propio hardware, con dos funciones que ya trae. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Además, la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, y ninguna de ellas es de este sitio.

### ¿Qué es un data URI?

Una forma de escribir un archivo entero donde normalmente iría una dirección web. En vez de `url("logo.png")`, que le manda al navegador ir a buscar algo, escribes `url("data:image/png;base64,iVBORw0...")`, que ya contiene la propia imagen. El navegador la descodifica ahí mismo. El efecto práctico es una petición menos: la imagen llega con la hoja de estilos o con la página, y no después de ellas.

### ¿Por qué mi SVG no sale en base64?

Porque base64 es la codificación equivocada para él. Un SVG es texto, y una URL ya admite texto: basta con escapar un puñado de caracteres. Si codificas esos con porcentajes y dejas el resto en paz, sale un URI que suele ser una quinta parte más corto que el base64 del mismo archivo, y que además puedes seguir leyendo en tu hoja de estilos, porque los nombres de elemento, los colores y el `viewBox` siguen ahí para editarlos. Hay una casilla para forzar base64, por si te toca esa rara cadena de herramientas que insiste en ello.

### ¿Cuánto agranda base64 mi imagen?

Alrededor de un tercio. Tres bytes de archivo se convierten en cuatro caracteres de base64, o sea un 33 % antes de sumarle el `data:image/png;base64,` de delante. Ese es el suelo, y es inevitable: es lo que cuesta escribir bytes cualesquiera usando solo los caracteres que admite una URL. También es la razón de que la página te enseñe el número de caracteres junto al tamaño del archivo, en lugar de dejar que lo descubras con la hoja de estilos ya desplegada.

### ¿Cuándo compensa de verdad incrustar una imagen?

Cuando es pequeña y hace falta ya. Un icono de 2 KB dentro de una hoja de estilos que cargan todas las páginas es una victoria clara: un viaje de ida y vuelta menos, y la imagen está ahí en el mismo momento que el CSS. Pasados unos 10 KB el trato se da la vuelta. Una imagen incrustada deja de ser un archivo aparte, así que no se puede cachear por su cuenta, no se puede descargar en paralelo con nada y se vuelve a bajar entera cada vez que cambia el archivo que la rodea. Una fotografía de 200 KB en una hoja de estilos son 200 KB añadidos al camino crítico de todas las páginas del sitio. La página te dice de qué lado de esa raya cae cada resultado.

### ¿Gzip deshace el coste añadido de base64?

Menos de lo que la gente espera. El base64 de un archivo que ya venía comprimido, y eso es lo que son un PNG, un JPEG y un WebP, se comprime mal, porque apenas queda redundancia que el compresor pueda encontrar. Lo normal es recuperar más o menos una décima parte del tercio que añadió base64, no el tercio entero. Un SVG codificado con porcentajes es el caso contrario: sigue siendo texto, así que se comprime casi igual de bien que antes, y esa es otra razón para no pasarlo a base64.

### ¿Esto le cambia algo a mi imagen?

No, y es una diferencia deliberada respecto a casi todas las herramientas de aquí. No se descodifica nada a píxeles ni se vuelve a codificar: los bytes que salieron de tu disco son los mismos que entran en el URI. Un JPEG sigue siendo exactamente el JPEG que era, con la misma calidad y las mismas dimensiones. Por eso el resultado se puede describir como el mismo archivo y no como una copia.

### Entonces, ¿mis datos EXIF y GPS también entran en la hoja de estilos?

Sí, y esta es la parte que conviene pensar antes de pegar nada. Como no se recodifica nada, todo lo que escribió la cámara viaja con la imagen: la ubicación, la marca de tiempo, el número de serie de la cámara. En una foto de móvil eso pueden ser 30 KB del archivo, que se convierten en 40 KB de base64 en el camino crítico de tu página, y en una dirección de casa metida en algo que va a acabar en un repositorio. La página lee cuántos metadatos hay en un JPEG, un PNG o un WebP y te lo dice. Para quitarlos antes, tienes el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/).

### ¿Por qué ha usado un tipo distinto del de la extensión de mi archivo?

Porque la extensión puede estar equivocada y los bytes no. Un archivo llamado `logo.png` que en realidad se exportó como JPEG es lo bastante habitual como para que cualquier herramienta de imagen tenga que apañárselas con ello, y un data URI que declara el tipo equivocado sencillamente no se ve, sin alternativa ni mensaje de error que merezca la pena leer. Así que el tipo se lee de los primeros bytes del archivo, que en todos los formatos de aquí dicen sin ninguna duda qué es, y la página te avisa cuando los dos no coinciden.

### La vista previa sale en blanco. ¿Qué ha fallado?

Seguramente nada del URI. Tanto el HEIC como el TIFF dan data URI perfectamente válidos que ningún navegador salvo Safari va a dibujar, así que la imagen faltará también allá donde lo pegues. Conviértela antes a PNG, JPEG o WebP con el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) o el [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/). Si el formato es de los corrientes, lo más probable es que el archivo esté dañado: la vista previa se dibuja a partir del URI que ha construido esta página, así que una vista en blanco significa que la imagen no ha descodificado.

### ¿Hay algún límite de tamaño en un data URI?

Ninguno con el que te vayas a topar en CSS ni en una etiqueta `<img>`, porque los navegadores modernos no ponen ahí ningún tope práctico. Lo que sí limitan es teclear un data URI en la barra de direcciones, cosa que casi todos ya rechazan para cualquier cosa que no sea trivial, por motivos de seguridad que nada tienen que ver con este uso. El límite de verdad es el de más arriba: mucho antes de que se rompa nada técnico, la página que lo lleva se ha vuelto más lenta de lo que habría sido con un archivo de imagen normal.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagándolos: el trabajo lo hace tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus imágenes.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus imágenes fuera a codificar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus imágenes no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. La codificación son `btoa` y `encodeURIComponent`, dos funciones que el navegador trae desde siempre y que cogen bytes y devuelven texto sin ir a ninguna parte.
- **La vista previa es la prueba.** La imagen que hay junto a cada resultado se dibuja a partir del data URI que acaba de construir esta página, no a partir de tu archivo. Se ve porque el URI está bien, en tu dispositivo y sin ningún servidor de por medio. Y si no se ve, la página te lo dice en lugar de darte algo roto.
- **El aviso de metadatos está de tu lado.** Un data URI copia el archivo exactamente, así que la posición GPS de una fotografía se te viene hasta la hoja de estilos con ella. Esta página lee cuánto hay de eso y te lo cuenta, porque la alternativa es enterarte cuando ya está en el repositorio.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tus imágenes. Cada línea que lee o codifica un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/encode.js` para las dos codificaciones y el razonamiento detrás de cada una, `src/sniff.js` para ver cómo se lee el tipo de medio del archivo y no de su nombre, y `src/metadata.js` para la comprobación que dice cuánto de lo que estás a punto de pegar no es la imagen.
