# La foto que guardó tu móvil, y el formato que no abre nada

Un iPhone guarda las fotos como HEIC, un formato más pequeño y mejor que el JPEG que muchísimo software se sigue negando a abrir. Aquí va qué es en realidad, qué le cuesta a la imagen convertirla y por qué casi todos los conversores quieren que la subas primero.

[Abrir HEIC a JPG](https://abox.tools/es/convertir-heic-a-jpg/): Las fotos que hace un iPhone, en un formato que abre todo el mundo.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [convertidor de HEIC a JPG](https://abox.tools/es/convertir-heic-a-jpg/), arrastra las fotos dentro y pulsa «Convertir». Deja el control de calidad donde está y deja marcado «conservar la fecha, la cámara y los ajustes» salvo que tengas un motivo para lo contrario. Te llevas JPEG de vuelta, con un botón de descarga por cada uno, o un zip si son varios.

Mientras lo haces no se sube nada. Y eso, en este trabajo en concreto, es raro; el porqué es la mitad interesante de esta página.

![La tarjeta de opciones: un menú de formato en JPEG, un control de calidad en 85 y un interruptor para conservar la fecha, la cámara y el lugar del original.](https://abox.tools/screens/convert-heic-to-jpg/options.webp)

Toda la conversión son estas tres cosas. El interruptor de metadatos es en el que merece la pena detenerse, y la sección de abajo dice por qué.

## Qué es HEIC en realidad

El HEIC no es un formato de imagen como lo es el JPEG. Es un contenedor, la misma estructura de cajas con la que está construido un MP4, con un fotograma fijo de vídeo **HEVC** dentro. El HEVC, también llamado H.265, es el códec que sustituyó al que usaba tu vieja videocámara, y es muy bueno: una foto de iPhone en HEIC ocupa más o menos la mitad que la misma foto en JPEG a la misma calidad.

Apple se pasó a él en iOS 11, en 2017, y lo dejó puesto por defecto. Lo que significa que, mientras alguien no haya entrado en los ajustes a elegir «Más compatible», todas las fotos que ha hecho su móvil en casi una década están en un formato que:

- Windows no previsualiza sin una extensión de la Store;
- casi todos los formularios de subida de la web rechazan de plano;
- muchísimo software de escritorio antiguo no ha oído nombrar en su vida;
- y ningún navegador salvo Safari va a mostrar.

La foto está perfectamente, y es mejor archivo de lo que habría sido el JPEG. Lo único es que está escrito en un idioma que casi nadie llegó a aprender.

## Por qué solo Safari abre una

Esta es la parte que explica todos los conversores que has usado en tu vida, así que se merece un párrafo.

Para descodificar HEVC hace falta un descodificador de HEVC, y el HEVC está patentado. Las licencias las administra más de un consorcio de patentes, y distribuir un descodificador significa pagarle a alguien. Los navegadores se apañan apoyándose en el sistema operativo, y por eso Chrome reproduce *vídeo* HEVC en un equipo cuyo hardware ya tiene un descodificador con licencia. Pero esa vía está cableada para la reproducción de vídeo, no para imágenes fijas, así que un HEIC entregado a un `<img>` se rechaza, y se rechaza igual en Chrome, en Firefox y en Edge, sobre cualquier sistema operativo.

La excepción es Safari sobre hardware de Apple, porque macOS e iOS tienen el descodificador y a Safari se le permite pedírselo. En todo lo demás, para el navegador esa imagen es sencillamente indescodificable.

Y eso le deja a un conversor exactamente dos opciones. La elección entre ellas es toda la historia de este tipo de herramienta.

## Por qué casi todos los conversores de HEIC quieren una subida

Opción uno: poner el descodificador en un servidor. La foto se sube, se descodifica en una máquina que no has visto en tu vida, se recodifica como JPEG y se te devuelve. Es lo que hace prácticamente cualquier «conversor de HEIC gratuito en línea», y por eso todos necesitan tus archivos. No es pereza: el navegador, de verdad, no puede hacerlo por su cuenta.

Lo que eso cuesta hay que decirlo sin rodeos. Las fotos del móvil son los archivos más personales que tiene casi todo el mundo, y un HEIC recién salido de un iPhone suele llevar las coordenadas del sitio donde se tomó, con una precisión de unos metros, más la fecha al segundo y un identificador de la cámara. Subir una carpeta entera a un servicio gratuito es entregar las dos cosas: las imágenes y todo eso. Y lo que pase después lo rige una política de privacidad que no te has leído, en un servidor que no puedes inspeccionar, en una jurisdicción que no has elegido.

Opción dos: poner el descodificador en la página. Eso es lo que hace [este](https://abox.tools/es/convertir-heic-a-jpg/), que se trae `libheif` compilado a WebAssembly como un archivo servido desde este sitio: 1,4 MB, descargados una vez y guardados en caché a partir de ahí. Tu navegador lo ejecuta en tu propio dispositivo, con tu propio hardware, y la foto no va a ninguna parte. Carga la página una vez y podrás desenchufarte de internet del todo sin que deje de funcionar, que es algo que ningún conversor que suba archivos puede hacer, y la prueba más sencilla que existe.

Los 1,4 MB son el precio entero. Si vas con una conexión con límite de datos eso es un coste real y conviene saberlo, y por eso la página lo dice en voz alta en lugar de descargarlo sin avisar.

## Qué le cuesta a la imagen convertirla

El HEIC y el JPEG son códecs distintos, así que no hay forma de pasar de uno a otro sin descodificar la imagen y volver a codificarla, y esa segunda codificación tiene pérdidas. En la práctica importa mucho menos de lo que suena:

- **Con calidad 92**, que es donde arranca el conversor, una fotografía es muy difícil de distinguir del original a cualquier tamaño normal de visionado. Tendrías que ponerte a buscar diferencias en degradados suaves, tipo un cielo despejado, y por lo general no las vas a encontrar.
- **El JPEG va a ocupar más.** Normalmente entre un tercio más y el doble, porque el JPEG es un códec de 1992 y el HEVC no. Ese es el trato: un archivo más grande que abre todo el mundo.
- **Lo que hay que evitar es convertir dos veces.** Cada codificación con pérdidas cuesta un poco. Convierte desde el HEIC original, no desde un JPEG que ya te hizo alguien, y hazlo una sola vez.

Si no quieres ninguna pérdida, tienes PNG en el menú de formatos. Eso sí, prepárate para el tamaño: una fotografía en PNG suele ocupar de cinco a diez veces lo que el JPEG, porque la compresión del PNG se diseñó para el color plano y el dibujo de línea, no para la hierba y la piel.

## La fecha, la cámara y las coordenadas

La queja habitual con los conversores de HEIC es que las fotos vuelven sin el día en que se tomaron, y entonces las imágenes de unas vacaciones enteras se te ordenan al final de la fototeca con la fecha de hoy. Pasa porque convertir a través de un lienzo da píxeles y nada más, ya que un lienzo no guarda etiquetas. Si el conversor no va a buscar los metadatos por separado, sencillamente desaparecen.

La herramienta de aquí copia el bloque EXIF del HEIC y lo escribe en el JPEG, así que la fecha sobrevive. Es una casilla, y viene marcada; si la desmarcas, el JPEG sale con la imagen y nada más.

Antes de decidir, mira la lista: la fila de cada foto te dice si el archivo lleva coordenadas GPS, y te lo dice antes de convertir nada. Si las fotos van a algún sitio público, esa es la línea que hay que leer. Si van a tu propia fototeca, lo que quieres casi seguro es conservar los metadatos.

Hay una etiqueta que se cambia elijas lo que elijas, y conviene saber por qué. Un HEIC anota su rotación en dos sitios: en el contenedor y en el bloque EXIF. El descodificador aplica la del contenedor mientras descodifica, así que los píxeles que entrega ya salen derechos. Si el EXIF siguiera diciendo «gira esto 90 grados», un visor lo haría otra vez y todas las fotos verticales te saldrían de lado. Por eso la etiqueta de orientación se pone en «derecha», y todo lo demás se copia tal como lo escribió el móvil.

Si lo que quieres es repasar las etiquetas con detalle, o quitárselas a fotos que ya son JPEG, eso es otro trabajo y tiene su propia [guía](https://abox.tools/es/guias/eliminar-datos-exif-y-gps/).

## Cosas con las que la gente se topa

- **Un HEIC llamado «.jpg».** Pasa muchísimo: algo por el camino lo renombró sin convertirlo, y por eso sigue sin abrirse. Todo archivo que sueltes en el conversor se identifica por sus primeros bytes y no por su nombre, así que uno de estos entra sin problema. Y es también la razón de que a un archivo que sea de verdad un JPEG se le diga que lo es, en vez de convertirlo en una copia de sí mismo.
- **Un archivo, varias imágenes.** Una ráfaga o una Live Photo pueden llevar más de una imagen fija. Se convierten todas, y las de más se numeran a partir del nombre original. La mitad de vídeo de una Live Photo es un archivo aparte que el móvil guarda junto al HEIC, así que ahí no está para convertirla.
- **El AVIF no es un HEIC.** Se parecen, porque son el mismo contenedor con otro códec dentro, pero cualquier navegador actual abre un AVIF de forma nativa. Así que ahí no hay nada que convertir, y la herramienta te lo dice en vez de fingir que trabaja.
- **Cortar el problema de raíz.** En el móvil: Ajustes → Cámara → Formatos → Más compatible. A partir de ahí las fotos nuevas salen en JPEG. Ocupa más almacenamiento y no toca las fotos que ya tienes, pero te ahorra volver a pasar por esto.
- **A veces, compartir ya convierte.** Pasar una foto por AirDrop o por correo a un dispositivo que no sea de Apple entrega muchas veces un JPEG, porque iOS convierte a la salida. Si una foto te ha llegado igualmente como HEIC, es que vino por una vía que no lo hizo.

## Cómo saber si un conversor está subiendo tus fotos

Esto sirve para cualquier herramienta, no solo para esta, y lleva unos quince segundos.

1. Abre la página, luego abre las herramientas de desarrollo del navegador y ponte en la pestaña Red.
2. Convierte una foto y mira. Una herramienta que descodifica en tu dispositivo no hace ninguna petición en ese momento. Una que sube hace una del tamaño de tu foto, y ese tamaño se ve.
3. O más sencillo todavía: carga la página, desconéctate de internet e intenta convertir algo. Una herramienta que mandara tu foto fuera a descodificar se para. Una que lleva el descodificador dentro, no.

El conversor de aquí está hecho para pasar las dos comprobaciones, y hay una versión más larga de este argumento en [¿es seguro subir archivos?](https://abox.tools/es/guias/es-seguro-subir-archivos/).
