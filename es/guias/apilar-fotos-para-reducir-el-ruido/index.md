# Cómo apilar fotografías para reducir el ruido, o quitar gente

Una ráfaga de tomas lleva más información que cualquiera de ellas. Promediarlas cancela el ruido; tomar el valor central de cada píxel borra todo lo que solo estaba parte del tiempo. Cuál de las dos quieres depende enteramente de qué se movió.

[Abrir Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/), suelta la ráfaga entera y elige el método por lo que quieras quitar de en medio:

- **Ruido**, y no se movió nada — media.
- **Ruido**, y se movió algo — recorte sigma.
- **Gente, coches, un avión** — mediana.
- **Un cielo oscuro que quieres como estelas de estrellas** — aclarar.
- **Una macro con casi nada de profundidad de campo** — apilado de enfoque.

Deja la alineación puesta si la cámara estaba en tus manos y quítala si estaba en un trípode. Los archivos RAW pueden entrar directamente; no hace falta revelarlos antes.

Todo lo que sigue es por qué esas cinco líneas dicen lo que dicen.

## Por qué una ráfaga lleva más que una toma

Una fotografía hecha con poca luz es la imagen más ruido, y el ruido es distinto cada vez. Esa última parte es lo que hace que apilar funcione. Haz la misma toma dieciséis veces y la imagen es idéntica en las dieciséis mientras que el ruido no lo es, así que promediarlas deja la imagen y cancela la mayor parte del ruido.

La mejora es la raíz cuadrada del número de tomas. Cuatro tomas reducen el ruido a la mitad. Dieciséis, a la cuarta parte. Cien, a la décima. Es una curva brutal en la que estar — pasar de dieciséis tomas a sesenta y cuatro te da la misma mejora otra vez, a cambio de cuatro veces el disparo — y por eso casi cualquier pila práctica está entre ocho y treinta tomas.

Hay una segunda ganancia, más callada. Promediar dieciséis tomas de ocho bits da un resultado con gradaciones más finas que las que tenía cualquiera de ellas, porque el ruido que hacía que cada toma redondeara distinto es justo lo que permite que la media caiga entre los niveles. Apilar un conjunto ruidoso no solo quita ruido; recupera tono que una sola toma había cuantizado.

## La pregunta que elige el método

No «qué quiero conservar», sino **qué era distinto entre las tomas**. Todo lo demás sale de ahí.

### No se movió nada: media

La media aritmética a secas. Es la reducción de ruido más eficaz que existe en un conjunto donde lo único que cambia entre tomas es el ruido, y la más fácil de arruinar: una toma con un pájaro pone un pájaro tenue sobre toda la pila, porque una media no tiene opinión sobre un valor que no concuerda con los demás. Simplemente lo incluye.

### Algo cruzó el encuadre: mediana

Alinea una docena de fotografías de una plaza concurrida y mira un píxel. En la mayoría es acera; en una o dos es el abrigo de alguien. Ordena esos doce valores, toma el del medio y sale acera, porque el abrigo nunca fue mayoría.

Haz eso para cada píxel y la plaza sale vacía. Es el truco detrás de cualquier artículo de «quita a los turistas de tu foto de vacaciones», y no necesita nada más listo que una ráfaga y paciencia. Lo único que exige es que **ninguna parte de la escena esté ocupada más de la mitad del tiempo**. Una persona quieta en ocho de tus doce tomas es mayoría en esos píxeles, y la mediana la conserva.

### Las dos cosas: recorte sigma

La mediana tira la mayor parte de la información para conseguir su robustez: en cada píxel se descartan once de tus doce valores, así que reduce el ruido mucho menos de lo que lo haría una media del mismo conjunto.

El recorte sigma es el término medio, y suele ser el ajuste correcto por defecto para cualquier conjunto del mundo real. Mira cada píxel a lo largo de todas las tomas, calcula qué suele ser y cuánto varía, y después promedia solo los valores que concuerdan con eso. Un coche que cruzó una toma queda excluido en esos píxeles; todas las demás tomas siguen contando en todas partes. Consigues la inmunidad de la mediana ante lo que se movió y la mayor parte de la reducción de ruido de la media.

El umbral va en desviaciones típicas, y dos es el punto de partida habitual. Más bajo descarta más, y empieza a descartar detalle real junto con el coche.

### Solo importa lo brillante: aclarar

Conservar el valor más brillante que haya tenido cada píxel. Fotografía el cielo nocturno como doscientas exposiciones de treinta segundos y acláralas juntas, y cada estrella dibuja su propio arco sobre el resultado: una estela de estrellas, montada a partir de exposiciones cortas que nunca se quemaron por separado. El mismo método monta unos fuegos artificiales a partir de las tomas de su propia explosión, y una pintura con luz a partir de un paseo con una linterna por una habitación oscura.

Su contrario, oscurecer, es el callado de la pareja: un píxel solo sigue brillante si lo estaba en *todas* las tomas, así que los reflejos en una ventana, los faros que pasan y las gotas de lluvia iluminadas por un flash desaparecen.

### El sujeto es más profundo que el enfoque: apilado de enfoque

Una macro a f/8 tiene quizá un milímetro enfocado, y eso no basta para un insecto. La respuesta es hacer veinte tomas a lo largo del anillo de enfoque y conservar de cada una solo la parte que estaba nítida en ella. La herramienta mide cuánto se diferencia cada píxel de sus vecinos — mucho en un borde, casi nada en un desenfoque — y se queda con el ganador.

Este quiere trípode más que ninguno de los otros, porque mover el anillo de enfoque a mano mueve la cámara, y una toma hecha desde un poco más lejos no es la misma imagen a otro enfoque.

![La lista de modos, media, mediana, más claro y más oscuro, con un plan debajo que da el tamaño de salida, la memoria necesaria y cuánto hay que leer de cada archivo.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

El modo es la pregunta de esta sección. El plan de debajo es la herramienta diciendo lo que costará la pasada antes de empezarla.

## Alinear las tomas

Apilar es aritmética píxel a píxel, así que da por hecho que un píxel dado es la misma parte de la escena en todas las tomas. A pulso no lo es: una ráfaga deriva decenas de píxeles, y promediar eso produce un desenfoque en vez de una imagen limpia. Ese es el motivo más común de que un primer intento de apilado decepcione.

Así que las tomas se miden contra una de ellas y se devuelven antes a su sitio, con precisión de fracciones de píxel. Tres ajustes:

- **Solo desplazamiento** es lo correcto para casi todo lo hecho a pulso. Corrige la deriva y el temblor.
- **Desplazamiento, rotación y escala** para un conjunto en el que además girabas un poco, o en el que se coló un zoom. Cuesta una medición más por toma y nada en absoluto cuando las tomas resultan estar derechas.
- **Ninguna** para un trípode fijo o una secuencia de intervalómetro, donde las tomas ya están alineadas y medirlas es tiempo perdido.

Lo que ninguna alineación puede arreglar es un sujeto que se movió en vez de una cámara que se movió, ni una fotografía hecha un paso más a la izquierda. Moverse de lado cambia cuánto se desplaza lo cercano respecto a lo lejano, y ninguna corrección única describe las dos cosas a la vez. Girar sobre el sitio vale; andar no.

![El resultado: la imagen apilada, con una nota que dice cuánto hubo que mover cada fotograma para alinearlo con el primero.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Las cifras de alineación merecen una lectura. Una ráfaga a pulso se mueve unos píxeles por fotograma, y eso es lo que el alineador deshace sin decir nada.

## Dónde encajan los archivos RAW

Puedes soltar CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF y el resto directamente, y conviene ser exacto sobre qué les pasa, porque no es lo que hace un revelador RAW.

Todo archivo RAW ya contiene un **JPEG a tamaño completo que la cámara reveló al disparar**. Es lo que te enseña la pantalla trasera de la cámara y lo que dibuja tu sistema operativo como miniatura. El apilador encuentra esa imagen y la usa. No decodifica los datos del sensor.

Dos consecuencias, una buena y otra que conviene conocer:

- **Es rápido.** Encontrar la vista previa significa leer unos kilobytes de directorio y después un solo trozo, así que una toma de 60 MB abre casi tan rápido como un JPEG. Veinte de ellas abren en el tiempo que un revelador RAW dedicaría a una. La página te enseña qué poco de tus archivos ha leído realmente.
- **Es la interpretación de la cámara, no la tuya.** Ocho bits por canal, con el balance de blancos y el estilo de imagen que tuviera puestos la cámara, y no los doce o catorce bits de datos lineales de sensor que sacarías de un revelador.

Para reducir ruido, estelas de estrellas, quitar transeúntes y apilado de enfoque, ese intercambio casi siempre compensa: las vistas previas están a resolución completa y son lo que habrías obtenido como JPEG de todas formas. Si estás levantando mucho las sombras, o apilando para astrofotografía donde el último bit de rango dinámico es todo el objetivo, revela antes las tomas en un revelador RAW y apila los TIFF o los JPEG que dé. Entran igual.

## Qué cuesta ejecutarlo

Conviene saberlo porque es la diferencia entre una pila que tarda ocho segundos y una que tarda dos minutos.

Seis de los siete métodos solo necesitan recordar una cosa. Un máximo corriente no se preocupa por las tomas que ya ha visto, y una suma corriente tampoco, así que esos métodos leen cada toma exactamente una vez y usan la misma memoria para cien tomas que para dos.

La mediana no puede funcionar así, porque no se puede saber el valor central de un conjunto hasta tenerlo entero. Veinte tomas de 24 megapíxeles son alrededor de 1,4 GB de píxeles sostenidos a la vez, y eso no te lo da ningún navegador, así que la imagen se corta en bandas horizontales y se apila banda a banda: correcto, y más lento, porque las tomas se releen para cada banda.

La herramienta calcula todo esto antes de que pulses el botón y te lo dice: cómo de grande será el resultado, cuánta memoria necesita aproximadamente y cuántas veces se decodificarán tus tomas. Si dice que la pasada irá por bandas, bajar un escalón la resolución de trabajo divide la memoria entre cuatro y casi siempre la convierte otra vez en una sola pasada — y si estás apilando para quitar ruido, media resolución ya iba a verse más limpia que la completa.

## Disparar pensando en esto

La mayor parte de la calidad de una pila se decide antes de que la vea ningún programa.

- **Haz más tomas de las que crees necesitar.** La curva de la raíz cuadrada es implacable en la parte baja y generosa en la alta: pasar de cuatro a nueve tomas es un cambio más visible que pasar de veinte a cuarenta.
- **No cambies la exposición entre tomas.** Apilar da por hecho que las tomas son de la misma escena con el mismo brillo. Fija la exposición, o la herramienta estará promediando dos imágenes distintas.
- **Para quitar gente, espera entre tomas.** Una ráfaga hecha en dos segundos pilla a la misma persona en el mismo sitio en todas las tomas, y la mediana la conserva. Diez tomas separadas por unos segundos funcionan mucho mejor que cincuenta en ráfaga.
- **Para estelas de estrellas, deja huecos cortos.** Aclarar dibuja exactamente lo que registraron las tomas, así que una pausa entre exposiciones se convierte en un guion visible en todas las estelas.

## Nada de esto sale de tu equipo

Una pila de veinte tomas RAW es alrededor de un gigabyte de fotografías, que es mucho para entregárselo a una web para que le saque la media. El [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/) lee los archivos de tu propio disco y hace la aritmética en tu propio navegador. No hay paso de subida, ni cuenta, ni cola, y puedes comprobar esa afirmación como comprobarías la de cualquiera: abre el panel de red de tu navegador mientras se ejecuta, o simplemente desconéctate de internet y apílalas igualmente.

La pregunta relacionada — cómo saber, para cualquier herramienta, si entregarle un archivo hacía falta — tiene [su propia guía](https://abox.tools/es/guias/es-seguro-subir-archivos/).
