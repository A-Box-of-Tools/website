# Cómo redimensionar una imagen sin destrozarla

Redimensionar es el único trabajo de imagen en el que el daño está decidido antes de pulsar el botón, según el número que escribas y la forma que pidas. Aquí va lo que le hace cada elección a la foto, y cuáles tienen vuelta atrás.

[Abrir Redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/): Di el tamaño. Dibuja la caja. Elige el formato.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/), arrastra tu foto dentro, escribe un número, normalmente el ancho, y deja el otro en blanco. El alto sale de la propia forma de la foto, que es casi siempre lo que querías: «1920 de ancho» significa «1920 de ancho y el alto que salga».

Todo lo de abajo es qué hacer cuando con un número no basta: cuando te han dado una caja con los dos lados, cuando la foto tiene que hacerse más grande, o cuando una carpeta entera de archivos tiene que salir igual.

![El paso 3 del redimensionador: una anchura de 1920, una altura en blanco que pone automática, y debajo una línea que dice que photo.jpg mide 2400 por 1600 y sale a 1920 por 1280.](https://abox.tools/screens/resize-an-image/one-number.webp)

Un número puesto. La herramienta calcula el otro y lo dice antes de redimensionar nada.

## Encoger es seguro. Agrandar no.

No son dos direcciones de la misma operación, y conviene tener claro por qué.

**Hacer una foto más pequeña** tira información, pero de la única manera inofensiva: entran más píxeles de los que salen, así que cada píxel del resultado es el promedio de detalle real medido. Una copia pequeña bien redimensionada suele verse *mejor* que el original visto a ese tamaño, porque promediar quita ruido. Aquí no se inventa nada.

**Hacer una foto más grande** obliga a inventar. El detalle no es que le falte al archivo: es que nunca se fotografió. Lo único que puede hacer cualquier ampliador es adivinar píxeles intermedios a partir de sus vecinos, y una suposición entre dos valores conocidos es una rampa suave. Por eso una foto ampliada sale blanda en vez de nítida: es una copia más grande de la misma foto, no una copia con más detalle.

Por eso «no agrandar nunca una foto más de lo que empezó» viene activado en la herramienta de aquí. Desactívalo si de verdad necesitas ese número de píxeles, por ejemplo para una imprenta que exige un tamaño mínimo o una plantilla que rechaza todo lo que baje de un ancho, pero hazlo sabiendo que lo que estás comprando son píxeles y no detalle.

Los ampliadores de aprendizaje automático que sí parecen añadir detalle son otra cosa completamente distinta: se están inventando textura plausible a partir de un modelo de cómo suelen ser las imágenes. Para un fondo de pantalla eso vale. Para la fotografía de una persona, de un documento o de cualquier cosa de la que alguien vaya a sacar una conclusión, ten claro que el detalle de más es ficción.

## Tres formas de decir qué tamaño quieres

Casi todas las herramientas, esta incluida, aceptan las mismas tres, y cada una le va bien a un trabajo distinto.

- **Píxeles exactos.** Para cuando alguien te ha dado el número: un avatar que tiene que ser de ⁦400×400⁩, un banner que tiene que medir 1500 de ancho. Rellena un lado y deja que el otro lo siga, salvo que te hayan dado los dos.
- **Un porcentaje.** Para cuando quieres que todo salga proporcionalmente más pequeño y la cifra exacta te da igual, del tipo «a la mitad» para un conjunto de fotos que van dentro de un documento.
- **Un lado largo.** El más útil de los tres para un lote mezclado. Con «lado más largo 1600», todas las fotos caben dentro de un cuadrado de 1600 píxeles, sean verticales u horizontales, que es lo que significa en la práctica «déjame todas estas a un tamaño razonable».

## Cuando la caja tiene otra forma que la foto

Aquí es donde se decide de verdad el redimensionado. Si das un ancho y un alto que no cuadran con las proporciones de tu foto, algo tiene que ceder, y solo hay cuatro cosas que puedan hacerlo:

- **Encajar dentro de la caja.** Se conserva la foto entera y sale más pequeña que la caja por uno de los ejes. No se pierde nada y no se deforma nada; lo único es que no te llevas las dimensiones exactas que pediste. Es la opción por defecto correcta para casi todo.
- **Llenar la caja y cortar lo que sobra.** Te llevas exactamente las dimensiones que pediste, y lo que quede colgando fuera de los bordes desaparece. Va bien para miniaturas, avatares y portadas, donde la forma es fija y el sujeto está en el medio. Va mal cuando lo que importa está cerca de un borde.
- **Rellenar.** Se conserva la foto entera, centrada, y el espacio que sobra se rellena con un color que eliges tú. Va bien cuando un sistema exige dimensiones exactas y no puedes perder nada de la imagen, que es como suelen funcionar las fichas de producto.
- **Estirar.** La foto se aplasta o se estira hasta encajar. Esto no es nunca lo que quieres, salvo que lo estés haciendo a propósito, y es lo que cualquiera reconoce al instante como mal hecho.

Si te descubres buscando el estirado, lo que seguramente quieres es recortar.

![Los mismos campos con 1200 en los dos, y debajo un menú que dice: si las formas no coinciden, encajar dentro, la foto entera y un lado sale más corto.](https://abox.tools/screens/resize-an-image/fit.webp)

Rellena los dos lados y aparece el menú. Es el único ajuste de esta página que puede perder parte de la foto, y por eso vale la pena leer las cuatro respuestas de abajo antes de tocarlo.

## Recortar es otro trabajo, y muchas veces el correcto

Redimensionar cambia cuántos píxeles describen la foto entera. Recortar cambia qué parte de la foto te quedas. Y la gente busca lo primero queriendo decir lo segundo con una frecuencia sorprendente: «esto tiene que ser cuadrado» es un problema de recorte, no de redimensionado.

Hazlos en ese orden: primero recorta al encuadre que quieras y después redimensiona el resultado al tamaño que necesites. Al revés estarías eligiendo el recorte sobre una foto que ya ha perdido píxeles.

La herramienta de aquí hace las dos cosas de una pasada precisamente por eso: arrastras una caja, la fijas a una forma si necesitas una proporción concreta, y luego dices de qué tamaño tiene que salir el resultado. Hacerlo de una pasada tiene además la ventaja de que la foto solo se codifica una vez, y eso importa por lo que dice el apartado siguiente.

### Recortar un lote entero

Una caja dibujada sobre una foto se les aplica a las demás como la misma zona *relativa*, es decir, las mismas fracciones del ancho y el alto de cada archivo. En una carpeta de capturas o exportaciones que son todas del mismo tamaño, eso es exactamente el mismo rectángulo. En un lote mezclado es el mismo encuadre, no el mismo rectángulo, que suele ser lo que querías, pero conviene saberlo antes de confiarle cincuenta archivos.

## Qué cuesta la recodificación, y cómo dejarla en una

Redimensionar un JPEG o un WebP consiste en descodificarlo, escalar los píxeles y volver a codificarlos, y ese último paso tiene pérdidas. Lo que te cuesta calidad no es el escalado en sí, sino la recodificación.

De ahí salen dos cosas. La primera, que el ajuste de calidad de la salida importa: algo entre 80 y 85 es invisible en una fotografía y bastante más pequeño que 100. La segunda, que lo hagas una sola vez. Redimensionar una foto que ya se ha redimensionado dos veces son tres generaciones de codificación con pérdidas, y eso se nota.

Un PNG no tiene ese coste, porque no tiene pérdidas: un PNG redimensionado son exactamente los píxeles escalados. Si vas a pasar por varios pasos y el formato final todavía está sin decidir, trabajar en PNG por el medio te evita ir acumulando generaciones.

Un detalle de la herramienta de aquí que conviene conocer: un archivo al que no le estás cambiando nada se devuelve byte por byte, sin recodificar. Pide «lado más largo 1600» en un lote y los que ya bajan de 1600 salen intactos, con etiquetas y todo. Una herramienta que los recodificara sin decir nada te estaría costando calidad en archivos que nadie le ha pedido tocar.

## La transparencia y qué le pasa

El PNG y el WebP pueden guardar transparencia. El JPEG no, porque el formato no tiene canal alfa. Así que guardar una imagen transparente como JPEG obliga a poner algo detrás, y ese algo es un color plano.

Casi todas las herramientas tiran de blanco y no lo mencionan, cosa que va bien hasta que tu logotipo aterriza en una página oscura con una caja blanca alrededor. Elige el color a conciencia, o guarda en PNG o WebP y conserva la transparencia. Ese mismo color se usa detrás de un marco rellenado, que es el otro sitio donde esto pilla a la gente por sorpresa.

## Qué herramienta, si te han dado un número

Por ahí circulan dos números distintos, y cada uno pide una herramienta distinta.

**«1200 píxeles de ancho»** es un problema de dimensiones, y el indicado es el [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/): dices cuántos píxeles quieres y te los da.

**«Por debajo de 500 KB»** es un problema de tamaño de archivo, y redimensionar es solo una de las maneras de resolverlo. El [compresor de imágenes](https://abox.tools/es/comprimir-imagen/) busca la calidad más alta que cabe en tu objetivo y redimensiona solo si la calidad por sí sola no llega; [su guía](https://abox.tools/es/guias/comprimir-una-imagen-a-un-tamano-exacto/) explica lo que cuesta eso.

## Nada de esto necesita una subida

Descodificar una imagen, escalarla y volver a codificarla son cosas que cualquier navegador lleva años sabiendo hacer: es la misma maquinaria con la que una página web dibuja una imagen a otro tamaño. No hay ninguna razón técnica para que tu foto viaje hasta un servidor y vuelva solo para salir más pequeña, y la herramienta de aquí no la manda a ninguna parte. La `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, y ninguna es de este sitio.

Si prefieres comprobarlo a que te lo cuenten, carga la página, desenchúfate de internet y redimensiona algo igualmente. [¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) plantea otras tres comprobaciones que puedes hacerle a cualquier herramienta.
