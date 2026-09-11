# SVG a imagen — rasteriza un vector a PNG, JPEG o WebP a cualquier tamaño

Di el tamaño. Un vector no tiene ninguno propio que perder.

> Convierte un SVG en un PNG, JPEG o WebP a cualquier tamaño, dentro del navegador. Di el ancho, un múltiplo o una caja, y llévate también las copias @2x y @3x. Se conserva la transparencia y no se sube nada.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/convertir-svg-a-png/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus archivos SVG **nunca se suben**. No hay ningún servidor.

El dibujo lo rasteriza el mismo motor que acaba de ponerlo en tu pantalla. Tu archivo se lee de tu disco, su etiqueta raíz se reescribe al tamaño que has pedido con cien líneas de `src/svg.js` que puedes leer, y se dibuja sobre un lienzo que el navegador ya trae de serie. Esta herramienta no tiene ninguna función de red: no descarga nada y no envía nada. Y aunque la tuviera, al otro lado de esta página no hay ningún servidor al que mandar un logotipo.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo convertir un SVG en un PNG sin subirlo

1. **Elige el SVG.** Arrastra uno hasta el selector, o coge una carpeta entera y conviértelos todos de una vez. El navegador lee el archivo directamente del disco, y mientras lo haces no sale nada hacia ninguna parte. Cada fila dice de qué tamaño se cree el archivo, y lo dice de otra manera cuando ese tamaño ha salido de su `viewBox` o se ha dado por supuesto porque el archivo no declara ninguno.
2. **Di de qué tamaño.** Un múltiplo del tamaño propio del archivo es la respuesta más rápida, y la correcta para un lote: cada dibujo se escala desde su propio punto de partida, así que un conjunto de iconos mantiene sus proporciones. Si no, di un ancho, un alto, el lado más largo o una caja con los dos lados. Aquí un número grande no se paga, como sí se pagaría con una fotografía, porque el dibujo se vuelve a dibujar a ese tamaño en vez de estirarse hasta él.
3. **Añade las copias de alta densidad si las necesitas.** Un móvil y un portátil Retina dibujan dos o tres píxeles de dispositivo por cada píxel CSS, así que un logotipo de 200 píxeles necesita detrás un archivo de 400 o de 600. Pide `@2x` y `@3x` y saldrán con los nombres que esperan Xcode, las herramientas de Android y el `image-set()` de CSS, y cada uno será exactamente el doble o el triple del primero, sin redondearse por separado.
4. **Elige el formato y decide sobre la transparencia.** PNG, salvo que tengas un motivo para otra cosa: no tiene pérdidas, conserva la transparencia y comprime bien el color plano. El JPEG no tiene transparencia ninguna, así que se pinta un color de fondo elijas uno o no, porque sin él cada píxel transparente saldría negro. El WebP hace las dos cosas y da un archivo más pequeño, a costa del software lo bastante viejo como para no leerlo.
5. **Mira la vista previa antes de descargar.** La dibuja el mismo código que escribe el archivo, a partir de tu archivo y en tu dispositivo. Cuando un dibujo se convierte en píxeles cambian dos cosas, y las dos se ven aquí: una línea de un pelo que medía medio píxel se vuelve gris, y el texto se dibuja con una tipografía que tenga este dispositivo y no con una traída de la web.
6. **Llévate los archivos.** Una descarga por archivo, o el lote entero como un solo zip. Los nombres siguen al SVG del que salieron, con `@2x` y `@3x` en las copias, y dos archivos que habrían tenido el mismo nombre se numeran, en vez de que uno reemplace al otro sin decir nada.

## La versión larga

[Cómo convertir un SVG en un PNG al tamaño correcto](https://abox.tools/es/guias/convertir-un-svg-a-png/): Un vector no tiene tamaño propio en píxeles, así que el número lo pones tú. De dónde sale ese número para una pantalla, para el icono de una aplicación y para una imprenta, y qué cambia cuando un dibujo se convierte en píxeles.

## También en la caja

- [Imagen a SVG](https://abox.tools/es/convertir-imagen-a-svg/): Una forma, un contorno. Señala lo que no debería estar ahí.
- [Comparador de alturas](https://abox.tools/es/comparar-alturas/): Escribe las alturas, llévate la imagen. No se envía nada para dibujarla.
- [Compresor de imágenes](https://abox.tools/es/comprimir-imagen/): Tú dices el tamaño. Del resto se encarga él.
- [Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/): Di el tamaño. Dibuja la caja. Elige el formato.

## Preguntas

### ¿Se sube mi SVG a alguna parte?

No. Tu propio navegador lee el archivo en tu propio hardware, lo dibuja sobre un lienzo con el mismo motor que renderiza cualquier otra imagen que veas, y te lo devuelve como una descarga. Esta herramienta no tiene ninguna función de red: nunca descarga nada y nunca envía nada. Y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio.

### ¿A qué tamaño debería rasterizar un SVG?

Al que pida quien vaya a leerlo, multiplicado por la densidad de píxeles de la pantalla en la que se va a ver. Un logotipo que ocupa 200 píxeles CSS necesita 400 para un portátil Retina y 600 para un móvil reciente, que es lo que son aquí las copias `@2x` y `@3x`. Para el icono de una aplicación o una ficha de tienda, la tienda te da un número exacto y ese es el número. Y cuando nadie te ha dicho nada, 1024 en el lado más largo es un valor por defecto muy útil: lo bastante grande para casi cualquier uso y lo bastante pequeño para mandarlo por correo.

### ¿Hacerlo más grande hace perder calidad?

No, y este es el único sitio donde esa respuesta es honestamente que no. Un vector son instrucciones y no píxeles, así que el navegador vuelve a dibujar las curvas al tamaño que se le pida. Sacar 4000 píxeles de un icono de 24 sale exactamente igual de nítido que los 24. Lo que no se puede es ir al revés: una vez que es un PNG son píxeles como cualquier otra cosa, así que rasteriza al tamaño que necesites en vez de redimensionar el resultado después.

### Mi SVG no tiene ancho ni alto. ¿Qué tamaño me sale?

El del `viewBox`, si lo hay. Su ancho y su alto son unidades de usuario y no píxeles, pero son los únicos números del archivo y un navegador los trata como el tamaño natural del dibujo. Si tampoco hay viewBox, la página pone *supuesto* junto a la fila y usa ⁦300 × 150⁩, que es a lo que lo habría dibujado un `<img>`. En cualquier caso puedes decir el tamaño que quieras y el archivo se dibuja a ese.

### ¿Por qué el texto se ve distinto en el PNG?

Porque la tipografía no está dentro del SVG. Un SVG que dibuja texto nombra una tipografía y deja que la máquina la encuentre, y un archivo que se trae una de Google Fonts con un `@import` aquí no consigue nada: a un SVG dibujado a través de un `<img>` no se le permite descargar nada, que es la misma regla que le impide llamar a casa con tu archivo. La solución la conoce ya cualquier diseñador: convierte el texto en trazados en el programa de dibujo antes de exportar. Así es geometría, y se ve igual en todas partes.

### ¿Puede convertir varios archivos a la vez?

Sí. Todos los SVG de la lista se renderizan con los mismos ajustes y el lote baja como un solo zip. Para un lote, el ajuste correcto suele ser un múltiplo, del tipo «4× el tamaño que pide el archivo», porque así cada dibujo se escala desde su propio tamaño en lugar de forzarlos todos al mismo número de píxeles. Haz clic en cualquier fila para poner ese en la vista previa.

### ¿Hay algún límite de tamaño?

El del navegador, no el nuestro. Un lienzo se rinde en algún punto pasados los 16 384 píxeles de lado, y Safari en un iPhone o un iPad se planta alrededor de los 16,7 megapíxeles de superficie, o sea ⁦4096 × 4096⁩. Por encima de eso la página te avisa en vez de devolverte una imagen en blanco, que es lo que hace un navegador cuando se ha quedado sin recursos: `toBlob` no devuelve nada, y sin ningún error que lo explique. Pasados los 100 megapíxeles la herramienta se niega, porque eso son 400 MB de lienzo antes de haber codificado un solo byte.

### ¿Qué pasa con la transparencia?

Se conserva, tanto en PNG como en WebP. El JPEG no tiene canal alfa, así que se pinta un color detrás de toda la imagen pidas uno o no, porque sin él todo lo transparente saldría negro, y eso parece un error en lugar de parecer un JPEG. Elegir un color de fondo con PNG también es algo perfectamente normal de querer: aplana el dibujo sobre ese color en vez de dejar un hueco.

### ¿Puede leer un SVG que contenga un script o una imagen externa?

Leerlo puede, y dibujará exactamente las partes que un navegador esté dispuesto a dibujar. Un SVG cargado a través de un `<img>` está en *modo estático seguro*: los scripts no se ejecutan, las referencias externas no se descargan y la animación no se reproduce, así que lo que te llevas es el primer fotograma. Un archivo con un `<image>` remoto dentro sale con esa parte ausente. Eso es el navegador negándose en tu nombre, y es la razón de que esta página pueda abrir sin peligro un archivo que no ha visto nunca.

### ¿En qué se diferencia esto del redimensionador de imágenes?

En cuál es el origen. El redimensionador de imágenes parte de píxeles, sea un JPEG o un PNG, así que hacerlo más grande le obliga a inventarse detalle que nunca estuvo ahí. Esto parte de un dibujo, así que no hay nada que inventar ni ningún límite superior del que preocuparse. Si lo que tienes es un SVG, esta es la que te da un resultado nítido; si lo que tienes es una fotografía, es la otra.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni marca de agua. Tampoco hay límite en el número ni en el tamaño de los archivos, porque no hay ningún servidor pagándolos: el trabajo lo hace tu propio dispositivo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus archivos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus dibujos fuera a renderizar se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus dibujos no tienen adónde ir.** La Content-Security-Policy enumera todas las direcciones a las que esta página puede conectarse, y ninguna es de este sitio. Aquí no hay ningún destino donde recoger tus archivos, ni una línea de código que los mandara si lo hubiera.
- **Aquí nada le pide nada a la red.** En todo `src/` no hay un solo `fetch`, ni un `XMLHttpRequest`, ni un `sendBeacon`. El rasterizador entero son un `<img>` que sostiene un blob de tu propio archivo, un `drawImage` sobre un lienzo y un `canvas.toBlob`.
- **Un SVG es un documento, y este es el modo en el que no puede actuar.** Un SVG puede llevar un `<script>`, un `<image href="https://…">` remoto, una hoja de estilos y una tipografía web. Dibujado a través de un `<img>` está en lo que la especificación llama *modo estático seguro*: el script no se ejecuta y no se descarga ninguna de esas direcciones. Eso lo garantiza el navegador, no lo prometemos nosotros, y es la razón de que esta página pueda abrir un archivo que no ha visto nunca sin que el archivo pueda llamar a casa.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google, y el botón de donación, de Buy Me a Coffee. A ninguno se le entrega nada sobre tu dibujo. Cada línea que lee, dimensiona o dibuja un archivo se sirve desde este origen y está en el repositorio.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta sigue igual, porque nunca hubo dentro de ella ningún paso que pasara por la red. Es la prueba más sencilla de todas.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/svg.js` para ver cómo se lee el tamaño propio de un archivo y cómo se reescribe su etiqueta raíz, y `src/render.js` para las ocho líneas que hacen el rasterizado: un <img>, un `drawImage` y un `toBlob`, sin nada en medio.
