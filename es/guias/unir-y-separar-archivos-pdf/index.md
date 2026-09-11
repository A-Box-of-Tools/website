# Cómo unir, separar y reordenar páginas de PDF

Juntar dos documentos es lo más corriente que se le hace a un PDF, y lo que más veces se hace entregando los dos archivos al servidor de un desconocido. No hace falta ninguno. Aquí está cómo hacerlo, y qué se pierde en silencio cuando una herramienta reordena páginas.

[Abrir Unir y separar PDF](https://abox.tools/es/unir-pdf/): Páginas movidas de sitio sin pasar por ningún servidor.

Última actualización 26 de agosto de 2026

## La respuesta corta

Abre [Unir y separar PDF](https://abox.tools/es/unir-pdf/), suelta dentro todos los archivos que quieras usar, y arrastra las páginas hasta dejarlas en el orden que quieres. Luego di si sale como un documento o como varios, y pulsa el botón. No se sube nada: los archivos los abre, los desmonta y los vuelve a escribir tu propio navegador.

Los tres trabajos que la gente busca por separado — unir, separar, reordenar — son una sola pantalla, porque son una sola operación con una respuesta distinta al final: elegir unas páginas, ponerlas en un orden, y decidir en cuántos archivos salen.

## Unir dos o más documentos

Elige el primer archivo y después el segundo; las páginas de cada uno se van al final del orden que llevas, así que puedes seguir añadiendo archivos de carpetas distintas sin empezar de cero. Si han entrado en mal orden, arrastra una página por su tirador, o usa las flechas de cada ficha.

Unir no recodifica nada. El contenido de cada página y cada fuente, imagen y dibujo vectorial al que se refiere se copian tal cual, así que el texto sigue siendo seleccionable y buscable y un escaneo es el mismo escaneo. El archivo unido suele ser un poco más pequeño que los dos de entrada sumados, lo que no es compresión: es la estructura que rodea a las páginas, escrita una vez en lugar de dos.

Las páginas conservan su propio tamaño. Une un informe en A4 con un anexo en Carta y obtienes un documento con las dos cosas dentro, que es lo que dicen los archivos. Escalar las páginas de alguien a un solo tamaño de papel es otra operación, y no una que un unificador deba hacer en silencio.

## Separar un documento en varios

Hay cuatro formas de cortar, y cuál quieres depende de por qué estás cortando:

- **Cada tantas páginas.** Para un escaneo largo de algo que en origen era un montón de documentos sueltos — doce nóminas de dos páginas cada una.
- **En los números de página que digas.** Para un informe con capítulos que empiezan en páginas que puedes ver. Cada número que escribas empieza un archivo nuevo.
- **Un archivo por página.** Para sacar una única hoja de firmas o un certificado de un lote.
- **De vuelta a los archivos de los que vinieron.** Solo se ofrece cuando has unido más de un archivo, y sirve después de editar: quitar las páginas en blanco de tres escaneos a la vez y recuperar tres archivos.

Si solo quieres unas cuantas páginas de un documento largo, no hace falta separarlo. Escribe las páginas que quieres en la casilla de rangos — `1-3, 8, 12-` —, pulsa «Quedarme solo con estas» y monta un documento.

Cuando sale más de un archivo, se entrega todo en un solo ZIP. Cincuenta descargas son cincuenta avisos de guardar, que es más o menos donde cualquiera se rinde.

![La tarjeta de salida: opciones para un documento o varios, dividir por tamaño, en un número de página o de vuelta en los archivos de los que se hizo.](https://abox.tools/screens/merge-and-split-pdf-files/output.webp)

Dividir es la misma operación que unir, hecha al revés, y por eso es un ajuste aquí y no una herramienta aparte.

## Reordenar, girar y quitar páginas

Arrastra una ficha por su tirador para moverla. Las flechas de cada ficha la desplazan un puesto, o la giran un cuarto de vuelta cada vez — que es el arreglo para la página que salió del escáner de lado. La × la quita.

Para cualquier cosa que afecte a más de un par de páginas, usa mejor la casilla de rangos. Acepta lo que escribirías en papel: `1-3, 8, 12-`, y también `impares`, `pares`, `todas` y `última`. Quédate con esas, quita esas, o gira esas. Uno habitual: en un escaneo a doble cara donde todas las páginas segundas están cabeza abajo, eso es `pares` y dos giros.

Los números de las fichas se renumeran mientras trabajas, así que siempre significan «posición en el documento terminado» y no «página del archivo del que salió». No se escribe nada hasta que pulsas el botón, así que no hay nada que deshacer — y «volver a como estaban» restaura el orden original de todo.

![La rejilla de páginas: todas las páginas de dos documentos en miniatura, en el orden en que saldrán, con controles para girar, invertir y quitar.](https://abox.tools/screens/merge-and-split-pdf-files/pages.webp)

Los dos documentos, página a página. Reordenar es arrastrar; la caja de rangos de arriba es para los documentos en los que arrastrar llevaría toda la tarde.

## Qué sobrevive a una reorganización y qué no

Esta es la parte que ninguna herramienta te cuenta, y la razón de que un documento unido a veces parezca sutilmente estropeado.

Un PDF no es un montón de páginas. Es un grafo, y buena parte de él va sobre el documento y no sobre ninguna página en concreto: el panel de marcadores, los enlaces, el formulario, el orden de lectura que sigue un lector de pantalla, la numeración que llama a las cuatro primeras páginas «i, ii, iii, iv». Mueve las páginas y cada una de esas cosas hay que reconstruirla o dejarla caer.

- **Los marcadores se reconstruyen.** Una entrada cuya página sigue ahí apunta a donde se haya movido. Una entrada cuya página quitaste se va — salvo que tenga por debajo entradas que sí sobreviven, en cuyo caso se queda como encabezado, porque el título de un capítulo sigue estando donde está el capítulo. Al unir varios archivos, los marcadores de cada uno se anidan bajo un encabezado con el nombre del archivo, que es lo que hace navegable un informe unido.
- **Los enlaces se siguen.** Un enlace de la página 2 a la 40 sabe adónde se fue la 40, incluidos los destinos con nombre que Word y LaTeX escriben para cada encabezado. Un enlace cuyo destino no vino se queda sin nada detrás, en vez de apuntar a la página que ahora ocupa esa posición.
- **Los formularios rellenados sobreviven**, y el documento nuevo queda registrado como formulario para que los lectores lo traten como tal. Una rareza que conviene saber: dos campos con el mismo nombre son *un* campo para cualquier lector, así que unir dos copias del mismo formulario los enlaza — escribir en uno rellena el otro.
- **El orden de lectura etiquetado no.** Describe una secuencia que ya no existe, y uno equivocado es peor para un lector de pantalla que ninguno. Si el etiquetado de accesibilidad de un documento importa, conserva el original al lado.
- **Las etiquetas de página tampoco.** La numeración «iii, iv, 1, 2» es una afirmación sobre un orden que acabas de cambiar.
- **Los adjuntos y el guionado del documento tampoco.** Los archivos adjuntos pertenecen al documento, no a ninguna página. Las acciones que ejecutan JavaScript, envían un formulario a algún sitio o lanzan un programa no pasan a tu archivo nuevo, que es lo que debe pasar por defecto con páginas que vinieron de otra persona.

Una firma digital es un caso aparte, y no una limitación de ninguna herramienta: una firma certifica un documento tal y como estaba. Mueve una página y queda rota, porque eso es exactamente lo que está ahí para decirte.

## Archivos protegidos con contraseña

Un PDF cifrado se rechaza, incluidos los de contraseña vacía que producen muchas fotocopiadoras de oficina. Quitarle la protección a un documento es un trabajo distinto de mover sus páginas, y una herramienta que lo hiciera en silencio estaría haciendo algo que no le pediste. Ábrelo en un lector con la contraseña y guarda antes una copia sin protección.

## Comprobar el resultado

Ábrelo y comprueba tres cosas: el número de páginas, el orden y — si el documento los tenía — el panel de marcadores y un enlace o dos.

Lo primero te lo hace la herramienta de aquí antes de ofrecerte el archivo. Cada documento terminado lo vuelve a abrir el mismo código que leyó tus originales, y sus páginas se cuentan recorriendo el árbol de páginas en lugar de creerse el número escrito en el archivo. Si eso no coincide con lo que pediste, no se te ofrece descarga alguna.

## Por qué esto no necesita un servidor

Unir suena a trabajo de servidor, y durante casi toda la vida de la web lo fue. Lo que implica en realidad es analizar la estructura del archivo, copiar a un archivo nuevo los objetos de los que depende cada página, y escribir una tabla de referencias cruzadas nueva. No se decodifica ni un píxel y no se dibuja nada. Un navegador puede hacerlo todo desde hace años.

Y aquí importa más que en casi cualquier otro sitio, por *lo que* une la gente. Los documentos que se combinan son los que vinieron de algún lado: un contrato y su página de firmas, el escaneo de un pasaporte y un extracto bancario, un informe médico y un formulario de reclamación. Un unificador en línea los recibe todos de golpe, ya ordenados, de una misma persona. Es la subida más reveladora que hace casi nadie en su vida.

La herramienta de aquí no tiene función de red de ninguna clase, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, y ninguna es de este sitio. Cárgala, desenchufa, y une algo igualmente.

[¿Es seguro subir archivos a conversores en línea?](https://abox.tools/es/guias/es-seguro-subir-archivos/) propone otras tres comprobaciones como esa.
