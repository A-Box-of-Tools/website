# Cómo apilar fotografías para reducir el ruido, o quitar gente

Una ráfaga contiene más información que cada toma por separado. La media reduce el ruido aleatorio independiente; el valor central de cada píxel puede quitar lo que aparece en menos de la mitad de las tomas. La elección depende de lo que se movió.

[Abrir Apilador de imágenes](https://abox.tools/es/apilar-imagenes/): Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.

Última actualización 8 de octubre de 2026

## La respuesta corta

Abre el [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/), suelta la ráfaga entera y elige el método por lo que quieras quitar de en medio:

- **Ruido**, y no se movió nada — media.
- **Ruido**, y se movió algo — recorte sigma.
- **Gente, coches, un avión** — mediana.
- **Un cielo oscuro que quieres como estelas de estrellas** — aclarar.
- **Una macro con casi nada de profundidad de campo** — apilado de enfoque.

Empieza con **Auto con perspectiva** para reducir ruido, incluso en fotos nocturnas tomadas con trípode: las estrellas se mueven aunque la cámara esté quieta. Usa **No** para estelas de estrellas intencionadas o tomas que ya coinciden. Los RAW pueden entrar directamente si contienen una vista previa JPEG utilizable. La fila muestra el tamaño real de la imagen.

Todo lo que sigue es por qué esas cinco líneas dicen lo que dicen.

## Por qué una ráfaga lleva más que una toma

Una fotografía hecha con poca luz es la imagen más ruido, y el ruido es distinto cada vez. Esa última parte es lo que hace que apilar funcione. Haz la misma toma dieciséis veces y la imagen es idéntica en las dieciséis mientras que el ruido no lo es, así que promediarlas deja la imagen y cancela la mayor parte del ruido.

La mejora es la raíz cuadrada del número de tomas. Cuatro tomas reducen el ruido a la mitad. Dieciséis, a la cuarta parte. Cien, a la décima. Es una curva brutal en la que estar — pasar de dieciséis tomas a sesenta y cuatro te da la misma mejora otra vez, a cambio de cuatro veces el disparo — y por eso casi cualquier pila práctica está entre ocho y treinta tomas.

La media también estabiliza la estimación de los tonos porque cada toma con ruido se redondeó de forma algo distinta. La herramienta usa acumuladores más amplios y redondea el valor combinado al final. El PNG o JPEG guardado sigue teniendo ocho bits por canal: una media más limpia no aumenta la profundidad de salida.

## La pregunta que elige el método

No «qué quiero conservar», sino **qué era distinto entre las tomas**. Todo lo demás sale de ahí.

### No se movió nada: media

La media aritmética a secas. Es la reducción de ruido más eficaz que existe en un conjunto donde lo único que cambia entre tomas es el ruido, y la más fácil de arruinar: una toma con un pájaro pone un pájaro tenue sobre toda la pila, porque una media no tiene opinión sobre un valor que no concuerda con los demás. Simplemente lo incluye.

### Algo cruzó el encuadre: mediana

Alinea una docena de fotografías de una plaza concurrida y mira un píxel. En la mayoría es acera; en una o dos es el abrigo de alguien. Ordena esos doce valores, toma el del medio y sale acera, porque el abrigo nunca fue mayoría.

Haz eso para cada píxel y la plaza sale vacía. Es el truco detrás de cualquier artículo de «quita a los turistas de tu foto de vacaciones», y no necesita nada más listo que una ráfaga y paciencia. Lo único que exige es que **ninguna parte de la escena esté ocupada más de la mitad del tiempo**. Una persona quieta en ocho de tus doce tomas es mayoría en esos píxeles, y la mediana la conserva.

### Las dos cosas: recorte sigma

La mediana reduce el ruido aleatorio independiente con menos eficiencia que la media. El resultado sale del valor central o de los dos valores centrales, en vez de promediar todos los valores. Ese es el coste de verse menos afectada por unos pocos valores muy distintos del resto.

El recorte sigma estima primero la media y la dispersión de cada canal y luego promedia solo los valores dentro del umbral elegido. Puede rechazar un objeto que pasó por pocas tomas y promediar el resto del fondo. Es menos fiable con conjuntos pequeños o si el objeto aparece a menudo. Con el umbral predeterminado, un valor distinto entre cuatro idénticos puede seguir aceptándose. Usa mediana si quitar el objeto importa más que lograr la mayor reducción de ruido.

El umbral se mide en desviaciones estándar y empieza en dos. Bajarlo rechaza más valores, incluido detalle real. Si se rechazan todos los valores de un canal, se conserva su media original para no dejar un hueco.

### Solo importa lo brillante: aclarar

Conservar el valor más brillante que haya tenido cada píxel. Fotografía el cielo nocturno como doscientas exposiciones de treinta segundos y acláralas juntas, y cada estrella dibuja su propio arco sobre el resultado: una estela de estrellas, montada a partir de exposiciones cortas que nunca se quemaron por separado. El mismo método monta unos fuegos artificiales a partir de las tomas de su propia explosión, y una pintura con luz a partir de un paseo con una linterna por una habitación oscura.

Su contrario, oscurecer, es el callado de la pareja: un píxel solo sigue brillante si lo estaba en *todas* las tomas, así que los reflejos en una ventana, los faros que pasan y las gotas de lluvia iluminadas por un flash desaparecen.

### El sujeto es más profundo que el enfoque: apilado de enfoque

Una macro a f/8 tiene quizá un milímetro enfocado, y eso no basta para un insecto. La respuesta es hacer veinte tomas a lo largo del anillo de enfoque y conservar de cada una solo la parte que estaba nítida en ella. La herramienta mide cuánto se diferencia cada píxel de sus vecinos — mucho en un borde, casi nada en un desenfoque — y se queda con el ganador.

Este quiere trípode más que ninguno de los otros, porque mover el anillo de enfoque a mano mueve la cámara, y una toma hecha desde un poco más lejos no es la misma imagen a otro enfoque.

### Una mezcla más brillante: sumar

Sumar añade los valores de imagen decodificados antes de aplicar el multiplicador de Exposición. Son valores de ocho bits, así que el resultado es una mezcla aditiva y no una simulación de una exposición de cámara más larga. Las zonas brillantes pueden recortarse. **Normalizar brillo** ajusta el multiplicador a uno dividido entre el número de tomas. También puedes escribir directamente un multiplicador menor.

![Métodos y ajustes de apilado con tamaño previsto de salida, memoria de trabajo estimada, decodificaciones previstas del apilado y lectura de inspección.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

El modo es la pregunta de esta sección. El plan de debajo es la herramienta diciendo lo que costará la pasada antes de empezarla.

## Alinear las tomas

Apilar es aritmética píxel a píxel, así que da por hecho que un píxel dado es la misma parte de la escena en todas las tomas. A pulso no lo es: una ráfaga deriva decenas de píxeles, y promediar eso produce un desenfoque en vez de una imagen limpia. Ese es el motivo más común de que un primer intento de apilado decepcione.

Cada toma se mide contra la marcada como **Referencia** y se recoloca si se encuentra una corrección fiable. La primera es la opción predeterminada. **Usar como referencia** cambia esa marca sin reordenar la lista. Elige una toma nítida con detalle estático claro. Hay cuatro ajustes de alineación:

- **Auto con perspectiva** es la opción predeterminada. Corrige desplazamiento, rotación y escala y añade una corrección de perspectiva si la respaldan mediciones fiables por toda la imagen. Ayuda en ráfagas nocturnas de campo amplio donde el centro coincide pero las estrellas de los bordes siguen dejando trazos. Si no encuentra un ajuste de perspectiva estable, usa la corrección más simple.
- **Solo desplazamiento** para una ráfaga que se desplazó sin girar ni cambiar de perspectiva. Corrige únicamente la traslación.
- **Desplazamiento, rotación y escala** para una serie en la que también giraste ligeramente o cambió el zoom. Requiere mediciones adicionales por toma, incluso si las tomas están rectas.
- **No** si las tomas estáticas ya coinciden o si quieres que las estrellas móviles formen estelas. Un trípode no mantiene las estrellas en los mismos píxeles durante una secuencia nocturna.

Lo que ninguna alineación puede arreglar es un sujeto que se movió en vez de una cámara que se movió, ni una fotografía hecha un paso más a la izquierda. Moverse de lado cambia cuánto se desplaza lo cercano respecto a lo lejano, y ninguna corrección única describe las dos cosas a la vez. Girar sobre el sitio vale; andar no.

Tras apilar, abre **Detalles de alineación** para ver el estado y la corrección de cada toma. Una toma que no se pudo alinear sigue incluida donde estaba; quítala y repite si vuelve borroso el resultado. El resultado se abre con la referencia a la izquierda y la pila a la derecha. Arrastra el separador con el ratón o el dedo, o enfócalo y usa las flechas izquierda y derecha. Llévalo hasta un borde para ver una imagen completa. El separador está disponible en **Ajustar a la ventana**. Al elegir **100% — píxeles reales**, se muestra todo el resultado apilado y desaparece la opción de comparación. Al 100%, arrastra la imagen para moverte por ella o enfoca la vista previa y usa las teclas de flecha. Usa **Mostrar** para examinar la referencia o la pila por separado. Vuelve a Ajustar a la ventana para comparar de nuevo con el separador.

![Una comparación dividida con la referencia a la izquierda, el resultado apilado a la derecha y un separador móvil.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

Mueve el separador sobre el ruido y los bordes finos para comparar la misma parte de ambas imágenes. Revisa los detalles de alineación si la pila parece borrosa.

## Dónde encajan los archivos RAW

CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF y formatos relacionados se pueden abrir si contienen una vista previa JPEG utilizable. Conviene precisar lo que ocurre porque es distinto de revelar los datos RAW del sensor.

Muchos RAW contienen una **vista previa JPEG creada por la cámara**. La herramienta encuentra la mayor utilizable y la decodifica con el decodificador normal del navegador. Puede ser menor que la imagen del sensor, y algunos archivos no incluyen ninguna. Comprueba las dimensiones de cada toma.

Dos consecuencias, una buena y otra que conviene conocer:

- **Evita decodificar el sensor.** Encontrar la vista previa suele requerir pequeñas lecturas de directorios y cabeceras; después el navegador lee el fragmento JPEG para decodificarlo. La cifra de inspección cuenta esas lecturas de directorios y cabeceras, no todos los bytes leídos por el decodificador de imágenes.
- **Es la interpretación de la cámara, no la tuya.** Ocho bits por canal, con el balance de blancos y el estilo de imagen que tuviera puestos la cámara, y no los doce o catorce bits de datos lineales de sensor que sacarías de un revelador.

Una vista previa utilizable puede bastar para reducir ruido, dibujar estelas de estrellas, quitar personas y apilar el enfoque. Sus dimensiones y el revelado de la cámara marcan los límites. Para elegir el balance de blancos, ajustar tonos o recuperar sombras RAW, revela primero las tomas y exporta JPEG o PNG para apilarlas aquí. El resultado guardado sigue siendo una imagen de ocho bits.

## Qué cuesta ejecutarlo

Conviene saberlo porque es la diferencia entre una pila que tarda ocho segundos y una que tarda dos minutos.

Seis métodos usan acumuladores cuyo tamaño no aumenta con el número de tomas. Media, aclarar, oscurecer, sumar y apilado de enfoque necesitan una pasada por banda. El recorte sigma necesita dos: una para estimar la media y la dispersión y otra para promediar los valores aceptados. Inspeccionar y alinear también decodifica los archivos, así que una pasada de apilado no equivale a una sola lectura total.

La mediana debe conservar los valores de cada toma para la banda que combina. Veinte tomas de 24 megapíxeles ocuparían unos 1,4 GB solo para esos valores. Las bandas permiten procesar menos filas a la vez a cambio de volver a decodificar cada toma para cada banda. Los demás métodos también pueden dividirse si sus búferes superan el presupuesto.

Antes de empezar, la herramienta muestra el tamaño previsto del resultado, la memoria de trabajo estimada, las decodificaciones previstas del apilado y los bytes leídos en la inspección. La estimación incluye los búferes de trabajo modelados; el funcionamiento interno del navegador y la liberación de memoria pueden aumentar el uso total. Bajar un nivel la resolución de trabajo divide el área de la imagen entre cuatro y puede reducir las decodificaciones repetidas. La alineación puede recortar el resultado lo suficiente para necesitar menos bandas que el plan inicial.

## Disparar pensando en esto

La mayor parte de la calidad de una pila se decide antes de que la vea ningún programa.

- **Haz más tomas de las que crees necesitar.** La curva de la raíz cuadrada es implacable en la parte baja y generosa en la alta: pasar de cuatro a nueve tomas es un cambio más visible que pasar de veinte a cuarenta.
- **No cambies la exposición entre tomas.** Apilar da por hecho que las tomas son de la misma escena con el mismo brillo. Fija la exposición, o la herramienta estará promediando dos imágenes distintas.
- **Para quitar gente, espera entre tomas.** Una ráfaga hecha en dos segundos pilla a la misma persona en el mismo sitio en todas las tomas, y la mediana la conserva. Diez tomas separadas por unos segundos funcionan mucho mejor que cincuenta en ráfaga.
- **Para estelas de estrellas, deja huecos cortos.** Aclarar dibuja exactamente lo que registraron las tomas, así que una pausa entre exposiciones se convierte en un guion visible en todas las estelas.

## Nada de esto sale de tu equipo

Una pila de veinte tomas RAW es alrededor de un gigabyte de fotografías, que es mucho para entregárselo a una web para que le saque la media. El [Apilador de imágenes](https://abox.tools/es/apilar-imagenes/) lee los archivos de tu propio disco y hace la aritmética en tu propio navegador. No hay paso de subida, ni cuenta, ni cola, y puedes comprobar esa afirmación como comprobarías la de cualquiera: abre el panel de red de tu navegador mientras se ejecuta, o simplemente desconéctate de internet y apílalas igualmente.

La pregunta relacionada — cómo saber, para cualquier herramienta, si entregarle un archivo hacía falta — tiene [su propia guía](https://abox.tools/es/guias/es-seguro-subir-archivos/).
