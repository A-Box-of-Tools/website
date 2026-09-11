# Cómo comprimir una imagen a un tamaño de archivo exacto

Te han dado un número, sea 100 KB, 500 KB o 2 MB, y tu foto no se acerca ni de lejos. Aquí va lo que cuesta ese número, en qué conviene gastarlo y cómo saber si el resultado sigue estando lo bastante bien para mandarlo.

[Abrir Compresor de imágenes](https://abox.tools/es/comprimir-imagen/): Tú dices el tamaño. Del resto se encarga él.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [compresor de imágenes](https://abox.tools/es/comprimir-imagen/), arrastra la foto dentro, escribe el número que te han dado y pulsa el botón. La herramienta codifica la imagen varias veces, se queda con el mejor resultado que cabe por debajo de tu objetivo y te dice lo que ha costado. Con la mayoría de las fotografías y la mayoría de los objetivos, el resumen honesto es que no vas a ver la diferencia.

El resto de esta página es para cuando eso no pasa: cuando el resultado sale blando, cuando un PNG apenas se mueve, o cuando quieres saber qué le está haciendo la herramienta a tu foto antes de mandársela a nadie.

![La tarjeta del objetivo: 200 kB escritos, botones con los límites más habituales, un menú de formato y una nota con lo que la herramienta va a intentar.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Escribe la cifra que te han dado. Todo lo de abajo es la herramienta trabajando hacia ella, en lugar de tú adivinando con un control de calidad.

## Qué está pidiendo de verdad un límite de tamaño

Un JPEG o un WebP no guarda tu fotografía: guarda una descripción de ella, y el ajuste de calidad decide hasta qué punto se le permite ser detallada. Si lo bajas, el archivo encoge porque la descripción se vuelve más vaga. La textura fina se promedia, los degradados hacen bandas y los bordes cogen un halo tenue de bloques.

Así que un límite de tamaño es en realidad un presupuesto de detalle. La pregunta útil no es «¿puedo llegar a 500 KB?», porque a cualquier número se llega siempre. La pregunta es cuánta imagen hay que entregar para llegar hasta ahí, y si eso importa para lo que vas a hacer con ella.

Dos reglas prácticas. Una fotografía de una escena real, con caras, follaje o tela, esconde bien la compresión, porque el ojo no encuentra ninguna zona perfectamente plana en la que notar el daño. Una captura de pantalla, un gráfico, un logotipo o cualquier cosa con colores planos grandes y bordes duros de texto la delata al momento, y suele pedir un PNG o un WebP en vez de un JPEG.

## Por qué no hay ninguna fórmula, y qué hacer al respecto

No hay manera de calcular el ajuste de calidad que produce un archivo de 500 KB. La relación entre los dos depende por completo de lo que haya en la foto: con el mismo ajuste, una fotografía de una pared lisa puede salir a la décima parte del tamaño de una fotografía de un bosque. Cualquier herramienta que te ofrezca «calidad: 60» y cruce los dedos está adivinando por ti.

El único método fiable es probar: codificar la imagen, mirar el tamaño, ajustar y volver a codificar. Hacerlo a mano es un latazo, y por eso los compresores te piden un número de calidad, porque así el latazo te lo pasan a ti. Hacerlo automáticamente son unas ocho codificaciones, y ocho codificaciones de una foto de móvil son una fracción de segundo en cualquier dispositivo hecho esta década. De ahí que la herramienta de este sitio te pida el tamaño y haga ella misma la búsqueda.

Cada tamaño que te da es un archivo codificado de verdad, no una estimación. Eso importa cuando un formulario tiene un límite duro, porque una estimación optimista por un 2 % es una subida rechazada.

## Gasta calidad antes que píxeles

Solo hay dos formas de hacer más pequeño un archivo de imagen. Una es describir la misma foto con menos precisión, y eso es la calidad. La otra es describir menos píxeles, y eso es redimensionar. No son equivalentes, y el orden importa.

La calidad va primero, porque el primer 30 % de bajada, más o menos, es de verdad invisible en una fotografía: estás tirando detalle que el formato guardaba con más cuidado del que ningún ojo puede comprobar. Los píxeles van después, porque en cuanto la calidad baja lo suficiente como para que asomen los artefactos, una foto más pequeña con una calidad decente se ve mejor que una foto a tamaño completo pero estropeada. Menos píxeles buenos le ganan a más píxeles malos.

Ahí está la estrategia entera, y conviene sabérsela aunque uses otra herramienta: baja la calidad hasta que empiece a verse mal y, a partir de ahí, haz la foto más pequeña en lugar de seguir bajándola.

### Cuándo redimensionar a propósito

A veces esos píxeles nunca hicieron falta. Una foto de 4000 píxeles de ancho puesta en una columna de 600 píxeles de una página web lleva seis veces el detalle que nadie va a ver. Si sabes dónde va a acabar la foto, redimensiónala a eso primero y muchas veces el problema de tamaño desaparece sin gastar nada de calidad. El [redimensionador de imágenes](https://abox.tools/es/redimensionar-imagen/) es la herramienta para ese trabajo, y [su propia guía](https://abox.tools/es/guias/redimensionar-una-imagen/) explica cómo elegir un tamaño.

## Elegir un formato

Merece la pena conocer tres formatos, y los navegadores saben escribir los tres.

- **JPEG** es para fotografías. Tiene pérdidas, lo entiende todo lo que se ha fabricado jamás, y para una imagen de una escena real sigue siendo una elección excelente. No puede guardar transparencia.
- **WebP** hace el mismo trabajo y lo hace mejor: entre un 25 y un 35 % más pequeño que el JPEG a una calidad que no vas a distinguir, y además conserva la transparencia. Lo lee cualquier navegador actual. La única pega de verdad son unas pocas aplicaciones de escritorio antiguas y algunos formularios de subida corporativos que siguen sin leerlo.
- **PNG** no tiene pérdidas, o sea que es exacto y es grande. Es la respuesta correcta para capturas de pantalla, logotipos, dibujo de línea y cualquier cosa con bordes nítidos o color plano, y la respuesta equivocada para una fotografía.

Si quien te ha pedido el archivo no te ha puesto ninguna condición, el WebP te llevará hasta el objetivo con menos daño visible que el JPEG. Si el archivo va a algo antiguo, o a un sistema que no puedes probar, la respuesta segura es JPEG.

## Por qué tu PNG no se va a hacer mucho más pequeño

Esta es la sorpresa más habitual, y no es culpa de la herramienta que estés usando. El PNG es un formato sin pérdidas: guarda los píxeles exactos y no tiene ningún control de calidad que bajar, porque bajarlo lo convertiría en otro formato. Lo único que puede hacer un compresor de PNG es empaquetar esos mismos píxeles con más maña, y eso suele valer un pequeño porcentaje.

Así que si necesitas sí o sí un archivo mucho más pequeño y tiene que seguir siendo un PNG, la única palanca que te queda es el tamaño: menos píxeles o menos colores. Y si puede dejar de ser un PNG, la pregunta es qué lleva dentro:

- **Una fotografía guardada como PNG.** Pasa muchísimo, casi siempre sin querer, y es la victoria más fácil de esta página: convertirla a JPEG o WebP suele dejarla de cinco a diez veces más pequeña sin ningún cambio visible.
- **Una captura de pantalla o un diagrama.** Pásalo a WebP, que también va sin pérdidas cuando se lo pides y para los mismos píxeles suele salir más pequeño que el PNG. Pasarlo a JPEG te dejará los bordes del texto emborronados.
- **Un logotipo con transparencia.** El WebP conserva la transparencia; el JPEG te la rellena con un color sólido, que casi nunca es lo que querías.

## Cómo saber si el resultado es lo bastante bueno

Mirar una miniatura no demuestra nada, porque a tamaño de miniatura todo se ve bien. Hay dos comprobaciones mejores:

**Míralo a tamaño completo, en lo más plano del encuadre.** El cielo, la piel, una pared pintada. El daño de la compresión sale primero en los degradados suaves, en forma de bloques o de bandas tenues, mucho antes de tocar las zonas con detalle.

**Lee la medición, si la herramienta te da una.** El compresor de aquí descodifica su propio resultado, lo compara con el original y te da el SSIM, un número que compara brillo, contraste y estructura locales en lugar de contar píxeles cambiados, y que por eso se parece mucho más a lo que le molesta al ojo. Por encima de 0,98 más o menos, cuesta separar las dos fotos aunque las pongas una al lado de la otra. Por debajo de 0,95 más o menos, míralo antes de mandarlo. También te da el PSNR, la cifra clásica en decibelios, para quien la prefiera.

Las dos se calculan en tu propio dispositivo y se te enseñan, que es para lo que están: convierten la «pérdida mínima de calidad» de una afirmación en un número que puedes comprobar.

![Una fila de resultado con el original en 1,4 MB y la copia comprimida en 196 kB, la calidad con la que llegó y un enlace para compararlas.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

Lo que salió de verdad, al lado de lo que entró. El enlace de comparación es como descubres si la cifra te ha costado algo que se note.

## Tres cosas que conviene saber antes de mandar el archivo

**Comprimir quita los metadatos.** Recodificar consiste en descodificar la foto a píxeles y volver a codificar esos píxeles, y un lienzo lleno de píxeles no lleva etiquetas, así que la posición GPS, el modelo de cámara, las marcas de tiempo y todo lo demás sencillamente no se escriben en el archivo nuevo. Normalmente eso juega a tu favor. Si lo que querías era quitar las etiquetas sin tocar la foto, eso es otro trabajo: el [visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/) reescribe el contenedor sin volver a comprimir nada, y [su guía](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/) explica qué hay ahí dentro.

**No comprimas nunca dos veces el mismo archivo.** Cada codificación con pérdidas tira detalle para siempre, y codificar una foto ya comprimida tira todavía más, porque además conserva fielmente los artefactos de la primera pasada a costa de detalle de verdad. Vuelve siempre al original y comprime una sola vez.

**Guarda el original.** De una codificación con pérdidas no se vuelve. Mandes lo que mandes, ten guardado en alguna parte el archivo del que partiste.

## Nada de esto necesita una subida

Todos los navegadores llevan años trayendo un codificador de JPEG, PNG y WebP: es el mismo código que guarda una imagen desde un lienzo. Comprimir una imagen es de esos trabajos que no tienen ninguna razón técnica para meter un servidor por medio, y por eso la herramienta de aquí no tiene ninguno. La imagen se descodifica, se codifica y se mide en tu propio dispositivo, y en la `Content-Security-Policy` de la página no hay ninguna dirección de este sitio a la que pudiera mandarse.

La forma más sencilla de confirmarlo, aquí o en cualquier otro sitio, es cargar la página, desconectarte de internet y comprimir algo igualmente. Si sigue funcionando, es que no se estaba subiendo nada. [¿Es seguro subir archivos a los conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) plantea otras tres comprobaciones parecidas.
