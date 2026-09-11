# Cuándo meter una imagen dentro de tu CSS y cuándo no

Una imagen escrita dentro de una hoja de estilos llega con ella, sin una segunda petición y sin esperas. Pero también deja de ser un archivo, así que ya no se puede cachear por su cuenta y se vuelve a descargar cada vez que cambia algo a su alrededor. Aquí va dónde compensa ese trato y dónde no, aunque no se note.

[Abrir Imagen a data URI](https://abox.tools/es/imagen-a-base64/): La imagen entera en una línea de texto, lista para pegarla en tu CSS o tu HTML.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [Imagen a data URI](https://abox.tools/es/imagen-a-base64/), suelta la imagen dentro, elige *una propiedad personalizada de CSS* y pega la línea al principio de tu hoja de estilos. Después úsala como `background-image: var(--logo)` donde te haga falta.

Hazlo cuando la imagen sea pequeña, del tipo icono, viñeta, flecha o patrón, y haga falta en todas las páginas. No lo hagas con una fotografía. Todo lo de abajo es por qué esas dos frases se contradicen, y cómo saber cuál de los dos casos tienes delante.

## Qué es en realidad un data URI

Una dirección que contiene la cosa en vez de apuntar a ella. Donde una hoja de estilos diría normalmente

```
background-image: url("logo.png");
```

y el navegador va a buscar `logo.png`, un data URI dice

```
background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...");
```

y no hay nada que buscar: la imagen ya está ahí, escrita en caracteres. Tiene tres partes. `data:` es el esquema. `image/png` es el tipo de medio, y el navegador se lo cree a pies juntillas, como se ve más abajo. Y todo lo que va después de la coma es el archivo.

Ahí está la idea entera. No es ningún truco ni ningún apaño: está en los estándares desde 1998 y funciona en todos los navegadores publicados desde entonces.

## Lo que te compra: un viaje de ida y vuelta menos

Lo que ahorras no es ancho de banda: es la petición.

Un navegador no puede pedir `logo.png` hasta que ha leído la hoja de estilos que lo menciona, y no puede leer la hoja de estilos hasta que se la ha descargado. Así que una imagen de fondo corriente está al menos a dos viajes de ida y vuelta de profundidad dentro de la carga de la página, y en un móvil con red lenta un viaje de ida y vuelta pueden ser un par de cientos de milisegundos, por pequeño que sea el archivo. Transferir una flecha de 600 bytes no cuesta casi nada, y aun así puede tardar un cuarto de segundo en llegar.

Incrustada, llega con la hoja de estilos. Ahí está toda la ganancia, y para un icono pequeño que aparece en la primera pantalla es una ganancia de verdad.

## Lo que cuesta: un tercio, y después la caché

**Base64 añade alrededor de un tercio.** Tres bytes de archivo se convierten en cuatro caracteres, porque eso es lo que cuesta escribir bytes cualesquiera usando solo los caracteres que admite una URL. No hay codificador ingenioso que se libre. Un PNG de 9 KB son 12 KB de hoja de estilos.

**La compresión no te lo devuelve.** Esta es la parte que la gente da por hecha. Gzip y Brotli funcionan encontrando redundancia, y un PNG, un JPEG y un WebP ya vienen comprimidos: les queda muy poca redundancia, y base64 no añade ninguna. En la práctica recuperas más o menos una décima parte de ese tercio, no el tercio entero. (Un SVG es el caso contrario, y de eso va el apartado siguiente.)

**Deja de ser un archivo.** Este es el coste que no aparece en ninguna medición que sea probable que hagas, y es el que importa cuando la cosa crece:

- **No se puede cachear por su cuenta.** Una imagen corriente se descarga una vez y se reutiliza durante un año. Una incrustada es parte de la hoja de estilos, así que vive y muere con la entrada de caché de la hoja de estilos.
- **Cambiar cualquier cosa lo vuelve a descargar todo.** Arreglas un margen, publicas una hoja de estilos nueva y todos los visitantes se vuelven a descargar con ella la imagen incrustada: una imagen que no ha cambiado en dos años.
- **Está en el camino crítico.** Una hoja de estilos bloquea el renderizado y una imagen no. Incrustar una imagen la pasa de la segunda categoría a la primera: la página no puede pintar hasta que ha llegado todo, imagen incluida.
- **No se puede descargar en paralelo.** Los navegadores bajan muchas cosas a la vez. Una imagen incrustada no es una cosa aparte, así que no se lleva nada de eso.

Los umbrales, a ojo, marcan dónde cambia el consejo y no dónde el navegador haga nada distinto: por debajo de unos 2 KB es una victoria clara; hasta unos 10 KB suele seguir compensando para algo que sale en todas las páginas; y pasados los 50 KB es un error que no da ningún mensaje de error. [La herramienta](https://abox.tools/es/imagen-a-base64/) te dice en qué franja cae cada resultado, con el número de caracteres al lado.

![La tarjeta de salida: una regla CSS con un URI de datos en base64, y al lado el tamaño del archivo original y el del codificado.](https://abox.tools/screens/embed-an-image-in-css/output.webp)

La copia codificada es alrededor de un tercio más grande que el archivo del que salió. Ese es el coste del que trata esta sección, y aparece impreso en lugar de dejarse descubrir.

## No pases nunca un SVG a base64

Este es el error más frecuente de las imágenes incrustadas, y lo cometen los exportadores y los complementos de compilación tanto como las personas.

Un SVG es texto y una URL ya admite texto. Solo hay que escapar un puñado de caracteres, que son `%`, `#`, `<`, `>` y la comilla con la que lo hayas envuelto, y el resto se queda exactamente como está. Codificado así sale un URI que suele ser una quinta parte más corto que el base64 del mismo archivo, y que encima se comprime como texto y no como ruido.

Y además sigue siendo legible:

```
background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E...");
```

Ahí ves el `viewBox`, y puedes cambiar el color de relleno en tu editor sin descodificar nada. Pasa ese mismo archivo a base64 y se convierte en un muro de letras que no va a volver a tocar nadie. [Imagen a data URI](https://abox.tools/es/imagen-a-base64/) hace esto automáticamente con todo lo que resulte ser un SVG, y tiene una casilla para esa rara cadena de herramientas que insiste en `;base64`.

## El error de comillas que solo rompe los SVG

CSS te deja escribir `url()` sin comillas, y para un nombre de archivo corriente eso está bien:

```
background-image: url(logo.png);
```

Haz lo mismo con un SVG codificado con porcentajes y se rompe. Un token `url()` sin comillas termina en el primer espacio, paréntesis, comilla o carácter de control, y un SVG va lleno de espacios, entre cada atributo y cada número de un trazado. Así la declaración queda inválida, el CSS descarta las declaraciones inválidas sin decir nada, y te quedas sin fondo y sin error.

La solución son comillas, siempre:

```
background-image: url("data:image/svg+xml,%3Csvg ... %3E");
```

Es además la razón de que un codificador no tenga que escapar los espacios, porque dentro de una URL entrecomillada son perfectamente legales y escapar cada uno como `%20` costaría tres caracteres por espacio. Las dos decisiones van juntas: entrecomilla el URI y podrás dejar los espacios en paz. Todas las formas que produce la herramienta van entrecomilladas justamente por esto.

## El tipo de medio tiene que estar bien

Un data URI declara su propio tipo y el navegador se lo cree. Aquí no hay detección de reserva como la hay con un archivo descargado: di `image/png` de algo que en realidad es un JPEG y la imagen no se dibuja, sin ningún mensaje en ningún sitio útil.

Y eso importa porque las extensiones de archivo mienten. Una foto exportada como JPEG y renombrada `logo.png` es de lo más habitual en un disco. En cambio, los primeros bytes de un archivo de imagen dicen sin ninguna duda qué es, porque todos los formatos tienen su firma, así que una herramienta debería leer el archivo y no su nombre. La de aquí lo hace, y te avisa cuando los dos no coinciden.

Hay dos formatos que conviene tener fichados porque fallan de una forma confusa. El **HEIC**, que es en lo que fotografía un iPhone, y el **TIFF**, que es lo que sacan los escáneres, dan los dos data URI perfectamente válidos que ningún navegador salvo Safari va a dibujar. El URI no está roto: sencillamente el formato no es de los que admite la web. Conviértelos antes.

## Los metadatos que no querías publicar

Un data URI es una copia del archivo, byte por byte. No se descodifica ni se recodifica nada, que suele ser precisamente la gracia, porque así no se pierde calidad, pero eso también significa que todo lo demás del archivo se viene contigo.

Una fotografía recién salida de un móvil lleva EXIF: las coordenadas GPS del sitio donde se tomó, la marca de tiempo, el modelo de cámara y muchas veces su número de serie. Eso pueden ser 30 KB del archivo, que incrustados se convierten en 40 KB de base64 dentro de tu hoja de estilos, en el camino crítico de todas las páginas. Y en una dirección de casa metida en un repositorio, en un sitio donde a nadie se le va a ocurrir mirar.

Quítalo antes con el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/), que reescribe el contenedor sin tocar la imagen, y que tiene además su propia [guía](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/). Imagen a data URI lee cuántos metadatos hay en un JPEG, un PNG o un WebP y te lo dice antes de que copies nada.

## Dónde ponerlo, una vez que lo tienes

Si la imagen aparece en una sola regla, pon el URI en esa regla. Si aparece en varias, cosa que con los iconos pasa en cuanto cuentas el estado de hover y el tema oscuro, decláralo una vez como propiedad personalizada:

```
:root {
  --icono-buscar: url("data:image/svg+xml,%3Csvg ... %3E");
}

.campo-busqueda { background-image: var(--icono-buscar); }
.boton-busqueda::before { content: var(--icono-buscar); }
```

Un URI de 3 KB pegado en cuatro reglas son 12 KB de hoja de estilos y cuatro sitios que tocar cuando cambie el icono. Con la propiedad personalizada es uno de cada. Y es además lo que hace que los temas funcionen: redefine `--icono-buscar` dentro de una media query y todos sus usos van detrás.

Si en lugar de CSS usas una etiqueta `<img>`, ponle `width` y `height`. Una imagen incrustada carga al instante, así que un tamaño ausente es un salto de maquetación que pasa demasiado rápido para verlo y que te sigue puntuando en contra. La excepción es el SVG: uno que solo lleva `viewBox` no tiene tamaño propio en píxeles, y escribir en la etiqueta los ⁦300×150⁩ que el navegador pone por defecto clava una imagen escalable a un tamaño que no ha elegido nadie.

Y deja el `alt` vacío salvo que tengas algo cierto que poner ahí. Solo tú sabes si la imagen significa algo o es pura decoración, y para quien usa un lector de pantalla, una descripción adivinada a partir del nombre del archivo es peor que no tener ninguna.

![La tarjeta de forma: botones que eligen qué debe salir, una regla de fondo CSS, una etiqueta img o el URI a secas, y un interruptor para base64 o SVG en claro.](https://abox.tools/screens/embed-an-image-in-css/shape.webp)

Adónde va decide qué sale, así que se pregunta primero en vez de dejarlo como ejercicio de copiar y pegar.

## Cuando la respuesta es «no lo hagas»

Si la imagen pasa de unos 50 KB una vez codificada, incrustarla es la herramienta equivocada, y no hay codificación cuidadosa que lo arregle. Las alternativas, en el orden en que conviene probarlas:

- **Hazla más pequeña.** Casi todas las imágenes demasiado grandes para incrustarlas son demasiado grandes a secas. El [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) te deja una fotografía en el tamaño que tú digas, y el [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) te baja las dimensiones en píxeles a lo que usa de verdad la maquetación, que muchísimas veces es el problema de fondo.
- **Redibújala como SVG.** Un icono exportado como PNG de 40 KB es muchas veces un SVG de 900 bytes. Eso no es una diferencia de compresión, es una diferencia de formato, y de paso te resuelve el problema de las pantallas retina.
- **Déjala como archivo y precárgala.** `<link rel="preload" as="image">` arranca la descarga al momento sin mover los bytes al camino crítico. Te llevas casi toda la ganancia de incrustar y ninguno de los costes de caché.

## Nada de esto necesita una subida

Codificar un archivo en base64 es aritmética. Son dos funciones que el navegador trae desde siempre, `btoa` y `encodeURIComponent`, y no hay absolutamente ninguna razón técnica para que una imagen viaje hasta un servidor y vuelva solo para quedar escrita de otra manera. Cualquier conversor que suba tu archivo para esto lo está subiendo por sus motivos, no por los tuyos.

[La herramienta de aquí](https://abox.tools/es/imagen-a-base64/) no lo manda a ninguna parte: la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, y ninguna es de este sitio. Si prefieres comprobarlo a que te lo cuenten, carga la página, desenchúfate de internet y codifica algo igualmente. [¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone otras tres comprobaciones que le puedes hacer a cualquier herramienta.
