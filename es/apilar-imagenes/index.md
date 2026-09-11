# Apilador de imágenes — combina una ráfaga, con RAW incluido

Veinte tomas se convierten en una, sin veinte subidas y sin revelador RAW.

> Combina una ráfaga de fotografías en una sola: promédialas para matar el ruido, toma la mediana para quitar a la gente de una escena, aclara para dejar estelas de estrellas o apila el enfoque de una macro. Lee CR2, NEF, ARW, DNG, RAF y CR3 sacando la propia vista previa de la cámara. Funciona entero en el navegador.

Esta página es una herramienta interactiva que funciona por completo en tu navegador, en https://abox.tools/es/apilar-imagenes/; nada de lo que le des se sube a ningún sitio. Lo que sigue es todo lo que la página dice de la herramienta con palabras; para usarla, abre la dirección.

## Tus fotografías **nunca se suben**. No hay ningún servidor.

El navegador abre, decodifica, alinea, combina y escribe cada toma en tu propio equipo. Una pila de veinte archivos RAW de 60 MB es alrededor de un gigabyte de fotografías, y no se mueve ni un byte: la herramienta no tiene ninguna función de red, y los archivos los lee directamente de tu disco un worker que no tiene adónde mandar nada.

- ✗ Sin subidas
- ✗ Sin cuenta
- ✗ Sin marca de agua
- ✓ Lee RAW
- ✓ Funciona sin conexión
- ✓ Código abierto

## Cómo apilar un conjunto de fotografías en el navegador

1. **Elige las tomas.** Una ráfaga, un conjunto horquillado, una secuencia de intervalómetro o una carpeta de archivos RAW. Cada una se abre según llega, y la fila te dice qué ha salido de ella: en un archivo RAW, la cámara, el tamaño de la vista previa encontrada dentro y qué poco del archivo ha habido que leer para encontrarla.
2. **Elige el método que corresponda a lo que quieres perder.** Ruido: media, o recorte sigma si se ha movido algo. Gente, coches o un avión que pasa: mediana. Un cielo oscuro que quieres convertir en estelas de estrellas: aclarar. Una macro tomada a lo largo del anillo de enfoque: apilado de enfoque. La nota de debajo del menú dice qué hace cada uno con tu número concreto de tomas.
3. **Decide si hay que alinear las tomas.** A pulso: sí, solo desplazamiento. A pulso y además girando: desplazamiento, rotación y escala. Trípode fijo o intervalómetro: no, y así irá más rápido. Cada toma se mide contra la que lleva la marca de referencia, que es la primera mientras no digas otra cosa: «Usar como referencia» mueve la marca y deja la lista en el orden en que la pusiste.
4. **Lee las cuatro cifras y después pulsa el botón.** Antes de que se ejecute nada, la página dice cómo de grande será el resultado, cuánta memoria necesitará aproximadamente, cuántas veces se decodificarán las tomas y cuánto de tus archivos se ha leído. Si el conjunto no cabe entero en memoria, lo dice, y dice qué resolución de trabajo lo arreglaría.

## La versión larga

[Cómo apilar fotografías para reducir el ruido, o quitar gente](https://abox.tools/es/guias/apilar-fotos-para-reducir-el-ruido/): Apilar combina una ráfaga de tomas en una sola imagen. Qué método te hace falta depende de qué quieras perder: el ruido, los transeúntes o la poca profundidad de campo de una macro. Cómo funciona cada uno, qué cuesta y dónde encajan los archivos RAW.

## También en la caja

- [Censor de imágenes](https://abox.tools/es/censurar-imagen/): Lo que tapas se borra del archivo; no queda escondido dentro.
- [Visor y eliminador de EXIF](https://abox.tools/es/eliminar-datos-exif/): Mira lo que una foto cuenta de ti. Y luego quítaselo.
- [Visor DICOM](https://abox.tools/es/visor-dicom/): TC, resonancia, radiografía y ecografía, con la ventana, la cabecera y las medidas.
- [Imagen a ICO](https://abox.tools/es/crear-favicon/): Entra una imagen. Salen todos los tamaños que piden un navegador, Windows o un Mac.

## Preguntas

### ¿Se suben mis fotografías a alguna parte?

No. Cada toma la abre, decodifica, alinea, apila y escribe tu propio navegador en tu propio equipo. Esta herramienta no tiene ninguna función de red, nunca pide ni envía nada, y la `Content-Security-Policy` de la página nombra todas las direcciones que puede contactar, ninguna de las cuales es nuestra. Carga la página una vez, desconéctate de internet y sigue funcionando. Aquí eso importa más que en la mayoría de las herramientas simplemente por el volumen: una pila de veinte tomas RAW es alrededor de un gigabyte, y subir un gigabyte de fotografías para que alguien les saque la media es justamente lo que esta herramienta existe para evitar.

### ¿Qué formatos RAW puede leer, y cómo?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL y algunos más, que es casi todo lo que escriben las cámaras. Lo que lee dentro de ellos es la vista previa JPEG a tamaño completo que reveló la propia cámara al disparar: la imagen de la pantalla trasera, y la que dibuja tu sistema operativo como miniatura. Se encuentra recorriendo la estructura de directorios del archivo, lo que cuesta unas pocas lecturas de unos pocos kilobytes cada una, y tomando después un solo trozo. **No es un revelado de los datos del sensor.** El resultado lleva el balance de blancos y el estilo de imagen de la cámara a ocho bits por canal, en vez de los doce o catorce bits de datos lineales de sensor que te daría un revelador RAW.

### ¿Y por qué no decodificar bien los datos del sensor?

Porque significaría incorporar LibRaw o dcraw: un segundo motor de decenas de megabytes, para una sola familia de formatos, y la mayor parte de él son esquemas de compresión propios de cada fabricante. Ese intercambio se discute en `docs/what-can-be-built-here.md`, en el código de este sitio, donde el RAW de cámara estaba en la lista de descartes desde antes de que esta herramienta existiera. Lo que ha cambiado no es la respuesta a esa pregunta, sino descubrir que apilar no lo necesita: las vistas previas están a resolución completa, son lo que la cámara te habría dado como JPEG de todas formas, y leerlas es unas cien veces más rápido que revelar. Si quieres los datos del sensor, revela las tomas antes en un revelador RAW y apila los TIFF o los JPEG que produzca; esta herramienta también los acepta.

### ¿Cuántas tomas admite, y de qué tamaño?

Seis de los siete métodos van en flujo: mantienen un acumulador y leen cada toma exactamente una vez, así que cien tomas cuestan la misma memoria que dos y lo único que crece es el tiempo. La mediana es la excepción, porque el valor central de un conjunto no se puede saber hasta tenerlo entero, así que sostiene todas las tomas a la vez: veinte tomas de 24 megapíxeles son alrededor de 1,4 GB, y eso no te lo da ningún navegador. Cuando pasa, la imagen se corta en bandas horizontales y se apila banda a banda, lo que cuesta releer las tomas para cada banda. La página calcula todo esto antes de que pulses el botón y te enseña el número, así que una pasada lenta no es nunca una sorpresa.

### ¿Qué hace exactamente alinear las tomas?

Encuentra cuánto se ha movido cada toma respecto a la toma de referencia y la devuelve a su sitio, con precisión de fracciones de píxel. El método es la correlación de fase: el desplazamiento entre dos imágenes aparece como una diferencia de fase entre sus espectros, así que una transformada de Fourier de cada una encuentra un desplazamiento de doscientos píxeles tan barato como uno de dos. El segundo ajuste recupera además la rotación y la escala, con el mismo truco aplicado al espectro en coordenadas log-polares. Todo ello es global — un desplazamiento, un ángulo, una escala para toda la toma —, así que corrige una cámara que se movió y no puede corregir un sujeto que se movió, ni una fotografía tomada un paso más a la izquierda. Una consecuencia visible: una toma desplazada veinte píxeles a la izquierda ya no llega al borde derecho, así que el resultado se recorta a la parte que cubren todas las tomas. Por eso una pila alineada sale ligeramente más pequeña que las tomas que entraron, y es la única alternativa a un borde oscuro hecho de las tomas que no estaban.

### ¿Qué método debería usar?

**Media** para el ruido, en un conjunto donde no se movió nada: reduce el ruido aleatorio aproximadamente en la raíz cuadrada del número de tomas. **Mediana** para quitar cosas que solo estaban parte del tiempo; el uso clásico es fotografiar una plaza concurrida una docena de veces y conseguirla vacía. **Recorte sigma** cuando quieres las dos cosas: aprende qué suele ser cada píxel y promedia solo los valores que concuerdan, así que tiene la inmunidad de la mediana ante un coche que pasa y la reducción de ruido de la media. **Aclarar** para estelas de estrellas, fuegos artificiales y pintura con luz. **Oscurecer** para quitar cualquier cosa brillante que se moviera. **Sumar** para simular una única exposición larga. **Apilado de enfoque** para una macro tomada a lo largo del anillo de enfoque.

### ¿Por qué mi resultado tiene ocho bits si mis archivos RAW tienen catorce?

Porque lo que se apila es la propia vista previa de la cámara, que es un JPEG. Conviene decir que apilar recupera parte de lo que eso cuesta: promediar dieciséis tomas de ocho bits da un resultado con gradaciones de verdad más finas que las que tenía cualquiera de ellas, porque el ruido que hacía que cada toma redondeara distinto es justo lo que permite que la media caiga entre los niveles. Aquí la aritmética se hace en coma flotante y se redondea una sola vez al final, así que nada de eso se tira por el camino. Sigue sin ser lo mismo que apilar datos lineales de sensor, y esta herramienta no finge lo contrario.

### ¿Puedo apilar tomas de distinto tamaño, o de cámaras distintas?

Sí, aunque suele ser un error y merece la pena comprobar que era lo que querías. El resultado tiene el tamaño de la toma más grande, y todas las demás se escalan para caber y se centran dentro. Mezclar cámaras mezcla también la interpretación del color, así que una media de las dos es una media de dos lecturas distintas de la misma luz. Donde de verdad ayuda es en un conjunto disparado a dos resoluciones, o en un archivo RAW y un JPEG de la misma toma.

### Dice que la pasada irá por bandas. ¿Qué significa?

Que la memoria de trabajo que necesita el método es más de la que la herramienta está dispuesta a reservar de una vez, así que la imagen se cortará en tiras horizontales y se apilará tira a tira. Sigue produciendo exactamente el mismo resultado; solo relee las tomas para cada tira, así que tarda más, y la página te dice cuántas decodificaciones serán. Bajar un escalón la resolución de trabajo divide la memoria entre cuatro, y eso casi siempre convierte una pasada por bandas en una sola pasada; la nota dice qué ajuste lo haría.

### ¿Por qué esta herramienta usa un Worker y ninguna de las otras?

Porque es la única cuyo trabajo se mide en minutos. Cualquier otra herramienta de aquí hace algo que tarda uno o dos segundos, y ahí sacar el trabajo del hilo principal sería ceremonia. Apilar veinte tomas grandes es aritmética sólida sobre cientos de megabytes, y en el hilo principal eso significa una página congelada: ninguna barra de progreso moviéndose, un botón de Cancelar que no responde y, al final, un navegador que ofrece matar la pestaña. El Worker es un segundo hilo dentro de este mismo navegador, ejecutando un archivo de esta misma carpeta, bajo esta misma política. No es un servidor y no es una función de red.

### ¿Es gratis y hace falta cuenta?

Es gratis, y no hay cuenta, ni registro, ni prueba, ni marca de agua. Tampoco hay límite de cuántas tomas apilas ni de cómo de grandes son, porque no hay ningún servidor pagándolo: el trabajo ocurre en tu propio equipo y el único techo es tu propia memoria. El sitio lleva publicidad, que es lo que lo paga; a los anuncios no se les da nada sobre tus fotografías.

## Cómo se comprueba la promesa de privacidad

- **Tus fotografías no tienen adónde ir.** La Content-Security-Policy nombra todas las direcciones que esta página puede contactar, y ninguna es nuestra. Aquí no hay ningún destino donde recoger tus archivos, ni código que los enviaría si lo hubiera: no hay `fetch`, ni `XMLHttpRequest`, ni `sendBeacon`, ni en `src/` ni en el worker.
- **Los archivos RAW se leen, no se suben, y apenas se leen.** Un archivo RAW de cámara ya contiene un JPEG a tamaño completo que la cámara reveló al disparar. Esta herramienta lo encuentra recorriendo unas cuantas entradas de directorio y pidiendo después un solo trozo, que en un archivo de 60 MB suele ser menos de cien kilobytes. La página te enseña esa cifra junto al tamaño de tus archivos mientras trabajas. Los datos del sensor no se leen nunca.
- **El trabajo ocurre en un Worker de este equipo, no en un servidor.** Es la única herramienta de aquí que usa uno, porque apilar son minutos de aritmética en vez de segundos, y una página congelada no puede enseñar el progreso ni dejarse cancelar. Un Worker es un segundo hilo dentro de este mismo navegador — mira `src/worker.js`. Se le entregan los archivos en sí, lo cual es gratis, porque un descriptor de archivo no son los bytes; y tiene exactamente la misma Content-Security-Policy que la página, es decir, ningún sitio adonde mandarlos.
- **No se informa a ninguna parte de nada sobre el conjunto.** Cuántas tomas has apilado, qué cámara las escribió, cuánto se había movido cada una, qué método has elegido y cuánto ha tardado se quedan en la memoria de esta página hasta que la cierras. En este repositorio no hay ningún evento de analítica que lleve nada de eso, y la única pregunta que hace este sitio después de una descarga manda un pulgar arriba o abajo y el nombre de la herramienta, nada más.
- **Funciona sin conexión.** Desconéctate de la red y la herramienta no cambia, porque nunca hubo un paso de red dentro. El worker y cada módulo que carga los guarda el service worker de esta misma página, así que una copia instalada apila archivos RAW con el cable desenchufado.

**Compruébalo tú.** Nada de lo anterior hay que aceptarlo por fe. Esta página se genera a partir de las plantillas y la configuración del repositorio, con un script de compilación que puedes leer y ejecutar por tu cuenta, y el resultado se publica en la rama `dist`. Así puedes comparar lo que se sirve con lo que sale de compilar las fuentes: https://github.com/A-Box-of-Tools/website

Los archivos por los que conviene empezar son `config/site.toml`, donde está la Content-Security-Policy, `src/raw.js` para cómo se abre un archivo RAW leyendo kilobytes en vez de megabytes, `src/stack.js` para la aritmética de cada método y `src/plan.js` para de dónde salen las cifras de memoria y de decodificación que aparecen en la página: son las respuestas de ese archivo, no estimaciones.
