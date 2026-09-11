# Cómo cortar audio sin perder calidad

Un corte de audio puede caer en el instante exacto que marcaste, en cualquier reproductor, siempre — cosa que no pasa con el vídeo. Aquí está por qué, cuál es la única pega de verdad, y qué hacer con ella.

[Abrir Cortador de audio](https://abox.tools/es/cortar-audio/): Marca los trozos que valen la pena mientras suena. Te vuelven como un solo archivo, cortado donde dijiste.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Cortador de audio](https://abox.tools/es/cortar-audio/), suelta la grabación dentro, pulsa `I` y `O` para marcar cada parte que quieres — tantas como te apetezca — y exporta. Cada corte cae en la muestra exacta que marcaste, las muestras que se quedan salen tal y como entraron, y las uniones reciben un fundido de cinco milisegundos para que no puedan chascar.

Ese es todo el trabajo. El resto de esta página va de por qué la exactitud es real y no una frase de propaganda, y de la única cosa que sí sale mal cuando juntas dos trozos de sonido.

## Por qué un corte de audio puede ser exacto cuando uno de vídeo no

El vídeo no se guarda como una sucesión de imágenes completas — eso sería enorme. La mayoría de los fotogramas se guardan como una descripción de en qué se diferencian de sus vecinos, así que no se pueden decodificar por su cuenta. Solo un **fotograma clave** se sostiene solo, y los fotogramas clave suelen ir de uno a diez segundos de distancia. Por eso un cortador que copia fotogramas no puede empezar donde tú quieras: tiene que empezar en un fotograma clave, y de ahí que un vídeo recortado empiece a veces un segundo o dos antes de tu marca. [La guía del vídeo](https://abox.tools/es/guias/cortar-un-video/) va sobre todo de eso.

El sonido no tiene equivalente. Una vez decodificada, una grabación es una tira de números — uno por canal, decenas de miles de veces por segundo — y cada uno de ellos se sostiene por completo por su cuenta. La muestra 1.234.567 no necesita a la 1.234.566 para significar algo. Así que el corte se puede hacer en cualquier muestra, y «exactamente donde marcaste» quiere decir exactamente eso: tu marca en segundos, multiplicada por la frecuencia de muestreo, redondeada a la muestra entera más cercana. A 48 kHz ese redondeo son como mucho diez microsegundos.

Tampoco hay comportamiento que dependa del reproductor. Un vídeo recortado se apoya en una marca de edición que la mayoría de los reproductores respeta y algunos ignoran; un WAV recortado son las muestras y nada más, así que no queda nada sobre lo que un reproductor pueda discrepar.

## La pega: una unión es un salto

Esto es lo que sí se tuerce al cortar audio, y la razón de que un buen cortador tenga un ajuste para ello.

El sonido es una onda. Cuando cortas desde la mitad de una palabra directo a la mitad de otra, la muestra del final del primer trozo y la del principio del segundo no tienen ninguna relación: la forma de onda puede saltar de cerca de lo más alto de su rango a cerca de lo más bajo en una sola muestra. A un cono de altavoz al que se le pide ese salto le sale el sonido más seco que es capaz de hacer, y eso lo oyes como un **chasquido** en la unión.

Esto no tiene nada que ver con la pérdida de calidad ni con el formato. Ocurre con un corte perfectamente sin pérdidas de una grabación perfectamente limpia. Es sencillamente cómo suena un salto. Un cortador que corta en la muestra exacta y no hace nada más chascará en unas uniones y en otras no, según dónde de la forma de onda hayan caído los dos extremos.

## Qué hace en realidad un fundido de cinco milisegundos

El arreglo es bajar el nivel hasta el silencio justo antes del corte y subirlo justo después, de modo que no quede salto que dar. Eso es todo lo que aquí es un «fundido»: una rampa aplicada a unos cientos de muestras en cada borde.

Lo interesante es la duración. Cinco milisegundos son unas doscientas cuarenta muestras a 48 kHz. Es tiempo de sobra para que el cono viaje — el chasquido desaparece del todo — y muchísimo menos de lo que hace falta para oírlo como un fundido: cinco milisegundos son más o menos la quinta parte de lo que se tarda en decir una consonante. No vas a percibir el nivel moviéndose. Solo vas a percibir que la unión está limpia.

Se ofrecen fundidos más largos porque hay material que los pide. Veinte o cincuenta milisegundos merecen la pena cuando juntas música, donde lo que se interrumpe es una nota sostenida y no una sílaba, y la rampa más corta puede dejar todavía un pop audible. El habla casi nunca necesita más de cinco.

Un fundido solo pinta en un borde que *de verdad* sea un corte. Si una parte empieza justo al principio de la grabación, delante de ella no se quitó nada — el archivo ya empezaba ahí antes de recortar — así que hacerla aparecer poco a poco sería una edición que nadie ha pedido. La herramienta de aquí pone fundidos solo donde hay una unión, y por eso no recortar nada deja todas las muestras intactas.

![La tarjeta de exportación: un menú de profundidad de bits, una longitud de fundido en milisegundos y un resumen que cuenta las partes, las uniones y la duración.](https://abox.tools/screens/trim-an-audio-file/export.webp)

El fundido solo se aplica en una unión, y ese es el detalle que importa: un fundido al principio de una grabación sería un cambio que nadie pidió.

## Cortar un MP3, y por qué lo que sale es un WAV

Puedes abrir un MP3, un M4A, un Ogg o un archivo Opus y cortarlo. Lo que vuelve es un WAV, y conviene contar el trato que eso supone en vez de presentarlo como una virtud.

Hay dos maneras de cortar audio comprimido. Una es cortar los datos comprimidos directamente, moviendo bloques codificados enteros a un archivo nuevo sin decodificarlos. Eso mantiene el archivo pequeño y no cuesta calidad — pero un bloque de MP3 dura unos veintiséis milisegundos, así que cada corte se redondea al límite de bloque más cercano, que es la versión sonora del problema de los fotogramas clave. Además es trabajo atado al formato: un lector de MP3 no recorta ningún archivo Opus.

La otra manera es decodificar, cortar en la muestra exacta y escribir las muestras. No se redondea nada, todos los formatos que el navegador puede reproducir funcionan igual, y los fundidos son siquiera posibles — no puedes hacer una rampa sobre un nivel que no has decodificado. El coste es que las muestras tienen que volver a escribirse en algún formato, y ningún navegador trae un codificador de MP3 o AAC que se pueda usar aquí. Un WAV no necesita codificador: son las muestras con una cabecera corta delante, así que ese paso no puede perder nada.

Las consecuencias prácticas: lo que sale es mucho más grande que lo que entró — unos diez megabytes por minuto en estéreo — y no es *mejor* que el MP3 del que viene, porque la compresión que ya ocurrió no se deshace. Un WAV lo abre todo, y cualquier cosa que necesite un MP3 puede hacerlo a partir de él en un paso.

## Marcar varias partes de una vez

Casi todos los cortadores en línea te dan un par de tiradores y preguntan qué único tramo quieres conservar. Para una grabación real eso responde a la pregunta equivocada. Una hora de entrevista no tiene una parte buena; tiene seis, repartidas, y las encuentras escuchándola una vez.

Así que marca mientras escuchas: `I` donde empieza una parte, `O` donde acaba, tantas veces como quieras. Cada pareja se convierte en una fila que puedes retocar o reordenar, y en una banda dibujada sobre la forma de onda. El archivo terminado son esas filas unidas en orden.

La misma lista de marcas responde también a la pregunta contraria. Si lo que quieres que se vaya son los «eh», el teléfono sonando y los arranques fallidos, marca *eso* y cambia a «quitar lo marcado» — entonces se une todo lo que no marcaste. Son las mismas marcas en los dos casos, así que puedes ir de una a otra y ver cambiar la duración final sin marcar nada dos veces.

Marcar es trabajo cuidadoso, y una pestaña cerrada no debería costártelo, así que las marcas se guardan en un archivo de texto plano y se vuelven a cargar. El formato es el que escribe el [Cortador de vídeo](https://abox.tools/es/cortar-video/), lo que significa que las marcas hechas sobre un vídeo se pueden soltar sobre su audio extraído, y al revés.

## Mira la forma de onda

Marcar sonido a base de rebobinar es adivinar; marcarlo con la vista no. El silencio parece silencio, una tos parece una tos, y los cuatro segundos de ruido de sala antes de que alguien empiece a hablar se ven de inmediato en lugar de tener que buscarlos.

Esto importa sobre todo en las marcas que casi todo el mundo pone algo torcidas: el principio de una frase suele querer quedarse en el silencio *anterior* a la respiración, no después, y el final suele querer un compás de ruido de sala en vez de un corte sobre la última consonante. Las dos cosas son evidentes en el dibujo y casi imposibles de acertar solo de oído. Arrastra los extremos de una parte marcada a lo largo de la forma de onda para ajustarlos.

![Una forma de onda con dos secciones marcadas, los huecos entre frases bien visibles y una tabla con el inicio, el final y la duración de cada sección.](https://abox.tools/screens/trim-an-audio-file/marks.webp)

Los huecos son donde alguien dejó de hablar. Eso es lo que hace que merezca la pena mirar una forma de onda y no un cronómetro.

## Cortar no es fundir, y tampoco es editar

Tres palabras que se usan unas por otras. Cortar cambia qué partes de la grabación sobreviven. Un fundido — el musical, de segundos — es un efecto deliberado sobre el nivel, y los pocos milisegundos descritos arriba no son eso; son quitar chasquidos, y da la casualidad de que usan la misma aritmética.

Si lo que quieres es la grabación del revés, acelerada, ralentizada sin que el tono se mueva, o subida porque se grabó demasiado bajita, eso es el [Editor de audio](https://abox.tools/es/editar-audio/). Es el mismo decodificador y el mismo escritor de WAV; solo hace otra aritmética por el camino.

## Por qué esto no necesita subir nada

Cortar es aritmética sobre una lista. El navegador ya tiene el decodificador — es el mismo que reproduce el archivo en un elemento `<audio>` — y una vez decodificadas las muestras, quedarse con unas y dejar caer el resto es una copia. En esa descripción no hay ningún paso que un servidor pudiera hacer mejor, y el viaje de ida y vuelta hasta uno sería la parte más lenta de todo el trabajo.

Es además un tipo de archivo en el que subir cuesta más de lo que la gente cree. Las grabaciones son voces: entrevistas, clases, llamadas, notas de voz, sesiones de terapia, un niño diciendo algo que quieres conservar. La herramienta de aquí no tiene función de red de ningún tipo, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, y ninguna es de este sitio.

Desconecta internet y corta una grabación igualmente, si prefieres comprobarlo a que te lo cuenten. [¿Es seguro subir archivos a conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone otras tres comprobaciones parecidas.
