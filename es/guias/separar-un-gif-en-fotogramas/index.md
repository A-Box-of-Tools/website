# Cómo dividir un GIF en fotogramas PNG

Guarda una imagen útil, una carpeta de fotogramas PNG o una hoja de sprites sin subir la animación. Elige imágenes completas para editar, conserva una referencia aparte de los retardos y decide cuándo conviene convertir el GIF original directamente a MP4.

[Abrir Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/): Extrae fotogramas PNG, un ZIP o una hoja de sprites, con los tiempos anotados.

Última actualización 23 de octubre de 2026

## La respuesta corta

Abre el [Separador de GIF](https://abox.tools/es/separar-gif-en-fotogramas/), suelta el GIF dentro, y cada fotograma aparece como un PNG que puedes descargar — de uno en uno, o todos en un solo ZIP. Deja los ajustes como están y obtienes exactamente lo que casi todo el mundo quiere decir: cada fotograma como imagen completa, tal y como se ve en ese momento de la animación.

El resto de esta página va de las tres cosas que sorprenden después: un fotograma que es solo un trozo pequeño, una transparencia que se vuelve negra en otro sitio, y unos tiempos que dejan de existir en cuanto los fotogramas son archivos sueltos.

## Elige entre extraer, editar o convertir a vídeo

Si el problema es el tamaño o los tiempos de la animación, inspecciona primero el original en [Analizador de GIF](https://abox.tools/es/analizar-gif/). Los retardos, las reglas de disposición y la distribución de bytes ayudan a entender qué hay que cambiar; la [guía sobre la estructura del GIF](https://abox.tools/es/guias/que-hay-dentro-de-un-gif/) explica cómo interpretarlos.

Para editar un GIF, extrae fotogramas PNG completos y sigue el [proceso de dividir y reconstruir](https://abox.tools/es/guias/editar-un-gif-fotograma-a-fotograma/). Si el destino necesita vídeo, [convierte el original directamente a MP4](https://abox.tools/es/convertir-gif-a-mp4/) en vez de reconstruir una secuencia PNG. La conversión conserva los distintos retardos; las zonas transparentes reciben un color y el reproductor controla la repetición.

## Una imagen útil, una carpeta de edición o una hoja

Para ilustrar un paso en instrucciones o diapositivas, deja Cada PNG contiene en El fotograma tal como aparece y descarga el más claro. Conserva transparencia si el editor la entiende o rellena con el fondo del documento si la convierte en negro. El fragmento almacenado sin componer no es una ilustración independiente.

Para una hoja de contactos o referencia de sprites, elige fotogramas y Descargar como una hoja de sprites. Reúne imágenes visibles de igual tamaño en PNG; no lleva tiempos ni crea animación. Un GIF largo puede superar lienzo o memoria. Conserva menos fotogramas o usa ZIP con frames.txt si el siguiente editor necesita imágenes separadas y tiempos.

## Qué es de verdad un fotograma de GIF

Un GIF no es un montón de imágenes. Es *una* imagen, seguida de una serie de parches.

Cada fotograma después del primero guarda solo el rectángulo que cambió, junto con una regla sobre qué hacer con el lienzo a continuación. Todo lo demás en pantalla es sencillamente lo que dejaron ahí los fotogramas anteriores. Una persona hablando delante de una pared quieta cuesta un rectángulo de cara por fotograma en vez de una imagen entera por fotograma, y esa es toda la razón de que un formato sin compensación de movimiento y sin paso con pérdida no sea del todo inservible.

Así que hay dos respuestas distintas, e igual de honradas, a «dame el fotograma 14», y la herramienta ofrece las dos:

**El fotograma tal y como aparece.** La imagen completa en ese momento: el fotograma 14 dibujado encima de todo lo anterior. Es lo predeterminado, y es lo que quieres para una hoja de contactos, una miniatura, una imagen para publicar, o fotogramas que van a un editor de vídeo.

**Solo los píxeles que ese fotograma guarda.** El parche en sí, con su tamaño y posición, dejando transparente todo lo que no contiene. El fotograma 14 puede ser ⁦60 × 40⁩ píxeles de una boca. Esta vista explica adónde fueron los bytes del GIF y solo es necesaria para un editor que también entienda la posición y la regla de disposición de cada parche. Para la edición habitual de imágenes o para reconstruir en Creador de GIF, utiliza fotogramas completos.

Cuando un fotograma guardado parece un fragmento, tu archivo no tiene nada malo. Eso es el archivo.

![Doce fotogramas numerados de una animación, cada uno como imagen y con el tiempo que se mantiene.](https://abox.tools/screens/split-a-gif-into-frames/frames.webp)

Cada fotograma como imagen entera, que no es lo que hay en el archivo: de esa diferencia trata esta sección.

## La regla de descarte, y por qué algunos fotogramas dejan agujeros

Cada fotograma lleva además una de cuatro instrucciones sobre qué pasa con su rectángulo antes de que se dibuje el siguiente. La herramienta la muestra bajo cada fotograma en la vista de lo guardado:

**Se queda en pantalla.** La habitual. El parche se queda donde cayó y el siguiente fotograma dibuja encima.

**Borra su zona después.** El rectángulo se limpia antes de que aterrice el siguiente fotograma. Es lo que hace una animación con un objeto transparente en movimiento, y también la causa clásica de los GIF que parpadean.

**Restaura lo que había debajo.** El lienzo vuelve al aspecto que tenía antes de que este fotograma dibujara — un sello, y luego un deshacer. Rara, y la que más lectores caseros de GIF hacen mal.

Un detalle que conviene saber si comparas herramientas: la especificación dice que «borra su zona» debería restaurar el *color de fondo*, pero todos los navegadores desde los años noventa borran a *transparente* en su lugar, porque es lo que daban por hecho las animaciones de entonces. Esta herramienta sigue a los navegadores a propósito, para que los fotogramas que recibes sean los fotogramas que viste.

![La tarjeta de ajustes: la elección entre el fotograma tal como se ve y el parche en bruto guardado en el archivo, con un color de fondo para las partes transparentes.](https://abox.tools/screens/split-a-gif-into-frames/settings.webp)

La opción tal como se ve repite las reglas de descarte y te entrega imágenes. La otra te entrega lo que hay de verdad en el archivo, con agujeros incluidos.

## Qué pasa con la transparencia

La transparencia del GIF es un bit. Un píxel está pintado o es invisible, y no hay nada en medio — ni bordes suaves, ni sombras a medias. Por eso un GIF con fondo transparente tiene ese contorno duro y algo dentado.

El PNG guarda exactamente eso, sin pérdida, así que los fotogramas salen con su transparencia intacta y no se inventa nada. Consérvala si los fotogramas van a algún sitio que entienda de transparencia.

Rellénala con un color si no es el caso. El software que ignora un canal alfa suele pintarlo de negro, así que un fotograma que se veía bien en el navegador llega con fondo negro — y un parche guardado, que es transparente en casi toda su superficie, llega como un rectángulo negro con una boca dentro. Elegir el color de antemano es el arreglo. Queda escrito en el PNG y ya no se puede deshacer, que es la única razón por la que no viene puesto de fábrica.

## Los tiempos, que los fotogramas no pueden llevar

Un PNG no tiene dónde apuntar cuánto tiempo estuvo en pantalla. Separa una animación en PNG y los tiempos desaparecen, cosa que importa en cuanto quieres volver a montarla.

Para eso está `frames.txt` en el ZIP. Enumera el retardo, la posición y el tamaño de cada fotograma. Para reconstruir con [Creador de GIF](https://abox.tools/es/crear-gif/), extrae *El fotograma tal como aparece*, añade esos PNG, ordénalos por nombre y ajusta cada duración usando la lista como referencia. Creador de GIF no importa `frames.txt` automáticamente. Guarda la lista junto a las imágenes; los PNG por sí solos no permiten recuperar los retardos originales.

Dos cosas de los retardos del GIF que pillan a todo el mundo:

**La unidad son centésimas de segundo**, así que el paso más pequeño del formato es 0,01 s. Un único retardo fijo no puede representar exactamente 30 fps: 0,03 s por fotograma son 33,3 fps y 0,04 s son 25. Combinar duraciones de 0,03 y 0,04 s permite alcanzar la velocidad global solicitada; así gestiona Creador de GIF una frecuencia de fotogramas indicada.

**Cualquier cosa por debajo de 0,02 s se reproduce a 0,10 s.** Los navegadores lo limitan desde los años noventa — una regla escrita para los globos terráqueos giratorios de la época y nunca retirada. Un GIF cuyo archivo dice 0,01 s por fotograma declara 100 fps y se reproduce a 10. La herramienta muestra el retardo tal y como se reproduce de verdad, y pone al lado lo que guarda el archivo cuando los dos no coinciden, porque esa diferencia es la razón de que un GIF que separas y vuelves a montar pueda salir más lento que el original.

## Los números de fotograma, y por qué llevan ceros delante

Los fotogramas salen como `name-001.png`, `name-002.png`, numerados desde uno y rellenados hasta el ancho del último número. No es adorno: `frame9.png` se ordena *después* de `frame10.png` en cualquier gestor de archivos y en la mayoría del software que importa una secuencia, porque ordenan texto y no números. Los nombres rellenados se ordenan bien en todas partes, y todo editor de vídeo que importa una secuencia de imágenes los espera así.

Adelgazar una animación larga con «quedarse un fotograma de cada dos» no renumera nada. El fotograma 42 sigue llamándose 42, así que los archivos cuadran con el original y con la lista de tiempos.

## Por qué esto no necesita un servidor

Leer un GIF son dos trabajos: recorrer los bloques del archivo y deshacer la compresión LZW en la que van envueltos sus píxeles. Juntos son unos cientos de líneas, están escritos a la vista en el repositorio, y se ejecutan en tu propio equipo — que es por lo que la página sigue funcionando con la red desenchufada.

Tu navegador ya sabe reproducir un GIF, pero no te entrega las piezas: un `<img>` te da una animación, dibujar uno en un lienzo te da el primer fotograma para siempre, y la única API que hace más no está en Safari. Así que aquí el formato se lee por cuenta propia, igual en todos los navegadores — y leerlo uno mismo es además lo que permite enseñarte los parches y las reglas de descarte.

[¿Es seguro subir archivos a conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone cuatro comprobaciones que te dirán lo mismo sobre cualquier herramienta, esta incluida.
