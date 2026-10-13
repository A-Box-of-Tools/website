# Cómo proteger un PDF con contraseña y qué garantía ofrece

Una contraseña de apertura impide leer un PDF sin conocerla. Una restricción de impresión o copia pide al lector que respete una preferencia. Ambas pueden ser útiles, pero la diferencia determina qué protección puedes prometer.

[Abrir Proteger PDF](https://abox.tools/es/proteger-pdf/): Protege el documento sin entregárselo primero a una web.

Última actualización 12 de septiembre de 2026

## La respuesta corta

Abre la herramienta para [proteger PDF](https://abox.tools/es/proteger-pdf/), arrastra el documento, escribe la contraseña dos veces y pulsa el botón. El archivo se cifra en el navegador con AES-256. Antes de ofrecer la descarga, la página vuelve a abrir el resultado: una vez sin contraseña, cuando debe rechazarlo, y otra con ella. No se sube nada; funciona igual sin conexión.

El resto de esta guía explica lo que acabas de hacer. Una contraseña y una restricción no son lo mismo, y esa diferencia determina qué protección puedes garantizar.

## Las dos protecciones que admite un PDF

Un PDF admite dos contraseñas. Los lectores las presentan de forma tan parecida que muchas personas nunca descubren que sirven para cosas distintas.

La **contraseña de apertura**, o contraseña de *usuario*, actúa como una cerradura. El contenido está cifrado, la clave se deriva de la contraseña y esta no queda escrita en el documento. Sin ella no pueden leerlo ni el destinatario, ni un sitio web, ni el programa que lo creó.

Las **restricciones** de impresión, copia o edición, controladas por la contraseña de *propietario*, son una petición. Un documento que se abre sin pedir contraseña *debe contener todo lo necesario para derivar su propia clave*, porque el lector acaba de hacerlo. Lo que impide imprimir es otro campo del archivo: unos bits de permisos que los lectores respetan por acuerdo. Adobe lo documentó así desde el principio; un lector puede no respetarlos. El [desbloqueador de este sitio](https://abox.tools/es/guias/desbloquear-un-pdf/) permite retirarlos.

Eso no significa que las restricciones sean inútiles. Muchos lectores las respetan, y marcar «no imprimir» expresa lo que quieres que ocurra. Sí significa que no conviene *depender* de ellas. Si una persona no debe poder leer el archivo, configura una contraseña de apertura. Si prefieres que no se imprima, marca la restricción sabiendo que es una petición, no una garantía.

## Qué cifrado elegir

La herramienta ofrece dos opciones. La predeterminada es la adecuada salvo que tengas un motivo concreto para cambiarla.

- **AES-256**, el esquema de PDF 2.0 de 2017, es la opción predeterminada. La contraseña pasa por un cálculo hash deliberadamente costoso, con un número de rondas que varía según los datos; eso dificulta construir hardware dedicado a probar contraseñas. Los lectores desde Acrobat X de 2010 lo abren, incluidos navegadores, teléfonos y lectores de escritorio actuales. Su protección depende de la fortaleza de la contraseña.
- **AES-128**, el esquema de 2005, se ofrece para lectores anteriores a 2010 que deban abrir el documento. El cifrado es sólido, pero el paso que convierte la contraseña en una clave data de 1994 y resulta barato de calcular. Eso facilita probar contraseñas mucho más de lo que sugiere el tamaño de la clave. Si no sabes qué lector se utilizará, elige 256.

Ambos están muy por delante del primer cifrado PDF: una clave de 40 bits de 1994 que un dispositivo corriente puede probar exhaustivamente. Sin embargo, los lectores pueden llamar a todos «protegido con contraseña». Si alguien asegura que un archivo es seguro por eso, pregunta qué generación de cifrado utiliza. El [desbloqueador de PDF](https://abox.tools/es/desbloquear-pdf/) te lo indica al abrir el archivo.

## Por qué importa tanto la contraseña

AES-256 no ofrece un atajo para saltarse el cifrado: sin la contraseña, queda intentar adivinarla. El cálculo hash hace lenta cada prueba, pero lento no significa imposible. Una palabra de seis caracteres permite unos pocos millones de intentos; una frase larga y recordable cambia mucho la dificultad. La página cuenta los caracteres y avisa si son pocos. La regla práctica es sencilla: la protección depende de la contraseña, y hacerla larga no cuesta nada.

De ahí salen dos precauciones. Escríbela dos veces: la página lo exige porque un error en una contraseña fuerte puede dejar el documento inaccesible. Y conserva el original. Proteger crea un archivo nuevo y deja intacto el anterior; esa es la copia que necesitarás si pierdes la contraseña.

## Si la olvidas

Puedes perder el acceso al documento. Es mejor saberlo aquí que después de entregar el archivo a un sitio de «recuperación de contraseñas PDF». Esos servicios prueban diccionarios, patrones y combinaciones. Frente a una contraseña fuerte con el esquema actual, no llegan a una solución práctica. Muchos suben el documento a un servidor para intentarlo y algunos cobran antes de decir si funcionó.

Ninguna herramienta de este sitio intenta adivinar contraseñas. El desbloqueador no tiene un bucle que lo haga; el protector pide la contraseña dos veces precisamente porque no ofrece un camino de vuelta. Es una decisión deliberada, no una función pendiente.

## Lo extraño es tener que subirlo

Piensa qué documento quieres proteger: un extracto bancario, un contrato, una carta médica, una declaración de impuestos o un pasaporte escaneado para alquilar una vivienda. Casi por definición, un archivo al que vas a poner contraseña es algo que prefieres no dejar en manos ajenas.

Muchas herramientas en línea piden primero el original sin proteger y después la contraseña elegida. Ambos llegan a un servidor cuya conservación de datos no puedes comprobar. Por buenas que sean sus intenciones, has enviado el documento privado intacto, junto con la llave, a alguien que no conoces para hacerlo privado.

No hace falta. Proteger un PDF consiste en operar sobre bytes: derivar una clave, aplicar el cifrado y escribir el archivo. El navegador puede hacer los tres pasos. Eso hace [esta herramienta](https://abox.tools/es/proteger-pdf/). El documento y la contraseña permanecen en la pestaña. La política de seguridad enumera las direcciones que puede contactar, y ninguna pertenece a este sitio. Sigue funcionando sin red. Para comprobarlo, desconecta la conexión y úsala.

La guía sobre [si es seguro subir archivos](https://abox.tools/es/guias/es-seguro-subir-archivos/) plantea la cuestión general; la de [subir un extracto bancario](https://abox.tools/es/guias/es-seguro-subir-un-extracto-bancario/) la aplica a uno de los documentos más sensibles.

## Dos cambios en el archivo y algo que se conserva

**Una firma digital dejará de ser válida.** La firma cubre los bytes exactos del archivo al que se aplicó. Protegerlo escribe otro archivo y rompe esa correspondencia, igual que lo haría cualquier programa. Si necesitas ambas cosas, protege primero y firma la copia protegida.

**El tamaño cambiará un poco.** El cifrado añade dieciséis bytes a cada flujo y cadena. Al reescribir también se eliminan las versiones antiguas de objetos que otras ediciones habían añadido. El resultado puede crecer o reducirse según el documento.

**Las páginas no cambian.** No se vuelven a dibujar, codificar ni distribuir. Se cifran las instrucciones de dibujo, las fuentes y las imágenes tal como llegaron. Quien tenga la contraseña podrá seguir seleccionando el texto; los escaneos conservarán su resolución y nada se moverá de sitio.

## Cambiar una contraseña existente

El formato admite una sola protección de apertura; no se puede añadir otra encima. La herramienta rechaza ese caso y te dirige al [desbloqueador de PDF](https://abox.tools/es/desbloquear-pdf/), que retira la protección anterior en el mismo navegador. Vuelve con la copia desbloqueada y aplica la nueva contraseña. Si el documento solo tiene restricciones —se abre para cualquiera, pero no permite imprimir—, se acepta directamente y se informa de que los nuevos ajustes sustituyen a los anteriores.

## Antes de protegerlo

Una vez que el archivo pide contraseña, las demás herramientas necesitan pasar primero por el desbloqueador. Haz antes el resto del trabajo: [unir o separar páginas](https://abox.tools/es/unir-pdf/), [reducir el tamaño](https://abox.tools/es/comprimir-pdf/) y, sobre todo, [eliminar lo que no debería estar en el documento](https://abox.tools/es/censurar-pdf/). La contraseña protege frente a terceros, pero no oculta información a la persona a la que se la das.
