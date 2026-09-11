# Unir PDF — y separar y reordenar páginas

Páginas movidas de sitio sin pasar por ningún servidor.

> Junta PDF, separa uno en varios y arrastra las páginas al orden que quieras, todo dentro de tu propio navegador. No se sube nada, no hay cuenta, y el archivo terminado se vuelve a abrir y a contar antes de ofrecértelo.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/unir-pdf/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus documentos **nunca se suben**. No hay ningún servidor.

Cada documento que eliges se abre, se desmonta y se vuelve a escribir en la memoria de este dispositivo, con código servido desde esta dirección. Aquí nada puede hacer una subida, y al otro lado de esta página no hay ningún servidor que la recibiera.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✓ Funciona sin conexión
- ✓ Código abierto
- ✓ Los archivos no salen de tu dispositivo

## Cómo unir, separar o reordenar un PDF

1. **Elige tus PDF.** Suéltalos sobre el selector o búscalos a mano, y añade más después: las páginas de cada archivo se ponen al final del orden que llevas, que es lo que permite ir uniendo dos carpetas por separado. El navegador los lee directamente de tu disco.
2. **Pon las páginas en el orden que quieras.** Arrastra una página por su asa, o muévela con las flechas. Gira una que se escaneó de lado, quita otra, o escribe `1-3, 8, 12-` en la caja para conservar, quitar o girar una tanda de golpe. Los números se renumeran sobre la marcha, así que lo que ves es siempre lo que será el archivo terminado.
3. **Di si sale un documento o varios.** Uno es la respuesta habitual. Los demás son formas de cortar: cada tantas páginas, en los números de página que digas, un archivo por página, o de vuelta a los archivos de los que salieron las páginas. Más de un archivo se entrega como un solo ZIP, así que es un guardado en vez de cincuenta.
4. **Constrúyelo, y lee la línea que dice que se ha comprobado.** Cuando los documentos están escritos, el mismo lector de esta página vuelve a abrir cada uno y cuenta sus páginas. Si eso no cuadra con lo que pediste, la ejecución se da por fallida y no se ofrece ninguna descarga.

## La versión larga

[Cómo unir, separar y reordenar páginas de PDF](https://abox.tools/es/guias/unir-y-separar-archivos-pdf/): Combina PDF, corta uno en varios y mueve páginas de sitio: qué sobrevive a la reorganización, qué no puede llevarse ninguna herramienta, y por qué nada de esto necesita subir tus documentos a ninguna parte.

## También en la caja

- [Compresor de PDF](https://abox.tools/es/comprimir-pdf/): Reduce un documento sin mandarlo a ninguna parte.
- [Censor de PDF](https://abox.tools/es/censurar-pdf/): Las letras se borran del archivo, y después se busca en el archivo para demostrarlo.
- [Imágenes a PDF](https://abox.tools/es/imagenes-a-pdf/): Mete tus fotos en un solo documento.
- [Escáner de documentos](https://abox.tools/es/escanear-documentos/): Fotografía la hoja. Te devuelve algo que parece escaneado.

## Preguntas

### ¿Se suben mis PDF a alguna parte?

No. Los lee, los copia y los escribe tu propio navegador en tu propio equipo. Esta herramienta no tiene lado servidor, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar: ninguna es nuestra. Esta herramienta no tiene ninguna función de red, ni siquiera opcional.

### ¿Cuántos archivos puedo unir, y cómo de grandes pueden ser?

No hay ningún límite escrito en la herramienta. El límite es tu propio equipo: los documentos se mantienen en memoria mientras se trabaja con ellos, así que un portátil unirá unos cuantos cientos de megabytes sin quejarse y empezará a sufrir en algún punto por encima de eso. No se cobra, no se limita la velocidad, no se pone marca de agua ni se hace cola, porque no hay nadie al otro lado que pudiera hacer ninguna de esas cosas.

### ¿Unir o separar pierde calidad?

No. En una página no se recodifica, se redibuja ni se recomprime nada. El flujo de contenido de cada página y cada tipografía, imagen y dibujo vectorial al que hace referencia se copian byte a byte, así que el texto sigue siendo seleccionable y buscable y una fotografía es la misma fotografía. Lo único que cambia es el orden de las páginas y la estructura que las rodea.

### ¿Qué pasa con los marcadores y los enlaces?

Los dos se reconstruyen en vez de tirarse. Un marcador cuya página sigue en la salida apunta a donde sea que haya ido a parar esa página; uno cuya página has quitado desaparece, salvo que tenga entradas por debajo que sobrevivan, en cuyo caso se queda como encabezado. Al unir varios archivos, los marcadores de cada uno quedan bajo un encabezado con su nombre. Los enlaces entre páginas se siguen igual, incluidos los destinos con nombre que escriben Word y LaTeX, y un enlace cuyo destino no ha venido se queda sin nada detrás en vez de mandar al lector a un sitio equivocado. Los enlaces a direcciones web se conservan tal cual.

### ¿Qué no se lleva consigo?

Cuatro cosas, y la herramienta lo dice en los resultados y no en la letra pequeña. El árbol de orden de lectura etiquetado que usan los lectores de pantalla, las etiquetas de página (la numeración «iii, iv, 1, 2»), los archivos adjuntos incrustados, y cualquier acción que no sea ni «ir a una página» ni «abrir una dirección web», el JavaScript del documento incluido. Las dos primeras describen un orden que ya no existe una vez movidas las páginas; la última no es algo que hayas pedido llevarte a un archivo nuevo. Si el etiquetado de un documento te importa, guarda también el original.

### ¿Sobreviven los formularios rellenados?

Sí. Los campos de formulario y lo que se haya escrito en ellos vienen con sus páginas, y el documento nuevo se registra como formulario para que los lectores lo traten como tal. Una cosa que conviene saber al unir: dos campos con el mismo nombre son un solo campo para cualquier lector, así que si unes dos copias del mismo formulario, rellenar una casilla en una página la rellenará también en la otra. La herramienta detecta ese caso y lo dice.

### ¿Puede abrir un PDF protegido con contraseña?

No, y es a propósito. Un documento cifrado se rechaza con un mensaje que lo dice, incluso cuando la contraseña está en blanco, que es como guardan muchos escáneres y fotocopiadoras. Quitarle la protección a un archivo es un trabajo distinto de mover sus páginas, y una herramienta que lo hiciera en silencio estaría haciendo algo que no pediste.

### ¿Por qué no hay vistas previas de las páginas?

Porque dibujar una página significa un motor de PDF completo, con tipografías, degradados, grupos de transparencia y modos de fusión, o sea un megabyte o más de motor que descargar y ejecutar para unas cuantas miniaturas. Lo que enseñan las fichas es aquello sobre lo que de verdad se trabaja al reordenar: el número de página, la forma y el tamaño del papel, la rotación con la que se escribirá y de qué archivo salió. Un escaneo apaisado en una pila de páginas verticales sigue cantando a la primera.

### ¿Se abrirá el archivo terminado en todas partes?

Sí. La salida se escribe como PDF 1.5, o en la versión más alta que haya necesitado alguno de los archivos que le diste, y la 1.5 la entiende cualquier lector publicado desde 2003. La herramienta además lo demuestra en tu propio equipo: vuelve a abrir cada archivo terminado y cuenta sus páginas recorriendo el árbol de páginas antes de ofrecértelo.

### ¿Es gratis? ¿Necesito una cuenta?

Es gratis, y no hay cuenta, ni inicio de sesión, ni versión de prueba, ni más límite de tamaño que el que permita la memoria de tu propio equipo. El sitio lleva publicidad, que es lo que lo paga, y a los anuncios no se les da nada sobre tus documentos.

### ¿Funciona sin conexión?

Sí. Carga la página una vez, desconéctate de internet y verás que sigue funcionando. Esa es además la forma más sencilla de demostrar que no se sube nada: una herramienta que mandara tus documentos fuera a unir se pararía en cuanto desenchufaras.

## Cómo se comprueba la promesa de privacidad

- **Tus documentos no tienen por dónde salir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna de ellas es nuestra. Esta herramienta no añade nada a esa lista: no tiene ninguna función de red propia, ni siquiera opcional. Aquí no hay ningún destino donde pudieran recogerse tus archivos, ni nada en el código que los enviara si lo hubiera.
- **Unir es justo el trabajo que más conviene no subir.** Los documentos que la gente junta son precisamente los que vienen de algún sitio: un contrato y su hoja de firmas, el escaneo de un pasaporte y un extracto bancario, un informe médico y un formulario de reclamación. Un servicio en línea acaba teniéndolos todos, en un sitio, ya ordenados. Esta herramienta tiene una página en tu navegador y ninguna otra mitad.
- **El formato entero está en este repositorio.** Un PDF es una lista de objetos y una tabla de dónde empieza cada uno. `src/objects.js` lee esa sintaxis, `src/reader.js` sigue la tabla, `src/assemble.js` copia páginas entre documentos y `src/writer.js` escribe el resultado. Ninguno de los cuatro importa nada que pueda hacer una petición. No se descarga ninguna biblioteca y no se dibuja nada en un servidor.
- **Los archivos cifrados se rechazan en vez de abrirse.** Un PDF con contraseña se rechaza, incluidos los que producen los escáneres con la contraseña vacía y que técnicamente se abrirían. Quitarle la protección a un documento es un trabajo distinto de mover sus páginas, y hacerlo en silencio sería una sorpresa desagradable viniendo de una herramienta.
- **El archivo terminado no dice dónde se hizo.** Sin línea de productor, sin fecha de creación, sin nombre de herramienta. Tampoco lleva el paquete XMP ni los bloques privados que deja un programa de maquetación: esos pertenecen al documento que había antes, no al que acabas de construir. Todo lo que hay en las páginas se copia exactamente: esta herramienta mueve páginas, no reescribe lo que hay en ellas.
- **Las acciones que no son «ir a una página» no se copian.** Un PDF puede llevar instrucciones que se ejecutan al abrirlo: reproduce esto, envía este formulario a aquella dirección, ejecuta este JavaScript. Las páginas que pasan por esta herramienta conservan sus enlaces a otras páginas y a direcciones web, y pierden el resto. Reordenar las páginas de otro no es motivo para meter el scripting de su documento en tu archivo nuevo.
- **Qué carga Google, y qué no llega a ver.** Los scripts de publicidad y de medición vienen de Google. A ninguno se le entrega nada sobre tus documentos: ni un archivo, ni una página, ni un nombre, un tamaño o un número de páginas. Cada línea que lee, copia o escribe un PDF se sirve desde este origen y está en el repositorio.
- **Qué carga el botón de donación, y qué no llega a ver.** El botón «Buy me a coffee» de la cabecera lo dibuja un script de cdnjs.buymeacoffee.com y coge su tipografía de Google Fonts. No es más que un enlace: no informa de tu visita y no se le entrega nada sobre ti ni sobre tus documentos. No pasa nada mientras no lo pulses, y lo que abrirías entonces es el sitio de otra persona.
- **Funciona sin conexión.** Desconéctate de la red y todo lo de esta página sigue funcionando. Es la prueba más sencilla de todas: una herramienta que mandara tus documentos fuera para unirlos se pararía.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy y `src/assemble.js` para todo el copiado: cómo se saca una página de un documento y se pone en otro, y qué se deja atrás a propósito. No puede llegar a la red, y tampoco pueden el lector ni el escritor que tiene al lado.
