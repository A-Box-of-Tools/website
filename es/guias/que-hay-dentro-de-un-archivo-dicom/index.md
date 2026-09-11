# ¿Qué hay dentro de un archivo DICOM?

Más que el escáner. Un archivo DICOM es un historial médico con una imagen dentro: tu nombre, tu fecha de nacimiento y tu número de hospital viajan en el mismo archivo que los píxeles — y eso importa sobre todo en el momento exacto en que te entregan un CD y sales a buscar un visor.

Última actualización 26 de agosto de 2026

## La respuesta corta

Un archivo DICOM — el `.dcm` del CD que te entrega un hospital — no es un formato de imagen como el JPEG. Es un formato de historial médico con una imagen dentro. Antes de que empiecen los píxeles, el archivo lleva una cabecera de cientos de etiquetas, y entre ellas, de forma rutinaria: el nombre completo del paciente, su fecha de nacimiento, su sexo y su número de hospital; la fecha, hora y descripción del estudio; el médico que lo pidió; el centro y el aparato, hasta el número de serie; y un juego de identificadores únicos que funcionan como llaves de vuelta al archivo que los produjo.

Nada de eso se ve cuando la imagen está en pantalla, que es exactamente como se olvida. El escáner es el historial. Trata el archivo como el documento que es, no como la imagen que contiene.

## Por qué este archivo se sube con tanta ligereza

La trampa en la práctica: a un paciente le entregan un disco o una descarga tras una prueba, intenta abrirlo, y nada en su máquina quiere — DICOM no es un formato que hable el software normal. Así que busca «abrir archivo dcm online», y casi todo lo que encuentra es una casilla de subida. Momentos después, un historial médico completo e identificado — nombre, fecha de nacimiento, números de hospital, descripciones de estudio con pinta de diagnóstico y todo — está en el servidor de quien mejor posicionara ese día.

Fíjate en la silueta: es otra vez el problema del documento de identidad — un archivo sensible, un momento de fricción, un buscador — pero con un archivo sensible en segundo grado. Un pasaporte cuenta quién eres; un escáner cuenta quién eres *y qué se estaba mirando*. El argumento general sobre subir archivos tiene [su propia página](https://abox.tools/es/guias/es-seguro-subir-archivos/); este es el archivo para el que ese argumento no necesita aliño alguno.

Abrir el archivo en local es la cura entera, y para eso está el [visor DICOM](https://abox.tools/es/visor-dicom/) de aquí: el escáner, un control de ventana de verdad, una carpeta reapilada en su serie, mediciones en milímetros y cada etiqueta de la cabecera legible — sin que nada salga de tu máquina. El paso a paso está en [la guía para abrirlo](https://abox.tools/es/guias/abrir-un-archivo-dicom/).

## «Le quité el nombre» no es desidentificar

El siguiente error es más fino y mejor intencionado: compartir un escáner — con un servicio de segunda opinión, un investigador, un foro — tras borrar la etiqueta obvia. El propio estándar es contundente sobre lo insuficiente que resulta. El perfil de desidentificación de DICOM lista las etiquetas que hay que tratar antes de poder llamar desidentificado a un conjunto de datos, y corre hasta los *cientos* de entradas, porque la identidad se esconde en más sitios que el campo del nombre:

- **Identificadores directos más allá del nombre** — fecha de nacimiento, ID de paciente, número de episodio, los nombres del médico y del centro.
- **Llaves** — los identificadores únicos estampados en cada archivo: no dicen quién eres, pero sí exactamente *qué historial eres* para cualquier sistema que haya visto el original.
- **Cuasi-identificadores** — fecha y hora del estudio, modelo y número de serie del aparato, región del cuerpo, edad del paciente: vagos por separado, estrechos juntos.
- **Los propios píxeles** — la ecografía y alguna otra modalidad graban el nombre del paciente directamente en la imagen, donde ninguna edición de etiquetas llega. (Para una imagen exportada, eso es trabajo de [censura a nivel de píxel](https://abox.tools/es/censurar-imagen/), no de una herramienta de metadatos.)

Por eso el visor de aquí tiene un panel que lista exactamente qué cosa de tu archivo identifica al paciente, y cuán directamente — construido a partir de la lista del propio estándar. Y por eso el visor solo *lee*: no contiene código que escriba un archivo DICOM, porque «anonimizado» es una promesa con un listón mucho más alto del que un visor salva — y una herramienta que la cumpliera a medias sería peor que una que nunca la hace.

## Tratar un escáner como el historial que es

Los hábitos caen solos de todo lo anterior:

- **Míralo en local.** Un visor que funciona con el Wi-Fi apagado — este lo hace — ha demostrado dónde ocurre el trabajo. El visor que viene en el propio disco, si corre en tu máquina, también vale.
- **Comparte por canales médicos cuando el contenido es lo que importa.** Mandar un estudio a otro hospital es un problema resuelto con infraestructura responsable detrás; un correo personal con un `.zip` de archivos `.dcm` es una copia de tu historial en servidores de correo, indefinidamente.
- **Si tienes que compartir un archivo, sabe primero qué lleva.** Lee la cabecera y el panel de identidad, para que lo que pases sea una decisión y no una sorpresa — y trata la desidentificación en regla como un servicio que tu centro de imagen te debe si lo pides, no como una casilla que improvisas.
- **Recuerda que el disco sobrevive al recado.** La copia de la carpeta de descargas y el CD del cajón también son historiales completos, igual que el escaneo del documento que nadie recuerda haber borrado.

Nada de esto dice que nunca compartas un escáner: las segundas opiniones son para lo que están las copias. Dice: el archivo es un documento sobre ti, así que las dos preguntas a las que este grupo entero de guías vuelve una y otra vez son también aquí las buenas — a quién se le entrega, y si esa entrega hacía falta siquiera.
