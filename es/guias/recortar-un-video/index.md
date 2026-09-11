# Cómo recortar un vídeo a otra forma

Recortar cambia la forma de la imagen, y eso obliga a escribir fotogramas nuevos. No hay manera de esquivarlo, y cualquier herramienta que te diga lo contrario está haciendo otra cosa. Aquí va lo que cuesta y cómo gastarlo bien.

[Abrir Recortador de vídeo](https://abox.tools/es/recortar-video/): Deja el clip en la parte que de verdad importa.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [recortador de vídeo](https://abox.tools/es/recortar-video/), arrastra el clip dentro, coloca la caja sobre la parte que quieras conservar, o fíjala a una forma si te han dado una, y exporta. El clip que sale dura exactamente lo mismo que el que entró, con su sincronía y su sonido intactos.

A diferencia de cortar, esto sí obliga a escribir fotogramas nuevos, y no es carencia de ninguna herramienta en concreto: es lo que es recortar. El resto de esta página va de lo que cuesta eso y de cómo mantenerlo a raya.

## Por qué recortar no puede evitar una recodificación

Un corte conserva fotogramas enteros, así que un buen cortador los traslada intactos y no descodifica nada. Un recorte conserva solo una parte de cada fotograma, y una parte de un fotograma ya es otra imagen. Y no hay forma de guardar otra imagen sin escribir los píxeles de nuevo.

Hay una excepción muy estrecha, y conviene conocerla para reconocerla cuando alguien la saque a relucir. El vídeo se codifica en bloques, y si un recorte cayera exactamente sobre los límites de bloque por los cuatro lados, parte de los datos podría en principio reutilizarse. En la práctica, las dimensiones del fotograma, los vectores de movimiento y la predicción hay que reescribirlos igualmente, así que nadie construye nada real de esa manera. Da por hecho que un recorte es una recodificación.

Lo que sí hace un recortador que se porte bien es no gastar *más* de lo que gastaba el original en esa misma zona. Codificar una región recortada a más bitrate que su origen solo engorda el archivo, porque no puede devolverte un detalle que el original no tenía.

![La tarjeta de exportación: un menú de formato, un control de calidad, un interruptor para conservar el sonido y un resumen con el tamaño de salida, cuánto encuadre se conserva y la duración.](https://abox.tools/screens/crop-a-video/export.webp)

Esta tarjeta existe porque la imagen tiene que volver a codificarse. El resumen es la herramienta diciendo lo que eso costará antes de hacerlo.

## Las formas que te están pidiendo de verdad

Casi todos los recortes se hacen porque en algún sitio exigen una proporción concreta. La lista corta es esta:

- **9:16, vertical.** Historias, reels, shorts, TikTok. Pantalla completa en un móvil cogido como se coge normalmente. Es el motivo más frecuente por el que alguien recorta un vídeo.
- **1:1, cuadrado.** Publicaciones de feed en varias plataformas. Funciona cojas el móvil como lo cojas, y por eso sigue vivo.
- **4:5, un poco vertical.** Es la forma más grande que permiten algunos feeds, así que ocupa más pantalla que un cuadrado sin llegar a ser un vídeo vertical del todo.
- **16:9, horizontal.** El estándar del vídeo en general. Normalmente recortas *hacia* esta forma solo para quitar bandas negras, o *desde* ella para llegar a alguna de las anteriores.

Fija la caja a la proporción en lugar de arrastrar a ojo. Si te quedas a unos pocos píxeles, la plataforma te va a recortar el recorte, y no te va a consultar por dónde.

![La tarjeta de recorte: un fotograma de vídeo con un marco cuadrado en el centro y campos numéricos con la izquierda, la parte superior, la anchura y la altura.](https://abox.tools/screens/crop-a-video/box.webp)

El marco se arrastra o se escribe, y los números dicen exactamente qué se conserva. Un cuadrado sacado de un clip panorámico es lo que más se pide.

## Convertir un clip horizontal en vertical

Este es el caso frecuente más difícil, y conviene tener claro que aquí recortar es más un apaño que una solución.

Un vídeo 16:9 recortado a 9:16 conserva alrededor del 32 % del ancho de la imagen. Lo que haya a los lados desaparece, y en un plano horizontal los lados suelen ser justo donde está el contexto. Si hay dos personas hablando en extremos opuestos del encuadre, no hay un solo recorte que las conserve a las dos.

Elige el recorte viendo el clip una vez y preguntándote dónde está de verdad el sujeto la mayor parte del tiempo. Si la respuesta es «se mueve», un recorte estático es la herramienta equivocada y lo que necesitas es un editor capaz de desplazar el recorte a lo largo del tiempo. Si la respuesta es «en el centro, casi siempre», con un recorte centrado te vale y lo tienes en diez segundos.

Y hay una alternativa que conviene no olvidar: muchas plataformas aceptan un vídeo horizontal y le ponen ellas las bandas. Recortar es para cuando quieres la pantalla completa, no para cuando lo que quieres es que te acepten el vídeo.

## Por qué el ancho y el alto se mueven de dos en dos

Si ves que la caja de recorte te rechaza los números impares, quien se está poniendo difícil es el códec y no la interfaz.

El H.264, que es el códec que hay dentro de un MP4, guarda el color a la mitad de resolución tanto en horizontal como en vertical, porque el ojo es mucho menos sensible al detalle de color que al de brillo. Eso hace que la imagen se maneje en unidades de dos píxeles, y que no haya forma de describir un fotograma con un número impar de píxeles de lado.

Las herramientas se las apañan de dos maneras: o te redondean el recorte una vez fijado, con lo que te mueven la caja un píxel sin decírtelo, o no te ofrecen más que números pares desde el principio. Aquí pasa lo segundo.

## Qué le pasa al sonido

Por la vía del MP4, nada. Recortar cambia la imagen y no tiene ningún motivo para tocar el audio, así que el audio se copia muestra a muestra sin llegar a descodificarse: byte por byte lo que había en el archivo.

Por la alternativa de grabación, que viene más abajo, el sonido se captura de la reproducción y se vuelve a codificar, lo que cuesta algo de calidad. En los dos casos hay una casilla para dejarlo fuera del todo, que compensa cuando el clip va a un sitio donde se reproduce sin sonido de todas formas y lo que quieres es el archivo más pequeño posible.

## Formatos, y cuánto tarda

**MP4, M4V y MOV** se leen directamente, lleven lo que lleven dentro, sea H.264, HEVC, AV1 o VP9, siempre que el navegador sepa descodificar ese códec. A diferencia de cortar, recortar sí tiene que descodificar, así que aquí el códec importa y allí no.

**Lo demás que el navegador sepa reproducir**, y el caso claro es el WebM, se recorta reproduciéndolo y grabando el resultado: funciona, y tarda lo que dure el clip.

**Los AVI, WMV, FLV y casi todos los MKV** el navegador no sabe ni leerlos ni reproducirlos, y la herramienta los rechaza con un mensaje en vez de fallar a mitad de camino.

Cuenta con que en un clip largo el recorte lleve su tiempo, porque cada fotograma se está descodificando y recodificando. La herramienta no lleva dentro ningún límite, y el archivo se recorre de unos megabytes en unos megabytes en vez de cargarse entero. El techo de verdad es el vídeo terminado, que se monta en memoria antes de que lo descargues.

## Recorta antes de hacer cualquier otra cosa

Si un clip necesita corte y recorte, corta primero: sale gratis, y cada segundo que quitas es un segundo que nadie va a tener que recodificar. Después recorta el clip ya corto, una sola vez.

Al revés estarías recortando material que vas a tirar acto seguido, y eso te cuesta tiempo y calidad para nada. El [cortador de vídeo](https://abox.tools/es/cortar-video/) está al lado, y [su guía](https://abox.tools/es/guias/cortar-un-video/) explica por qué ese paso no tiene por qué costarte nada en absoluto.

Y como norma general, los pasos con pérdidas se acumulan. Un recorte hecho sobre un original es una generación. Un recorte de un corte de una exportación de una descarga son cuatro, y se nota.

## Por qué esto no necesita una subida

Descodificar y recodificar vídeo dentro de un navegador es algo reciente y es real: WebCodecs da acceso al mismo codificador por hardware con el que tu móvil graba vídeo, y va rápido por ese mismo motivo. El trabajo ocurre en el dispositivo que ya tiene el archivo, que para un vídeo de varios gigabytes es además el único montaje con sentido, porque subirlo y descargar el resultado lleva más tiempo que la propia codificación.

La herramienta de aquí no tiene ninguna función de red, y la `Content-Security-Policy` de la página enumera todas las direcciones a las que puede conectarse, ninguna de este sitio. Y si prefieres comprobarlo a que te lo cuenten, desenchúfate de internet y recorta un clip igualmente.

[¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone otras tres comprobaciones que le puedes hacer a cualquier herramienta.
