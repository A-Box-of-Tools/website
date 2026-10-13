# Cómo hacer un favicon que todavía se lea a dieciséis píxeles

Un favicon no es una imagen pequeña de tu logotipo. Es un conjunto de imágenes a tamaños fijos, metidas en un contenedor que casi nadie abre, y la más pequeña de todas es la que ve la gente. Aquí van los tamaños que necesitas, los archivos que van al lado y qué hacer cuando tu logotipo no sobrevive al viaje hacia abajo.

[Abrir Imagen a ICO](https://abox.tools/es/crear-favicon/): Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [Imagen a ICO](https://abox.tools/es/crear-favicon/), arrastra dentro una imagen cuadrada de 256 píxeles o más, deja el preajuste en *favicon de una web* y descarga `favicon.ico`. Ponlo en la raíz de tu sitio, para que responda en `https://tusitio.com/favicon.ico`. Esa dirección la piden todos los navegadores, la mencione tu HTML o no, así que en rigor no tienes que hacer nada más.

Todo lo de abajo es lo que separa un icono que técnicamente está de un icono que se lee: qué tamaños entran, qué piden en su lugar los iPhone y Android, y qué hacer cuando tu logotipo no sobrevive a medir dieciséis píxeles de ancho.

## Por qué es un conjunto de tamaños y no una imagen

Un archivo `.ico` es un contenedor. Dentro lleva varias imágenes completas de lo mismo a tamaños distintos, y quien esté leyendo el archivo coge la más cercana al tamaño que necesita.

Suena a redundancia, pero no lo es. Un navegador que dibuja tu icono a dieciséis píxeles tiene dos opciones: leer una versión de dieciséis píxeles dibujada por ti, o encoger una más grande sobre la marcha. Lo segundo es peor, y se nota: encoger automáticamente un logotipo detallado da papilla, mientras que una versión de dieciséis píxeles que has mirado es algo que has tenido ocasión de simplificar. Si el formato guarda varios tamaños es justamente para darte esa ocasión.

Para una web, la convención son tres tamaños, y cada uno tiene su motivo:

- **⁦16×16⁩:** la pestaña del navegador, la barra de direcciones y el menú de marcadores. Este es el que ve la gente, así que si solo vas a acertar con uno, que sea este.
- **⁦32×32⁩:** la barra de marcadores, un acceso directo de escritorio de Windows a tu sitio, y casi todos los navegadores en una pantalla de alta densidad, que dibujan el icono de la pestaña a partir de 32 y lo reducen.
- **⁦48×48⁩:** el tamaño al que Google lee el icono de un sitio para los resultados de búsqueda, y la vista de iconos medianos de Windows.

Todo lo que pase de ahí va en un PNG al lado del `.ico` y no dentro, por razones que salen más abajo con los archivos para móvil.

![La lista de ajustes preestablecidos con los tamaños que incluye cada uno: dieciséis, treinta y dos y cuarenta y ocho píxeles para un icono de sitio web, y un resumen de lo que irá dentro del archivo.](https://abox.tools/screens/make-a-favicon/preset.webp)

Un .ico es un contenedor, y esta es la lista de lo que va dentro. El preajuste es un atajo para el conjunto que un navegador pide de verdad.

## El problema de los dieciséis píxeles

De esta parte no te avisa nadie. Dieciséis píxeles son unos cuatro milímetros en una pantalla normal: una rejilla de 256 puntos en total, menos que las letras de esta misma frase. Casi nada pensado para funcionar en un cartel, en una tarjeta de visita o en la cabecera de una web sobrevive a reducirse a eso.

Lo que va desapareciendo, por orden:

- **El texto.** Un logotipo de palabra encogido dentro de un cuadrado mide unos tres píxeles de alto. No se convierte en texto pequeño, se convierte en una barra gris. Por eso casi todas las empresas que tienen un símbolo además de un nombre usan de favicon solo el símbolo, y las que no tienen símbolo usan una sola letra.
- **Las líneas finas.** Un borde de un píxel en un logotipo de 512 píxeles es una treintaidosava parte de píxel a dieciséis. O se dibuja como una neblina gris a lo largo del borde, o desaparece.
- **Los degradados y las sombras.** No hay sitio para una transición: una sombra suave acaba siendo un fleco sucio.
- **El detalle dentro del detalle.** Un icono de un documento con algo escrito encima acaba siendo un rectángulo con un borrón.

La solución no es un ajuste, es otro dibujo: una marca simplificada con una o dos formas, mucho contraste y nada de texto más allá de un solo carácter. Dibuja esa versión a 32 o 48 píxeles a conciencia y úsala como origen.

Lo que sí puede hacer una herramienta es enseñarte el problema antes de que lo publiques. La vista previa de [Imagen a ICO](https://abox.tools/es/crear-favicon/) dibuja cada tamaño a su tamaño real en pantalla, que es la única manera de juzgar esto: un icono de dieciséis píxeles enseñado a sesenta y cuatro se ve bien y no te dice nada.

![Una tira de vista previa con la misma marca dibujada a dieciséis, treinta y dos, cuarenta y ocho, sesenta y cuatro y ciento veintiocho píxeles.](https://abox.tools/screens/make-a-favicon/sizes.webp)

La versión de dieciséis píxeles, al lado de la que diseñaste. Esta es la imagen que decide si la marca había que simplificarla.

## Tu logotipo no es cuadrado. ¿Rellenar o recortar?

Un icono siempre es cuadrado y casi ningún logotipo lo es, así que algo tiene que pasar. Hay tres respuestas, y no son igual de buenas.

**Rellenar** conserva la imagen entera y le pone espacio arriba y abajo. Es el valor por defecto sin riesgo, y la elección equivocada para un logotipo de palabra ancho: meter algo tres veces más ancho que alto dentro de un cuadrado lo deja ocupando un tercio del alto, y a dieciséis píxeles eso son cinco píxeles de logotipo y once de nada.

**Recortar al centro** saca el cuadrado más grande del medio. En un conjunto de símbolo más nombre de la empresa al lado, eso muchas veces parte los dos por la mitad. Mejor recorta tú antes el original, dejando solo el símbolo, y convierte eso.

**Estirar** aplasta la imagen hasta que quepa. No hay casi ninguna situación en la que esto sea lo correcto, y está ahí sobre todo para que la herramienta no lo esté haciendo por su cuenta y sin decírtelo.

Con un logotipo ancho, la respuesta general es esta: no conviertas el logotipo, convierte la parte de él que funciona sola.

## ¿Transparente o con fondo sólido?

Para una web, lo normal es transparente. Las pestañas del navegador son grises, blancas o casi negras según el navegador y el tema, y un icono transparente se apoya sobre todas ellas. Un icono con el fondo blanco pintado es un rectángulo blanco en una barra de pestañas oscura.

Hay dos excepciones que conviene conocer:

- **Un logotipo que es oscuro y nada más** desaparece en modo oscuro. Si tu marca es negra sobre blanco por naturaleza, ponle un fondo de color en lugar de transparencia, o dale un contorno claro.
- **El icono táctil de Apple tiene que ser opaco.** iOS lo dibuja sobre su propio mosaico redondeado y te convierte la transparencia en negro. Cualquier herramienta que produzca ese archivo debería aplanarlo por ti, y la de aquí lo hace, sobre blanco salvo que digas otra cosa.

## Los archivos que necesita una web y que no son el .ico

El `favicon.ico` cubre los navegadores y Windows, pero no cubre los móviles, y aquí es donde casi todos los conjuntos de iconos caseros se quedan cortos. Hay otras tres plataformas que piden sus propios archivos, con sus propios nombres, y ninguna de ellas va a mirar dentro de un `.ico`:

- **iOS** lee `apple-touch-icon.png` a ⁦180×180⁩ cuando alguien añade tu sitio a su pantalla de inicio. Si no está, iOS tira de una captura de la página, y eso parece un fallo.
- **Android y cualquier aviso de instalación** leen un manifiesto de aplicación web, el `site.webmanifest`, que apunta a PNG de 192 y de 512 píxeles. El de 512 es además el que enseña una aplicación web en su pantalla de arranque.
- **Un mosaico del menú Inicio de Windows** lee el `browserconfig.xml`, que apunta a un PNG de ⁦150×150⁩. Es el menos importante de los tres, y son cuatro líneas de XML.

Y hay uno más que es fácil de hacer mal. Los lanzadores de Android recortan un icono adaptativo a la forma que le guste al móvil, sea un círculo, un cuadrado redondeado o un «squircle», y lo único que se garantiza que sobrevive es el 80 % central de la imagen, así que un icono dibujado de borde a borde pierde las esquinas. Eso es un icono *enmascarable*: la misma imagen dibujada a propósito pequeña dentro del cuadrado, y declarada aparte en el manifiesto.

Si marcas el conjunto para web en [Imagen a ICO](https://abox.tools/es/crear-favicon/), te los saca todos, más el manifiesto y el bloque de HTML que apunta a ellos. Ese bloque deja fuera una cosa a propósito: el `<link>` del `favicon.ico`. Los navegadores piden esa dirección por su cuenta, y nombrarla encima hace que el mismo archivo se descargue dos veces.

## El icono de una aplicación de Windows es otro conjunto

Si el icono es para un programa y no para un sitio, los tamaños cambian. El `app.ico` que trae por defecto el propio Visual Studio lleva 16, 32, 48 y 256: los tres tamaños del shell más el grande del que tiran el menú Inicio y la vista extragrande del Explorador.

En una pantalla de alta densidad, Windows pide además 20, 24, 40, 64 y 96, y cuando faltan los remuestrea del tamaño más cercano que tenga. Que eso importe o no depende de tu icono: una forma plana sobrevive al remuestreo y una detallada no. Añadirlos viene a duplicar el archivo, que para una aplicación no es nada. La cuenta aquí es completamente distinta de la de un favicon, donde el archivo se lo descarga cada visitante.

Una cosa más sobre el tamaño: donde están los bytes es en la entrada de 256. Guardada sin comprimir son 264 KB ella sola, y guardada como PNG dentro del icono suele quedarse por debajo de 30. Las entradas PNG se leen desde Windows Vista, así que el único motivo para evitarlas es que tengas delante software de verdad más antiguo que eso, o un instalador o una herramienta incrustada que analice los iconos por su cuenta.

## Un Mac lee un archivo completamente distinto

Si el icono es para una aplicación de Mac y no de Windows, nada de lo anterior sirve, porque macOS no lee `.ico` en absoluto. Lee `.icns`, que es la misma idea en otro envoltorio, varios tamaños dentro de un contenedor, con tres diferencias que conviene conocer.

- **Los tamaños son fijos.** Apple publica diez ranuras y aquí no eliges nada: 16, 32, 64, 128, 256, 512 y 1024 píxeles, con 32, 256 y 512 apareciendo dos veces, porque cada uno es a la vez un tamaño propio y la versión Retina del tamaño de debajo.
- **Llega hasta 1024.** Un `.ico` se para en 256, y por eso un archivo de icono de Mac ocupa varios cientos de kilobytes y un favicon ocupa quince. Para una aplicación que se distribuye una vez eso no es nada; el que se descarga cada visitante es el favicon.
- **Tu dibujo tiene que aguantar a 1024 píxeles.** Los dos problemas son los extremos opuestos de la misma imagen: un favicon tiene que funcionar diminuto y un icono de Mac tiene que aguantar enorme. Un logotipo exportado a 512 y ampliado a 1024 se ve blando en una pantalla Retina, y la App Store no te lo va a aceptar.

Para usarlo: un paquete de aplicación lo guarda en `TuApp.app/Contents/Resources/` y lo nombra en `Info.plist`. Y para una carpeta o una imagen de disco, selecciona el `.icns` en el Finder y pulsa Comando-C, luego abre Obtener información sobre lo que quieras cambiar, haz clic en el icono pequeño de arriba a la izquierda y pulsa Comando-V.

Si marcas *icono de macOS* en [Imagen a ICO](https://abox.tools/es/crear-favicon/), te escribe uno, con el archivo de Windows al lado o sin él. Cualquier cosa que se distribuya en las dos plataformas quiere los dos, y los dos se dibujan a partir de la misma imagen y en la misma pasada.

## Comprobar que ha funcionado

Los navegadores cachean los favicons con más ganas que casi cualquier otra cosa, así que «lo he subido y no ha cambiado nada» suele ser cosa de la caché y no un error. Dos cosas que probar antes de ponerte otra vez a editar archivos:

- Abre `https://tusitio.com/favicon.ico` directamente. Si el archivo se descarga, es que está ahí y lo que estás viendo es la caché. Si te sale un 404, es que no está en la raíz.
- Carga el sitio en una ventana privada, que normalmente tiene su propia caché de iconos.

En Windows, un `.ico` se comprueba poniéndolo en una carpeta y cambiando el Explorador entre sus tamaños de vista: pequeño, mediano, grande y extragrande dibujan entradas distintas del mismo archivo, así que puedes ver cada una tal como la va a ver el sistema.

En un Mac, un `.icns` se abre con Vista Previa, que te lista todas las ranuras en el lateral. Y el mismo truco funciona en el Finder: déjalo en una carpeta y mueve el control de tamaño de las opciones de vista para verlo ir cambiando entre las imágenes que lleva dentro.

## Nada de esto necesita una subida

Escalar una imagen es algo que cualquier navegador lleva años haciendo, y un `.ico` son una cabecera de seis bytes, dieciséis bytes por imagen y luego las imágenes. Hacer uno no tiene ni un paso que exija un servidor, y la herramienta de aquí no usa ninguno: la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, y ninguna es de este sitio.

Y aquí eso preocupa más de lo habitual. Un logotipo entregado a un generador gratuito de favicons es, muchísimas veces, una marca todavía sin lanzar: el icono es de las primeras cosas que se hacen y de las últimas que se anuncian. Si prefieres comprobarlo a que te lo cuenten, carga la página, desenchúfate de internet y haz uno igualmente. [¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone otras tres comprobaciones que le puedes hacer a cualquier herramienta.
