# Cómo abrir un archivo DICOM, y qué hay dentro de uno

Un disco hospitalario es una carpeta de archivos sin extensión y un visor escrito para Windows XP. Los archivos son DICOM, y no tienen nada de exótico: un estudio es una cabecera llena de campos y un bloque de píxeles. Aquí está cómo mirar uno, qué significan los controles y qué más lleva el archivo además de la imagen.

[Abrir Visor DICOM](https://abox.tools/es/visor-dicom/): TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre el [Visor DICOM](https://abox.tools/es/visor-dicom/) y arrastra encima la carpeta entera de archivos. Se leen en tu propio equipo, se reagrupan en las series de las que salieron y se apilan en el orden en que las tomó el equipo. No se sube nada, y no se escribe nada de vuelta en tus archivos.

Si te han dado un disco y te preguntas cuál de los archivos abrir: todos, a la vez. Una TC o una resonancia no son un archivo. Son un archivo por corte, y un estudio de tórax son trescientos.

## Qué hay en un disco hospitalario

Normalmente cuatro cosas, y solo una importa.

- **Una carpeta de estudios**, a menudo llamada `DICOM`, `IMAGES` o `ST0001`, con archivos llamados `IM000001`, `I0000001` o un número largo con puntos. Con frecuencia sin extensión ninguna. Eso es el estudio.
- **Un archivo llamado `DICOMDIR`**. Un índice del resto, escrito para que un visor pueda listar los estudios del disco sin abrir cada archivo. No lo necesitas.
- **Un visor**, como ejecutable de Windows, como entrada de autoarranque o de vez en cuando como applet de Java. Se compiló para lo que fuera actual cuando se grabó el disco, y por eso tantos ya no arrancan.
- **Una página HTML o un PDF** con el logo del hospital, explicando cómo arrancar el visor.

Los estudios no necesitan el visor. El formato es una norma publicada y los archivos se leen por su cuenta; el ejecutable del disco es un programa que podría leerlos, no el único.

## Por qué los archivos no tienen extensión

Porque DICOM no la necesita. Cada archivo lleva su propia marca: 128 bytes de nada, después las cuatro letras `DICM`, y después un pequeño bloque de campos que describe cómo está escrito el resto del archivo. Un lector comprueba esas cuatro letras y no un nombre que acabe en `.dcm`.

Por eso renombrar un archivo a `.dcm` no cambia nada, y por eso un visor que exige la extensión está siendo estricto sin necesidad. Los archivos escritos directamente desde una red hospitalaria ni siquiera tienen los 128 bytes y la marca: son los datos desnudos sin nada delante, y un lector tiene que deducir de su primer campo cómo están codificados. Eso es un archivo normal, no uno roto.

## La ventana y el centro, que es el control que importa

Es lo único que diferencia una imagen médica de una fotografía, y la razón por la que un editor de imágenes no sirve para mirar una.

Un corte de TC contiene unos cuatro mil valores distintos. Tu pantalla muestra doscientos cincuenta y seis grises. Algo tiene que decidir qué cuatro mil se llevan qué doscientos cincuenta y seis, y esa decisión es la **ventana**: por debajo todo es negro, por encima todo es blanco, y el rango que queda en medio se reparte entre los grises.

Mueve la ventana y el mismo archivo parece un estudio distinto. Eso no es un artefacto de representación, es el sentido de la cosa. El pulmón y el hueso están los dos en el corte y no se pueden ver a la vez: una ventana que enseña la textura del pulmón insuflado deja cualquier hueso en blanco puro, y una que enseña el detalle trabecular de una costilla deja el pulmón entero en negro puro.

En una TC los números son **unidades Hounsfield**, y están definidos en términos absolutos y no por equipo: el agua es 0 y el aire es −1000, por definición, en cualquier TC del mundo. Por eso un visor puede ofrecer ventanas con nombre — pulmón, hueso, cerebro, partes blandas — y que signifiquen lo mismo en tu archivo que en la estación donde se informó el estudio. Las habituales:

- **Partes blandas** — centro 40, anchura 400.
- **Pulmón** — centro −600, anchura 1500.
- **Hueso** — centro 300, anchura 1500.
- **Cerebro** — centro 40, anchura 80. Una estrecha, porque la sustancia gris y la blanca se diferencian en unas pocas unidades.

En una resonancia no existe esa escala. Los valores dependen de la secuencia, la antena y el equipo, así que no hay nada por lo que nombrar un preajuste y la ventana con la que empezar es la que pide el propio archivo. Todos los estudios llevan una sugerencia.

![El visor: un corte de escáner en escala de grises con los controles de ventana y nivel al lado, preajustes para rangos de tejido habituales y los datos del estudio en las esquinas.](https://abox.tools/screens/open-a-dicom-file/viewer.webp)

La ventana y el nivel son los dos controles que importan. Un escáner guarda más tonos de los que puede enseñar una pantalla, y estos deciden cuáles estás mirando.

## Por qué a veces los cortes van al revés

Un visor tiene que decidir en qué orden pone los archivos, y hay dos cosas en el archivo que podría usar.

**Instance Number** es un contador. Es la opción evidente, y la asigna lo que haya escrito los archivos, que no tiene por qué numerarlos en el sentido en que va el paciente. Un estudio reconstruido de los pies hacia arriba y numerado de la cabeza hacia abajo se recorre al revés, y una serie montada a partir de dos reconstrucciones puede repetir los números directamente.

**Image Position (Patient)** es dónde está físicamente el corte, en milímetros, en un sistema de coordenadas fijado al paciente y no al equipo. Ordenar por eso es correcto haga lo que haga la numeración, y tiene un efecto secundario útil: una vez que los cortes están en orden físico, la separación entre ellos se puede medir, así que un visor puede decirte que los cortes están a 5 mm y darse cuenta de que falta uno, cosa que el archivo no dice nunca.

## Medir algo

Un estudio son datos medidos, así que una longitud sobre él es una longitud real, si el archivo dice a qué distancia están sus píxeles. Eso es un campo, Pixel Spacing, en milímetros, y está presente en prácticamente todas las TC y resonancias.

Falta a menudo en imágenes de ecografía, en documentos escaneados y en capturas de pantalla guardadas como DICOM. Donde falta no hay respuesta honesta en milímetros, y un visor que dé una de todas formas se ha inventado una escala. Un recuento de píxeles es la respuesta correcta a una pregunta que el archivo no puede responder.

Ojo también con los píxeles que no son cuadrados, que es lo normal fuera de la TC. Medir en píxeles y multiplicar por una única cifra de espaciado solo es correcto donde las dos coinciden; cada eje hay que medirlo con la suya.

## Qué lleva un estudio además de la imagen

Esta es la parte en la que la gente se equivoca, y el motivo para tener cuidado con estos archivos.

Un archivo DICOM no es una imagen con algunos metadatos pegados. Es un historial médico con una imagen dentro. La cabecera es una lista de campos, y en un estudio clínico normal contiene:

- el nombre del paciente, su número de historia, su fecha de nacimiento y su sexo;
- el número de petición, que es la clave de la solicitud en el sistema del hospital;
- el médico que la solicitó, el técnico que la hizo, el radiólogo que la informó;
- el centro, su dirección y el servicio;
- el fabricante, el modelo y el número de serie del equipo;
- la fecha y la hora del estudio al segundo;
- y un conjunto de identificadores únicos — estudio, serie, instancia — que son claves perfectas de vuelta al archivo del que salió.

Cualquier archivo que te hayan dado lleva todo eso, y viaja con el archivo adonde vaya. Borrar el nombre no basta: una fecha de nacimiento, un centro del tamaño de un código postal y una hora de estudio identifican a una persona más o menos igual de bien que un nombre, y el UID del estudio la identifica exactamente para cualquiera con acceso al archivo.

Algunos equipos guardan además una segunda copia del nombre del paciente en un campo privado, es decir, un campo cuyo significado no está publicado en ninguna parte y que la mayoría de los anonimizadores dejan en paz porque no pueden saber qué hay dentro.

![Una tarjeta con lo que en el archivo identifica al paciente: el nombre, el identificador, la fecha de nacimiento y la descripción del estudio.](https://abox.tools/screens/open-a-dicom-file/identity.webp)

Lo que un escáner lleva además de la imagen. Esta es la tarjeta que explica por qué no conviene mandar uno por correo.

## No subas el estudio para mirarlo

La forma habitual de resolver esto es una búsqueda de «dicom viewer online» y un cuadro de subida. Lo que acaba de pasar es que un desconocido tiene una copia de un historial médico: los píxeles, el nombre, la fecha de nacimiento, el número de historia y la clave de vuelta al archivo.

No hay ningún motivo para eso. Leer un archivo DICOM es analizar una cabecera y desempaquetar unos cuantos enteros, y un navegador lo hace perfectamente. Por eso el [visor de aquí](https://abox.tools/es/visor-dicom/) no tiene ninguna función de red: ni `fetch`, ni `XMLHttpRequest`, ni nada que pudiera enviar un archivo aunque algo lo intentara. Carga la página una vez, desconéctate de internet y sigue abriendo estudios.

[¿Es seguro subir archivos a los conversores online?](https://abox.tools/es/guias/es-seguro-subir-archivos/) explica cómo comprobar esa afirmación en este sitio o en cualquier otro. Este es el tipo de archivo en el que más merece la pena comprobarlo.

## Lo que un navegador no puede hacer

Dos cosas, y las dos conviene decirlas claras.

**No es un visor diagnóstico.** Tu pantalla no está calibrada, el navegador no es una cadena de representación validada, y ninguna página web ha pasado una evaluación reglamentaria. Leer un estudio para tomar una decisión clínica es cosa de la estación en la que se informó. Ver qué hay en un disco, sacar un corte para una clase, leer una cabecera o averiguar por qué otro programa rechaza el archivo son todos motivos perfectamente buenos para abrir uno en el navegador.

**Algunos estudios comprimidos no se podrán decodificar.** DICOM permite varios esquemas de compresión y los navegadores traen uno. Los archivos simples, los codificados por longitud de racha, el JPEG baseline y el JPEG Lossless — que es lo que usan la mayoría de las exportaciones hospitalarias — se abren todos. JPEG 2000, JPEG-LS y los formatos de vídeo necesitan códecs que son megabytes de biblioteca compilada. Donde la imagen no se pueda decodificar, la cabecera sigue siendo legible entera, que suele ser la mitad por la que venías de todas formas.
