# Cómo convertir un SVG en un PNG al tamaño correcto

Convertir es la parte fácil. Lo que decide si el resultado sirve de algo es la pregunta que no te responde nadie: ¿cuántos píxeles? Aquí va de dónde sale ese número, y qué pierde un dibujo camino de convertirse en uno.

[Abrir SVG a imagen](https://abox.tools/es/convertir-svg-a-png/): Di el tamaño. Un vector no tiene ninguno propio que perder.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [SVG a imagen](https://abox.tools/es/convertir-svg-a-png/), arrastra el archivo dentro y di un tamaño. Si nadie te ha dicho cuál usar, **1024 píxeles en el lado más largo** es un buen punto de partida: lo bastante grande para casi todo y lo bastante pequeño para mandarlo por correo. Deja el formato en PNG, deja el fondo en transparente y llévate el archivo.

Todo lo de abajo es qué hacer cuando ese valor por defecto no llega: cuando te han dado un número concreto, cuando el archivo va a una imprenta o cuando te vuelve con mal aspecto.

![La tarjeta de vista previa: el dibujo dibujado al tamaño pedido, con sus dimensiones en píxeles debajo.](https://abox.tools/screens/convert-an-svg-to-png/preview.webp)

La herramienta lo dibuja antes de guardarlo, al tamaño al que lo guardará. Lo que esté mal en la exportación se ve aquí primero.

## Por qué el tamaño lo decides tú y no el archivo

Un JPEG es una rejilla de píxeles medidos, así que preguntar cuánto mide tiene respuesta. Un SVG no es una imagen: es un conjunto de instrucciones (dibuja un círculo aquí, este trazado de este color), y las instrucciones no tienen tamaño. Un navegador puede ejecutarlas a 16 píxeles o a 4000 y el resultado sale igual de nítido en los dos casos, porque no está escalando nada: está volviendo a dibujar.

Por eso la conversión no puede elegir el número por ti, y por eso elegir uno grande no te cuesta nada. Este es el único trabajo de imagen en el que «hazlo más grande» sale gratis.

Casi todos los archivos SVG sí llevan los atributos `width` y `height`, y una herramienta te los va a enseñar, pero eso es un valor por defecto y no un límite. Un icono que pone `width="24"` solo te dice que quien lo dibujó tenía en la cabeza una barra de herramientas de 24 píxeles.

## De dónde sale de verdad el número

**Para una web.** Coge lo que ocupa la imagen en la página en píxeles CSS y multiplícalo por la densidad de píxeles de las pantallas que te importen. Un logotipo en un hueco de 200 píxeles de ancho necesita un archivo de 400 píxeles para un portátil Retina y de 600 para un móvil reciente. Eso es todo lo que significan `@2x` y `@3x`, y por eso una herramienta que los escriba te ahorra hacer la cuenta tres veces.

**Para el icono de una aplicación, una ficha de tienda o un favicon.** El número está publicado y no hay nada que calcular: exactamente lo que diga la página de la tienda. Y para un favicon no rasterices nada: [haz un .ico](https://abox.tools/es/guias/como-hacer-un-favicon/), que guarda varios tamaños en un archivo, porque la pestaña de un navegador, un marcador y un acceso directo de Windows piden tamaños distintos.

**Para imprenta.** Multiplica el tamaño físico en pulgadas por la resolución de la impresora. Un logotipo de dos pulgadas de ancho en una tarjeta de visita, a 300 PPP, son 600 píxeles; ese mismo logotipo a lo ancho de una página A4, o sea 8,3 pulgadas, son unos 2500. Las imprentas piden 300 PPP por costumbre, y para una lona de gran formato que se mira desde el otro lado de una sala sobra con 150.

**Para una vista previa social o una imagen OG.** La plataforma te da una caja, que para casi todas las vistas previas de enlaces es ⁦1200 × 630⁩, y esa caja tiene otra forma que tu logotipo. Para eso está el ajuste de «rellenar»: el dibujo centrado y con sus propias proporciones, y un color de fondo llenando el resto, en vez de un logotipo estirado que le anuncia a todo el mundo que no lo comprobaste.

Cuando te apliquen dos de estos, quédate con el mayor. Un PNG más grande de la cuenta es una descarga algo mayor; uno demasiado pequeño ya no se arregla después, por la razón que viene en el apartado siguiente.

![La tarjeta de tamaño: un menú con las formas de decir cuánto de grande, puesto en anchura, con 1024 escrito y anchuras predefinidas al lado.](https://abox.tools/screens/convert-an-svg-to-png/size.webp)

Cinco maneras de decir lo mismo. Cuál es la correcta depende de si te han dado una cifra o un sitio donde ponerlo.

## No se puede volver atrás

Rasterizar es un viaje de ida. Una vez que el dibujo es un PNG son píxeles como los de cualquier otra imagen, y ampliarlo después obliga a inventar detalle que nunca se midió, con el mismo resultado blando y emborronado que da ampliar una fotografía.

Así que guarda el SVG. Es la copia maestra, casi siempre es el archivo más pequeño y todos los tamaños futuros salen de él perfectos. El PNG es una exportación para un uso concreto, y cuando necesites otro tamaño lo que toca es volver a exportar, no redimensionar lo que ya exportaste.

Hay software que dice convertir un PNG de vuelta en un SVG. Lo que hace es calcar: adivinar qué curvas podrían explicar una rejilla de píxeles. Con dibujo plano de dos colores se defiende, con cualquier otra cosa suelta disparates carísimos, y en ningún caso recupera lo que tenía el dibujo original.

## Tres cosas cambian en cuanto se convierte en píxeles

Cuando un SVG rasterizado se ve mal, casi siempre es por una de estas tres razones, y las tres conviene conocerlas antes de exportar y no después.

**El texto se dibuja con la tipografía que tenga la máquina.** Un SVG que lleva texto no lleva la tipografía: nombra una y deja que el renderizador la encuentre. Si esa tipografía no está instalada se usa una sustituta, y la sustituta tiene otras formas de letra y otras anchuras, así que el texto puede recolocarse o desbordarse. A un archivo que se trae su tipografía de una dirección web le va todavía peor: a un SVG rasterizado a través de un `<img>` no se le permite descargar absolutamente nada, así que no le llega nada.

La solución la conoce ya cualquier diseñador: **convertir el texto en contornos** antes de exportar el SVG (Illustrator lo llama Crear contornos, Figma lo llama Flatten e Inkscape lo llama Objeto a trazado). Las letras pasan a ser geometría, la tipografía deja de importar y la imagen se ve igual en todas partes. Hazlo sobre una copia, porque un texto convertido en contornos ya no se puede editar como texto.

**Las líneas de un pelo se vuelven grises o desaparecen.** Un trazo que al tamaño que has elegido sale por debajo de un píxel no se puede dibujar como línea sólida, así que se dibuja tenue. Por eso un logotipo delicado rasterizado a 64 píxeles sale deslavado mientras que el mismo archivo a 512 sale perfecto. Si lo que te exigen es un tamaño pequeño, la respuesta es un dibujo simplificado con trazos más gruesos y no otro ajuste de exportación. Es la misma razón por la que un favicon es un símbolo y no un logotipo de palabra.

**La animación se para.** Un SVG animado rasteriza a una sola imagen fija, que es el primer fotograma, sea cual sea, y no hay ningún ajuste de exportación que cambie eso. Si necesitas el movimiento, necesitas un GIF o un vídeo, hechos por otra vía.

## La transparencia, y qué formato elegir

**PNG**, salvo que tengas un motivo para otra cosa. No tiene pérdidas, conserva la transparencia y comprime bien el color plano con bordes duros, que es de lo que está hecho casi cualquier dibujo. Un logotipo rasterizado suele salir en PNG *más pequeño* de lo que saldría en JPEG, y además más limpio.

**JPEG** no tiene transparencia. Cada píxel transparente tiene que convertirse en algún color, y si nadie elige uno por ti se convierte en negro: de ahí sale ese logotipo sobre caja negra que todo el mundo da por hecho que es un fallo. Encima tiene pérdidas de la forma que peor se nota justo en este tipo de imagen, con un anillo de salpicaduras alrededor de cada borde duro. Úsalo cuando algo insista.

**WebP** hace todo lo que hace el PNG en un archivo más pequeño, y lo lee cualquier navegador actual. El motivo para no usarlo es lo que viene después del navegador: el software antiguo, algunas imprentas y bastantes formularios de subida siguen sin abrir uno.

Y elegir un color de fondo con PNG también es algo perfectamente normal de querer. La transparencia solo sirve cuando aquello sobre lo que va a aterrizar la imagen es de un color que no puedes predecir; si ya sabes que es una página blanca, aplanar sobre blanco te ahorra toda una categoría de sorpresas.

## Cuando la exportación sale en blanco o mal

**Nada más que espacio vacío.** Normalmente falta el atributo `xmlns` en el elemento raíz. Un archivo sin él no es SVG a efectos de una etiqueta de imagen, y se dibuja como nada. Abrir el archivo en un navegador es la prueba rápida: si el navegador tampoco enseña nada, el problema es el archivo y no el conversor.

**El dibujo sale pequeño, en la esquina superior izquierda.** El archivo tiene `width` y `height` pero no `viewBox`, así que no hay ningún sistema de coordenadas que escalar y el dibujo conserva sus unidades originales sobre un lienzo más grande. Un buen conversor te pone un viewBox; si el tuyo no lo ha hecho, añadir `viewBox="0 0 *ancho* *alto*"` al elemento raíz a mano lo arregla, y el archivo es texto plano, así que puedes.

**Falta parte de la imagen.** Algo del archivo apuntaba a una dirección en vez de contener el dibujo — una fotografía incrustada guardada como enlace, una hoja de estilos, una tipografía. Un rasterizador que se niegue a descargar eso está haciendo lo correcto, y es la misma negativa que impide que un SVG que te has bajado de algún sitio informe a quien lo hizo. Vuelve a exportar desde el programa de dibujo con las imágenes incrustadas.

**Rechaza un tamaño muy grande.** Los navegadores ponen un tope a lo grande que puede ser un lienzo, y no se ponen de acuerdo en dónde: pasados unos 16 000 píxeles de lado no vuelve nada, y Safari en un iPhone o un iPad se rinde mucho antes, alrededor de ⁦4096 × 4096⁩. Una herramienta que te avisa te está salvando de un archivo en blanco, porque eso es lo que produce un navegador cuando se queda sin recursos, en vez de un mensaje de error.

## Nada de esto necesita una subida

Rasterizar un SVG es algo que cualquier navegador hace miles de veces al día — es la misma maquinaria que dibuja un icono en una página web. No hay ninguna razón técnica para que tu dibujo viaje a un servidor y vuelva convertido en PNG, y la herramienta de aquí no lo manda a ninguna parte: la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, y ninguna es de este sitio.

Y con SVG eso importa más de lo habitual, porque un SVG es un documento y no una imagen. Puede contener un script y una dirección remota, y un logotipo que te ha mandado una agencia es un archivo que no escribiste tú. Dibujado a través de una etiqueta de imagen está en lo que la especificación llama *modo estático seguro*: el script no se puede ejecutar y con la dirección no se contacta nunca. Eso lo hace cumplir el navegador, no la web.

Carga la página, desenchúfate de internet y convierte algo de todos modos si prefieres comprobarlo a que te lo cuenten. [¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) plantea otras tres comprobaciones que puedes hacerle a cualquier herramienta.
