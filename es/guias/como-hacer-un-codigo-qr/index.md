# Cómo hacer un código QR que también escanee en el móvil de otro

Hacer un código QR lleva un segundo. Hacer uno que funcione en una carta pringada, en una marquesina o en un móvil sujeto con el brazo estirado y con mala luz depende de cuatro decisiones, y las cuatro se toman antes de imprimir nada. Aquí va lo que hace cada una.

[Abrir Generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/): Escríbelo y se convierte en un código. Para hacerlo no se envía nada.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [generador de QR y códigos de barras](https://abox.tools/es/generar-codigo-qr/), pega tu enlace, deja el nivel en **M** y el margen en **4**, y descarga el SVG. Imprímelo con al menos dos centímetros de ancho, sobre algo mate, oscuro sobre claro. Y después escanea el impreso con un móvil que no sea el tuyo antes de encargar mil.

Eso cubre casi todos los casos. El resto de esta página es qué hacer cuando el tuyo no es uno de ellos: un código que tiene que aguantar que lo manoseen, uno con un logotipo encima, uno que va en algo pequeño, y la única decisión que se puede equivocar de una forma de la que no te enteras hasta un año después.

## Qué hay de verdad dentro de un código QR

Una cadena de texto. Eso es todo. Escanear un código QR le entrega al móvil un trozo de texto, y todo lo demás, sea abrir una página, conectarse a una red u ofrecerse a guardar un contacto, es el móvil reconociendo la forma de ese texto y ofreciéndose a actuar.

Así que no existe eso de un «código QR de wifi» como tipo de código. Existe un código QR que lleva `WIFI:T:WPA;S:Mi Red;P:la contraseña;;`, que sabe leer cualquier móvil hecho en la última década. El generador te enseña la cadena terminada exactamente por esto: cuando un código no hace lo que esperabas, la cadena es lo único que merece la pena mirar.

Significa además que un código QR no se puede cambiar una vez impreso, ni puede llamar a casa, ni puede caducar. Salvo que alguien le haya metido dentro un enlace a su propio servidor, que es de lo que va el último apartado de esta página.

![Un código QR terminado con sus datos debajo: la simbología, la versión, el nivel de corrección de errores y el número de caracteres que guarda.](https://abox.tools/screens/make-a-qr-code/result.webp)

Qué hay en el código, dicho con los términos que usa el resto de esta guía. La versión crece con el contenido, y por eso importan los dos ajustes de abajo.

## Decisión uno: el nivel de corrección de errores

Un código QR lleva junto a los datos un conjunto de palabras de comprobación, calculadas para que un lector pueda reconstruir lo que no ha podido ver. Por eso un código con una esquina arrancada sigue escaneando. Cuántas de esas palabras hay es el nivel, y hay cuatro:

- **L:** se puede perder alrededor del 7 % del código.
- **M:** alrededor del 15 %.
- **Q:** alrededor del 25 %.
- **H:** alrededor del 30 %.

Más corrección no sale gratis: los datos de comprobación van en el mismo cuadrado, así que el mismo texto en H necesita un código más grande y más denso que en L. A grandes rasgos, pasar de L a H duplica el número de módulos para la misma cadena, y cuanto más densos son los módulos, más le cuesta resolverlos a una cámara. Aquí hay un intercambio de verdad, y la respuesta depende de dónde vaya a acabar el código.

**L** es para una pantalla: un código en una diapositiva, en un correo, en una página web. Nada lo va a dañar y cada módulo de más lo hace más difícil de leer a distancia.

**M** es el valor por defecto y la respuesta correcta para casi cualquier impresión. Papel que se va a manosear un poco, un folleto, una tarjeta de visita.

**Q y H** son para códigos que van a sufrir: una carta que se limpia a diario, una pegatina en una máquina de taller, una etiqueta en una caja, un código en un escaparate al que le da el sol de lleno. Y H es además lo que hace posible poner un logotipo en el centro, como se ve más abajo.

![Las opciones de QR: un menú de nivel de corrección de errores en medio y una zona de silencio de cuatro módulos.](https://abox.tools/screens/make-a-qr-code/options.webp)

Las dos tratan de que el código sobreviva al mundo real, un doblez, un logotipo, una mala impresión, y las dos se fijan antes de dibujarlo.

## Decisión dos: el margen, que forma parte del código

El espacio en blanco de alrededor de un código QR no es relleno, y no es una decisión de diseño. Un lector lo usa para saber dónde termina el símbolo. La especificación pide cuatro módulos de espacio en calma por cada lado, y un código recortado hasta su borde es la razón número uno de que un código impreso falle.

Conviene decirlo sin rodeos, porque recortar es de lo más natural del mundo. El código parece que tiene demasiado blanco alrededor, así que se recorta en la maquetación, o se suelta sobre un panel de color que llega hasta los cuadrados, o se pone encima de una fotografía. Cada una de esas cosas le quita el límite que iba a usar el lector.

Si el código parece demasiado grande con su margen, haz el código más pequeño. No le quites el margen.

## Decisión tres: de qué tamaño imprimirlo

La regla práctica que ha sobrevivido al contacto con la realidad es **uno a diez**: un código tiene que medir de ancho más o menos una décima parte de la distancia desde la que se va a escanear.

- Una tarjeta de visita o una carta, leída a 30 cm: unos 2 cm de ancho.
- Un cartel leído a dos metros: unos 20 cm.
- Una marquesina o un escaparate leídos a cinco metros: unos 50 cm.

Dos centímetros es un suelo, no un objetivo. Por debajo de 1,5 cm más o menos un móvil corriente empieza a sufrir por buena que sea la impresión, porque los módulos sueltos se acercan al tamaño de un píxel de su cámara.

Menos texto son menos módulos, y menos módulos son un código que se lee de más lejos para un mismo tamaño impreso. Ese es un buen motivo para apuntar un código a `ejemplo.com/x` y no a una URL con cien caracteres de parámetros de seguimiento al final.

Y imprime desde el **SVG**. Un código QR está hecho de bordes, y un PNG tiene un número fijo de píxeles con los que hacerlos: amplía uno y todos los bordes se ablandan, que es justo lo que le cuesta a un escáner. Un SVG son los cuadrados como instrucciones, así que sale nítido tanto en una tarjeta de visita como en una valla.

## Color, contraste y los dos errores

Un lector mide la diferencia entre los módulos oscuros y los claros, así que el contraste lo es todo. Hay dos cosas que salen mal a menudo:

**Código claro sobre fondo oscuro.** Queda llamativo, y bastantes lectores lo rechazan de plano, porque buscan oscuro sobre claro y no prueban a invertirlo. Otros sí lo hacen, pero tú no vas a saber cuáles tienen tus clientes.

**Poca diferencia.** Un gris medio sobre blanco, o dos colores de marca de peso parecido, pueden medir bien en pantalla y fallar en papel en cuanto entran en juego la ganancia de tinta y la exposición automática de un móvil. Si vas a colorear un código, que la parte oscura sea de verdad oscura.

El mate le gana al brillo en cualquier cosa que se vaya a escanear bajo una luz, y los dos le ganan a imprimir sobre una fotografía. Los fondos transparentes vienen bien para poner un código sobre un panel de color, pero comprueba qué acaba de verdad detrás: un código transparente sobre un panel oscuro es el primer error de arriba, solo que con pasos de más.

## Un logotipo en el centro

Esto funciona, y funciona gracias a la corrección de errores, no a pesar de ella. En el nivel H se puede destruir alrededor del 30 % de los módulos y el código se sigue leyendo, así que un logotipo que cubra bastante menos que eso, y en el centro, donde no hay ningún patrón de localización, es un daño que el lector repara.

Hay tres cosas que respetar. Usa el nivel H. Mantén el logotipo por debajo de una quinta parte del área más o menos, bien lejos del límite teórico, porque la impresión no es lo único que se está comiendo tu margen. Y no tapes nunca los tres cuadrados grandes de las esquinas ni los pequeños que hay cerca: es así como un lector encuentra y orienta el símbolo, y no hay corrección de errores que los reconstruya.

Y luego pruébalo en móviles de verdad. Un logotipo baja un código de «siempre funciona» a «funciona con este margen», y la única forma de saber cuánto margen queda es probándolo.

## La decisión de la que la gente se arrepiente: estático o «dinámico»

Busca un generador de QR y casi todos los resultados van a querer que te hagas una cuenta, porque lo que venden son códigos *dinámicos*. Un código dinámico no lleva tu enlace: lleva un enlace corto al propio servidor del generador, que redirige al tuyo.

Lo que ganas con eso es real: puedes cambiar adónde apunta el código después de imprimirlo, y te llevas un recuento de cada escaneo. En una campaña con una tirada de seis cifras, eso se paga solo.

Lo que cuesta también es real, y conviene saberlo antes y no después:

- **El código deja de funcionar cuando ellos dejan de funcionar.** Si el servicio cierra, el dominio caduca o se acaba el plan gratuito, todos los códigos que imprimiste se quedan muertos, y para entonces están en diez mil cartas.
- **Cada escaneo son datos de otra persona.** La redirección ve la dirección IP, la hora y el dispositivo de todo el que escanee tu código.
- **El enlace es suyo, no tuyo.** Cualquiera que lo escanee ve pasar un dominio desconocido, que es justo de lo que a todo el mundo le están diciendo que desconfíe.

El término medio no cuesta nada: haz un código QR estático alrededor de una URL corta *de tu propio dominio* y redirígela tú. Sigues pudiendo cambiar el destino, sigues teniendo la analítica, y nada del código depende de que una empresa que no conoces siga existiendo el año que viene.

El [generador de aquí](https://abox.tools/es/generar-codigo-qr/) solo hace códigos estáticos, y no tiene ninguna cuenta que crear. Lo que escribes es lo que lleva el código.

## Antes de imprimir mil

Escanea el código, y no el de tu pantalla: la prueba impresa, en el sitio al que va, y con un móvil que no sea aquel con el que lo hiciste. Es un minuto, y pilla la categoría entera de problemas de la que va esta página: un margen que se comió la maquetación, un enlace al que le faltaba el `https://`, un color que midió distinto en papel, un código impreso a un tamaño que funciona en una mesa y no en una pared.

Y comprueba qué pasa después de escanear. Un código que abre una página ilegible en un móvil es un código que ha fallado, por mucho que haya escaneado.

## Nada de esto exige subir nada

Un código QR es aritmética sobre una cadena de texto. No hay ningún archivo que enviar, ni nada que sepa hacer un servidor y no sepa hacer un navegador, y por eso la [herramienta de aquí](https://abox.tools/es/generar-codigo-qr/) lo hace todo en tu propio dispositivo y funciona con la red desenchufada.

Y eso importa más de lo que suena, por lo que la gente mete en los códigos QR. El uso más habitual del formato de wifi es la contraseña de verdad de una red, tecleada en una página web. Conviene saber si esa página tenía adónde mandarla.
